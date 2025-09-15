# Quick Cloudflare Tunnel Setup

Get your English Learning Web Game online in 5 minutes with Cloudflare Tunnel!

## 🚀 Super Quick Start

### Prerequisites
- Docker installed and running
- Cloudflare account with a domain
- `cloudflared` installed ([install guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/))

### 🚨 Fix Certificate Error First
If you see "error parsing tunnel ID: Error locating origin cert", run:
```bash
./fix-tunnel-auth.sh
```
This will automatically fix authentication issues.

### Step 1: Fix Authentication Issues
```bash
# Run the fix script to handle certificate issues
./fix-tunnel-auth.sh
```
This script will:
- Check for origin certificate (`cert.pem`)
- Authenticate with Cloudflare if needed
- Create tunnel "birulia" if it doesn't exist
- Validate your configuration

### Step 3: Configure DNS (2 minutes)
In your Cloudflare dashboard:
1. Go to **DNS** > **Records**
2. Click **Add record**
3. Type: **CNAME**
4. Name: **app** (or whatever subdomain you want)
5. Target: **[your-tunnel-id].cfargotunnel.com**
6. Click **Save**

**Find your tunnel ID:**
```bash
cloudflared tunnel list
```

### Step 4: Update Domain (30 seconds)
Edit `cloudflare-tunnel.yml` and replace `birulia.your-domain.com` with your actual domain:
```yaml
ingress:
  - hostname: app.yourdomain.com  # ← Change this line
    service: http://repetitor:80
```

### Step 5: Launch! (1 minute)
```bash
./setup-tunnel.sh start
```

**That's it!** Your app is now live at `https://app.yourdomain.com` 🎉

---

## 🔧 Quick Commands

```bash
# Start everything
./setup-tunnel.sh start

# Check if it's working
./setup-tunnel.sh status

# View logs if something's wrong
./setup-tunnel.sh logs

# Stop everything
./setup-tunnel.sh stop
```

---

## 🆘 Quick Troubleshooting

### "Origin cert error" or "tunnel ID parsing error"
```bash
./fix-tunnel-auth.sh
```

### "502 Bad Gateway"
```bash
./setup-tunnel.sh restart
```

### "DNS not found"
- Wait 5 minutes for DNS propagation
- Double-check your DNS record in Cloudflare dashboard

### "Tunnel not connecting"
```bash
# Check tunnel exists
cloudflared tunnel list

# Check credentials
ls ~/.cloudflared/birulia.json
ls ~/.cloudflared/cert.pem

# Fix authentication issues
./fix-tunnel-auth.sh

# Restart everything
./setup-tunnel.sh stop
./setup-tunnel.sh start
```

---

## 📱 Share Your App

Once running, share these URLs:
- **Main Game**: `https://app.yourdomain.com`
- **Health Check**: `https://app.yourdomain.com/health`

Perfect for:
- 👨‍🎓 Students learning English
- 👩‍🏫 Teachers sharing with classes  
- 🌍 Anyone worldwide with internet access

---

**Need more details?** Check [CLOUDFLARE-TUNNEL.md](CLOUDFLARE-TUNNEL.md) for the complete guide.

**Having issues?** Run `./setup-tunnel.sh help` for all available commands.