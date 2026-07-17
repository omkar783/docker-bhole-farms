#!/bin/bash
set -euo pipefail

# ============================================
# HTTP Health Check Script
# ============================================

# Configuration
URLS=(
    "https://bholefarms.com"
    "https://bholefarms.com/products"
    "https://bholefarms.com/api/contact"
    "https://bholefarms.com/admin/login"
)
EXPECTED_STATUS=200
TIMEOUT=10
MAX_RETRIES=3
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
LOG_FILE="/var/log/health-check.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Health] $message\"}" || true
    fi
}

check_url() {
    local url="$1"
    local attempt=1
    local max_attempts=$MAX_RETRIES
    
    while [[ "$attempt" -le "$max_attempts" ]]; do
        local start_time
        start_time=$(date +%s%N)
        
        local http_code
        http_code=$(curl -s -o /dev/null -w "%{http_code}" \
            --max-time "$TIMEOUT" \
            --connect-timeout 5 \
            "$url" 2>/dev/null || echo "000")
        
        local end_time
        end_time=$(date +%s%N)
        local response_time_ms=$(( (end_time - start_time) / 1000000 ))
        
        if [[ "$http_code" == "$EXPECTED_STATUS" ]]; then
            if [[ "$response_time_ms" -gt 5000 ]]; then
                log "WARNING: ${url} is slow (${response_time_ms}ms) — HTTP ${http_code}"
            else
                log "OK: ${url} — HTTP ${http_code} (${response_time_ms}ms)"
            fi
            return 0
        elif [[ "$http_code" == "000" ]]; then
            log "RETRY ${attempt}/${max_attempts}: ${url} — connection failed"
        else
            log "RETRY ${attempt}/${max_attempts}: ${url} — HTTP ${http_code}"
        fi
        
        attempt=$((attempt + 1))
        [[ "$attempt" -le "$max_attempts" ]] && sleep 5
    done
    
    log "FAILED: ${url} after ${max_attempts} retries"
    notify "🚨 Health check FAILED: ${url} (HTTP ${http_code:-timeout})"
    return 1
}

log "Starting health check"

failures=0
for url in "${URLS[@]}"; do
    check_url "$url" || failures=$((failures + 1))
done

if [[ "$failures" -eq 0 ]]; then
    log "All checks passed"
else
    log "${failures}/${#URLS[@]} checks failed"
fi

exit "$failures"
