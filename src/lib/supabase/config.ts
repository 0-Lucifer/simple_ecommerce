/** Whether Supabase env vars are present. Lets the app render gracefully
 *  (empty states) before the database is connected. */
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
