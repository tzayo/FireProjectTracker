# 🚒 Fire Safety Management System - Kibbutz
## Complete Solution for Fire Department Management

---

## 🎯 Overview

A comprehensive management system for fire safety infrastructure in kibbutz communities, enabling equipment tracking, routine maintenance, and emergency team management.

### ✨ Key Features

- ✅ **Hydrant Management** - Complete tracking of all fire hydrants with GPS, water pressure, and status
- ✅ **Equipment Cabinets** - Detailed inventory management including expiration dates
- ✅ **Interactive Maps** - Visual display of all assets with color-coded markers
- ✅ **Automated Alerts** - For inspections, expiration dates, and overdue tasks
- ✅ **Proximity Calculations** - Automatic identification of nearby equipment (100 meters)
- ✅ **Task Management** - Planning and tracking routine maintenance
- ✅ **Hebrew Support** - Full RTL interface
- ✅ **PWA Support** - Offline functionality and app installation

---

## 🚀 Quick Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- Modern web browser
- Docker & Docker Compose (optional, recommended)

### Installation

#### Method 1: Docker (Recommended) 🐳
The easiest and fastest way to run the system:

```bash
# First time setup (builds containers)
docker-compose up --build

# Regular startup (after initial build)
docker-compose up

# Run in background
docker-compose up -d

# Stop the system
docker-compose down
```

**Common Docker Issues:**
- If you get "port is already allocated" error, ensure no other process is using ports 3000 or 5000
- Check Docker is running: `docker ps`
- **macOS:** If you get "Cannot connect to the Docker daemon", launch Docker Desktop from Applications

→ Frontend opens at http://localhost:3000
→ Backend API available at http://localhost:5000

#### Method 2: Automated Installation
```bash
./start-system.sh
```
The script will install all dependencies and start the system automatically.

#### Method 3: Manual Installation

**Backend (Flask/Python)**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment (optional for development)
cp .env.example .env
# Edit .env with your settings

python app.py
```
→ Server runs on http://localhost:5000

**Frontend (React)**
```bash
cd frontend
npm install

# Configure environment (optional)
cp .env.example .env
# Edit .env if you need custom API URL

