#!/bin/bash
set -euo pipefail

# ============================================
# SSL Certificate Expiry Checker
# ============================================

# Configuration
DOMAINS=(
    "bholefarms.com"
    "www.bholefarms.com"
)
ALERT_DAYS=(30 14 7 3 1)
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
LOG_FILE="/var/log/ssl-check.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[SSL] $message\"}" || true
    fi
}

check_domain() {
    local domain="$1"
    
    # Get certificate expiry date
    local expiry_date
    expiry_date=$(echo | \
        openssl s_client -connect "${domain}:443" -servername "$domain" 2>/dev/null | \
        openssl x509 -noout -enddate 2>/dev/null | \
        cut -d= -f2)
    
    if [[ -z "$expiry_date" ]]; then
        log "ERROR: Could not retrieve certificate for ${domain}"
        notify "ERROR: Cannot check SSL for ${domain}"
        return 1
    fi
    
    # Calculate days until expiry
    local expiry_epoch
    expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null)
    local now_epoch
    now_epoch=$(date +%s)
    local days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
    
    log "${domain}: ${days_left} days until expiry (expires ${expiry_date})"
    
    # Check alert thresholds
    for threshold in "${ALERT_DAYS[@]}"; do
        if [[ "$days_left" -le "$threshold" ]]; then
            notify "⚠️ ${domain} SSL expires in ${days_left} days (${expiry_date})"
            break
        fi
    done
    
    if [[ "$days_left" -le 0 ]]; then
        notify "🚨 ${domain} SSL HAS EXPIRED!"
        return 1
    fi
    
    # JSON output for monitoring
    echo "{\"domain\":\"${domain}\",\"days_left\":${days_left},\"expiry\":\"${expiry_date}\",\"status\":\"$([[ $days_left -gt 30 ]] && echo 'ok' || echo 'expiring')\"}"
    return 0
}

log "Starting SSL certificate check"
RESULTS="["

for domain in "${DOMAINS[@]}"; do
    result=$(check_domain "$domain") || true
    RESULTS+="${result},"
done

RESULTS="${RESULTS%,}]"
echo "$RESULTS" > /tmp/ssl-check-results.json

log "SSL check complete"
