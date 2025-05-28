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
});

const backToSubtitle = (seg: SubtitleSegment): Subtitle => ({
  id: seg.id,
  start: seg.startTime,
  end: seg.endTime,
  text: seg.text,
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
  const [style, setStyle] = useState<SubtitleStyle>(project.style);
  const [segments, setSegments] = useState<SubtitleSegment[]>(() => {
    return splitSubtitles(rawSubtitles, displayWords).map(toSegment);
  });

  useEffect(() => {
    const segs = splitSubtitles(rawSubtitles, displayWords).map(toSegment);
    setSegments(segs);
    onProjectUpdate({
      ...project,
      subtitles: segs.map(backToSubtitle),
      style,
    });
  }, [rawSubtitles, displayWords]);

  const commitStyle = useCallback(
    (newStyle: SubtitleStyle) => {
      setStyle(newStyle);
      onProjectUpdate({
        ...project,
        subtitles: segments.map(backToSubtitle),
        style: newStyle,
      });
    },
    [onProjectUpdate, project, segments]
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
    onProjectUpdate({
      ...project,
      subtitles: next.map(backToSubtitle),
      style,
    });
  };

  const handleExport = async () => {
    try {
      onStartExport();
      toast.info('Démarrage du rendu…');
      onExportProgress(0);
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Échec du rendu');
      onExportProgress(100);
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = `video-subtitled-${project.id}.mp4`;
      link.click();
      toast.success('Export terminé !');
    } catch (err) {
      toast.error(`Erreur export : ${err instanceof Error ? err.message : 'inconnue'}`);
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
        </div>
        <Button
          className="absolute right-6 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 font-semibold"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-1.5" />
          Exporter
        </Button>
      </header>

      <div className="flex-1 flex justify-center items-center px-4 py-0.5">
        <div className="flex gap-8 w-full max-w-[1500px]">
          {/* Panel */}
          <div className="w-[35%]">
            <div className="bg-white h-[90vh] border rounded-lg overflow-hidden">
              <div className="border-b flex">
                {(['customize','presets'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-3 text-sm font-medium ${
                      activeTab===tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={()=>setActiveTab(tab)}
                  >
                    {tab==='customize' ? 'Customize' : 'Presets'}
                  </button>
                ))}
              </div>

              {activeTab==='customize'
                ? <CustomizationPanel style={customization as any} onStyleChange={handleCustomizationChange} />
                : <StylePresets onSelectPreset={p=>handleCustomizationChange({...style, displayWords, ...p})} />
              }
            </div>
          </div>

          {/* Lecteur */}
          <div className="w-[28%]">
            <div className="bg-white h-[90vh] border rounded-lg overflow-hidden">
              <VideoPlayer
                project={{ ...project, subtitles: segments.map(backToSubtitle) }}
                onReset={onReset}
                onTimeUpdate={setCurrentTime}
              />
            </div>
          </div>

          {/* Éditeur */}
          <div className="w-[35%]">
            <div className="bg-white h-[90vh] border rounded-lg overflow-hidden">
              <div className="border-b py-3 px-4">
                <h2 className="text-sm font-medium">Edit Captions</h2>
              </div>
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
