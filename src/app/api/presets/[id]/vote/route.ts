// src/app/api/presets/[id]/vote/route.ts - Système de vote
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
    const { voteType } = await req.json(); // 'up' ou 'down'

    // Authentification
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      );
    }

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: 'Type de vote invalide' },
        { status: 400 }
      );
    }

    // Utiliser la fonction PostgreSQL pour gérer le vote atomiquement
    const { error } = await supabaseAdmin.rpc('vote_preset', {
      preset_id: presetId,
      user_id: user.id,
      vote_type: voteType,
    });

    if (error) {
      console.error('Erreur vote preset:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors du vote' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur API vote:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}