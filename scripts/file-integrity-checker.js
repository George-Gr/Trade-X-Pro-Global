#!/usr/bin/env node

/**
 * File Integrity Checker
 * Detects corrupted, incomplete, and problematic files
 */

import fs from 'fs/promises';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';

class FileIntegrityChecker {
    constructor(options = {}) {
        this.options = {
            checkCompression: options.checkCompression !== false,
            checkEncoding: options.checkEncoding !== false,
            maxCorruptedFiles: options.maxCorruptedFiles || 1000,
            ...options
        };

        this.results = {
            corrupted: [],
            incomplete: [],
            encoding: [],
            permission: [],
            size: [],
            totalChecked: 0,
            totalIssues: 0
        };

        this.fileTypeHandlers = {
            '.json': this.checkJSONFile.bind(this),
            '.js': this.checkJSFile.bind(this),
            '.ts': this.checkTSFile.bind(this),
            '.tsx': this.checkTSXFile.bind(this),
            '.jsx': this.checkJSXFile.bind(this),
            '.css': this.checkCSSFile.bind(this),
            '.html': this.checkHTMLFile.bind(this),
            '.xml': this.checkXMLFile.bind(this),
            '.svg': this.checkSVGFile.bind(this),
            '.png': this.checkImageFile.bind(this),
            '.jpg': this.checkImageFile.bind(this),
            '.jpeg': this.checkImageFile.bind(this),
            '.gif': this.checkImageFile.bind(this),
            '.webp': this.checkImageFile.bind(this),
            '.zip': this.checkZipFile.bind(this),
            '.gz': this.checkGzipFile.bind(this)
        };
    }

    async checkFileIntegrity(rootPath) {
        console.log('🔍 Checking file integrity...');
        
        await this.scanAndCheck(rootPath);
        return this.generateIntegrityReport();
    }

