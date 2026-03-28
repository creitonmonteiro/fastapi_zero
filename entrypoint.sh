#!/bin/sh

set -e

if [ -z "$DATABASE_URL" ]; then
	export DATABASE_URL="postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres-service:5432/${POSTGRES_DB}"
fi

poetry run alembic upgrade head

exec poetry run uvicorn --host 0.0.0.0 --port 8000 task_manager.app:app