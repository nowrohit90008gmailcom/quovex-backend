#!/bin/sh
set -e

echo "entrypoint.sh: running alembic upgrade head..."
alembic upgrade head

echo "entrypoint.sh: starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers "${UVICORN_WORKERS:-2}" --access-log
