from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

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
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    status = db.Column(db.String(20), default='operational')  # operational, needs_maintenance, out_of_service
    pressure = db.Column(db.String(50))
    last_inspection = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'pressure': self.pressure,
            'last_inspection': self.last_inspection.isoformat() if self.last_inspection else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class EquipmentCabinet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    equipment_list = db.Column(db.Text)  # JSON string of equipment
    status = db.Column(db.String(20), default='ready')  # ready, incomplete, needs_check
    last_inspection = db.Column(db.DateTime)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'equipment_list': self.equipment_list,
            'status': self.status,
            'last_inspection': self.last_inspection.isoformat() if self.last_inspection else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    task_type = db.Column(db.String(50))  # maintenance, inspection, training, quarterly
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed, cancelled
    assigned_to = db.Column(db.String(100))
    due_date = db.Column(db.DateTime)
    completed_date = db.Column(db.DateTime)
    quarter = db.Column(db.String(10))  # Q1, Q2, Q3, Q4
    year = db.Column(db.Integer)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'task_type': self.task_type,
            'priority': self.priority,
            'status': self.status,
            'assigned_to': self.assigned_to,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_date': self.completed_date.isoformat() if self.completed_date else None,
            'quarter': self.quarter,
            'year': self.year,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
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
            name=data['name'],
            location=data['location'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            status=data.get('status', 'operational'),
            pressure=data.get('pressure', ''),
            notes=data.get('notes', '')
        )
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
        hydrant.name = data.get('name', hydrant.name)
        hydrant.location = data.get('location', hydrant.location)
        hydrant.latitude = data.get('latitude', hydrant.latitude)
        hydrant.longitude = data.get('longitude', hydrant.longitude)
        hydrant.status = data.get('status', hydrant.status)
        hydrant.pressure = data.get('pressure', hydrant.pressure)
        hydrant.notes = data.get('notes', hydrant.notes)
        if data.get('last_inspection'):
            hydrant.last_inspection = datetime.fromisoformat(data['last_inspection'])
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
            name=data['name'],
            location=data['location'],
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            equipment_list=data.get('equipment_list', ''),
            status=data.get('status', 'ready'),
            notes=data.get('notes', '')
        )
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
        cabinet.name = data.get('name', cabinet.name)
        cabinet.location = data.get('location', cabinet.location)
        cabinet.latitude = data.get('latitude', cabinet.latitude)
        cabinet.longitude = data.get('longitude', cabinet.longitude)
        cabinet.equipment_list = data.get('equipment_list', cabinet.equipment_list)
        cabinet.status = data.get('status', cabinet.status)
        cabinet.notes = data.get('notes', cabinet.notes)
        if data.get('last_inspection'):
            cabinet.last_inspection = datetime.fromisoformat(data['last_inspection'])
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

# Dashboard Statistics
@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
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
            'out_of_service': Hydrant.query.filter_by(status='out_of_service').count()
        },
        'equipment_cabinets': {
            'total': EquipmentCabinet.query.count(),
            'ready': EquipmentCabinet.query.filter_by(status='ready').count(),
            'needs_check': EquipmentCabinet.query.filter_by(status='needs_check').count()
        },
        'tasks': {
            'total': Task.query.count(),
            'pending': Task.query.filter_by(status='pending').count(),
            'in_progress': Task.query.filter_by(status='in_progress').count(),
            'completed': Task.query.filter_by(status='completed').count(),
            'urgent': Task.query.filter_by(priority='urgent').count()
        },
        'maintenance': {
            'total': MaintenanceRecord.query.count(),
            'this_month': MaintenanceRecord.query.filter(
                MaintenanceRecord.date >= datetime.now().replace(day=1)
            ).count()
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
