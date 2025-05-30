// src/components/v2/subtitle-customizer.tsx
'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { VideoPlayer } from './video-player';
import { CustomizationPanel } from './customization-panel';
import { EditCaptions } from './edit-captions';
import { StylePresets } from './style-presets';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import type {
  VideoProject,
  Subtitle,
  SubtitleSegment,
  SubtitleStyle,
  SubtitleCustomizerProps,
} from '@/types';
import { splitSubtitles } from '@/utils/splitSubtitles';

const toSegment = (s: Subtitle): SubtitleSegment => ({
  id: s.id,
  startTime: s.start,
  endTime: s.end,
  text: s.text,
  words: s.words,
});

const backToSubtitle = (seg: SubtitleSegment): Subtitle => ({
  id: seg.id,
  start: seg.startTime,
  end: seg.endTime,
  text: seg.text,
  words: seg.words,
});

export function SubtitleCustomizer({
  project,
  rawSubtitles,
  onProjectUpdate,
  onReset,
  onStartExport,
  onExportProgress,
}: SubtitleCustomizerProps) {
  const [displayWords, setDisplayWords] = useState(3);
  const [style, setStyle] = useState<SubtitleStyle>({
    ...project.style,
    // 🚀 Assurer 60 FPS par défaut
    animationDuration: project.style.animationDuration || 0.15,
  });
  const [segments, setSegments] = useState<SubtitleSegment[]>(() => {
    return splitSubtitles(rawSubtitles, displayWords).map(toSegment);
  });
  const [isExporting, setIsExporting] = useState(false);
  
  // États pour les effets visuels
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  // États pour le suivi d'export
  const [exportStartTime, setExportStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);

  // 🚀 Assurer que le projet est toujours en 60 FPS
  const projectWith60FPS = useMemo(() => ({
    ...project,
    fps: 60, // Force 60 FPS
    style,
    subtitles: segments.map(backToSubtitle),
    brightness,
    contrast,
    saturation,
  }), [project, style, segments, brightness, contrast, saturation]);

  useEffect(() => {
    const segs = splitSubtitles(rawSubtitles, displayWords).map(toSegment);
    setSegments(segs);
    onProjectUpdate(projectWith60FPS);
  }, [rawSubtitles, displayWords]);

  const commitStyle = useCallback(
    (newStyle: SubtitleStyle) => {
      setStyle(newStyle);
      const updatedProject = {
        ...projectWith60FPS,
        style: newStyle,
      };
      onProjectUpdate(updatedProject);
    },
    [onProjectUpdate, projectWith60FPS]
  );

  const [currentTime, setCurrentTime] = useState(0);
  const activeSegment = useMemo(
    () =>
      segments.find(
        (s) => currentTime >= s.startTime && currentTime <= s.endTime
      ),
    [currentTime, segments]
  );
  const [selectedId, setSelectedId] = useState<string | null>(
    activeSegment?.id ?? null
  );

  useEffect(() => {
    if (activeSegment?.id && activeSegment.id !== selectedId) {
      setSelectedId(activeSegment.id);
    }
  }, [activeSegment, selectedId]);

  const updateSegment = (id: string, patch: Partial<SubtitleSegment>) => {
    const next = segments.map((s) => (s.id === id ? { ...s, ...patch } : s));
    setSegments(next);
    const updatedProject = {
      ...projectWith60FPS,
      subtitles: next.map(backToSubtitle),
    };
    onProjectUpdate(updatedProject);
  };

  // 🎯 Handler pour le drag des sous-titres
  const handleSubtitlePositionChange = useCallback((offsetY: number) => {
    const newStyle = {
      ...style,
      offsetY,
    };
    setStyle(newStyle);
    
    // 🚀 Toast de feedback visuel
    if (Math.abs(offsetY - 50) < 5) {
      toast.success('📍 Sous-titres centrés', { duration: 1000 });
    } else if (offsetY < 25) {
      toast.info('⬆️ Position haute', { duration: 1000 });
    } else if (offsetY > 75) {
      toast.info('⬇️ Position basse', { duration: 1000 });
    }
    
    // Mise à jour du projet
    const updatedProject = {
      ...projectWith60FPS,
      style: newStyle,
    };
    onProjectUpdate(updatedProject);
  }, [style, projectWith60FPS, onProjectUpdate]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const startTime = Date.now();
      setExportStartTime(startTime);
      onStartExport();
      
      // 🎉 Toast d'info avec détails 60 FPS
      toast.info('🚀 Démarrage du rendu 60 FPS…', {
        description: `Qualité maximale • ${projectWith60FPS.width}x${projectWith60FPS.height} • 60fps`,
        duration: 3000,
      });
      onExportProgress(0);

      // 🎯 Estimation plus précise pour 60 FPS (plus long)
      const estimatedDuration = projectWith60FPS.videoDuration * 3 * 1000; // 3x la durée pour 60fps
      
      // Progression réaliste avec ralentissement vers la fin
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressFactor = elapsed / estimatedDuration;
        
        // Courbe de progression réaliste pour 60 FPS
        if (progressFactor < 0.6) {
          currentProgress = Math.min(progressFactor * 70, 70);
        } else if (progressFactor < 0.85) {
          currentProgress = Math.min(70 + ((progressFactor - 0.6) / 0.25) * 20, 90);
        } else {
          // Ralentir après 90% (finalisation 60 FPS)
          currentProgress = Math.min(90 + ((progressFactor - 0.85) / 0.15) * 5, 95);
        }
        
        onExportProgress(Math.round(currentProgress));
        
        // Calculer le temps restant
        if (currentProgress > 10) {
          const timePerPercent = elapsed / currentProgress;
          const remaining = Math.round(((100 - currentProgress) * timePerPercent) / 1000);
          setEstimatedTimeRemaining(remaining);
        }
      }, 1000); // Mise à jour chaque seconde

      // Projet avec effets visuels et 60 FPS
      const finalProject = {
        ...projectWith60FPS,
        fps: 60, // 🎯 Garantir 60 FPS
        style: {
          ...style,
          // Optimiser les animations pour 60 FPS
          animationDuration: style.animationDuration || 0.15,
        },
      };

      console.log('🚀 Sending 60 FPS project for render:', {
        fps: finalProject.fps,
        duration: finalProject.videoDuration,
        subtitles: finalProject.subtitles.length,
        effects: { brightness, contrast, saturation }
      });

      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalProject),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.downloadUrl) {
        throw new Error(data.error || 'Aucune URL de téléchargement reçue');
      }

      onExportProgress(100);
      setEstimatedTimeRemaining(0);

      // 🎉 Toast de succès avec téléchargement unique
      toast.success('🎉 Export 60 FPS terminé !', {
        description: `Vidéo "${finalProject.id}" rendue en qualité maximale`,
        action: {
          label: '📥 Télécharger',
          onClick: () => {
            const link = document.createElement('a');
            link.href = data.downloadUrl;
            link.download = `video-60fps-${finalProject.id}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          },
        },
        duration: 10000,
      });

      // 🚀 UN SEUL téléchargement automatique après 2 secondes
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `video-60fps-${finalProject.id}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Téléchargement unique effectué');
      }, 2000);

    } catch (err) {
      console.error('Export error:', err);
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`❌ Erreur export 60 FPS : ${message}`, {
        description: 'Vérifiez la console pour plus de détails',
        duration: 8000,
      });
      onExportProgress(0);
      setEstimatedTimeRemaining(null);
    } finally {
      setIsExporting(false);
      setExportStartTime(null);
    }
  };

  const [activeTab, setActiveTab] = useState<'customize' | 'presets'>('customize');
  const customization = { ...style, displayWords };
  const handleCustomizationChange = (custom: any) => {
    if (custom.displayWords !== undefined) {
      setDisplayWords(custom.displayWords);
    }
    const { displayWords: _dw, ...patch } = custom;
    commitStyle({ ...style, ...patch });
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex justify-center items-center py-3 px-6 border-b bg-white relative">
        <div className="flex items-center">
          <Logo />
          <div className="text-gray-500 text-sm ml-2">Alpha 1.0</div>
          {/* 🎯 Indicateur 60 FPS */}
          <div className="ml-4 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
            60 FPS ⚡
          </div>
        </div>
        <Button
          className="absolute right-6 bg-[#b978fd] hover:bg-[#a865ea] text-white px-3 py-1.5 font-semibold disabled:opacity-50 transition-all duration-200 cursor-pointer"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-1.5" />
          {isExporting ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Export 60 FPS...
            </span>
          ) : (
            'Exporter 60 FPS'
          )}
        </Button>
      </header>

      <div className="flex-1 flex justify-center items-center px-2 py-1">
        <div className="flex gap-4 w-full max-w-[1400px]">
          {/* Panel */}
          <div className="w-[32%]">
            <div className="bg-white h-[85vh] border rounded-lg overflow-hidden shadow-sm">
              <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex">
                  {(['customize','presets'] as const).map(tab => (
                    <button
                      key={tab}
                      className={`flex-1 px-4 py-3 text-sm font-semibold transition-all relative ${
                        activeTab===tab
                          ? 'text-blue-600 bg-white rounded-t-lg shadow-sm border-b-2 border-blue-600 -mb-px z-10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                      onClick={()=>setActiveTab(tab)}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {tab==='customize' ? '🎨' : '🎭'}
                        {tab==='customize' ? 'Customize' : 'Presets'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {activeTab==='customize'
                ? <CustomizationPanel style={customization as any} onStyleChange={handleCustomizationChange} />
                : <StylePresets 
                    onSelectPreset={p => handleCustomizationChange({ ...style, displayWords, ...p })} 
                    currentStyle={customization} 
                  />
              }
            </div>
          </div>

          {/* Lecteur avec drag des sous-titres */}
          <div className="w-[36%]">
            <div className="bg-white h-[85vh] border rounded-lg overflow-hidden">
              <VideoPlayer
                project={projectWith60FPS}
                onReset={onReset}
                onTimeUpdate={setCurrentTime}
                onEffectsChange={{ setBrightness, setContrast, setSaturation }}
                onSubtitlePositionChange={handleSubtitlePositionChange}
              />
            </div>
          </div>

          {/* Éditeur */}
          <div className="w-[32%]">
            <div className="bg-white h-[85vh] border rounded-lg overflow-hidden">
              <EditCaptions
                segments={segments}
                currentTime={currentTime}
                onUpdateSubtitle={updateSegment}
                onDeleteSubtitle={(id) => updateSegment(id, { text: '' })}
                onMoveToNext={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}