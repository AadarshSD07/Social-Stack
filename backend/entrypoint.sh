#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."

until PGPASSWORD=$POSTGRES_PASSWORD psql \
  -h "$POSTGRES_HOST" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  -c '\q' >/dev/null 2>&1; do
  echo "Postgres unavailable, waiting..."
  sleep 1
done

echo "Postgres is ready."

echo "Running migrations..."
python manage.py migrate --noinput

echo "Seeding roles and superuser..."
python seed_roles_superuser.py || echo "Seed skipped"

echo "Starting application..."
exec "$@"