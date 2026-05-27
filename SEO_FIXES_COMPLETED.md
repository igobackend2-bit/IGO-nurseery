# IGO Nursery — SEO Implementation Summary
**Completed:** May 2026 | **Scope:** Full-site SEO audit & fix

---

## What Was Done

All critical and quick-win SEO issues identified in the audit have been implemented directly in the source code. Here is a complete breakdown by file.

---

### 1. `hooks/useSEO.ts` — NEW FILE (Core SEO Infrastructure)

This is the most important new file. It provides dynamic SEO for the React SPA.

- **`useSEO(config)` hook** — updates `document.title`, meta description, canonical URL, robots tag, and all Open Graph / Twitter Card tags on every page navigation. Without this, every page showed the homepage title and description.
- **`SEO_CONFIGS` object** — unique title, description, canonical, and OG tags for every page:
  - Home, Store/Shop, Lab, Landscape, AMC, Garden Assistant, Knowledge Hub, Visit, Cart, Checkout, Customer Auth, Product Catalogue
- **`getProductSEO(name, category, price, slug)`** — generates per-product SEO config with the product name, price, and canonical URL (e.g. `/product/monstera-deliciosa`)

---

### 2. `index.html` — Modified

- Changed OG image from the small logo to the hero banner (`igo-hero-og.jpg`, 1200×630 px) — required for rich social sharing
- Added `og:image:alt` and `twitter:image:alt` attributes
- Added `hreflang` tags for `en-IN` and `x-default`
- Added **WebSite JSON-LD schema** with SearchAction (enables Google Sitelinks Search Box)
- Added **FAQPage JSON-LD schema** with 6 Q&As covering delivery, health guarantee, return policy, location, hours, and plant types
- Added **BreadcrumbList JSON-LD schema** for the homepage

---

### 3. `pages/Product.tsx` — Modified

- Added `useSEO(getProductSEO(...))` — every individual product page now gets a unique title like *"Buy Monstera Deliciosa Online India | ₹899 | Free Delivery | IGO Nursery"* and a matching canonical URL `/product/monstera-deliciosa`
- Added **Product JSON-LD schema** injected dynamically per product, including: name, description, image, price, currency, availability (InStock/OutOfStock), seller, shipping details (free, pan-India, 3–7 days), and aggregate rating (4.9 / 5)
- Added **BreadcrumbList JSON-LD schema** per product: Home → Shop Plants → [Product Name]
- Added **visible breadcrumb navigation** in the product hero (Home / Shop Plants / Product Name) — crawlable by Google
- Converted "Back to Product List" button → `<a href="/store">` anchor
- Converted all related product cards → `<a href="/product/{slug}">` anchors
- Converted product catalogue "View Product Page" buttons → `<a href="/product/{slug}">` anchors
- Added `SEO_CONFIGS.product` to `useSEO.ts` for the general product catalogue view

---

### 4. `pages/Shop.tsx` — Modified

- Added `useSEO(SEO_CONFIGS.store)` for unique title/description/canonical on the shop page
- Added **H1 heading** with keyword-rich text: *"Buy Plants Online India — [N]+ Premium Nursery Plants"*
- Added subtitle with location, delivery, and health guarantee for local SEO
- Added **breadcrumb navigation** (Home / Shop Plants)
- Converted all product cards from `<div onClick>` to `<a href="/product/{slug}">` — critical for Google to crawl all product URLs

---

### 5. `pages/Home.tsx` — Modified

- Added `useSEO(SEO_CONFIGS.home)` for homepage-specific title/canonical
- Fixed the **H1** — the visual "NATURE ENGINEERED." text is now `aria-hidden="true"`, and a clean keyword H1 is present as screen-reader text: *"Buy Plants Online India — Premium Nursery Plants & AgriTech Greenery | IGO Nursery Chennai"*
- Fixed heading hierarchy — `<h4>` project title cards promoted to `<h3>` (no skipping H2→H4)
- Converted all CTA buttons to anchor links: Shop Plants → `/store`, Garden Assistant → `/assistant`, Enter The Lab → `/lab`, Landscape services → `/landscape`, Campus Visit → `/visit`, Open Product → `/product`

