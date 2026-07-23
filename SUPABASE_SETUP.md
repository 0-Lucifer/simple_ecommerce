# Supabase Setup Guide

Follow these once to connect the database. Takes ~10 minutes. No coding required.

## 1. Create the project
1. Go to **https://supabase.com** → sign up (free) → **New project**.
2. Pick a name (e.g. `my-store`), set a strong **database password** (save it), choose the region closest to your customers.
3. Wait ~2 minutes for it to finish provisioning.

## 2. Create the database tables
1. In the left sidebar, open **SQL Editor** → **New query**.
2. Open the file [`supabase/schema.sql`](supabase/schema.sql) from this project, copy **all** of it, paste into the editor, and click **Run**.
3. You should see “Success. No rows returned.” This creates all tables, security rules, and the image storage bucket.
4. *(Optional, for testing)* Repeat with [`supabase/seed.sql`](supabase/seed.sql) to add a few sample products.

## 3. Get your API keys
1. Sidebar → **Project Settings** (gear icon) → **API**.
2. Copy these three values into the project's `.env.local` file (see [`.env.example`](.env.example)):
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys → `anon` `public`** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys → `service_role` `secret`** → `SUPABASE_SERVICE_ROLE_KEY`

   ⚠️ The **service_role** key is a secret. Never put it in client code, screenshots, or commits. It only ever lives in `.env.local` (local) and in the host's environment variables (production).

## 4. Create the owner (admin) account
The dashboard login is built in Phase 4, but you can create the account now:
1. Sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your friend's email + a password. Tick **Auto Confirm User**.
3. Then sidebar → **SQL Editor** → run this (replace the email):
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'owner@example.com');
   ```
4. That account can now access the owner dashboard once it's built.

## 5. Image storage
`schema.sql` already created a public **`product-images`** bucket. Product photos uploaded from the dashboard land here. Nothing else to do.

---

### Where each key goes
| Key | Public? | Used for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Connecting the app to your project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Browsing products, customer login |
| `SUPABASE_SERVICE_ROLE_KEY` | **NO — secret** | Server-side admin actions, order creation, image uploads |

Once `.env.local` is filled in, restart the dev server (`npm run dev`) and the store is connected.
