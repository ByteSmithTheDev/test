
# EcoPoint Backend (Secure MERN API)

A production-grade Express + MongoDB backend for an app where:
- Admins/Businesses post ads via a web panel
- Users view ads in the mobile app
- Users submit recyclable waste and earn points
- Points can be redeemed for coupons/discounts at participating shops

## Security Highlights
- JWT auth (short-lived access, long-lived refresh)
- Device-bound HMAC request signing (blocks forged requests from reverse-engineered apps)
- Strict CORS allowlist
- Helmet, HPP, global rate limiting
- Zod validation on inputs
- RBAC: USER / BUSINESS / ADMIN
- Idempotency for coupon redemption
- Server-side coupon verification and stock control
- Minimal data exposure; never trust the client

## Quick Start
1. Copy `.env.example` to `.env` and set strong secrets
2. `npm i`
3. Start MongoDB and run: `npm run dev`
4. Create an ADMIN in DB (manually or add an admin seeder)

## Core Routes
- `POST /api/auth/register` `{ email, password, name, deviceId }`
- `POST /api/auth/login` `{ email, password, deviceId }`
  - Returns `{ access, refresh, device: { deviceId, clientId, secret } }`
- `POST /api/auth/refresh` `{ refresh }`
- `GET  /api/ads` public list of ads (CORS-limited)
- `POST /api/waste/submit` (USER, HMAC) submit waste
- `POST /api/waste/:id/review` (ADMIN) approve/reject and award points
- `GET  /api/points/balance` (USER, HMAC) points + recent ledger
- `GET  /api/coupons` list available coupons
- `POST /api/coupons/redeem` (USER, HMAC) redeem coupon using points
- `POST /api/coupons/verify` (BUSINESS/ADMIN) mark coupon as USED

### HMAC Usage
For every protected request (marked HMAC), compute:
```
base = deviceId + '.' + clientId + '.' + nonce + '.' + timestamp + '.' + JSON.stringify(body)
sig  = HMAC_SHA256(secret, base) as hex
Headers: X-Device-Id, X-Client-Id, X-Nonce, X-Timestamp, X-Signature
```
- `deviceId`: stable per-device identifier you generate on the client
- `clientId` & `secret`: returned by login/register (rotateable)
- `nonce`: random string per request
- `timestamp`: current ms since epoch

Rejects stale timestamps (>5 min) and invalid signatures.

## Admin Panel Notes
- Host admin panel on separate domain on allowlist
- Protect admin APIs behind role checks and (optionally) IP allowlist/VPN
- Create Ads, Coupons (stock, cost, validity), Review Waste

## Hardening Checklist
- Use HTTPS everywhere (set HSTS in reverse proxy)
- Put API behind a WAF (Cloudflare/AWS ALB)
- Configure MongoDB auth and private network access
- Set strong JWT secrets; rotate periodically
- Monitor with structured logs + alerts
- Backup DB (point-in-time)
- Add per-route rate limits if needed

## License
MIT
