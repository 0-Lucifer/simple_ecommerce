import "server-only";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** Returns the current admin { user, profile } or null (no redirect). */
export async function getAdminSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") return null;
  return { user, profile };
}

/** Guards a page/layout: redirects to login unless the caller is an admin. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login?error=not-admin");
  return session;
}