    async scanAndCheck(rootPath) {
        const checkDirectory = async (dirPath, relativePath = '') => {
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    const relativeFilePath = path.join(relativePath, entry.name);
                    
                    if (entry.isDirectory()) {
                        await checkDirectory(fullPath, relativeFilePath);
                    } else if (entry.isFile()) {
                        await this.checkFile(fullPath, relativeFilePath);
                        
                        if (this.results.totalIssues > this.options.maxCorruptedFiles) {
                            console.log(`⚠️  Stopping check after finding ${this.options.maxCorruptedFiles} issues`);
                            return;
                        }
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Could not scan directory ${dirPath}: ${error.message}`);
            }
        };
        
        await checkDirectory(rootPath);
    }

    async checkFile(fullPath, relativePath) {
        this.results.totalChecked++;
        
        try {
            const stats = await fs.stat(fullPath);
            
            // Check file permissions
            await this.checkPermissions(fullPath, relativePath, stats);
            
            // Check file size anomalies
            await this.checkFileSize(fullPath, relativePath, stats);
            
            // Check content based on file type
            const ext = path.extname(fullPath).toLowerCase();
            const handler = this.fileTypeHandlers[ext];
            
            if (handler) {
                await handler(fullPath, relativePath, stats);
            } else {
                // Generic content check for unknown types
                await this.checkGenericContent(fullPath, relativePath, stats);
            }
            
        } catch (error) {
            this.addIssue('corrupted', relativePath, {
                error: error.message,
                type: 'access_error'
            });
        }
    }

    async checkPermissions(fullPath, relativePath, stats) {
        // Check for problematic permissions
        const isWorldWritable = (stats.mode & 0o002) !== 0;
        const isWorldReadable = (stats.mode & 0o004) === 0;
        
        if (isWorldWritable) {
            this.addIssue('permission', relativePath, {
                issue: 'world_writable',
                description: 'File is world-writable (security risk)',
                mode: stats.mode.toString(8)
            });
        }
        
        if (!isWorldReadable) {
            this.addIssue('permission', relativePath, {
                issue: 'not_readable',
                description: 'File is not readable',
                mode: stats.mode.toString(8)
            });
        }
    }

    async checkFileSize(fullPath, relativePath, stats) {
        const size = stats.size;
        
        // Check for suspiciously small files
        if (size === 0) {
            this.addIssue('size', relativePath, {
                issue: 'empty_file',
                description: 'File is empty (0 bytes)'
            });
        }
        
        // Check for suspiciously large files
        if (size > 100 * 1024 * 1024) { // 100MB
            this.addIssue('size', relativePath, {
                issue: 'very_large',
                description: `File is very large (${this.formatBytes(size)})`,
                size
            });
        }
        
        // Check for files with unusual size patterns (potential corruption)
        if (size > 0 && size < 1024 && !relativePath.includes('/test') && !relativePath.includes('/spec')) {
            const content = await fs.readFile(fullPath);
            if (content.length !== size) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'size_mismatch',
                    description: 'File size does not match content length',
                    expected: size,
                    actual: content.length
                });
            }
        }
    }

    async checkJSONFile(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            JSON.parse(content);
        } catch (error) {
            this.addIssue('corrupted', relativePath, {
                issue: 'invalid_json',
                description: 'Invalid JSON syntax',
                error: error.message
            });
        }
    }

    async checkJSFile(fullPath, relativePath, stats) {
        await this.checkSyntax(fullPath, relativePath, 'javascript');
    }

    async checkTSFile(fullPath, relativePath, stats) {
        await this.checkSyntax(fullPath, relativePath, 'typescript');
    }

    async checkTSXFile(fullPath, relativePath, stats) {
        await this.checkSyntax(fullPath, relativePath, 'typescript');
    }

    async checkJSXFile(fullPath, relativePath, stats) {
        await this.checkSyntax(fullPath, relativePath, 'javascript');
    }

    async checkSyntax(fullPath, relativePath, language) {
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            // Basic syntax checks
            const issues = this.performBasicSyntaxCheck(content, language);
            
            for (const issue of issues) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'syntax_error',
                    description: issue.message,
                    line: issue.line,
                    column: issue.column
                });
            }
            
        } catch (error) {
            this.addIssue('encoding', relativePath, {
                issue: 'encoding_error',
                description: 'Cannot read file as UTF-8',
                error: error.message
            });
        }
    }

    performBasicSyntaxCheck(content, language) {
        const issues = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            
            // Check for unclosed brackets/braces
            const openBrackets = (line.match(/[\{\[\(]/g) || []).length;
            const closeBrackets = (line.match(/[\}\]\)]/g) || []).length;
            
            if (openBrackets !== closeBrackets) {
                issues.push({
                    message: `Mismatched brackets on line ${lineNumber}`,
                    line: lineNumber
                });
            }
            
            // Check for common syntax errors
            if (line.includes('function(') && !line.includes('function (') && language === 'javascript') {
                issues.push({
                    message: `Missing space after 'function' keyword on line ${lineNumber}`,
                    line: lineNumber
                });
            }
            
            // Check for unclosed strings
            const singleQuotes = (line.match(/'/g) || []).length;
            const doubleQuotes = (line.match(/"/g) || []).length;
            const backticks = (line.match(/`/g) || []).length;
            
            if (singleQuotes % 2 !== 0) {
                issues.push({
                    message: `Unclosed single quote on line ${lineNumber}`,
                    line: lineNumber
                });
            }
            
            if (doubleQuotes % 2 !== 0) {
                issues.push({
                    message: `Unclosed double quote on line ${lineNumber}`,
                    line: lineNumber
                });
            }
            
            if (backticks % 2 !== 0) {
                issues.push({
                    message: `Unclosed backtick on line ${lineNumber}`,
                    line: lineNumber
                });
            }
        }
        
