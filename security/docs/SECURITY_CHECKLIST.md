# Security Checklist — Monthly Review

> Run this checklist every month to ensure the Bhole Farms platform
> remains secure. Check off completed items and note action items.

---

## Passwords & Access

- [ ] Registrar password changed or verified strong (20+ chars, unique)
- [ ] 2FA verified on all accounts (registrar, Cloudflare, GitHub, Vercel)
- [ ] No stale user accounts in admin panel
- [ ] No shared or leaked credentials in GitHub (run secret scan)

## Backups

- [ ] Latest database backup verified restorable (restore to staging)
- [ ] Weekly file backup exists and is not corrupted
- [ ] Off-site backup accessible and up to date
- [ ] Backup disk space sufficient for next 30 days

## Dependencies

- [ ] `npm audit` shows zero critical or high vulnerabilities
- [ ] All npm dependencies up-to-date (`npm outdated` checked)
- [ ] Dependabot PRs reviewed and merged
- [ ] Docker images updated (if self-hosted)
- [ ] Node.js version supported and patched

## SSL & DNS

- [ ] SSL certificate valid for 30+ days (check expiry)
- [ ] Cloudflare SSL set to Full (strict)
- [ ] DNSSEC enabled and active
- [ ] DNS records match expected configuration
- [ ] No unauthorized DNS changes

## Logs & Monitoring

- [ ] UptimeRobot reports 100% uptime (or note incidents)
- [ ] Better Stack shows no SSL alerts
- [ ] Google Search Console shows no security issues
- [ ] Server logs reviewed for suspicious activity
- [ ] Failed login attempts reviewed (Fail2Ban status)

## Application Security

- [ ] Security headers present in all responses (check with curl -I)
- [ ] CSP not blocking legitimate resources
- [ ] Rate limiting working on contact and auth endpoints
- [ ] File upload validation active (type, size, sanitization)
- [ ] Admin routes properly authenticated

## GitHub Security

- [ ] Dependabot alerts reviewed and resolved
- [ ] Code scanning results reviewed (no new findings)
- [ ] Secret scanning alerts cleared
- [ ] Branch protection rules enforced on main
- [ ] Repository access reviewed (no stale collaborators)

## Incident Preparedness

- [ ] Incident response plan reviewed and updated
- [ ] Emergency contact list up to date
- [ ] DR restore procedure tested within last 30 days
- [ ] Off-site backup access confirmed working

## Server Health (if self-hosted)

- [ ] Disk usage below 80%
- [ ] UFW firewall enabled and rules correct
- [ ] Fail2Ban active and has blocked recent attempts
- [ ] Automatic security updates running
- [ ] No unexpected running processes or Docker containers
- [ ] System logs reviewed for errors or warnings

---

## Quick Health Command

```bash
# Run this monthly to check key indicators
echo "=== DISK ===" && df -h /
echo "=== DOCKER ===" && docker ps --all
echo "=== FAIL2BAN ===" && sudo fail2ban-client status sshd
echo "=== UPTIME ===" && uptime
echo "=== SSL ===" && echo | openssl s_client -connect bholefarms.com:443 -servername bholefarms.com 2>/dev/null | openssl x509 -noout -dates
echo "=== LAST LOGINS ===" && last -10
```

---

## Previous Month's Action Items

| Action Item | Owner | Due Date | Status |
|-------------|-------|----------|--------|
| | | | |
| | | | |
| | | | |
