# Google Sheets Integration Setup Guide

This guide will walk you through setting up Google Sheets integration for the Fire Project Tracker application. This enables importing and exporting data between your database and Google Sheets.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Create Google Cloud Project](#create-google-cloud-project)
3. [Enable Google Sheets API](#enable-google-sheets-api)
4. [Create OAuth 2.0 Credentials](#create-oauth-20-credentials)
5. [Download Credentials](#download-credentials)
6. [Configure Application](#configure-application)
7. [First-Time Authentication](#first-time-authentication)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- ✅ A Google account (Gmail or Google Workspace)
- ✅ Python dependencies installed (`pip install -r requirements.txt`)
- ✅ Access to Google Cloud Console
- ✅ Admin or Manager role in Fire Project Tracker

---

## Step 1: Create Google Cloud Project

### 1.1 Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. If this is your first time, accept the Terms of Service

### 1.2 Create New Project
1. Click the **project dropdown** at the top of the page (next to "Google Cloud")
2. Click **"NEW PROJECT"** button in the top-right
3. Fill in project details:
   - **Project name**: `Fire-Project-Tracker` (or your preferred name)
   - **Organization**: Leave as "No organization" (or select your org)
   - **Location**: Leave as default
4. Click **"CREATE"**
5. Wait for project creation (takes ~10 seconds)
6. Select your new project from the dropdown

**Screenshot locations:**
```
Top bar → Project dropdown → NEW PROJECT
```

---

## Step 2: Enable Google Sheets API

### 2.1 Navigate to API Library
1. In the left sidebar, click **"APIs & Services"** → **"Library"**
   - Or use direct link: https://console.cloud.google.com/apis/library
2. Ensure your project is selected (check top bar)

### 2.2 Enable Google Sheets API
1. In the search bar, type: `Google Sheets API`
2. Click on **"Google Sheets API"** from results
3. Click the **"ENABLE"** button
4. Wait for activation (~5 seconds)
5. You should see "API enabled" message

### 2.3 Enable Google Drive API (Required)
1. Click **"← APIs & Services"** in the breadcrumb
2. Click **"Library"** again
3. Search for: `Google Drive API`
4. Click **"Google Drive API"**
5. Click **"ENABLE"**

**Why Drive API?** Google Sheets files are stored in Google Drive, so this API is needed for file access.

---

## Step 3: Create OAuth 2.0 Credentials

### 3.1 Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
   - Direct link: https://console.cloud.google.com/apis/credentials/consent
2. Select **"External"** user type (unless you have Google Workspace)
3. Click **"CREATE"**

### 3.2 Fill OAuth Consent Information

**App Information:**
- **App name**: `Fire Project Tracker`
- **User support email**: Your email address
- **App logo**: (Optional) Upload your app logo

**App domain** (Optional for testing):
- **Application home page**: `http://localhost:3000`
- **Application privacy policy**: Leave blank for testing
- **Application terms of service**: Leave blank for testing

**Developer contact information:**
- **Email addresses**: Your email address

Click **"SAVE AND CONTINUE"**

### 3.3 Configure Scopes
1. Click **"ADD OR REMOVE SCOPES"**
2. Manually add these scopes:
   ```
   https://www.googleapis.com/auth/spreadsheets
   https://www.googleapis.com/auth/drive.file
   ```
3. Or select from the list:
   - `Google Sheets API` → `.../auth/spreadsheets` (See, edit, create, and delete all your Google Sheets spreadsheets)
   - `Google Drive API` → `.../auth/drive.file` (View and manage Google Drive files)
4. Click **"UPDATE"**
5. Click **"SAVE AND CONTINUE"**

### 3.4 Add Test Users (For Testing Phase)
1. Click **"ADD USERS"**
2. Add your Google account email
3. Add any other users who need to test (optional)
4. Click **"ADD"**
5. Click **"SAVE AND CONTINUE"**
6. Review summary and click **"BACK TO DASHBOARD"**

---

## Step 4: Create OAuth 2.0 Client ID

### 4.1 Navigate to Credentials
1. Go to **"APIs & Services"** → **"Credentials"**
   - Direct link: https://console.cloud.google.com/apis/credentials

### 4.2 Create Credentials
1. Click **"+ CREATE CREDENTIALS"** at the top
2. Select **"OAuth client ID"**

### 4.3 Configure OAuth Client
1. **Application type**: Select **"Desktop app"**
   - Why Desktop? We're using OAuth flow in backend Python application
2. **Name**: `Fire Tracker Backend Client`
3. Click **"CREATE"**

### 4.4 Save Client Information
- A popup will show your **Client ID** and **Client Secret**
- Click **"DOWNLOAD JSON"**
- Save the file as `credentials.json`

**⚠️ Important Security Notes:**
- Never commit `credentials.json` to Git
- Keep this file secure
- It contains sensitive authentication data

---

## Step 5: Download and Place Credentials

### 5.1 Rename Downloaded File
The downloaded file will be named something like:
```
client_secret_XXXXXXXXXXXXX.apps.googleusercontent.com.json
```

Rename it to:
```
credentials.json
```

### 5.2 Place in Backend Directory
Move the file to your backend directory:
```bash
# From your downloads folder
mv ~/Downloads/credentials.json /home/user/FireProjectTracker/backend/

# Or on Windows
# move C:\Users\YourName\Downloads\credentials.json C:\path\to\FireProjectTracker\backend\
```

### 5.3 Verify File Location
```bash
cd /home/user/FireProjectTracker/backend
ls -la credentials.json
```

You should see:
```
-rw-r--r-- 1 user user 452 Dec 5 12:00 credentials.json
```

### 5.4 Update .gitignore
Ensure your `.gitignore` includes:
```gitignore
# Google Sheets credentials
credentials.json
token.json
*.json
```

---

## Step 6: Configure Application

### 6.1 Update Environment Variables
Edit `/home/user/FireProjectTracker/backend/.env`:

```bash
# Google Sheets Integration
GOOGLE_SHEETS_ENABLED=True  # Change from False to True
GOOGLE_SHEETS_CREDENTIALS_FILE=credentials.json
GOOGLE_SHEETS_TOKEN_FILE=token.json
GOOGLE_SHEETS_DEFAULT_SPREADSHEET_ID=  # Optional: Add after creating test sheet
```

### 6.2 Install Python Dependencies
```bash
cd /home/user/FireProjectTracker/backend
pip install -r requirements.txt
```

Expected output:
```
Successfully installed google-auth-2.25.2 google-auth-oauthlib-1.2.0
google-auth-httplib2-0.2.0 google-api-python-client-2.107.0
```

---

## Step 7: First-Time Authentication

### 7.1 Run Authentication Test

Create a test script to verify authentication:

```bash
cd /home/user/FireProjectTracker/backend
python test_google_auth.py
```

*Note: The test script will be created in Phase 2 of implementation*

### 7.2 OAuth Flow
1. Script will open your browser automatically
2. You'll see Google sign-in page
3. Sign in with your Google account
4. **Warning**: "Google hasn't verified this app"
   - This is normal for testing
   - Click **"Advanced"**
   - Click **"Go to Fire Project Tracker (unsafe)"**
5. Review permissions and click **"Allow"**
6. Browser will show: "The authentication flow has completed"
7. Close browser tab
8. Check terminal - should see: "Authentication successful!"

### 7.3 Token File Created
After successful authentication, a `token.json` file is created:
```bash
ls -la token.json
```

This file contains:
- Access token (expires after 1 hour)
- Refresh token (used to get new access tokens)
- Token expiry timestamp

**⚠️ Security**: Never commit `token.json` to Git!

---

## Step 8: Create Test Google Sheet

### 8.1 Create New Sheet
1. Go to [Google Sheets](https://sheets.google.com/)
2. Click **"+ Blank"** to create new spreadsheet
3. Name it: `Fire Tracker Test Data`

### 8.2 Set Up Test Data Structure

**For Hydrants** (Sheet1):
```
A1: Serial Number | B1: Name | C1: Location | D1: Latitude | E1: Longitude | F1: Status
A2: H-001 | B2: Main St Hydrant | C2: 123 Main St | D2: 31.4117 | E2: 34.6667 | F2: operational
A3: H-002 | B3: Oak Ave Hydrant | C3: 456 Oak Ave | D3: 31.4200 | E3: 34.6700 | F3: maintenance
```

**For Equipment Cabinets** (Sheet2):
```
A1: Cabinet Number | B1: Name | C1: Location | D1: Latitude | E1: Longitude | F1: Status
A2: C-001 | B2: Station A Cabinet | C2: 789 Station Rd | D2: 31.4150 | E2: 34.6680 | F2: operational
```

### 8.3 Get Spreadsheet ID
The spreadsheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/1ABC_defGHI_jklMNO_pqrSTU_vwxYZ/edit
                                       ↑____________________↑
                                       This is your Spreadsheet ID
```

Copy the ID and add to `.env`:
```bash
GOOGLE_SHEETS_DEFAULT_SPREADSHEET_ID=1ABC_defGHI_jklMNO_pqrSTU_vwxYZ
```

### 8.4 Share Sheet (Important!)
1. Click **"Share"** button in top-right
2. Add your Google account email (the one used for OAuth)
3. Set permission: **"Editor"**
4. Click **"Send"**

---

## Step 9: Verify Setup

### 9.1 Checklist
- [x] Google Cloud Project created
- [x] Google Sheets API enabled
- [x] Google Drive API enabled
- [x] OAuth consent screen configured
- [x] OAuth 2.0 credentials created
- [x] `credentials.json` downloaded and placed in backend/
- [x] Python dependencies installed
- [x] `.env` file updated with `GOOGLE_SHEETS_ENABLED=True`
- [x] First authentication completed
- [x] `token.json` file created
- [x] Test Google Sheet created
- [x] Spreadsheet ID added to `.env`
- [x] Sheet shared with your account

### 9.2 File Structure Check
```
FireProjectTracker/
├── backend/
│   ├── .env (updated)
│   ├── .env.example (updated)
│   ├── credentials.json (downloaded from Google)
│   ├── token.json (generated after first auth)
│   └── requirements.txt (updated)
└── docs/
    └── GOOGLE_SHEETS_SETUP.md (this file)
```

---

## Troubleshooting

### Issue: "Access blocked: Fire Project Tracker hasn't completed verification"
**Solution:**
1. Go to OAuth consent screen in Google Cloud Console
2. Add your email as a Test User
3. While in testing mode, only test users can authenticate

### Issue: "The app is in testing mode"
**Solution:** This is normal! Your app stays in testing mode for development. To publish:
1. Complete OAuth verification process (not needed for internal use)
2. Or keep as "Testing" and add all users as test users

### Issue: "API has not been used in project XXX"
**Solution:**
1. Make sure both Sheets API and Drive API are enabled
2. Wait 1-2 minutes for activation to propagate
3. Try authentication again

### Issue: "Invalid client credentials"
**Solution:**
1. Re-download `credentials.json` from Google Cloud Console
2. Ensure file is named exactly `credentials.json`
3. Check file is in correct directory (`backend/`)

### Issue: "Token has been expired or revoked"
**Solution:**
1. Delete `token.json`
2. Run authentication again
3. New token will be generated

### Issue: "Insufficient permissions to access spreadsheet"
**Solution:**
1. Open the Google Sheet
2. Click "Share"
3. Add your Google account as Editor
4. Try import/export again

### Issue: "Module 'google' not found"
**Solution:**
```bash
pip install --upgrade google-auth google-auth-oauthlib google-api-python-client
```

---

## Security Best Practices

### For Development:
- ✅ Keep `credentials.json` and `token.json` in `.gitignore`
- ✅ Only add trusted users as test users
- ✅ Use OAuth 2.0 (never API keys for user data)
- ✅ Regularly rotate credentials

### For Production:
- ✅ Complete OAuth verification process
- ✅ Use service account instead of OAuth (for server-to-server)
- ✅ Store credentials in secure secrets manager (not .env files)
- ✅ Enable audit logging
- ✅ Set up IP restrictions
- ✅ Use minimal required scopes
- ✅ Implement rate limiting

---

## Next Steps

After completing this setup, you're ready for:
- **Phase 2**: Implement Google Sheets Service (backend/services/google_sheets_service.py)
- **Phase 3**: Create data mappers and validators
- **Phase 4**: Build import/export API endpoints
- **Phase 5**: Create frontend components

See the main project README for implementation details.

---

## Quick Reference

### Useful Links:
- Google Cloud Console: https://console.cloud.google.com/
- Google Sheets API Documentation: https://developers.google.com/sheets/api
- Python Quickstart: https://developers.google.com/sheets/api/quickstart/python
- OAuth 2.0 Scopes: https://developers.google.com/identity/protocols/oauth2/scopes

### Required Scopes:
```
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.file
```

### Environment Variables:
```bash
GOOGLE_SHEETS_ENABLED=True
GOOGLE_SHEETS_CREDENTIALS_FILE=credentials.json
GOOGLE_SHEETS_TOKEN_FILE=token.json
GOOGLE_SHEETS_DEFAULT_SPREADSHEET_ID=your-sheet-id-here
```

---

## Support

If you encounter issues not covered in this guide:
1. Check the [Google Sheets API documentation](https://developers.google.com/sheets/api)
2. Review the [OAuth 2.0 troubleshooting guide](https://developers.google.com/identity/protocols/oauth2/native-app#troubleshooting)
3. Check application logs for detailed error messages

---

**Last Updated**: December 5, 2025
**Version**: 1.0
**Author**: Fire Project Tracker Development Team
