#!/bin/bash

# DNS Setup Verification and Fix Script for Cloudflare Tunnel
# Helps diagnose and fix DNS configuration issues for app.birulia.eu

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configuration
DOMAIN="birulia.eu"
SUBDOMAIN="app"
FULL_DOMAIN="app.birulia.eu"
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
    echo -e "${PURPLE}================================"
    echo -e "$1"
    echo -e "================================${NC}"
}

check_tunnel_id() {
    print_header "Getting Tunnel Information"

    if ! command -v cloudflared &> /dev/null; then
        print_error "cloudflared is not installed!"
        exit 1
    fi

    TUNNEL_ID=$(cloudflared tunnel list 2>/dev/null | grep "$TUNNEL_NAME" | awk '{print $1}')

    if [ -z "$TUNNEL_ID" ]; then
        print_error "Tunnel '$TUNNEL_NAME' not found!"
        print_info "Available tunnels:"
        cloudflared tunnel list
        exit 1
    fi

    print_success "Found tunnel '$TUNNEL_NAME'"
    print_info "Tunnel ID: $TUNNEL_ID"
    TUNNEL_TARGET="$TUNNEL_ID.cfargotunnel.com"
    print_info "Tunnel target: $TUNNEL_TARGET"
}

check_base_domain() {
    print_header "Checking Base Domain"

    print_info "Testing base domain: $DOMAIN"
    if nslookup "$DOMAIN" >/dev/null 2>&1; then
        print_success "Base domain '$DOMAIN' resolves correctly"

        # Check nameservers
        NS_SERVERS=$(dig +short NS "$DOMAIN" 2>/dev/null | head -3)
        if echo "$NS_SERVERS" | grep -q "cloudflare"; then
            print_success "Domain is using Cloudflare nameservers"
        else
            print_warning "Domain might not be using Cloudflare nameservers:"
            echo "$NS_SERVERS"
            print_info "Make sure your domain is managed by Cloudflare"
        fi
    else
        print_error "Base domain '$DOMAIN' does not resolve!"
        exit 1
    fi
}

check_subdomain() {
    print_header "Checking Subdomain DNS"

    print_info "Testing subdomain: $FULL_DOMAIN"
    if nslookup "$FULL_DOMAIN" >/dev/null 2>&1; then
        CURRENT_TARGET=$(dig +short CNAME "$FULL_DOMAIN" 2>/dev/null)
        print_success "Subdomain '$FULL_DOMAIN' exists!"
        print_info "Current CNAME target: $CURRENT_TARGET"

        if [ "$CURRENT_TARGET" = "$TUNNEL_TARGET" ]; then
            print_success "DNS is configured correctly!"
            return 0
        else
            print_warning "DNS target is incorrect!"
            print_info "Expected: $TUNNEL_TARGET"
            print_info "Current:  $CURRENT_TARGET"
            return 1
        fi
    else
        print_error "Subdomain '$FULL_DOMAIN' does not resolve!"
        print_info "DNS record needs to be created"
        return 1
    fi
}

show_dns_instructions() {
    print_header "DNS Configuration Instructions"

    echo ""
    print_info "You need to add a DNS record in your Cloudflare dashboard:"
    echo ""
    echo -e "${YELLOW}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║            DNS RECORD REQUIRED              ║${NC}"
    echo -e "${YELLOW}╠══════════════════════════════════════════════╣${NC}"
    echo -e "${YELLOW}║ Type:   ${GREEN}CNAME${YELLOW}                              ║${NC}"
    echo -e "${YELLOW}║ Name:   ${GREEN}$SUBDOMAIN${YELLOW}                                  ║${NC}"
    echo -e "${YELLOW}║ Target: ${GREEN}$TUNNEL_TARGET${YELLOW} ║${NC}"
    echo -e "${YELLOW}║ TTL:    ${GREEN}Auto${YELLOW}                               ║${NC}"
    echo -e "${YELLOW}║ Proxy:  ${GREEN}Enabled (Orange cloud)${YELLOW}             ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════╝${NC}"
    echo ""

    print_info "Steps to add the DNS record:"
    echo "1. Go to https://dash.cloudflare.com"
    echo "2. Select your domain: $DOMAIN"
    echo "3. Go to 'DNS' > 'Records'"
    echo "4. Click 'Add record'"
    echo "5. Fill in the details above"
    echo "6. Click 'Save'"
    echo ""

    print_warning "Important notes:"
    echo "• Make sure the orange cloud (proxy) is ENABLED"
    echo "• DNS propagation can take up to 5 minutes"
    echo "• You can have multiple subdomains pointing to the same tunnel"
}

