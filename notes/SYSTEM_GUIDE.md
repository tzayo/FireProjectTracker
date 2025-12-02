# מערכת ניהול כיבוי אש - מדריך מלא
## Fire Safety Management System - Complete Guide

---

## תוכן עניינים

1. [סקירה כללית](#סקירה-כללית)
2. [התקנה והפעלה](#התקנה-והפעלה)
3. [מודולים ותכונות](#מודולים-ותכונות)
4. [API Reference](#api-reference)
5. [מבנה מסד הנתונים](#מבנה-מסד-הנתונים)
6. [תרחישי שימוש](#תרחישי-שימוש)
7. [אבטחה והרשאות](#אבטחה-והרשאות)

---

## סקירה כללית

מערכת ניהול מקיפה לתשתיות כיבוי אש בקיבוץ, המאפשרת:
- מעקב אחר ציוד כיבוי (הידרנטים, ארונות ציוד)
- ניהול צוותי חירום ומתנדבים
- תחזוקה שוטפת ומשימות תקופתיות
- התראות אוטומטיות על פג תוקף וצורך בבדיקות
- מפות אינטראקטיביות להצגת כל הנכסים
- מעקב אחר פעילויות ואימונים

### עקרונות מרכזיים

✅ **פשטות** - ממשק אינטואיטיבי בעברית  
✅ **נגישות** - גישה ממכשירים ניידים  
✅ **ויזואליות** - מפות צבעוניות לזיהוי מהיר  
✅ **אמינות** - התראות אוטומטיות ומעקב מפורט

---

## התקנה והפעלה

### דרישות מקדימות

- Python 3.8+
- Node.js 18+
- npm או yarn

### התקנה

#### 1. Backend (Flask/Python)

```bash
cd backend
pip install -r requirements.txt
```

#### 2. Frontend (React)

```bash
cd frontend
npm install
```

### הפעלה

#### הפעלת Backend:

```bash
cd backend
python app.py
```
השרת יעלה על http://localhost:5000

#### הפעלת Frontend:

```bash
cd frontend
npm start
```
הממשק יהיה זמין על http://localhost:3000

---

## מודולים ותכונות

### 1. מודול ניהול צוותים

**תכונות:**
- רשימת צוותים עם מנהיגים וחברים
- מעקב זמינות (זמין/לא זמין/בחופשה)
- ניהול משמרות
- מצב חירום - הפעלת כל הצוותים

**API Endpoints:**
- `GET /api/teams` - קבלת כל הצוותים
- `POST /api/teams` - יצירת צוות חדש
- `PUT /api/teams/:id` - עדכון צוות
- `DELETE /api/teams/:id` - מחיקת צוות

### 2. מודול ניהול הידרנטים (ברזי כיבוי)

**מאפייני הידרנט:**
- מספר סידורי ייחודי (H-001, H-002...)
- מיקום GPS מדויק
- סוג: קרקעי / קיר / בור
- קוטר צינור (באינץ')
- לחץ מים נמדד (בבר)
- תאריך בדיקה אחרונה
- סטטוס: תקין ✅ | דורש תחזוקה ⚠️ | לא תקין ❌
- ארונות קרובים (חישוב אוטומטי)

**API Endpoints:**
- `GET /api/hydrants` - קבלת כל ההידרנטים
- `POST /api/hydrants` - יצירת הידרנט חדש
- `PUT /api/hydrants/:id` - עדכון הידרנט
- `DELETE /api/hydrants/:id` - מחיקת הידרנט
- `GET /api/hydrants/map` - GeoJSON להצגה במפה
- `GET /api/hydrants/:id/nearby-cabinets` - קבלת ארונות קרובים

**תכונות מיוחדות:**
- מפה אינטראקטיבית עם סימון צבעוני לפי סטטוס
- חישוב אוטומטי של ארונות במרחק עד 100 מטר
- התראות על הידרנטים שלא נבדקו 6 חודשים

### 3. מודול ניהול ארונות ציוד

**מאפייני ארון:**
- מספר ארון ייחודי (C-001, C-002...)
- מיקום GPS
- סוג: סטנדרטי / מורחב / חירום
- תאריך התקנה
- רשימת ציוד מפורטת
- הידרנטים קרובים (חישוב אוטומטי)

**פריטי ציוד בארון:**
- 🚰 זרנוקים (כמות, אורך)
- 🔫 מזנקים
- 🧯 מטפים (כמות, תאריך פג תוקף)
- 🔧 ברזים ומחברים
- 🦺 ציוד הגנה אישית

**API Endpoints:**
- `GET /api/equipment-cabinets` - קבלת כל הארונות
- `POST /api/equipment-cabinets` - יצירת ארון חדש
- `PUT /api/equipment-cabinets/:id` - עדכון ארון
- `DELETE /api/equipment-cabinets/:id` - מחיקת ארון
- `GET /api/cabinets/map` - GeoJSON להצגה במפה
- `GET /api/cabinets/:id/nearby-hydrants` - קבלת הידרנטים קרובים
- `GET /api/cabinets/:id/items` - קבלת פריטים בארון
- `POST /api/cabinets/:id/items` - הוספת פריט לארון
- `PUT /api/equipment-items/:id` - עדכון פריט
- `DELETE /api/equipment-items/:id` - מחיקת פריט

**התראות:**
- התראה 30 ימים לפני פג תוקף מטפים
- התראה על ציוד חסר או דורש החלפה

### 4. מודול ניהול משימות

**סוגי משימות:**
- בדיקה תקופתית
- תחזוקה מתוכננת
- תיקון דחוף
- שדרוג ציוד
- הדרכה/תרגיל

**מאפייני משימה:**
- כותרת ותיאור
- סוג משימה
- עדיפות: נמוכה / בינונית / גבוהה / קריטית
- סטטוס: חדש / בטיפול / ממתין / הושלם / בוטל
- אחראי מוקצה
- תאריך יעד
- קישור להידרנט/ארון
- קבצים מצורפים

**API Endpoints:**
- `GET /api/tasks` - קבלת משימות (עם פילטרים)
- `POST /api/tasks` - יצירת משימה
- `PUT /api/tasks/:id` - עדכון משימה
- `DELETE /api/tasks/:id` - מחיקת משימה

### 5. לוח בקרה מרכזי

**מידע מוצג:**
- סטטיסטיקות כלליות (צוותים, הידרנטים, ארונות, משימות)
- מפה אינטראקטיבית עם כל הנכסים
- התראות פעילות
- משימות דחופות
- סטטיסטיקות חודשיות

**API Endpoints:**
- `GET /api/dashboard/stats` - סטטיסטיקות מלאות
- `GET /api/dashboard/alerts` - התראות פעילות

---

## API Reference

### סיכום Endpoints

#### Teams (צוותים)
```
GET    /api/teams
POST   /api/teams
GET    /api/teams/:id
PUT    /api/teams/:id
DELETE /api/teams/:id
```

#### Hydrants (הידרנטים)
```
GET    /api/hydrants
POST   /api/hydrants
GET    /api/hydrants/:id
PUT    /api/hydrants/:id
DELETE /api/hydrants/:id
GET    /api/hydrants/map (GeoJSON)
GET    /api/hydrants/:id/nearby-cabinets
```

#### Equipment Cabinets (ארונות ציוד)
```
GET    /api/equipment-cabinets
POST   /api/equipment-cabinets
GET    /api/equipment-cabinets/:id
PUT    /api/equipment-cabinets/:id
DELETE /api/equipment-cabinets/:id
GET    /api/cabinets/map (GeoJSON)
GET    /api/cabinets/:id/nearby-hydrants
GET    /api/cabinets/:id/items
POST   /api/cabinets/:id/items
```

#### Equipment Items (פריטי ציוד)
```
GET    /api/equipment-items/:id
PUT    /api/equipment-items/:id
DELETE /api/equipment-items/:id
```

#### Tasks (משימות)
```
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

#### Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/alerts
```

---

## מבנה מסד הנתונים

### טבלת `hydrants` (הידרנטים)

| שדה | סוג | תיאור |
|-----|-----|-------|
| id | Integer | מזהה ייחודי |
| serial_number | String(50) | מספר סידורי ייחודי (H-001) |
| name | String(100) | שם ההידרנט |
| location | String(200) | תיאור מיקום |
| latitude | Float | קו רוחב GPS |
| longitude | Float | קו אורך GPS |
| hydrant_type | String(20) | ground/wall/pit |
| diameter | Float | קוטר צינור באינץ' |
| water_pressure | Float | לחץ מים בבר |
| status | String(20) | operational/needs_maintenance/broken |
| last_inspection_date | DateTime | תאריך בדיקה אחרונה |
| images | Text (JSON) | מערך תמונות |
| nearby_cabinets | Text (JSON) | ארונות קרובים |
| notes | Text | הערות |

### טבלת `equipment_cabinets` (ארונות ציוד)

| שדה | סוג | תיאור |
|-----|-----|-------|
| id | Integer | מזהה ייחודי |
| cabinet_number | String(50) | מספר ארון ייחודי (C-001) |
| name | String(100) | שם הארון |
| location | String(200) | תיאור מיקום |
| latitude | Float | קו רוחב GPS |
| longitude | Float | קו אורך GPS |
| cabinet_type | String(20) | standard/extended/emergency |
| installation_date | DateTime | תאריך התקנה |
| status | String(20) | ready/needs_check/incomplete |
| last_inspection_date | DateTime | תאריך בדיקה אחרונה |
| image | Text | URL תמונה |
| nearby_hydrants | Text (JSON) | הידרנטים קרובים |
| notes | Text | הערות |

### טבלת `equipment_items` (פריטי ציוד)

| שדה | סוג | תיאור |
|-----|-----|-------|
| id | Integer | מזהה ייחודי |
| cabinet_id | Integer | FK לארון |
| item_type | String(50) | hose/nozzle/extinguisher/valve/ppe |
| item_name | String(100) | שם הפריט |
| quantity | Integer | כמות |
| length | Float | אורך (לזרנוקים, במטרים) |
| expiry_date | DateTime | תאריך פג תוקף (למטפים) |
| status | String(20) | good/needs_replacement/missing |
| last_check_date | DateTime | תאריך בדיקה אחרונה |
| notes | Text | הערות |

### טבלת `tasks` (משימות)

| שדה | סוג | תיאור |
|-----|-----|-------|
| id | Integer | מזהה ייחודי |
| title | String(200) | כותרת |
| description | Text | תיאור מפורט |
| task_type | String(50) | inspection/maintenance/repair/upgrade/training |
| priority | String(20) | low/medium/high/critical |
| status | String(20) | new/in_progress/waiting/completed/cancelled |
| assigned_to | String(100) | שם האחראי |
| created_by | String(100) | שם היוצר |
| due_date | DateTime | תאריך יעד |
| completed_at | DateTime | תאריך השלמה |
| hydrant_id | Integer | FK להידרנט (אופציונלי) |
| cabinet_id | Integer | FK לארון (אופציונלי) |
| location_latitude | Float | GPS אופציונלי |
| location_longitude | Float | GPS אופציונלי |
| attachments | Text (JSON) | קבצים מצורפים |

---

## תרחישי שימוש

### תרחיש 1: דיווח על הידרנט לא תקין

1. חבר צוות מזהה בעיה בהידרנט
2. נכנס למערכת → לוחץ על "הידרנטים"
3. מוצא את ההידרנט ברשימה או במפה
4. לוחץ "ערוך"
5. משנה סטטוס ל"דורש תחזוקה" או "לא תקין"
6. מוסיף הערות על הבעיה
7. שומר

**תוצאה:**
- ההידרנט מסומן באדום/צהוב במפה
- נוצרת התראה אוטומטית במערכת
- מופיע בדשבורד תחת "דורש תשומת לב"

### תרחיש 2: הוספת ארון ציוד חדש

1. מנהל נכנס ל"ארונות ציוד"
2. לוחץ "+ הוסף ארון"
3. ממלא:
   - מספר ארון: C-007
   - שם: ארון ליד חדר האוכל
   - מיקום: ליד הכניסה הראשית
   - קואורדינטות GPS
   - סוג: סטנדרטי
4. שומר
5. נכנס לתכולת הארון (כפתור "תכולה")
6. מוסיף פריטים:
   - 2x זרנוק 25 מטר
   - 1x זרנוק 15 מטר
   - 2x מטף אבקה 6 ק"ג (+ תאריך פג תוקף)
   - מזנקים, ברזים, כפפות

**תוצאה:**
- הארון מופיע במפה
- מחושבים אוטומטית הידרנטים קרובים
- התראות אוטומטיות על מטפים שפגים

### תרחיש 3: מצב חירום - שריפה

1. מפקד פותח את המערכת
2. נכנס ללוח הבקרה
3. רואה במפה את כל ההידרנטים והארונות
4. מזהה את ההידרנטים הקרובים ביותר למיקום השריפה
5. רואה אילו ארונות ציוד נמצאים בקרבת מקום
6. צוות מגיע עם המידע המדויק

---

## מערכת התראות

### התראות אוטומטיות

המערכת בודקת ומתריעה על:

1. **הידרנטים שלא נבדקו**
   - כל הידרנט שלא נבדק 5.5 חודשים
   - רמת חומרה: warning

2. **מטפים פג תוקף**
   - 30 ימים לפני פג תוקף: warning
   - לאחר פג תוקף: critical

3. **משימות שעברו דדליין**
   - משימות בעדיפות גבוהה/קריטית: critical
   - משימות רגילות: warning

4. **ציוד חסר או דורש החלפה**
   - פריט עם סטטוס missing/needs_replacement

### צפייה בהתראות

התראות מופיעות:
- בלוח הבקרה (פאנל עליון)
- ב-API: `GET /api/dashboard/alerts`

כל התראה כוללת:
```json
{
  "type": "hydrant_inspection | equipment_expiry | task_overdue",
  "severity": "warning | critical",
  "item_id": 123,
  "item_name": "שם הפריט",
  "message": "הודעה מפורטת"
}
```

---

## תכונות מתקדמות

### חישובי קרבה (Proximity)

המערכת מחשבת אוטומטית:
- לכל הידרנט → ארונות במרחק עד 100 מטר
- לכל ארון → הידרנטים במרחק עד 100 מטר

**שימוש:**
```javascript
// קבלת ארונות קרובים להידרנט
GET /api/hydrants/5/nearby-cabinets?max_distance=100

// תשובה:
[
  {
    "id": 7,
    "name": "ארון ליד בית ילדים",
    "distance": 18.5,
    "latitude": 31.4120,
    "longitude": 34.6670
  }
]
```

### מפות GeoJSON

עבור הצגה במפות Leaflet/Mapbox:

```javascript
// הידרנטים
GET /api/hydrants/map

// ארונות
GET /api/cabinets/map

// מבנה GeoJSON:
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "id": 1,
        "name": "...",
        "status": "...",
        ...
      }
    }
  ]
}
```

---

## הרחבות עתידיות (מומלצות)

### 1. אימות משתמשים
- התחברות עם שם משתמש וסיסמה
- הרשאות לפי תפקיד (מנהל/מפקד/חבר צוות/צופה)

### 2. התראות Push
- התראות בזמן אמת למשתמשים
- SMS במצבי חירום
- אימייל אוטומטי

### 3. דוחות
- ייצוא PDF/Excel
- דוח בדיקות חודשי
- גרפים ומגמות

### 4. PWA (Progressive Web App)
- עבודה אופליין
- התקנה כאפליקציה על הטלפון
- סנכרון אוטומטי

### 5. תמונות והעלאות
- העלאת תמונות להידרנטים וארונות
- אחסון בענן (S3/Cloud Storage)

---

## טיפים לשימוש

### הוספת נתונים ראשוניים

כדי להתחיל, מומלץ:
1. להוסיף קודם את הצוותים
2. להוסיף את ההידרנטים עם קואורדינטות GPS
3. להוסיף את הארונות עם קואורדינטות GPS
4. להוסיף פריטי ציוד לכל ארון
5. ליצור משימות בדיקה תקופתיות

### שימוש במפה

- לחצו על סמנים (markers) לצפייה בפרטים
- צבעים מסמנים סטטוס:
  - 🟢 ירוק = תקין
  - 🟡 צהוב = דורש תשומת לב
  - 🔴 אדום = בעיה דורשת טיפול מיידי

### ניהול תחזוקה

1. בדקו את לוח הבקרה מדי יום
2. שימו לב להתראות
3. הקצו משימות לחברי צוות
4. עדכנו סטטוס משימות לאחר ביצוע
5. תעדו תחזוקה שבוצעה במודול התחזוקה

---

## פתרון בעיות נפוצות

### הידרנט לא מופיע במפה
- ודאו שהזנתם קואורדינטות GPS
- בדקו שהקואורדינטות תקינות (latitude: ~31.4, longitude: ~34.7 לאזור)

### שגיאה בשמירת נתונים
- ודאו שכל השדות החובה מולאו (*)
- מספרים סידוריים חייבים להיות ייחודיים

### התראות לא מופיעות
- ודאו שהזנתם תאריכי בדיקה/פג תוקף
- רעננו את הדף

---

## תמיכה ועדכונים

לשאלות, בעיות או הצעות לשיפור:
- פנו למנהל המערכת בקיבוץ
- תעדו בעיות במערכת המשימות

---

**גרסה:** 2.0  
**תאריך עדכון:** 2025-10-10  
**מפותח עבור:** קיבוץ - מערכת ניהול כיבוי אש

