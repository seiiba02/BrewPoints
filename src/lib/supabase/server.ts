import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

function getSupabaseServerConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    'https://xcpxtkqurrbtvskripts.supabase.co';
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_2WAcVQFvLeN0e_wkF-jlDA_rBlD0YhE';
  return { url, publishableKey };
}

/**
 * Creates a typed @supabase/ssr Server Client for Next.js 16 Server Components,
 * Server Actions, and Route Handlers.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseServerConfig();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component where response cookies cannot be mutated
        }
      },
    },
  });
}

/**
 * Creates a typed Supabase client authenticated via a Bearer JWT token
 * (used by Capacitor mobile clients calling /api/v1/* endpoints).
 */
export function createSupabaseBearerClient(accessToken: string) {
  const { url, publishableKey } = getSupabaseServerConfig();
  return createClient<Database>(url, publishableKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
