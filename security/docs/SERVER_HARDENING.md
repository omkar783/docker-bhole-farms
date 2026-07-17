# Server Hardening Guide — Ubuntu

> Hardening steps for the Ubuntu server hosting Bhole Farms application
> and supporting services (Docker, PostgreSQL, Nginx).

---

## 1. Initial Setup — Create a Normal User

```bash
# Create deploy user with sudo
adduser deploy
usermod -aG sudo deploy

# Switch to the new user
su - deploy
```

## 2. Disable Root Login

```bash
# Edit SSH config
sudo vim /etc/ssh/sshd_config

# Set:
PermitRootLogin no

# Restart SSH
sudo systemctl restart sshd
```

## 3. SSH Key Authentication

```bash
# On your local machine, generate a key pair
ssh-keygen -t ed25519 -a 100 -f ~/.ssh/bhole_deploy

# Copy the public key to the server
ssh-copy-id -i ~/.ssh/bhole_deploy.pub deploy@your-server-ip

# On the server, verify key login works, then disable passwords:
sudo vim /etc/ssh/sshd_config

# Set:
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM no

# Restart SSH
sudo systemctl restart sshd
```

## 4. UFW Firewall

```bash
# Default deny
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow specific ports
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw allow 6443/tcp      # Kubernetes API (if used)
sudo ufw allow 9090/tcp      # Prometheus / monitoring

# Enable
sudo ufw enable
sudo ufw status verbose
```

## 5. Fail2Ban

```bash
sudo apt install fail2ban -y

# Copy default config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit /etc/fail2ban/jail.local
# Under [sshd]:
# enabled  = true
# maxretry = 5
# bantime  = 3600

# Restart
sudo systemctl enable fail2ban
sudo systemctl restart fail2ban

# Check status
sudo fail2ban-client status sshd
```

## 6. Automatic Security Updates

```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Check config at /etc/apt/apt.conf.d/50unattended-upgrades
# Ensure these are enabled:
#   "${distro_id}:${distro_codename}-security"
#   "${distro_id}:${distro_codename}-updates"

# Enable auto-reboot if needed (for kernel updates):
# Uncomment: Unattended-Upgrade::Automatic-Reboot "true";
# Set: Unattended-Upgrade::Automatic-Reboot-Time "03:00";
```

## 7. Docker Daemon Security

```bash
# Run Docker in rootless mode (Docker v20.10+)
# Or at minimum, restrict root usage:

# Edit /etc/docker/daemon.json
{
  "icc": false,
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "live-restore": true,
  "userland-proxy": false,
  "no-new-privileges": true
}

# Restart Docker
sudo systemctl restart docker
```

### Docker container best practices

- Each container runs as a non-root user (`USER` directive in Dockerfile)
- Filesystems are read-only where possible (`read_only: true` in compose)
- Resource limits set (`--memory`, `--cpus`)
- Capabilities dropped: `--cap-drop ALL --cap-add NET_BIND_SERVICE`

## 8. Kernel Hardening (sysctl)

```bash
# Edit /etc/sysctl.d/99-security.conf

# IP Spoofing protection
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# SYN flood protection
net.ipv4.tcp_syncookies = 1

# Apply
sudo sysctl -p /etc/sysctl.d/99-security.conf
```

## 9. Auditd

```bash
sudo apt install auditd -y

# Watch critical files
sudo auditctl -w /etc/passwd -p wa -k passwd_changes
sudo auditctl -w /etc/shadow -p wa -k shadow_changes
sudo auditctl -w /etc/ssh/sshd_config -p wa -k sshd_config
sudo auditctl -w /var/www -p wa -k www_changes
sudo auditctl -w /etc/docker -p wa -k docker_config

# View logs
sudo ausearch -k passwd_changes
```

## 10. Log Rotation

```bash
# Edit /etc/logrotate.conf or add to /etc/logrotate.d/

# Example for app logs at /etc/logrotate.d/bhole-app
/var/log/bhole/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

## Verification Checklist

- [ ] Root login disabled
- [ ] Password authentication disabled
- [ ] SSH key-only access confirmed
- [ ] UFW enabled with correct rules
- [ ] Fail2Ban running and monitoring SSH
- [ ] Automatic security updates enabled
- [ ] Docker in rootless or restricted mode
- [ ] sysctl hardening applied
- [ ] auditd watching critical files
- [ ] Log rotation configured
