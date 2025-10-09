# מערכת מעקב כיבוי אש - קיבוץ גלאון

מערכת ניהול ומעקב עבור תחום כיבוי האש בקיבוץ גלאון: צוותים זמינים, משימות, תחזוקה, מיפוי ברזים וארונות ציוד ותיעוד אירועים.

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

- `GET /api/teams`, `POST /api/teams`
- `GET /api/hydrants`, `POST /api/hydrants`
- `GET /api/cabinets`, `POST /api/cabinets`
- `GET /api/tasks`, `POST /api/tasks`
- `GET /api/incidents`, `POST /api/incidents`
- `GET /api/maintenance`, `POST /api/maintenance`
- `POST /api/tasks/generate-quarterly` – יצירת משימות רבעוניות אוטומטיות
- `GET /api/map/features` – GeoJSON למפה (ברזים+ארונות)

## מבנה נתונים (Prisma)

כולל מודלים: `Team`, `TeamMember`, `Hydrant`, `EquipmentCabinet`, `Task`, `Incident`, `Maintenance`.

## הערות

- קבצי סטטיים (UI מבוסס Leaflet) תחת `public/`.
- ברירת המחדל למסד הנתונים: קובץ `dev.db` (SQLite).
