#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."

echo "Checking psql availability..."
psql --version || echo "psql NOT FOUND"

echo "Trying direct DB connection..."
PGPASSWORD="$POSTGRES_PASSWORD" psql \
  -h "$POSTGRES_HOST" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -c "select 1;"

echo "Postgres is ready."

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Seeding roles and superuser..."
python seed_roles_superuser.py || echo "Seed skipped"

echo "Starting application..."
exec "$@"