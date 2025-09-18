#!/bin/bash

# Exit on any error
set -e

echo "Initializing AnonymousComplaintApp project..."

# Step 1: Run yarn init (installs deps and sets up Prisma)
echo "Running yarn init..."
yarn init

# Step 2: Deploy contracts locally
echo "Starting local Hardhat node and deploying contracts..."
cd apps/contracts

# Start Hardhat node in background
npx hardhat node &
HARDHAT_PID=$!

# Wait for node to start
sleep 5

# Deploy contracts
echo "Deploying contracts..."
OUTPUT=$(npx hardhat run scripts/deploy.ts --network localhost 2>&1)
SEMAPHORE_ADDRESS=$(echo "$OUTPUT" | grep "Semaphore deployed to:" | awk '{print $4}')
COMPLAINT_ADDRESS=$(echo "$OUTPUT" | grep "Complaint contract has been deployed to:" | awk '{print $6}')
GROUP_ID=$(echo "$OUTPUT" | grep "Group ID:" | awk '{print $3}')

if [ -z "$SEMAPHORE_ADDRESS" ] || [ -z "$COMPLAINT_ADDRESS" ] || [ -z "$GROUP_ID" ]; then
    echo "Failed to extract deployment info"
    kill $HARDHAT_PID
    exit 1
fi

# Kill Hardhat node
kill $HARDHAT_PID

cd ../..

# Step 3: Update .env files
echo "Updating environment files..."
node scripts/update-env.js "$SEMAPHORE_ADDRESS" "$COMPLAINT_ADDRESS" "$GROUP_ID"

# Step 4: Build and start (optional)
echo "Building web-app..."
cd apps/web-app
yarn build
echo "Starting development server..."
yarn dev &
cd ../..

echo "Initialization complete!"
echo "Semaphore Contract: $SEMAPHORE_ADDRESS"
echo "Complaint Contract: $COMPLAINT_ADDRESS"
echo "Group ID: $GROUP_ID"
echo "You can now access the app at http://localhost:3000"