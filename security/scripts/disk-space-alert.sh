#!/bin/bash
set -euo pipefail

# ============================================
# Disk Space Alert Monitor
# ============================================

# Configuration
ALERT_THRESHOLD=80
CRITICAL_THRESHOLD=90
CHECK_PATHS=("/" "/var" "/docker" "/backups")
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
LOG_FILE="/var/log/disk-space.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Disk] $message\"}" || true
    fi
}

check_path() {
    local path="$1"
    
    if [[ ! -d "$path" ]]; then
        log "SKIP: ${path} does not exist"
        return 0
    fi
    
    local usage
    usage=$(df -h "$path" | tail -1 | awk '{print $5}' | sed 's/%//')
    local inode_usage
    inode_usage=$(df -i "$path" | tail -1 | awk '{print $5}' | sed 's/%//')
    local available
    available=$(df -h "$path" | tail -1 | awk '{print $4}')
    
    log "${path}: ${usage}% used (${available} free), inodes: ${inode_usage}%"
    
    if [[ "$usage" -ge "$CRITICAL_THRESHOLD" ]]; then
        notify "🚨 CRITICAL: ${path} is ${usage}% full (${available} free)"
        
        # Find largest directories for debugging
        log "Largest directories in ${path}:"
        du -h "${path}" 2>/dev/null | sort -rh | head -5 | tee -a "$LOG_FILE"
        
        return 2
    elif [[ "$usage" -ge "$ALERT_THRESHOLD" ]]; then
        notify "⚠️ WARNING: ${path} is ${usage}% full (${available} free)"
        return 1
    fi
    
    return 0
}

log "Starting disk space check"

alert_count=0
for path in "${CHECK_PATHS[@]}"; do
    check_path "$path" || alert_count=$((alert_count + 1))
done

if [[ "$alert_count" -eq 0 ]]; then
    log "All paths OK"
else
    log "${alert_count} paths above threshold"
fi

exit 0
