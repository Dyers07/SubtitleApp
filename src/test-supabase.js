import { supabase } from '@/lib/supabase';

export async function testSupabase() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Test Supabase réussi:', { data, error });
    return true;
  } catch (err) {
    console.error('❌ Test Supabase échoué:', err);
    return false;
  }
}