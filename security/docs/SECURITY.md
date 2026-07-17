# Security Architecture

> **Bhole Farms** — Next.js 16 E-Commerce | Vercel + Cloudflare + PostgreSQL

## Security Philosophy

Security is layered. No single control is trusted — defense in depth ensures
that if one layer fails, the next catches it. This document describes the
security architecture, asset inventory, threat model, and defense layers
for the Bhole Farms platform.

---

## Asset Inventory

| Asset | Type | Criticality | Location |
|-------|------|-------------|----------|
| bholefarms.com (domain) | Domain | Critical | Registrar |
| DNS zone | DNS | Critical | Cloudflare |
| Next.js application | Web app | High | Vercel |
| PostgreSQL database | Data | Critical | Vercel Postgres / Neon |
| Admin credentials | Auth | Critical | NextAuth + JWT |
| Email service (Resend) | Communication | Medium | Resend API |
| GitHub repository | Source code | High | GitHub |
| File uploads (images) | Static assets | Medium | Vercel Blob / local |
| Environment variables | Secrets | Critical | Vercel + GitHub Secrets |

## Threat Model (Simplified STRIDE)

| Threat | Target | Mitigation |
|--------|--------|------------|
| Spoofing — fake login | Admin auth | NextAuth credentials, rate limiting |
| Tampering — modified data | API requests | HTTPS, CSP, input validation |
| Repudiation — no audit trail | Admin actions | Audit logging (planned) |
| Information disclosure — leaked secrets | Env vars | Vercel Secrets, .env in gitignore |
| DoS — overwhelming server | All endpoints | Cloudflare WAF, rate limiting |
| Elevation — unauthorized admin access | Admin routes | Session validation middleware |

## Defense Layers

```
Internet
  │
  ▼
Cloudflare (WAF, DDoS, Bot Fight Mode, Rate Limiting)
  │
  ▼
Vercel (HTTPS, Security Headers, Edge Network)
  │
  ▼
Next.js App (Auth, Input Validation, CSRF, CSP)
  │
  ▼
Database (Least Privilege User, Encrypted Connection)
  │
  ▼
Backups (Encrypted, 3-2-1 Rule)
```

## Security Tiers

| Tier | Category | Examples |
|------|----------|----------|
| **Critical** | Auth, data, secrets | Admin login, database, API keys |
| **High** | Web app, DNS, CDN | CSP, WAF, HTTPS, input validation |
| **Medium** | Monitoring, backups, email | UptimeRobot, backup verification, SPF/DKIM |
| **Low** | Logging, housekeeping | Log rotation, old user cleanup |

## Vulnerability Disclosure

To report a security vulnerability, email **security@bholefarms.com**
(or the address configured in GitHub SECURITY.md).

Please do not open public issues for security vulnerabilities.

**Expected response:** Initial acknowledgment within 48 hours,
remediation timeline shared within 5 business days.
