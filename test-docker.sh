#!/bin/bash

# Quick Docker Test Script for Repetitor
# Tests the Docker build and basic functionality

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Test configuration
IMAGE_NAME="repetitor-test"
CONTAINER_NAME="repetitor-test-container"
TEST_PORT=3001

print_info "Starting Docker build test for Repetitor..."

# Clean up any existing test containers/images
print_info "Cleaning up existing test resources..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
docker rmi $IMAGE_NAME 2>/dev/null || true

# Test 1: Build the Docker image
print_info "Test 1: Building Docker image..."
if docker build -t $IMAGE_NAME . --quiet; then
    print_success "Docker image built successfully!"
else
    print_error "Docker build failed!"
    exit 1
fi

# Test 2: Check image size
print_info "Test 2: Checking image size..."
IMAGE_SIZE=$(docker images $IMAGE_NAME --format "table {{.Size}}" | tail -n 1)
print_info "Final image size: $IMAGE_SIZE"

# Test 3: Start container
print_info "Test 3: Starting container..."
if docker run -d --name $CONTAINER_NAME -p $TEST_PORT:80 $IMAGE_NAME; then
    print_success "Container started successfully!"
else
    print_error "Failed to start container!"
    exit 1
fi

# Test 4: Wait for container to be ready
print_info "Test 4: Waiting for container to be ready..."
sleep 5

# Test 5: Health check
print_info "Test 5: Testing health endpoint..."
if curl -f http://localhost:$TEST_PORT/health --max-time 10 --silent > /dev/null 2>&1; then
    print_success "Health check passed!"
else
    print_error "Health check failed!"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Test 6: Test main application
print_info "Test 6: Testing main application..."
if curl -f http://localhost:$TEST_PORT --max-time 10 --silent > /dev/null 2>&1; then
    print_success "Main application responding!"
else
    print_error "Main application not responding!"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Test 7: Check container logs
print_info "Test 7: Checking container logs..."
LOG_OUTPUT=$(docker logs $CONTAINER_NAME 2>&1)
if echo "$LOG_OUTPUT" | grep -q "error\|Error\|ERROR"; then
    print_warning "Found errors in logs:"
    echo "$LOG_OUTPUT" | grep -i error
else
    print_success "No errors found in logs!"
fi

# Test 8: Container stats
print_info "Test 8: Container resource usage..."
STATS=$(docker stats $CONTAINER_NAME --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}")
print_info "Resource usage:"
echo "$STATS"

print_success "All tests passed! 🎉"
print_info "Application is running at: http://localhost:$TEST_PORT"
print_info "Health check: http://localhost:$TEST_PORT/health"

# Cleanup option
echo ""
read -p "Clean up test resources? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cleaning up..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
    docker rmi $IMAGE_NAME
    print_success "Cleanup completed!"
else
    print_info "Test container left running for manual inspection"
    print_info "To clean up later, run:"
    echo "  docker stop $CONTAINER_NAME && docker rm $CONTAINER_NAME && docker rmi $IMAGE_NAME"
fi
