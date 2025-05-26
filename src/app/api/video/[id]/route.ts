/* ------------------------------------------------------------------
   /api/video/[id]  – Upload + re-encodage MP4 30 fps (H-264 + AAC)
   ------------------------------------------------------------------ */
   import { NextRequest, NextResponse } from 'next/server';
   import path from 'path';
   import fs from 'fs/promises';
   import { writeFile } from 'fs/promises';
   import ffmpeg from 'fluent-ffmpeg';
   import ffmpegStatic from 'ffmpeg-static';     // facultatif : sera utilisé si dispo
   import ffprobeStatic from 'ffprobe-static';
   import { tmpdir } from 'os';
   import { randomUUID } from 'crypto';
   
   /* ─── 0. Chemin vers les binaires FFmpeg / FFprobe ────────────────── */
   ffmpeg.setFfmpegPath((ffmpegStatic as string) ?? 'ffmpeg');      // fallback au PATH système
   ffmpeg.setFfprobePath(ffprobeStatic.path ?? 'ffprobe');
   
   /* ------------------------------------------------------------------ */
   export async function POST(
     req: NextRequest,
     context: { params: { id: string } }, // <-- plus de destructuring asynchrone
   ) {
     const { id } = context.params;        // ✅ on lit ici, plus de warning
     try {
       /* ── 1. récupérer le fichier ─────────────────────────── */
       const formData = await req.formData();
       const file = formData.get('file') as File | null;
       if (!file) {
         return NextResponse.json({ error: 'No file provided' }, { status: 400 });
       }
   
       /* ── 2. écrire l’original dans /tmp ──────────────────── */
       const origPath = path.join(tmpdir(), `${randomUUID()}.mp4`);
       await writeFile(origPath, Buffer.from(await file.arrayBuffer()));
   
       /* ── 3. ré-encoder 30 fps constant ───────────────────── */
       const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
       await fs.mkdir(uploadsDir, { recursive: true });
       const outPath = path.join(uploadsDir, `${id}.mp4`);
   
       await new Promise<void>((resolve, reject) => {
         ffmpeg(origPath)
           .outputOptions([
             '-vf', 'fps=30,scale=1080:1920:flags=lanczos',
             '-c:v', 'libx264', '-preset', 'fast', '-crf', '22',
             '-c:a', 'aac', '-b:a', '128k',
             '-movflags', '+faststart',
             '-map_metadata', '-1',
           ])
           .on('error', reject)
           .on('end', resolve)
           .save(outPath);
       });
   
       /* ── 4. nettoyage + réponse ─────────────────────────── */
       await fs.unlink(origPath).catch(() => {});
       return NextResponse.json({ success: true, path: `/uploads/${id}.mp4` });
     } catch (err) {
       console.error('Upload/encode error:', err);
       return NextResponse.json(
         { error: 'Upload or encode failed' },
         { status: 500 },
       );
     }
   }
   