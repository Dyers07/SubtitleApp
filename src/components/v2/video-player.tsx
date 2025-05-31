// src/components/v2/video-player.tsx - Version corrigée SANS TREMBLEMENT
'use client';

import React, {
  useState,
  useEffect,
  useRef,
  KeyboardEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from 'react';
import { Player, PlayerRef } from '@remotion/player';
import {
  Pause,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  RefreshCw,
  Loader2,
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
  onEffectsChange?: {
    setBrightness: (val: number) => void;
    setContrast: (val: number) => void;
    setSaturation: (val: number) => void;
  };
  onSubtitlePositionChange?: (offsetY: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  onReset,
  onTimeUpdate,
  onEffectsChange,
  onSubtitlePositionChange,
}) => {
  const [playerRef, setPlayerRef] = useState<PlayerRef | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // ✅ CORRECTION: Pas de loading par défaut
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // ✨ Animation YouTube-like pour play/pause
  const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);
  const [playPauseAnimating, setPlayPauseAnimating] = useState(false);
  
  // Effets visuels pour la vidéo
  const [brightness, setBrightness] = useState(project.brightness || 100);
  const [contrast, setContrast] = useState(project.contrast || 100);
  const [saturation, setSaturation] = useState(project.saturation || 100);
  const [audioVolume, setAudioVolume] = useState(50);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🚀 Données du projet mémorisées avec timing STABILISÉ
  const memoizedInputProps = useMemo(() => ({
    id: project.id,
    videoUrl: project.videoUrl,
    videoDuration: project.videoDuration,
    subtitles: isHidden ? [] : project.subtitles,
    style: {
      ...project.style,
      // 🎯 CORRECTION: Animation plus lente pour stabilité
      animationDuration: project.style.animationDuration || 0.15, // Retour à 0.15s
      // 🚀 SUPPRESSION de la transition forcée qui peut causer le tremblement
    },
    width: project.width,
    height: project.height,
    fps: 60,
    brightness,
    contrast,
    saturation,
  }), [
    project.id,
    project.videoUrl,
    project.videoDuration,
    project.subtitles,
    project.style,
    project.width,
    project.height,
    isHidden,
    brightness,
    contrast,
    saturation,
  ]);

  // ✅ CORRECTION: Gestion du chargement sans timeout artificiel
  useEffect(() => {
    setLoadError(null);
    
    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [project.videoUrl]);

  // ✅ CORRECTION: Callback simple sans délai
  const handlePlayerReady = useCallback(() => {
    console.log('✅ Player Remotion prêt');
    setIsLoading(false);
    setLoadError(null);
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
  }, []);

  // 🚀 Polling optimisé à 30 FPS pour stabilité (CORRECTION MAJEURE)
  useEffect(() => {
    if (!playerRef) return;
    
    const id = setInterval(() => {
      try {
        const frame = playerRef.getCurrentFrame?.();
        if (typeof frame === 'number') {
          const videoFPS = project.fps || 60;
          const t = frame / videoFPS;
          setTime(t);
          onTimeUpdate(t);
        }
      } catch (error) {
        console.warn('Erreur polling frame:', error);
      }
    }, 33); // 🎯 CORRECTION: Retour à 30 FPS (33ms) pour la stabilité
    
    return () => clearInterval(id);
  }, [playerRef, project.fps, onTimeUpdate]);

  // Gestion plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Appliquer volume / mute
  useEffect(() => {
    if (!playerRef) return;
    try {
      (playerRef as any).setVolume?.(muted ? 0 : volume);
    } catch (error) {
      console.warn('Erreur volume:', error);
    }
  }, [playerRef, volume, muted]);

  // ✨ Animation Play/Pause style YouTube
  const showPlayPauseAnimation = useCallback((isPlaying: boolean) => {
    setShowPlayPauseIcon(true);
    setPlayPauseAnimating(true);
    
    // Nettoyer le timeout précédent
    if (playPauseTimeoutRef.current) {
      clearTimeout(playPauseTimeoutRef.current);
    }
    
    // Masquer l'icône après 500ms
    playPauseTimeoutRef.current = setTimeout(() => {
      setPlayPauseAnimating(false);
      setTimeout(() => setShowPlayPauseIcon(false), 150);
    }, 500);
  }, []);

  // Play / pause avec animation
  const togglePlay = useCallback(() => {
    if (!playerRef) return;
    try {
      const newPlayingState = !playing;
      if (newPlayingState) {
        playerRef.play?.();
      } else {
        playerRef.pause?.();
      }
      setPlaying(newPlayingState);
      showPlayPauseAnimation(newPlayingState);
    } catch (error) {
      console.warn('Erreur play/pause:', error);
    }
  }, [playerRef, playing, showPlayPauseAnimation]);

  // Seek précis
  const seek = useCallback((seconds: number) => {
    if (!playerRef) return;
    try {
      const clamped = Math.max(0, Math.min(seconds, project.videoDuration));
      playerRef.seekTo?.(Math.floor(clamped * (project.fps || 60)));
      setTime(clamped);
      onTimeUpdate(clamped);
    } catch (error) {
      console.warn('Erreur seek:', error);
    }
  }, [playerRef, project.videoDuration, project.fps, onTimeUpdate]);

  // Avancer / reculer
  const skip = useCallback((delta: number) => seek(time + delta), [seek, time]);

  // 🚀 Raccourcis clavier globaux améliorés
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      // Ignorer si on tape dans un input
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.target && (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(e.shiftKey ? 10 : 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(e.shiftKey ? -10 : -5);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyH':
          e.preventDefault();
          setIsHidden(!isHidden);
          break;
        case 'KeyM':
          e.preventDefault();
          setMuted(!muted);
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };

    // Attacher l'écouteur au document pour une portée globale
    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [togglePlay, skip, isHidden, muted, isFullscreen]);

  const focusOnHover = useCallback(() => containerRef.current?.focus(), []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .catch((err) => console.error(`Cannot enable fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen().catch((err) => console.error(`Cannot exit fullscreen: ${err.message}`));
    }
  }, []);

  const handleAudioFileSelect = useCallback((file: File) => {
    console.log('Audio file selected:', file.name);
  }, []);

  // 🎯 Clic sur le player pour play/pause avec animation
  const handlePlayerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    togglePlay();
  }, [togglePlay]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (playPauseTimeoutRef.current) {
        clearTimeout(playPauseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 theme-transition">
        {/* ✅ HEADER UNIFORME avec les contrôles intégrés */}
        <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-between px-4 flex-shrink-0 theme-transition">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_5px_rgba(248,113,113,0.8)]"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Player</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full font-bold">
              30fps UI
            </div>
            {/* ✅ CORRECTION: Indicateur de loading seulement si vraiment en loading */}
            {isLoading && (
              <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                <Loader2 size={10} className="animate-spin" />
                Chargement...
              </div>
            )}
          </div>
          
          {/* 🎨 Contrôles Colors et Audio dans le header */}
          <VideoControls
            onBrightnessChange={(brightness: number) => {
              setBrightness(brightness);
              onEffectsChange?.setBrightness(brightness);
            }}
            onContrastChange={(contrast: number) => {
              setContrast(contrast);
              onEffectsChange?.setContrast(contrast);
            }}
            onSaturationChange={(saturation: number) => {
              setSaturation(saturation);
              onEffectsChange?.setSaturation(saturation);
            }}
            onAudioFileSelect={handleAudioFileSelect}
            onAudioVolumeChange={setAudioVolume}
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            audioVolume={audioVolume}
          />
        </div>

        {/* Conteneur principal */}
        <div
          className={`flex-1 flex flex-col items-center justify-center p-1 bg-white dark:bg-gray-800 relative theme-transition ${
            isFullscreen ? 'h-screen w-screen' : ''
          }`}
          ref={containerRef}
          tabIndex={0}
          onMouseEnter={focusOnHover}
        >
          <div
            className={`relative bg-black rounded-xl overflow-hidden shadow-lg transition-all duration-300 cursor-pointer ${
              isFullscreen 
                ? 'w-full h-full max-w-none max-h-none' 
                : 'w-full max-w-[280px] mx-auto hover:shadow-xl'
            }`}
            style={{ 
              aspectRatio: isFullscreen ? 'auto' : '9/16', 
              height: isFullscreen ? '100%' : 'auto' 
            }}
            ref={playerContainerRef}
            onClick={handlePlayerClick}
          >
            {/* ✅ CORRECTION: État de chargement seulement si isLoading est vraiment true */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="text-center text-white">
                  <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                  <p className="text-sm">Chargement de la vidéo...</p>
                </div>
              </div>
            )}

            {/* Erreur de chargement */}
            {loadError && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                <div className="text-center text-white p-4">
                  <p className="text-sm mb-2">❌ {loadError}</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setLoadError(null);
                      setIsLoading(false);
                      window.location.reload();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            )}

            {/* ✅ CORRECTION: Player Remotion sans délai artificiel */}
            <Player
              ref={(ref) => {
                setPlayerRef(ref);
                // ✅ CORRECTION: Pas de délai, player ready immédiatement
                if (ref) {
                  console.log('🚀 Player ref obtenu, prêt instantanément');
                  setIsLoading(false);
                }
              }}
              component={CaptionedVideo}
              inputProps={memoizedInputProps}
              durationInFrames={Math.floor(project.videoDuration * 60)}
              fps={60}
              compositionWidth={project.width}
              compositionHeight={project.height}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
              }}
              controls={false}
            />
            
            {/* ✨ Animation Play/Pause style YouTube */}
            {showPlayPauseIcon && (
              <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-30 transition-all duration-150 ${
                playPauseAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-125'
              }`}>
                <div className="bg-black/70 rounded-full p-6 backdrop-blur-sm">
                  {playing ? (
                    <Pause className="text-white" size={48} />
                  ) : (
                    <Play className="text-white ml-1" size={48} />
                  )}
                </div>
              </div>
            )}
            
            {/* Overlay hover pour bouton play/pause subtil */}
            {!isLoading && !showPlayPauseIcon && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-black/30 rounded-full p-3 backdrop-blur-sm">
                  {playing ? (
                    <Pause className="text-white" size={20} />
                  ) : (
                    <Play className="text-white ml-0.5" size={20} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Contrôles vidéo simplifiés */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 theme-transition">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 relative mx-2">
            <Slider
              value={[time]}
              min={0}
              max={project.videoDuration}
              step={0.01}
              onValueChange={([v]) => seek(v)}
              className="absolute inset-0 h-full"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between p-1.5">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="p-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 h-7 w-7"
                title="Lecture/Pause (Espace)"
                disabled={isLoading}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </Button>
              <div className="text-xs text-gray-700 dark:text-gray-300 ml-1">
                {fmt(time)} / {fmt(project.videoDuration)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onReset}
                    className="p-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 h-6 w-6"
                  >
                    <RefreshCw size={12} />
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMuted((m) => !m)}
                  className="p-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 h-6 w-6"
                  title="Muet (M)"
                  disabled={isLoading}
                >
                  {muted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </Button>
                {showVolumeSlider && !isLoading && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-20 h-6 bg-white dark:bg-gray-800 shadow-md rounded-md p-1 mb-1 theme-transition">
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
              
              <div className="flex items-center gap-1">
                <Button
                  variant={isHidden ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setIsHidden(!isHidden)}
                  className="text-xs font-medium h-6 px-2"
                  title="Masquer sous-titres (H)"
                  disabled={isLoading}
                >
                  {isHidden ? 'Show' : 'Hide'}
                </Button>
                
                <span className="mx-1 text-xs text-gray-500 dark:text-gray-400">9:16</span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="p-1 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 h-6 w-6"
                  title="Plein écran (F)"
                  disabled={isLoading}
                >
                  <Maximize2 size={12} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};