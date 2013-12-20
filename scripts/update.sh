#!/bin/bash

echo "#########################################"
echo "#  Installing Application Dependencies  #"
echo "#########################################"

# Run some check to see if the prerequisites are installed
git --version > /dev/null 2>&1 || { echo >&2 "Installation aborted: Git not installed"; exit 1; }
node --version > /dev/null 2>&1 || { echo >&2 "Installation aborted: Node not installed"; exit 2; }
bower --version > /dev/null 2>&1 || { echo >&2 "Installation aborted: Bower not installed"; exit 3; }
grunt --version > /dev/null 2>&1 || { echo >&2 "Installation aborted: Grunt not installed"; exit 4; }

# Get latest version from GitHub repository
echo "Pulling latest version from GitHub..."
# git fetch origin
# git pull origin master

# Install Bower packages
echo "Installing Bower packages..."
# bower install

# Install Node packages
echo "Installing Node packages..."
# npm install -d

# Run Grunt tasks
echo "Compiling the LESS file..."
# grunt less:dev
echo "Creating a production build..."
# grunt build:"../build"

# Create Apache log files if not exist
cd "../"
if [ ! -d "logs" ]; then
    echo "Creating Apache log files..."
    mkdir "logs"
    touch "logs/error_log"
    touch "logs/access_log"
fi

# Keep track of the running Node processes
if [ -f librariesgateway.pid ]; then
    # Get the running node process from the PID-file
    pid=$(cat librariesgateway.pid)
    # Kill the node process if it's already running
    if ps -p $pid > /dev/null
    then
        echo "Terminating current Node process..."
        kill -9 $pid
    fi
fi

# Run the Node application and redirect any output to output.log
echo "Spinning up Node application..."
nohup node app.js > output.log 2>&1 &

# Store the process id in the libraries gateway PID-file
echo $! > librariesgateway.pid
