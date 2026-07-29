# 🗂️ Project Memory — Simple Ecommerce

> Living document. Updated after each completed task/phase. Latest changes at the bottom of the **Change Log**.

---

## 1. Overview
A simple but **visually striking** ecommerce website built for a friend (the **owner**), who is **non-technical**. Two parts:
- **Storefront** — public site where customers browse products and place orders.
- **Owner Dashboard** — private admin area where the owner manages products, images, descriptions, categories, and orders.

**No payment gateway.** Payments are handled **manually** by the owner (he contacts the customer / arranges payment offline).

---

## 2. Tech Stack
| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Image storage | Supabase Storage |
| Auth (admin + optional customers) | Supabase Auth |
| Hosting | **Hostinger (Node.js)** — decided 2026-07-23. Friend is buying a domain + hosting there. Needs a Node-capable plan (Business/Cloud/VPS), NOT basic shared hosting. |
| Domain | Via Hostinger |
| Repo | github.com/0-Lucifer/simple_ecommerce (branch `main`) |

> Host-agnostic on purpose — no Vercel-locked services, so it can deploy to Vercel or Hostinger Node hosting.

---

## 3. Key Decisions (locked 2026-07-23)
- **Order flow:** BOTH — cart + checkout form (order saved to dashboard) **and** a "Order on WhatsApp" button.
- **Customer accounts:** Optional (guest checkout by default; sign-up optional for saved addresses/order history).
- **Database:** Supabase Postgres.
- **Design:** Premium/modern look, but intuitive and easy to navigate. Reference site to be provided by user.

---

## 4. Phases & Progress
### Phase 1 — Foundation  ✅ done
- [x] Next.js 16 + TS + Tailwind v4 scaffolded
- [x] shadcn/ui (**base-nova** style, built on Base UI — uses `render` prop, not `asChild`) + design tokens
- [x] Project folder structure (`src/app`, `src/components/{ui,storefront}`, `src/lib/{supabase,store}`)
- [x] Supabase client + env config (`client.ts`, `server.ts`, `admin.ts`, middleware session refresh — all no-op until keys set)
- [x] Base layout / app shell (sticky header w/ cart badge + mobile sheet, footer, Toaster)
- [x] Home page (hero, value props, featured preview, CTA) + placeholder routes (products, categories, about, cart)
- [x] First successful production build ✔

### Phase 2 — Database & Data Layer  ✅ applied & connected  ⚠️ one migration pending
> ⚠️ **Pending:** `supabase/migrations/2026-07-29_weight_options_and_delivery.sql` must be run in the Supabase SQL Editor (weight options + delivery charges). See the 2026-07-29 change-log entry.

- [x] Schema written: profiles, categories, products, orders, order_items (`supabase/schema.sql`)
- [x] Triggers: updated_at, order-number generator, auto-create profile on signup
- [x] Row Level Security policies (public read active products; admin writes; own orders)
- [x] Storage bucket `product-images` (public read)
- [x] Sample seed data (`supabase/seed.sql`) + setup guide (`SUPABASE_SETUP.md`)
- [x] Applied to real Supabase project + `.env.local` filled (connected 2026-07-23)
- [x] Data layer wired; app verified reading from Supabase (empty tables so far)
- [ ] Seed sample data OR add real products via dashboard (both tables currently empty)

