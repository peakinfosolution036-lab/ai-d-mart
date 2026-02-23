#!/bin/bash

# Step 1: Remove old remote
git remote remove origin

# Step 2: Add new remote (replace with your actual repo URL)
git remote add origin https://github.com/arunachalam077/aidmart-platform.git

# Step 3: Push to new repository
git push -u origin main

echo "✅ Code pushed to new repository!"
