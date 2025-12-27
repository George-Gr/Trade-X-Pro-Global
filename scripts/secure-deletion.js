#!/usr/bin/env node

/**
 * Secure File Deletion Utility
 * Provides secure deletion methods for sensitive data
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {  exec  } from 'child_process';
import {  promisify  } from 'util';

const execAsync = promisify(exec);

class SecureDeletion {
    constructor(options = {}) {
        this.options = {
            method: options.method || 'standard', // 'standard', 'nist', 'random', 'custom'
            passes: options.passes || 3,
            verifyDeletion: options.verifyDeletion !== false,
            preservePermissions: options.preservePermissions !== false,
            backupMetadata: options.backupMetadata !== false,
            ...options
        };
        
        this.methods = {
            standard: this.standardOverwrite.bind(this),
            nist: this.nistOverwrite.bind(this),
            random: this.randomOverwrite.bind(this),
            custom: this.customOverwrite.bind(this)
        };
        
        this.deletionLog = [];
    }

    async secureDelete(filePaths, options = {}) {
        const config = { ...this.options, ...options };
        console.log(`🗑️  Starting secure deletion of ${filePaths.length} files...`);
        console.log(`Method: ${config.method}, Passes: ${config.passes}`);
        
        const results = {
            successful: [],
            failed: [],
            protected: [],
            totalDeleted: 0,
            totalSize: 0,
            errors: []
        };
        
        for (const filePath of filePaths) {
            try {
                // Check if file exists and get stats
                const stats = await fs.stat(filePath);
                const originalMode = stats.mode;
                
                // Backup metadata if requested
                if (config.backupMetadata) {
                    await this.backupFileMetadata(filePath, stats);
                }
                
                // Perform secure deletion
                const deleted = await this.deleteFileSecurely(filePath, config);
                
                if (deleted) {
                    results.successful.push({
                        path: filePath,
                        size: stats.size,
                        method: config.method,
                        timestamp: new Date().toISOString()
                    });
                    results.totalDeleted++;
                    results.totalSize += stats.size;
                }
                
            } catch (error) {
                results.errors.push({
                    path: filePath,
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                results.failed.push(filePath);
                console.error(`❌ Failed to delete ${filePath}: ${error.message}`);
            }
        }
        
        // Generate deletion report
        await this.generateDeletionReport(results, config);
        
        console.log(`✅ Secure deletion completed: ${results.totalDeleted} files deleted`);
        return results;
    }

    async deleteFileSecurely(filePath, config) {
        const method = this.methods[config.method];
        if (!method) {
            throw new Error(`Unknown deletion method: ${config.method}`);
        }
        
        // Check if file is protected
        if (this.isProtectedFile(filePath)) {
            throw new Error('File is protected from deletion');
        }
        
        // Perform the deletion method
        await method(filePath, config);
        
        // Verify deletion if requested
        if (config.verifyDeletion) {
            await this.verifyFileDeleted(filePath);
        }
        
        this.logDeletion(filePath, config);
        return true;
    }

    async standardOverwrite(filePath, config) {
        const stats = await fs.stat(filePath);
        const fd = await fs.open(filePath, 'r+');
        
        try {
            // Overwrite with zeros, then ones, then random data
            const patterns = [Buffer.alloc(1, 0), Buffer.alloc(1, 1)];
            if (config.passes > 2) {
                patterns.push(Buffer.alloc(1, 0xAA));
            }
            if (config.passes > 3) {
                patterns.push(Buffer.alloc(1, 0x55));
            }
            
            for (let pass = 0; pass < Math.min(config.passes, patterns.length); pass++) {
                await this.overwriteWithPatternWithFD(fd, stats.size, patterns[pass]);
                await fs.fsync(fd); // Ensure data is written to disk
            }
            
            // Additional random passes if requested
            for (let pass = patterns.length; pass < config.passes; pass++) {
                await this.overwriteWithRandomWithFD(fd, stats.size);
                await fs.fsync(fd);
            }
            
        } catch (error) {
            throw error;
        } finally {
            if (fd && typeof fd.close === 'function') {
                await fd.close();
            }
        }
        
        // Finally delete the file
        await fs.unlink(filePath);
    }

    async nistOverwrite(filePath, config) {
        // NIST 800-88 Clear method
        const stats = await fs.stat(filePath);
        const fd = await fs.open(filePath, 'r+');
        
        try {
            // Pass 1: All zeros
            await this.overwriteWithPatternWithFD(fd, stats.size, Buffer.alloc(1, 0));
            await fs.fsync(fd);
            
            // Pass 2: All ones
            await this.overwriteWithPatternWithFD(fd, stats.size, Buffer.alloc(1, 1));
            await fs.fsync(fd);
            
            // Pass 3: Random data (if passes > 2)
            if (config.passes > 2) {
                await this.overwriteWithRandomWithFD(fd, stats.size);
                await fs.fsync(fd);
            }
            
        } catch (error) {
            throw error;
        } finally {
            if (fd && typeof fd.close === 'function') {
                await fd.close();
            }
        }
        
        // Delete the file
        await fs.unlink(filePath);
    }

    async randomOverwrite(filePath, config) {
        const stats = await fs.stat(filePath);
        const fd = await fs.open(filePath, 'r+');
        
        try {
            for (let pass = 0; pass < config.passes; pass++) {
                await this.overwriteWithRandomWithFD(fd, stats.size);
                await fs.fsync(fd);
            }
            
        } catch (error) {
            throw error;
        } finally {
            if (fd && typeof fd.close === 'function') {
                await fd.close();
            }
        }
        
        await fs.unlink(filePath);
    }

    async customOverwrite(filePath, config) {
        const stats = await fs.stat(filePath);
        const fd = await fs.open(filePath, 'r+');
        
        try {
            // Custom pattern based on file type
            const pattern = this.getCustomPattern(filePath, stats);
            
            for (let pass = 0; pass < config.passes; pass++) {
                await this.overwriteWithPatternWithFD(fd, stats.size, pattern);
                await fs.fsync(fd);
            }
            
        } catch (error) {
            throw error;
        } finally {
            if (fd && typeof fd.close === 'function') {
                await fd.close();
            }
        }
        
        await fs.unlink(filePath);
    }

    getCustomPattern(filePath, stats) {
        const ext = path.extname(filePath).toLowerCase();
        
        // Different patterns for different file types
        switch (ext) {
            case '.json':
                return Buffer.from('{"deleted":true}', 'utf8');
            case '.js':
            case '.ts':
                return Buffer.from('// DELETED BY SECURE DELETION UTILITY\n', 'utf8');
            case '.css':
                return Buffer.from('/* DELETED BY SECURE DELETION UTILITY */\n', 'utf8');
            case '.html':
                return Buffer.from('<!-- DELETED BY SECURE DELETION UTILITY -->\n', 'utf8');
            case '.md':
                return Buffer.from('# DELETED BY SECURE DELETION UTILITY\n', 'utf8');
            default:
                return Buffer.alloc(1, crypto.randomInt(0, 256));
        }
    }

    async overwriteWithPatternWithFD(fd, fileSize, pattern) {
        const buffer = Buffer.alloc(4096);
        buffer.fill(pattern);
        
        for (let offset = 0; offset < fileSize; offset += buffer.length) {
            const writeSize = Math.min(buffer.length, fileSize - offset);
            await fs.write(fd, buffer, 0, writeSize, offset);
        }
    }

    async overwriteWithRandomWithFD(fd, fileSize) {
        const buffer = Buffer.alloc(4096);
        
        for (let offset = 0; offset < fileSize; offset += buffer.length) {
            crypto.randomFillSync(buffer);
            const writeSize = Math.min(buffer.length, fileSize - offset);
            await fs.write(fd, buffer, 0, writeSize, offset);
        }
    }

    async overwriteWithPattern(filePath, fileSize, pattern) {
        const buffer = Buffer.alloc(4096);
        buffer.fill(pattern);
        
        for (let offset = 0; offset < fileSize; offset += buffer.length) {
            const writeSize = Math.min(buffer.length, fileSize - offset);
            await fs.writeFile(filePath, buffer.subarray(0, writeSize));
        }
    }

    async overwriteWithRandom(filePath, fileSize) {
        const buffer = Buffer.alloc(4096);
        
        for (let offset = 0; offset < fileSize; offset += buffer.length) {
            crypto.randomFillSync(buffer);
            const writeSize = Math.min(buffer.length, fileSize - offset);
            await fs.writeFile(filePath, buffer.subarray(0, writeSize));
        }
    }

    async verifyFileDeleted(filePath) {
        try {
            await fs.stat(filePath);
            throw new Error('File still exists after deletion');
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    async backupFileMetadata(filePath, stats) {
        const metadata = {
            originalPath: filePath,
            size: stats.size,
            mode: stats.mode,
            uid: stats.uid,
            gid: stats.gid,
            atime: stats.atime,
            mtime: stats.mtime,
            birthtime: stats.birthtime,
            deletedAt: new Date().toISOString()
        };
        
        const backupPath = `${filePath}.metadata.json`;
        await fs.writeFile(backupPath, JSON.stringify(metadata, null, 2));
        
        // Remove metadata file after a delay (async)
        setTimeout(async () => {
            try {
                await fs.unlink(backupPath);
            } catch (error) {
                console.warn(`⚠️  Could not remove metadata backup: ${backupPath}`);
            }
        }, 5000);
    }

    isProtectedFile(filePath) {
        // List of patterns for protected files
        const protectedPatterns = [
            /package\.json$/,
            /package-lock\.json$/,
            /yarn\.lock$/,
            /pnpm-lock\.yaml$/,
            /tsconfig.*\.json$/,
            /vite\.config\.(js|ts)$/,
            /webpack\.config\.(js|ts)$/,
            /next\.config\.(js|ts)$/,
            /tailwind\.config\.(js|ts)$/,
            /postcss\.config\.js$/,
            /eslint\.(config|rc)\.(js|json|yaml)$/,
            /prettier\.(config|rc)\.(js|json|yaml)$/,
            /\.env(\..*)?$/,
            /\.gitignore$/,
            /README\.(md|txt|rst)$/,
            /LICENSE\.(txt|md)$/,
            /^src\/.*\.(tsx?|jsx?)$/,
            /^src\/.*\.css$/,
            /^public\/.*$/,
            /^assets\/.*$/
        ];
        
        return protectedPatterns.some(pattern => pattern.test(filePath));
    }

    logDeletion(filePath, config) {
        this.deletionLog.push({
            file: filePath,
            method: config.method,
            passes: config.passes,
            timestamp: new Date().toISOString(),
            verified: config.verifyDeletion
        });
    }

    async generateDeletionReport(results, config) {
        const report = {
            timestamp: new Date().toISOString(),
            configuration: {
                method: config.method,
                passes: config.passes,
                verifyDeletion: config.verifyDeletion,
                preservePermissions: config.preservePermissions,
                backupMetadata: config.backupMetadata
            },
            summary: {
                totalFiles: results.totalDeleted + results.failed.length,
                successful: results.totalDeleted,
                failed: results.failed.length,
                totalSizeDeleted: results.totalSize,
                totalSizeFormatted: this.formatBytes(results.totalSize)
            },
            successfulDeletions: results.successful,
            failedDeletions: results.failed,
            errors: results.errors,
            deletionLog: this.deletionLog,
            recommendations: this.generateDeletionRecommendations(results, config)
        };
        
        const reportPath = path.join(process.cwd(), 'SECURE_DELETION_REPORT.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Generate readable report
        await this.generateReadableDeletionReport(report);
        
        console.log(`📄 Deletion report saved to: ${reportPath}`);
    }

    async generateReadableDeletionReport(report) {
        let markdown = `# Secure Deletion Report\n\n`;
        markdown += `**Generated:** ${report.timestamp}\n`;
        markdown += `**Method:** ${report.configuration.method}\n`;
        markdown += `**Passes:** ${report.configuration.passes}\n`;
        markdown += `**Verification:** ${report.configuration.verifyDeletion ? 'Enabled' : 'Disabled'}\n\n`;

        markdown += `## Summary\n\n`;
        markdown += `- **Total Files:** ${report.summary.totalFiles}\n`;
        markdown += `- **Successfully Deleted:** ${report.summary.successful}\n`;
        markdown += `- **Failed Deletions:** ${report.summary.failed}\n`;
        markdown += `- **Total Space Freed:** ${report.summary.totalSizeFormatted}\n\n`;

        if (report.successfulDeletions.length > 0) {
            markdown += `## Successfully Deleted Files\n\n`;
            for (const deletion of report.successfulDeletions) {
                markdown += `- \`${deletion.path}\` (${this.formatBytes(deletion.size)})\n`;
            }
            markdown += `\n`;
        }

        if (report.failedDeletions.length > 0) {
            markdown += `## Failed Deletions\n\n`;
            for (const failed of report.failedDeletions) {
                markdown += `- \`${failed}\`\n`;
            }
            markdown += `\n`;
        }

        if (report.errors.length > 0) {
            markdown += `## Errors\n\n`;
            for (const error of report.errors) {
                markdown += `- \`${error.path}\`: ${error.error}\n`;
            }
            markdown += `\n`;
        }

        if (report.recommendations.length > 0) {
            markdown += `## Recommendations\n\n`;
            for (const rec of report.recommendations) {
                markdown += `### ${rec.type}\n`;
                markdown += `**Priority:** ${rec.priority}\n`;
                markdown += `**Description:** ${rec.description}\n\n`;
            }
        }

        const readablePath = path.join(process.cwd(), 'SECURE_DELETION_READABLE.md');
        await fs.writeFile(readablePath, markdown);
        console.log(`📄 Readable deletion report saved to: ${readablePath}`);
    }

    generateDeletionRecommendations(results, config) {
        const recommendations = [];

        if (results.failed.length > 0) {
            recommendations.push({
                type: 'Failed Deletions',
                priority: 'medium',
                description: `${results.failed.length} files could not be deleted`,
                action: 'Manually review and delete failed files'
            });
        }

        if (config.method === 'standard' && config.passes < 3) {
            recommendations.push({
                type: 'Security Enhancement',
                priority: 'low',
                description: 'Consider using NIST method or more passes for sensitive data',
                action: 'Upgrade to NIST method for better security'
            });
        }

        if (results.totalSize > 100 * 1024 * 1024) {
            recommendations.push({
                type: 'Disk Space Recovery',
                priority: 'low',
                description: `Recovered ${this.formatBytes(results.totalSize)} of disk space`,
                action: 'Verify disk space has been freed'
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

export default SecureDeletion;