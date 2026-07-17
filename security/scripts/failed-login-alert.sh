#!/bin/bash
set -euo pipefail

# ============================================
# Failed Login Alert Monitor
# ============================================

# Configuration
MAX_FAILURES_PER_IP=5
WINDOW_MINUTES=60
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
LOG_FILE="/var/log/failed-login.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Security] $message\"}" || true
    fi
}

log "Starting failed login analysis"

# Check SSH failures
if [[ -f "/var/log/auth.log" ]]; then
    AUTH_LOG="/var/log/auth.log"
elif [[ -f "/var/log/secure" ]]; then
    AUTH_LOG="/var/log/secure"
else
    log "No auth log found"
    AUTH_LOG=""
fi

if [[ -n "$AUTH_LOG" ]]; then
    # Count failed SSH attempts per IP in the last window
    local failures
    failures=$(grep "Failed password" "$AUTH_LOG" 2>/dev/null | \
        grep -oP 'from \K[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | \
        sort | uniq -c | sort -rn | head -10) || true
    
    if [[ -n "$failures" ]]; then
        echo "$failures" | while read -r count ip; do
            count=$(echo "$count" | tr -d ' ')
            if [[ "$count" -ge "$MAX_FAILURES_PER_IP" ]]; then
                log "ALERT: ${count} failed SSH attempts from ${ip}"
                notify "⚠️ ${count} failed SSH logins from ${ip} in last window"
            fi
        done
    fi
    
    # Check sudo failures
    local sudo_failures
    sudo_failures=$(grep "authentication failure" "$AUTH_LOG" 2>/dev/null | \
        grep "sudo" | wc -l) || true
    
    if [[ "$sudo_failures" -gt 0 ]]; then
        log "ALERT: ${sudo_failures} failed sudo attempts"
        notify "⚠️ ${sudo_failures} failed sudo attempts detected"
    fi
fi

# Check Docker container logs for app-level failures
if command -v docker &> /dev/null; then
    docker ps -q 2>/dev/null | while read -r cid; do
        cname=$(docker inspect --format '{{.Name}}' "$cid" | sed 's/^\///')
        recent_failures=$(docker logs --since "${WINDOW_MINUTES}m" "$cid" 2>&1 | \
            grep -ciE "unauthorized|invalid login|failed login|401|403" || true)
        
        if [[ "$recent_failures" -gt 0 ]]; then
            log "App login failures in ${cname}: ${recent_failures}"
        fi
    done
fi

# Check NextAuth sign-in attempts (from application logs)
if [[ -f "/var/log/bhole/app.log" ]]; then
    nextauth_failures=$(grep "signIn.*error" /var/log/bhole/app.log 2>/dev/null | \
        grep -oP '(?<=email: )[^\s]+' | sort | uniq -c | sort -rn | head -5) || true
    
    if [[ -n "$nextauth_failures" ]]; then
        log "NextAuth failures:"
        echo "$nextauth_failures" | tee -a "$LOG_FILE"
    fi
fi

log "Failed login analysis complete"
