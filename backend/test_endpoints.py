from datetime import datetime
from pprint import pprint

from app import app, db, Team, Hydrant, EquipmentCabinet, Task, MaintenanceRecord


def ensure_seed_data():
    with app.app_context():
        db.create_all()
        hydrant = Hydrant.query.first()
        if not hydrant:
            hydrant = Hydrant(
                name='H-001',
                location='Near dining hall',
                latitude=31.4117,
                longitude=34.6667,
                status='operational',
                pressure='5 bar',
                notes='Seed hydrant',
            )
            db.session.add(hydrant)
            c1 = EquipmentCabinet(
                name='Cabinet 7',
                location='Children House',
                latitude=31.4116,
                longitude=34.6670,
                equipment_list='Hose x2; Nozzle x1; Extinguisher 6kg x2',
                status='ready',
                notes='Seed cabinet 7',
            )
            c2 = EquipmentCabinet(
                name='Cabinet 12',
                location='Club',
                latitude=31.4125,
                longitude=34.6665,
                equipment_list='Hose x1; Extinguisher 6kg x1',
                status='ready',
                notes='Seed cabinet 12',
            )
            db.session.add_all([c1, c2])
            db.session.commit()
        return hydrant.id


def run_tests():
    hid = ensure_seed_data()
    client = app.test_client()

    print('GET /api/hydrants/map ->')
    r = client.get('/api/hydrants/map')
    print(r.status_code)
    data = r.get_json()
    pprint({'count': len(data.get('features', []))})

    print(f'GET /api/hydrants/{hid}/nearby-cabinets?radius=150 ->')
    r = client.get(f'/api/hydrants/{hid}/nearby-cabinets?radius=150')
    print(r.status_code)
    nearby = r.get_json()
    pprint(nearby[:3])

    print(f'POST /api/hydrants/{hid}/inspection ->')
    r = client.post(
        f'/api/hydrants/{hid}/inspection',
        json={
            'status': 'operational',
            'pressure': '5 bar',
            'description': 'Automated test inspection',
            'performed_by': 'test-bot',
        },
    )
    print(r.status_code)
    resp = r.get_json()
    pprint({'last_inspection': resp['hydrant']['last_inspection']})

    # Test reverse relation from a cabinet
    print('GET /api/equipment-cabinets -> pick first id')
    rc = client.get('/api/equipment-cabinets')
    cabs = rc.get_json()
    if cabs:
        cid = cabs[0]['id']
        print(f'GET /api/equipment-cabinets/{cid}/nearby-hydrants?radius=150 ->')
        r = client.get(f'/api/equipment-cabinets/{cid}/nearby-hydrants?radius=150')
        print(r.status_code)
        pprint(r.get_json()[:3])

    print('GET /api/dashboard/alerts ->')
    r = client.get('/api/dashboard/alerts')
    print(r.status_code)
    alerts = r.get_json()
    pprint(alerts)


if __name__ == '__main__':
    run_tests()
