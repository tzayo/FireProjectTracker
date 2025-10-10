from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
import json
import math

app = Flask(__name__)
CORS(app)

# Database configuration
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'fire_department.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    leader = db.Column(db.String(100), nullable=False)
    members = db.Column(db.Text)  # JSON string of members
    status = db.Column(db.String(20), default='available')  # available, on_duty, unavailable
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'leader': self.leader,
            'members': self.members,
            'status': self.status,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Hydrant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    serial_number = db.Column(db.String(50), unique=True, nullable=False)  # מספר סידורי ייחודי
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    hydrant_type = db.Column(db.String(20), default='ground')  # ground (קרקעי), wall (קיר), pit (בור)
    diameter = db.Column(db.Float)  # קוטר צינור באינץ'
    water_pressure = db.Column(db.Float)  # לחץ מים בבר
    status = db.Column(db.String(20), default='operational')  # operational (תקין), needs_maintenance (דורש תחזוקה), broken (לא תקין)
    last_inspection_date = db.Column(db.DateTime)
    images = db.Column(db.Text)  # JSON array of image URLs
    nearby_cabinets = db.Column(db.Text)  # JSON array of nearby cabinet IDs with distances
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'serial_number': self.serial_number,
            'name': self.name,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'hydrant_type': self.hydrant_type,
            'diameter': self.diameter,
            'water_pressure': self.water_pressure,
            'status': self.status,
            'last_inspection_date': self.last_inspection_date.isoformat() if self.last_inspection_date else None,
            'images': self.images,
            'nearby_cabinets': self.nearby_cabinets,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class EquipmentCabinet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cabinet_number = db.Column(db.String(50), unique=True, nullable=False)  # מספר ארון ייחודי
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    cabinet_type = db.Column(db.String(20), default='standard')  # standard, extended, emergency
    installation_date = db.Column(db.DateTime)
    equipment_list = db.Column(db.Text)  # JSON string of detailed equipment items
    status = db.Column(db.String(20), default='ready')  # ready (תקין), incomplete (לא שלם), needs_check (דורש בדיקה)
    last_inspection_date = db.Column(db.DateTime)
    image = db.Column(db.Text)  # Image URL
    nearby_hydrants = db.Column(db.Text)  # JSON array of nearby hydrant IDs with distances
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'cabinet_number': self.cabinet_number,
            'name': self.name,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'cabinet_type': self.cabinet_type,
            'installation_date': self.installation_date.isoformat() if self.installation_date else None,
            'equipment_list': self.equipment_list,
            'status': self.status,
            'last_inspection_date': self.last_inspection_date.isoformat() if self.last_inspection_date else None,
            'image': self.image,
            'nearby_hydrants': self.nearby_hydrants,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    task_type = db.Column(db.String(50))  # inspection (בדיקה), maintenance (תחזוקה), repair (תיקון), upgrade (שדרוג), training (הדרכה)
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    status = db.Column(db.String(20), default='new')  # new, in_progress, waiting, completed, cancelled
    assigned_to = db.Column(db.String(100))  # שם חבר צוות
    created_by = db.Column(db.String(100))  # שם יוצר המשימה
    due_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    # קישורים לישויות
    hydrant_id = db.Column(db.Integer, db.ForeignKey('hydrant.id'), nullable=True)
    cabinet_id = db.Column(db.Integer, db.ForeignKey('equipment_cabinet.id'), nullable=True)
    # מיקום על המפה (אופציונלי, למשימות שלא קשורות להידרנט/ארון)
    location_latitude = db.Column(db.Float, nullable=True)
    location_longitude = db.Column(db.Float, nullable=True)
    attachments = db.Column(db.Text)  # JSON array of attachment URLs/files
    quarter = db.Column(db.String(10))  # Q1, Q2, Q3, Q4
    year = db.Column(db.Integer)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'task_type': self.task_type,
            'priority': self.priority,
            'status': self.status,
            'assigned_to': self.assigned_to,
            'created_by': self.created_by,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'hydrant_id': self.hydrant_id,
            'cabinet_id': self.cabinet_id,
            'location_latitude': self.location_latitude,
            'location_longitude': self.location_longitude,
            'attachments': self.attachments,
            'quarter': self.quarter,
            'year': self.year,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class MaintenanceRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_type = db.Column(db.String(50), nullable=False)  # hydrant, equipment_cabinet, vehicle, equipment
    item_id = db.Column(db.Integer)
    item_name = db.Column(db.String(100), nullable=False)
    maintenance_type = db.Column(db.String(50))  # routine, repair, inspection, emergency
    description = db.Column(db.Text)
    performed_by = db.Column(db.String(100))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    cost = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'item_type': self.item_type,
            'item_id': self.item_id,
            'item_name': self.item_name,
            'maintenance_type': self.maintenance_type,
            'description': self.description,
            'performed_by': self.performed_by,
            'date': self.date.isoformat() if self.date else None,
            'cost': self.cost,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Volunteer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(100))
    specialization = db.Column(db.String(100))  # כיבוי אש, עזרה ראשונה, נהג, טכנאי
    status = db.Column(db.String(20), default='available')  # available, busy, unavailable
    skills = db.Column(db.Text)  # JSON string of skills
    availability_hours = db.Column(db.String(200))  # זמינות
    last_activity = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'specialization': self.specialization,
            'status': self.status,
            'skills': self.skills,
            'availability_hours': self.availability_hours,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class EquipmentItem(db.Model):
    """פריטי ציוד בתוך ארונות - מעקב מפורט"""
    id = db.Column(db.Integer, primary_key=True)
    cabinet_id = db.Column(db.Integer, db.ForeignKey('equipment_cabinet.id'), nullable=False)
    item_type = db.Column(db.String(50), nullable=False)  # hose (זרנוק), nozzle (מזנק), extinguisher (מטף), valve (ברז), ppe (ציוד הגנה)
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    length = db.Column(db.Float, nullable=True)  # אורך (לזרנוקים, במטרים)
    expiry_date = db.Column(db.DateTime, nullable=True)  # תאריך פג תוקף (למטפים)
    status = db.Column(db.String(20), default='good')  # good (תקין), needs_replacement (דורש החלפה), missing (חסר)
    last_check_date = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'cabinet_id': self.cabinet_id,
            'item_type': self.item_type,
            'item_name': self.item_name,
            'quantity': self.quantity,
            'length': self.length,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'status': self.status,
            'last_check_date': self.last_check_date.isoformat() if self.last_check_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class User(db.Model):
    """משתמשים - לאימות והרשאות"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    role = db.Column(db.String(20), default='member')  # admin, commander (מפקד), member (חבר צוות), viewer (צופה)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=True)
    availability_status = db.Column(db.String(20), default='available')  # available, on_vacation, unavailable
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'role': self.role,
            'team_id': self.team_id,
            'availability_status': self.availability_status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    activity_type = db.Column(db.String(50))  # training, drill, emergency, meeting, maintenance
    participants = db.Column(db.Text)  # JSON string of participant names
    location = db.Column(db.String(200))
    date = db.Column(db.DateTime, default=datetime.utcnow)
    duration = db.Column(db.Integer)  # duration in minutes
    outcome = db.Column(db.Text)  # תוצאות הפעילות
    improvements_needed = db.Column(db.Text)  # שיפורים נדרשים
    status = db.Column(db.String(20), default='planned')  # planned, ongoing, completed, cancelled
    created_by = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'activity_type': self.activity_type,
            'participants': self.participants,
            'location': self.location,
            'date': self.date.isoformat() if self.date else None,
            'duration': self.duration,
            'outcome': self.outcome,
            'improvements_needed': self.improvements_needed,
            'status': self.status,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

# Helper Functions

def calculate_distance(lat1, lon1, lat2, lon2):
    """חישוב מרחק בין שתי נקודות GPS במטרים (נוסחת Haversine)"""
    if not all([lat1, lon1, lat2, lon2]):
        return None
    
    R = 6371000  # רדיוס כדור הארץ במטרים
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2) * math.sin(delta_lat/2) + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * \
        math.sin(delta_lon/2) * math.sin(delta_lon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    distance = R * c
    return distance

def find_nearby_items(source_lat, source_lon, items, max_distance=100):
    """מציאת פריטים קרובים במטרים"""
    nearby = []
    for item in items:
        if item.latitude and item.longitude:
            distance = calculate_distance(source_lat, source_lon, item.latitude, item.longitude)
            if distance and distance <= max_distance:
                nearby.append({
                    'id': item.id,
                    'name': item.name if hasattr(item, 'name') else item.cabinet_number,
                    'distance': round(distance, 1),
                    'latitude': item.latitude,
                    'longitude': item.longitude
                })
    # מיון לפי מרחק
    nearby.sort(key=lambda x: x['distance'])
    return nearby

def check_inspection_alerts():
    """בדיקת התראות לפריטים שטעונים בדיקה"""
    alerts = []
    
    # בדיקת הידרנטים שלא נבדקו 5.5 חודשים
    six_months_ago = datetime.utcnow() - timedelta(days=165)  # ~5.5 חודשים
    hydrants_need_check = Hydrant.query.filter(
        (Hydrant.last_inspection_date == None) | (Hydrant.last_inspection_date < six_months_ago)
    ).all()
    
    for hydrant in hydrants_need_check:
        alerts.append({
            'type': 'hydrant_inspection',
            'severity': 'warning',
            'item_id': hydrant.id,
            'item_name': hydrant.name,
            'message': f'הידרנט {hydrant.name} טעון בדיקה תקופתית'
        })
    
    # בדיקת מטפים עם תאריך תפוגה מתקרב (30 ימים)
    thirty_days_ahead = datetime.utcnow() + timedelta(days=30)
    expiring_items = EquipmentItem.query.filter(
        EquipmentItem.item_type == 'extinguisher',
        EquipmentItem.expiry_date != None,
        EquipmentItem.expiry_date <= thirty_days_ahead
    ).all()
    
    for item in expiring_items:
        cabinet = EquipmentCabinet.query.get(item.cabinet_id)
        alerts.append({
            'type': 'equipment_expiry',
            'severity': 'critical' if item.expiry_date <= datetime.utcnow() else 'warning',
            'item_id': item.id,
            'cabinet_name': cabinet.name if cabinet else 'Unknown',
            'item_name': item.item_name,
            'expiry_date': item.expiry_date.isoformat(),
            'message': f'מטף {item.item_name} בארון {cabinet.name if cabinet else "Unknown"} פג/פג תוקף'
        })
    
    # בדיקת משימות שעברו דדליין
    overdue_tasks = Task.query.filter(
        Task.status.in_(['new', 'in_progress', 'waiting']),
        Task.due_date != None,
        Task.due_date < datetime.utcnow()
    ).all()
    
    for task in overdue_tasks:
        alerts.append({
            'type': 'task_overdue',
            'severity': 'critical' if task.priority in ['critical', 'high'] else 'warning',
            'item_id': task.id,
            'item_name': task.title,
            'message': f'משימה "{task.title}" עברה את תאריך היעד'
        })
    
    return alerts

# API Routes

# Teams
@app.route('/api/teams', methods=['GET', 'POST'])
def teams():
    if request.method == 'GET':
        teams = Team.query.all()
        return jsonify([team.to_dict() for team in teams])
    
    elif request.method == 'POST':
        data = request.json
        team = Team(
            name=data['name'],
            leader=data['leader'],
            members=data.get('members', ''),
            status=data.get('status', 'available'),
            phone=data.get('phone', '')
        )
        db.session.add(team)
        db.session.commit()
        return jsonify(team.to_dict()), 201

@app.route('/api/teams/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def team_detail(id):
    team = Team.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(team.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        team.name = data.get('name', team.name)
        team.leader = data.get('leader', team.leader)
        team.members = data.get('members', team.members)
        team.status = data.get('status', team.status)
        team.phone = data.get('phone', team.phone)
        db.session.commit()
        return jsonify(team.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(team)
        db.session.commit()
        return '', 204

# Hydrants
@app.route('/api/hydrants', methods=['GET', 'POST'])
def hydrants():
    if request.method == 'GET':
        hydrants = Hydrant.query.all()
        return jsonify([hydrant.to_dict() for hydrant in hydrants])
    
    elif request.method == 'POST':
        data = request.json
        hydrant = Hydrant(
            serial_number=data['serial_number'],
            name=data['name'],
            location=data['location'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            hydrant_type=data.get('hydrant_type', 'ground'),
            diameter=data.get('diameter'),
            water_pressure=data.get('water_pressure'),
            status=data.get('status', 'operational'),
            images=json.dumps(data.get('images', [])),
            notes=data.get('notes', '')
        )
        
        # חישוב ארונות קרובים אם יש קואורדינטות
        if hydrant.latitude and hydrant.longitude:
            cabinets = EquipmentCabinet.query.all()
            nearby = find_nearby_items(hydrant.latitude, hydrant.longitude, cabinets, max_distance=100)
            hydrant.nearby_cabinets = json.dumps(nearby)
        
        db.session.add(hydrant)
        db.session.commit()
        return jsonify(hydrant.to_dict()), 201

@app.route('/api/hydrants/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def hydrant_detail(id):
    hydrant = Hydrant.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(hydrant.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        if 'serial_number' in data:
            hydrant.serial_number = data['serial_number']
        hydrant.name = data.get('name', hydrant.name)
        hydrant.location = data.get('location', hydrant.location)
        hydrant.latitude = data.get('latitude', hydrant.latitude)
        hydrant.longitude = data.get('longitude', hydrant.longitude)
        hydrant.hydrant_type = data.get('hydrant_type', hydrant.hydrant_type)
        hydrant.diameter = data.get('diameter', hydrant.diameter)
        hydrant.water_pressure = data.get('water_pressure', hydrant.water_pressure)
        hydrant.status = data.get('status', hydrant.status)
        hydrant.notes = data.get('notes', hydrant.notes)
        
        if 'images' in data:
            hydrant.images = json.dumps(data['images'])
        
        if data.get('last_inspection_date'):
            hydrant.last_inspection_date = datetime.fromisoformat(data['last_inspection_date'])
        
        # עדכון ארונות קרובים אם השתנו הקואורדינטות
        if hydrant.latitude and hydrant.longitude:
            cabinets = EquipmentCabinet.query.all()
            nearby = find_nearby_items(hydrant.latitude, hydrant.longitude, cabinets, max_distance=100)
            hydrant.nearby_cabinets = json.dumps(nearby)
        
        db.session.commit()
        return jsonify(hydrant.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(hydrant)
        db.session.commit()
        return '', 204

# Equipment Cabinets
@app.route('/api/equipment-cabinets', methods=['GET', 'POST'])
def equipment_cabinets():
    if request.method == 'GET':
        cabinets = EquipmentCabinet.query.all()
        return jsonify([cabinet.to_dict() for cabinet in cabinets])
    
    elif request.method == 'POST':
        data = request.json
        cabinet = EquipmentCabinet(
            cabinet_number=data['cabinet_number'],
            name=data['name'],
            location=data['location'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            cabinet_type=data.get('cabinet_type', 'standard'),
            equipment_list=data.get('equipment_list', '[]'),
            status=data.get('status', 'ready'),
            notes=data.get('notes', '')
        )
        
        if data.get('installation_date'):
            cabinet.installation_date = datetime.fromisoformat(data['installation_date'])
        
        # חישוב הידרנטים קרובים אם יש קואורדינטות
        if cabinet.latitude and cabinet.longitude:
            hydrants = Hydrant.query.all()
            nearby = find_nearby_items(cabinet.latitude, cabinet.longitude, hydrants, max_distance=100)
            cabinet.nearby_hydrants = json.dumps(nearby)
        
        db.session.add(cabinet)
        db.session.commit()
        return jsonify(cabinet.to_dict()), 201

@app.route('/api/equipment-cabinets/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def equipment_cabinet_detail(id):
    cabinet = EquipmentCabinet.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(cabinet.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        if 'cabinet_number' in data:
            cabinet.cabinet_number = data['cabinet_number']
        cabinet.name = data.get('name', cabinet.name)
        cabinet.location = data.get('location', cabinet.location)
        cabinet.latitude = data.get('latitude', cabinet.latitude)
        cabinet.longitude = data.get('longitude', cabinet.longitude)
        cabinet.cabinet_type = data.get('cabinet_type', cabinet.cabinet_type)
        cabinet.equipment_list = data.get('equipment_list', cabinet.equipment_list)
        cabinet.status = data.get('status', cabinet.status)
        cabinet.notes = data.get('notes', cabinet.notes)
        
        if data.get('installation_date'):
            cabinet.installation_date = datetime.fromisoformat(data['installation_date'])
        if data.get('last_inspection_date'):
            cabinet.last_inspection_date = datetime.fromisoformat(data['last_inspection_date'])
        
        # עדכון הידרנטים קרובים אם השתנו הקואורדינטות
        if cabinet.latitude and cabinet.longitude:
            hydrants = Hydrant.query.all()
            nearby = find_nearby_items(cabinet.latitude, cabinet.longitude, hydrants, max_distance=100)
            cabinet.nearby_hydrants = json.dumps(nearby)
        
        db.session.commit()
        return jsonify(cabinet.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(cabinet)
        db.session.commit()
        return '', 204

# Tasks
@app.route('/api/tasks', methods=['GET', 'POST'])
def tasks():
    if request.method == 'GET':
        quarter = request.args.get('quarter')
        year = request.args.get('year')
        status = request.args.get('status')
        
        query = Task.query
        if quarter:
            query = query.filter_by(quarter=quarter)
        if year:
            query = query.filter_by(year=int(year))
        if status:
            query = query.filter_by(status=status)
        
        tasks = query.all()
        return jsonify([task.to_dict() for task in tasks])
    
    elif request.method == 'POST':
        data = request.json
        task = Task(
            title=data['title'],
            description=data.get('description', ''),
            task_type=data.get('task_type', ''),
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'pending'),
            assigned_to=data.get('assigned_to', ''),
            quarter=data.get('quarter', ''),
            year=data.get('year'),
            notes=data.get('notes', '')
        )
        if data.get('due_date'):
            task.due_date = datetime.fromisoformat(data['due_date'])
        db.session.add(task)
        db.session.commit()
        return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def task_detail(id):
    task = Task.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(task.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        task.task_type = data.get('task_type', task.task_type)
        task.priority = data.get('priority', task.priority)
        task.status = data.get('status', task.status)
        task.assigned_to = data.get('assigned_to', task.assigned_to)
        task.quarter = data.get('quarter', task.quarter)
        task.year = data.get('year', task.year)
        task.notes = data.get('notes', task.notes)
        if data.get('due_date'):
            task.due_date = datetime.fromisoformat(data['due_date'])
        if data.get('completed_date'):
            task.completed_date = datetime.fromisoformat(data['completed_date'])
        elif data.get('status') == 'completed' and not task.completed_date:
            task.completed_date = datetime.utcnow()
        db.session.commit()
        return jsonify(task.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return '', 204

# Maintenance Records
@app.route('/api/maintenance', methods=['GET', 'POST'])
def maintenance_records():
    if request.method == 'GET':
        item_type = request.args.get('item_type')
        item_id = request.args.get('item_id')
        
        query = MaintenanceRecord.query
        if item_type:
            query = query.filter_by(item_type=item_type)
        if item_id:
            query = query.filter_by(item_id=int(item_id))
        
        records = query.order_by(MaintenanceRecord.date.desc()).all()
        return jsonify([record.to_dict() for record in records])
    
    elif request.method == 'POST':
        data = request.json
        record = MaintenanceRecord(
            item_type=data['item_type'],
            item_id=data.get('item_id'),
            item_name=data['item_name'],
            maintenance_type=data.get('maintenance_type', ''),
            description=data.get('description', ''),
            performed_by=data.get('performed_by', ''),
            cost=data.get('cost'),
            notes=data.get('notes', '')
        )
        if data.get('date'):
            record.date = datetime.fromisoformat(data['date'])
        db.session.add(record)
        db.session.commit()
        return jsonify(record.to_dict()), 201

@app.route('/api/maintenance/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def maintenance_record_detail(id):
    record = MaintenanceRecord.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(record.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        record.item_type = data.get('item_type', record.item_type)
        record.item_id = data.get('item_id', record.item_id)
        record.item_name = data.get('item_name', record.item_name)
        record.maintenance_type = data.get('maintenance_type', record.maintenance_type)
        record.description = data.get('description', record.description)
        record.performed_by = data.get('performed_by', record.performed_by)
        record.cost = data.get('cost', record.cost)
        record.notes = data.get('notes', record.notes)
        if data.get('date'):
            record.date = datetime.fromisoformat(data['date'])
        db.session.commit()
        return jsonify(record.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(record)
        db.session.commit()
        return '', 204

# Volunteers
@app.route('/api/volunteers', methods=['GET', 'POST'])
def volunteers():
    if request.method == 'GET':
        status = request.args.get('status')
        specialization = request.args.get('specialization')
        
        query = Volunteer.query
        if status:
            query = query.filter_by(status=status)
        if specialization:
            query = query.filter_by(specialization=specialization)
        
        volunteers = query.all()
        return jsonify([volunteer.to_dict() for volunteer in volunteers])
    
    elif request.method == 'POST':
        data = request.json
        volunteer = Volunteer(
            name=data['name'],
            phone=data.get('phone', ''),
            email=data.get('email', ''),
            specialization=data.get('specialization', ''),
            status=data.get('status', 'available'),
            skills=data.get('skills', ''),
            availability_hours=data.get('availability_hours', ''),
            notes=data.get('notes', '')
        )
        if data.get('last_activity'):
            volunteer.last_activity = datetime.fromisoformat(data['last_activity'])
        db.session.add(volunteer)
        db.session.commit()
        return jsonify(volunteer.to_dict()), 201

@app.route('/api/volunteers/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def volunteer_detail(id):
    volunteer = Volunteer.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(volunteer.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        volunteer.name = data.get('name', volunteer.name)
        volunteer.phone = data.get('phone', volunteer.phone)
        volunteer.email = data.get('email', volunteer.email)
        volunteer.specialization = data.get('specialization', volunteer.specialization)
        volunteer.status = data.get('status', volunteer.status)
        volunteer.skills = data.get('skills', volunteer.skills)
        volunteer.availability_hours = data.get('availability_hours', volunteer.availability_hours)
        volunteer.notes = data.get('notes', volunteer.notes)
        if data.get('last_activity'):
            volunteer.last_activity = datetime.fromisoformat(data['last_activity'])
        db.session.commit()
        return jsonify(volunteer.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(volunteer)
        db.session.commit()
        return '', 204

# Activities
@app.route('/api/activities', methods=['GET', 'POST'])
def activities():
    if request.method == 'GET':
        activity_type = request.args.get('activity_type')
        status = request.args.get('status')
        
        query = Activity.query
        if activity_type:
            query = query.filter_by(activity_type=activity_type)
        if status:
            query = query.filter_by(status=status)
        
        activities = query.order_by(Activity.date.desc()).all()
        return jsonify([activity.to_dict() for activity in activities])
    
    elif request.method == 'POST':
        data = request.json
        activity = Activity(
            title=data['title'],
            description=data.get('description', ''),
            activity_type=data.get('activity_type', ''),
            participants=data.get('participants', ''),
            location=data.get('location', ''),
            duration=data.get('duration'),
            outcome=data.get('outcome', ''),
            improvements_needed=data.get('improvements_needed', ''),
            status=data.get('status', 'planned'),
            created_by=data.get('created_by', '')
        )
        if data.get('date'):
            activity.date = datetime.fromisoformat(data['date'])
        db.session.add(activity)
        db.session.commit()
        return jsonify(activity.to_dict()), 201

@app.route('/api/activities/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def activity_detail(id):
    activity = Activity.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(activity.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        activity.title = data.get('title', activity.title)
        activity.description = data.get('description', activity.description)
        activity.activity_type = data.get('activity_type', activity.activity_type)
        activity.participants = data.get('participants', activity.participants)
        activity.location = data.get('location', activity.location)
        activity.duration = data.get('duration', activity.duration)
        activity.outcome = data.get('outcome', activity.outcome)
        activity.improvements_needed = data.get('improvements_needed', activity.improvements_needed)
        activity.status = data.get('status', activity.status)
        activity.created_by = data.get('created_by', activity.created_by)
        if data.get('date'):
            activity.date = datetime.fromisoformat(data['date'])
        db.session.commit()
        return jsonify(activity.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(activity)
        db.session.commit()
        return '', 204

# Equipment Items (פריטי ציוד בארונות)
@app.route('/api/cabinets/<int:cabinet_id>/items', methods=['GET', 'POST'])
def cabinet_items(cabinet_id):
    cabinet = EquipmentCabinet.query.get_or_404(cabinet_id)
    
    if request.method == 'GET':
        items = EquipmentItem.query.filter_by(cabinet_id=cabinet_id).all()
        return jsonify([item.to_dict() for item in items])
    
    elif request.method == 'POST':
        data = request.json
        item = EquipmentItem(
            cabinet_id=cabinet_id,
            item_type=data['item_type'],
            item_name=data['item_name'],
            quantity=data.get('quantity', 1),
            length=data.get('length'),
            status=data.get('status', 'good'),
            notes=data.get('notes', '')
        )
        if data.get('expiry_date'):
            item.expiry_date = datetime.fromisoformat(data['expiry_date'])
        if data.get('last_check_date'):
            item.last_check_date = datetime.fromisoformat(data['last_check_date'])
        
        db.session.add(item)
        db.session.commit()
        return jsonify(item.to_dict()), 201

@app.route('/api/equipment-items/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def equipment_item_detail(id):
    item = EquipmentItem.query.get_or_404(id)
    
    if request.method == 'GET':
        return jsonify(item.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        item.item_type = data.get('item_type', item.item_type)
        item.item_name = data.get('item_name', item.item_name)
        item.quantity = data.get('quantity', item.quantity)
        item.length = data.get('length', item.length)
        item.status = data.get('status', item.status)
        item.notes = data.get('notes', item.notes)
        
        if 'expiry_date' in data:
            item.expiry_date = datetime.fromisoformat(data['expiry_date']) if data['expiry_date'] else None
        if 'last_check_date' in data:
            item.last_check_date = datetime.fromisoformat(data['last_check_date']) if data['last_check_date'] else None
        
        db.session.commit()
        return jsonify(item.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(item)
        db.session.commit()
        return '', 204

# Proximity APIs
@app.route('/api/hydrants/<int:id>/nearby-cabinets', methods=['GET'])
def hydrant_nearby_cabinets(id):
    """מציאת ארונות קרובים להידרנט"""
    hydrant = Hydrant.query.get_or_404(id)
    
    if not hydrant.latitude or not hydrant.longitude:
        return jsonify({'error': 'Hydrant has no GPS coordinates'}), 400
    
    max_distance = request.args.get('max_distance', 100, type=int)
    cabinets = EquipmentCabinet.query.all()
    nearby = find_nearby_items(hydrant.latitude, hydrant.longitude, cabinets, max_distance)
    
    return jsonify(nearby)

@app.route('/api/cabinets/<int:id>/nearby-hydrants', methods=['GET'])
def cabinet_nearby_hydrants(id):
    """מציאת הידרנטים קרובים לארון"""
    cabinet = EquipmentCabinet.query.get_or_404(id)
    
    if not cabinet.latitude or not cabinet.longitude:
        return jsonify({'error': 'Cabinet has no GPS coordinates'}), 400
    
    max_distance = request.args.get('max_distance', 100, type=int)
    hydrants = Hydrant.query.all()
    nearby = find_nearby_items(cabinet.latitude, cabinet.longitude, hydrants, max_distance)
    
    return jsonify(nearby)

# Alerts and Notifications
@app.route('/api/dashboard/alerts', methods=['GET'])
def dashboard_alerts():
    """קבלת כל ההתראות הפעילות במערכת"""
    alerts = check_inspection_alerts()
    return jsonify(alerts)

# GeoJSON for Map Visualization
@app.route('/api/hydrants/map', methods=['GET'])
def hydrants_geojson():
    """החזרת הידרנטים בפורמט GeoJSON למפות"""
    hydrants = Hydrant.query.filter(Hydrant.latitude.isnot(None), Hydrant.longitude.isnot(None)).all()
    
    features = []
    for hydrant in hydrants:
        features.append({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [hydrant.longitude, hydrant.latitude]
            },
            'properties': {
                'id': hydrant.id,
                'name': hydrant.name,
                'serial_number': hydrant.serial_number,
                'status': hydrant.status,
                'hydrant_type': hydrant.hydrant_type,
                'water_pressure': hydrant.water_pressure,
                'location': hydrant.location
            }
        })
    
    return jsonify({
        'type': 'FeatureCollection',
        'features': features
    })

@app.route('/api/cabinets/map', methods=['GET'])
def cabinets_geojson():
    """החזרת ארונות בפורמט GeoJSON למפות"""
    cabinets = EquipmentCabinet.query.filter(
        EquipmentCabinet.latitude.isnot(None), 
        EquipmentCabinet.longitude.isnot(None)
    ).all()
    
    features = []
    for cabinet in cabinets:
        features.append({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [cabinet.longitude, cabinet.latitude]
            },
            'properties': {
                'id': cabinet.id,
                'name': cabinet.name,
                'cabinet_number': cabinet.cabinet_number,
                'status': cabinet.status,
                'cabinet_type': cabinet.cabinet_type,
                'location': cabinet.location
            }
        })
    
    return jsonify({
        'type': 'FeatureCollection',
        'features': features
    })

# Dashboard Statistics
@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    # קבלת התראות
    alerts = check_inspection_alerts()
    
    stats = {
        'teams': {
            'total': Team.query.count(),
            'available': Team.query.filter_by(status='available').count(),
            'on_duty': Team.query.filter_by(status='on_duty').count()
        },
        'hydrants': {
            'total': Hydrant.query.count(),
            'operational': Hydrant.query.filter_by(status='operational').count(),
            'needs_maintenance': Hydrant.query.filter_by(status='needs_maintenance').count(),
            'broken': Hydrant.query.filter_by(status='broken').count()
        },
        'equipment_cabinets': {
            'total': EquipmentCabinet.query.count(),
            'ready': EquipmentCabinet.query.filter_by(status='ready').count(),
            'needs_check': EquipmentCabinet.query.filter_by(status='needs_check').count(),
            'incomplete': EquipmentCabinet.query.filter_by(status='incomplete').count()
        },
        'equipment_items': {
            'total': EquipmentItem.query.count(),
            'good': EquipmentItem.query.filter_by(status='good').count(),
            'needs_replacement': EquipmentItem.query.filter_by(status='needs_replacement').count(),
            'missing': EquipmentItem.query.filter_by(status='missing').count()
        },
        'tasks': {
            'total': Task.query.count(),
            'new': Task.query.filter_by(status='new').count(),
            'in_progress': Task.query.filter_by(status='in_progress').count(),
            'completed': Task.query.filter_by(status='completed').count(),
            'critical': Task.query.filter_by(priority='critical').count(),
            'overdue': Task.query.filter(
                Task.status.in_(['new', 'in_progress', 'waiting']),
                Task.due_date != None,
                Task.due_date < datetime.utcnow()
            ).count()
        },
        'maintenance': {
            'total': MaintenanceRecord.query.count(),
            'this_month': MaintenanceRecord.query.filter(
                MaintenanceRecord.date >= datetime.now().replace(day=1)
            ).count()
        },
        'volunteers': {
            'total': Volunteer.query.count(),
            'available': Volunteer.query.filter_by(status='available').count(),
            'busy': Volunteer.query.filter_by(status='busy').count(),
            'unavailable': Volunteer.query.filter_by(status='unavailable').count()
        },
        'activities': {
            'total': Activity.query.count(),
            'planned': Activity.query.filter_by(status='planned').count(),
            'ongoing': Activity.query.filter_by(status='ongoing').count(),
            'completed': Activity.query.filter_by(status='completed').count(),
            'this_month': Activity.query.filter(
                Activity.date >= datetime.now().replace(day=1)
            ).count()
        },
        'alerts': {
            'total': len(alerts),
            'critical': len([a for a in alerts if a['severity'] == 'critical']),
            'warning': len([a for a in alerts if a['severity'] == 'warning']),
            'recent': alerts[:5]  # 5 התראות האחרונות
        }
    }
    return jsonify(stats)

# Initialize database
@app.route('/api/init-db', methods=['POST'])
def init_db():
    db.create_all()
    return jsonify({'message': 'Database initialized successfully'}), 201

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
