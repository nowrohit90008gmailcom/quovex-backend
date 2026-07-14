#!/usr/bin/env bash
set -euo pipefail

# ─── Quovex Database Backup ─────────────────────────────────────────────────
# Run via cron:  0 3 * * * quovex /opt/quovex/deploy/backup.sh
# Or manually:   sudo -u quovex /opt/quovex/deploy/backup.sh
#
# Requires: .env at /opt/quovex/.env with POSTGRES_* vars
# ──────────────────────────────────────────────────────────────────────────────

BACKUP_DIR="/opt/quovex/backups"
RETENTION_DAYS=7
ENV_FILE="/opt/quovex/.env"
LOG_FILE="/var/log/quovex-backup.log"

mkdir -p "$BACKUP_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $ENV_FILE not found" >> "$LOG_FILE"
  exit 1
fi

# Source .env safely (only known vars)
set -a
source <(grep -E '^(POSTGRES_USER|POSTGRES_PASSWORD|POSTGRES_DB)=' "$ENV_FILE")
set +a

: "${POSTGRES_USER:=quovex}"
: "${POSTGRES_PASSWORD:=}"
: "${POSTGRES_DB:=quovex}"

if [[ -z "$POSTGRES_PASSWORD" ]]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: POSTGRES_PASSWORD not set" >> "$LOG_FILE"
  exit 1
fi

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
DUMP_FILE="$BACKUP_DIR/dump_${TIMESTAMP}.sql"
DUMP_FILE_GZ="${DUMP_FILE}.gz"

PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h 127.0.0.1 \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-owner \
  --no-acl \
  --format=custom \
  --compress=6 \
  --file="$DUMP_FILE_GZ"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup created: $DUMP_FILE_GZ ($(du -h "$DUMP_FILE_GZ" | cut -f1))" >> "$LOG_FILE"

# Remove backups older than RETENTION_DAYS
find "$BACKUP_DIR" -name 'dump_*.sql*' -type f -mtime "+$RETENTION_DAYS" -delete

# Keep a pointer to the latest
ln -sf "$DUMP_FILE_GZ" "$BACKUP_DIR/latest.sql.gz"
