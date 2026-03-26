#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for database
if [ "$DATABASE" = "postgres" ]
then
    echo "Waiting for postgres..."

    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      sleep 0.1
    done

    echo "PostgreSQL started"
fi

# Run migrations
echo "Applying migrations..."
python manage.py migrate --noinput

# Seed data if SEED_DATA environment variable is set to true
if [ "$SEED_DATA" = "true" ]
then
    echo "Seeding data..."
    # You can customize the number of records as needed
    python manage.py seed_test_data 
    echo "Data seeding completed."
fi

# Start server
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000
