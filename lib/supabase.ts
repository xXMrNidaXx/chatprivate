import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// For server-side operations
export const getSupabaseClient = () => {
  return createClientComponentClient();
};