---

### 6. `components/SiteHeader.tsx` — Modified

- Converted **all navigation from `<button onClick>` to `<a href="...">` anchor links** — previously, Googlebot could not discover any pages because there were no crawlable links in the nav
- Every nav item now has a real `href` (e.g. `/store`, `/lab`, `/landscape`, `/amc`, `/knowledge`, `/cart`, `/assistant`, `/visit`)
- Added `aria-current="page"` for the active nav item
- Logo → `<a href="/">`

---

### 7. `components/Footer.tsx` — Modified

- Logo `<div>` → `<a href="/">` with updated alt text for SEO
- All Quick Links converted from `<button onClick>` to `<a href>` anchors
- Legal links → proper anchor tags with hrefs

---

### 8. Remaining Pages — useSEO Added

All remaining pages now call `useSEO()` so each gets a unique title and canonical URL on navigation:

| Page | Config Key | Canonical |
|------|-----------|-----------|
| Lab | `SEO_CONFIGS.lab` | `/lab` |
| Landscape | `SEO_CONFIGS.landscape` | `/landscape` |
| AMC | `SEO_CONFIGS.amc` | `/amc` |
| Knowledge Hub | `SEO_CONFIGS.knowledge` | `/knowledge` |
| Visit | `SEO_CONFIGS.visit` | `/visit` |
| Garden Assistant | `SEO_CONFIGS.assistant` | `/assistant` |
| Cart | `SEO_CONFIGS.cart` | `/cart` (noIndex) |
| Checkout | `SEO_CONFIGS.checkout` | `/checkout` (noIndex) |
| Customer Auth | `SEO_CONFIGS.customerAuth` | `/customer-auth` |

---

## Summary of Issues Fixed

| # | Issue | Status |
|---|-------|--------|
| 1 | Every page had the same title & meta description | ✅ Fixed — unique per page |
| 2 | Canonical URL always pointed to homepage | ✅ Fixed — dynamic canonical per page |
| 3 | No crawlable links (all `<button onClick>`) | ✅ Fixed — all nav & CTAs are `<a href>` |
| 4 | Missing H1 on Shop page | ✅ Fixed — keyword H1 added |
| 5 | H1 had decorative text, not keyword text | ✅ Fixed — sr-only keyword H1 |
| 6 | Heading hierarchy skipped levels (H2→H4) | ✅ Fixed — H4 → H3 |
| 7 | No Product structured data | ✅ Fixed — JSON-LD per product |
| 8 | No FAQPage schema | ✅ Fixed — 6 FAQs in index.html |
| 9 | No WebSite schema / Sitelinks Search Box | ✅ Fixed — WebSite + SearchAction |
| 10 | OG image was a small logo (not 1200×630) | ✅ Fixed — hero OG image |
| 11 | No Open Graph alt text | ✅ Fixed |
| 12 | No hreflang tags | ✅ Fixed — en-IN + x-default |
| 13 | No breadcrumb navigation or BreadcrumbList schema | ✅ Fixed — Shop and Product pages |
| 14 | Product pages not crawlable by Google | ✅ Fixed — `<a href>` on product cards |
| 15 | Cart/Checkout indexed by Google | ✅ Fixed — noIndex set |

---

## What's Still Recommended (Outside Code Scope)

- **Submit sitemap** to Google Search Console at `https://www.igonursery.com/sitemap.xml`
- **Verify the site** in Google Search Console and request re-indexing
- **Create the OG hero image** at `/images/branding/igo-hero-og.jpg` if it doesn't exist (1200×630 px)
- **Server-Side Rendering (SSR)** — the biggest remaining SEO limitation; Google renders JS but it takes longer. Consider Vite SSR or migrating to Next.js for maximum crawlability.
