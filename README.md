# 🚒 מערכת ניהול כיבוי אש - קיבוץ
## Fire Safety Management System - Complete Solution

---

## 🎯 סקירה

מערכת ניהול מקיפה לתשתיות כיבוי אש בקיבוץ, המאפשרת מעקב אחר ציוד, תחזוקה שוטפת, וניהול צוותי חירום.

### ✨ תכונות מרכזיות

- ✅ **ניהול הידרנטים** - מעקב מלא על כל ברזי הכיבוי עם GPS, לחץ מים, וסטטוס
- ✅ **ארונות ציוד** - ניהול מלאי מפורט כולל תאריכי פג תוקף
- ✅ **מפות אינטראקטיביות** - הצגה ויזואלית של כל הנכסים עם סימון צבעוני
- ✅ **התראות אוטומטיות** - על בדיקות, פג תוקף, ומשימות שעברו דדליין
- ✅ **חישובי קרבה** - זיהוי אוטומטי של ציוד קרוב (100 מטר)
- ✅ **ניהול משימות** - תכנון ומעקב אחר תחזוקה שוטפת
- ✅ **תמיכה בעברית** - ממשק מלא RTL
- ✅ **PWA Support** - עבודה אופליין ואפשרות התקנה כאפליקציה

---

## 🚀 התקנה מהירה

### דרישות מקדימות
- Python 3.8+
- Node.js 18+
- דפדפן מודרני

### התקנה

#### Backend (Flask/Python)
```bash
cd backend
pip install Flask flask-cors flask-sqlalchemy
python app.py
```
→ השרת עולה על http://localhost:5000

#### Frontend (React)
```bash
cd frontend
npm install
npm start
```
→ הממשק נפתח על http://localhost:3000

---

## 📚 מדריכים

