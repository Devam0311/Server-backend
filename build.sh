#!/bin/bash
echo "Starting build process..."
echo "Installing production dependencies only..."

# Install only production dependencies, ignore all scripts
npm install --production --ignore-scripts --no-optional

echo "Build completed successfully!"
echo "Dependencies installed in node_modules/" 