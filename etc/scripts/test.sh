#!/bin/bash

echo "\n########################"
echo "#  Running Unit Tests  #"
echo "########################\n"

# Run the Grunt task
grunt run-unit-tests | bunyan

exit 0;
