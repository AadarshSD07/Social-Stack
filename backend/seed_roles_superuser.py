#!/usr/bin/env python
import os
import django
from accounts.models import User

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SocialStack.settings')
django.setup()

from accounts.models import Role

def create_roles():
    roles = [
        {'name': 'admin', 'description': 'Permission for everything in this project. Creator, Destroyer, Owner of the project.'},
        {'name': 'user', 'description': 'permission for selected pages and functionality of the project. Can only experience the project based on creation of admin.'}
    ]
    
    for role_data in roles:
        role, created = Role.objects.get_or_create(name=role_data["name"], description=role_data["description"])
        if created:
            print(f"Created role: {role.name}")
        else:
            print(f"Role {role.name} already exists")

def create_superuser():
    username = os.getenv("DJANGO_SUPERUSER_USERNAME")
    password = os.getenv("DJANGO_SUPERUSER_PASSWORD")
    email = os.getenv("DJANGO_SUPERUSER_EMAIL")

    if not username or not password:
        print("Superuser env vars not set. Skipping.")
        return
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, password=password, email=email)
        print("Superuser created.")
    else:
        print("Superuser already exists.")

if __name__ == "__main__":
    create_roles()
    create_superuser()
