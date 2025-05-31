// src/app/page.tsx - Page principale CORRIGÉE avec header unique
'use client';

import { VideoUpload } from "@/components/VideoUpload";
import { SubtitleCustomizer } from "@/components/v2/subtitle-customizer";
import { ExportDialog } from "@/components/export-dialog";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/contexts/AuthContext";
import { videoCountService, VideoStats } from "@/lib/video-count-service";
import { useUndoRedo } from "@/lib/undo-redo-system";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Undo2, 
  Redo2, 
  Zap, 
  Crown, 
  BarChart3, 
  Video, 
  Sparkles, 
  Clock,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import type { VideoProject, Subtitle } from "@/types";
import { defaultSubtitleStyle } from "@/types";
import { splitSubtitles } from "@/utils/splitSubtitles";
import { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Home() {
  const { user, profile } = useAuth();
  const [project, setProject] = useState<VideoProject | null>(null);
  const [rawSubtitles, setRawSubtitles] = useState<Subtitle[]>([]);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [videoStats, setVideoStats] = useState<VideoStats | null>(null);
  const [renderMode, setRenderMode] = useState<'standard' | 'optimized'>('optimized');

  // 🚀 Système d'undo/redo
  const undoRedo = useUndoRedo();

  // 🎯 Charger les statistiques utilisateur
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;
    try {
      const stats = await videoCountService.getUserVideoStats(user.id);
      setVideoStats(stats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleVideoProcessed = (
    videoUrl: string,
    videoDuration: number,
    subtitles: Subtitle[],
    width: number,
    height: number
  ) => {
    setRawSubtitles(subtitles);
    const initialSubs = splitSubtitles(subtitles, 3);
    
    const newProject: VideoProject = {
      id: Date.now().toString(),
      videoUrl,
      videoDuration,
      subtitles: initialSubs,
      style: defaultSubtitleStyle,
      width,
      height,
      fps: 60, // 🚀 60 FPS par défaut
    };
    
    setProject(newProject);
    
    // 🎯 Sauvegarder l'état initial dans l'historique
    undoRedo.saveState(
      initialSubs.map(s => ({
        id: s.id,
        startTime: s.start,
        endTime: s.end,
        text: s.text,
        words: s.words,
      })),
      defaultSubtitleStyle,
      'Projet créé avec transcription IA',
      { action: 'project-create' }
    );
    
    toast.success(`🎉 Vidéo traitée !`, {
      description: `${subtitles.length} sous-titres générés • Prêt pour la personnalisation`,
      duration: 5000,
    });
  };

  const handleStartExport = async () => {
    if (!project) return;
    
    // 🎯 Vérifier les crédits avant export
    if (user && videoStats && videoStats.creditsRemaining <= 0) {
      toast.error('Plus de crédits disponibles', {
        description: 'Upgradez votre plan pour continuer',
        action: {
          label: 'Upgrader',
          onClick: () => window.open('/profile?tab=subscription', '_blank'),
        },
      });
      return;
    }
    
    setExporting(true);
    setProgress(0);
    setExportStatus('Préparation du rendu...');
    setEstimatedTime(Math.round(project.videoDuration * (renderMode === 'optimized' ? 3 : 8)));

    try {
      const projectWith60FPS = {
        ...project,
        fps: 60,
        renderMode, // 🚀 Mode de rendu sélectionné
        style: {
          ...project.style,
          animationDuration: project.style.animationDuration || 0.15,
        }
      };

      console.log(`🚀 Démarrage export ${renderMode} pour projet:`, projectWith60FPS.id);

      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectWith60FPS),
      });
      
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erreur lors de l'export");
      }

      setProgress(100);
      setExportStatus('Export terminé !');
      setEstimatedTime(0);
      
      // 🎉 Toast de succès avec métriques
      toast.success(`🎉 Export ${renderMode} terminé !`, {
        description: `Rendu en ${json.renderTime || 'N/A'}s • Efficacité: ${json.efficiency || '1.0'}x`,
        action: {
          label: '📥 Télécharger',
          onClick: () => {
            const link = document.createElement('a');
            link.href = json.downloadUrl;
            link.download = `video-${renderMode}-${project.id}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          },
        },
        duration: 12000,
      });

      // 🚀 Téléchargement automatique après 2 secondes
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = json.downloadUrl;
        link.download = `video-${renderMode}-${project.id}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`✅ Téléchargement automatique: ${renderMode} mode`);
      }, 2000);

      // 🎯 Recharger les stats après succès
      if (user) {
        await loadUserStats();
      }

    } catch (err: any) {
      console.error("Export error:", err);
      setExportStatus('Erreur lors de l\'export');
      toast.error(`❌ Erreur export ${renderMode}`, {
        description: err.message || 'Erreur inconnue',
        duration: 8000,
      });
    } finally {
      setExporting(false);
      setEstimatedTime(null);
    }
  };

  // 🔄 Handlers undo/redo
  const handleUndo = () => {
    if (!project) return;
    const previousState = undoRedo.undo();
    if (previousState) {
      setProject(prev => prev ? {
        ...prev,
        subtitles: previousState.segments.map(seg => ({
          id: seg.id,
          start: seg.startTime,
          end: seg.endTime,
          text: seg.text,
          words: seg.words,
        })),
        style: previousState.style,
      } : null);
    }
  };

  const handleRedo = () => {
    if (!project) return;
    const nextState = undoRedo.redo();
    if (nextState) {
      setProject(prev => prev ? {
        ...prev,
        subtitles: nextState.segments.map(seg => ({
          id: seg.id,
          start: seg.startTime,
          end: seg.endTime,
          text: seg.text,
          words: seg.words,
        })),
        style: nextState.style,
      } : null);
    }
  };

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Utilisateur';

  const getCreditStatusColor = () => {
    if (!videoStats) return 'text-gray-500';
    const ratio = videoStats.creditsRemaining / (videoStats.creditsUsed + videoStats.creditsRemaining || 1);
    if (ratio <= 0.2) return 'text-red-500';
    if (ratio <= 0.5) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <ProtectedRoute
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col theme-transition">
          {/* ✅ Header simple pour page publique */}
          <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-lg">
                  Dyers
                </div>
                <div className="font-bold text-xl text-gray-800 dark:text-gray-200">
                  Captions
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-bold">
                  60 FPS ⚡
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Se connecter
              </Button>
            </div>
          </header>

          {/* Contenu de présentation */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">
                  Sous-titrage automatique par IA
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Créez des sous-titres professionnels en 60 FPS pour vos vidéos
                </p>
              </div>
              
              <Card className="max-w-lg mx-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-semibold mb-6 text-center">
                    🎬 Fonctionnalités
                  </h2>
                  <div className="grid gap-4 text-left">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-5 w-5 text-blue-500" />
                      <span>Transcription automatique par IA</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-green-500" />
                      <span>Rendu 60 FPS ultra-fluide</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      <span>8 modes d'animation avancés</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-orange-500" />
                      <span>Presets communautaires</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-red-500" />
                      <span>Optimisé réseaux sociaux</span>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                      <strong>Connectez-vous</strong> pour commencer à créer vos sous-titres !
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      }
    >
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
        <ExportDialog
          open={exporting}
          progress={progress}
          status={exportStatus}
          onCancel={() => setExporting(false)}
          estimatedTimeRemaining={estimatedTime}
        />

        {!project ? (
          <div className="min-h-screen flex flex-col">
            {/* ✅ UN SEUL Header avec statistiques */}
            <DashboardHeader 
              title="Dashboard"
              subtitle={`Bienvenue ${displayName}`}
              actions={
                <div className="flex items-center gap-4">
                  {videoStats && (
                    <>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Crédits restants</div>
                        <div className={`text-sm font-bold ${getCreditStatusColor()}`}>
                          {videoStats.creditsRemaining}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Vidéos créées</div>
                        <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {videoStats.totalVideos}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              }
            />

            {/* Contenu principal - Upload */}
            <div className="flex-1 flex items-center justify-center p-12">
              <div className="max-w-2xl w-full">
                <VideoUpload onVideoProcessed={handleVideoProcessed} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-screen flex flex-col">
            {/* ✅ UN SEUL Header du projet avec outils */}
            <DashboardHeader 
              title="Éditeur de sous-titres"
              subtitle={`Projet: ${project.id} • ${project.videoDuration.toFixed(1)}s • ${project.subtitles.length} segments`}
              showBackButton
              onBack={() => {
                setProject(null);
                setRawSubtitles([]);
                undoRedo.clear();
              }}
              actions={
                <div className="flex items-center gap-2">
                  {/* 🔄 Boutons Undo/Redo */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUndo}
                      disabled={!undoRedo.canUndo()}
                      title="Annuler (Ctrl+Z)"
                      className="h-8 w-8 p-0"
                    >
                      <Undo2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRedo}
                      disabled={!undoRedo.canRedo()}
                      title="Refaire (Ctrl+Y)"
                      className="h-8 w-8 p-0"
                    >
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Séparateur */}
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>

                  {/* 🚀 Sélecteur de mode de rendu */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 dark:text-gray-400">Mode:</label>
                    <select
                      value={renderMode}
                      onChange={(e) => setRenderMode(e.target.value as 'standard' | 'optimized')}
                      className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                    >
                      <option value="optimized">🚀 Optimisé (3x plus rapide)</option>
                      <option value="standard">⚡ Standard (qualité max)</option>
                    </select>
                  </div>

                  {/* 🎯 Crédits restants */}
                  {videoStats && (
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Crédits:</div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                        videoStats.creditsRemaining <= 0 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        {videoStats.creditsRemaining}
                      </div>
                    </div>
                  )}

                  {/* 🎬 Bouton Export principal */}
                  <Button
                    onClick={handleStartExport}
                    disabled={exporting || (videoStats?.creditsRemaining === 0)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 font-semibold disabled:opacity-50 transition-all duration-200"
                  >
                    {exporting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Export {renderMode}...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Exporter 60 FPS</span>
                      </div>
                    )}
                  </Button>
                </div>
              }
            />

            {/* 🎯 Barre de progression d'export */}
            {exporting && (
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{exportStatus}</span>
                  <div className="flex items-center gap-4">
                    {estimatedTime && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>~{estimatedTime}s restantes</span>
                      </div>
                    )}
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{progress}%</span>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Alerte crédits insuffisants */}
            {videoStats?.creditsRemaining === 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-200">
                      Plus de crédits disponibles ce mois
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    onClick={() => window.open('/profile?tab=subscription', '_blank')}
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Upgrader
                  </Button>
                </div>
              </div>
            )}

            {/* Éditeur principal */}
            <div className="flex-1 overflow-hidden pt-5 px-2">
              <SubtitleCustomizer
                project={project}
                rawSubtitles={rawSubtitles}
                onProjectUpdate={(updatedProject) => {
                  // 🎯 Sauvegarder dans l'historique les changements importants
                  if (updatedProject.style !== project.style) {
                    undoRedo.saveState(
                      updatedProject.subtitles.map(s => ({
                        id: s.id,
                        startTime: s.start,
                        endTime: s.end,
                        text: s.text,
                        words: s.words,
                      })),
                      updatedProject.style,
                      'Style modifié',
                      { action: 'style-change' }
                    );
                  }
                  setProject(updatedProject);
                }}
                onReset={() => {
                  setProject(null);
                  setRawSubtitles([]);
                  undoRedo.clear();
                }}
                onStartExport={handleStartExport}
                onExportProgress={setProgress}
              />
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}