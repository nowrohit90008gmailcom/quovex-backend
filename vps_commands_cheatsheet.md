# Quovex VPS Commands Cheat Sheet

This file contains the most important commands you'll need to manage, troubleshoot, and update your native VPS setup. All these commands should be run while connected to your VPS via SSH as the `root` user.

## 1. Managing Services (Start, Stop, Restart)
You have four custom services running your app: `quovex-backend`, `quovex-dashboard`, `quovex-celery-worker`, and `quovex-celery-beat`.

**Check the status of a service:**
```bash
systemctl status quovex-backend
```

**Restart a service (useful after pulling new code):**
```bash
systemctl restart quovex-backend
```

**Restart all services at once:**
```bash
systemctl restart quovex-backend quovex-dashboard quovex-celery-worker quovex-celery-beat
```

## 2. Viewing Live Logs
If something is crashing or you want to monitor traffic, `journalctl` is your best friend. The `-f` flag "follows" the log live. Press `Ctrl + C` to stop watching.

**Backend API Logs:**
```bash
journalctl -u quovex-backend -f
```

**Dashboard Logs:**
```bash
journalctl -u quovex-dashboard -f
```

**Celery Background Tasks (Email/AI) Logs:**
```bash
journalctl -u quovex-celery-worker -f
```

**Web Server (Caddy) Logs (for SSL/Routing issues):**
```bash
journalctl -u caddy -f
```

## 3. Updating Code (Deploying Changes)
When you push new code from your PC to GitHub, it doesn't automatically go to the VPS. Run these commands on the VPS to pull the changes and apply them:

**Pull latest code from GitHub:**
```bash
cd /opt/quovex
git pull
```

**If you changed Python dependencies (`requirements.txt`):**
```bash
cd /opt/quovex
./venv/bin/pip install -r requirements.txt
systemctl restart quovex-backend quovex-celery-worker
```

**If you changed Database Models (Alembic Migrations):**
```bash
cd /opt/quovex
./venv/bin/alembic upgrade head
systemctl restart quovex-backend
```

**If you changed the Next.js Dashboard code:**
```bash
cd /opt/quovex/dashboard
npm ci
NEXT_PUBLIC_API_URL="https://api.quovex.online/api/v1" npm run build
systemctl restart quovex-dashboard
```

## 4. Database Access (PostgreSQL)
To run raw SQL queries or inspect your database directly on the VPS:

**Open the PostgreSQL Console:**
```bash
su - postgres
psql -d quovex
```
*(Type `\q` and hit Enter to exit, then type `exit` to go back to root).*

## 5. Server Health and Troubleshooting
Commands to check how your VPS is performing and if you are running out of resources.

**Check available Memory (RAM):**
```bash
free -h
```

**Check available Disk Space:**
```bash
df -h /
```

**View active processes (like Task Manager):**
```bash
htop
```
*(Press `q` or `F10` to exit htop)*

**Reboot the entire VPS server safely:**
```bash
reboot
```

## 6. Security and SSL
Caddy handles your SSL automatically, but if you need to troubleshoot HTTPS or Firewall issues:

**Check UFW (Firewall) status and open ports:**
```bash
ufw status verbose
```

**Force Caddy to reload (useful if you changed domains):**
```bash
systemctl reload caddy
```

## 7. File Transfers (Run these on your local PC!)
If you need to move a specific file to or from the VPS, use `scp` in your local PowerShell or Terminal.

**Upload a file to the VPS:**
```bash
scp C:\path\to\your\file.json root@<YOUR_VPS_IP>:/opt/quovex/
```

**Download a file from the VPS:**
```bash
scp root@<YOUR_VPS_IP>:/opt/quovex/some_log.txt C:\path\to\save\
```  

## 8. Database Backups
Backups run automatically every day at 3:00 AM UTC via cron. They are stored in `/opt/quovex/backups/`.

**Verify backup cron is active:**
```bash
cat /etc/cron.d/quovex-backup        # should show the cron line
systemctl is-active cron              # should show "active"
```

**Manually trigger a backup (test it now):**
```bash
sudo -u quovex /opt/quovex/deploy/backup.sh
cat /var/log/quovex-backup.log
```

**List available backups:**
```bash
ls -lh /opt/quovex/backups/
```

**Restore the latest backup (replaces existing DB):**
```bash
PGPASSWORD=$(grep POSTGRES_PASSWORD /opt/quovex/.env | cut -d= -f2-) \
pg_restore -h 127.0.0.1 -U quovex -d quovex --clean /opt/quovex/backups/latest.sql.gz
```

**Restore to a new database (safety first):**
```bash
su - postgres -c "createdb quovex_restore"
PGPASSWORD=$(grep POSTGRES_PASSWORD /opt/quovex/.env | cut -d= -f2-) \
pg_restore -h 127.0.0.1 -U quovex -d quovex_restore /opt/quovex/backups/latest.sql.gz
```

**Inspect backup contents without restoring:**
```bash
pg_restore --list /opt/quovex/backups/latest.sql.gz | head -50
```

**Restore a single table (e.g., users):**
```bash
PGPASSWORD=$(grep POSTGRES_PASSWORD /opt/quovex/.env | cut -d= -f2-) \
pg_restore -h 127.0.0.1 -U quovex -d quovex --table=users /opt/quovex/backups/latest.sql.gz
```

// push to git from pc
cd C:\Users\Testbook\Downloads\study\studytimer_backend
git add setup_native.sh; git commit -m "Fix: always rm -rf and clone fresh to avoid useradd dir conflict"; git push origin main