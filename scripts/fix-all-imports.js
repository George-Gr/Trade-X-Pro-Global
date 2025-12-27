#!/usr/bin/env node

/**
 * Comprehensive Import Fixer
 * Fixes all remaining import syntax issues in audit scripts
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scriptsToFix = [
    'advanced-duplicate-detector.js',
    'file-integrity-checker.js',
    'secure-deletion.js',
    'comprehensive-file-audit.js'
];

const fixes = [
    // Fix fs import
    { from: /import fs from 'fs'\.promises;/g, to: "import fs from 'fs/promises';" },
    { from: /import fs from 'fs';/g, to: "import fs from 'fs/promises';" },
    
    // Fix crypto import
    { from: /import crypto from 'crypto';/g, to: "import crypto from 'crypto';" },
    
    // Fix zlib import
    { from: /import zlib from 'zlib';/g, to: "import zlib from 'zlib';" },
    
    // Fix child_process imports
    { from: /import { exec } from 'child_process';/g, to: "import { exec } from 'child_process';" },
    { from: /import { promisify } from 'util';/g, to: "import { promisify } from 'util';" },
    
    // Fix require.main === module
    { from: /if \(require\.main === module\) \{/g, to: "if (import.meta.url === `file://${process.argv[1]}`) {" },
    
    // Fix module.exports
    { from: /module\.exports = /g, to: "export default " },
    { from: /module\.exports\.(\w+) = /g, to: "export const $1 = " },
];

async function fixScript(scriptName) {
    const scriptPath = path.join(__dirname, scriptName);
    
    try {
        let content = await fs.readFile(scriptPath, 'utf8');
        let modified = false;
        
        // Apply all fixes
        for (const fix of fixes) {
            const newContent = content.replace(fix.from, fix.to);
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        }
        
        if (modified) {
            await fs.writeFile(scriptPath, content);
            console.log(`✅ Fixed ${scriptName}`);
        } else {
            console.log(`ℹ️  No changes needed for ${scriptName}`);
        }
        
    } catch (error) {
        console.error(`❌ Failed to fix ${scriptName}:`, error.message);
    }
}

async function fixAll() {
    console.log('🔧 Fixing all import syntax issues...');
    
    for (const script of scriptsToFix) {
        await fixScript(script);
    }
    
    console.log('✅ All import syntax issues fixed!');
}

fixAll().catch(console.error);