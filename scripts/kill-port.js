#!/usr/bin/env node

const { execSync } = require('child_process');
const os = require('os');

console.log('=== Killing processes on port 8080 ===');

function killPort(port) {
    try {
        console.log(`Checking for processes on port ${port}...`);
        
        // Check platform
        const platform = os.platform();
        
        let command;
        if (platform === 'darwin' || platform === 'linux') {
            // macOS/Linux
            command = `lsof -ti:${port}`;
        } else if (platform === 'win32') {
            // Windows
            command = `netstat -ano | findstr :${port} | findstr LISTENING`;
        } else {
            console.log('Unsupported platform');
            return;
        }
        
        let pids;
        try {
            pids = execSync(command, { encoding: 'utf8' }).trim();
        } catch (error) {
            console.log(`No processes found on port ${port}`);
            return;
        }
        
        if (!pids) {
            console.log(`No processes found on port ${port}`);
            return;
        }
        
        const pidList = pids.split('\n').filter(pid => pid.trim());
        
        console.log(`Found ${pidList.length} process(es) on port ${port}: ${pidList.join(', ')}`);
        
        // Kill each process
        pidList.forEach(pid => {
            try {
                console.log(`Killing process ${pid}...`);
                
                if (platform === 'darwin' || platform === 'linux') {
                    execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
                } else if (platform === 'win32') {
                    execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
                }
                
                console.log(`✓ Successfully killed process ${pid}`);
            } catch (error) {
                console.log(`✗ Failed to kill process ${pid}: ${error.message}`);
            }
        });
        
        // Verify
        setTimeout(() => {
            try {
                const remaining = execSync(command, { encoding: 'utf8' }).trim();
                if (!remaining) {
                    console.log(`✓ Port ${port} is now free!`);
                } else {
                    console.log(`✗ Port ${port} is still in use by: ${remaining}`);
                }
            } catch (error) {
                console.log(`✓ Port ${port} appears to be free (verification command failed)`);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Kill port 8080
killPort(8080);

// Also kill common development ports
console.log('\n=== Also checking common dev ports ===');
[3000, 3001, 5173, 5174, 4173, 8080, 8081, 9000].forEach(port => {
    try {
        const command = os.platform() === 'win32' 
            ? `netstat -ano | findstr :${port} | findstr LISTENING`
            : `lsof -ti:${port}`;
        const result = execSync(command, { encoding: 'utf8' }).trim();
        if (result) {
            console.log(`Port ${port} is in use, killing...`);
            if (os.platform() === 'win32') {
                execSync(`taskkill /F /IM node.exe`, { stdio: 'ignore' });
            } else {
                execSync(`kill -9 ${result}`, { stdio: 'ignore' });
            }
        }
    } catch (error) {
        // Port not in use
    }
});