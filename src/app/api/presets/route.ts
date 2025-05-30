// src/app/api/presets/route.ts - API Presets avec Supabase
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client Supabase avec service role pour bypasser RLS si nécessaire
const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const search = url.searchParams.get('search');
    const publicOnly = url.searchParams.get('public') === 'true';
    const trending = url.searchParams.get('trending') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('presets')
      .select(`
        *,
        profiles!inner(name, avatar_url)
      `);

    // Filtres
    if (publicOnly) {
      query = query.eq('is_public', true);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Tri
    if (trending) {
      // Calcul du score: votes - downvotes + usage_count/10
      query = query.order('votes', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: presets, error } = await query;

    if (error) {
      console.error('Erreur récupération presets:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur serveur' },
        { status: 500 }
      );
    }

    // Transformer les données pour le frontend
    const transformedPresets = presets?.map(preset => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
      userName: preset.user_name,
      authorName: preset.profiles?.name,
      authorAvatar: preset.profiles?.avatar_url,
      votes: preset.votes,
      downvotes: preset.downvotes,
      usageCount: preset.usage_count,
      tags: preset.tags || [],
      createdAt: preset.created_at,
      isPublic: preset.is_public,
      // Données de style
      ...preset.style_data,
    })) || [];

    return NextResponse.json({
      success: true,
      presets: transformedPresets,
      total: transformedPresets.length,
    });

  } catch (error) {
    console.error('Erreur API presets GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Récupérer l'utilisateur depuis l'en-tête Authorization
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

    // Récupérer le profil utilisateur
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    const data = await req.json();
    
    // Validation
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nom du preset requis' },
        { status: 400 }
      );
    }

    if (data.name.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Nom trop long (max 50 caractères)' },
        { status: 400 }
      );
    }

    // Préparer les données
    const {
      name,
      description,
      isPublic,
      tags,
      ...styleProperties
    } = data;

    const presetData = {
      name: name.trim(),
      description: description?.trim() || null,
      user_id: user.id,
      user_name: profile?.name || user.email?.split('@')[0] || 'Utilisateur',
      is_public: Boolean(isPublic),
      tags: Array.isArray(tags) ? tags : [],
      style_data: styleProperties,
    };

    // Créer le preset
    const { data: newPreset, error } = await supabaseAdmin
      .from('presets')
      .insert(presetData)
      .select(`
        *,
        profiles!inner(name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Erreur création preset:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la création' },
        { status: 500 }
      );
    }

    // Transformer pour le frontend
    const transformedPreset = {
      id: newPreset.id,
      name: newPreset.name,
      description: newPreset.description,
      userName: newPreset.user_name,
      authorName: newPreset.profiles?.name,
      authorAvatar: newPreset.profiles?.avatar_url,
      votes: newPreset.votes,
      downvotes: newPreset.downvotes,
      usageCount: newPreset.usage_count,
      tags: newPreset.tags,
      createdAt: newPreset.created_at,
      isPublic: newPreset.is_public,
      ...newPreset.style_data,
    };

    return NextResponse.json({
      success: true,
      preset: transformedPreset,
    });

  } catch (error: any) {
    console.error('Erreur création preset:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}