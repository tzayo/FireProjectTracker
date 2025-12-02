#!/bin/bash

echo "🛑 Stopping the fire safety management system..."

# Stop by PID files if they exist
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null && echo "✅ Backend stopped (PID: $BACKEND_PID)" || echo "⚠️  Backend is no longer active"
    rm .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo "✅ Frontend stopped (PID: $FRONTEND_PID)" || echo "⚠️  Frontend is no longer active"
    rm .frontend.pid
fi

# Cleaning up remaining processes
pkill -f "python.*app.py" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
pkill -f "npm.*start" 2>/dev/null

echo ""
echo "✅ System stopped successfully!"
echo ""