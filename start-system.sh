#!/bin/bash
set -euox pipefail
# מערכת ניהול כיבוי אש - הפעלה מהירה
# Fire Safety Management System - Quick Start Script

echo "🚒 מערכת ניהול כיבוי אש - קיבוץ"
echo "=================================="
echo ""

# בדיקת Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 לא מותקן. נא להתקין Python 3.8 ומעלה."
    exit 1
fi
echo "✅ Python נמצא: $(python3 --version)"

# בדיקת Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js לא מותקן. נא להתקין Node.js 18 ומעלה."
    exit 1
fi
echo "✅ Node.js נמצא: $(node --version)"

echo ""
echo "📦 בודק תלויות..."

# בדיקת והתקנת תלויות Backend
if [ ! -d "backend/venv" ]; then
    echo "🔧 יוצר סביבה וירטואלית ל-Backend..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    echo "✅ תלויות Backend הותקנו"
else
    echo "✅ תלויות Backend כבר מותקנות"
fi

# בדיקת קובץ .env ב-Backend
if [ ! -f "backend/.env" ]; then
    echo "⚠️  אזהרה: קובץ backend/.env לא קיים"
    echo "   המערכת תעבוד עם הגדרות ברירת מחדל (development mode)"
    echo "   ליצירת קובץ תצורה: cp backend/.env.example backend/.env"
    echo ""
fi

# בדיקת והתקנת תלויות Frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "🔧 מתקין תלויות Frontend..."
    cd frontend
    npm install
    cd ..
    echo "✅ תלויות Frontend הותקנו"
else
    echo "✅ תלויות Frontend כבר מותקנות"
fi

# בדיקת קובץ .env ב-Frontend
if [ ! -f "frontend/.env" ]; then
    echo "ℹ️  מידע: קובץ frontend/.env לא קיים (אופציונלי)"
    echo "   ליצירת קובץ תצורה: cp frontend/.env.example frontend/.env"
    echo ""
fi

echo ""
echo "🚀 מפעיל את המערכת..."
echo ""

# הפעלת Backend ברקע
echo "📡 מפעיל Backend Server (http://localhost:5000)..."
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate || . venv/Scripts/activate
fi
python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# המתנה קצרה לעליית השרת
sleep 3

# בדיקה ש-Backend עלה
if curl -s http://localhost:5000/api/dashboard/stats > /dev/null 2>&1; then
    echo "✅ Backend Server פעיל!"
else
    echo "⚠️  Backend Server אולי לא עלה כראוי. בדוק backend.log"
fi

echo ""
echo "💻 מפעיל Frontend (http://localhost:3000)..."
cd frontend
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "=================================="
echo "✅ המערכת הופעלה בהצלחה!"
echo ""
echo "🌐 גישה למערכת:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "📋 Logs:"
echo "   Backend: backend.log"
echo "   Frontend: frontend.log"
echo ""
echo "🛑 לעצירת המערכת:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   או לחץ Ctrl+C ואז הרץ:"
echo "   pkill -f 'python.*app.py'"
echo "   pkill -f 'react-scripts'"
echo ""
echo "=================================="
echo "📖 מדריכים:"
echo "   - מדריך מהיר: QUICKSTART.md"
echo "   - מדריך מלא: SYSTEM_GUIDE.md"
echo "=================================="

# שמירת PIDs לעצירה קלה
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

echo ""
echo "⏳ ממתין לעליית Frontend (זה יכול לקחת דקה)..."
echo "הדפדפן ייפתח אוטומטית בכתובת http://localhost:3000"
echo ""

# המתנה לעליית Frontend והשארת התהליך פעיל
wait $FRONTEND_PID
