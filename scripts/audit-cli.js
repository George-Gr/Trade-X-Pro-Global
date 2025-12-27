#!/usr/bin/env node

/**
 * File System Audit CLI Wrapper
 * User-friendly interface for the comprehensive file system audit tool
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FileSystemAudit from './file-system-audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class AuditCLI {
    constructor() {
        this.config = {
            conservative: {
                name: 'Conservative Cleanup',
                description: 'Only remove obviously temporary and cache files',
                options: {
                    logRetentionDays: 7,
                    protectSystemFiles: true,
                    excludePatterns: new Set([
                        '.git', 'node_modules', 'dist', 'build', '.next',
                        '.vscode', '.idea', '.DS_Store', 'Thumbs.db',
                        'src', 'public', 'assets', 'components', 'pages',
                        'hooks', 'lib', 'utils', 'types', 'services',
                        'api', 'middleware', 'validators', 'schemas',
                        'models', 'controllers', 'routes', 'tests',
                        '__tests__', 'e2e', 'coverage', 'docs'
                    ])
                }
            },
            moderate: {
                name: 'Moderate Cleanup',
                description: 'Remove temp files, backups, and old logs',
                options: {
                    logRetentionDays: 14,
                    protectSystemFiles: true,
                    excludePatterns: new Set([
                        '.git', 'node_modules', 'dist', 'build', '.next',
                        '.vscode', '.idea', '.DS_Store', 'Thumbs.db',
                        'src', 'public', 'assets', 'components', 'pages',
                        'hooks', 'lib', 'utils', 'types', 'services',
                        'api', 'middleware', 'validators', 'schemas',
                        'models', 'controllers', 'routes'
                    ])
                }
            },
            aggressive: {
                name: 'Aggressive Cleanup',
                description: 'Remove all non-critical temporary files and duplicates',
                options: {
                    logRetentionDays: 3,
                    protectSystemFiles: true,
                    excludePatterns: new Set([
                        '.git', 'node_modules', 'dist', 'build', '.next',
                        '.vscode', '.idea', '.DS_Store', 'Thumbs.db',
                        'src', 'public', 'assets', 'components', 'pages',
                        'hooks', 'lib', 'utils', 'types', 'services',
                        'api', 'middleware', 'validators', 'schemas',
                        'models', 'controllers', 'routes', 'tests',
                        '__tests__', 'e2e', 'coverage'
                    ])
                }
            },
            custom: {
                name: 'Custom Cleanup',
                description: 'User-defined cleanup parameters',
                options: {}
            }
        };
    }

    async run() {
        console.log(`
🧹 File System Audit and Cleanup Tool
======================================

This tool will help you identify and safely remove unnecessary files
from your Trade-X-Pro-Global project while protecting critical files.

⚠️  WARNING: This tool will permanently delete files. Always review
   the preview before running cleanup operations.
        `);

        try {
            // Get configuration
            const config = await this.getUserConfiguration();
            
            // Run audit with selected configuration
            await this.runAudit(config);
            
        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }

    async getUserConfiguration() {
        console.log('\n📋 Cleanup Configuration Options:\n');
        
        for (const [key, config] of Object.entries(this.config)) {
            console.log(`${key.padEnd(12)} - ${config.name}`);
            console.log(`             ${config.description}\n`);
        }

        const choice = await this.promptUser(
            'Select cleanup level (conservative/moderate/aggressive/custom): ',
            ['conservative', 'moderate', 'aggressive', 'custom']
        );

        let config = { ...this.config[choice] };

        if (choice === 'custom') {
            config = await this.getCustomConfiguration();
        }

        // Additional options
        console.log('\n🔧 Additional Options:\n');
        
        const preview = await this.promptYesNo('Run in preview mode? (recommended)', true);
        const dryRun = preview ? true : await this.promptYesNo('Perform dry run before actual cleanup?', true);
        const logRetention = parseInt(await this.promptUser(
            `Log retention days (default: ${config.options.logRetentionDays || 30}): `,
            null,
            config.options.logRetentionDays?.toString() || '30'
        ));

        return {
            ...config.options,
            preview,
            dryRun,
            logRetentionDays: logRetention,
            rootPath: process.cwd()
        };
    }

    async getCustomConfiguration() {
        console.log('\n⚙️  Custom Configuration:\n');
        
        const logRetention = parseInt(await this.promptUser(
            'Log retention days (default: 30): ',
            null,
            '30'
        ));

        const protectSystemFiles = await this.promptYesNo(
            'Protect system and critical files? (recommended)', true
        );

        return {
            logRetentionDays: logRetention,
            protectSystemFiles,
            excludePatterns: new Set([
                '.git', 'node_modules', 'dist', 'build', '.next',
                '.vscode', '.idea', '.DS_Store', 'Thumbs.db'
            ])
        };
    }

    async runAudit(options) {
        console.log('\n🚀 Starting File System Audit...\n');
        
        const audit = new FileSystemAudit(options);
        const report = await audit.audit();

        // Display summary
        this.displaySummary(report);

        // Show recommendations
        this.displayRecommendations(report);

        // Ask for cleanup confirmation if not in preview/dry-run mode
        if (!options.preview && !options.dryRun) {
            const confirmed = await this.promptYesNo(
                '\n🤔 Proceed with cleanup? This action cannot be undone!',
                false
            );

            if (confirmed) {
                console.log('\n🧹 Starting cleanup operations...\n');
                await audit.performCleanup();
                console.log('\n✅ Cleanup completed successfully!');
            } else {
                console.log('\n⏹️  Cleanup cancelled by user.');
            }
        } else if (options.preview) {
            console.log('\n👁️  Preview mode - no files were deleted.');
            console.log('   Run without --preview flag to perform actual cleanup.');
        } else if (options.dryRun) {
            console.log('\n🔄 Dry run completed - no files were deleted.');
            console.log('   Review the report and run without --dry-run to perform actual cleanup.');
        }
    }

    displaySummary(report) {
        console.log('\n📊 AUDIT SUMMARY');
        console.log('=' .repeat(50));
        console.log(`Total Files Scanned: ${report.summary.totalFiles}`);
        console.log(`Total Size: ${report.summary.totalSize}`);
        console.log(`Protected Files: ${report.summary.protectedFiles}`);
        console.log(`Potential Savings: ${this.calculatePotentialSavings(report)}`);
        
        console.log('\n📁 FILES BY CATEGORY:');
        console.log('─'.repeat(30));
        
        for (const [category, data] of Object.entries(report.categories)) {
            if (data.count > 0) {
                const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                console.log(`${categoryName.padEnd(20)} ${data.count.toString().padStart(4)} files (${data.totalSize})`);
            }
        }

        if (report.duplicateGroups.length > 0) {
            console.log('\n🔍 DUPLICATE FILES:');
            console.log('─'.repeat(30));
            console.log(`${report.duplicateGroups.length} duplicate groups found`);
            const totalDuplicates = report.duplicateGroups.reduce((sum, group) => sum + (group.count - 1), 0);
            console.log(`${totalDuplicates} duplicate files can be removed`);
        }
    }

    displayRecommendations(report) {
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('=' .repeat(50));

        if (report.recommendations.length === 0) {
            console.log('No cleanup recommendations at this time.');
            return;
        }

        for (const rec of report.recommendations) {
            const priority = this.getPriorityIcon(rec.priority);
            console.log(`\n${priority} ${rec.type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}`);
            console.log(`   ${rec.description}`);
            
            if (rec.files && rec.files.length > 0) {
                console.log('   Files to process:');
                rec.files.slice(0, 5).forEach(file => {
                    console.log(`   • ${file.path} (${file.size})`);
                });
                if (rec.files.length > 5) {
                    console.log(`   • ... and ${rec.files.length - 5} more files`);
                }
            }
        }
    }

    calculatePotentialSavings(report) {
        let savings = 0;
        for (const [category, data] of Object.entries(report.categories)) {
            if (['tempFiles', 'backupFiles', 'duplicateFiles', 'logFiles'].includes(category)) {
                savings += data.totalSizeBytes || 0;
            }
        }
        return this.formatBytes(savings);
    }

    getPriorityIcon(priority) {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async promptUser(question, validOptions = null, defaultValue = null) {
        return new Promise((resolve) => {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            let prompt = question;
            if (defaultValue) {
                prompt += `[${defaultValue}] `;
            }

            rl.question(prompt, (answer) => {
                const finalAnswer = answer.trim() || defaultValue;
                
                if (validOptions && !validOptions.includes(finalAnswer.toLowerCase())) {
                    console.log(`Please enter one of: ${validOptions.join(', ')}`);
                    rl.close();
                    resolve(this.promptUser(question, validOptions, defaultValue));
                } else {
                    rl.close();
                    resolve(finalAnswer);
                }
            });
        });
    }

    async promptYesNo(question, defaultValue = false) {
        const defaultText = defaultValue ? 'Y/n' : 'y/N';
        const answer = await this.promptUser(`${question} (${defaultText}): `, ['y', 'n', 'yes', 'no']);
        return ['y', 'yes'].includes(answer.toLowerCase());
    }
}

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
    const cli = new AuditCLI();
    cli.run();
}

export default AuditCLI;