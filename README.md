# IGO Nursery

**igonursery.com** — Premium nursery plants, gardening tools, landscaping services, and AgriTech greenery, based in Muttukadu, Chennai, India.

A full-stack e-commerce and services platform: customers browse and buy plants online, book landscape design consultations, subscribe to garden care (AMC) plans, and track orders — with a companion admin dashboard for managing products, orders, leads, and customers.

## Tech Stack

- **Frontend:** React 19 + TypeScript, built with Vite
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **Email:** Resend (transactional emails via a Vercel serverless function)
- **Hosting:** Vercel
- **Icons:** Lucide React

## Features

- Plant & gardening product catalogue with cart and checkout
- Customer accounts with order history, notifications, and wishlist
- Landscape design, AMC (garden care subscription), and R&D Lab service pages
- Knowledge Hub articles and an AI Garden Assistant
- Admin dashboard: orders, inventory, products, customers, and lead management
- Transactional email notifications (order confirmation, status updates, OTP verification)

## Project Structure

```
├── App.tsx                 # Main app shell, routing, and global state
├── pages/                  # Route-level page components (Home, Shop, Product, Admin*, etc.)
├── components/             # Shared UI components (header, footer, popups)
├── services/                # API clients (Supabase, products, customers, email)
├── data/                    # Static product/content data
├── hooks/                   # Custom React hooks (SEO, wishlist)
├── api/                     # Vercel serverless functions (email)
├── email-templates/         # HTML email templates
└── public/                  # Static assets, robots.txt, sitemap.xml
```

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your own values:
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — your Supabase project's public credentials
   - `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase credentials (never expose in frontend code)
   - `RESEND_API_KEY` — from [resend.com](https://resend.com/api-keys), for sending transactional email
   - `ADMIN_EMAIL` / `FROM_EMAIL` — admin notification recipient and sender address
   - `VITE_ORDER_EMAIL_API_URL` — the deployed email API endpoint (see `.env.example`)
3. Run the app locally:
   ```
   npm run dev
   ```
   This starts the Vite dev server together with the local email-testing server.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run the Vite dev server + local email server together |
| `npm run dev:vite` | Run only the Vite dev server |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |

## Project Status & Known Limitations

This is a working, actively developed platform — not everything is production-complete. From a full site audit, current known gaps are:

**Needs attention before handling real payments:**
- Checkout and the AMC subscription screen collect card/UPI details but do not connect to a real payment gateway — no payment is actually processed today.
- The admin login uses a hardcoded credential check in client-side code rather than server-verified authentication.
- Several Supabase Row Level Security policies are permissive (`FOR ALL USING (true)`) and should be tightened before storing real customer data at scale.

**Functional gaps:**
- Product star ratings shown on product pages are placeholder values, not backed by a real review system.
- Guest order tracking (`pages/OrderTracker.tsx`) exists but isn't wired into the app's routing, and its backend endpoint isn't implemented.
- The Garden Assistant returns a fixed recommendation regardless of user input (not yet backed by a real AI/recommendation engine).
- Wishlist is stored per-browser (`localStorage`), not synced to the customer's account.
- No guest checkout, discount/coupon codes, or self-service order cancellation yet.

**Housekeeping:**
- `MainApp.tsx` is legacy/unused — the live entry point is `App.tsx` (via `index.tsx`).
- Various one-off `test-*.js` scripts and `fix_*.sql` / `add_*.sql` migration snippets in the repo root are historical debugging aids, not an organized test suite or migration history.
- `server/index.js` and `public/mailer.php` are superseded by `api/send-email.js` and are no longer used in production.

See the audit reports in the repo root (`IGO_Nursery_Implementation_Gap_Audit_2026.docx`, `IGO_Nursery_Frontend_UI_Audit_2026.docx`, `IGO_Nursery_Customer_Experience_Update_2026.docx`) for full detail and a prioritized fix plan.

## Deployment

The site deploys to Vercel from the `dist/` build output. After making changes:

```
npm run build
git add -A
git commit -m "Describe your change"
git push
```

Vercel environment variables (`RESEND_API_KEY`, `FROM_EMAIL`, `ADMIN_EMAIL`, and the Supabase keys) must be configured in the Vercel project settings for production email and database access to work.

## License

Private and proprietary — © IGO Agri Techfarms Pvt Ltd. All rights reserved.
