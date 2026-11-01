# Pavan's World

A one-stop neighbourhood app for Sidedahalli and the area within 10 km of it (Bengaluru).

**Version 1 features**
- 🧘 **Fit Daily**: personal yoga and home-workout plan that changes every day, based on goal, level, time and health conditions. Includes a daily check-in, streaks, progress tracking and 1-on-1 coaching requests.
- 🏷️ **Local Deals**: offers from nearby shops with coupon codes, call/WhatsApp/directions buttons, and a form for vendors to submit offers (approved by the admin).
- 🛠️ **Household Helpers**: plumbers, electricians, carpenters and more, with verified badges, neighbour reviews and emergency numbers.
- 💡 **Ideas & Collab**: startup and franchise ideas with budgets, a content idea of the day, and a collab board for creators.
- 🛡️ **Admin panel** (/admin): approve deals, add and edit shops, helpers and ideas, follow up with fitness members on WhatsApp, and manage leads.

**Tech stack:** Next.js 14 · TypeScript · Tailwind CSS · Supabase (database + phone OTP login) · Vercel hosting · installable PWA.

---

## 1. Run it on your computer (demo mode)

You need Node.js 18 or newer (https://nodejs.org).

```bash
npm install
npm run dev
```
Open http://localhost:3000.

Demo mode uses sample data saved in your browser:
- Log in with **any** 10-digit number. The OTP is **123456**.
- Log in as **9999999999** to open the Admin panel.
- To start fresh, go to Profile → "Reset demo data".

## 2. Connect a real database (Supabase, free)

1. Create a project at https://supabase.com and choose the Mumbai region.
2. Go to **SQL Editor**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Go to **Authentication → Providers → Phone**, enable it, and connect an SMS provider (Twilio, MessageBird, Vonage or Textlocal).
   For testing, you can add test phone numbers with fixed OTPs on the same page.
4. Copy `.env.example` to `.env.local` and fill in the values from **Project Settings → API**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_OWNER_WHATSAPP=91XXXXXXXXXX
   ```
5. Run the app and log in once with your own number. Then run this in the SQL Editor:
   ```sql
   update profiles set role = 'admin' where phone = 'XXXXXXXXXX';
   ```
6. Open /admin and add your real shops, helpers and ideas.

## 3. Go live (Vercel, free)

1. Push this folder to a GitHub repository.
2. At https://vercel.com, import the repository and add the same 3 environment variables.
3. Deploy. You can optionally add your own domain (e.g. pavansworld.in) under Settings → Domains.

People install the app by opening the link on their phone and tapping **"Add to Home screen"**.

## Where to change things
| What | File |
|---|---|
| App name, area, WhatsApp number, categories, emergency numbers | `src/lib/config.ts` |
| Yoga and workout library, plan logic | `src/lib/workouts.ts` |
| Sample (demo) data | `src/lib/seed.ts` |
| Colours | `tailwind.config.ts` |
| Database tables and security rules | `supabase/schema.sql` |

> Sample shops, helpers and phone numbers are placeholders. Replace them with real, verified entries before you launch.
