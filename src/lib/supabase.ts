import { createClient } from '@supabase/supabase-js';

// 🔧 Configuration Supabase avec validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Initialisation Supabase (hardcodée)');
console.log('URL:', supabaseUrl);
console.log('ANON_KEY présente:', !!supabaseAnonKey);

if (!supabaseUrl) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL manquante');
}

if (!supabaseAnonKey) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY manquante');
}

// Validation format URL
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error('❌ Format URL Supabase invalide');
}

// Validation format clé
if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('❌ Format clé Supabase invalide');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 🚀 Service role client (pour opérations admin)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

console.log('✅ Client Supabase créé');
if (supabaseAdmin) {
  console.log('✅ Client Admin Supabase créé');
}