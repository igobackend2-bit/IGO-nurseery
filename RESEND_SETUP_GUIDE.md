# 🌿 IGO Nursery — Resend Email Setup Guide

## What this fixes
- ❌ "email rate limit exceeded" error on signup
- ❌ Order emails not sending (no server existed)
- ✅ Unlimited transactional emails via Resend
- ✅ OTP, Order Confirmed, Shipped, Delivered, Admin alerts — all working

---

## STEP 1 — Create a free Resend account

1. Open your browser → go to **https://resend.com**
2. Click **"Get Started"** → sign up with your email
3. Verify your email and log in

---

## STEP 2 — Get your Resend API Key

1. Inside Resend, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Name it: `IGO Nursery`
4. Permission: **"Sending access"**
5. Click **"Add"**
6. **Copy the key** (starts with `re_...`) — you only see it once!

---

## STEP 3 — Add the API key to your project

1. Open the file: `D:\Igo-websites\Igo-Nursery\.env.local`
2. Find this line:
   ```
   RESEND_API_KEY=re_PASTE_YOUR_KEY_HERE
   ```
3. Replace it with your actual key:
   ```
   RESEND_API_KEY=re_abc123yourActualKeyHere
   ```
4. Save the file

---

## STEP 4 — Add your domain to Resend (sends from your real domain)

> If you want emails to come from `noreply@igonursery.com` instead of Resend's default domain:

1. In Resend dashboard → click **"Domains"**
2. Click **"Add Domain"** → type `igonursery.com`
3. Resend will give you **3 DNS records** (TXT + MX + DKIM)
4. Log in to your domain registrar (GoDaddy / Hostinger / Cloudflare etc.)
5. Add those DNS records exactly as shown
6. Click **"Verify"** in Resend — wait up to 5 minutes
7. Once verified → your `.env.local` `FROM_EMAIL` line already says:
   ```
   FROM_EMAIL=IGO Nursery <noreply@igonursery.com>
   ```
   ✅ That's it — emails will now come from your domain!

> **Skipping domain setup?** Resend gives you a free `@resend.dev` domain to test with.
> Change `.env.local` to: `FROM_EMAIL=IGO Nursery <onboarding@resend.dev>`

---

## STEP 5 — Connect Resend to Supabase (fixes OTP rate limit)

> This routes Supabase's OTP/verification emails through Resend instead of their limited default.

1. Go to **https://supabase.com/dashboard**
2. Select your IGO Nursery project
3. Left sidebar → **"Project Settings"** (gear icon)
4. Click **"Authentication"**
5. Scroll down to **"SMTP Settings"**
6. Toggle **"Enable Custom SMTP"** → ON
7. Fill in these values:

   | Field | Value |
   |-------|-------|
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | *(your Resend API key — starts with `re_`)* |
   | Sender email | `noreply@igonursery.com` |
   | Sender name | `IGO Nursery` |

8. Click **"Save"**

✅ Supabase OTP emails now go through Resend — no more rate limits!

---

## STEP 6 — Run the project

Open **PowerShell** in `D:\Igo-websites\Igo-Nursery\` and run:

```powershell
npm run dev
```

This starts BOTH:
- 🌐 Frontend (Vite) at **http://localhost:3000**
- 📧 Email server at **http://localhost:4000**

---

## STEP 7 — Test it

1. Go to **http://localhost:3000/customer-auth**
2. Click **"Join Now"** and fill in your details
3. You should receive a real OTP email to your inbox within seconds
4. Enter the OTP → you're in! ✅

---

## All email routes now available

| Route | When it sends |
|-------|---------------|
| `POST /api/emails/otp` | OTP verification |
| `POST /api/emails/order-confirmation` | Order placed |
| `POST /api/emails/order-shipped` | Order shipped |
| `POST /api/emails/out-for-delivery` | Out for delivery |
| `POST /api/emails/delivered` | Order delivered |
| `POST /api/emails/admin-update` | Admin announcements |

Admin also gets an automatic alert email on every new order ✅

---

## Summary of files changed

| File | What changed |
|------|-------------|
| `server/index.js` | **Created** — full email server with Resend |
| `.env.local` | Added `RESEND_API_KEY`, `ADMIN_EMAIL`, `FROM_EMAIL` |
| `pages/CustomerAuth.tsx` | Fixed error messages, added resend OTP button, smart rate limit handling |

