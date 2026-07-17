# Backup Strategy

> 3-2-1 backup rule: **3** copies of data, on **2** different storage types,
> **1** off-site backup.

---

## Backup Schedule

| Data | Frequency | Retention | Type |
|------|-----------|-----------|------|
| PostgreSQL database | Daily | 30 days | pg_dump + gzip + gpg |
| Website files | Weekly | 4 weeks | tar + gzip + gpg |
| Docker volumes | Weekly | 4 weeks | tar + gzip |
| Server configuration | Weekly | 4 weeks | tar + gzip |
| Full server backup | Monthly | 3 months | snapshot + archive |

## Database Backup (Daily)

```bash
# Automated by security/scripts/backup-db.sh

# Manual run:
pg_dump --host=localhost --port=5432 \
  --dbname=bhole_prod --username=bhole_user \
  --format=custom --compress=9 \
  --file=/backups/db/bhole_$(date +%Y%m%d_%H%M%S).dump

# Encrypt:
gpg --encrypt --recipient admin@bholefarms.com \
  --output /backups/db/bhole_$(date +%Y%m%d).dump.gpg \
  /backups/db/bhole_$(date +%Y%m%d).dump
```

### Restore Database

```bash
# Decrypt if encrypted:
gpg --decrypt --output /tmp/restore.dump backup_20250101.dump.gpg

# Restore:
pg_restore --host=localhost --port=5432 \
  --dbname=bhole_prod --username=bhole_user \
  --clean --if-exists \
  /tmp/restore.dump
```

## File Backup (Weekly)

```bash
# Backup website files
tar -czf /backups/files/bhole_files_$(date +%Y%m%d).tar.gz \
  -C /var/www/bhole \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# Backup Docker volumes
tar -czf /backups/volumes/docker_volumes_$(date +%Y%m%d).tar.gz \
  -C /var/lib/docker/volumes \
  .
```

## Off-Site Storage

Backups are copied to **two off-site locations**:

| Provider | Use | Free Tier |
|----------|-----|-----------|
| GitHub (private repo) | Configs, scripts | Unlimited private repos |
| Google Drive / AWS S3 | DB + file backups | 15 GB / 5 GB free |
| External SSD | Monthly full backup | Physical offline storage |

### Off-site upload via rclone

```bash
# Configure rclone once:
rclone config

# Upload backup:
rclone copy /backups/db/bhole_20250101.dump.gpg \
  gdrive:/bhole-backups/db/

# List backups:
rclone ls gdrive:/bhole-backups/db/
```

## Backup Verification

| Check | Frequency | Action |
|-------|-----------|--------|
| File integrity | Daily | Verify GPG signatures |
| DB restore test | Weekly | Restore to staging DB |
| Full restore drill | Monthly | Full restore on test server |
| Off-site access | Monthly | Verify off-site backups accessible |

### Integrity check command

```bash
# Verify GPG encrypted file is not corrupted
gpg --verify backup_20250101.dump.gpg.sig backup_20250101.dump.gpg

# Check tar integrity
tar -tzf backup_20250101.tar.gz > /dev/null && echo "OK"

# Check dump integrity
pg_restore --list backup_20250101.dump > /dev/null && echo "OK"
```

## Encryption

- All backups are encrypted with GPG (asymmetric, public key encryption)
- The private key is stored offline and in a password manager
- Backup encryption key is separate from operational keys

```bash
# Generate backup-specific GPG key
gpg --full-generate-key
# Type: RSA, 4096 bits
# Expiry: 5 years
# Real name: Bhole Farms Backup

# Export public key for backup scripts
gpg --armor --export backup@bholefarms.com > backup-public-key.asc
```

## Cron Schedule

```bash
# Edit crontab
sudo crontab -e

# Daily database backup at 2 AM
0 2 * * * /root/security/scripts/backup-db.sh

# Weekly full backup at 3 AM on Sunday
0 3 * * 0 /root/security/scripts/weekly-backup.sh

# Check backup integrity at 6 AM daily
0 6 * * * /root/security/scripts/verify-backups.sh
```

## What to Do When Restore Fails

1. **Don't panic** — you have multiple backup copies
2. Try restoring from the previous day's backup
3. If encrypted backup is corrupted, check the off-site copy
4. If all recent backups fail, restore from weekly/monthly backup
5. Document the failure cause and fix the backup process
