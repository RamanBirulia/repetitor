#!/bin/bash

# Cloudflare Tunnel Authentication Fix Script
# Fixes common certificate and authentication issues

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TUNNEL_NAME="birulia"

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
    echo ""
    echo "=================================="
    echo "$1"
    echo "=================================="
}

check_cloudflared() {
    if ! command -v cloudflared &> /dev/null; then
        print_error "cloudflared is not installed!"
        print_info "Install with:"
        echo "  macOS: brew install cloudflared"
        echo "  Linux: wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && sudo dpkg -i cloudflared-linux-amd64.deb"
        exit 1
    fi
    print_success "cloudflared is installed"
}

check_auth_files() {
    print_header "Checking Authentication Files"

    CLOUDFLARED_DIR="$HOME/.cloudflared"
    CERT_FILE="$CLOUDFLARED_DIR/cert.pem"
    TUNNEL_FILE="$CLOUDFLARED_DIR/$TUNNEL_NAME.json"

    print_info "Checking directory: $CLOUDFLARED_DIR"
    if [ ! -d "$CLOUDFLARED_DIR" ]; then
        print_warning "Cloudflared directory doesn't exist, creating it..."
        mkdir -p "$CLOUDFLARED_DIR"
    else
        print_success "Cloudflared directory exists"
    fi

    print_info "Files in $CLOUDFLARED_DIR:"
    ls -la "$CLOUDFLARED_DIR" 2>/dev/null || echo "Directory is empty"

    echo ""
    print_info "Checking origin certificate..."
    if [ -f "$CERT_FILE" ]; then
        print_success "Origin certificate found: $CERT_FILE"

        # Check certificate validity
        if openssl x509 -in "$CERT_FILE" -text -noout >/dev/null 2>&1; then
            print_success "Certificate is valid"
            CERT_EXPIRY=$(openssl x509 -in "$CERT_FILE" -enddate -noout | cut -d= -f2)
            print_info "Certificate expires: $CERT_EXPIRY"
        else
            print_warning "Certificate might be corrupted"
        fi
    else
        print_error "Origin certificate NOT found: $CERT_FILE"
        NEED_LOGIN=true
    fi

    echo ""
    print_info "Checking tunnel credentials..."
    if [ -f "$TUNNEL_FILE" ]; then
        print_success "Tunnel credentials found: $TUNNEL_FILE"

        # Check if JSON is valid
        if python3 -m json.tool "$TUNNEL_FILE" >/dev/null 2>&1; then
            print_success "Credentials file is valid JSON"
        else
            print_warning "Credentials file might be corrupted"
        fi
    else
        print_error "Tunnel credentials NOT found: $TUNNEL_FILE"
        NEED_TUNNEL=true
    fi
}

fix_authentication() {
    print_header "Fixing Authentication"

    if [ "$NEED_LOGIN" = true ]; then
        print_info "Step 1: Authenticating with Cloudflare..."
        print_warning "This will open your browser. Please authorize the application."
        echo ""
        read -p "Press Enter to continue with authentication..."

        if cloudflared tunnel login; then
            print_success "Authentication successful!"
            if [ -f "$HOME/.cloudflared/cert.pem" ]; then
                print_success "Origin certificate created successfully"
            else
                print_error "Authentication completed but certificate not found"
                return 1
            fi
        else
            print_error "Authentication failed"
            return 1
        fi
    else
        print_success "Origin certificate already exists"
    fi
}

fix_tunnel_creation() {
    print_header "Fixing Tunnel Creation"

    # Check if tunnel exists first
    print_info "Checking if tunnel '$TUNNEL_NAME' exists..."
    if cloudflared tunnel list 2>/dev/null | grep -q "$TUNNEL_NAME"; then
        print_success "Tunnel '$TUNNEL_NAME' already exists"
        TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
        print_info "Tunnel ID: $TUNNEL_ID"

        # Check if credentials file exists
        if [ ! -f "$HOME/.cloudflared/$TUNNEL_NAME.json" ]; then
            print_warning "Tunnel exists but credentials file is missing"
            print_info "This can happen if the tunnel was created on another machine"
            print_info "You may need to delete and recreate the tunnel:"
            echo "  cloudflared tunnel delete $TUNNEL_NAME"
            echo "  cloudflared tunnel create $TUNNEL_NAME"
        fi
    else
        if [ "$NEED_TUNNEL" = true ]; then
            print_info "Creating tunnel '$TUNNEL_NAME'..."
            if cloudflared tunnel create $TUNNEL_NAME; then
                print_success "Tunnel created successfully!"
                TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
                print_info "Tunnel ID: $TUNNEL_ID"
            else
                print_error "Failed to create tunnel"
                return 1
            fi
        fi
    fi
}

