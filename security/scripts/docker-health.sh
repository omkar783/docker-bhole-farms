#!/bin/bash
set -euo pipefail

# ============================================
# Docker Container Health Check
# ============================================

# Configuration
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
LOG_FILE="/var/log/docker-health.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Docker] $message\"}" || true
    fi
}

if ! command -v docker &> /dev/null; then
    log "Docker not installed — skipping"
    exit 0
fi

log "Starting Docker health check"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    notify "🚨 Docker daemon is not running!"
    exit 1
fi

containers=$(docker ps -q 2>/dev/null)
if [[ -z "$containers" ]]; then
    log "No running containers"
    exit 0
fi

issues=0

for container_id in $containers; do
    container_name=$(docker inspect --format '{{.Name}}' "$container_id" | sed 's/^\///')
    
    # Check restart count
    restart_count=$(docker inspect --format '{{.RestartCount}}' "$container_id")
    if [[ "$restart_count" -gt 5 ]]; then
        log "WARNING: ${container_name} has restarted ${restart_count} times"
        notify "⚠️ ${container_name} restarted ${restart_count} times"
        issues=$((issues + 1))
    fi
    
    # Check health status (if healthcheck configured)
    health_status=$(docker inspect --format '{{.State.Health.Status}}' "$container_id" 2>/dev/null)
    if [[ -n "$health_status" ]] && [[ "$health_status" != "healthy" ]] && [[ "$health_status" != "<nil>" ]]; then
        log "WARNING: ${container_name} health status: ${health_status}"
        notify "⚠️ ${container_name} is ${health_status}"
        issues=$((issues + 1))
    fi
    
    # Check uptime
    started_at=$(docker inspect --format '{{.State.StartedAt}}' "$container_id")
    started_epoch=$(date -d "$started_at" +%s 2>/dev/null || echo 0)
    now_epoch=$(date +%s)
    uptime_min=$(( (now_epoch - started_epoch) / 60 ))
    
    if [[ "$uptime_min" -lt 5 ]]; then
        log "INFO: ${container_name} just started (${uptime_min}m ago)"
    fi
    
    # Get resource usage
    stats=$(docker stats --no-stream --format \
        "{{.Name}}\t{{.CPUPerc}}\t{{.MemPerc}}\t{{.MemUsage}}" "$container_id" 2>/dev/null || true)
    
    log "${container_name}: CPU ${stats}"
done

if [[ "$issues" -eq 0 ]]; then
    log "All containers healthy"
else
    log "${issues} container(s) with issues"
fi

exit 0
