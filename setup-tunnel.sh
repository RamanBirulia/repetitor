#!/bin/bash

# Cloudflare Tunnel Setup Script for Repetitor
# Sets up and manages the "birulia" tunnel for the English Learning Web Game

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
TUNNEL_NAME="birulia"
COMPOSE_FILE="docker-compose.yml"
TUNNEL_CONFIG="cloudflare-tunnel.yml"

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

print_header() {
    echo -e "${PURPLE}[TUNNEL]${NC} $1"
}

# Function to show help
show_help() {
    echo "Cloudflare Tunnel Setup Script for Repetitor"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  setup       Complete tunnel setup (interactive)"
    echo "  start       Start the application with tunnel"
    echo "  stop        Stop the application and tunnel"
    echo "  status      Check tunnel and application status"
    echo "  logs        Show tunnel logs"
    echo "  restart     Restart the tunnel service"
    echo "  test        Test tunnel connectivity"
    echo "  clean       Clean up tunnel resources"
    echo "  domain      Show domain information"
    echo "  help        Show this help message"
    echo ""
    echo "Options:"
    echo "  -d, --domain DOMAIN    Set custom domain"
    echo "  -f, --force           Force operations without confirmation"
    echo ""
    echo "Examples:"
    echo "  $0 setup"
    echo "  $0 start"
    echo "  $0 status"
    echo "  $0 logs"
}

# Check if cloudflared is installed
check_cloudflared() {
    if ! command -v cloudflared &> /dev/null; then
        print_error "cloudflared is not installed!"
        print_info "Please install cloudflared:"
        echo ""
        echo "  # macOS"
        echo "  brew install cloudflared"
        echo ""
        echo "  # Linux"
        echo "  wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
        echo "  sudo dpkg -i cloudflared-linux-amd64.deb"
        echo ""
        echo "  # Or download from: https://github.com/cloudflare/cloudflared/releases"
        exit 1
    fi
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check tunnel authentication
check_tunnel_auth() {
    print_info "Checking tunnel authentication..."

    if [ ! -f ~/.cloudflared/$TUNNEL_NAME.json ]; then
        print_warning "Tunnel credentials not found!"
        print_info "Please authenticate with Cloudflare:"
        echo ""
        echo "  1. Run: cloudflared tunnel login"
        echo "  2. Complete authentication in browser"
        echo "  3. Run this script again"
        exit 1
    else
        print_success "Tunnel credentials found!"
    fi
}

# Setup tunnel
setup_tunnel() {
    print_header "Setting up Cloudflare Tunnel: $TUNNEL_NAME"

    # Check prerequisites
    check_cloudflared
    check_docker

    # Check if tunnel exists
    print_info "Checking if tunnel '$TUNNEL_NAME' exists..."
    if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
        print_success "Tunnel '$TUNNEL_NAME' already exists!"
    else
        print_error "Tunnel '$TUNNEL_NAME' not found!"
        print_info "Please create the tunnel first:"
        echo ""
        echo "  1. Login to Cloudflare: cloudflared tunnel login"
        echo "  2. Create tunnel: cloudflared tunnel create $TUNNEL_NAME"
        echo "  3. Configure DNS in Cloudflare dashboard"
        echo "  4. Run this script again"
        exit 1
    fi

    check_tunnel_auth

    # Get tunnel domain
    print_info "Getting tunnel domain information..."
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    print_success "Tunnel ID: $TUNNEL_ID"

    # Update configuration
    print_info "Configuration file: $TUNNEL_CONFIG"
    if [ -f "$TUNNEL_CONFIG" ]; then
        print_success "Tunnel configuration found!"
        print_warning "Please update the domain in $TUNNEL_CONFIG if needed"
    else
        print_error "Tunnel configuration not found!"
        exit 1
    fi

    print_success "Tunnel setup complete!"
    print_info "Next steps:"
    echo "  1. Update domain in $TUNNEL_CONFIG"
    echo "  2. Configure DNS in Cloudflare dashboard"
    echo "  3. Run: $0 start"
}

# Start services
start_services() {
    print_header "Starting Repetitor with Cloudflare Tunnel"

    check_docker
    check_tunnel_auth

    print_info "Starting services with Docker Compose..."
    docker-compose up -d --build

    # Wait for services to be ready
    print_info "Waiting for services to start..."
    sleep 10

    # Check service status
    if docker-compose ps | grep -q "Up"; then
        print_success "Services started successfully!"
        show_status
    else
        print_error "Services failed to start!"
        print_info "Check logs with: $0 logs"
        exit 1
    fi
}

# Stop services
stop_services() {
    print_header "Stopping Repetitor and Cloudflare Tunnel"

    print_info "Stopping Docker Compose services..."
    docker-compose down

    print_success "Services stopped successfully!"
}

# Show status
show_status() {
    print_header "Service Status"

    echo ""
    print_info "Docker Compose Services:"
    docker-compose ps

    echo ""
    print_info "Tunnel Information:"
    if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
        cloudflared tunnel list | head -1
        cloudflared tunnel list | grep "$TUNNEL_NAME"
    else
        print_warning "Tunnel not found or not accessible"
    fi

    echo ""
    print_info "Application Health:"
    if docker-compose ps | grep "repetitor-app" | grep -q "Up"; then
        if curl -f http://localhost/health --max-time 5 --silent > /dev/null 2>&1; then
            print_success "Application is healthy!"
        else
            print_warning "Application health check failed"
        fi
    else
        print_warning "Application container not running"
    fi

    echo ""
    print_info "Access Information:"
    echo "  🌐 Public URL: https://your-domain.com (configure in Cloudflare dashboard)"
    echo "  🔧 Local access: http://localhost (when port exposed)"
    echo "  📊 Tunnel metrics: http://localhost:9090/metrics (if exposed)"
}

# Show logs
show_logs() {
    print_header "Service Logs"

    echo ""
    print_info "Select service logs to view:"
    echo "  1) Application (repetitor)"
    echo "  2) Cloudflare Tunnel"
    echo "  3) Both"
    echo "  4) Follow all logs"

    read -p "Choice (1-4): " choice

    case $choice in
        1)
            docker-compose logs repetitor
            ;;
        2)
            docker-compose logs cloudflared
            ;;
        3)
            docker-compose logs
            ;;
        4)
            docker-compose logs -f
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

