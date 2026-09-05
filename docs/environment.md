# UDAYA CYCLES — Environment Variables

## .env.example

Copy this file to `.env.local` for development or `.env.production` for production.
**NEVER commit `.env.local` or `.env.production` to version control.**

```env
# ============================================================
# APPLICATION
# ============================================================
NEXT_PUBLIC_SITE_URL=https://udayacycles.com
NODE_ENV=production

# ============================================================
# DATABASE
# ============================================================
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/udaya-cycles?retryWrites=true&w=majority

# ============================================================
# AUTHENTICATION (NextAuth.js)
# ============================================================
NEXTAUTH_URL=https://udayacycles.com
NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>

# JWT for admin sessions (separate from NextAuth)
ADMIN_JWT_SECRET=<generate-with: openssl rand -base64 32>
ADMIN_JWT_EXPIRY=8h

# ============================================================
# CLOUDINARY
# ============================================================
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your-cloud-name>

# ============================================================
# RAZORPAY
# ============================================================
RAZORPAY_KEY_ID=rzp_live_<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>
RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_<your-key-id>

# ============================================================
# EMAIL (SMTP / Nodemailer)
# ============================================================
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@udayacycles.com
SMTP_PASS=<your-smtp-password>
EMAIL_FROM="Udaya Cycles <noreply@udayacycles.com>"

# ============================================================
# SMS PROVIDER
# (Interface: provider, apiKey, senderId — swap vendor as needed)
# ============================================================
SMS_PROVIDER=<msg91 | twilio | custom>
SMS_API_KEY=<your-sms-api-key>
SMS_SENDER_ID=UDAYA
SMS_TEMPLATE_ID_ORDER=<template-id>

# ============================================================
# WHATSAPP PROVIDER
# (Interface: provider, apiKey, phone — swap vendor as needed)
# ============================================================
WHATSAPP_PROVIDER=<twilio | meta | wati | custom>
WHATSAPP_API_KEY=<your-whatsapp-api-key>
WHATSAPP_PHONE_NUMBER_ID=<your-phone-number-id>

# ============================================================
# MAPS (for store locator)
# ============================================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# ============================================================
# RATE LIMITING (optional: Upstash Redis)
# ============================================================
UPSTASH_REDIS_REST_URL=<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>

# ============================================================
# INITIAL SUPER ADMIN (used only during first-run seed)
# ============================================================
SEED_ADMIN_USERNAME=superadmin
SEED_ADMIN_PASSWORD=<change-immediately-after-first-login>
```

---

## Variable Reference

| Variable | Required | Public | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Yes | Full domain URL |
| `MONGODB_URI` | Yes | No | MongoDB Atlas connection string |
| `NEXTAUTH_URL` | Yes | No | NextAuth base URL |
| `NEXTAUTH_SECRET` | Yes | No | NextAuth JWT signing secret |
| `ADMIN_JWT_SECRET` | Yes | No | Admin session JWT secret |
| `CLOUDINARY_CLOUD_NAME` | Yes | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | No | Cloudinary API secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Yes | Yes | Cloudinary cloud (client URLs) |
| `RAZORPAY_KEY_ID` | Yes | No | Razorpay server-side key |
| `RAZORPAY_KEY_SECRET` | Yes | No | Razorpay secret (server only) |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | No | Webhook verification secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Yes | Yes | Razorpay key for client SDK |
| `SMTP_HOST` | Yes | No | SMTP server hostname |
| `SMTP_PASS` | Yes | No | SMTP password |
| `SMS_API_KEY` | No | No | SMS provider API key |
| `WHATSAPP_API_KEY` | No | No | WhatsApp provider API key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Yes | Google Maps API key |

---

## Security Notes

1. `NEXT_PUBLIC_*` variables are bundled into the client. Only use for non-sensitive values.
2. `RAZORPAY_KEY_SECRET` must NEVER be prefixed with `NEXT_PUBLIC_`.
3. `MONGODB_URI` must NEVER be prefixed with `NEXT_PUBLIC_`.
4. Rotate `NEXTAUTH_SECRET` and `ADMIN_JWT_SECRET` if compromised.
5. Use `.gitignore` to exclude all `.env*` files except `.env.example`.
