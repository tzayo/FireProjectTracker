# User Authentication System

## Overview

The Fire Department Tracker now includes a comprehensive user authentication system with role-based access control (RBAC).

## Features

### Authentication
- **Login/Logout**: Secure username and password authentication
- **Session Management**: Persistent sessions using Flask-Login
- **Password Security**: Passwords are hashed using Werkzeug's security functions

### Role-Based Permissions

The system supports four user roles with different permission levels:

#### 1. Manager (מנהל)
- Full access to all system features
- Can create, read, update, and delete all resources
- Can manage users
- Highest level of permissions

#### 2. Commander (מפקד)
- Can view all resources
- Can create and update most resources
- Can delete resources (except users)
- Cannot manage system settings

#### 3. Member (חבר צוות)
- Can view all resources
- Can create new resources
- Can update resources
- Limited delete permissions
- Cannot delete critical resources

#### 4. Observer (צופה)
- Read-only access
- Can view all resources
- Cannot create, update, or delete any resources
- Perfect for monitoring and reporting

## Setup Instructions

### 1. Install Required Packages

```bash
cd backend
pip install -r requirements.txt
```

The new dependency added is `Flask-Login==0.6.3`.

### 2. Initialize Database

The database will be automatically created when you run the application. The User model includes:
- `username`: Unique username for login
- `password_hash`: Securely hashed password
- `name`: Full name in Hebrew
- `email`: Optional email address
- `role`: User role (manager, commander, member, observer)
- `is_active`: Whether the account is active
- `last_login`: Timestamp of last login

### 3. Create Default Users

Run the script to create default test users:

```bash
cd backend
python create_admin.py
```

This will create four default users:

| Username   | Password      | Role      |
|------------|---------------|-----------|
| admin      | admin123      | manager   |
| commander  | commander123  | commander |
| member     | member123     | member    |
| observer   | observer123   | observer  |

**⚠️ IMPORTANT**: Change these passwords in production!

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "name": "שם מלא",
  "email": "user@example.com",
  "role": "member"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Logout
```http
POST /api/auth/logout
```

#### Get Current User
```http
GET /api/auth/me
```

#### Check Authentication Status
```http
GET /api/auth/check
```

## Protected Routes

All API routes now require authentication. The following permission levels apply:

### Teams
- **GET**: All authenticated users
- **POST**: Manager, Commander
- **PUT**: Manager, Commander
- **DELETE**: Manager only

### Hydrants & Equipment Cabinets
- **GET**: All authenticated users
- **POST**: Manager, Commander, Member
- **PUT**: Manager, Commander, Member
- **DELETE**: Manager, Commander

### Tasks, Maintenance, Volunteers, Activities
- **GET**: All authenticated users
- **POST**: All authenticated users (create your own)
- **PUT**: All authenticated users (edit your own)
- **DELETE**: Role-dependent

### Dashboard & Statistics
- **GET**: All authenticated users

## Frontend Integration

### AuthContext

The frontend uses React Context API for managing authentication state:

```javascript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, logout, hasPermission, canCreate } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <p>Welcome, {user.name}</p>
      {canCreate() && <button>Create New Item</button>}
    </div>
  );
}
```

### Protected Components

Components automatically check authentication status. If not logged in, users see the login screen.

### API Calls

All API calls now include credentials:

```javascript
// Configured in api.js
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
```

## Security Considerations

### Production Deployment

1. **Change Default Passwords**: Immediately change or delete default test users
2. **Use HTTPS**: Always use HTTPS in production
3. **Secure Secret Key**: Set a strong `SECRET_KEY` in environment variables
4. **Session Security**: Configure session cookie settings for production:
   ```python
   app.config['SESSION_COOKIE_SECURE'] = True  # HTTPS only
   app.config['SESSION_COOKIE_HTTPONLY'] = True
   app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
   ```

### Password Policy

Consider implementing:
- Minimum password length (8+ characters)
- Password complexity requirements
- Password expiration
- Account lockout after failed attempts

## Troubleshooting

### Cannot Login
1. Ensure the backend server is running
2. Check that the database has been initialized
3. Verify default users were created with `create_admin.py`
4. Check browser console for CORS errors

### Permission Denied Errors
1. Verify your user role has sufficient permissions
2. Check the API endpoint's permission requirements
3. Ensure you're logged in (check `/api/auth/check`)

### Session Not Persisting
1. Ensure `withCredentials: true` is set in API calls
2. Verify CORS is configured with `supports_credentials=True`
3. Check browser cookie settings

## Testing

### Manual Testing

1. Start the backend:
   ```bash
   cd backend
   python app.py
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to `http://localhost:3000`
4. Login with any default user credentials
5. Test different role permissions by logging in with different users

### Role Permission Testing

- Login as **observer**: Verify you can only view data
- Login as **member**: Verify you can create and edit
- Login as **commander**: Verify you can delete items
- Login as **manager**: Verify you have full access

## Future Enhancements

Consider implementing:
- Two-factor authentication (2FA)
- Password reset functionality
- Email verification
- Audit logging for security events
- User management interface for admins
- Fine-grained permissions per resource
- API rate limiting
