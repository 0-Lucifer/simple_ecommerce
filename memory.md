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
| Hosting | Vercel (free) **or** any Node-capable host (Hostinger Business/Cloud/VPS) |
| Domain | Via Hostinger (or any registrar), pointed at the host |
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

### Phase 2 — Database & Data Layer  🚧 schema written; awaiting Supabase project to apply
- [x] Schema written: profiles, categories, products, orders, order_items (`supabase/schema.sql`)
- [x] Triggers: updated_at, order-number generator, auto-create profile on signup
- [x] Row Level Security policies (public read active products; admin writes; own orders)
- [x] Storage bucket `product-images` (public read)
- [x] Sample seed data (`supabase/seed.sql`) + setup guide (`SUPABASE_SETUP.md`)
- [ ] Apply to a real Supabase project + fill `.env.local` (user action)
- [ ] Wire data-fetching layer once keys exist

### Phase 3 — Storefront  ⏳
- [ ] Home page
- [ ] Product catalog + filtering
- [ ] Product detail page
- [ ] Cart
- [ ] Checkout form + WhatsApp order
- [ ] Optional customer auth

### Phase 4 — Admin Dashboard  ⏳
- [ ] Owner login (secure)
- [ ] Product CRUD + image upload
- [ ] Category management
- [ ] Order management (view, mark paid / fulfilled)
- [ ] Dashboard overview/stats

### Phase 5 — Polish  ⏳
- [ ] Animations & micro-interactions
- [ ] Full mobile responsiveness
- [ ] SEO (metadata, sitemap, OG images)
- [ ] Loading & empty states

### Phase 6 — Launch  ⏳
- [ ] Production deploy
- [ ] Custom domain
- [ ] Owner handover guide

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

## 6. Pending From User
- [ ] **Reference site link** (drives the visual design)
- [ ] Brand assets: business name, logo, colors, tagline
- [ ] 3–5 sample products (name, description, price, photos)
- [ ] Product categories
- [ ] WhatsApp number for orders
- [ ] Supabase account + project created
- [ ] Vercel account linked to GitHub (if using Vercel)

---

## 7. Change Log
- **2026-07-23** — Project kicked off. Locked stack (Next.js + Supabase) and key decisions (both order flows, optional accounts). Removed empty `test.c`. Scaffolded Next.js 16 + TypeScript + Tailwind v4.
- **2026-07-23** — **Phase 1 complete.** Added shadcn/ui (base-nova / Base UI), core components, Supabase client scaffolding, env config, cart store (zustand), site header/footer, home page + placeholder routes. Production build passes. Note: this shadcn style uses Base UI — components take a `render` prop instead of Radix's `asChild`.
- **2026-07-23** — **Phase 2 (schema) written.** `supabase/schema.sql` (tables + RLS + triggers + storage bucket), `supabase/seed.sql`, and `SUPABASE_SETUP.md`. Waiting on the user to create a Supabase project, run the SQL, and fill `.env.local`.
