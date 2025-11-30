# Archived TypeScript Backend

**Date Archived:** 2025-11-30
**Reason:** Consolidating to single Flask backend

## What's Archived Here

This directory contains the incomplete TypeScript/Express backend implementation that was archived in favor of the feature-complete Flask/Python backend.

### Archived Components

- **src/** - Express/TypeScript server code (187 lines)
  - `server.ts` - Main Express server
  - `types.ts` - TypeScript type definitions

- **prisma/** - Prisma ORM configuration
  - `schema.prisma` - Database schema
  - `dev.db` - SQLite database (72KB)

- **package.json** - TypeScript backend dependencies
- **package-lock.json** - Locked dependency versions
- **tsconfig.json** - TypeScript compiler configuration

### Why Archived?

The TypeScript backend was an incomplete migration attempt with only 15 endpoints vs Flask's 23 endpoints. Key missing features:

- ❌ No EquipmentItem model
- ❌ No Volunteer model
- ❌ No Activity model
- ❌ No GPS proximity calculations
- ❌ No alert system
- ❌ No dashboard statistics

The Flask backend (backend/app.py) is production-ready with all features implemented and integrated with the frontend.

### Restoration

If you need to restore this backend:

```bash
# From the archive directory
cp -r src ../
cp -r prisma ../
cp package.json package-lock.json tsconfig.json ../
cd ..
npm install
```

**Note:** You'll need to complete the missing features and update the frontend API integration.

---

**Archived by:** Claude Code
**Project:** Fire Safety Management System - Kibbutz Galon
