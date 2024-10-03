#!/bin/bash

# Pull changes from the repository
git pull

# Install dependencies using pnpm
pnpm i

# Start the Node.js application
pnpm run start