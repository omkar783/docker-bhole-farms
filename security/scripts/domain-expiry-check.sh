#!/bin/bash
set -euo pipefail

# ============================================
# Domain Expiry Checker
# ============================================

# Configuration
DOMAINS=("bholefarms.com")
ALERT_DAYS=(90 60 30 14 7)
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
LOG_FILE="/var/log/domain-check.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Domain] $message\"}" || true
    fi
}

check_domain() {
    local domain="$1"
    
    if ! command -v whois &> /dev/null; then
        log "ERROR: whois command not found"
        return 1
    fi
    
    local whois_output
    whois_output=$(whois "$domain" 2>/dev/null) || {
        log "ERROR: whois lookup failed for ${domain}"
        return 1
    }
    
    # Try different whois date formats
    local expiry_date
    expiry_date=$(echo "$whois_output" | grep -iE "Registry Expiry Date|Expiration Date|Expiry Date|paid-till" | head -1 | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | head -1)
    
    if [[ -z "$expiry_date" ]]; then
        # Try DD-MM-YYYY format
        expiry_date=$(echo "$whois_output" | grep -iE "Registry Expiry Date|Expiration Date" | head -1 | grep -oE '[0-9]{2}-[0-9]{2}-[0-9]{4}' | head -1)
        if [[ -n "$expiry_date" ]]; then
            expiry_date=$(date -d "$expiry_date" +%Y-%m-%d 2>/dev/null)
        fi
    fi
    
    if [[ -z "$expiry_date" ]]; then
        log "WARNING: Could not parse expiry date for ${domain}"
        log "Raw whois output available at /tmp/${domain}.whois"
        echo "$whois_output" > "/tmp/${domain}.whois"
        return 1
    fi
    
    local expiry_epoch
    expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null)
    local now_epoch
    now_epoch=$(date +%s)
    local days_left=$(( (expiry_epoch - now_epoch) / 86400 ))
    
    log "${domain}: ${days_left} days until domain expiry (${expiry_date})"
    
    for threshold in "${ALERT_DAYS[@]}"; do
        if [[ "$days_left" -le "$threshold" ]]; then
            notify "⚠️ ${domain} expires in ${days_left} days (${expiry_date})"
            break
        fi
    done
    
    if [[ "$days_left" -le 0 ]]; then
        notify "🚨 ${domain} HAS EXPIRED!"
        return 1
    fi
    
    echo "{\"domain\":\"${domain}\",\"days_left\":${days_left},\"expiry\":\"${expiry_date}\"}"
}

log "Starting domain expiry check"

for domain in "${DOMAINS[@]}"; do
    check_domain "$domain" || true
done

log "Domain check complete"
