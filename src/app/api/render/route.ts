import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { mkdir, access } from 'fs/promises';

const execAsync = promisify(exec);

/**
 * Mémoire éphémère : id → { path, mimeType }
 * (remplace par une persistance réelle en prod).
 */
const videoMetadata = new Map<string, { path: string; mimeType: string }>();

export async function POST(request: NextRequest) {
  try {
    /* ─ 1. Projet reçu ────────────────────────────────────────────────── */
    const project = (await request.json()) as {
      id: string;
      videoUrl: string;
      [k: string]: unknown;
    };
    console.log('▶︎ Remotion render – project:', project.id);

    /* ─ 2. Dossier de sortie ──────────────────────────────────────────── */
    const outputDir = path.join(process.cwd(), 'public', 'output');
    await mkdir(outputDir, { recursive: true });

    /* ─ 3. Résolution de videoUrl ─────────────────────────────────────── */
    let videoPath = project.videoUrl; // ex: "/uploads/foo.mp4"

    // 3-a) vidéo servie par /api/video/<id>
    if (videoPath.startsWith('/api/video/')) {
      const id = videoPath.split('/').pop()!;
      const meta = videoMetadata.get(id);
      videoPath = meta?.path ?? `${request.nextUrl.origin}${videoPath}`;
    }

    // 3-b) vidéo déjà dans public/uploads → "uploads/foo.mp4"
    if (videoPath.startsWith('/uploads/')) {
      videoPath = videoPath.slice(1);
      // vérifie que le fichier existe réellement
      await access(path.join(process.cwd(), 'public', videoPath));
    }

    const projectForRender = { ...project, videoUrl: videoPath };
    console.log('  JSON ➜ Remotion:\n', JSON.stringify(projectForRender, null, 2));

    /* ─ 4. Lancer Remotion ────────────────────────────────────────────── */
    const scriptPath = path.join(process.cwd(), 'scripts', 'render.mjs');
    const jsonArg = JSON.stringify(projectForRender).replace(/'/g, "\\'");
    const command = `node "${scriptPath}" '${jsonArg}'`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),             // ← racine projet, donc public/ visible
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr) console.error('stderr:', stderr.trim());
    if (stdout) console.log('stdout:', stdout.trim());

    /* ─ 5. Vérification MP4 ───────────────────────────────────────────── */
    const mp4Path = path.join(outputDir, `${project.id}.mp4`);
    await access(mp4Path); // throw si absent

    return NextResponse.json({
      success: true,
      downloadUrl: `/output/${project.id}.mp4`,
    });
  } catch (err) {
    console.error('Render error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Render failed' },
      { status: 500 },
    );
  }
}
