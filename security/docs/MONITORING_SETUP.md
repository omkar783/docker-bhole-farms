# Monitoring Setup Guide

> 100% free monitoring stack for Bhole Farms — uptime, SSL, security,
> performance, and DNS health.

---

## 1. UptimeRobot — Website Monitoring

**Free tier:** 50 monitors, 5-minute checks

### Setup

1. Go to https://uptimerobot.com and sign up (free)
2. Click **Add New Monitor**

### Monitors to Create

| Monitor | Type | URL | Alert When |
|---------|------|-----|------------|
| Homepage | HTTP(S) | `https://bholefarms.com` | Down |
| Products | HTTP(S) | `https://bholefarms.com/products` | Down |
| Contact API | HTTP(S) | `https://bholefarms.com/api/contact` | Down or 4xx/5xx |
| Admin Login | HTTP(S) | `https://bholefarms.com/admin/login` | Down |
| Admin Dashboard | HTTP(S) | `https://bholefarms.com/admin/dashboard` | Down |

### Alert Contacts

Add these notification channels under **My Settings → Alert Contacts**:

- **Email** — your primary email
- **Telegram** — via Telegram bot (search @UptimeRobotBot)
- **Slack** — via Slack webhook (optional)

### Keyword Alerts

For monitors that should contain specific text (e.g., "success" in API
responses), add keyword monitoring in advanced settings.

---

## 2. Better Stack — SSL Monitoring

**Free tier:** 3 monitors, 10 Heartbeats, 6-month history

### Setup

1. Go to https://betterstack.com and sign up (free)
2. Navigate to **SSL Monitoring**

### Monitors to Create

| Monitor | Domain | Check Frequency | Alert At |
|---------|--------|-----------------|----------|
| Main SSL | `bholefarms.com` | Every hour | 30 days before expiry |
| Admin SSL | `admin.bholefarms.com` | Every hour | 30 days before expiry |
| API SSL | `api.bholefarms.com` | Every hour | 30 days before expiry |

### Heartbeats

Better Stack Heartbeats can monitor cron job execution. Create heartbeats
for critical cron jobs:

- `backup-db` — daily database backup
- `weekly-backup` — weekly full backup
- `ssl-check` — daily SSL cert check
- `health-check` — every 5 minutes

---

## 3. Google Search Console

**Free:** Yes

### Setup

1. Go to https://search.google.com/search-console
2. Add property: `https://bholefarms.com`
3. Verify ownership via:
   - DNS TXT record (recommended — stays valid)
   - Or HTML file upload

### Enable Security Notifications

1. Go to **Settings → Preferences**
2. Check **Email notifications** for:
   - **Security issues** — malware, hacked content
   - **Manual actions** — Google penalties
   - **Indexing issues** — crawling errors
3. Add team members under **Users and permissions**

### Regular Checks

- Check **Security & Manual Actions** report weekly
- Review **Index Coverage** report for crawl errors
- Monitor **Core Web Vitals** report monthly

---

## 4. Google Safe Browsing

**Free:** Yes

Check your site at any time:

```bash
# Manual check
curl https://safebrowsing.googleapis.com/v4/threatMatches:find
```

Or use the status tool:
https://transparencyreport.google.com/safe-browsing/search

---

## 5. VirusTotal

**Free:** Yes (limited daily API calls)

### Setup

1. Go to https://www.virustotal.com
2. Search your domain: `bholefarms.com`
3. Set up daily scanning:

```bash
# Using curl (requires free API key)
curl --request GET \
  --url "https://www.virustotal.com/api/v3/domains/bholefarms.com" \
  --header "x-apikey: YOUR_API_KEY"
```

### What to Check

- Domain reputation
- URL scan results
- File hash lookups for downloaded files
- Check after every deployment

---

## 6. MXToolbox — DNS & Email Health

**Free:** Yes

### Regular Checks

| Check | URL | Frequency |
|-------|-----|-----------|
| DNS health | https://mxtoolbox.com/DNSLookup/dns/bholefarms.com | Weekly |
| Blacklist | https://mxtoolbox.com/blacklists.aspx | Weekly |
| SPF lookup | https://mxtoolbox.com/spf.aspx | Monthly |
| DKIM lookup | https://mxtoolbox.com/dkim.aspx | Monthly |
| DMARC lookup | https://mxtoolbox.com/dmarc.aspx | Monthly |

### Email Health Checks

Verify these pass:
- **SPF** — authorized senders include your email provider
- **DKIM** — email signing is configured
- **DMARC** — policy is set (p=quarantine or p=reject)
- **rDNS (PTR)** — reverse DNS matches your mail server

---

## 7. Monitoring Dashboard Summary

| Service | What It Monitors | Check Frequency | Alert Method |
|---------|-----------------|-----------------|-------------|
| UptimeRobot | Website uptime | Every 5 min | Email, Telegram |
| Better Stack | SSL cert expiry | Every hour | Email |
| Google Search Console | Security & indexing | Real-time | Email |
| VirusTotal | Domain reputation | Daily | Email (API) |
| MXToolbox | DNS & email health | Weekly | Manual |
| Custom scripts | Disk, Docker, logs | Every 5 min | Telegram |

## Alert Response Times

| Alert Type | Response Target | Action |
|------------|----------------|--------|
| Website down | 15 minutes | Check UptimeRobot → check Vercel → check DNS |
| SSL expiring | 24 hours | Renew via Let's Encrypt / Cloudflare |
| Domain expiring | 7 days | Renew domain |
| Disk > 90% | 1 hour | Clean up logs, old backups, expand storage |
| Malware detected | 1 hour | Incident response — take site down |
| Failed login spike | 1 hour | Check Fail2Ban, rotate credentials |
