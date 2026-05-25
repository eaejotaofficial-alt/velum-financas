'use client';

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Returns the Supabase client if env vars are configured, otherwise null.
 * Code consuming this MUST check for null and fall back to local-only auth.
 */
export const supabase = (url && anonKey) ? createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
}) : null;

export const isSupabaseEnabled = !!supabase;
