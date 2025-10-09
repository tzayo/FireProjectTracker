#!/bin/bash

echo "🚒 Fire Department Tracking System - Startup Script"
echo "=================================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Python and Node.js are installed"
echo ""

# Backend setup
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# Initialize database
echo "Initializing database..."
python3 -c "from app import app, db; app.app_context().push(); db.create_all()"

echo "✓ Backend setup complete"
cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies (this may take a few minutes)..."
    npm install
fi

echo "✓ Frontend setup complete"
cd ..

echo ""
echo "=================================================="
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && source venv/bin/activate && python3 app.py"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm start"
echo ""
echo "3. Open your browser to: http://localhost:3000"
echo "=================================================="
