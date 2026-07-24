import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Only run session refresh where auth matters (the owner dashboard). The
  // storefront is guest-only, so this avoids a Supabase auth round-trip on
  // every public page request.
  matcher: ["/admin/:path*"],
}
