# Cloudflare Setup Guide

> Free tier configuration for Bhole Farms domain security, performance,
> and DDoS protection.

---

## 1. Sign Up and Add Site

1. Go to https://dash.cloudflare.com/sign-up
2. Enter your domain (e.g., `bholefarms.com`)
3. Select the **Free** plan
4. Cloudflare will scan existing DNS records

## 2. Update Nameservers

Cloudflare will show two nameservers like:
```
arya.ns.cloudflare.com
russ.ns.cloudflare.com
```

1. Go to your **domain registrar** (GoDaddy, Namecheap, etc.)
2. Replace existing nameservers with Cloudflare's
3. Propagation takes 24-48 hours (usually <1 hour)

## 3. Configure DNS Records

After adding your site, ensure these DNS records exist:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | `76.76.21.21` (Vercel) | Proxied (orange cloud) |
| CNAME | www | `cname.vercel-dns.com` | Proxied |
| CNAME | api | `cname.vercel-dns.com` | Proxied |
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | DNS only |
| TXT | _dmarc | `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com` | DNS only |
| CAA | @ | `0 issue "letsencrypt.org"` | DNS only |

> **Proxy status (orange cloud) = On** for all web traffic to get DDoS
> protection, SSL, and caching. DNS-only (grey cloud) for email records.

## 4. SSL/TLS Settings

**SSL/TLS → Overview:**
- Set to **Full (strict)** — requires valid SSL on origin server
- Vercel provides origin SSL automatically

**SSL/TLS → Edge Certificates:**
- Enable **Always Use HTTPS**
- Enable **Automatic HTTPS Rewrites**
- Enable **TLS 1.3**
- Minimum TLS Version: **1.2**
- Enable **Opportunistic Encryption**
- Enable **Certificate Transparency Monitoring**

## 5. Security Settings

**Security → Settings:**
- Security Level: **Medium** (or **High** under attack)
- Challenge Passage: **30 minutes**
- Browser Integrity Check: **On**
- Bot Fight Mode: **On** (Free tier — blocks most bots)

**Security → WAF (Web Application Firewall):**
- **Rate Limiting Rules (3 free rules):**
  - Rule 1: 100 requests / 10 seconds for `/api/*` — Block for 1 hour
  - Rule 2: 10 requests / 10 minutes for `/admin/*` — Block for 1 hour
  - Rule 3: 5 requests / 5 minutes for `/api/auth/*` — Block for 1 hour
- **Security Level:** Medium
- **Challenge** known bad bots

## 6. Performance

**Speed → Optimization:**
- Auto Minify: **Enable all** (HTML, CSS, JavaScript)
- Brotli: **On**
- HTTP/3 (with QUIC): **On**
- 0-RTT Connection Resumption: **On**

## 7. DNSSEC

**DNS → Settings:**
1. Enable **DNSSEC**
2. Copy the DS record details shown
3. Add the DS record at your domain registrar
4. Wait for DNSSEC status to show **Active**

## 8. Verify Setup

```bash
# Check DNS propagation
dig +short bholefarms.com
dig +short www.bholefarms.com

# Check SSL
curl -vI https://bholefarms.com

# Check DNSSEC
dig bholefarms.com +dnssec

# Check HTTP headers
curl -sI https://bholefarms.com | grep -i cf-ray
```

## 9. Recommended Firewall Rules (Free)

| Rule | Description |
|------|-------------|
| Block known bad bots | Built-in Bot Fight Mode handles this |
| Rate limit /api/* | Prevent API abuse |
| Rate limit /admin/* | Protect admin panel |
| Block IP ranges | Block known bad ASNs if needed |
| Country allow/block | Optional — restrict by geography |

## Post-Setup Checklist

- [ ] Nameservers updated at registrar
- [ ] SSL set to Full (strict)
- [ ] Always Use HTTPS enabled
- [ ] Bot Fight Mode enabled
- [ ] DNSSEC enabled and active
- [ ] Rate limiting rules configured
- [ ] Auto Minify + Brotli enabled
- [ ] HTTP/3 enabled
- [ ] Security headers reviewed
- [ ] CAA DNS record added for Let's Encrypt