npm start
```
→ Interface opens at http://localhost:3000

### ⚙️ Configuration

The system uses `.env` files for configuration:

- **Backend:** `backend/.env` - Server settings, database, CORS
- **Frontend:** `frontend/.env` - API address, map settings

See [SECURITY.md](SECURITY.md) for detailed security settings information.

---

## 📚 Guides

- **[Quick Start Guide](QUICKSTART.md)** - Installation and setup in 5 minutes
- **[Complete Guide](SYSTEM_GUIDE.md)** - Comprehensive documentation of all features
- **[API Reference](SYSTEM_GUIDE.md#api-reference)** - Full documentation of all endpoints
- **[Docker Guide](DOCKER.md)** - Docker setup and troubleshooting

---

## 🏗️ Architecture

### Frontend (React)
- **React 18** - Dynamic user interface
- **React Router** - Page navigation
- **Leaflet** - Interactive maps
- **Axios** - Server communication
- **Tailwind CSS** - Responsive design
- **RTL Support** - Full Hebrew support

### Backend (Python/Flask)
- **Flask** - API server
- **SQLAlchemy** - Database ORM
- **SQLite** - Database (can upgrade to PostgreSQL)
- **Flask-CORS** - Cross-Origin Request support

> **Note:** An incomplete TypeScript/Express backend implementation has been archived in `/archive` folder. The Flask backend is the official, production-ready implementation with all features.

### Database Models
- **Hydrants** - Fire hydrants with GPS and technical specifications
- **Equipment Cabinets** - Equipment storage locations
- **Equipment Items** - Individual equipment items with expiration dates
- **Tasks** - Scheduled maintenance tasks
- **Teams** - Fire response teams
- **Volunteers** - Volunteer management
- **Activities** - Training and drills
- **Maintenance Records** - Maintenance documentation

---

## 🎨 User Interface

### System Pages

1. **🏠 Dashboard** - Overview, interactive map, alerts
2. **👥 Teams** - Fire team management and availability
3. **🚰 Hydrants** - Fire hydrant management + map
4. **🧰 Equipment Cabinets** - Cabinet management + detailed inventory
5. **✓ Tasks** - Maintenance task management
6. **🔧 Maintenance** - Maintenance work documentation
7. **👤 Volunteers** - Volunteer and skills management
8. **📋 Activities** - Training and drill documentation

---

## 🔧 API Endpoints - Summary

### Dashboard
- `GET /api/dashboard/stats` - Complete statistics
- `GET /api/dashboard/alerts` - Active alerts

### Hydrants
- `GET /api/hydrants` - List hydrants
- `POST /api/hydrants` - Add hydrant
- `GET/PUT/DELETE /api/hydrants/:id` - Manage individual hydrant
- `GET /api/hydrants/map` - GeoJSON for maps
- `GET /api/hydrants/:id/nearby-cabinets` - Nearby cabinets

### Equipment Cabinets
- `GET /api/equipment-cabinets` - List cabinets
- `POST /api/equipment-cabinets` - Add cabinet
- `GET/PUT/DELETE /api/equipment-cabinets/:id` - Manage cabinet
- `GET /api/cabinets/map` - GeoJSON for maps
- `GET /api/cabinets/:id/nearby-hydrants` - Nearby hydrants
- `GET /api/cabinets/:id/items` - Items in cabinet
- `POST /api/cabinets/:id/items` - Add item

### Equipment Items
- `GET/PUT/DELETE /api/equipment-items/:id` - Manage equipment item

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `POST /api/tasks` - Create task
- `GET/PUT/DELETE /api/tasks/:id` - Manage task

### Teams, Volunteers, Activities, Maintenance
- Full CRUD operations for each module

---

## 🔐 Security

### Development (Current State)
- ✅ CORS configured via environment variables
- ✅ Debug mode can be disabled
- ✅ Secret key can be configured
- ⚠️ No authentication system (infrastructure exists)
- ⚠️ SQLite not suitable for production

### Production (Required Before Deployment)
The current system is designed for development. For production deployment:

**Critical:**
- [ ] Set random and strong SECRET_KEY
- [ ] FLASK_DEBUG=False
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set CORS_ORIGINS to specific domain
- [ ] Enable HTTPS

**Important:**
- [ ] Implement authentication system (JWT)
- [ ] Add rate limiting
- [ ] Add input validation
- [ ] Set up automated backups

**Recommended:**
- [ ] Use Gunicorn/uWSGI
- [ ] Reverse proxy (Nginx)
- [ ] Monitoring and logging
- [ ] Security headers

📖 **Read [SECURITY.md](SECURITY.md) for complete guide**

---

## 📱 Mobile Usage

The system is optimized for mobile devices:
- Responsive interface
- Hamburger menu on mobile
- Interactive maps work on mobile
- Can be installed as app (PWA)

**To install on phone:**
1. Open the site in browser (Chrome/Safari)
2. Click "Add to Home Screen" / "Install App"
3. The app will open like a regular application

---

## 🛠️ Development and Extension

### Adding Additional Fields
Edit models in `backend/app.py`

### Adding API Endpoints
Add routes in `backend/app.py`

### Adding New Pages
1. Create component in `frontend/src/components/`
2. Add route in `frontend/src/App.js`
3. Add link in navigation menu

---

## 📊 API Usage Examples

### Create New Hydrant
```bash
curl -X POST http://localhost:5000/api/hydrants \
  -H "Content-Type: application/json" \
  -d '{
    "serial_number": "H-001",
    "name": "Central Hydrant",
    "location": "Near the club",
    "latitude": 31.4117,
    "longitude": 34.6667,
    "hydrant_type": "ground",
    "water_pressure": 5.5,
    "diameter": 4,
    "status": "operational"
  }'
```

### Get Active Alerts
```bash
curl http://localhost:5000/api/dashboard/alerts
```

### Search for Cabinets Near Hydrant
```bash
curl http://localhost:5000/api/hydrants/1/nearby-cabinets?max_distance=100
```

---

## 🎯 Future Planning

Ideas for extensions:
- [ ] Full user system with permissions
- [ ] Cloud image upload
- [ ] PDF/Excel report export
- [ ] SMS/Email alerts
- [ ] Native mobile application
- [ ] Integration with external systems
- [ ] Analytics dashboard with charts

---

## 📞 Support

- 📖 [Quick Guide](QUICKSTART.md)
- 📚 [Complete Guide](SYSTEM_GUIDE.md)
- 🐳 [Docker Guide](DOCKER.md)
- 🐛 Bug reports: Open an issue or contact system administrator

---

**Version:** 2.0
**Developed for:** Kibbutz - Fire Safety Management System
**Technologies:** React, Flask, SQLite, Leaflet
**License:** MIT
**Date:** 2025-10-10

---

## 🙏 Acknowledgments

This system was developed for kibbutz communities and communities to manage fire safety and infrastructure.
Contribute, improve, and adapt to your needs!
