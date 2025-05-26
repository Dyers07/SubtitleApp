'use client';

import React, { useState } from 'react';
import { VideoUpload } from '@/components/VideoUpload';
import { VideoPlayer } from '@/components/VideoPlayer';
import { SubtitleEditor } from '@/components/SubtitleEditor';
import { VideoProject, defaultSubtitleStyle, Subtitle } from '@/types';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [project, setProject] = useState<VideoProject | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const handleVideoProcessed = (videoUrl: string, videoDuration: number, subtitles: Subtitle[], width: number, height: number) => {
    const newProject: VideoProject = {
      id: Date.now().toString(),
      videoUrl,
      videoDuration,
      subtitles,
      style: defaultSubtitleStyle,
      width,
      height,
      fps: 30,
    };
    setProject(newProject);
  };

  const handleStyleChange = (style: typeof defaultSubtitleStyle) => {
    if (!project) return;
    setProject({ ...project, style });
  };

  const handleExport = async () => {
    if (!project) return;

    try {
      setIsExporting(true);
      setExportProgress(10);
      
      toast.info('Démarrage du rendu Remotion... Cela peut prendre quelques minutes.');

      setExportProgress(20);

      // Appeler l'API de rendu
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(project),
      });

      setExportProgress(50);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Échec du rendu');
      }

      setExportProgress(80);

      // Attendre un peu pour s'assurer que le fichier est prêt
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Télécharger la vidéo
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `video-subtitled-${project.id}.mp4`;
      link.click();

      setExportProgress(100);
      toast.success('Vidéo exportée avec succès !');

    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Erreur lors de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 2000);
    }
  };

  const handleReset = () => {
    setProject(null);
    setShowEditor(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Video Subtitle Editor</h1>
            <p className="text-muted-foreground">
              Ajoutez et personnalisez des sous-titres sur vos vidéos avec des effets avancés
            </p>
          </div>

          {/* Contenu principal */}
          {!project ? (
            <div className="max-w-2xl mx-auto">
              <VideoUpload onVideoProcessed={handleVideoProcessed} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Colonne gauche : Player */}
              <div className="space-y-4">
                <VideoPlayer
                  project={project}
                  onStyleChange={() => setShowEditor(!showEditor)}
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    Nouvelle vidéo
                  </Button>
                  <Button
                    onClick={() => setShowEditor(!showEditor)}
                    variant="outline"
                    className="flex-1"
                  >
                     {`${showEditor ? 'Masquer' : 'Afficher'} l\u2019éditeur`}
                  </Button>
                </div>
              </div>

              {/* Colonne droite : Éditeur */}
              {showEditor && (
                <div className="space-y-4">
                  <SubtitleEditor
                    style={project.style}
                    onStyleChange={handleStyleChange}
                    onExport={handleExport}
                  />
                </div>
              )}
            </div>
          )}

          {/* Modal d'export */}
          {isExporting && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Export en cours</CardTitle>
                  <CardDescription>
                    Traitement de votre vidéo avec les sous-titres personnalisés...
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

          {/* Instructions */}
          {!project && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Comment ça marche ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                 <li>Uploadez votre vidéo MP4</li>
                 <li>AssemblyAI génère automatiquement les sous-titres</li>
                  <li>Personnalisez l&rsquo;apparence des sous-titres (couleurs, animations, effets)</li></ol>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}