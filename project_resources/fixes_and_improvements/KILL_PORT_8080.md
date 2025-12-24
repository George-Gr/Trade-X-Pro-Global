# Kill Port 8080 - Quick Commands

## Method 1: Using lsof (macOS/Linux)
```bash
# Find process using port 8080
lsof -ti:8080

# Kill the process (replace PID with actual number)
kill -9 <PID>

# Or kill all processes on port 8080 in one line
lsof -ti:8080 | xargs kill -9
```

## Method 2: Using netstat (Windows)
```cmd
# Find process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

## Method 3: Using PowerShell (Windows)
```powershell
# Find and kill process using port 8080
Get-NetTCPConnection -LocalPort 8080 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## Method 4: Using the provided scripts
```bash
# Run the bash script
chmod +x kill-port-8080.sh
./kill-port-8080.sh

# Or run the Node.js script
node kill-port.js
```

## Method 5: Kill all Node.js processes (if using Node.js)
```bash
# macOS/Linux
pkill -f node

# Windows
taskkill /F /IM node.exe
```

## Method 6: Kill npm/yarn processes
```bash
# Kill npm processes
pkill -f "npm.*dev"

# Kill yarn processes  
pkill -f "yarn.*dev"
```

## Verification
After killing the process, verify port 8080 is free:
```bash
# macOS/Linux
lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

If no output is returned, the port is free!