        return issues;
    }

    async checkCSSFile(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            // Basic CSS syntax checks
            const issues = this.performBasicCSSCheck(content);
            
            for (const issue of issues) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'css_syntax_error',
                    description: issue.message,
                    line: issue.line
                });
            }
            
        } catch (error) {
            this.addIssue('encoding', relativePath, {
                issue: 'encoding_error',
                description: 'Cannot read CSS file as UTF-8',
                error: error.message
            });
        }
    }

    performBasicCSSCheck(content) {
        const issues = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            
            // Check for unclosed braces
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            
            if (openBraces !== closeBraces) {
                issues.push({
                    message: `Mismatched braces on line ${lineNumber}`,
                    line: lineNumber
                });
            }
            
            // Check for missing semicolons (basic check)
            if (line.includes(':') && !line.includes(';') && !line.includes('{') && !line.includes('}')) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('/*') && !trimmed.endsWith('*/')) {
                    issues.push({
                        message: `Missing semicolon on line ${lineNumber}`,
                        line: lineNumber
                    });
                }
            }
        }
        
        return issues;
    }

    async checkHTMLFile(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            // Basic HTML structure checks
            const issues = this.performBasicHTMLCheck(content);
            
            for (const issue of issues) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'html_structure_error',
                    description: issue.message,
                    line: issue.line
                });
            }
            
        } catch (error) {
            this.addIssue('encoding', relativePath, {
                issue: 'encoding_error',
                description: 'Cannot read HTML file as UTF-8',
                error: error.message
            });
        }
    }

    performBasicHTMLCheck(content) {
        const issues = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            
            // Check for unclosed tags (basic check)
            const openTags = line.match(/<[^/][^>]*>/g) || [];
            const closeTags = line.match(/<\/[^>]+>/g) || [];
            
            // Check for basic tag mismatches
            const tagMatches = line.match(/<(\w+)[^>]*>/g);
            if (tagMatches) {
                for (const tagMatch of tagMatches) {
                    const tagName = tagMatch.match(/<(\w+)/)[1];
                    const isSelfClosing = tagMatch.includes('/>');
                    
                    if (!isSelfClosing && !['img', 'br', 'hr', 'input', 'meta', 'link'].includes(tagName)) {
                        // Basic check for potential unclosed tags
                        if (!line.includes(`</${tagName}>`)) {
                            issues.push({
                                message: `Potential unclosed tag: ${tagName} on line ${lineNumber}`,
                                line: lineNumber
                            });
                        }
                    }
                }
            }
        }
        
        return issues;
    }

    async checkXMLFile(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            // Basic XML validation - check for common XML issues
            const xmlIssues = this.performBasicXMLCheck(content);
            
            for (const issue of xmlIssues) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'xml_syntax_error',
                    description: issue.message,
                    line: issue.line
                });
            }
            
        } catch (error) {
            this.addIssue('encoding', relativePath, {
                issue: 'encoding_error',
                description: 'Cannot read XML file as UTF-8',
                error: error.message
            });
        }
    }

    performBasicXMLCheck(content) {
        const issues = [];
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineNumber = i + 1;
            
            // Check for unclosed tags (basic check)
            const openTags = line.match(/<[^/][^>]*>/g) || [];
            const closeTags = line.match(/<\/[^>]+>/g) || [];
            
            // Basic XML structure validation
            if (i === 0 && !content.trim().startsWith('<?xml')) {
                issues.push({
                    message: 'XML file should start with <?xml declaration',
                    line: 1
                });
            }
        }
        
        return issues;
    }

    async checkSVGFile(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath, 'utf8');
            
            // Check for basic SVG structure
            if (!content.includes('<svg')) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'invalid_svg',
                    description: 'SVG file does not contain <svg> root element'
                });
            }
            
            // Check for unclosed tags
            const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
            const closeTags = (content.match(/<\/[^>]+>/g) || []).length;
            
            if (openTags !== closeTags) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'unclosed_svg_tags',
                    description: 'SVG has mismatched opening/closing tags'
                });
            }
            
        } catch (error) {
            this.addIssue('encoding', relativePath, {
                issue: 'encoding_error',
                description: 'Cannot read SVG file as UTF-8',
                error: error.message
            });
        }
    }

    async checkImageFile(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath);
            const ext = path.extname(fullPath).toLowerCase();
            
            // Basic image format validation
            if (ext === '.png') {
                if (!content.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
                    this.addIssue('corrupted', relativePath, {
                        issue: 'invalid_png_header',
                        description: 'PNG file has invalid header'
                    });
                }
            } else if (ext === '.jpg' || ext === '.jpeg') {
                if (!content.slice(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]))) {
                    this.addIssue('corrupted', relativePath, {
                        issue: 'invalid_jpeg_header',
                        description: 'JPEG file has invalid header'
                    });
                }
            } else if (ext === '.gif') {
                if (!content.slice(0, 6).toString('ascii').startsWith('GIF8')) {
                    this.addIssue('corrupted', relativePath, {
                        issue: 'invalid_gif_header',
                        description: 'GIF file has invalid header'
                    });
                }
            }
            
        } catch (error) {
            this.addIssue('corrupted', relativePath, {
                issue: 'image_read_error',
                description: 'Cannot read image file',
                error: error.message
            });
        }
    }

    async checkZipFile(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath);
            
            // Check ZIP file signature
            if (!content.slice(0, 4).equals(Buffer.from([0x50, 0x4B, 0x03, 0x04]))) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'invalid_zip_header',
                    description: 'ZIP file has invalid header'
                });
            }
            
        } catch (error) {
            this.addIssue('corrupted', relativePath, {
                issue: 'zip_read_error',
                description: 'Cannot read ZIP file',
                error: error.message
            });
        }
    }

    async checkGzipFile(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath);
            
            // Check GZIP magic number
            if (!content.slice(0, 2).equals(Buffer.from([0x1F, 0x8B]))) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'invalid_gzip_header',
                    description: 'GZIP file has invalid header'
                });
            }
            
        } catch (error) {
            this.addIssue('corrupted', relativePath, {
                issue: 'gzip_read_error',
                description: 'Cannot read GZIP file',
                error: error.message
            });
        }
    }

    async checkGenericContent(fullPath, relativePath, stats) {
        try {
            const content = await fs.readFile(fullPath);
            
            // Check for null bytes (potential corruption)
            if (content.includes(0)) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'null_bytes',
                    description: 'File contains null bytes (possible corruption)'
                });
            }
            
            // Check for unusual character sequences
            const invalidChars = content.toString('utf8').match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g);
            if (invalidChars && invalidChars.length > 10) {
                this.addIssue('corrupted', relativePath, {
                    issue: 'invalid_characters',
                    description: `File contains ${invalidChars.length} invalid characters`
                });
            }
            
        } catch (error) {
            this.addIssue('encoding', relativePath, {
                issue: 'read_error',
                description: 'Cannot read file',
                error: error.message
            });
        }
    }

    addIssue(category, filePath, details) {
        const issue = {
            path: filePath,
            ...details
        };
        
        this.results[category].push(issue);
        this.results.totalIssues++;
    }

    generateIntegrityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFilesChecked: this.results.totalChecked,
                totalIssues: this.results.totalIssues,
                corruptedFiles: this.results.corrupted.length,
                incompleteFiles: this.results.incomplete.length,
                encodingIssues: this.results.encoding.length,
                permissionIssues: this.results.permission.length,
                sizeIssues: this.results.size.length
            },
            issues: {
                corrupted: this.results.corrupted,
                incomplete: this.results.incomplete,
                encoding: this.results.encoding,
                permission: this.results.permission,
                size: this.results.size
            },
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.results.corrupted.length > 0) {
            recommendations.push({
                type: 'corruptedFiles',
                priority: 'critical',
                description: `Found ${this.results.corrupted.length} corrupted files that should be removed or restored`,
                action: 'Remove corrupted files and restore from backup or repository',
                files: this.results.corrupted.slice(0, 10)
            });
        }
        
        if (this.results.permission.length > 0) {
            recommendations.push({
                type: 'permissionIssues',
                priority: 'medium',
                description: `Found ${this.results.permission.length} files with permission issues`,
                action: 'Fix file permissions to improve security',
                files: this.results.permission.slice(0, 10)
            });
        }
        
        if (this.results.size.length > 0) {
            recommendations.push({
                type: 'sizeIssues',
                priority: 'low',
                description: `Found ${this.results.size.length} files with unusual sizes`,
                action: 'Review files with unusual sizes',
                files: this.results.size.slice(0, 10)
            });
        }
        
        return recommendations;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

export default FileIntegrityChecker;