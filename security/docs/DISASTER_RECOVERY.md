# Disaster Recovery Plan

> Recovery procedures for worst-case scenarios.

---

## Definitions

| Term | Value | Notes |
|------|-------|-------|
| **RPO** (Recovery Point Objective) | 24 hours | Maximum acceptable data loss |
| **RTO** (Recovery Time Objective) | 4 hours | Maximum acceptable downtime |
| **RTO (SEV1)** | 1 hour | Critical outage target |

---

## Recovery Scenarios

### Scenario A: Total Server Failure

**Situation:** Server is offline, corrupted, or unrecoverable.

**RTO:** 4 hours

**Steps:**

1. **Provision new server** (DO droplet, AWS EC2, etc.)
   ```bash
   # Provision Ubuntu 22.04 LTS
   # Apply server hardening from SERVER_HARDENING.md
   ```

2. **Restore from latest backup**
   ```bash
   # Restore files
   scp user@offsite:/backups/bhole_latest.tar.gz /tmp/
   tar -xzf /tmp/bhole_latest.tar.gz -C /var/www/bhole

   # Restore database
   scp user@offsite:/backups/db/bhole_latest.dump /tmp/
   pg_restore --clean --dbname=bhole_prod /tmp/bhole_latest.dump
   ```

3. **Reconfigure services**
   ```bash
   # Copy nginx config
   cp /var/www/bhole/security/nginx/hardening.conf /etc/nginx/sites-available/
   
   # Restart services
   sudo systemctl restart nginx
   sudo systemctl restart docker
   docker-compose -f /var/www/bhole/docker-compose.yml up -d
   ```

4. **Update DNS** if IP changed
   - Cloudflare dashboard → DNS → Update A record
   - Wait for propagation (usually <1 minute with Cloudflare)

5. **Verify**
   - [ ] Site loads via HTTPS
   - [ ] Admin login works
   - [ ] API endpoints respond
   - [ ] Monitoring tools show green
   - [ ] SSL certificate valid

---

### Scenario B: Data Corruption

**Situation:** Database corrupted by bug, bad migration, or manual error.

**RPO:** 24 hours (max data loss)
**RTO:** 2 hours

**Steps:**

1. **Stop the application** to prevent further writes
   ```bash
   # Put site in maintenance mode
   # Or stop Docker containers
   docker stop bhole-web
   ```

2. **Identify the corruption point**
   ```bash
   # Check when corruption started
   # Find the last known-good backup
   ls -la /backups/db/
   ```

3. **Restore database**
   ```bash
   # Option A: Restore latest clean backup
   pg_restore --clean --dbname=bhole_prod /backups/db/bhole_cleanest.dump

   # Option B: If backup is slightly stale, restore + replay known-good transactions
   pg_restore --clean --dbname=bhole_prod /backups/db/bhole_previous_day.dump
   ```

4. **Verify data integrity**
   ```bash
   # Check row counts match expected
   psql -d bhole_prod -c "SELECT count(*) FROM products;"
   psql -d bhole_prod -c "SELECT count(*) FROM orders;"
   
   # Test a few queries
   psql -d bhole_prod -c "SELECT * FROM products LIMIT 5;"
   ```

5. **Resume service** and verify

6. **Post-mortem:** Find root cause of corruption and fix it

---

### Scenario C: Compromised Credentials

**Situation:** API keys, passwords, or secrets exposed.

**RTO:** 1 hour

**Steps:**

1. **Immediately rotate ALL credentials:**
   - Database password
   - NEXTAUTH_SECRET (generate new one)
   - Resend API key
   - Cloudflare API token
   - GitHub tokens and deploy keys
   - Domain registrar password
   - Email account passwords

2. **Revoke compromised keys**
   ```bash
   # GitHub: https://github.com/settings/tokens
   # Cloudflare: Dashboard → API Tokens
   # Resend: Dashboard → API Keys
   # Vercel: Dashboard → Settings → Environment Variables
   ```

3. **Check for unauthorized access**
   - Review GitHub access log
   - Review Vercel deployment log
   - Check database connection log
   - Review server auth.log

4. **Deploy updated secrets**
   ```bash
   # Update Vercel environment variables
   vercel env add NEXTAUTH_SECRET
   vercel env add DATABASE_URL
   vercel env add RESEND_API_KEY
   
   # Redeploy
   vercel --prod
   ```

5. **Verify** everything still works
6. **Investigate** how credentials were compromised

---

### Scenario D: DNS Hijacking

**Situation:** Domain DNS records have been modified by an attacker.

**RTO:** 1 hour

**Steps:**

1. **Log in to Cloudflare** immediately
2. **Check DNS records** for unauthorized changes
3. **Revert all DNS records** to correct values
4. **Enable DNSSEC** if not already enabled
5. **Enable Domain Lock** at registrar
6. **Change registrar password** and enable 2FA
7. **Check Cloudflare access log** for unauthorized API usage
8. **Rotate Cloudflare API token**
9. **Verify** website loads correctly
10. **Check SSL certificate** — revoke and reissue if compromised

---

## Contact List

| Contact | Details | Location |
|---------|---------|----------|
| Domain registrar | [Service name, phone, email] | Password manager |
| Cloudflare | Dashboard login | Password manager |
| Vercel | Dashboard login | Password manager |
| GitHub | Dashboard login | Password manager |
| Hosting provider | [If self-hosted] | Password manager |
| Backup location | Access details | Password manager |

> Keep this contact list in your password manager, not in the codebase.

---

## DR Test Schedule

| Test | Frequency | Description |
|-----|-----------|-------------|
| DB restore test | Weekly | Restore latest backup to staging |
| File restore test | Monthly | Restore files to test environment |
| Full DR drill | Quarterly | Complete recovery from bare server |
| Credential rotation | Quarterly | Rotate all non-user credentials |
| Backup integrity | Monthly | Verify all backups are restorable |
