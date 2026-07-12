#!/usr/bin/env bash
set -euo pipefail

# ─── Quovex VPS Setup Script ─────────────────────────────────────────────────
# Run this on a fresh Ubuntu 22.04/24.04 VPS (2 vCPU, 4 GB RAM minimum).
#
#   curl -fsSL https://raw.githubusercontent.com/nowrohit90008gmailcom/quovex-backend/main/setup_vps.sh | bash
#
# Or copy to VPS and run:
#   chmod +x setup_vps.sh && ./setup_vps.sh

REPO_URL="https://github.com/nowrohit90008gmailcom/quovex-backend.git"
PROJECT_DIR="/opt/quovex"
DOMAIN_API="api.quovex.online"
DOMAIN_ADMIN="admin.quovex.online"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; }

if [[ $EUID -ne 0 ]]; then
  err "This script must be run as root (use sudo)"
  exit 1
fi

# ─── 1. System Packages ───────────────────────────────────────────────────────
log "Fixing any broken packages..."
apt-get --fix-broken install -y -qq 2>/dev/null || true

log "Updating system packages..."
apt-get update -qq
apt-get upgrade -y -qq || true

log "Installing dependencies..."
apt-get install -y -qq \
  ca-certificates curl gnupg lsb-release git ufw

# ─── 2. Install Docker ────────────────────────────────────────────────────────
if ! command -v docker &>/dev/null; then
  log "Installing Docker..."
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable --now docker
  log "Docker installed"
else
  log "Docker already installed"
fi

# ─── 3. Clone / Pull Repository ───────────────────────────────────────────────
if [[ -d "$PROJECT_DIR" ]]; then
  warn "Project directory exists — pulling latest..."
  cd "$PROJECT_DIR"
  git pull
else
  log "Cloning repository..."
  git clone "$REPO_URL" "$PROJECT_DIR"
  cd "$PROJECT_DIR"
fi

# ─── 4. Create .env File ──────────────────────────────────────────────────────
if [[ -f ".env" ]]; then
  warn ".env already exists — skipping (delete it to regenerate)"
else
  log "Creating .env file — you'll need to fill in some values..."

  # Generate secure random values
  SECRET_KEY=$(openssl rand -hex 32)
  POSTGRES_PASSWORD=$(openssl rand -base64 24)
  REDIS_PASSWORD=$(openssl rand -base64 24)

  cat > .env <<ENVEOF
ENVIRONMENT=production
SECRET_KEY=${SECRET_KEY}
DATABASE_URL=postgresql+psycopg2://quovex:${POSTGRES_PASSWORD}@db:5432/quovex
POSTGRES_USER=quovex
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=quovex
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
REDIS_PASSWORD=${REDIS_PASSWORD}
CELERY_BROKER_URL=redis://:${REDIS_PASSWORD}@redis:6379/1
CELERY_RESULT_BACKEND=redis://:${REDIS_PASSWORD}@redis:6379/2
FIREBASE_PROJECT_ID=quovex-84b14
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=supportquovex@gmail.com
EMAIL_PASS=<your-gmail-app-password>
FROM_EMAIL=supportquovex@gmail.com
ALLOWED_ORIGINS=["https://${DOMAIN_ADMIN}","https://quovex.online"]
CEREBRAS_API_KEY=<your-cerebras-api-key>
CEREBRAS_MODEL=llama3.1-8b-instruct
REWARD_BUDGET_CAP_PERCENT=35
BASE_POINTS_PER_HOUR=100
DIMINISHING_RETURNS_AFTER_HOURS=6
MAX_DAILY_HOURS_FLAG=12
SOCIAL_UNLOCK_MINUTES_PER_HOUR=15
QUIZ_SET_SIZE=10
QUIZ_QUESTION_TIME_LIMIT_SECONDS=25
MAX_QUIZ_ATTEMPTS_PER_SUBJECT_PER_DAY=5
ENVEOF

  warn "============================================"
  warn "  .env created — EDIT IT before continuing!"
  warn "  Fill in: EMAIL_PASS, CEREBRAS_API_KEY"
  warn "============================================"
  warn ""
  warn "  Also place firebase-credentials.json in:"
  warn "  ${PROJECT_DIR}"
  warn ""

  # Prompt user to edit
  read -p "Press Enter after you've edited .env and added firebase-credentials.json..."
fi

# ─── 5. Firewall ──────────────────────────────────────────────────────────────
log "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable
log "Firewall active: ports 22, 80, 443"

# ─── 6. Build & Start Services ────────────────────────────────────────────────
log "Building Docker images (this may take a few minutes)..."
docker compose -f docker-compose.prod.yml build

log "Starting services..."
docker compose -f docker-compose.prod.yml up -d

# ─── 7. Wait for Database ─────────────────────────────────────────────────────
log "Waiting for PostgreSQL to be healthy..."
for i in {1..30}; do
  if docker compose -f docker-compose.prod.yml exec -T db pg_isready -U quovex &>/dev/null; then
    log "PostgreSQL is ready"
    break
  fi
  if [[ $i -eq 30 ]]; then
    err "PostgreSQL did not become healthy — check logs: docker compose logs db"
    exit 1
  fi
  sleep 2
done

# ─── 8. Run Database Migrations ───────────────────────────────────────────────
log "Running Alembic migrations..."
docker compose -f docker-compose.prod.yml run --rm backend alembic upgrade head

# ─── 9. Create Admin Accounts ─────────────────────────────────────────────────
log "Creating admin accounts..."
docker compose -f docker-compose.prod.yml run --rm backend python create_admin.py

# ─── 10. Final Status ─────────────────────────────────────────────────────────
log "============================================"
log "  Quovex is deployed!"
log "============================================"
log ""
log "  API:      https://${DOMAIN_API}/health"
log "  Dashboard: https://${DOMAIN_ADMIN}"
log "  Website:   https://quovex.online (Vercel)"
log ""
log "  Admin login:"
log "    Rohit@Quovex.online / somehowimetyou"
log "    Kartikey@Quovex.online / somehowyouleftme"
log ""
warn "  NEXT STEPS:"
warn "  1. Point DNS A records to this server's IP:"
warn "     ${DOMAIN_API}   → $(curl -4 -s ifconfig.me 2>/dev/null || echo '<VPS_IP>')"
warn "     ${DOMAIN_ADMIN} → $(curl -4 -s ifconfig.me 2>/dev/null || echo '<VPS_IP>')"
warn "  2. Deploy website to Vercel"
warn "  3. Build & distribute the Flutter APK"
log ""
log "  View logs: docker compose -f docker-compose.prod.yml logs -f"
log "  Stop:      docker compose -f docker-compose.prod.yml down"
log "  Backup DB: docker compose -f docker-compose.prod.yml exec db_backup ..."
