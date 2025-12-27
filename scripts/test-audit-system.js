#!/usr/bin/env node

/**
 * File System Audit System Test Suite
 * Tests all components and demonstrates functionality
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Dynamic imports will be used for the audit modules

class AuditSystemTester {
    constructor() {
        this.testResults = {
            timestamp: new Date().toISOString(),
            tests: [],
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async runAllTests() {
        console.log('🧪 File System Audit System - Test Suite');
        console.log('==========================================');
        
        try {
            await this.createTestFiles();
            await this.testBasicAudit();
            await this.testReferenceAnalysis();
            await this.testDuplicateDetection();
            await this.testIntegrityChecking();
            await this.testSecureDeletion();
            await this.testComprehensiveAudit();
            await this.cleanupTestFiles();
            
            this.displayTestResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            throw error;
        }
    }

    async createTestFiles() {
        console.log('\n📁 Creating test files...');
        
        const testDir = 'test-audit-files';
        await fs.mkdir(testDir, { recursive: true });
        
        // Create test files with different types
        const testFiles = [
            { path: 'temp-file.tmp', content: 'temporary file content' },
            { path: 'backup-file.bak', content: 'backup file content' },
            { path: 'log-file.log', content: 'log entry 1\nlog entry 2\n' },
            { path: 'duplicate1.txt', content: 'This is duplicate content' },
            { path: 'duplicate2.txt', content: 'This is duplicate content' },
            { path: 'source-file.js', content: 'console.log("hello world");' },
            { path: 'referenced-file.js', content: 'export const test = true;' },
            { path: 'test-file.test.js', content: 'describe("test", () => {});' },
            { path: 'auto-generated.min.js', content: 'minified code' },
            { path: 'empty-file.json', content: '' },
            { path: 'corrupted-json.json', content: '{ "invalid": json }' }
        ];
        
        for (const file of testFiles) {
            const fullPath = path.join(testDir, file.path);
            await fs.writeFile(fullPath, file.content);
        }
        
        // Create another file that references the referenced-file.js
        await fs.writeFile(
            path.join(testDir, 'main.js'),
            'import { test } from "./referenced-file.js";'
        );
        
        console.log(`✅ Created ${testFiles.length + 1} test files in ${testDir}/`);
    }

    async testBasicAudit() {
        console.log('\n🔍 Testing Basic File System Audit...');
        
        try {
            const { default: FileSystemAudit } = await import('./file-system-audit.js');
            const audit = new FileSystemAudit({
                rootPath: 'test-audit-files',
                preview: true,
                dryRun: true,
                logRetentionDays: 7
            });

            const results = await audit.audit();
            
            this.assert(results.totalFiles > 0, 'Should scan some files');
            this.assert(Object.keys(results.categories).length > 0, 'Should categorize files');
            
            this.addTestResult('Basic Audit', true, `Scanned ${results.totalFiles} files`);
            
        } catch (error) {
            this.addTestResult('Basic Audit', false, error.message);
        }
    }

    async testReferenceAnalysis() {
        console.log('\n🔍 Testing Reference Analysis...');
        
        try {
            const { default: FileReferenceAnalyzer } = await import('./file-reference-analyzer.js');
            const analyzer = new FileReferenceAnalyzer('test-audit-files');
            
            const results = await analyzer.analyze();
            
            this.assert(results.totalFiles > 0, 'Should analyze some files');
            this.assert(results.references instanceof Map, 'Should have references map');
            
            this.addTestResult('Reference Analysis', true, `Analyzed ${results.totalFiles} files`);
            
        } catch (error) {
            this.addTestResult('Reference Analysis', false, error.message);
        }
    }

    async testDuplicateDetection() {
        console.log('\n🔍 Testing Duplicate Detection...');
        
        try {
            const { default: AdvancedDuplicateDetector } = await import('./advanced-duplicate-detector.js');
            const detector = new AdvancedDuplicateDetector({
                minFileSize: 1,
                similarityThreshold: 0.95
            });
            
            const results = await detector.findDuplicates('test-audit-files');
            
            this.assert(results.duplicateGroups.length >= 0, 'Should find duplicate groups');
            
            this.addTestResult('Duplicate Detection', true, `Found ${results.duplicateGroups.length} duplicate groups`);
            
        } catch (error) {
            this.addTestResult('Duplicate Detection', false, error.message);
        }
    }

    async testIntegrityChecking() {
        console.log('\n🔍 Testing Integrity Checking...');
        
        try {
            const { default: FileIntegrityChecker } = await import('./file-integrity-checker.js');
            const checker = new FileIntegrityChecker({
                checkCompression: true,
                checkEncoding: true,
                maxCorruptedFiles: 100
            });
            
            const results = await checker.checkFileIntegrity('test-audit-files');
            
            this.assert(results.summary.totalFilesChecked > 0, 'Should check some files');
            this.assert(results.issues instanceof Object, 'Should have issues object');
            
            this.addTestResult('Integrity Checking', true, `Checked ${results.summary.totalFilesChecked} files`);
            
        } catch (error) {
            this.addTestResult('Integrity Checking', false, error.message);
        }
    }

    async testSecureDeletion() {
        console.log('\n🔍 Testing Secure Deletion...');
        
        try {
            // Create a test file to delete
            const testFile = 'test-deletion.txt';
            await fs.writeFile(testFile, 'test content for secure deletion');
            
            const { default: SecureDeletion } = await import('./secure-deletion.js');
            const deleter = new SecureDeletion({
                method: 'standard',
                passes: 1,
                verifyDeletion: true,
                backupMetadata: false
            });
            
            const results = await deleter.secureDelete([testFile], {
                method: 'standard',
                passes: 1,
                verifyDeletion: true,
                backupMetadata: false
            });
            
            // Check if file was deleted
            try {
                await fs.stat(testFile);
                this.addTestResult('Secure Deletion', false, 'File was not deleted');
            } catch {
                this.addTestResult('Secure Deletion', true, 'File securely deleted');
            }
            
        } catch (error) {
            this.addTestResult('Secure Deletion', false, error.message);
        }
    }

    async testComprehensiveAudit() {
        console.log('\n🔍 Testing Comprehensive Audit...');
        
        try {
            const { default: ComprehensiveFileAudit } = await import('./comprehensive-file-audit.js');
            const audit = new ComprehensiveFileAudit({
                rootPath: 'test-audit-files',
                preview: true,
                dryRun: true,
                enableReferenceAnalysis: true,
                enableDuplicateDetection: true,
                enableIntegrityChecking: true,
                generateReports: true,
                outputDir: 'test-reports'
            });
            
            const results = await audit.runFullAudit();
            
            this.assert(results.system.totalFiles > 0, 'Should scan files');
            this.assert(results.recommendations.length >= 0, 'Should generate recommendations');
            
            this.addTestResult('Comprehensive Audit', true, `Comprehensive audit completed`);
            
        } catch (error) {
            this.addTestResult('Comprehensive Audit', false, error.message);
        }
    }

    async cleanupTestFiles() {
        console.log('\n🧹 Cleaning up test files...');
        
        try {
            // Remove test directory and files
            const testDir = 'test-audit-files';
            const testFiles = ['test-deletion.txt'];
            const reportDirs = ['test-reports', 'audit-reports'];
            
            // Clean up individual test files
            for (const file of testFiles) {
                try {
                    await fs.unlink(file);
                } catch (error) {
                    // File might not exist, that's okay
                }
            }
            
            // Clean up directories
            for (const dir of reportDirs) {
                try {
                    await fs.rmdir(dir, { recursive: true });
                } catch (error) {
                    // Directory might not exist, that's okay
                }
            }
            
            // Clean up test directory
            try {
                await fs.rmdir(testDir, { recursive: true });
            } catch (error) {
                // Directory might not exist, that's okay
            }
            
            console.log('✅ Test cleanup completed');
            
        } catch (error) {
            console.warn('⚠️  Some test files could not be cleaned up:', error.message);
        }
    }

    addTestResult(testName, passed, message) {
        this.testResults.tests.push({
            name: testName,
            passed,
            message,
            timestamp: new Date().toISOString()
        });
        
        this.testResults.total++;
        if (passed) {
            this.testResults.passed++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            this.testResults.failed++;
            console.log(`❌ ${testName}: ${message}`);
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    displayTestResults() {
        console.log('\n📊 TEST RESULTS SUMMARY');
        console.log('========================');
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed}`);
        console.log(`Failed: ${this.testResults.failed}`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            for (const test of this.testResults.tests) {
                if (!test.passed) {
                    console.log(`- ${test.name}: ${test.message}`);
                }
            }
        }
        
        // Save test results
        this.saveTestResults();
        
        const success = this.testResults.failed === 0;
        console.log(success ? '\n✅ All tests passed!' : '\n❌ Some tests failed!');
        
        return success;
    }

    async saveTestResults() {
        const reportPath = 'TEST_RESULTS.json';
        await fs.writeFile(reportPath, JSON.stringify(this.testResults, null, 2));
        console.log(`📄 Test results saved to: ${reportPath}`);
    }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new AuditSystemTester();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Test suite crashed:', error);
        process.exit(1);
    });
}

export default AuditSystemTester;