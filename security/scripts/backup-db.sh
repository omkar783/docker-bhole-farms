#!/bin/bash
set -euo pipefail

# ============================================
# Daily PostgreSQL Database Backup
# ============================================

# Configuration — edit these
DB_NAME="bhole_prod"
DB_USER="bhole_user"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="/backups/db"
RETENTION_DAYS=30
GPG_RECIPIENT="backup@bholefarms.com"
S3_BUCKET="s3://bhole-backups/db/"
NOTIFICATION_URL="${NOTIFICATION_URL:-}"  # Slack/Telegram webhook

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/bhole_${TIMESTAMP}.dump"
COMPRESSED_FILE="${BACKUP_FILE}.gz"
ENCRYPTED_FILE="${COMPRESSED_FILE}.gpg"
LOG_FILE="/var/log/backup-db.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Backup] $message\"}" || true
    fi
}

cleanup() {
    rm -f "$BACKUP_FILE" "$COMPRESSED_FILE"
}

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

log "Starting database backup: ${DB_NAME}"

# Step 1: pg_dump
if ! pg_dump --host="$DB_HOST" --port="$DB_PORT" \
    --dbname="$DB_NAME" --username="$DB_USER" \
    --format=custom \
    --file="$BACKUP_FILE" 2>> "$LOG_FILE"; then
    log "ERROR: pg_dump failed"
    notify "FAILED: Database backup — pg_dump error"
    exit 1
fi
log "pg_dump completed: $(du -h "$BACKUP_FILE" | cut -f1)"

# Step 2: Compress
if ! gzip -9 "$BACKUP_FILE" 2>> "$LOG_FILE"; then
    log "ERROR: Compression failed"
    cleanup
    exit 1
fi
log "Compression completed"

# Step 3: Encrypt
if ! gpg --encrypt --recipient "$GPG_RECIPIENT" \
    --output "$ENCRYPTED_FILE" \
    "${COMPRESSED_FILE}" 2>> "$LOG_FILE"; then
    log "ERROR: Encryption failed"
    cleanup
    exit 1
fi
log "Encryption completed"
rm -f "${COMPRESSED_FILE}"

# Step 4: Upload to S3-compatible storage
if command -v rclone &> /dev/null && [[ -n "$S3_BUCKET" ]]; then
    if rclone copy "$ENCRYPTED_FILE" "$S3_BUCKET" 2>> "$LOG_FILE"; then
        log "Uploaded to S3: ${S3_BUCKET}"
    else
        log "WARNING: S3 upload failed — backup exists locally"
    fi
fi

# Step 5: Clean old backups
find "$BACKUP_DIR" -name "*.gpg" -type f -mtime "+${RETENTION_DAYS}" -delete
log "Cleaned backups older than ${RETENTION_DAYS} days"

# Step 6: Verify backup integrity
if pg_restore --list "$ENCRYPTED_FILE" &> /dev/null; then
    log "Backup integrity verified"
else
    log "WARNING: Backup integrity check failed"
    notify "WARNING: Database backup may be corrupted"
fi

# Step 7: Report
BACKUP_SIZE=$(du -h "$ENCRYPTED_FILE" | cut -f1)
log "Backup complete: ${ENCRYPTED_FILE} (${BACKUP_SIZE})"
notify "SUCCESS: Database backup — ${BACKUP_SIZE}"

exit 0
