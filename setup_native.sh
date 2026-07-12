#!/usr/bin/env bash
set -euo pipefail

# ─── Quovex Native VPS Setup ────────────────────────────────────────────────
# Uses systemd + native packages instead of Docker.
# Run on Ubuntu 22.04 / 24.04 as root.

REPO_URL="https://github.com/nowrohit90008gmailcom/quovex-backend.git"
PROJECT_DIR="/opt/quovex"
DOMAIN_API="api.quovex.online"
DOMAIN_ADMIN="admin.quovex.online"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[X]${NC} $1"; }

if [[ $EUID -ne 0 ]]; then
  err "Run as root"
  exit 1
fi

# ─── 1. System Packages ──────────────────────────────────────────────────────
log "Updating system packages..."
apt-get update -qq
apt-get --fix-broken install -y -qq || true
apt-get upgrade -y -qq || true
# Install Node.js 20.x (Ubuntu 22.04 default node is too old)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

apt-get install -y -qq \
  curl git ufw \
  postgresql postgresql-client \
  redis-server \
  python3 python3-venv python3-pip python3-dev \
  libpq-dev gcc \
  nodejs \
  ca-certificates gnupg apt-transport-https \
  debian-keyring debian-archive-keyring

# Install Caddy (not in default Ubuntu repos)
log "Installing Caddy..."
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -qq
apt-get install -y -qq caddy

log "System packages installed"

# ─── 2. Create quovex user ───────────────────────────────────────────────────
if ! id -u quovex &>/dev/null; then
  useradd -r -s /bin/bash -d "$PROJECT_DIR" -m quovex
  log "Created quovex user"
fi

# ─── 3. Clone / Pull Repo ────────────────────────────────────────────────────
if [[ -d "$PROJECT_DIR/.git" ]]; then
  warn "Repo exists — pulling latest..."
  cd "$PROJECT_DIR" && git pull
else
  log "Cloning repo..."
  git clone "$REPO_URL" "$PROJECT_DIR"
  chown -R quovex:quovex "$PROJECT_DIR"
fi

# ─── 4. Python Virtual Environment ───────────────────────────────────────────
if [[ ! -d "$PROJECT_DIR/venv" ]]; then
  log "Creating Python venv..."
  python3 -m venv "$PROJECT_DIR/venv"
fi

log "Installing Python dependencies..."
"$PROJECT_DIR/venv/bin/pip" install --no-cache-dir -r "$PROJECT_DIR/requirements.txt"

# ─── 5. Dashboard ────────────────────────────────────────────────────────────
log "Installing dashboard npm dependencies..."
cd "$PROJECT_DIR/dashboard"
npm ci
log "Building dashboard..."
NEXT_PUBLIC_API_URL="https://${DOMAIN_API}/api/v1" npm run build
cd "$PROJECT_DIR"

# ─── 6. Create .env ──────────────────────────────────────────────────────────
if [[ -f "$PROJECT_DIR/.env" ]]; then
  warn "Backing up old .env to .env.docker.bak (Docker-style URLs detected)"
  cp "$PROJECT_DIR/.env" "$PROJECT_DIR/.env.docker.bak"
fi

SECRET_KEY=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 24)
REDIS_PASSWORD=$(openssl rand -hex 24)
ADMIN_PASSWORD_1=$(openssl rand -hex 18)
ADMIN_PASSWORD_2=$(openssl rand -hex 18)

cat > "$PROJECT_DIR/.env" <<ENVEOF
ENVIRONMENT=production
SECRET_KEY=${SECRET_KEY}
DATABASE_URL=postgresql+psycopg2://quovex:${POSTGRES_PASSWORD}@127.0.0.1:5432/quovex
POSTGRES_USER=quovex
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=quovex
REDIS_URL=redis://:${REDIS_PASSWORD}@127.0.0.1:6379/0
REDIS_PASSWORD=${REDIS_PASSWORD}
CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@127.0.0.1:6379/1
CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@127.0.0.1:6379/2
FIREBASE_PROJECT_ID=quovex-84b14
FIREBASE_CREDENTIALS_PATH=/opt/quovex/firebase-credentials.json
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=supportquovex@gmail.com
EMAIL_PASS=<your-gmail-app-password>
FROM_EMAIL=supportquovex@gmail.com
ALLOWED_ORIGINS=["https://${DOMAIN_ADMIN}","https://quovex.online"]
ADMIN_EMAIL_1=Rohit@Quovex.online
ADMIN_PASSWORD_1=${ADMIN_PASSWORD_1}
ADMIN_EMAIL_2=Kartikey@Quovex.online
ADMIN_PASSWORD_2=${ADMIN_PASSWORD_2}
CEREBRAS_API_KEY=<your-cerebras-api-key>
CEREBRAS_MODEL=gpt-oss-120b
REWARD_BUDGET_CAP_PERCENT=35
BASE_POINTS_PER_HOUR=100
DIMINISHING_RETURNS_AFTER_HOURS=6
MAX_DAILY_HOURS_FLAG=12
SOCIAL_UNLOCK_MINUTES_PER_HOUR=15
QUIZ_SET_SIZE=10
QUIZ_QUESTION_TIME_LIMIT_SECONDS=25
MAX_QUIZ_ATTEMPTS_PER_SUBJECT_PER_DAY=5
ENVEOF

