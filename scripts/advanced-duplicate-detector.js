#!/usr/bin/env node

/**
 * Advanced Duplicate File Detector
 * Enhanced duplicate detection with content similarity analysis
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

class AdvancedDuplicateDetector {
    constructor(options = {}) {
        this.options = {
            minFileSize: options.minFileSize || 1024, // Skip files smaller than 1KB
            similarityThreshold: options.similarityThreshold || 0.95, // 95% similarity
            maxFileSizeForHashing: options.maxFileSizeForHashing || 50 * 1024 * 1024, // 50MB
            ...options
        };
        
        this.fileGroups = new Map();
        this.similarityCache = new Map();
    }

    async findDuplicates(rootPath) {
        console.log('🔍 Starting advanced duplicate detection...');
        
        await this.scanFiles(rootPath);
        await this.groupByHash();
        await this.verifyContentSimilarityGroups();
        await this.analyzeGroupSizes();
        
        return this.generateDuplicateReport();
    }

    async scanFiles(rootPath) {
        const scanDirectory = async (dirPath, relativePath = '') => {
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    const relativeFilePath = path.join(relativePath, entry.name);
                    
                    if (entry.isDirectory()) {
                        await scanDirectory(fullPath, relativeFilePath);
                    } else if (entry.isFile()) {
                        try {
                            const stats = await fs.stat(fullPath);
                            if (stats.size >= this.options.minFileSize) {
                                await this.processFile(fullPath, relativeFilePath, stats);
                            }
                        } catch (error) {
                            console.warn(`⚠️  Could not process ${relativeFilePath}: ${error.message}`);
                        }
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Could not scan directory ${dirPath}: ${error.message}`);
            }
        };
        
        await scanDirectory(rootPath);
    }

    async processFile(fullPath, relativePath, stats) {
        const fileInfo = {
            path: relativePath,
            fullPath,
            size: stats.size,
            modified: stats.mtime,
            hash: null,
            contentSignature: null
        };

        // Calculate hash for exact duplicates
        if (stats.size <= this.options.maxFileSizeForHashing) {
            fileInfo.hash = await this.calculateFileHash(fullPath);
        } else {
            // For large files, use content signature (first/last chunks)
            fileInfo.contentSignature = await this.calculateContentSignature(fullPath);
        }

        const groupKey = fileInfo.hash || fileInfo.contentSignature;
        
        if (!this.fileGroups.has(groupKey)) {
            this.fileGroups.set(groupKey, []);
        }
        this.fileGroups.get(groupKey).push(fileInfo);
    }

    async calculateFileHash(filePath) {
        try {
            const data = await fs.readFile(filePath);
            return crypto.createHash('sha256').update(data).digest('hex');
        } catch (error) {
            return null;
        }
    }

    async calculateContentSignature(filePath) {
        try {
            const stats = await fs.stat(filePath);
            const fd = await fs.open(filePath, 'r');
            const bufferSize = Math.min(4096, stats.size);
            const buffer = Buffer.alloc(bufferSize);
            
            // Read first chunk
            await fs.read(fd, buffer, 0, bufferSize, 0);
            const firstChunk = buffer.toString('hex');
            
            // Read last chunk
            const lastOffset = Math.max(0, stats.size - bufferSize);
            await fs.read(fd, buffer, 0, bufferSize, lastOffset);
            const lastChunk = buffer.toString('hex');
            
            await fs.close(fd);
            
            return `${firstChunk}:${lastChunk}:${stats.size}`;
        } catch (error) {
            return null;
        }
    }

    async groupByHash() {
        console.log('📊 Grouping files by content similarity...');
        
        for (const [hash, files] of this.fileGroups) {
            if (files.length > 1 && hash) {
                // For content signatures, we need to verify actual similarity
                if (hash.includes(':')) {
                    // These will be verified in verifyContentSimilarityGroups
                    continue;
                }
            }
        }
    }

    async verifyContentSimilarityGroups() {
        console.log('🔍 Verifying content similarity for content signature groups...');
        
        for (const [hash, files] of this.fileGroups) {
            if (files.length > 1 && hash.includes(':')) {
                const similarFiles = await this.verifyContentSimilarity(files);
                if (similarFiles.length < 2) {
                    this.fileGroups.delete(hash);
                } else {
                    this.fileGroups.set(hash, similarFiles);
                }
            }
        }
    }

    async verifyContentSimilarity(files) {
        if (files.length <= 1) return files;
        
        const similarFiles = [files[0]]; // Keep first file
        
        for (let i = 1; i < files.length; i++) {
            const similarity = await this.calculateSimilarity(files[0], files[i]);
            if (similarity >= this.options.similarityThreshold) {
                similarFiles.push(files[i]);
            }
        }
        
        return similarFiles;
    }

    async calculateSimilarity(file1, file2) {
        const cacheKey = `${file1.path}::${file2.path}`;
        if (this.similarityCache.has(cacheKey)) {
            return this.similarityCache.get(cacheKey);
        }
        
        try {
            // For smaller files, do full comparison
            const maxCompareSize = 1024 * 1024; // 1MB
            if (file1.size <= maxCompareSize && file2.size <= maxCompareSize) {
                const content1 = await fs.readFile(file1.fullPath);
                const content2 = await fs.readFile(file2.fullPath);
                
                const similarity = this.calculateByteSimilarity(content1, content2);
                this.similarityCache.set(cacheKey, similarity);
                return similarity;
            } else {
                // For larger files, compare samples
                const sample1 = await this.getFileSample(file1.fullPath);
                const sample2 = await this.getFileSample(file2.fullPath);
                
                const similarity = this.calculateByteSimilarity(sample1, sample2);
                this.similarityCache.set(cacheKey, similarity);
                return similarity;
            }
        } catch (error) {
            console.warn(`⚠️  Could not compare ${file1.path} and ${file2.path}: ${error.message}`);
            return 0;
        }
    }

    async getFileSample(filePath) {
        const stats = await fs.stat(filePath);
        const sampleSize = Math.min(1024 * 100, stats.size); // 100KB sample or file size
        const fd = await fs.open(filePath, 'r');
        const buffer = Buffer.alloc(sampleSize);
        
        // Get samples from beginning, middle, and end
        const positions = [0, Math.floor(stats.size / 2) - sampleSize / 2, stats.size - sampleSize];
        const samples = [];
        
        for (const pos of positions) {
            if (pos >= 0 && pos < stats.size) {
                await fs.read(fd, buffer, 0, Math.min(sampleSize, stats.size - pos), pos);
                samples.push(buffer.subarray(0, Math.min(sampleSize, stats.size - pos)));
            }
        }
        
        await fs.close(fd);
        return Buffer.concat(samples);
    }

    calculateByteSimilarity(buffer1, buffer2) {
        const minLength = Math.min(buffer1.length, buffer2.length);
        if (minLength === 0) return 0;
        
        let matches = 0;
        for (let i = 0; i < minLength; i++) {
            if (buffer1[i] === buffer2[i]) {
                matches++;
            }
        }
        
        return matches / minLength;
    }

    async analyzeGroupSizes() {
        console.log('📏 Analyzing duplicate group sizes...');
        
        // Sort files within each group by modification date (keep newest)
        for (const [_, files] of this.fileGroups) {
            files.sort((a, b) => b.modified - a.modified);
        }
    }

    generateDuplicateReport() {
        const report = {
            totalDuplicates: 0,
            duplicateGroups: [],
            savings: {
                count: 0,
                size: 0
            },
            largestGroups: [],
            recommendations: []
        };

        for (const [hash, files] of this.fileGroups) {
            if (files.length > 1) {
                const group = {
                    id: hash.substring(0, 16),
                    fileCount: files.length,
                    totalSize: files.reduce((sum, file) => sum + file.size, 0),
                    averageSize: files.reduce((sum, file) => sum + file.size, 0) / files.length,
                    files: files.map(file => ({
                        path: file.path,
                        size: file.size,
                        modified: file.modified.toISOString(),
                        keep: file === files[0] // Keep the first (newest) file
                    })),
                    duplicates: files.slice(1).map(file => ({
                        path: file.path,
                        size: file.size,
                        modified: file.modified.toISOString()
                    }))
                };
                
                report.duplicateGroups.push(group);
                report.totalDuplicates += files.length - 1;
                report.savings.count += files.length - 1;
                report.savings.size += group.duplicates.reduce((sum, file) => sum + file.size, 0);
            }
        }

        // Sort groups by potential savings
        report.duplicateGroups.sort((a, b) => b.duplicates.reduce((sum, file) => sum + file.size, 0) - 
                                    a.duplicates.reduce((sum, file) => sum + file.size, 0));

        report.largestGroups = report.duplicateGroups.slice(0, 10);

        // Generate recommendations
        report.recommendations = this.generateRecommendations(report);

        return report;
    }

    generateRecommendations(report) {
        const recommendations = [];

        if (report.duplicateGroups.length > 0) {
            recommendations.push({
                type: 'exactDuplicates',
                priority: 'high',
                description: `Found ${report.duplicateGroups.length} groups of duplicate files`,
                potentialSavings: `${this.formatBytes(report.savings.size)} (${report.savings.count} files)`,
                action: 'Remove duplicate files, keeping the newest version of each group',
                largestGroups: report.largestGroups.slice(0, 5)
            });

            // Check for specific patterns
            const imageDuplicates = report.duplicateGroups.filter(group => 
                group.files.some(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.path))
            );

            if (imageDuplicates.length > 0) {
                recommendations.push({
                    type: 'imageDuplicates',
                    priority: 'medium',
                    description: `Found ${imageDuplicates.length} groups of duplicate image files`,
                    action: 'Optimize images or use a single version across the application',
                    groups: imageDuplicates.slice(0, 3)
                });
            }

            const configDuplicates = report.duplicateGroups.filter(group =>
                group.files.some(file => /\.(json|config|conf)$/i.test(file.path))
            );

            if (configDuplicates.length > 0) {
                recommendations.push({
                    type: 'configDuplicates',
                    priority: 'high',
                    description: `Found ${configDuplicates.length} groups of duplicate configuration files`,
                    action: 'Merge configuration files or use environment-specific configs',
                    groups: configDuplicates.slice(0, 3)
                });
            }
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

export default AdvancedDuplicateDetector;