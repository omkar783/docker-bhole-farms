# Incident Response Plan

> For Bhole Farms — what to do when something goes wrong.

---

## Severity Levels

| Level | Definition | Examples | Response Time |
|-------|------------|----------|--------------|
| **SEV1** | Complete outage or data breach | Site down, database compromised, customer data exposed | Immediate |
| **SEV2** | Major feature broken | Admin panel down, checkout broken | 1 hour |
| **SEV3** | Minor issue | Styling bug, non-critical feature broken | 24 hours |
| **SEV4** | Cosmetic / informational | Typo, low-priority enhancement | Next release |

---

## Detection Sources

| Source | What It Detects | Severity |
|--------|----------------|----------|
| UptimeRobot | Website down | SEV1 |
| Better Stack | SSL expiry | SEV2 |
| Google Search Console | Malware, hacked content | SEV1 |
| Fail2Ban | Brute force attacks | SEV2 |
| Custom health scripts | Disk full, Docker down | SEV2 |
| User report | Anything | Varies |
| GitHub Security Alerts | Dependency vulnerabilities | SEV2-SEV3 |

---

## Response Roles

| Role | Person | Responsibility |
|------|--------|---------------|
| Incident Commander | Site owner | Overall coordination, go/no-go for mitigations |
| Technical Lead | Developer | Root cause analysis, fix implementation |
| Communications | Site owner | User notifications, status updates |
| Scribe | Anyone | Document timeline and actions taken |

> For a small team, one person fills multiple roles.
> The **Incident Commander** delegates when overwhelmed.

---

## SEV1 Response Procedure

### 1. Containment (First 15 Minutes)

```bash
# Option A: Put site in maintenance mode
# Add to Cloudflare WAF: block all traffic except your IP
# Or deploy a maintenance page

# Option B: If server compromised — isolate it
# Stop Docker containers
docker stop $(docker ps -q)

# Or shut down the server
sudo shutdown -h now
```

### 2. Assessment (15-30 Minutes)

Determine:
- What happened? (compromise, outage, data loss)
- When did it start? (check logs, monitoring timeline)
- What is affected? (data, users, infrastructure)
- Is it ongoing?

### 3. Eradication

```bash
# Take a forensic snapshot first (before any cleanup)
# For Vercel: take note of the current deployment
vercel list
vercel logs --since 1h

# For server: snapshot the disk before cleanup
# (via your cloud provider dashboard)

# Remove the threat
# - Rotate credentials (see Recovery section)
# - Apply security patches
# - Restore from clean backup
```

### 4. Recovery

```bash
# Restore database from last clean backup
pg_restore --clean --dbname=bhole_prod /backups/clean_backup.dump

# Restore website files
tar -xzf /backups/clean_files.tar.gz -C /var/www/bhole

# Redeploy from clean git history
git checkout <last-known-good-commit>
git push origin main --force  # Use with extreme caution

# Rotate ALL secrets
# - API keys
# - Database passwords
# - Auth secrets (NEXTAUTH_SECRET)
# - SSH keys (if compromised)
```

### 5. Verification

- [ ] Site loads correctly
- [ ] All APIs respond
- [ ] Admin login works
- [ ] Database queries return expected data
- [ ] SSL certificate valid
- [ ] DNS records correct
- [ ] Monitoring shows green
- [ ] No unexpected processes running

### 6. Post-Mortem (Within 48 Hours)

Document:
- Timeline of events
- Root cause
- What worked / didn't work in the response
- Action items to prevent recurrence
- Changes to monitoring or alerting needed

---

## Compromised Credentials Procedure

If you suspect any credential is compromised:

1. **Immediately rotate:**
   - Database password (Vercel/Neon dashboard)
   - NEXTAUTH_SECRET
   - Resend API key
   - Cloudflare API token
   - GitHub tokens
   - Registrar login password

2. **For API keys:**
   - Revoke the compromised key
   - Generate a new one
   - Update the key in all locations (Vercel, GitHub Secrets, .env)
   - Verify the new key works

3. **For SSH keys:**
   ```bash
   # Remove compromised key from authorized_keys
   sudo vim /home/deploy/.ssh/authorized_keys
   
   # Generate new key pair
   ssh-keygen -t ed25519 -a 100
   
   # Add new public key
   # Update all developers' access
   ```

---

## Communication Templates

### Users — Service Degradation

> **Subject:** Degraded performance on Bhole Farms
>
> We are currently experiencing [issue]. Our team is investigating.
> We will provide updates here. Thank you for your patience.

### Users — Service Restored

> **Subject:** Bhole Farms is fully operational
>
> The issue has been resolved. Root cause was [summary].
> No data was lost / Data was restored from [time] backup.
> We have implemented [prevention measure] to prevent recurrence.

---

## Post-Incident Review Template

```markdown
## Post-Incident Review

**Date:** YYYY-MM-DD
**Incident ID:** IR-001
**Severity:** SEV1/SEV2/SEV3/SEV4

### Timeline
| Time | Event |
|------|-------|
| HH:MM | Detection via [source] |
| HH:MM | Containment started |
| HH:MM | Root cause identified |
| HH:MM | Fix deployed |
| HH:MM | Service restored |

### Root Cause
[What caused the incident]

### Impact
- Downtime: X minutes
- Data loss: Yes/No
- Users affected: [estimate]

### What Went Well
- [Thing 1]
- [Thing 2]

### What Could Be Improved
- [Thing 1] → Action item: [owner]
- [Thing 2] → Action item: [owner]

### Action Items
- [ ] [Action] — Owner, Due date
- [ ] [Action] — Owner, Due date
```
