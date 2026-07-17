#!/bin/bash
set -euo pipefail

# ============================================
# Weekly Full Backup (Database + Files + Config)
# ============================================

# Configuration
BACKUP_DIR="/backups/weekly"
RETENTION_WEEKS=4
GPG_RECIPIENT="backup@bholefarms.com"
S3_BUCKET="s3://bhole-backups/weekly/"
NOTIFICATION_URL="${NOTIFICATION_URL:-}"

TIMESTAMP=$(date +%Y%m%d)
ARCHIVE_NAME="bhole_full_${TIMESTAMP}"
ARCHIVE_FILE="${BACKUP_DIR}/${ARCHIVE_NAME}.tar.gz"
ENCRYPTED_FILE="${ARCHIVE_FILE}.gpg"
LOG_FILE="/var/log/weekly-backup.log"

PATHS_TO_BACKUP=(
    "/var/www/bhole"
    "/etc/nginx"
    "/etc/docker"
    "/etc/ssh/sshd_config"
    "/var/lib/docker/volumes"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Weekly Backup] $message\"}" || true
    fi
}

mkdir -p "$BACKUP_DIR"
log "Starting weekly full backup"

# Step 1: Database dump (full cluster)
DB_DUMP_FILE="/tmp/pg_dumpall_${TIMESTAMP}.sql"
if pg_dumpall --username=postgres --file="$DB_DUMP_FILE" 2>> "$LOG_FILE"; then
    log "Database dumpall completed: $(du -h "$DB_DUMP_FILE" | cut -f1)"
else
    log "WARNING: pg_dumpall failed — continuing without DB dump"
    DB_DUMP_FILE=""
fi

# Step 2: Create tar archive
TAR_FILES=("${PATHS_TO_BACKUP[@]}")
if [[ -n "${DB_DUMP_FILE:-}" ]]; then
    TAR_FILES+=("$DB_DUMP_FILE")
fi

if ! tar -czf "$ARCHIVE_FILE" "${TAR_FILES[@]}" 2>> "$LOG_FILE"; then
    log "ERROR: tar archive failed"
    rm -f "$DB_DUMP_FILE"
    exit 1
fi
log "Archive created: $(du -h "$ARCHIVE_FILE" | cut -f1)"

# Cleanup temp files
rm -f "$DB_DUMP_FILE"

# Step 3: Encrypt
if ! gpg --encrypt --recipient "$GPG_RECIPIENT" \
    --output "$ENCRYPTED_FILE" "$ARCHIVE_FILE" 2>> "$LOG_FILE"; then
    log "ERROR: Encryption failed"
    exit 1
fi
rm -f "$ARCHIVE_FILE"
log "Encryption completed"

# Step 4: Upload off-site
if command -v rclone &> /dev/null && [[ -n "$S3_BUCKET" ]]; then
    rclone copy "$ENCRYPTED_FILE" "$S3_BUCKET" 2>> "$LOG_FILE" || \
        log "WARNING: S3 upload failed"
    
    # Also copy to Google Drive if configured
    if rclone listremotes 2>/dev/null | grep -q "gdrive"; then
        rclone copy "$ENCRYPTED_FILE" "gdrive:/bhole-backups/weekly/" 2>> "$LOG_FILE" || \
            log "WARNING: Google Drive upload failed"
    fi
fi

# Step 5: Clean old backups
find "$BACKUP_DIR" -name "*.gpg" -type f -mtime "+$((RETENTION_WEEKS * 7))" -delete
log "Cleaned backups older than ${RETENTION_WEEKS} weeks"

BACKUP_SIZE=$(du -h "$ENCRYPTED_FILE" | cut -f1)
log "Weekly backup complete: ${ENCRYPTED_FILE} (${BACKUP_SIZE})"
notify "SUCCESS: Weekly backup — ${BACKUP_SIZE}"
