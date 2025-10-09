# מערכת מעקב כיבוי אש - קיבוץ גלאון

מערכת ניהול ומעקב מקיפה עבור תחום כיבוי האש בקיבוץ גלאון: צוותים זמינים, מתנדבים, פעילויות ושיפורים, משימות, תחזוקה, מיפוי ברזים וארונות ציוד ותיעוד אירועים.

## הרצה מקומית

דרישות מקדימות: Node.js 18+.

1. התקנת תלות:
   ```bash
   npm install
   ```
2. יצירת מסד נתונים (SQLite) ולקוח פריזמה:
   ```bash
   npm run prisma:push && npm run prisma:generate
   ```
3. הרצה:
   ```bash
   npm run dev
   ```
   השרת יעלה על פורט שיודפס למסוף, והממשק ב-`/`.

## API עיקרי

- `GET /api/teams`, `POST /api/teams` - ניהול צוותים
- `GET /api/volunteers`, `POST /api/volunteers` - ניהול מתנדבים זמינים
- `GET /api/activities`, `POST /api/activities` - מעקב פעילויות ושיפורים
- `GET /api/hydrants`, `POST /api/hydrants` - ניהול הידרנטים
- `GET /api/equipment-cabinets`, `POST /api/equipment-cabinets` - ניהול ארונות ציוד
- `GET /api/tasks`, `POST /api/tasks` - ניהול משימות ופרויקטי שיפור
- `GET /api/maintenance`, `POST /api/maintenance` - מעקב תחזוקה
- `GET /api/dashboard/stats` – סטטיסטיקות כלליות

## מבנה נתונים

כולל מודלים: `Team`, `Volunteer`, `Activity`, `Hydrant`, `EquipmentCabinet`, `Task`, `MaintenanceRecord`.

### תכונות חדשות:
- **מתנדבים זמינים** - ניהול מתנדבים עם מעקב התמחויות, כישורים וזמינות
- **פעילויות ושיפורים** - תיעוד אימונים, תרגילים, פגישות ופעולות חירום עם דגש על שיפור מתמיד
- **משימות לשיפור** - מערכת משימות מתקדמת כולל פרויקטי שיפור והתפתחות

## הערות

- קבצי סטטיים (UI מבוסס Leaflet) תחת `public/`.
- ברירת המחדל למסד הנתונים: קובץ `dev.db` (SQLite).