# Test connectivity
test_connectivity() {
    print_header "Testing Tunnel Connectivity"

    print_info "Checking local application..."
    if curl -f http://localhost/health --max-time 10 --silent > /dev/null 2>&1; then
        print_success "Local application responding!"
    else
        print_warning "Local application not responding"
    fi

    print_info "Checking tunnel status..."
    if docker-compose ps | grep "birulia-tunnel" | grep -q "Up"; then
        print_success "Tunnel container is running!"
    else
        print_warning "Tunnel container not running"
    fi

    print_info "Tunnel info:"
    cloudflared tunnel info $TUNNEL_NAME 2>/dev/null || print_warning "Could not get tunnel info"

    print_info "Please test your public domain manually in a browser"
}

# Restart tunnel
restart_tunnel() {
    print_header "Restarting Cloudflare Tunnel"

    print_info "Restarting tunnel service..."
    docker-compose restart cloudflared

    sleep 5

    if docker-compose ps | grep "birulia-tunnel" | grep -q "Up"; then
        print_success "Tunnel restarted successfully!"
    else
        print_error "Failed to restart tunnel"
        exit 1
    fi
}

# Clean up
clean_up() {
    print_header "Cleaning Up Tunnel Resources"

    read -p "This will stop and remove all containers. Continue? (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Stopping and removing containers..."
        docker-compose down --volumes --remove-orphans

        print_info "Removing Docker images..."
        docker rmi repetitor birulia-tunnel 2>/dev/null || true

        print_success "Cleanup completed!"
        print_info "Tunnel '$TUNNEL_NAME' still exists in Cloudflare (not removed)"
    else
        print_info "Cleanup cancelled"
    fi
}

# Show domain information
show_domain_info() {
    print_header "Domain Configuration Information"

    echo ""
    print_info "Tunnel Name: $TUNNEL_NAME"

    if cloudflared tunnel list | grep -q "$TUNNEL_NAME"; then
        TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
        print_info "Tunnel ID: $TUNNEL_ID"
    fi

    echo ""
    print_info "DNS Configuration Required:"
    echo "  Type: CNAME"
    echo "  Name: your-subdomain (e.g., app, repetitor, birulia)"
    echo "  Target: $TUNNEL_ID.cfargotunnel.com"
    echo ""
    print_info "Example DNS records:"
    echo "  app.yourdomain.com     CNAME   $TUNNEL_ID.cfargotunnel.com"
    echo "  birulia.yourdomain.com CNAME   $TUNNEL_ID.cfargotunnel.com"
    echo ""
    print_warning "Don't forget to update the hostname in $TUNNEL_CONFIG!"
}

# Parse arguments
ACTION=""
DOMAIN=""
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        setup|start|stop|status|logs|restart|test|clean|domain|help)
            ACTION=$1
            shift
            ;;
        -d|--domain)
            DOMAIN=$2
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check if Docker Compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Docker Compose file not found: $COMPOSE_FILE"
    exit 1
fi

# Execute action
case $ACTION in
    setup)
        setup_tunnel
        ;;
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    restart)
        restart_tunnel
        ;;
    test)
        test_connectivity
        ;;
    clean)
        clean_up
        ;;
    domain)
        show_domain_info
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
