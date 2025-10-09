# הוראות התקנה והפעלה - מערכת מעקב כיבוי אש

## 📋 דרישות מקדימות

- Python 3.8 ומעלה
- Node.js 18 ומעלה
- npm או yarn

---

## 🚀 התקנה מהירה

### שלב 1: התקנת תלויות Backend

```bash
cd backend
pip3 install -r requirements.txt
```

או באופן ידני:
```bash
pip3 install Flask==3.0.0 Flask-SQLAlchemy==3.1.1 Flask-CORS==4.0.0 SQLAlchemy==2.0.23
```

### שלב 2: יצירת מסד נתונים

```bash
cd backend
python3 -c "from app import app, db; app.app_context().push(); db.create_all(); print('Database created!')"
```

זה יצור את הטבלאות:
- ✅ Team (צוותים)
- ✅ Volunteer (מתנדבים) - **חדש!**
- ✅ Activity (פעילויות) - **חדש!**
- ✅ Hydrant (הידרנטים)
- ✅ EquipmentCabinet (ארונות ציוד)
- ✅ Task (משימות)
- ✅ MaintenanceRecord (תחזוקה)

### שלב 3: התקנת תלויות Frontend

```bash
cd frontend
npm install
```

---

## ▶️ הרצת המערכת

### אופציה 1: שני טרמינלים נפרדים

**Terminal 1 - Backend:**
```bash
cd backend
python3 app.py
```
השרת יעלה על: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
הממשק יעלה על: `http://localhost:3000`

### אופציה 2: שימוש בסקריפט ההפעלה (אם קיים)

```bash
./start.sh
```

---

## 🧪 בדיקת התקנה

### בדיקת Backend

```bash
cd backend
python3 -c "
from app import app, db, Volunteer, Activity
print('✅ All models loaded successfully!')
print('Volunteer columns:', list(Volunteer.__table__.columns.keys()))
print('Activity columns:', list(Activity.__table__.columns.keys()))
"
```

### בדיקת API Endpoints

```bash
# בדוק שהשרת רץ
curl http://localhost:5000/api/dashboard/stats

# בדוק מתנדבים
curl http://localhost:5000/api/volunteers

# בדוק פעילויות
curl http://localhost:5000/api/activities
```

---

## 📊 יצירת נתוני דוגמה

```bash
cd backend
python3 << 'EOF'
from app import app, db, Volunteer, Activity, Team

with app.app_context():
    # מתנדבים לדוגמה
    volunteers = [
        Volunteer(
            name='דני כהן',
            phone='050-1234567',
            specialization='כיבוי אש',
            status='available',
            skills='מנוסה בכיבוי שריפות יער',
            availability_hours='א-ה 18:00-22:00'
        ),
        Volunteer(
            name='שרה לוי',
            phone='052-9876543',
            specialization='עזרה ראשונה',
            status='available',
            skills='פרמדיק מוסמך',
            availability_hours='כל השעות'
        ),
        Volunteer(
            name='יוסי אברהם',
            phone='054-5555555',
            specialization='נהג',
            status='busy',
            skills='רישיון משאית + מנוף',
            availability_hours='ימי ראשון בלבד'
        )
    ]
    
    # פעילויות לדוגמה
    activities = [
        Activity(
            title='תרגיל כיבוי שריפה',
            description='תרגיל חודשי לכיבוי שריפות בשטח פתוח',
            activity_type='drill',
            participants='כל הצוותים',
            location='מגרש האימונים הראשי',
            duration=120,
            status='completed',
            outcome='תרגיל הצליח, כל הצוותים הגיעו בזמן',
            improvements_needed='להוסיף תרגול בשימוש במטף ידני',
            created_by='מפקד התחנה'
        ),
        Activity(
            title='אימון עזרה ראשונה',
            description='רענון ידע בעזרה ראשונה',
            activity_type='training',
            participants='מתנדבים חדשים',
            location='חדר האימונים',
            duration=90,
            status='planned',
            created_by='רכז בטיחות'
        ),
        Activity(
            title='פגישת תכנון שנתית',
            description='תכנון פעילויות לשנה הקרובה',
            activity_type='meeting',
            participants='הנהלת המחלקה',
            location='משרדי הנהלה',
            duration=60,
            status='ongoing',
            created_by='מנהל המחלקה'
        )
    ]
    
    for v in volunteers:
        db.session.add(v)
    
    for a in activities:
        db.session.add(a)
    
    db.session.commit()
    
    print('✅ נתוני דוגמה נוצרו בהצלחה!')
    print(f'   מתנדבים: {len(volunteers)}')
    print(f'   פעילויות: {len(activities)}')
EOF
```

