#!/bin/bash

# AI Development Assistant - Startup Script
echo "🚀 Starting AI Development Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is running (optional check)
if command -v pg_isready &> /dev/null; then
    if ! pg_isready -q; then
        echo "⚠️  PostgreSQL might not be running. Make sure your database is accessible."
    fi
fi

# Function to start backend
start_backend() {
    echo "📦 Starting backend server..."
    cd server
    npm install
    npm run dev &
    BACKEND_PID=$!
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting frontend server..."
    cd client/ai-assistant-client
    npm install
    npm run dev &
    FRONTEND_PID=$!
    cd ../..
}

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start servers
start_backend
sleep 3
start_frontend

echo "✅ AI Development Assistant is starting up!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:4000"
echo "📊 GraphQL: http://localhost:4000/graphql"
echo "💚 Health: http://localhost:4000/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for both processes
wait 