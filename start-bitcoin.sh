#!/bin/bash
echo "Starting Bitcoin integration..."

# Start the proxy server
echo "Starting proxy server..."
node proxy-server.js &

# Wait a moment for proxy to start
sleep 2

# Test the connection
echo "Testing connection..."
curl -X GET http://localhost:3001/health

echo "Bitcoin integration ready! Proxy running on port 3001"