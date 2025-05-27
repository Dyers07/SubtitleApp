'use client';

import React, { useState } from 'react';

import { VideoUpload } from '@/components/VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SubtitleEditor } from '@/components/SubtitleEditor';
import { CaptionTimeline } from '@/components/CaptionTimeline';

import {
  VideoProject,
  Subtitle,
  defaultSubtitleStyle,
} from '@/types';

import { splitSubtitles } from '@/utils/splitSubtitles';

import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/* ───────────────────────────────
   Component
─────────────────────────────── */
export default function Home() {
  /* état brut (non découpé) */
  const [rawSubs, setRawSubs] = useState<Subtitle[]>([]);

  /* projet affiché */
  const [project, setProject] = useState<VideoProject | null>(null);

  /* timecode player */
  const [currentTime, setCurrentTime] = useState(0);

  /* export */
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  /* upload terminé */
  const handleVideoProcessed = (
    videoUrl: string,
    videoDuration: number,
    subs:     Subtitle[],
    width:    number,
    height:   number,
  ) => {
    setRawSubs(subs);                                      // sauvegarde brut
    setProject({
      id: Date.now().toString(),
      videoUrl,
      videoDuration,
      subtitles: splitSubtitles(subs, 3),                  // valeur par défaut
      style: defaultSubtitleStyle,
      width,
      height,
      fps: 30,
    });
  };

  /* style */
  const handleStyleChange = (style: typeof defaultSubtitleStyle) =>
    project && setProject({ ...project, style });

  /* sous-titres recoupés depuis l’éditeur */
  const handleSubtitlesChange = (subs: Subtitle[]) =>
    project && setProject({ ...project, subtitles: subs });

  /* export */
  const handleExport = async () => {
    if (!project) return;

    try {
      setIsExporting(true);
      setExportProgress(10);
      toast.info('Démarrage du rendu Remotion…');

      setExportProgress(20);
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });

      setExportProgress(50);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec du rendu');

      setExportProgress(80);
      await new Promise((r) => setTimeout(r, 1_000));

      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = `video-subtitled-${project.id}.mp4`;
      a.click();

      setExportProgress(100);
      toast.success('Vidéo exportée avec succès !');
    } catch (err) {
      toast.error(
        `Erreur lors de l’export : ${
          err instanceof Error ? err.message : 'inconnue'
        }`,
      );
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 2_000);
    }
  };

  /* reset */
  const handleReset = () => {
    setProject(null);
    setRawSubs([]);
    setCurrentTime(0);
  };

  /* ───────────────────────────────
     RENDER
  ─────────────────────────────── */
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* header */}
          <div className="text-center space-y-2">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded mr-1">
                Dyers
              </span>
              <span className="text-primary">Captions</span>
            </h1>
            <p className="text-muted-foreground">Alpha&nbsp;1.0</p>
          </div>

          {/* main content */}
          {!project ? (
            <div className="max-w-2xl mx-auto">
              <VideoUpload onVideoProcessed={handleVideoProcessed} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* player */}
              <div className="w-full max-w-[500px] mx-auto">
                <VideoPlayer
                  project={project}
                  onReset={handleReset}
                  onTimeUpdate={setCurrentTime}
                />
              </div>

              {/* editor + timeline */}
              <div className="space-y-4">
                <SubtitleEditor
                  style={project.style}
                  onStyleChange={handleStyleChange}
                  onExport={handleExport}
                  /* découpe dynamique */
                  rawSubtitles={rawSubs}
                  subtitles={project.subtitles}
                  onSubtitlesChange={handleSubtitlesChange}
                />

                <CaptionTimeline
                  subtitles={project.subtitles}
                  currentTime={currentTime}
                />
              </div>
            </div>
          )}

          {/* export modal */}
          {isExporting && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Export en cours</CardTitle>
                  <CardDescription>
                    Traitement de votre vidéo avec les sous-titres…
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Progress value={exportProgress} />
                    <p className="text-sm text-center text-muted-foreground">
                      {exportProgress}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* landing instructions */}
          {!project && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Comment ça marche&nbsp;?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Uploadez votre vidéo&nbsp;MP4.</li>
                  <li>AssemblyAI génère automatiquement les sous-titres.</li>
                  <li>
                    Personnalisez l’apparence des sous-titres (couleurs,
                    animations, effets).
                  </li>
                </ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
