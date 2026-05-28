# IGO Nursery — Speed Audit & Performance Fix Report
**Date:** 2026-05-28  
**Audited by:** Claude (Cowork)  
**Files changed:** `App.tsx` · `index.html` · `vite.config.ts`

---

## 🔍 Issues Found

### 🐛 Bug — Order Number Mismatch (Critical)
| | Detail |
|---|---|
| **File** | `App.tsx` → `handleSubmitOrder()` |
| **Problem** | A local `orderNumber` and `trackingNumber` were generated and used in `newOrder` (local state), but `createOrderPayload` generates its own separate IDs for the database. Result: admin panel showed different order numbers than what was saved in Supabase — data was inconsistent. |
| **Fix** | Removed duplicate ID generation. `newOrder` now uses `response.order.orderNumber` and `response.order.trackingNumber` from the DB response so local state always matches the database. |

---

### ⚡ Performance Issue 1 — Monolithic 1.6 MB JS Bundle (Critical)
| | Detail |
|---|---|
| **File** | `App.tsx` |
| **Problem** | All 25 pages (Home, Shop, Admin, Checkout, etc.) were imported eagerly at the top of `App.tsx`. Every visitor downloaded the full ~1.6 MB bundle before seeing any content — even if they only visited the Home page. |
| **Fix** | Converted all 25 page imports to `React.lazy()` with a `<Suspense>` wrapper. Each page is now a separate JS chunk fetched only when the user navigates to it. First-load JS payload is dramatically reduced. |

```tsx
// Before (loads everything upfront)
import Home from './pages/Home';
import Shop from './pages/Shop';
// ... 23 more eager imports

// After (loads each page on demand)
const Home  = lazy(() => import('./pages/Home'));
const Shop  = lazy(() => import('./pages/Shop'));
// ... wrapped in <Suspense fallback={<PageSpinner />}>
```

---

### ⚡ Performance Issue 2 — No Vendor Chunk Splitting (High)
| | Detail |
|---|---|
| **File** | `vite.config.ts` |
| **Problem** | React, Supabase, jsPDF, xlsx, and Lucide icons were all bundled into the same chunk as app code. Every deploy forced users to re-download all libraries even if only a single line of app code changed. |
| **Fix** | Added `manualChunks` in Rollup config to split into 5 separate vendor chunks: `vendor-react`, `vendor-supabase`, `vendor-pdf`, `vendor-xlsx`, `vendor-icons`. Browser caches each independently. |

---

### ⚡ Performance Issue 3 — Stale Build Artifacts Accumulating (High)
| | Detail |
|---|---|
| **File** | `vite.config.ts` |
| **Problem** | `emptyOutDir: false` meant every `npm run build` added new JS chunks to `dist/assets/` without removing old ones. **100+ stale chunk files** had accumulated, bloating the deployment and confusing CDN caches. |
| **Fix** | Changed `emptyOutDir: true`. Each build now cleans `dist/assets/` first. |

---

### ⚡ Performance Issue 4 — Render-Blocking Google Fonts (Medium)
| | Detail |
|---|---|
| **File** | `index.html` |
| **Problem** | Google Fonts was loaded with a standard `<link rel="stylesheet">` which blocks page rendering until the font CSS downloads. Users saw a blank/unstyled page during font fetch. |
| **Fix** | Used the `media="print" onload="this.media='all'"` pattern to load fonts asynchronously. Added `rel="preload"` to start the download early. Added `<noscript>` fallback. This eliminates the render-blocking delay. |

```html
<!-- Before: blocks rendering -->
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet">

<!-- After: non-blocking -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?...">
<link href="https://fonts.googleapis.com/css2?..." rel="stylesheet"
      media="print" onload="this.media='all'">
<noscript><link href="https://fonts.googleapis.com/css2?..." rel="stylesheet"></noscript>
```

---

### ⚡ Performance Issue 5 — Unused importmap Causing Extra DNS Lookups (Medium)
| | Detail |
|---|---|
| **File** | `index.html` |
| **Problem** | A `<script type="importmap">` pointed React, react-dom, and lucide-react to the `esm.sh` CDN. Since Vite bundles all these at compile time, the importmap was **never actually used** in production — but browsers still resolved DNS for `esm.sh` on every single page load, wasting ~100–300ms. |
| **Fix** | Removed the importmap entirely. |

---

### ✅ Also Added — Resource Hints
| | Detail |
|---|---|
| **File** | `index.html` |
| **Added** | `dns-prefetch` for Tailwind CDN and Supabase so DNS is resolved in background before those resources are requested. |

---

## 📊 Expected Impact

| Metric | Before | After (estimate) |
|---|---|---|
| Initial JS bundle | ~1.6 MB (all pages) | ~200–400 KB (home + vendor) |
| Repeat-visit JS download | Full bundle every deploy | Only changed chunks re-downloaded |
| Font render-blocking delay | Yes (~300–600ms) | Eliminated |
| Stale dist chunks | 100+ accumulating | Cleaned on every build |
| Extra DNS lookups (esm.sh) | Yes (every page load) | Eliminated |

---

## 📁 Files Changed

| File | Change |
|---|---|
| `App.tsx` | React.lazy code splitting · order number bug fix |
| `index.html` | Non-blocking fonts · preload hints · dns-prefetch · remove importmap |
| `vite.config.ts` | `emptyOutDir: true` · `manualChunks` vendor splitting · `chunkSizeWarningLimit` |
| `push_speed_fixes.bat` | One-click git push script (double-click to push to GitHub) |

---

## 🚀 How to Deploy

1. Close VS Code / GitHub Desktop (releases the git lock)
2. Double-click **`push_speed_fixes.bat`** in your `Igo-Nursery` folder
3. Vercel will auto-deploy from the push