- **[מדריך התחלה מהירה](QUICKSTART.md)** - התקנה והפעלה ב-5 דקות
- **[מדריך מלא](SYSTEM_GUIDE.md)** - תיעוד מקיף של כל התכונות
- **[API Reference](SYSTEM_GUIDE.md#api-reference)** - תיעוד מלא של כל ה-endpoints

---

## 🏗️ ארכיטקטורה

### Frontend (React)
- **React 18** - ממשק משתמש דינמי
- **React Router** - ניווט בין עמודים
- **Leaflet** - מפות אינטראקטיביות
- **Axios** - תקשורת עם השרת
- **Tailwind CSS** - עיצוב רספונסיבי
- **RTL Support** - תמיכה מלאה בעברית

### Backend (Python/Flask)
- **Flask** - שרת API
- **SQLAlchemy** - ORM למסד נתונים
- **SQLite** - מסד נתונים (ניתן לשדרג ל-PostgreSQL)
- **Flask-CORS** - תמיכה ב-Cross-Origin Requests

### Database Models
- **Hydrants** - הידרנטים עם GPS ומאפיינים טכניים
- **Equipment Cabinets** - ארונות ציוד
- **Equipment Items** - פריטי ציוד בודדים עם תאריכי פג תוקף
- **Tasks** - משימות מתוזמנות
- **Teams** - צוותי כיבוי
- **Volunteers** - מתנדבים
- **Activities** - פעילויות ואימונים
- **Maintenance Records** - תיעוד תחזוקה

---

## 🎨 ממשק המשתמש

### עמודים במערכת

1. **🏠 לוח בקרה** - סקירה כללית, מפה אינטראקטיבית, התראות
2. **👥 צוותים** - ניהול צוותי כיבוי וזמינות
3. **🚰 הידרנטים** - ניהול ברזי כיבוי + מפה
4. **🧰 ארונות ציוד** - ניהול ארונות + מלאי מפורט
5. **✓ משימות** - ניהול משימות תחזוקה
6. **🔧 תחזוקה** - תיעוד עבודות תחזוקה
7. **👤 מתנדבים** - ניהול מתנדבים וכישורים
8. **📋 פעילויות** - תיעוד אימונים ותרגילים

---

## 🔧 API Endpoints - סיכום

### Dashboard
- `GET /api/dashboard/stats` - סטטיסטיקות מלאות
- `GET /api/dashboard/alerts` - התראות פעילות

### Hydrants
- `GET /api/hydrants` - רשימת הידרנטים
- `POST /api/hydrants` - הוספת הידרנט
- `GET/PUT/DELETE /api/hydrants/:id` - ניהול הידרנט בודד
- `GET /api/hydrants/map` - GeoJSON למפות
- `GET /api/hydrants/:id/nearby-cabinets` - ארונות קרובים

### Equipment Cabinets
- `GET /api/equipment-cabinets` - רשימת ארונות
- `POST /api/equipment-cabinets` - הוספת ארון
- `GET/PUT/DELETE /api/equipment-cabinets/:id` - ניהול ארון
- `GET /api/cabinets/map` - GeoJSON למפות
- `GET /api/cabinets/:id/nearby-hydrants` - הידרנטים קרובים
- `GET /api/cabinets/:id/items` - פריטים בארון
- `POST /api/cabinets/:id/items` - הוספת פריט

### Equipment Items
- `GET/PUT/DELETE /api/equipment-items/:id` - ניהול פריט ציוד

### Tasks
- `GET /api/tasks` - רשימת משימות (עם פילטרים)
- `POST /api/tasks` - יצירת משימה
- `GET/PUT/DELETE /api/tasks/:id` - ניהול משימה

### Teams, Volunteers, Activities, Maintenance
- מלוא ה-CRUD operations לכל מודול

---

## 🔐 אבטחה (לפיתוח עתידי)

המערכת הנוכחית מיועדת לשימוש ברשת פנימית. להפעלה בסביבת production מומלץ להוסיף:

- אימות משתמשים (JWT/Session)
- הרשאות לפי תפקיד
- HTTPS
- הצפנת נתונים רגישים
- גיבויים אוטומטיים

---

## 📱 שימוש מובייל

המערכת מותאמת למכשירים ניידים:
- ממשק רספונסיבי
- תפריט המבורגר בנייד
- מפות אינטראקטיביות עובדות במובייל
- אפשרות התקנה כאפליקציה (PWA)

**להתקנה על הטלפון:**
1. פתח את האתר בדפדפן (Chrome/Safari)
2. לחץ על "הוסף למסך הבית" / "Install App"
3. האפליקציה תיפתח כאפליקציה רגילה

---

## 🛠️ פיתוח והרחבה

### הוספת שדות נוספים
ערוך את המודלים ב-`backend/app.py`

### הוספת API endpoints
הוסף routes ב-`backend/app.py`

### הוספת עמודים חדשים
1. צור קומפוננטה ב-`frontend/src/components/`
2. הוסף route ב-`frontend/src/App.js`
3. הוסף קישור בתפריט הניווט

---

## 📊 דוגמאות שימוש ב-API

### יצירת הידרנט חדש
```bash
curl -X POST http://localhost:5000/api/hydrants \
  -H "Content-Type: application/json" \
  -d '{
    "serial_number": "H-001",
    "name": "הידרנט מרכזי",
    "location": "ליד המועדון",
    "latitude": 31.4117,
    "longitude": 34.6667,
    "hydrant_type": "ground",
    "water_pressure": 5.5,
    "diameter": 4,
    "status": "operational"
  }'
```

### קבלת התראות פעילות
```bash
curl http://localhost:5000/api/dashboard/alerts
```

### חיפוש ארונות קרובים להידרנט
```bash
curl http://localhost:5000/api/hydrants/1/nearby-cabinets?max_distance=100
```

---

## 🎯 תכנון עתידי

רעיונות להרחבות:
- [ ] מערכת משתמשים מלאה עם הרשאות
- [ ] העלאת תמונות לענן
- [ ] ייצוא דוחות PDF/Excel
- [ ] התראות SMS/Email
- [ ] אפליקציה ניידת native
- [ ] אינטגרציה עם מערכות חיצוניות
- [ ] דשבורד אנליטי עם גרפים

---

## 📞 תמיכה

- 📖 [מדריך מהיר](QUICKSTART.md)
- 📚 [מדריך מלא](SYSTEM_GUIDE.md)
- 🐛 דיווח על באגים: פתח issue או פנה למנהל המערכת

---

**גרסה:** 2.0  
**מפותח עבור:** קיבוץ - מערכת ניהול כיבוי אש  
**טכנולוגיות:** React, Flask, SQLite, Leaflet  
**רישיון:** MIT  
**תאריך:** 2025-10-10

---

## 🙏 תודות

מערכת זו פותחה לשימוש קיבוצים וקהילות לניהול בטיחות ותשתיות כיבוי אש.  
תרמו, שפרו, והתאימו לצרכים שלכם!