**Supabase project:** ref `vmvkighkbduudxpupvky` (URL https://vmvkighkbduudxpupvky.supabase.co).
Using **legacy JWT** anon + service_role keys (user swapped from the new-style `sb_publishable`/`sb_secret` keys — both would work). ⚠️ Secret keys were pasted in chat once; recommend rotating post-launch.

### Phase 3 — Storefront  ✅ built (clean design; will re-skin to reference later)
- [x] Home page (hero, value props, live Featured grid w/ placeholder fallback, CTA)
- [x] Product catalog `/products` + category filter + search param
- [x] Product detail `/products/[slug]` (gallery, quantity, add-to-cart, WhatsApp, SEO metadata, 404)
- [x] Cart (`cart-view`, quantity/remove/clear, sticky summary, WhatsApp all)
- [x] Checkout form (react-hook-form + zod) → `createOrder` Server Action (validates prices server-side via service role) → success page
- [x] WhatsApp ordering everywhere (hidden until `NEXT_PUBLIC_WHATSAPP_NUMBER` set)
- [x] Data layer with graceful empty states when Supabase not configured
- [x] Build + runtime smoke test pass (all routes 200 / correct 404)
- [ ] Optional customer auth (login/signup, saved addresses, order history) — not built yet
- [ ] Re-skin to match reference site (pending reference link)

### Phase 4 — Admin Dashboard  ✅ built & verified
- [x] Owner login (Supabase Auth) at `/admin/login`; guard `requireAdmin()` in `src/lib/auth.ts`
- [x] Route structure: `src/app/admin/login` + `src/app/admin/(dashboard)/…` (group layout guards + shell)
- [x] Product CRUD + multi-image upload (`product-form.tsx` → `uploadProductImage` via service role)
- [x] Category management (create/edit/delete inline — `category-manager.tsx`)
- [x] Order management (list + detail, status dropdown, WhatsApp-customer link)
- [x] Dashboard overview stats (products, orders, pending, revenue) + recent orders
- [x] Server actions: `src/lib/actions/{auth,products,categories,orders}.ts` (all `requireAdmin`-guarded, admin/service-role client, `revalidatePath`)
- [x] Full `next build` passes; auth guard verified (`/admin` → 307 to login when signed out)
- Note: forms use native `<select>` / checkboxes (not Base UI) to stay robust; zod schemas avoid `.default()` (breaks zodResolver input/output types) — use `.optional()`.

### Phase 5 — Polish  ⏳
- [ ] Animations & micro-interactions
- [ ] Full mobile responsiveness
- [ ] SEO (metadata, sitemap, OG images)
- [ ] Loading & empty states

### Phase 6 — Launch  ✅ LIVE at https://candlecowax.com
- [x] **Production deploy on Vercel** (not Hostinger — client only bought a domain, no Node hosting)
  - Project: `candle-co/candlecowax` · Live: **https://candlecowax.vercel.app**
  - **No Git connection** (user's choice) — deployed via Vercel CLI. Redeploy with `npx vercel --prod`
  - All 7 env vars set in Vercel Production
  - Verified live: pages 200, admin guard 307, products load from Supabase, WhatsApp link → `wa.me/8801948851986`
- [x] **Custom domain live** — `candlecowax.com` + `www`, SSL issued & auto-renewing (verified: both 200)
  - DNS at Hostinger: `A` `@` → `76.76.21.21`, `CNAME` `www` → `cname.vercel-dns.com` (TTL 300)
  - Hostinger's parking records (`A @ → 2.57.91.91`, `CNAME www → candlecowax.com`) were replaced
  - Nameservers stay on Hostinger parking NS — that's fine with the A-record method
- [ ] Supabase → Auth → URL Configuration → set Site URL to the live domain
- [ ] Owner handover guide
- Note: Vercel Hobby tier is non-commercial per their ToS; upgrade to Pro (~$20/mo) or move to a VPS once the shop is genuinely selling.

---

## 5. Environment / Setup Needed
Create `.env.local` (never commit) with:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # server-only, for admin actions
NEXT_PUBLIC_WHATSAPP_NUMBER=...    # e.g. 8801XXXXXXXXX (country code, no +)
NEXT_PUBLIC_SITE_NAME=...
```

---

## 6. Brand — Candle Co.
- **Name:** Candle Co.  •  **Tagline:** "Premium raw materials for candle makers."
- **Sells:** candle-making supplies — wax (paraffin, beeswax, stearic acid), wicks, fragrance oils, glass jars.
- **Logo:** `assets/logo.jpeg` → copied to `public/logo.jpeg` (header) + `src/app/icon.jpeg` (favicon).
- **Palette (warm candle):** cream background, espresso-brown text, ember-amber primary `oklch(0.62 0.16 52)`. Headings use **Fraunces** serif; body **Geist**. Tokens in `src/app/globals.css`.
- **Currency:** BDT (৳).
- **Re-seed products:** `node --env-file=.env.local scripts/seed.mjs` (uploads `product_sample/` images to Storage + upserts categories/products).

## 7. Pending From User
- [x] Brand assets (name, logo, colors, tagline) — provided
- [x] Sample products + photos — provided & seeded (8 products, 4 categories)
- [x] Supabase project — created & connected
- [ ] **WhatsApp number for orders** (`NEXT_PUBLIC_WHATSAPP_NUMBER`) — still empty; WhatsApp buttons stay hidden until set
- [ ] Vercel (or Hostinger Node) account for deployment
- [ ] Create/confirm the owner admin user (see SUPABASE_SETUP.md step 4) for the dashboard

---

## 7b. Performance (done 2026-07-24)
- Images: AVIF/WebP via next/image (`formats` in next.config) + `minimumCacheTTL` 1yr. Verified: 20.9KB JPEG → 2.6KB AVIF (−87%).
- Storefront reads use a **cookie-less** `createPublicClient()` (`src/lib/supabase/public.ts`) → pages are ISR-cached (`revalidate = 300`); product pages pre-rendered via `generateStaticParams`. Verified live: home/product/category served from edge cache (x-vercel-cache HIT, ~0.14s).
- Middleware scoped to `/admin/:path*` only → removed a Supabase `getUser()` round-trip from every storefront request.
- Owner edits still reflect fast via `revalidatePath` in admin actions.

## 8. Change Log
- **2026-07-29** — **Weight options (per-weight pricing) + delivery charges.**
  - **DB migration required before this works:** run `supabase/migrations/2026-07-29_weight_options_and_delivery.sql` in the Supabase SQL Editor. Adds `products.variants` (jsonb), `orders.{delivery_zone,delivery_charge,total_weight_kg}`, `order_items.{variant_label,weight_kg}`. Additive only; `supabase/schema.sql` updated to match for fresh installs. Until it's run, the storefront still reads fine but **saving a product and placing an order will fail** (unknown column).
  - **Weight options:** admin product form has a repeatable "Weight options" editor (amount + g/kg unit + its own price). Stored as `products.variants` = `[{id,label,weight_kg,price}]`. `products.price` is auto-set to the **cheapest** option so listings/sorting keep working ("From ৳X" on cards). No weights = plain single-price product (unchanged behaviour). **Stock stays product-level, shared across weights.**
  - **Storefront:** product page shows weight chips with live price (`product-detail-panel.tsx` — the whole right column is now one client component so price + selection stay in sync). Add-to-cart from a product **card** opens a weight-picker **dialog**; the product page passes the chosen weight so no dialog appears there. Cart lines are keyed `productId:variantId`, so one product in two weights = two lines.
  - **Delivery charges:** `src/lib/delivery.ts` is the single rate table — Inside Dhaka 1kg ৳70 / 2kg ৳90 / +৳20 per extra kg; Outside Dhaka ৳130 / ৳150 / +৳20; **no weight in cart → flat ৳70 / ৳110**. Billed per *started* kg (2.4kg → 3kg), epsilon-guarded against float sums. Zone picker (Inside/Outside Dhaka, showing each price) on cart + checkout; choice persists in the cart store. Cart summary replaced "Arranged after order" with a real Subtotal / Delivery / Total breakdown. `createOrder` **recomputes** variant price, weight and delivery server-side (client numbers never trusted) and rejects a cart line whose weight no longer exists.
  - **Cart store:** persist `version: 2` + `migrate` — pre-existing v1 carts survive as weightless lines.
  - Admin: order detail shows the weight per item + Subtotal/Delivery(zone·kg)/Total; product list shows "From ৳X" + the weight labels. Note: dashboard **Revenue now includes delivery charges** (it sums `orders.total`).
  - `OWNER_GUIDE.md` updated (§1 delivery-charge table, §4 "Selling one product in several weights", §6 order breakdown, §8 quick reference). `DELIVERABLES.md` **not** updated — new billable scope if the user wants it there.
  - Verified: `tsc --noEmit` clean, `next build` passes (38 pages), dev smoke test all routes 200 + admin guard 307, rate table checked against every spec value. Lint has 3 **pre-existing** `set-state-in-effect` errors (hydration guards, incl. untouched `site-header.tsx`) — none new.
- **2026-07-24** — **Handover docs written.** `DELIVERABLES.md` — detailed Statement of Work Delivered (itemized, maps sections A–E to invoice items 1–5, plus F–I performance/security/quality/docs; scope stats: 16 pages, ~40 components, 5 tables, ~6.3k LOC/84 files) so the user can justify charges — created on user request to bill legitimately incl. optimizations. `OWNER_GUIDE.md` — full non-technical operating manual for the shop owner (login, dashboard tour, products/categories/orders, manual payments, stock behaviour, troubleshooting, security), written to match the real admin UI. Also `INVOICE_AND_AGREEMENT.md` — invoice + payment terms + recurring maintenance/support charge (§4) + IP/license & non-payment clauses (legitimate leverage: own the source until paid), with amounts/dates/payment details left blank for the user. Both left UNCOMMITTED (business docs to fill in), not code. Placeholders to fill: owner login email, developer name/contact in the guide.
- **2026-07-24** — **Stock deduction on completion.** `updateOrderStatus` (`src/lib/actions/orders.ts`) now moves inventory: when an order becomes `completed` it deducts each line item's ordered quantity from that product's `stock`; if an order is ever moved back out of `completed`, the quantities are restored. Idempotent (invariant: a completed order = exactly one deduction), so toggling status can't double-count. Deductions clamp at 0 (soft counter — no oversell error). Also revalidates `/products` + `/` so "In stock / Sold out" updates. No DB migration needed.
- **2026-07-24** — **Category tiles fix.** Categories had no images (blank placeholder). Added `getCategoriesWithCovers()` — auto-uses first product photo per category, else a warm gradient fallback. Deployed. Known gap: dashboard category form has NO image-upload field yet (categories rely on auto product covers or `image_url` set manually). Could add later if owner wants custom category images.
- **2026-07-24** — **Perf pass + redeploy.** AVIF/WebP images (−87%), storefront ISR-cached via cookie-less public client + generateStaticParams, middleware scoped to /admin only. Live & verified on candlecowax.com (edge cache HIT ~0.14s).
- **2026-07-24** — **Payment-protection request:** user asked for a "backdoor" kill switch for non-payment. Declined a *covert* backdoor (legal/ethical risk). Recommended legitimate leverage: user owns Vercel + Supabase accounts (pause either → site down), don't transfer ownership until paid, written agreement + deposit/milestones. Optional DISCLOSED maintenance-mode toggle offered. Do NOT build hidden/covert kill mechanisms.
- **2026-07-24** — **Deployed to Vercel + domain live.** candlecowax.com + www, auto SSL. Vercel CLI, no Git connection. 7 env vars set in Vercel prod. Redeploy: `npx vercel --prod`.
- **2026-07-23** — Project kicked off. Locked stack (Next.js + Supabase) and key decisions (both order flows, optional accounts). Removed empty `test.c`. Scaffolded Next.js 16 + TypeScript + Tailwind v4.
- **2026-07-23** — **Phase 1 complete.** Added shadcn/ui (base-nova / Base UI), core components, Supabase client scaffolding, env config, cart store (zustand), site header/footer, home page + placeholder routes. Production build passes. Note: this shadcn style uses Base UI — components take a `render` prop instead of Radix's `asChild`.
- **2026-07-23** — **Phase 2 (schema) written.** `supabase/schema.sql` (tables + RLS + triggers + storage bucket), `supabase/seed.sql`, and `SUPABASE_SETUP.md`. Waiting on the user to create a Supabase project, run the SQL, and fill `.env.local`.
- **2026-07-23** — **Phase 1 committed** to branch `foundation` (local only, not pushed). Currency set to BDT (৳), locale en-BD. `next.config.ts` allows Supabase Storage image domains.
- **2026-07-23** — **Supabase connected & verified.** Keys in `.env.local` (legacy JWT anon/service_role). Confirmed via REST: auth health 200, `products`/`categories` return 200 `[]` → schema applied, tables empty. Fixed Base UI Button `nativeButton` warning on link-buttons (`src/components/ui/button.tsx`). Dev server verified reading from Supabase with no errors.
- **2026-07-23** — **Owner dashboard built (Phase 4 complete).** Login + admin guard, product CRUD w/ image upload, category manager, order management + status, overview stats. All server actions guarded by `requireAdmin`. Full build passes; guard verified. Also: **hosting decided = Hostinger Node.js** (friend buying domain+hosting there).
- **2026-07-23** — **Branded as Candle Co. + seeded.** Applied warm candle palette (cream/espresso/ember-amber) in `globals.css`, added Fraunces serif headings, logo in header + favicon, candle-specific home copy. Wrote `scripts/seed.mjs` → uploaded 8 product images to Supabase Storage and inserted 4 categories + 8 products. Verified live: products render with images, `tsc --noEmit` clean.
- **2026-07-23** — **Phase 3 storefront built** (per user choice to keep momentum with the clean design, re-skin later). Data layer (`src/lib/data`), product components, catalog/detail/categories/cart/checkout/success pages, `createOrder` server action (`src/app/actions/orders.ts`), checkout validation (`src/lib/validations/checkout.ts`). Build + curl smoke test pass. NOT yet committed. Storefront shows empty states until Supabase is connected.
