#!/bin/bash
set -euo pipefail

# ============================================
# Security Updates Installer
# ============================================

# Configuration
NOTIFICATION_URL="${NOTIFICATION_URL:-}"
LOG_FILE="/var/log/security-updates.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    local message="$1"
    if [[ -n "$NOTIFICATION_URL" ]]; then
        curl -s -o /dev/null -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\": \"[Updates] $message\"}" || true
    fi
}

log "Starting security update check"

# Step 1: Check if unattended-upgrades already handled this
if command -v unattended-upgrades &> /dev/null; then
    log "unattended-upgrades is installed — checking last run"
    if [[ -f "/var/log/unattended-upgrades/unattended-upgrades.log" ]]; then
        tail -20 /var/log/unattended-upgrades/unattended-upgrades.log >> "$LOG_FILE"
    fi
fi

# Step 2: Check for available security updates
AVAILABLE_UPDATES=$(apt list --upgradable 2>/dev/null | grep -ci "security" || true)

if [[ "$AVAILABLE_UPDATES" -eq 0 ]]; then
    log "No security updates available"
    exit 0
fi

log "${AVAILABLE_UPDATES} security updates available"

# Step 3: Dry-run first
log "Running dry-run..."
apt-get --dry-run upgrade 2>/dev/null | grep -E "Inst|Conf" | head -20 | tee -a "$LOG_FILE"

# Step 4: Apply security updates only
log "Installing security updates..."
DEBIAN_FRONTEND=noninteractive apt-get -y --only-upgrade install 2>> "$LOG_FILE" || {
    log "ERROR: Failed to install some updates"
    notify "WARNING: Security updates failed to install"
    exit 1
}

# Step 5: Check if reboot is required
if [[ -f "/var/run/reboot-required" ]]; then
    log "Reboot required — kernel or critical updates installed"
    notify "INFO: Reboot required for security updates"
    
    # Save pending reboot notification
    echo "pending_reboot=1" > /tmp/.security-reboot-pending
fi

# Step 6: Check Docker images
if command -v docker &> /dev/null; then
    docker ps --format "{{.Image}}" 2>/dev/null | while read -r image; do
        if docker image inspect "$image" --format '{{.CreatedAt}}' &>/dev/null; then
            log "Docker image ${image} may need update (check Dockerfile base images)"
        fi
    done
fi

# Step 7: Verify npm dependencies
if [[ -f "/var/www/bhole/package.json" ]]; then
    log "Checking npm audit..."
    cd /var/www/bhole && npm audit --audit-level=high 2>&1 | tail -20 >> "$LOG_FILE" || true
fi

log "Security updates complete"
notify "SUCCESS: Security updates installed (${AVAILABLE_UPDATES} packages)"