test_tunnel_connectivity() {
    print_header "Testing Tunnel Connectivity"

    print_info "Checking if tunnel is running..."
    if docker compose ps | grep -q "birulia-tunnel.*Up"; then
        print_success "Tunnel container is running"
    else
        print_error "Tunnel container is not running!"
        print_info "Start with: ./setup-tunnel.sh start"
        return 1
    fi

    print_info "Checking application health..."
    if docker compose exec -T repetitor curl -s http://localhost/health >/dev/null 2>&1; then
        print_success "Application is healthy"
    else
        print_error "Application is not responding!"
        return 1
    fi

    print_info "Checking tunnel connections..."
    CONNECTIONS=$(docker compose logs cloudflared 2>/dev/null | grep "Registered tunnel connection" | wc -l | xargs)
    if [ "$CONNECTIONS" -gt 0 ]; then
        print_success "Tunnel has $CONNECTIONS active connections"
    else
        print_warning "No active tunnel connections found"
    fi
}

wait_for_dns() {
    if [ "$1" = "--wait" ]; then
        print_header "Waiting for DNS Propagation"

        print_info "Waiting for DNS to propagate..."
        print_info "This can take up to 5 minutes..."

        for i in {1..30}; do
            if nslookup "$FULL_DOMAIN" >/dev/null 2>&1; then
                print_success "DNS is now resolving!"
                break
            fi
            echo -n "."
            sleep 10
        done
        echo ""

        if nslookup "$FULL_DOMAIN" >/dev/null 2>&1; then
            check_subdomain
        else
            print_warning "DNS still not resolving. Please wait longer or check your configuration."
        fi
    fi
}

test_website_access() {
    print_header "Testing Website Access"

    if nslookup "$FULL_DOMAIN" >/dev/null 2>&1; then
        print_info "Testing HTTPS access to $FULL_DOMAIN..."

        # Test with curl
        if curl -Is "https://$FULL_DOMAIN" --max-time 10 >/dev/null 2>&1; then
            print_success "Website is accessible via HTTPS!"
            print_success "✅ Your English learning game is live at: https://$FULL_DOMAIN"
        else
            print_warning "Website not accessible yet"
            print_info "This might be normal if DNS was just configured"
            print_info "Try accessing: https://$FULL_DOMAIN in your browser"
        fi

        # Test health endpoint
        print_info "Testing health endpoint..."
        if curl -s "https://$FULL_DOMAIN/health" --max-time 10 | grep -q "healthy"; then
            print_success "Health endpoint is working!"
        else
            print_warning "Health endpoint not responding"
        fi
    else
        print_warning "Cannot test website access - DNS not resolving"
    fi
}

show_summary() {
    print_header "Configuration Summary"

    echo ""
    print_info "Domain Configuration:"
    echo "  Base domain: $DOMAIN"
    echo "  Full domain: $FULL_DOMAIN"
    echo "  Tunnel name: $TUNNEL_NAME"
    echo "  Tunnel ID:   $TUNNEL_ID"
    echo ""

    print_info "Required DNS Record:"
    echo "  Type: CNAME"
    echo "  Name: $SUBDOMAIN"
    echo "  Target: $TUNNEL_TARGET"
    echo ""

    print_info "Your application URLs:"
    echo "  🌐 Main site: https://$FULL_DOMAIN"
    echo "  🔍 Health:   https://$FULL_DOMAIN/health"
    echo ""

    if nslookup "$FULL_DOMAIN" >/dev/null 2>&1; then
        print_success "✅ DNS is configured correctly!"
        print_info "Your site should be accessible at: https://$FULL_DOMAIN"
    else
        print_error "❌ DNS is not configured yet"
        print_info "Please add the DNS record shown above"
    fi
}

# Main execution
main() {
    echo ""
    print_header "DNS Setup Fix for app.birulia.eu"
    echo ""

    # Check tunnel information
    check_tunnel_id

    # Check base domain
    check_base_domain

    # Check subdomain configuration
    if check_subdomain; then
        print_success "DNS is already configured correctly!"
        test_website_access
    else
        print_warning "DNS needs to be configured"
        show_dns_instructions

        # Ask if user wants to wait for DNS configuration
        echo ""
        read -p "Have you added the DNS record? (y/N): " -n 1 -r
        echo

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            wait_for_dns --wait
            test_website_access
        else
            print_info "Please add the DNS record and run this script again"
        fi
    fi

    # Test tunnel connectivity
    test_tunnel_connectivity

    # Show summary
    show_summary

    echo ""
    print_info "Troubleshooting commands:"
    echo "  Check tunnel: ./setup-tunnel.sh status"
    echo "  View logs:    ./setup-tunnel.sh logs"
    echo "  Test again:   ./fix-dns-setup.sh"
    echo ""

    if nslookup "$FULL_DOMAIN" >/dev/null 2>&1; then
        print_success "🎉 Setup complete! Your English learning game should be live!"
    else
        print_warning "⏳ Waiting for DNS configuration to complete setup"
    fi
}

# Handle command line arguments
case "${1:-}" in
    --wait)
        wait_for_dns --wait
        ;;
    --test)
        test_website_access
        ;;
    --help)
        echo "DNS Setup Fix Script"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --wait    Wait for DNS propagation"
        echo "  --test    Test website access only"
        echo "  --help    Show this help"
        echo ""
        echo "Default: Run complete DNS diagnosis and fix"
        ;;
    *)
        main
        ;;
esac
