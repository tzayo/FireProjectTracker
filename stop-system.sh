#!/bin/bash
# עצירת מערכת ניהול כיבוי אש
# Stop Fire Safety Management System

echo "🛑 עוצר את מערכת ניהול כיבוי האש..."

# עצירה לפי PID files אם קיימים
if [ -f ".backend.pid" ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null && echo "✅ Backend הופסק (PID: $BACKEND_PID)" || echo "⚠️  Backend כבר לא פעיל"
    rm .backend.pid
fi

if [ -f ".frontend.pid" ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo "✅ Frontend הופסק (PID: $FRONTEND_PID)" || echo "⚠️  Frontend כבר לא פעיל"
    rm .frontend.pid
fi

# ניקוי תהליכים שנשארו
pkill -f "python.*app.py" 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
pkill -f "npm.*start" 2>/dev/null

echo ""
echo "✅ המערכת הופסקה בהצלחה!"
echo ""
