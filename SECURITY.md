# Security Guide

## Overview

This document outlines security considerations and best practices for deploying the Fire Safety Management System.

## ⚠️ Current Security Status

### Development (Current)
- ✅ CORS configured with environment variables
- ✅ Debug mode configurable (defaults to False)
- ✅ Secret key configurable
- ⚠️ No authentication system (ready framework exists)
- ⚠️ SQLite database (not suitable for production)

### Production Requirements
Before deploying to production, you **MUST** complete these security tasks:

## 🔒 Production Security Checklist

### 1. Environment Configuration ✅ (Completed)

- [x] Create `.env` file from `.env.production.example`
- [x] Configure CORS origins to specific domains
- [x] Disable debug mode
- [ ] Generate secure secret key
- [ ] Configure production database (PostgreSQL)

**Generate a secure secret key:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Update in `.env`:
```bash
SECRET_KEY=<generated-key-here>
FLASK_DEBUG=False
FLASK_ENV=production
```

### 2. CORS Security ✅ (Partially Complete)

**Current:** CORS origins are configurable via environment variable

**Production setup:**
```bash
# In backend/.env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Do NOT use:**
- `*` (allows all origins)
- `http://` in production (use HTTPS only)

### 3. Authentication & Authorization ⚠️ (Not Implemented)

**Current Status:**
- User model exists in database (`backend/app.py:377`)
- No login/logout endpoints
- No token generation
- No route protection

**TODO - High Priority:**
```python
# Recommended: Implement JWT authentication
pip install PyJWT Flask-JWT-Extended

# Add endpoints:
# POST /api/auth/login
# POST /api/auth/logout
# POST /api/auth/refresh
# GET /api/auth/me

# Protect routes with @jwt_required()
```

### 4. Database Security

**Development:** SQLite (single file, not suitable for production)

**Production:** PostgreSQL (required)

```bash
# Install PostgreSQL driver
pip install psycopg2-binary

# Update .env
DATABASE_URL=postgresql://user:password@localhost:5432/fire_department
```

**Database security best practices:**
- Use strong passwords
- Limit database user permissions
- Enable SSL/TLS for database connections
- Regular automated backups
- Encrypt sensitive data at rest

### 5. HTTPS/SSL Configuration

**Required for production:**

```nginx
# Nginx reverse proxy configuration
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

### 6. Input Validation

**Current:** Basic Flask validation only

**TODO - Medium Priority:**
```bash
pip install marshmallow flask-marshmallow
```

Add schema validation for all POST/PUT endpoints to prevent:
- SQL injection (mitigated by SQLAlchemy ORM)
- XSS attacks
- Invalid data types
- Required field validation

### 7. Rate Limiting

**Current:** No rate limiting

**TODO - Medium Priority:**
```bash
pip install Flask-Limiter
```

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/hydrants', methods=['POST'])
@limiter.limit("10 per minute")
def create_hydrant():
    # ...
```

### 8. Logging & Monitoring

**Current:** No structured logging

**TODO - High Priority:**
```python
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
handler = RotatingFileHandler('app.log', maxBytes=10000000, backupCount=5)
handler.setLevel(logging.INFO)
formatter = logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
)
handler.setFormatter(formatter)
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)

# Log all errors
@app.errorhandler(Exception)
def handle_exception(e):
    app.logger.error(f'Unhandled exception: {str(e)}')
    return jsonify({'error': 'Internal server error'}), 500
```

### 9. Security Headers

**TODO - Medium Priority:**
```bash
pip install flask-talisman
```

```python
from flask_talisman import Talisman

Talisman(app,
    force_https=True,
    strict_transport_security=True,
    content_security_policy={
        'default-src': "'self'",
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"]
    }
)
```

### 10. Backup Strategy

**Production requirements:**
- Daily automated database backups
- Off-site backup storage
- Backup encryption
- Regular restore testing

```bash
#!/bin/bash
# Example backup script
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump fire_department > /backups/db_$DATE.sql
gpg --encrypt /backups/db_$DATE.sql
```

## 🛡️ Security Best Practices

### Code Security
- ✅ Use parameterized queries (SQLAlchemy ORM)
- ✅ Escape user input (Flask auto-escaping)
- ❌ Validate all inputs
- ❌ Sanitize file uploads (when implemented)
- ❌ Implement CSRF protection

### Deployment Security
- [ ] Use a production WSGI server (Gunicorn, uWSGI)
- [ ] Run behind reverse proxy (Nginx, Apache)
- [ ] Use firewall (allow only necessary ports)
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Monitor for suspicious activity

### Data Security
- [ ] Encrypt sensitive data
- [ ] Use HTTPS everywhere
- [ ] Secure password storage (bcrypt)
- [ ] Regular database backups
- [ ] Access logs and audit trails

## 🚨 Known Security Issues

### Critical
1. **No authentication** - Anyone can access and modify data
2. **SQLite in production** - Not suitable for concurrent users
3. **No rate limiting** - Vulnerable to DoS attacks

### High
4. **No input validation** - Potential for invalid data
5. **No security headers** - Missing XSS/clickjacking protection
6. **No audit logging** - Cannot track who made changes

### Medium
7. **No CSRF protection** - Vulnerable to cross-site request forgery
8. **File upload security** - Image upload not yet implemented securely

## 📞 Security Incident Response

If you discover a security vulnerability:

1. **Do not** disclose publicly
2. Document the vulnerability
3. Contact system administrator
4. Implement fix in development
5. Test thoroughly
6. Deploy to production
7. Document in changelog

## 🔄 Security Update Schedule

- **Dependencies:** Check monthly
- **Security patches:** Apply within 48 hours
- **Penetration testing:** Annually
- **Security audit:** Quarterly

---

**Last Updated:** 2025-11-30
**Security Status:** Development - Not production ready
**Next Review:** Before production deployment
