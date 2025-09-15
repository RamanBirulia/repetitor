# Cloudflare Tunnel Setup Guide

Complete guide for sharing your English Learning Web Game using Cloudflare Tunnel with the "birulia" tunnel.

## 🌐 Overview

Cloudflare Tunnel allows you to securely expose your local Docker application to the internet without opening firewall ports or managing SSL certificates. Your application will be accessible via a custom domain with Cloudflare's global CDN.

## 📋 Prerequisites

### Required Software
- **Docker & Docker Compose** (already installed for your project)
- **cloudflared** - Cloudflare Tunnel client
- **Cloudflare Account** with a domain managed by Cloudflare

### Install cloudflared

#### macOS
```bash
brew install cloudflared
```

#### Linux (Ubuntu/Debian)
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

#### Windows
Download from [GitHub Releases](https://github.com/cloudflare/cloudflared/releases)

## 🚀 Quick Setup

### Step 1: Authenticate with Cloudflare
```bash
cloudflared tunnel login
```
This opens your browser to authenticate with your Cloudflare account.

### Step 2: Verify Your Tunnel
Since you already created the "birulia" tunnel, verify it exists:
```bash
cloudflared tunnel list
```

### Step 3: Configure DNS
In your Cloudflare dashboard, add a CNAME record:
- **Type**: CNAME
- **Name**: `app` (or your preferred subdomain)
- **Target**: `<tunnel-id>.cfargotunnel.com`

### Step 4: Update Configuration
Edit `cloudflare-tunnel.yml` and replace `birulia.your-domain.com` with your actual domain:
```yaml
ingress:
  - hostname: app.yourdomain.com  # Update this
    service: http://repetitor:80
```

### Step 5: Start Everything
```bash
./setup-tunnel.sh start
```

Your application will be available at `https://app.yourdomain.com`!

## 📁 Configuration Files

### cloudflare-tunnel.yml
Main tunnel configuration file with ingress rules and settings.

**Key sections:**
- **tunnel**: Your tunnel name ("birulia")
- **credentials-file**: Path to tunnel credentials
- **ingress**: Routes incoming requests to your application
- **originRequest**: Connection optimization settings

### docker-compose.yml
Updated to include the cloudflared service alongside your application.

**New features:**
- **cloudflared service**: Runs the tunnel client
- **Internal networking**: Secure communication between services
- **Health checks**: Monitors both app and tunnel
- **Volume mounting**: Accesses tunnel credentials

## 🛠️ Management Commands

### Using the Setup Script
```bash
# Complete setup guide
./setup-tunnel.sh setup

# Start application with tunnel
./setup-tunnel.sh start

# Check status
./setup-tunnel.sh status

# View logs
./setup-tunnel.sh logs

# Stop everything
./setup-tunnel.sh stop

# Show domain configuration help
./setup-tunnel.sh domain

# Test connectivity
./setup-tunnel.sh test

# Clean up resources
./setup-tunnel.sh clean
```

### Manual Docker Compose Commands
```bash
# Start services
docker-compose up -d --build

# View services status
docker-compose ps

# View logs
docker-compose logs -f cloudflared
docker-compose logs -f repetitor

# Stop services
docker-compose down
```

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Update cloudflare-tunnel.yml**:
```yaml
ingress:
  - hostname: english-game.yourdomain.com
    service: http://repetitor:80
  - hostname: learn.yourdomain.com
    service: http://repetitor:80
  - service: http_status:404
```

2. **Add DNS Records** in Cloudflare Dashboard:
```
english-game  CNAME  <tunnel-id>.cfargotunnel.com
learn         CNAME  <tunnel-id>.cfargotunnel.com
```

### Multiple Routes
Route different paths to different services:
```yaml
ingress:
  - hostname: app.yourdomain.com
    path: /health
    service: http://repetitor:80
  - hostname: app.yourdomain.com
    path: /api/*
    service: http://api-service:3001
  - hostname: app.yourdomain.com
    service: http://repetitor:80
  - service: http_status:404
```

### Security Settings
Enable additional security features:
```yaml
originRequest:
  noTLSVerify: false
  connectTimeout: 30s
  tlsTimeout: 30s
  httpHostHeader: app.yourdomain.com
  originServerName: app.yourdomain.com
```

## 📊 Monitoring & Debugging

### Health Checks
The setup includes automatic health checks for both services:

**Application Health**:
- Endpoint: `/health`
- Interval: 30s
- Timeout: 10s

**Tunnel Health**:
- Command: `cloudflared tunnel info birulia`
- Interval: 60s
- Timeout: 30s

### Viewing Logs
```bash
# Application logs
docker-compose logs -f repetitor

# Tunnel logs
docker-compose logs -f cloudflared

# All logs together
docker-compose logs -f

# Using management script
./setup-tunnel.sh logs
```

### Metrics
Tunnel metrics are available at:
- **Internal**: `http://localhost:9090/metrics`
- **Container**: Access via `docker exec`

### Common Log Messages
- `Registered tunnel connection`: Tunnel connected successfully
- `Unregistered tunnel connection`: Tunnel disconnected
- `ERR error="websocket: close 1006"`: Connection issue, usually temporary

## 🔍 Troubleshooting

### Common Issues

#### 1. Tunnel Not Connecting
**Symptoms**: 502 Bad Gateway errors
**Solutions**:
```bash
# Check tunnel status
cloudflared tunnel info birulia

# Restart tunnel service
docker-compose restart cloudflared

# Check logs
docker-compose logs cloudflared
```

#### 2. DNS Not Resolving
**Symptoms**: Domain doesn't resolve
**Solutions**:
- Verify DNS records in Cloudflare dashboard
- Wait for DNS propagation (up to 24 hours)
- Test with `dig yourdomain.com` or `nslookup yourdomain.com`

#### 3. Application Not Responding
**Symptoms**: Tunnel connects but app doesn't respond
**Solutions**:
```bash
# Check application health
curl http://localhost/health

# Restart application
docker-compose restart repetitor

# Check internal connectivity
docker exec birulia-tunnel wget -q --spider http://repetitor:80/health
```

#### 4. SSL/TLS Issues
**Symptoms**: Certificate errors
**Solutions**:
- Ensure your domain is managed by Cloudflare
- Check SSL/TLS setting in Cloudflare dashboard (should be "Flexible" or "Full")
- Verify tunnel credentials are valid

### Debug Commands
```bash
# Test tunnel connectivity
cloudflared tunnel info birulia

# Test local application
curl -v http://localhost/health

# Check Docker networking
docker network inspect repetitor_tunnel-network

# Validate tunnel configuration
cloudflared tunnel ingress validate cloudflare-tunnel.yml

# Test ingress rules
cloudflared tunnel ingress rule https://app.yourdomain.com cloudflare-tunnel.yml
```

## 🛡️ Security Considerations

### Network Security
- **Isolated Network**: Services communicate on internal Docker network
- **No Port Exposure**: No ports exposed to host (tunnel handles ingress)
- **Cloudflare Protection**: DDoS protection and WAF included

### Access Control
Configure access policies in Cloudflare dashboard:
- **Cloudflare Access**: Add authentication layer
- **Rate Limiting**: Protect against abuse
- **IP Restrictions**: Limit access by geography or IP

### Best Practices
1. **Regular Updates**: Keep cloudflared updated
2. **Monitor Logs**: Watch for unusual activity
3. **Backup Credentials**: Store tunnel credentials securely
4. **Use HTTPS**: Always use HTTPS for production

## 📈 Performance Optimization

### Cloudflare Settings
Optimize in your Cloudflare dashboard:
- **Caching**: Configure caching rules for static assets
- **Compression**: Enable Brotli/Gzip compression
- **Minification**: Auto-minify HTML, CSS, JS
- **HTTP/2**: Enabled by default
- **HTTP/3**: Enable for better performance

### Tunnel Configuration
```yaml
# Optimize connection settings
originRequest:
  connectTimeout: 30s
  tlsTimeout: 30s
  tcpKeepAlive: 30s
  keepAliveConnections: 1024
  keepAliveTimeout: 1m30s

# Enable HTTP/2
http2-origin: true
compression: gzip
```

### Application Optimization
Your nginx configuration already includes:
- Gzip compression
- Static asset caching
- Security headers
- Optimized connection settings

## 🔄 Backup & Recovery

### Backup Tunnel Configuration
```bash
# Backup credentials
cp ~/.cloudflared/birulia.json ~/tunnel-backup/

# Backup configuration
cp cloudflare-tunnel.yml ~/tunnel-backup/

# List all tunnels (for documentation)
cloudflared tunnel list > ~/tunnel-backup/tunnel-list.txt
```

### Recovery Process
1. Restore credentials to `~/.cloudflared/`
2. Restore configuration file
3. Verify tunnel exists: `cloudflared tunnel list`
4. Start services: `./setup-tunnel.sh start`

## 🆘 Support & Resources

### Useful Commands Reference
```bash
# Tunnel management
cloudflared tunnel list
cloudflared tunnel info birulia
cloudflared tunnel delete birulia  # ⚠️ Dangerous

# Configuration testing
cloudflared tunnel ingress validate cloudflare-tunnel.yml
cloudflared tunnel ingress rule https://app.yourdomain.com

# Connection testing
curl -I https://app.yourdomain.com
curl -I https://app.yourdomain.com/health
```

### Getting Help
1. **Check this documentation** for common solutions
2. **Review logs**: `./setup-tunnel.sh logs`
3. **Test configuration**: `./setup-tunnel.sh test`
4. **Cloudflare Documentation**: [developers.cloudflare.com/tunnel](https://developers.cloudflare.com/tunnel/)
5. **Community Support**: Cloudflare Community Forums

### Quick Fixes
```bash
# Complete restart
./setup-tunnel.sh stop && ./setup-tunnel.sh start

# Clear and rebuild
docker-compose down --volumes
docker-compose up -d --build

# Reset tunnel connection
docker-compose restart cloudflared
```

## 📝 Example Complete Setup

Here's a complete example for domain `example.com`:

### 1. DNS Configuration
```
app.example.com    CNAME    <tunnel-id>.cfargotunnel.com
```

### 2. Updated cloudflare-tunnel.yml
```yaml
tunnel: birulia
credentials-file: /root/.cloudflared/birulia.json

ingress:
  - hostname: app.example.com
    service: http://repetitor:80
  - service: http_status:404
```

### 3. Start Services
```bash
./setup-tunnel.sh start
```

### 4. Test Access
```bash
curl https://app.example.com/health
# Should return: "healthy"
```

Your English Learning Web Game is now publicly accessible at `https://app.example.com`! 🎉

---

## 🎓 Next Steps

Once your tunnel is running:

1. **Share Your App**: Send the URL to friends, students, or colleagues
2. **Monitor Usage**: Check Cloudflare Analytics dashboard
3. **Add Features**: Consider adding user authentication, progress tracking
4. **Scale Up**: Use Cloudflare Load Balancer for multiple instances
5. **Go Mobile**: Your app works great on mobile devices too!

Your English learning game is now ready to help learners worldwide! 🌍📚