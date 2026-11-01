# CLAUDE.md: Pavan's World

Context for Claude (or any developer) working in this repo. Read this first.

## What this is
**Pavan's World** is a hyperlocal "one-stop supermarket" web app for people living within ~10 km of
**Sidedahalli, Bengaluru** (Nagasandra, Bagalagunte, Shettihalli, Chikkasandra, Abbigere, T Dasarahalli,
Chikkabanavara, Jalahalli). Pavan (the owner) runs everything alone for now and plans to expand to other
areas later. Users are local residents on **mobile phones**, so mobile-first design matters most.
Pavan teaches yoga and does content creation, and those skills are the heart of the product.

### v1 features (built)
1. **Fit Daily** (`/fit`): onboarding quiz (goal, level, minutes, health conditions), then a daily
   yoga/home-workout plan that rotates every day. Includes a per-exercise detail sheet with timer, a daily check-in
   (mood/energy/sleep/weight/note), a streak, a 14-day progress view and a "Request 1-on-1 coaching" button
   (creates a lead and opens WhatsApp to Pavan). Paid coaching is the first revenue stream.
2. **Local Deals** (`/deals`, `/deals/shop/[id]`): shop offers with coupon codes, plus call/WhatsApp/directions buttons.
   Vendors submit offers → `status: 'pending'` → admin approves.
3. **Household Helpers** (`/helpers`): service categories, a "Verified" badge, neighbour reviews,
   emergency numbers and a "Suggest a helper" form (which creates a lead).
4. **Ideas & Collab** (`/ideas`, `/ideas/[id]`): startup and franchise ideas with budgets (indicative only), a content
   idea of the day, a collab board for creators, and an "I'm interested" button (stored in `interests`).
5. **Admin panel** (`/admin`): an overview (members not checked in for 2+ days with a WhatsApp nudge, pending deals),
   fitness members with check-in history and coaching status, leads and interests, and CRUD for deals, shops, helpers, ideas and collab posts.

### Deliberately NOT in v1 (future)
Payments (Razorpay), in-app chat (WhatsApp is used instead), healthy-food ordering, mental-health support
(only with licensed partners), events/meetups, Kannada UI, automated WhatsApp reminders (WhatsApp Business API),
and expanding to other areas.

## Tech stack
- **Next.js 14 (App Router) + TypeScript + Tailwind CSS 3**, icons from `lucide-react`.
- **Supabase** is the backend: Postgres, phone-OTP auth, and Row Level Security as the permission layer.
  There are **no API routes yet**. All pages are client components (`"use client"`) that talk to Supabase directly.
- Hosting is **Vercel**. The app is an installable **PWA** (`public/manifest.webmanifest`).
- WhatsApp is reached through `wa.me` click-to-chat links (`waLink()` in `src/lib/config.ts`).
- Font: Plus Jakarta Sans via a `<link>` in `layout.tsx`. Don't use `next/font/google`, because it failed at build in sandboxed environments.

## Key architecture: one data API, two modes
`src/lib/db.ts` exposes `db.list / get / insert / upsert / update / remove(table, ...)`.
- **Demo mode** (no Supabase env vars) stores data in `localStorage` (`pw:db:v1`), seeded from `src/lib/seed.ts`.
  Login is any 10-digit number with OTP `123456`. Logging in as `9999999999` gives admin.
- **Live mode** (env vars set): the same calls go to Supabase. `DEMO_MODE` is computed in `src/lib/config.ts`.
- Always go through `db.*`, never call `supabase()` directly from pages, so both modes keep working.
- `useTable<T>(table, opts)` in `src/lib/hooks.ts` is the standard way to load lists in components.
- Auth lives in `src/lib/auth.tsx` (`useAuth()`: `user`, `sendOtp`, `verifyOtp`, `logout`, `saveProfile`).
  Phones are stored as **10 digits without +91**.

## Folder map
```
src/app/            pages: / (home), fit, deals, helpers, ideas, profile (login), admin
src/components/     Shell (header + bottom nav), ui.tsx (Sheet, Chips, ContactButtons, Stars, Toast…),
                    DealCard, admin/Crud.tsx (generic table + form editor driven by a field config)
src/lib/config.ts   app name, area, owner WhatsApp, categories, emergency numbers, waLink/telLink
src/lib/types.ts    TypeScript types for every table
src/lib/workouts.ts exercise library + buildPlan() (filters by level and health conditions, rotates daily)
src/lib/seed.ts     demo/sample data (placeholder names & phone numbers)
supabase/schema.sql tables + RLS policies + is_admin() + protect_role trigger
supabase/seed.sql   same sample data as SQL (has a commented DELETE block to remove it before launch)
```

## Database rules (important)
- Tables: profiles, shops, deals, helpers, reviews, ideas, interests, collab_posts, fitness_profiles, checkins, leads.
- IDs are `text` (seed data uses ids like `s1`, `d1`, `h1`). `profiles.id` and `fitness_profiles.id` are the auth user id.
- Check-ins use the deterministic id `${userId}-${YYYY-MM-DD}` with upsert (one row per user per day).
- `is_admin()` checks `profiles.role = 'admin'`. The `protect_role` trigger stops members from promoting themselves,
  but allows changes from the SQL editor (where `auth.uid()` is null).
- To make someone admin, run in the Supabase SQL editor: `update profiles set role='admin' where phone='98XXXXXXXX';`
- **When you add a table or column**, update `schema.sql` (with RLS policies), `types.ts`, the `empty()` store in `db.ts`,
  and `seed.ts`/`seed.sql` if sample data is needed. Give Pavan the SQL to run, because schema changes aren't applied automatically.

## Commands
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # must pass before deploying
```
Env vars (`.env.local`, never commit): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_OWNER_WHATSAPP` (e.g. `919XXXXXXXXX`).

## Conventions
- Mobile-first: design for a 390px width, then make sure it still looks fine on desktop. Bottom nav on mobile, top nav on desktop.
- Reuse the Tailwind component classes in `globals.css` (`card`, `btn-primary`, `btn-green`, `btn-outline`, `btn-ghost`,
  `chip-on/off`, `input`, `label`, `badge`). Colours: `brand` (orange), `leaf` (green, used for fitness), `ink` (neutrals).
- Use bottom sheets (`<Sheet>`) for details and forms, and `useToast()` for confirmations. Use `useRequireLogin()` before any write action.
- Keep copy simple English. Users are local residents, many of them non-technical. Use WhatsApp for any human contact.
- Safety copy must stay: the fitness "not medical advice / consult a doctor" note, the condition-based exercise filtering,
  and "figures are indicative, not financial advice" on ideas.

## Known follow-ups / next steps
- [ ] Upgrade Next.js (14 has open security advisories) and `@supabase/supabase-js`. Don't run `npm audit fix --force` blindly.
- [ ] Put the project on GitHub, then connect it to Vercel.
- [ ] Set up an SMS provider in Supabase Auth (Twilio or MSG91) for real OTPs.
- [ ] Replace the sample shops and helpers with real, verified entries, then run the DELETE block in `seed.sql`.
- [ ] Ideas for later: Kannada language toggle, image uploads (Supabase Storage) for shops and helpers, events/meetups,
  Razorpay for paid coaching, a scheduled job to expire old deals, and WhatsApp Business API reminders.
