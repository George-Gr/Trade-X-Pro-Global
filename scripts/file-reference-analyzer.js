#!/usr/bin/env node

/**
 * File Reference Analyzer
 * Advanced analysis of file references and dependencies
 */

import fs from 'fs/promises';
import path from 'path';

class FileReferenceAnalyzer {
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.fileContents = new Map();
        this.references = new Map();
        this.importPatterns = [
            /import\s+.*?from\s+['"]([^'"]+)['"]/g,
            /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
            /from\s+['"]([^'"]+)['"]/g,
            /href\s*=\s*['"]([^'"]+)['"]/g,
            /src\s*=\s*['"]([^'"]+)['"]/g,
            /url\(['"]([^'"]+)['"]\)/g,
            /@import\s+['"]([^'"]+)['"]/g,
            /<link[^>]*href\s*=\s*['"]([^'"]+)['"]/g,
            /<script[^>]*src\s*=\s*['"]([^'"]+)['"]/g,
            /<img[^>]*src\s*=\s*['"]([^'"]+)['"]/g
        ];
    }

    async analyze() {
        console.log('🔍 Analyzing file references and dependencies...');
        
        await this.scanFiles();
        await this.extractReferences();
        await this.findOrphanedFiles();
        
        return {
            references: this.references,
            orphanedFiles: Array.from(this.orphanedFiles || []),
            totalFiles: this.fileContents.size,
            totalReferences: Array.from(this.references.values()).reduce((sum, refs) => sum + refs.length, 0)
        };
    }

    async scanFiles() {
        const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.json'];
        
        const scanDirectory = async (dirPath, relativePath = '') => {
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    const relativeFilePath = path.join(relativePath, entry.name);
                    
                    if (entry.isDirectory()) {
                        await scanDirectory(fullPath, relativeFilePath);
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name).toLowerCase();
                        if (extensions.includes(ext)) {
                            try {
                                const content = await fs.readFile(fullPath, 'utf8');
                                this.fileContents.set(relativeFilePath, content);
                            } catch (error) {
                                console.warn(`⚠️  Could not read ${relativeFilePath}: ${error.message}`);
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Could not scan directory ${dirPath}: ${error.message}`);
            }
        };
        
        await scanDirectory(this.rootPath);
    }

    async extractReferences() {
        for (const [filePath, content] of this.fileContents) {
            const references = [];
            
            for (const pattern of this.importPatterns) {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    const referencedFile = match[1];
                    if (this.isLocalReference(referencedFile)) {
                        references.push(this.normalizePath(referencedFile, filePath));
                    }
                }
            }
            
            this.references.set(filePath, references);
        }
    }

    isLocalReference(ref) {
        // Check if reference is local (not external URL or module)
        return ref.startsWith('./') || 
               ref.startsWith('../') || 
               (!ref.startsWith('http') && 
                !ref.startsWith('https') && 
                !ref.startsWith('data:') && 
                !ref.startsWith('//') &&
                !ref.startsWith('node_modules'));
    }

    normalizePath(reference, currentFile) {
        const currentDir = path.dirname(currentFile);
        return path.normalize(path.join(currentDir, reference));
    }

    async findOrphanedFiles() {
        this.orphanedFiles = new Set();
        
        // Find files that are not referenced by any other file
        for (const [filePath] of this.fileContents) {
            let isReferenced = false;
            
            for (const [_, references] of this.references) {
                if (references.some(ref => ref === filePath || ref.endsWith('/' + path.basename(filePath)))) {
                    isReferenced = true;
                    break;
                }
            }
            
            if (!isReferenced && !this.isLikelyEntryPoint(filePath)) {
                this.orphanedFiles.add(filePath);
            }
        }
    }

    isLikelyEntryPoint(filePath) {
        const entryPointPatterns = [
            /^src\/(index|main|App)\.(js|jsx|ts|tsx)$/,
            /^src\/pages\/(index|Home)\.(js|jsx|ts|tsx)$/,
            /^public\/index\.html$/,
            /^package\.json$/,
            /^vite\.config\.(js|ts)$/,
            /^webpack\.config\.(js|ts)$/,
            /^tsconfig\.json$/,
            /^jsconfig\.json$/
        ];
        
        return entryPointPatterns.some(pattern => pattern.test(filePath));
    }

    generateReport() {
        const report = {
            summary: {
                totalFiles: this.fileContents.size,
                orphanedFiles: this.orphanedFiles.size,
                totalReferences: Array.from(this.references.values()).reduce((sum, refs) => sum + refs.length, 0)
            },
            orphanedFiles: Array.from(this.orphanedFiles),
            referenceStats: this.getReferenceStats(),
            recommendations: this.generateRecommendations()
        };
        
        return report;
    }

    getReferenceStats() {
        const stats = {
            mostReferenced: [],
            filesWithNoReferences: [],
            filesReferencingNothing: []
        };
        
        const referenceCounts = new Map();
        
        // Count how many times each file is referenced
        for (const [_, references] of this.references) {
            for (const ref of references) {
                referenceCounts.set(ref, (referenceCounts.get(ref) || 0) + 1);
            }
        }
        
        // Find most referenced files
        stats.mostReferenced = Array.from(referenceCounts.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([file, count]) => ({ file, count }));
        
        // Find files with no references
        for (const [filePath, references] of this.references) {
            if (references.length === 0) {
                stats.filesWithNoReferences.push(filePath);
            }
        }
        
        // Find files that don't reference anything (likely utilities)
        for (const [filePath, references] of this.references) {
            if (references.length === 0 && this.isLikelyUtility(filePath)) {
                stats.filesReferencingNothing.push(filePath);
            }
        }
        
        return stats;
    }

    isLikelyUtility(filePath) {
        const utilityPatterns = [
            /^src\/(utils|helpers|lib|constants)\//,
            /^src\/hooks\//,
            /^src\/types\//,
            /^src\/interfaces\//,
            /\.util\.(js|ts)$/,
            /\.helper\.(js|ts)$/,
            /\.constant\.(js|ts)$/
        ];
        
        return utilityPatterns.some(pattern => pattern.test(filePath));
    }

    generateRecommendations() {
        const recommendations = [];
        
        if (this.orphanedFiles.size > 0) {
            recommendations.push({
                type: 'orphanedFiles',
                priority: 'medium',
                description: `Found ${this.orphanedFiles.size} files that may not be referenced anywhere`,
                action: 'Review orphaned files for potential removal',
                files: Array.from(this.orphanedFiles).slice(0, 10)
            });
        }
        
        const unreferenced = Array.from(this.references.entries())
            .filter(([_, refs]) => refs.length === 0)
            .map(([file, _]) => file)
            .filter(file => !this.isLikelyEntryPoint(file) && !this.isLikelyUtility(file));
            
        if (unreferenced.length > 0) {
            recommendations.push({
                type: 'unreferencedFiles',
                priority: 'low',
                description: `Found ${unreferenced.length} files that don't reference other files and may be dead code`,
                action: 'Review for dead code elimination',
                files: unreferenced.slice(0, 10)
            });
        }
        
        return recommendations;
    }
}

export default FileReferenceAnalyzer;