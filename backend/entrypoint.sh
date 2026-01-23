#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."

MAX_TRIES=30
TRIES=0

echo "Checking DB connectivity..."
psql --version || echo "psql not installed!"

until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' >/dev/null 2>&1; do
  TRIES=$((TRIES+1))
  echo "Postgres unavailable ($TRIES/$MAX_TRIES)..."
  if [ "$TRIES" -ge "$MAX_TRIES" ]; then
    echo "DB not reachable, exiting."
    exit 1
  fi
  sleep 1
done

echo "Postgres is ready."

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

echo "Seeding roles and superuser..."
python seed_roles_superuser.py || echo "Seed skipped"

echo "Starting application..."
exec "$@"