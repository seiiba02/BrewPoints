'use client';

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import {
  CapacitorAuthStorage,
  isCapacitorNative,
} from '@/lib/capacitor/nativeBridge';

function getSupabasePublicConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    'https://xcpxtkqurrbtvskripts.supabase.co';
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    'sb_publishable_2WAcVQFvLeN0e_wkF-jlDA_rBlD0YhE';
  return { url, key };
}

/**
 * Returns a typed Supabase client for Web (SSR cookie-aware via @supabase/ssr)
 * or Native iOS/Android Capacitor shells (using @capacitor/preferences via CapacitorAuthStorage).
 */
export function createSupabaseBrowserOrCapacitorClient() {
  const { url, key } = getSupabasePublicConfig();

  if (isCapacitorNative()) {
    return createClient<Database>(url, key, {
      auth: {
        storage: CapacitorAuthStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  return createBrowserClient<Database>(url, key);
}
