# Repetitor Setup Guide

Simple setup guide for the English Learning Web Game with Cloudflare Tunnel.

## 🚀 Quick Start

Your application is configured to run with a single command:

```bash
docker compose up -d
```

This will start:
- **Repetitor App**: Your English learning web game
- **Cloudflare Tunnel**: Secure tunnel to make your app publicly accessible at `https://app.birulia.eu`

## 📋 Prerequisites

### Required
- **Docker & Docker Compose** installed
- **Cloudflare Account** with domain `birulia.eu` managed by Cloudflare
- **Tunnel Credentials**: Already configured for tunnel `birulia` (ID: `20cf6478-7ced-4371-857d-e0017b6818bf`)

### Files that must exist
- `~/.cloudflared/20cf6478-7ced-4371-857d-e0017b6818bf.json` - Tunnel credentials
- `~/.cloudflared/cert.pem` - Origin certificate

## 🛠️ Basic Commands

### Start Everything
```bash
docker compose up -d
```

### Check Status
```bash
docker compose ps
```

### View Logs
```bash
# All services
docker compose logs -f

# Just the app
docker compose logs -f repetitor

# Just the tunnel
docker compose logs -f cloudflared
```

### Stop Everything
```bash
docker compose down
```

### Rebuild and Restart
```bash
docker compose up -d --build
```

## 🌐 Access Your Application

- **Public URL**: https://app.birulia.eu
- **Health Check**: https://app.birulia.eu/health

## 🔍 Troubleshooting

### Check if everything is running
```bash
docker compose ps
```
You should see both `repetitor-app` and `birulia-tunnel` with status "Up".

### Check tunnel connections
```bash
cloudflared tunnel info birulia
```
Should show active connections.

### Test application health
```bash
curl https://app.birulia.eu/health
```
Should return "healthy".

### View detailed logs
```bash
# Application logs
docker compose logs repetitor

# Tunnel logs
docker compose logs cloudflared
```

## ✅ What's Configured

- **Domain**: `app.birulia.eu` points to your application
- **SSL**: Automatically handled by Cloudflare
- **Tunnel**: Secure connection without exposing ports
- **Health Checks**: Automatic monitoring of services
- **Auto-restart**: Services restart automatically if they fail

## 🔧 Configuration Files

- `docker-compose.yml` - Service definitions
- `cloudflare-tunnel.yml` - Tunnel routing configuration
- `nginx.conf` - Web server configuration
- `Dockerfile` - Application container build

## 🎯 That's It!

With the streamlined setup, you just need one command to get everything running:

```bash
docker compose up -d
```

Your English learning game will be available at https://app.birulia.eu! 🎉