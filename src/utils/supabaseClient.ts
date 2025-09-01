import { createClient } from '@supabase/supabase-js';

export function supabaseAsAnon() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false }
  });
}

export function supabaseAsService() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!, {
    auth: { persistSession: false }
  });
}
