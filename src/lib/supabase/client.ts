import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zwdfwasdmlsjunpezhsm.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_794mkDhmQwvlaVLFin2FwA_DMcSNLc4';

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
