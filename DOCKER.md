# Docker Deployment Guide

This guide explains how to build and deploy the Repetitor English Learning Web Game using Docker.

## 🐳 Quick Start

### Option 1: Using Docker Compose (Recommended)
```bash
# Build and run in one command
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop the application
docker-compose down
```

### Option 2: Using the Management Script
```bash
# Build and run
./docker-run.sh run

# Run development version with hot reload
./docker-run.sh dev

# Stop the application
./docker-run.sh stop
```

### Option 3: Manual Docker Commands
```bash
# Build the image
docker build -t repetitor .

# Run the container
docker run -d --name repetitor-app -p 3000:80 repetitor

# Stop the container
docker stop repetitor-app
```

## 📋 Prerequisites

- Docker Engine (version 20.10 or later)
- Docker Compose (version 2.0 or later)
- At least 1GB of available disk space
- Internet connection for downloading dependencies

### Installation
- **Windows/Mac**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: Install [Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/)

## 🏗️ Docker Architecture

### Multi-Stage Build
The Dockerfile uses a multi-stage build approach for optimal performance:

1. **Builder Stage**: Uses Node.js 18 Alpine to build the React application
2. **Production Stage**: Uses Nginx Alpine to serve the static files

### Benefits:
- **Small Image Size**: Final image is ~25MB (vs ~1GB with Node.js included)
- **Security**: Production image contains only necessary files
- **Performance**: Nginx serves static files efficiently
- **Caching**: Docker layer caching optimizes rebuild times

## 📁 File Structure

```
repetitor/
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Container orchestration
├── nginx.conf              # Nginx configuration for SPA
├── .dockerignore           # Files excluded from build context
├── docker-run.sh           # Management script
└── DOCKER.md              # This documentation
```

## 🛠️ Configuration Files

### Dockerfile
- **Base Images**: `node:18-alpine` and `nginx:alpine`
- **Build Process**: npm ci → npm run build → copy to nginx
- **Security**: Runs as non-root user in production

### nginx.conf
- **SPA Support**: Handles React Router client-side routing
- **Compression**: Gzip enabled for better performance
- **Security Headers**: XSS protection, content type sniffing prevention
- **Caching**: Static assets cached for 1 year
- **Health Check**: `/health` endpoint for monitoring

### docker-compose.yml
- **Production Service**: Runs optimized production build
- **Development Service**: Hot reload support (profile: dev)
- **Health Checks**: Automatic container health monitoring
- **Restart Policy**: Automatic restart on failure

## 🚀 Deployment Options

### Development Environment
```bash
# Option 1: Using docker-compose
docker-compose --profile dev up

# Option 2: Using management script
./docker-run.sh dev

# Features:
# - Hot reload enabled
# - Development server on port 3001
# - Volume mounting for live code changes
```

### Production Environment
```bash
# Option 1: Using docker-compose
docker-compose up -d

# Option 2: Using management script
./docker-run.sh run

# Features:
# - Optimized build
# - Nginx serving static files
# - Health checks enabled
# - Automatic restart on failure
```

### Custom Port
```bash
# Run on custom port (e.g., 8080)
./docker-run.sh run -p 8080

# Or with docker-compose
docker-compose up -d
# Then access via http://localhost:3000
```

## 📊 Management Commands

The `docker-run.sh` script provides convenient commands:

```bash
# Build the Docker image
./docker-run.sh build

# Build and run the application
./docker-run.sh run

# Run development version
./docker-run.sh dev

# Stop the application
./docker-run.sh stop

# View logs
./docker-run.sh logs

# Open shell in container
./docker-run.sh shell

# Check application health
./docker-run.sh health

# Clean up (remove container and image)
./docker-run.sh clean

# Show help
./docker-run.sh help
```

### Script Options
```bash
# Run on custom port
./docker-run.sh run -p 8080

# Use custom container name
./docker-run.sh run -n my-repetitor-app
```

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Check if application is healthy
curl http://localhost:3000/health

# Expected response: "healthy"
```

### Container Logs
```bash
# View logs
docker logs repetitor-app

# Follow logs in real-time
docker logs -f repetitor-app

# Or use the management script
./docker-run.sh logs
```

### Container Shell Access
```bash
# Access container shell
docker exec -it repetitor-app /bin/sh

# Or use the management script
./docker-run.sh shell
```

### Resource Usage
```bash
# Monitor resource usage
docker stats repetitor-app

# Container information
docker inspect repetitor-app
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
./docker-run.sh run -p 8080
```

#### Build Failures
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t repetitor .
```

#### Container Won't Start
```bash
# Check container logs
docker logs repetitor-app

# Verify Docker daemon is running
docker info

# Check available disk space
df -h
```

#### Permission Issues (Linux)
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Restart shell session
newgrp docker
```

## 🔒 Security Considerations

### Production Deployment
- **HTTPS**: Use reverse proxy (nginx, Apache) with SSL certificates
- **Environment Variables**: Store sensitive data in environment variables
- **Container Updates**: Regularly update base images for security patches
- **User Permissions**: Container runs as non-root user
- **Network**: Use Docker networks to isolate containers

### Security Headers (Included)
- `X-Frame-Options`: Prevents clickjacking
- `X-XSS-Protection`: Enables XSS filtering
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `Content-Security-Policy`: Controls resource loading

## ⚡ Performance Optimization

### Image Size Optimization
- **Multi-stage build**: Reduces final image to ~25MB
- **Alpine Linux**: Minimal base image
- **Layer caching**: Optimized Dockerfile layer ordering

### Runtime Performance
- **Nginx**: Efficient static file serving
- **Gzip compression**: Reduces bandwidth usage
- **Asset caching**: Static files cached for 1 year
- **Health checks**: Automatic container restart on failure

### Build Speed
- **.dockerignore**: Excludes unnecessary files from build context
- **Layer caching**: Docker reuses unchanged layers
- **npm ci**: Faster, reliable dependency installation

## 🌐 Cloud Deployment

### Docker Hub
```bash
# Tag for Docker Hub
docker tag repetitor yourusername/repetitor:latest

# Push to Docker Hub
docker push yourusername/repetitor:latest

# Deploy anywhere
docker run -d -p 80:80 yourusername/repetitor:latest
```

### Cloud Platforms
- **AWS ECS**: Container orchestration service
- **Google Cloud Run**: Serverless container platform
- **Azure Container Instances**: Simple container hosting
- **DigitalOcean App Platform**: Easy container deployment

## 📈 Scaling

### Horizontal Scaling
```bash
# Run multiple instances
docker-compose up --scale repetitor=3

# Use load balancer (nginx, HAProxy)
# Configure reverse proxy for load distribution
```

### Resource Limits
```yaml
# docker-compose.yml
services:
  repetitor:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

## 🆘 Support

If you encounter issues:

1. Check this troubleshooting section
2. Review container logs: `./docker-run.sh logs`
3. Verify Docker installation: `docker --version`
4. Check available resources: `docker system df`
5. Clean up if needed: `./docker-run.sh clean`

For additional help, please create an issue in the project repository.