---

## 🌐 גישה למערכת

לאחר ההרצה, פתח דפדפן וגש ל:

```
http://localhost:3000
```

### דפים זמינים:
- 📊 **לוח בקרה** - `/` - סקירה כללית וסטטיסטיקות
- 👥 **צוותים** - `/teams` - ניהול צוותי כיבוי אש
- 👤 **מתנדבים** - `/volunteers` - ניהול מתנדבים זמינים (**חדש!**)
- 📋 **פעילויות** - `/activities` - תיעוד פעילויות ושיפורים (**חדש!**)
- 🚰 **הידרנטים** - `/hydrants` - ניהול הידרנטים
- 🧰 **ארונות ציוד** - `/equipment` - ניהול ארונות ציוד
- ✓ **משימות** - `/tasks` - ניהול משימות
- 🔧 **תחזוקה** - `/maintenance` - מעקב תחזוקה

---

## 🔧 פתרון בעיות

### בעיה: "ModuleNotFoundError: No module named 'flask'"
**פתרון:**
```bash
pip3 install flask flask-cors flask-sqlalchemy
```

### בעיה: "Address already in use"
**פתרון:**
```bash
# מצא את התהליך על פורט 5000
lsof -i :5000
# הרוג את התהליך
kill -9 <PID>
```

### בעיה: Frontend לא נטען
**פתרון:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### בעיה: בסיס נתונים לא נוצר
**פתרון:**
```bash
cd backend
rm -f fire_department.db
python3 -c "from app import app, db; app.app_context().push(); db.create_all()"
```

---

## 📝 רישום API

### Volunteers API

```bash
# קבלת כל המתנדבים
GET /api/volunteers

# קבלת מתנדבים לפי סטטוס
GET /api/volunteers?status=available

# יצירת מתנדב חדש
POST /api/volunteers
{
  "name": "שם המתנדב",
  "phone": "050-1234567",
  "specialization": "כיבוי אש",
  "status": "available",
  "skills": "כישורים",
  "availability_hours": "שעות זמינות"
}

# עדכון מתנדב
PUT /api/volunteers/<id>

# מחיקת מתנדב
DELETE /api/volunteers/<id>
```

### Activities API

```bash
# קבלת כל הפעילויות
GET /api/activities

# קבלת פעילויות לפי סוג
GET /api/activities?activity_type=training

# יצירת פעילות חדשה
POST /api/activities
{
  "title": "כותרת",
  "description": "תיאור",
  "activity_type": "training",
  "participants": "משתתפים",
  "location": "מיקום",
  "duration": 60,
  "status": "planned",
  "outcome": "תוצאות",
  "improvements_needed": "שיפורים נדרשים"
}

# עדכון פעילות
PUT /api/activities/<id>

# מחיקת פעילות
DELETE /api/activities/<id>
```

---

## ✅ בדיקת פונקציונליות

### 1. בדוק מתנדבים
- [ ] הוסף מתנדב חדש
- [ ] ערוך מתנדב קיים
- [ ] סנן לפי סטטוס
- [ ] מחק מתנדב

### 2. בדוק פעילויות
- [ ] הוסף פעילות חדשה
- [ ] ערוך פעילות קיימת
- [ ] סנן לפי סוג וסטטוס
- [ ] תעד שיפורים נדרשים
- [ ] מחק פעילות

### 3. בדוק לוח בקרה
- [ ] ראה סטטיסטיקות מתנדבים
- [ ] ראה סטטיסטיקות פעילויות
- [ ] בדוק ספירות נכונות

---

## 📚 משאבים נוספים

- 📄 [README.md](README.md) - מידע כללי
- 📄 [FEATURES_SUMMARY.md](FEATURES_SUMMARY.md) - סיכום תכונות חדשות
- 📄 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - סיכום הפרויקט

---

**בהצלחה! 🚒**
