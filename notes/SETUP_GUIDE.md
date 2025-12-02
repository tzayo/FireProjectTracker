# 📘 מדריך התקנה מהיר - מערכת ניהול כיבוי אש

## 🎯 דרישות

לפני שמתחילים, ודא שיש לך:
- Python 3.8 או גרסה חדשה יותר
- Node.js 14 או גרסה חדשה יותר
- npm (מגיע עם Node.js)

## ⚡ התקנה מהירה (3 צעדים)

### צעד 1: הכן את הסביבה

```bash
# הורד את הפרויקט (אם עדיין לא עשית זאת)
cd fire-department-tracker

# הפעל את סקריפט ההתקנה
chmod +x start.sh
./start.sh
```

הסקריפט יטפל בכל ההתקנות האוטומטיות!

### צעד 2: הפעל את השרת (Backend)

```bash
# פתח טרמינל ראשון
cd backend
source venv/bin/activate  # Linux/Mac
# או: venv\Scripts\activate  # Windows
python3 app.py
```

✅ השרת יעלה על: http://localhost:5000

### צעד 3: הפעל את הממשק (Frontend)

```bash
# פתח טרמינל שני
cd frontend
npm start
```

✅ האפליקציה תיפתח אוטומטית בדפדפן: http://localhost:3000

## 🎉 זהו! המערכת פועלת!

עכשיו אתה יכול:
1. ✅ לצפות בלוח הבקרה
2. ✅ להוסיף צוותים
3. ✅ למפות הידרנטים
4. ✅ לנהל ארונות ציוד
5. ✅ ליצור משימות רבעוניות
6. ✅ לתעד תחזוקה

## ❓ בעיות נפוצות ופתרונות

### Python לא מותקן
```bash
# Ubuntu/Debian
sudo apt-get install python3 python3-venv python3-pip

# macOS (עם Homebrew)
brew install python3

# Windows
# הורד והתקן מ: https://www.python.org/downloads/
```

### Node.js לא מותקן
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (עם Homebrew)
brew install node

# Windows
# הורד והתקן מ: https://nodejs.org/
```

### שגיאה: "Port 5000 is already in use"
```bash
# מצא את התהליך שמשתמש בפורט
lsof -i :5000  # Linux/Mac
# או
netstat -ano | findstr :5000  # Windows

# שנה את הפורט ב-backend/app.py:
# app.run(debug=True, host='0.0.0.0', port=5001)
```

### שגיאה: "Port 3000 is already in use"
```bash
# הרשה ל-React להשתמש בפורט אחר
# כאשר נשאל, הקלד: Y
# או הגדר משתנה סביבה:
PORT=3001 npm start
```

### שגיאות Tailwind CSS
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### שגיאה: "Module not found: Can't resolve 'leaflet'"
```bash
cd frontend
npm install leaflet react-leaflet
```

## 🔄 עדכון המערכת

```bash
# עדכן Backend
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt

# עדכן Frontend
cd frontend
npm update
```

## 🗄️ איפוס מסד הנתונים

```bash
cd backend
rm fire_department.db
source venv/bin/activate
python3 -c "from app import app, db; app.app_context().push(); db.create_all()"
```

## 📊 נתוני דוגמה

המערכת מתחילה ריקה. אתה יכול להוסיף נתוני דוגמה דרך הממשק:

1. **צוותים**: צוות א', צוות ב', וכו'
2. **הידרנטים**: הידרנט 1 - רחוב ראשי, וכו'
3. **ארונות**: ארון ציוד 1 - מרכז הקיבוץ, וכו'
4. **משימות**: בדיקה רבעונית Q1 2025, וכו'

## 🚀 העלאה לסביבת ייצור

### באמצעות Docker (מומלץ)

```dockerfile
# יצירת Dockerfile עבור Backend
FROM python:3.9
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/ .
CMD ["python", "app.py"]
```

### באמצעות שרת Linux

```bash
# התקן Nginx + Gunicorn
sudo apt install nginx
pip install gunicorn

# הרץ Backend עם Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# בנה Frontend לייצור
cd frontend
npm run build

# העתק את התוצרים ל-Nginx
sudo cp -r build/* /var/www/html/
```

## 📞 תמיכה טכנית

אם נתקלת בבעיה שלא מופיעה כאן:

1. בדוק את הלוגים של השרת (Backend terminal)
2. בדוק את Console בדפדפן (F12)
3. ודא ש-Backend ו-Frontend רצים שניהם
4. נסה לאפס את הדפדפן (Ctrl+Shift+R)

## ✅ רשימת בדיקות

לפני שמתחיל להשתמש במערכת, ודא:

- [x] Python 3.8+ מותקן
- [x] Node.js 14+ מותקן
- [x] הרצת `./start.sh` בהצלחה
- [x] Backend רץ על http://localhost:5000
- [x] Frontend רץ על http://localhost:3000
- [x] ניתן לפתוח את הממשק בדפדפן
- [x] לוח הבקרה מציג מידע
- [x] ניתן ליצור צוות חדש
- [x] ניתן להוסיף הידרנט
- [x] המפה עובדת (בלשונית הידרנטים)

---

**בהצלחה! 🚒**
