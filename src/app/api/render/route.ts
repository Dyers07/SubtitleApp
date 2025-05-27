import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { mkdir, access } from 'fs/promises';
import { spawn } from 'child_process';

export async function POST(req: NextRequest) {
  try {
    /* ─ 1. Charger les données du projet ──────────────────────────────── */
    const project = await req.json();

    /* ─ 2. Créer le dossier de sortie public/output/ ──────────────────── */
    const outDir = path.join(process.cwd(), 'public', 'output');
    await mkdir(outDir, { recursive: true });

    /* ─ 3. Lancer render.mjs sans passer par le shell ─────────────────── */
    const script = path.join(process.cwd(), 'scripts', 'render.mjs');
    const child  = spawn(
      process.execPath,                         // ex. "node"
      [script, JSON.stringify(project)],        // argv[2] = JSON
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    // On bufferise la sortie pour l’envoyer au client en cas d’erreur
    let out = '';
    child.stdout.on('data', (d) => {
      const s = d.toString();
      out += s;
      console.log(s.trim());                    // journal live
    });
    child.stderr.on('data', (d) => {
      const s = d.toString();
      out += s;
      console.error(s.trim());
    });

    const code: number = await new Promise((res, rej) => {
      child.on('error', rej);
      child.on('close', res);
    });

    if (code !== 0) {
      throw new Error(`render.mjs exited with code ${code}\n\n${out}`);
    }

    /* ─ 4. Vérifier que la vidéo existe ───────────────────────────────── */
    const fileName = `${project.id}.mp4`;
    const filePath = path.join(outDir, fileName);
    await access(filePath);

    return NextResponse.json({
      success: true,
      downloadUrl: `/output/${fileName}`,
    });
  } catch (err) {
    console.error('Render error:', err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : 'Render failed – see server log',
      },
      { status: 500 }
    );
  }
}
