#!/bin/bash

# Repetitor Docker Management Script
# Simple script to build and run the English Learning Web Game

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ACTION=""
PORT=3000
IMAGE_NAME="repetitor"
CONTAINER_NAME="repetitor-app"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    echo "Repetitor Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build       Build the Docker image"
    echo "  run         Run the application container"
    echo "  dev         Run development version with hot reload"
    echo "  stop        Stop the running container"
    echo "  clean       Remove container and image"
    echo "  logs        Show container logs"
    echo "  shell       Open shell in running container"
    echo "  health      Check application health"
    echo "  help        Show this help message"
    echo ""
    echo "Options:"
    echo "  -p, --port PORT    Port to run on (default: 3000)"
    echo "  -n, --name NAME    Container name (default: repetitor-app)"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 run -p 8080"
    echo "  $0 dev"
    echo "  $0 logs"
}

# Function to build image
build_image() {
    print_info "Building Docker image: $IMAGE_NAME"
    docker build -t $IMAGE_NAME .
    print_success "Image built successfully!"
}

# Function to run container
run_container() {
    print_info "Running container: $CONTAINER_NAME on port $PORT"

    # Stop existing container if running
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        print_warning "Stopping existing container..."
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
    fi

    # Run new container
    docker run -d \
        --name $CONTAINER_NAME \
        -p $PORT:80 \
        --restart unless-stopped \
        $IMAGE_NAME

    print_success "Container started successfully!"
    print_info "Application available at: http://localhost:$PORT"
    print_info "Health check: http://localhost:$PORT/health"
}

# Function to run development version
run_dev() {
    print_info "Starting development environment using docker-compose"
    docker-compose --profile dev up repetitor-dev
}

# Function to stop container
stop_container() {
    print_info "Stopping container: $CONTAINER_NAME"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        print_success "Container stopped successfully!"
    else
        print_warning "No running container found with name: $CONTAINER_NAME"
    fi
}

# Function to clean up
clean_up() {
    print_info "Cleaning up Docker resources..."

    # Stop and remove container
    if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true
        print_info "Container removed"
    fi

    # Remove image
    if docker images -q $IMAGE_NAME | grep -q .; then
        docker rmi $IMAGE_NAME
        print_info "Image removed"
    fi

    print_success "Cleanup completed!"
}

# Function to show logs
show_logs() {
    print_info "Showing logs for container: $CONTAINER_NAME"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker logs -f $CONTAINER_NAME
    else
        print_error "Container $CONTAINER_NAME is not running"
        exit 1
    fi
}

# Function to open shell
open_shell() {
    print_info "Opening shell in container: $CONTAINER_NAME"
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        docker exec -it $CONTAINER_NAME /bin/sh
    else
        print_error "Container $CONTAINER_NAME is not running"
        exit 1
    fi
}

# Function to check health
check_health() {
    print_info "Checking application health..."
    if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
        if curl -f http://localhost:$PORT/health 2>/dev/null; then
            print_success "Application is healthy!"
        else
            print_error "Application health check failed"
            exit 1
        fi
    else
        print_error "Container $CONTAINER_NAME is not running"
        exit 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        build|run|dev|stop|clean|logs|shell|health|help)
            ACTION=$1
            shift
            ;;
        -p|--port)
            PORT=$2
            shift 2
            ;;
        -n|--name)
            CONTAINER_NAME=$2
            shift 2
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Execute action
case $ACTION in
    build)
        build_image
        ;;
    run)
        build_image
        run_container
        ;;
    dev)
        run_dev
        ;;
    stop)
        stop_container
        ;;
    clean)
        clean_up
        ;;
    logs)
        show_logs
        ;;
    shell)
        open_shell
        ;;
    health)
        check_health
        ;;
    help|"")
        show_help
        ;;
    *)
        print_error "Unknown action: $ACTION"
        show_help
        exit 1
        ;;
esac
