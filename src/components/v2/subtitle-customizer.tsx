// src/components/v2/subtitle-customizer.tsx - Headers avec gradient uniforme
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
    fps: 60,
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
    
    if (Math.abs(offsetY - 50) < 5) {
      toast.success('📍 Sous-titres centrés', { duration: 1000 });
    } else if (offsetY < 25) {
      toast.info('⬆️ Position haute', { duration: 1000 });
    } else if (offsetY > 75) {
      toast.info('⬇️ Position basse', { duration: 1000 });
    }
    
    const updatedProject = {
      ...projectWith60FPS,
      style: newStyle,
    };
    onProjectUpdate(updatedProject);
  }, [style, projectWith60FPS, onProjectUpdate]);

  useEffect(() => {
    if (isExporting) {
      const startTime = Date.now();
      setExportStartTime(startTime);
      
      toast.info('🚀 Démarrage du rendu 60 FPS…', {
        description: `Qualité maximale • ${projectWith60FPS.width}x${projectWith60FPS.height} • 60fps`,
        duration: 3000,
      });
      
      onExportProgress?.(0);
    }
  }, [isExporting, projectWith60FPS, onExportProgress]);

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
    <div className="flex-1 flex justify-center items-start px-1 py-0 bg-gray-50 dark:bg-gray-900">
      <div className="flex gap-3 w-full max-w-[1400px]">
        
        {/* ✅ Panel de personnalisation avec header gradient */}
        <div className="w-[32%]">
          <div className="bg-white dark:bg-gray-800 h-[87vh] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            {/* ✅ HEADER UNIFORME avec gradient - Hauteur fixe de 56px */}
            <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex-shrink-0">
              <div className="flex h-full">
                {(['customize','presets'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-all relative flex items-center justify-center ${
                      activeTab===tab
                        ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border-blue-600 dark:border-blue-400 -mb-px z-10'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
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

            {/* ✅ Contenu avec hauteur calculée */}
            <div className="h-[calc(87vh-3.5rem)] overflow-hidden">
              {activeTab==='customize'
                ? <CustomizationPanel style={customization as any} onStyleChange={handleCustomizationChange} />
                : <StylePresets 
                    onSelectPreset={p => handleCustomizationChange({ ...style, displayWords, ...p })} 
                    currentStyle={customization} 
                  />
              }
            </div>
          </div>
        </div>

        {/* ✅ Lecteur vidéo */}
        <div className="w-[36%]">
          <div className="bg-white dark:bg-gray-800 h-[87vh] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <VideoPlayer
              project={projectWith60FPS}
              onReset={onReset}
              onTimeUpdate={setCurrentTime}
              onEffectsChange={{ setBrightness, setContrast, setSaturation }}
              onSubtitlePositionChange={handleSubtitlePositionChange}
            />
          </div>
        </div>

        {/* ✅ Éditeur de légendes */}
        <div className="w-[32%]">
          <div className="bg-white dark:bg-gray-800 h-[87vh] border border-gray-200 dark:border-gray-700  overflow-hidden shadow-sm">
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
  );
}