import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

/**
 * POST /api/video/[id]
 * Enregistre la vidéo uploadée dans /public/uploads et renvoie son chemin public.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /* ─ 1. Sécuriser l’ID ─────────────────────────────────────────────── */
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "ID manquant dans l'URL" },
        { status: 400 }
      );
    }

    /* ─ 2. Récupérer le fichier envoyé ───────────────────────────────── */
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier reçu' },
        { status: 400 }
      );
    }

    /* ─ 3. Construire le nom & le chemin de sortie ───────────────────── */
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name?.split('.').pop()?.toLowerCase() || 'mp4';
    const fileName = `video-${id}-${randomUUID()}.${ext}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    /* ─ 4. Réponse JSON attendue par VideoUpload.tsx  ─────────────────── */
    return NextResponse.json({
      success: true,
      path: `/uploads/${fileName}`, // ⚠️ clé `path` (pas `url`)
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
