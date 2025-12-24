#!/bin/bash

echo "=== Killing processes on port 8080 ==="

# Method 1: Use lsof to find and kill the process
echo "Method 1: Using lsof..."
PID=$(lsof -ti:8080 2>/dev/null)

if [ -n "$PID" ]; then
    echo "Found process with PID: $PID"
    echo "Process details:"
    ps -p $PID -o pid,ppid,cmd 2>/dev/null || echo "Process details not available"
    
    echo "Killing process $PID..."
    
    # Try graceful shutdown first
    kill -TERM $PID 2>/dev/null
    
    # Wait a moment
    sleep 2
    
    # Check if still running
    if kill -0 $PID 2>/dev/null; then
        echo "Process still running, forcing termination..."
        kill -KILL $PID 2>/dev/null
    fi
    
    # Verify it's gone
    if ! kill -0 $PID 2>/dev/null; then
        echo "✓ Successfully killed process $PID"
    else
        echo "✗ Failed to kill process $PID"
    fi
else
    echo "No process found on port 8080"
fi

# Method 2: Kill any node processes that might be using port 8080
echo ""
echo "Method 2: Checking for Node.js processes..."
NODE_PIDS=$(pgrep -f "node.*8080\|vite.*8080" 2>/dev/null)

if [ -n "$NODE_PIDS" ]; then
    echo "Found Node.js processes: $NODE_PIDS"
    for NODE_PID in $NODE_PIDS; do
        echo "Killing Node.js process $NODE_PID..."
        kill -TERM $NODE_PID 2>/dev/null
        sleep 1
        if kill -0 $NODE_PID 2>/dev/null; then
            kill -KILL $NODE_PID 2>/dev/null
        fi
    done
fi

# Method 3: Kill any npm or yarn processes
echo ""
echo "Method 3: Checking for npm/yarn processes..."
NPM_PIDS=$(pgrep -f "npm.*dev\|yarn.*dev" 2>/dev/null)

if [ -n "$NPM_PIDS" ]; then
    echo "Found npm/yarn processes: $NPM_PIDS"
    for NPM_PID in $NPM_PIDS; do
        echo "Killing npm/yarn process $NPM_PID..."
        kill -TERM $NPM_PID 2>/dev/null
        sleep 1
        if kill -0 $NPM_PID 2>/dev/null; then
            kill -KILL $NPM_PID 2>/dev/null
        fi
    done
fi

# Final check
echo ""
echo "=== Final verification ==="
FINAL_PID=$(lsof -ti:8080 2>/dev/null)

if [ -z "$FINAL_PID" ]; then
    echo "✓ Port 8080 is now free!"
else
    echo "✗ Port 8080 is still in use by PID: $FINAL_PID"
    echo "Process details:"
    ps -p $FINAL_PID -o pid,ppid,cmd 2>/dev/null || echo "Process details not available"
fi

echo ""
echo "=== Alternative: One-liner commands ==="
echo "To kill port 8080 manually, you can run:"
echo "  lsof -ti:8080 | xargs kill -9"
echo "  or"
echo "  kill -9 \$(lsof -ti:8080)"