test_configuration() {
    print_header "Testing Configuration"

    CONFIG_FILE="cloudflare-tunnel.yml"

    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found: $CONFIG_FILE"
        return 1
    fi

    print_info "Validating configuration file..."
    if cloudflared tunnel ingress validate "$CONFIG_FILE"; then
        print_success "Configuration is valid!"
    else
        print_error "Configuration validation failed!"
        print_info "Common issues:"
        echo "  - Check hostname format"
        echo "  - Verify service URLs"
        echo "  - Ensure proper indentation"
        return 1
    fi

    # Test ingress rules
    print_info "Testing ingress rules..."
    HOSTNAME=$(grep -E "^\s*- hostname:" "$CONFIG_FILE" | head -1 | awk '{print $3}')
    if [ "$HOSTNAME" != "app.your-domain.com" ]; then
        print_info "Testing rule for: https://$HOSTNAME"
        if cloudflared tunnel ingress rule "https://$HOSTNAME" "$CONFIG_FILE"; then
            print_success "Ingress rule test passed"
        else
            print_warning "Ingress rule test failed"
        fi
    else
        print_warning "Using default hostname - please update $CONFIG_FILE with your actual domain"
    fi
}

fix_docker_volumes() {
    print_header "Fixing Docker Volume Mounting"

    CERT_FILE="$HOME/.cloudflared/cert.pem"
    TUNNEL_FILE="$HOME/.cloudflared/$TUNNEL_NAME.json"

    print_info "Checking required files for Docker mounting..."

    if [ ! -f "$CERT_FILE" ]; then
        print_error "Certificate file missing: $CERT_FILE"
        print_info "Run authentication first"
        return 1
    fi

    if [ ! -f "$TUNNEL_FILE" ]; then
        print_error "Tunnel credentials missing: $TUNNEL_FILE"
        print_info "Create tunnel first"
        return 1
    fi

    print_success "All required files present for Docker"

    # Test if Docker can access the files
    print_info "Testing Docker volume access..."
    if docker run --rm -v "$CERT_FILE:/tmp/cert.pem:ro" -v "$TUNNEL_FILE:/tmp/tunnel.json:ro" alpine ls -la /tmp/cert.pem /tmp/tunnel.json >/dev/null 2>&1; then
        print_success "Docker can access credential files"
    else
        print_error "Docker cannot access credential files"
        print_info "Check file permissions:"
        ls -la "$CERT_FILE" "$TUNNEL_FILE"
    fi
}

show_next_steps() {
    print_header "Next Steps"

    TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep "$TUNNEL_NAME" | awk '{print $1}')

    if [ -n "$TUNNEL_ID" ]; then
        print_success "Your tunnel is ready!"
        echo ""
        print_info "1. Configure DNS in Cloudflare Dashboard:"
        echo "   Type: CNAME"
        echo "   Name: app (or your subdomain)"
        echo "   Target: $TUNNEL_ID.cfargotunnel.com"
        echo ""
        print_info "2. Update cloudflare-tunnel.yml with your domain:"
        echo "   hostname: app.yourdomain.com"
        echo ""
        print_info "3. Start the tunnel:"
        echo "   ./setup-tunnel.sh start"
        echo ""
        print_info "4. Test your application:"
        echo "   https://app.yourdomain.com"
    else
        print_error "Tunnel setup incomplete"
        print_info "Please fix the issues above and try again"
    fi
}

# Main execution
main() {
    print_header "Cloudflare Tunnel Authentication Fix"
    print_info "Diagnosing and fixing tunnel authentication issues..."

    NEED_LOGIN=false
    NEED_TUNNEL=false

    # Step 1: Check if cloudflared is installed
    check_cloudflared

    # Step 2: Check authentication files
    check_auth_files

    # Step 3: Fix authentication if needed
    if [ "$NEED_LOGIN" = true ]; then
        fix_authentication
    fi

    # Step 4: Fix tunnel creation if needed
    if [ "$NEED_TUNNEL" = true ] || [ "$NEED_LOGIN" = true ]; then
        fix_tunnel_creation
    fi

    # Step 5: Test configuration
    test_configuration

    # Step 6: Fix Docker volume mounting
    fix_docker_volumes

    # Step 7: Show next steps
    show_next_steps

    print_success "Authentication fix completed!"
    print_info "If you still have issues, check the logs with: ./setup-tunnel.sh logs"
}

# Run the main function
main "$@"
