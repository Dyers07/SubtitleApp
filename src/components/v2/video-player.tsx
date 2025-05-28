// src/components/v2/video-player.tsx
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
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CaptionedVideo } from '@/remotion/CaptionedVideo';
import { VideoProject } from '@/types';
import { VideoControls } from '@/components/v2/video-controls-enhanced';

/** Format MM:SS.sss */
const fmt = (s: number) =>
  [
    Math.floor(s / 60),
    Math.floor(s % 60),
    Math.floor((s % 1) * 100),
  ]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');

interface VideoPlayerProps {
  project: VideoProject;
  onReset: () => void;
  onTimeUpdate: Dispatch<SetStateAction<number>>;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  onReset,
  onTimeUpdate,
}) => {
  const [playerRef, setPlayerRef] = useState<PlayerRef | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pinger le player toutes les 200ms pour mettre à jour time / parent
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

  // Appliquer volume / mute
  useEffect(() => {
    if (!playerRef) return;
    (playerRef as any).setVolume?.(muted ? 0 : volume);
  }, [playerRef, volume, muted]);

  // Play / pause
  const togglePlay = () => {
    if (!playerRef) return;
    if (playing) {
      playerRef.pause?.();
    } else {
      playerRef.play?.();
    }
    setPlaying((p) => !p);
  };

  // Seek précis
  const seek = (seconds: number) => {
    if (!playerRef) return;
    const clamped = Math.max(0, Math.min(seconds, project.videoDuration));
    playerRef.seekTo?.(Math.floor(clamped * project.fps));
    setTime(clamped);
    onTimeUpdate(clamped);
  };

  // Avancer / reculer
  const skip = (delta: number) => seek(time + delta);

  // Raccourcis clavier
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    }
    if (e.code === 'ArrowRight') skip(5);
    if (e.code === 'ArrowLeft') skip(-5);
  };

  // Focus container on hover pour capter les touches
  const focusOnHover = () => containerRef.current?.focus();

  // Plein écran
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .catch((err) => console.error(`Cannot enable fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen().catch((err) => console.error(`Cannot exit fullscreen: ${err.message}`));
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-white">
        {/* Contrôles avancés: Preview, Colors, Audio */}
        <VideoControls
          onBrightnessChange={() => {}}
          onContrastChange={() => {}}
          onSaturationChange={() => {}}
          onAudioFileSelect={() => {}}
          onAudioVolumeChange={() => {}}
          brightness={100}
          contrast={100}
          saturation={100}
          audioVolume={50}
        />

        {/* Conteneur principal */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-2 bg-white"
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKey}
          onMouseEnter={focusOnHover}
        >
          <div
            className="relative bg-black rounded-2xl overflow-hidden w-full max-w-[360px] mx-auto shadow-lg"
            style={{ aspectRatio: '9/16', height: 'auto' }}
          >
            {/* Player Remotion */}
            <Player
              ref={setPlayerRef}
              component={CaptionedVideo}
              inputProps={{
                id: project.id,
                videoUrl: project.videoUrl,
                videoDuration: project.videoDuration,
                subtitles: isHidden ? [] : project.subtitles,
                style: project.style,
                width: project.width,
                height: project.height,
                fps: project.fps,
              }}
              durationInFrames={Math.floor(project.videoDuration * project.fps)}
              fps={project.fps}
              compositionWidth={project.width}
              compositionHeight={project.height}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              controls={false}
              // @ts-expect-error setVolume runtime
              volume={muted ? 0 : volume}
              onClick={togglePlay}
              playsInline
            />
          </div>
        </div>

        {/* Contrôles vidéo classiques */}
        <div className="bg-white border-t border-gray-200">
          <div className="h-1 bg-gray-200 relative mx-2">
            <Slider
              value={[time]}
              min={0}
              max={project.videoDuration}
              step={0.01}
              onValueChange={([v]) => seek(v)}
              className="absolute inset-0 h-full"
            />
          </div>

          <div className="flex items-center justify-between p-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="p-1 text-gray-700 hover:text-gray-900"
              >
                {playing ? <Pause size={18} /> : <Play size={18} />}
              </Button>
              <div className="text-xs text-gray-700 ml-2">
                {fmt(time)} / {fmt(project.videoDuration)}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onReset}
                    className="p-1 text-gray-700 hover:text-gray-900"
                  >
                    <RefreshCw size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset</p>
                </TooltipContent>
              </Tooltip>
              <div
                className="relative"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMuted((m) => !m)}
                      className="p-1 text-gray-700 hover:text-gray-900"
                    >
                      {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mute</p>
                  </TooltipContent>
                </Tooltip>
                {showVolumeSlider && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-24 h-8 bg-white shadow-md rounded-md p-2 mb-1 transition-opacity duration-300">
                    <Slider
                      value={[muted ? 0 : volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={([v]) => {
                        setVolume(v);
                        setMuted(v === 0);
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isHidden ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setIsHidden(!isHidden)}
                      className="text-xs font-medium h-7"
                    >
                      Hidden
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle Subtitles</p>
                  </TooltipContent>
                </Tooltip>
                <span className="mx-2 text-xs text-gray-500">9:16</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFullscreen}
                      className="p-1 text-gray-700 hover:text-gray-900"
                    >
                      <Maximize2 size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Full Screen</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
