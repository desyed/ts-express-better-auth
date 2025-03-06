#!/bin/sh

set -e

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "Environment variables loaded from .env file"
    printenv
else
    echo "Warning: .env file not found"
fi

npm run start