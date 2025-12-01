#!/usr/bin/env python3
"""
Script to create default users for the Fire Department Tracker system.
This should be run after initializing the database.
"""

from app import app, db, User

def create_default_users():
    """Create default users with different roles for testing"""

    with app.app_context():
        # Check if users already exist
        if User.query.count() > 0:
            print("Users already exist in the database.")
            response = input("Do you want to create additional users? (y/n): ")
            if response.lower() != 'y':
                return

        users_to_create = [
            {
                'username': 'admin',
                'password': 'admin123',
                'name': 'מנהל מערכת',
                'role': 'manager',
                'email': 'admin@galeon.org.il'
            },
            {
                'username': 'commander',
                'password': 'commander123',
                'name': 'מפקד כיבוי',
                'role': 'commander',
                'email': 'commander@galeon.org.il'
            },
            {
                'username': 'member',
                'password': 'member123',
                'name': 'חבר צוות',
                'role': 'member',
                'email': 'member@galeon.org.il'
            },
            {
                'username': 'observer',
                'password': 'observer123',
                'name': 'צופה',
                'role': 'observer',
                'email': 'observer@galeon.org.il'
            }
        ]

        created_count = 0

        for user_data in users_to_create:
            # Check if user already exists
            existing_user = User.query.filter_by(username=user_data['username']).first()
            if existing_user:
                print(f"User '{user_data['username']}' already exists. Skipping...")
                continue

            # Create new user
            user = User(
                username=user_data['username'],
                name=user_data['name'],
                role=user_data['role'],
                email=user_data['email'],
                is_active=True
            )
            user.set_password(user_data['password'])

            db.session.add(user)
            created_count += 1
            print(f"Created user: {user_data['username']} ({user_data['role']})")

        if created_count > 0:
            db.session.commit()
            print(f"\n✅ Successfully created {created_count} user(s)!")
            print("\n📋 Default Login Credentials:")
            print("=" * 50)
            for user_data in users_to_create:
                print(f"Username: {user_data['username']}")
                print(f"Password: {user_data['password']}")
                print(f"Role: {user_data['role']}")
                print("-" * 50)
        else:
            print("No new users were created.")

if __name__ == '__main__':
    create_default_users()
