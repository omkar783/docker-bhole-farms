#!/bin/bash
set -euo pipefail

# ============================================
# Log Cleanup and Rotation
# ============================================

# Configuration
LOG_RETENTION_DAYS=30
DOCKER_LOG_MAX_SIZE="100m"
JOURNAL_RETENTION_DAYS=7
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
LOG_FILE="/var/log/log-cleanup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Logs] $message\"}" || true
    fi
}

total_space_reclaimed=0

clean_dir_size() {
    local dir="$1"
    if [[ -d "$dir" ]]; then
        du -sh "$dir" 2>/dev/null | cut -f1
    else
        echo "0B"
    fi
}

log "Starting log cleanup"

# Record sizes before cleanup
BEFORE_LOGS=$(clean_dir_size "/var/log")
BEFORE_JOURNAL=$(journalctl --disk-usage 2>/dev/null | awk '{print $NF}' || echo "0B")
log "Current sizes — /var/log: ${BEFORE_LOGS}, journal: ${BEFORE_JOURNAL}"

# Step 1: Clean old compressed logs
find /var/log -name "*.gz" -type f -mtime "+${LOG_RETENTION_DAYS}" -delete 2>/dev/null
find /var/log -name "*.old" -type f -mtime "+${LOG_RETENTION_DAYS}" -delete 2>/dev/null
find /var/log -name "*.1" -type f -mtime "+${LOG_RETENTION_DAYS}" -delete 2>/dev/null
log "Cleaned logs older than ${LOG_RETENTION_DAYS} days"

# Step 2: Truncate Docker container logs (>100MB)
if command -v docker &> /dev/null; then
    docker ps -q 2>/dev/null | while read -r cid; do
        log_path=$(docker inspect --format '{{.LogPath}}' "$cid" 2>/dev/null)
        if [[ -n "$log_path" ]] && [[ -f "$log_path" ]]; then
            log_size=$(stat -c%s "$log_path" 2>/dev/null || echo 0)
            max_size_bytes=$(( $(echo "$DOCKER_LOG_MAX_SIZE" | sed 's/m//') * 1024 * 1024 ))
            
            if [[ "$log_size" -gt "$max_size_bytes" ]]; then
                cname=$(docker inspect --format '{{.Name}}' "$cid" | sed 's/^\///')
                before_size=$(du -h "$log_path" | cut -f1)
                truncate -s 0 "$log_path"
                log "Truncated Docker log: ${cname} (was ${before_size})"
            fi
        fi
    done
    
    # Prune unused Docker data
    docker system prune -f --filter "until=${LOG_RETENTION_DAYS}h" 2>/dev/null || true
    log "Docker system prune completed"
fi

# Step 3: Clean journald logs
if command -v journalctl &> /dev/null; then
    journalctl --vacuum-time="${JOURNAL_RETENTION_DAYS}days" 2>/dev/null || true
    log "Journal vacuumed to ${JOURNAL_RETENTION_DAYS} days"
fi

# Step 4: Clean app-specific logs
APP_LOG_DIRS=(
    "/var/log/bhole"
    "/var/log/nginx"
    "/var/log/postgresql"
)

for dir in "${APP_LOG_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        find "$dir" -name "*.log.*" -type f -mtime "+${LOG_RETENTION_DAYS}" -delete 2>/dev/null
        log "Cleaned ${dir}"
    fi
done

# Step 5: Report space reclaimed
AFTER_LOGS=$(clean_dir_size "/var/log")
AFTER_JOURNAL=$(journalctl --disk-usage 2>/dev/null | awk '{print $NF}' || echo "0B")
log "After cleanup — /var/log: ${AFTER_LOGS}, journal: ${AFTER_JOURNAL}"
log "Log cleanup complete"

exit 0