warn ".env created at ${PROJECT_DIR}/.env"
warn "Fill in: EMAIL_PASS, CEREBRAS_API_KEY"
warn "Place firebase-credentials.json at ${PROJECT_DIR}/firebase-credentials.json"
read -p "Press Enter after editing .env and adding firebase-credentials.json..."

# ─── 7. PostgreSQL Setup ─────────────────────────────────────────────────────
log "Configuring PostgreSQL..."
systemctl enable --now postgresql

su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='quovex'\" | grep -q 1 || psql -c \"CREATE USER quovex WITH PASSWORD '${POSTGRES_PASSWORD}';\"" || true
su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='quovex'\" | grep -q 1 || psql -c \"CREATE DATABASE quovex OWNER quovex;\"" || true
su - postgres -c "psql -c \"ALTER DATABASE quovex OWNER TO quovex;\"" || true

# Allow password auth locally
PG_HBA=$(su - postgres -c "psql -t -c 'SHOW hba_file;'" | tr -d ' ')
if grep -q "^local.*all.*all.*peer" "$PG_HBA"; then
  sed -i 's/^local.*all.*all.*peer/local   all             all                                     md5/' "$PG_HBA"
  systemctl reload postgresql
fi

log "PostgreSQL configured"

# ─── 8. Redis Setup ──────────────────────────────────────────────────────────
log "Configuring Redis..."
sed -i "s|^# requirepass .*|requirepass ${REDIS_PASSWORD}|" /etc/redis/redis.conf
systemctl enable --now redis-server
log "Redis configured"

# ─── 9. Caddy Setup ──────────────────────────────────────────────────────────
log "Configuring Caddy..."
cp "$PROJECT_DIR/deploy/Caddyfile.native" /etc/caddy/Caddyfile
mkdir -p "$PROJECT_DIR/downloads" "$PROJECT_DIR/uploads"
chown -R quovex:quovex "$PROJECT_DIR/downloads" "$PROJECT_DIR/uploads"
systemctl enable --now caddy
log "Caddy configured"

# ─── 10. Firewall ────────────────────────────────────────────────────────────
log "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
log "Firewall active: ports 22, 80, 443"

# ─── 11. Run Migrations ──────────────────────────────────────────────────────
log "Running Alembic migrations..."
cd "$PROJECT_DIR" && ./venv/bin/alembic upgrade head

# ─── 12. Create Admin Accounts ───────────────────────────────────────────────
log "Creating admin accounts..."
cd "$PROJECT_DIR" && ./venv/bin/python create_admin.py

# ─── 13. Install systemd Services ────────────────────────────────────────────
log "Installing systemd service files..."
cp "$PROJECT_DIR/deploy/quovex-backend.service" /etc/systemd/system/
cp "$PROJECT_DIR/deploy/quovex-celery-worker.service" /etc/systemd/system/
cp "$PROJECT_DIR/deploy/quovex-celery-beat.service" /etc/systemd/system/
cp "$PROJECT_DIR/deploy/quovex-dashboard.service" /etc/systemd/system/
systemctl daemon-reload

systemctl enable --now quovex-backend
systemctl enable --now quovex-celery-worker
systemctl enable --now quovex-celery-beat
systemctl enable --now quovex-dashboard

log "All services enabled and started"

# ─── 14. Own everything ──────────────────────────────────────────────────────
chown -R quovex:quovex "$PROJECT_DIR"

# ─── 15. Final Status ────────────────────────────────────────────────────────
log "================================"
log "  Quovex deployment complete!"
log "================================"
log ""
log "  API:      https://${DOMAIN_API}/health"
log "  Dashboard: https://${DOMAIN_ADMIN}"
log ""
log "  Admin credentials (saved in .env):"
echo "    Rohit@Quovex.online / ${ADMIN_PASSWORD_1}"
echo "    Kartikey@Quovex.online / ${ADMIN_PASSWORD_2}"
log ""
log "  Service status:"
systemctl is-active quovex-backend quovex-celery-worker quovex-celery-beat quovex-dashboard
log ""
log "  View logs: journalctl -u quovex-backend -f"
log "  Restart:   systemctl restart quovex-backend"
log ""
warn "  NEXT STEPS:"
warn "  1. Point DNS A records: ${DOMAIN_API} and ${DOMAIN_ADMIN} -> $(curl -4 -s ifconfig.me 2>/dev/null || echo '<VPS_IP>')"
warn "  2. Deploy website to Vercel"
warn "  3. Upload APK: scp app-release.apk root@<vps>:/opt/quovex/downloads/app-release.apk"
