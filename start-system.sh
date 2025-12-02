#!/bin/bash
set -euox pipefail

echo "Fire Safety Management System - Quick Start"
echo "==========================================="
echo ""

# Checking Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi
echo "Python found: $(python3 --version)"

# Checking Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi
echo "Node.js found: $(node --version)"

echo ""
echo "Checking dependencies..."

# Checking and installing Backend dependencies
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment for Backend..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    echo " Backend dependencies installed"
else
    echo " Backend dependencies already installed"
fi

# Checking .env file in Backend
if [ ! -f "backend/.env" ]; then
    echo "  Warning: backend/.env file does not exist"
    echo "   The system will work with default settings (development mode)"
    echo "   To create a configuration file: cp backend/.env.example backend/.env"
    echo ""
fi

# Checking and installing Frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing Frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "Frontend dependencies installed"
else
    echo "Frontend dependencies already installed"
fi

# Checking .env file in Frontend
if [ ! -f "frontend/.env" ]; then
    echo "Info: frontend/.env file does not exist (optional)"
    echo "   To create a configuration file: cp frontend/.env.example frontend/.env"
    echo ""
fi

echo ""
echo "Starting the system..."
echo ""

# Starting Backend in background
echo "Starting Backend Server (http://localhost:5000)..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate || . venv/Scripts/activate
fi
python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Brief wait for server to start
sleep 3

# Checking that Backend is up
if curl -s http://localhost:5000/api/dashboard/stats > /dev/null 2>&1; then
    echo "Backend Server is active!"
else
    echo "Backend Server may not have started properly. Check backend.log"
fi

echo ""
echo "Starting Frontend (http://localhost:3000)..."
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "=================================="
echo "System started successfully!"
echo ""
echo "System Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "Logs:"
echo "   Backend: backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "To stop the system:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or press Ctrl+C and then run:"
echo "   pkill -f 'python.*app.py'"
echo "   pkill -f 'react-scripts'"
echo ""
echo "=================================="
echo "Guides:"
echo "   - Quick Guide: QUICKSTART.md"
echo "   - Full Guide: SYSTEM_GUIDE.md"
echo "=================================="

# Saving PIDs for easy stopping
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo "Waiting for Frontend to start (this may take a minute)..."
echo "The browser will open automatically at http://localhost:3000"
echo ""

# Waiting for Frontend to start and keeping the process active
wait $FRONTEND_PID