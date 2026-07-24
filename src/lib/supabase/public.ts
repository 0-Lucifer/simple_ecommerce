import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-less Supabase client for PUBLIC reads (products, categories).
 *
 * Because it never touches cookies, storefront pages that use it can be
 * statically cached / ISR instead of being dynamically rendered per request.
 * RLS still applies (anon role → only active products), so this is safe.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
