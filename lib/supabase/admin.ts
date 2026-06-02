import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS. Use ONLY in trusted server contexts
// (billing webhook/cron/confirm) where there is no user session, or to write
// rows users aren't allowed to write directly. NEVER expose to the client.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin not configured (need SUPABASE_SERVICE_ROLE_KEY)");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
