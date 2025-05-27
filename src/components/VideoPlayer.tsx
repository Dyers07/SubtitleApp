'use client';

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  Dispatch,
  SetStateAction,
} from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

import { CaptionedVideo } from '@/remotion/CaptionedVideo';
import { VideoProject } from '@/types';

interface Props {
  project: VideoProject;
  onReset: () => void;
  onTimeUpdate: Dispatch<SetStateAction<number>>;
}

/* helpers ----------------------------------------------------------- */
const fmt = (s: number) =>
  [Math.floor(s / 60), Math.floor(s % 60)]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');

/* ─────────────────────────────────────────────────────────────────── */
export const VideoPlayer: React.FC<Props> = ({
  project,
  onReset,
  onTimeUpdate,
}) => {
  const [playerRef, setPlayerRef] = useState<PlayerRef | null>(null);

  const [playing, setPlaying] = useState(false);
  const [time, setTime]       = useState(0);
  const [volume, setVolume]   = useState(1); // 0-1
  const [muted,  setMuted]    = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  /* suivi du temps courant ---------------------------------------- */
  useEffect(() => {
    if (!playerRef) return;
    const id = setInterval(() => {
      const frame = playerRef.getCurrentFrame?.();
      if (typeof frame === 'number') {
        const t = frame / project.fps;
        setTime(t);
        onTimeUpdate(t);
      }
    }, 200);
    return () => clearInterval(id);
  }, [playerRef, project.fps, onTimeUpdate]);

  /* applique volume / mute au lecteur ----------------------------- */
  useEffect(() => {
    if (!playerRef) return;

    // Les types du SDK ne déclarent pas encore setVolume → cast
    (playerRef as any).setVolume?.(muted ? 0 : volume);
  }, [playerRef, volume, muted]);

  /* helpers play / seek ------------------------------------------- */
  const togglePlay = () => {
    if (!playerRef) return;
    playing ? playerRef.pause?.() : playerRef.play?.();
    setPlaying((p) => !p);
  };

  const seek = (seconds: number) => {
    if (!playerRef) return;
    const clamped = Math.max(0, Math.min(seconds, project.videoDuration));
    playerRef.seekTo?.(Math.floor(clamped * project.fps));
    setTime(clamped);
    onTimeUpdate(clamped);
  };

  const skip = (delta: number) => seek(time + delta);

  /* keyboard shortcuts -------------------------------------------- */
  const onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
    if (e.code === 'ArrowRight') skip(5);
    if (e.code === 'ArrowLeft')  skip(-5);
  };

  const focusOnHover = () => containerRef.current?.focus();

  /* plein-écran support (pas encore typé) -------------------------- */
  const canFullscreen = !!playerRef?.requestFullscreen;

  /* ───────────────────────── render ─────────────────────────────── */
  return (
    <Card className="w-full">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Aperçu vidéo</CardTitle>
        <Button size="sm" variant="outline" onClick={onReset}>
          Nouvelle vidéo
        </Button>
      </CardHeader>

      <CardContent
        ref={containerRef}
        tabIndex={0}
        onKeyDown={onKey}
        onMouseEnter={focusOnHover}
        className="space-y-4 outline-none"
      >
        {/* player --------------------------------------------------- */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <Player
            ref={setPlayerRef}
            component={CaptionedVideo}
            inputProps={{
              id: project.id,
              videoUrl: project.videoUrl,
              videoDuration: project.videoDuration,
              subtitles: project.subtitles,
              style: project.style,
              width: project.width,
              height: project.height,
              fps: project.fps,
            }}
            durationInFrames={Math.floor(project.videoDuration * project.fps)}
            fps={project.fps}
            compositionWidth={project.width}
            compositionHeight={project.height}
            style={{ width: '100%', aspectRatio: `${project.width}/${project.height}` }}
            controls={false}
            /* @ts-expect-error  volume n’est pas encore dans les defs TS */
            volume={muted ? 0 : volume}            // fonctionne runtime
          />
        </div>

        {/* contrôles ------------------------------------------------ */}
        <div className="space-y-2">
          {/* barre de progression */}
          <Slider
            min={0}
            max={project.videoDuration}
            step={0.1}
            value={[time]}
            onValueChange={([v]) => seek(v)}
            className="[&>[data-slider-track]]:h-1"
          />

          <div className="flex items-center gap-3">
            {/* play / pause */}
            <Button size="icon" variant="outline" onClick={togglePlay}>
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            {/* timecode */}
            <span className="text-sm tabular-nums w-20 text-center">
              {fmt(time)} / {fmt(project.videoDuration)}
            </span>

            {/* mute */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMuted((m) => !m)}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* volume slider */}
            <div className="w-24">
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[muted ? 0 : volume]}
                onValueChange={([v]) => {
                  setVolume(v);
                  setMuted(v === 0);
                }}
              />
            </div>

            {/* plein-écran */}
            {canFullscreen && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() =>
                  playerRef?.isFullscreen?.()
                    ? playerRef?.exitFullscreen?.()
                    : playerRef?.requestFullscreen?.()
                }
              >
                {playerRef?.isFullscreen?.() ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
