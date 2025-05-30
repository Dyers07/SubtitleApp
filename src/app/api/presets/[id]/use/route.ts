// src/app/api/presets/[id]/use/route.ts - Incrémenter usage
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: presetId } = params;

    // Incrémenter le compteur d'usage - utilisation d'une requête SQL brute
    const { error } = await supabaseAdmin
      .from('presets')
      .update({ 
        usage_count: supabaseAdmin.from('presets').select('usage_count').eq('id', presetId).single().then(r => (r.data?.usage_count || 0) + 1),
        updated_at: new Date().toISOString()
      })
      .eq('id', presetId);

    if (error) {
      console.error('Erreur increment usage:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur API usage:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}