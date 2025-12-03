# 🐳 Docker Setup Guide

## Quick Start

```bash
# Start the entire system with one command
docker-compose up --build
```

Access:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## Common Commands

```bash
# Build and start services
docker-compose up --build

# Start services (after initial build)
docker-compose up

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild a specific service
docker-compose build frontend
docker-compose build backend

# Restart a service
docker-compose restart frontend
```

## Troubleshooting

### Error: "port is already allocated"

**Problem:** Port 3000 or 5000 is already in use.

**Solutions:**

1. **Find and stop the process using the port:**
   ```bash
   # On macOS/Linux
   sudo lsof -i :3000
   sudo lsof -i :5000

   # Kill the process
   sudo kill -9 <PID>
   ```

2. **Stop other Docker containers:**
   ```bash
   docker ps
   docker stop $(docker ps -q)
   ```

3. **Use different ports** - Edit `docker-compose.yml`:
   ```yaml
   frontend:
     ports:
       - "3001:3000"  # Changed from 3000:3000
   ```

### Error: "Cannot connect to the Docker daemon"

**Problem:** Docker isn't running.

**Solutions:**

- **macOS:** Open Docker Desktop from Applications
- **Linux:** `sudo systemctl start docker`
- **Windows:** Start Docker Desktop

Verify: `docker ps` should work without errors.

### Error: "no space left on device"

**Problem:** Docker has used too much disk space.

**Solution:**
```bash
# Clean up unused Docker resources
docker system prune -a

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune -a
```

### Services not communicating

**Problem:** Frontend can't reach backend.

**Solutions:**

1. **Check both containers are running:**
   ```bash
   docker-compose ps
   ```

2. **Check the network:**
   ```bash
   docker network ls
   docker network inspect fireprojecttracker_fire-tracker-network
   ```

3. **Update API URL** in frontend `.env`:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

### Hot reload not working

**Problem:** Code changes aren't reflected.

**Solutions:**

1. **For frontend** - Already configured with volume mounts and CHOKIDAR_USEPOLLING

2. **Restart the service:**
   ```bash
   docker-compose restart frontend
   ```

3. **Rebuild if necessary:**
   ```bash
   docker-compose up --build frontend
   ```

## Development Workflow

### Making Code Changes

1. Edit files locally
2. Changes are automatically reflected (volume mounts)
3. No need to rebuild unless you modify:
   - `package.json` (frontend)
   - `requirements.txt` (backend)
   - `Dockerfile` (either service)

### Installing New Dependencies

**Frontend:**
```bash
# Add to package.json, then rebuild
docker-compose build frontend
docker-compose up frontend
```

**Backend:**
```bash
# Add to requirements.txt, then rebuild
docker-compose build backend
docker-compose up backend
```

### Accessing Container Shell

```bash
# Frontend container
docker-compose exec frontend sh

# Backend container
docker-compose exec backend sh
```

## Architecture

```
docker-compose.yml
├── backend (Flask/Python)
│   ├── Port: 5000
│   ├── Network: fire-tracker-network
│   └── Volume: ./backend → /app
│
└── frontend (React/Node)
    ├── Port: 3000
    ├── Network: fire-tracker-network
    ├── Volume: ./frontend → /app
    └── Depends on: backend
```

## Environment Variables

### Backend
- `FLASK_ENV=development`
- `FLASK_DEBUG=1`

### Frontend
- `REACT_APP_API_URL=http://localhost:5000`
- `CHOKIDAR_USEPOLLING=true` (for hot reload)

## Production Considerations

For production deployment:

1. **Change ports in docker-compose.yml** if needed
2. **Update environment variables:**
   ```yaml
   FLASK_ENV=production
   FLASK_DEBUG=0
   ```
3. **Use production-ready WSGI server** (Gunicorn) for backend
4. **Build optimized frontend:**
   ```dockerfile
   RUN npm run build
   # Serve with nginx
   ```
5. **Add reverse proxy** (Nginx)
6. **Enable HTTPS**
7. **Set proper CORS origins**

## Alternative: Running Single Service

If you only want to run one service with Docker:

```bash
# Backend only
docker build -t fire-tracker-backend ./backend
docker run -p 5000:5000 -v $(pwd)/backend:/app fire-tracker-backend

# Frontend only
docker build -t fire-tracker-frontend ./frontend
docker run -p 3000:3000 -v $(pwd)/frontend:/app fire-tracker-frontend
```

## Useful Commands

```bash
# View resource usage
docker stats

# Clean everything (nuclear option)
docker-compose down -v
docker system prune -a --volumes

# Export/backup database
docker-compose exec backend sh -c "cp /app/fire_department.db /app/backup.db"

# Check service health
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
```

## Getting Help

- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- Rebuild from scratch: `docker-compose down && docker-compose up --build`
- Join containers: `docker-compose exec <service> sh`
