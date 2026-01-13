#!/bin/bash

# Start both web and functions in parallel
echo "🚀 Starting RallyHQ Development Environment..."
echo ""

# Run functions in background
echo "📦 Starting Supabase Functions..."
npm run dev:functions &
FUNCTIONS_PID=$!

# Wait a bit for functions to start
sleep 2

# Run web app in foreground
echo "🌐 Starting Web App..."
npm run dev:web

# Cleanup on exit
trap "kill $FUNCTIONS_PID 2>/dev/null" EXIT
