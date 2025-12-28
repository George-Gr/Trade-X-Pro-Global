#!/usr/bin/env node

/**
 * Sanitize depcheck results by replacing absolute paths with relative paths
 * This prevents leaking local directory structures and usernames in committed files
 */

import fs from 'fs';
import path from 'path';

// Get the project root directory (where package.json is located)
function getProjectRoot() {
  let currentDir = process.cwd();
  
  while (currentDir !== '/') {
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      return currentDir;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
  
  return process.cwd(); // Fallback to current directory
}

// Sanitize file paths in the depcheck results
function sanitizeDepcheckResults(inputPath, outputPath) {
  try {
    // Read the original file
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const data = JSON.parse(rawData);
    
    const projectRoot = getProjectRoot();
    console.log(`Project root detected: ${projectRoot}`);
    
    // Function to convert absolute paths to relative paths
    const convertToRelativePath = (filePath) => {
      if (typeof filePath === 'string' && filePath.startsWith(projectRoot)) {
        const relativePath = filePath.substring(projectRoot.length);
        // Ensure it starts with ./ for relative paths
        return relativePath.startsWith('/') ? '.' + relativePath : './' + relativePath;
      }
      return filePath;
    };
    
    // Convert string values in the entire data structure
    function sanitizeData(obj) {
      if (typeof obj === 'string') {
        return convertToRelativePath(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeData);
      } else if (obj !== null && typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeData(value);
        }
        return sanitized;
      }
      return obj;
    }
    
    const sanitizedData = sanitizeData(data);
    
    // Write the sanitized data
    fs.writeFileSync(outputPath, JSON.stringify(sanitizedData, null, 2), 'utf8');
    
    console.log(`✅ Successfully sanitized depcheck results`);
    console.log(`📁 Input: ${inputPath}`);
    console.log(`📁 Output: ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error sanitizing depcheck results:', error.message);
    return false;
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: node scripts/sanitize-depcheck-results.js <input-file> [output-file]');
  console.log('Example: node scripts/sanitize-depcheck-results.js audit-reports/depcheck-results.json');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile; // Default to overwrite input file

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Input file not found: ${inputFile}`);
  process.exit(1);
}

const success = sanitizeDepcheckResults(inputFile, outputFile);
process.exit(success ? 0 : 1);