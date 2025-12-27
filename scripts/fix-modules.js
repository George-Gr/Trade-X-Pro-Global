#!/usr/bin/env node

/**
 * Module Converter for ES Modules
 * Converts CommonJS scripts to ES module syntax
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scriptsToConvert = [
    'file-reference-analyzer.js',
    'advanced-duplicate-detector.js', 
    'file-integrity-checker.js',
    'secure-deletion.js',
    'comprehensive-file-audit.js',
    'test-audit-system.js'
];

async function convertScript(scriptName) {
    const scriptPath = path.join(__dirname, scriptName);
    
    try {
        let content = await fs.readFile(scriptPath, 'utf8');
        
        // Convert require statements
        content = content.replace(/const (\w+) = require\(['"`]([^'"`]+)['"`]\)/g, 
            'import $1 from \'$2\'');
            
        content = content.replace(/const (\w+) = require\(['"`]([^'"`]+)['"`]\)/g,
            'import $1 from \'$2\'');
            
        content = content.replace(/const {([^}]+)} = require\(['"`]([^'"`]+)['"`]\)/g,
            'import { $1 } from \'$2\'');
            
        content = content.replace(/const (\w+) = require\(['"`]([^'"`]+)['"`]\)/g,
            'import $1 from \'$2\'');
            
        // Convert module.exports
        content = content.replace(/module\.exports = /g, 'export default ');
        content = content.replace(/module\.exports\.(\w+) = /g, 'export const $1 = ');
        
        // Convert require.main === module
        content = content.replace(/if \(require\.main === module\) \{/g, 
            'if (import.meta.url === `file://${process.argv[1]}`) {');
            
        // Add imports for path and fs if needed
        if (content.includes('path.') && !content.includes('import path')) {
            content = content.replace(/import.*from.*\\n/, 
                'import fs from \'fs/promises\';\nimport path from \'path\';\nimport { fileURLToPath } from \'url\';\nimport { dirname } from \'path\';\n\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = dirname(__filename);\n\n');
        }
        
        await fs.writeFile(scriptPath, content);
        console.log(`✅ Converted ${scriptName}`);
        
    } catch (error) {
        console.error(`❌ Failed to convert ${scriptName}:`, error.message);
    }
}

async function convertAll() {
    console.log('🔧 Converting scripts to ES modules...');
    
    for (const script of scriptsToConvert) {
        await convertScript(script);
    }
    
    console.log('✅ All scripts converted to ES modules!');
}

convertAll().catch(console.error);