import { createClient } from "@supabase/supabase-js"

/**
 * Privileged Supabase client using the service-role key.
 *
 * SERVER-ONLY. Never import this into a Client Component or expose the key to
 * the browser — it bypasses Row Level Security. Use only inside Server Actions,
 * Route Handlers, or other server code that has already checked the caller is
 * an admin.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
