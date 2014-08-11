#!/bin/bash

echo "#########################################"
echo "#  Installing Application Dependencies  #"
echo "#########################################"

# Make sure the script is run by the root user
if [ "$EUID" -ne "0" ]; then
  echo "This script must be run as root." >&2
  exit 1
fi

# Stop the libraries gateway service
echo "Stopping librariesgateway service..."
service librariesgateway stop

# Run some check to see if the prerequisites are installed
git --version > /dev/null 2>&1 || { echo >&2 "Installation aborted: Git not installed"; exit 2; }
node --version > /dev/null 2>&1 || { echo >&2 "Installation aborted: Node not installed"; exit 3; }
bower --version > /dev/null 2>&1 || { echo >&2 "Installation aborted: Bower not installed"; exit 4; }
grunt --version > /dev/null 2>&1 || { echo >&2 "Installation aborted: Grunt not installed"; exit 5; }

# Get latest version from GitHub repository
echo "Pulling latest version from GitHub..."
git fetch origin
git pull origin master

# Install Bower packages
echo "Installing Bower packages..."
bower install --allow-root

# Install Node packages
echo "Installing Node packages..."
npm install -d

# Run Grunt tasks
echo "Compiling the LESS file..."
grunt less:dev
echo "Creating a production build..."
grunt build:"../libraries-gateway"

# Change current directory to the build directory
cd "../libraries-gateway"

# Copy the configurations file
echo "Copying the configurations file"
cp "../config_private.js" "config_private.js"

# Start the libraries gateway service
echo "Starting librariesgateway service..."
service librariesgateway start
