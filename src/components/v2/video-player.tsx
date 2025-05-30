// src/components/v2/video-player.tsx - OPTIMISÉ pour chargement rapide
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
  Move,
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
  
  // 🚀 État de chargement pour améliorer l'UX
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Effets visuels pour la vidéo
  const [brightness, setBrightness] = useState(project.brightness || 100);
  const [contrast, setContrast] = useState(project.contrast || 100);
  const [saturation, setSaturation] = useState(project.saturation || 100);
  const [audioVolume, setAudioVolume] = useState(50);
  
  // États pour le drag professionnel des sous-titres
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [subtitlePosition, setSubtitlePosition] = useState({ 
    x: 50,
    y: project.style.offsetY || 50
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const subtitleBoxRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🚀 Données du projet mémorisées pour éviter les re-render
  const memoizedInputProps = useMemo(() => ({
    id: project.id,
    videoUrl: project.videoUrl,
    videoDuration: project.videoDuration,
    subtitles: isHidden ? [] : project.subtitles,
    style: {
      ...project.style,
      offsetY: subtitlePosition.y,
      animationDuration: project.style.animationDuration || 0.12,
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
    subtitlePosition.y,
    brightness,
    contrast,
    saturation,
  ]);

  // 🚀 Gestion du chargement avec timeout
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    // Timeout de 10 secondes pour le chargement
    loadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        setLoadError('Timeout de chargement - Vérifiez votre connexion');
        setIsLoading(false);
      }
    }, 10000);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [project.videoUrl]);

  // 🚀 Callback quand le player est prêt
  const handlePlayerReady = useCallback(() => {
    console.log('✅ Player Remotion prêt');
    setIsLoading(false);
    setLoadError(null);
    
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
  }, []);

  // 🚀 Polling optimisé - seulement quand nécessaire
  useEffect(() => {
    if (!playerRef || isLoading) return;
    
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
    }, 33); // 30 FPS pour le polling (économie ressources)
    
    return () => clearInterval(id);
  }, [playerRef, project.fps, onTimeUpdate, isLoading]);

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
    if (!playerRef || isLoading) return;
    try {
      (playerRef as any).setVolume?.(muted ? 0 : volume);
    } catch (error) {
      console.warn('Erreur volume:', error);
    }
  }, [playerRef, volume, muted, isLoading]);

  // Play / pause
  const togglePlay = useCallback(() => {
    if (!playerRef || isLoading) return;
    try {
      if (playing) {
        playerRef.pause?.();
      } else {
        playerRef.play?.();
      }
      setPlaying((p) => !p);
    } catch (error) {
      console.warn('Erreur play/pause:', error);
    }
  }, [playerRef, playing, isLoading]);

  // Seek précis
  const seek = useCallback((seconds: number) => {
    if (!playerRef || isLoading) return;
    try {
      const clamped = Math.max(0, Math.min(seconds, project.videoDuration));
      playerRef.seekTo?.(Math.floor(clamped * (project.fps || 60)));
      setTime(clamped);
      onTimeUpdate(clamped);
    } catch (error) {
      console.warn('Erreur seek:', error);
    }
  }, [playerRef, project.videoDuration, project.fps, onTimeUpdate, isLoading]);

  // Avancer / reculer
  const skip = useCallback((delta: number) => seek(time + delta), [seek, time]);

  // Raccourcis clavier améliorés
  const handleKey = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
    if (isLoading) return;
    
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
  }, [togglePlay, skip, isHidden, muted, isFullscreen, isLoading]);

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

  // DRAG PROFESSIONNEL - Calcul précis de la position
  const getSubtitleBounds = useCallback(() => {
    if (!playerContainerRef.current) return { width: 30, height: 16 };
    
    const currentSub = project.subtitles.find(
      (sub) => time >= sub.start && time <= sub.end
    );
    
    if (!currentSub) return { width: 30, height: 16 };
    
    const textLength = currentSub.text.length;
    const fontSize = project.style.fontSize || 36;
    const containerRect = playerContainerRef.current.getBoundingClientRect();
    
    const estimatedWidth = Math.min(85, Math.max(25, (textLength * fontSize * 0.6) / containerRect.width * 100));
    const estimatedHeight = Math.max(12, fontSize / containerRect.height * 100 * 1.5);
    
    return {
      width: estimatedWidth,
      height: estimatedHeight
    };
  }, [project.subtitles, time, project.style.fontSize]);

  const handleSubtitleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!playerContainerRef.current) return;
    
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !playerContainerRef.current) return;
    
    const rect = playerContainerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const bounds = getSubtitleBounds();
    const newX = Math.max(bounds.width / 2, Math.min(100 - bounds.width / 2, currentX));
    const newY = Math.max(bounds.height / 2, Math.min(100 - bounds.height / 2, currentY));
    
    setSubtitlePosition({ x: newX, y: newY });
    onSubtitlePositionChange?.(newY);
  }, [isDragging, getSubtitleBounds, onSubtitlePositionChange]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, [isDragging]);

  // Event listeners pour le drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleAudioFileSelect = useCallback((file: File) => {
    console.log('Audio file selected:', file.name);
  }, []);

  const currentSubtitle = useMemo(() => 
    project.subtitles.find((sub) => time >= sub.start && time <= sub.end),
    [project.subtitles, time]
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 theme-transition">
        {/* Header uniforme */}
        <div className="border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 px-3 py-2.5 theme-transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">🎥 Video Player</span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full text-xs font-bold">
                60fps
              </span>
              {isLoading && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                  <Loader2 size={10} className="animate-spin" />
                  Chargement...
                </span>
              )}
            </div>
            
            <VideoControls
              onBrightnessChange={(brightness) => {
                setBrightness(brightness);
                onEffectsChange?.setBrightness(brightness);
              }}
              onContrastChange={(contrast) => {
                setContrast(contrast);
                onEffectsChange?.setContrast(contrast);
              }}
              onSaturationChange={(saturation) => {
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
        </div>

        {/* Conteneur principal */}
        <div
          className={`flex-1 flex flex-col items-center justify-center p-1 bg-white dark:bg-gray-800 relative theme-transition ${
            isFullscreen ? 'h-screen w-screen' : ''
          }`}
          ref={containerRef}
          tabIndex={0}
          onKeyDown={handleKey}
          onMouseEnter={focusOnHover}
        >
          {/* Indicateur de drag */}
          {isDragging && (
            <div className="absolute top-4 left-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg">
              <Move size={16} />
              Position: {subtitlePosition.x.toFixed(0)}%, {subtitlePosition.y.toFixed(0)}%
            </div>
          )}
          
          <div
            className={`relative bg-black rounded-xl overflow-hidden shadow-lg transition-all duration-300 ${
              isFullscreen 
                ? 'w-full h-full max-w-none max-h-none' 
                : 'w-full max-w-[280px] mx-auto hover:shadow-xl'
            }`}
            style={{ 
              aspectRatio: isFullscreen ? 'auto' : '9/16', 
              height: isFullscreen ? '100%' : 'auto' 
            }}
            ref={playerContainerRef}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* État de chargement */}
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
                      setIsLoading(true);
                      window.location.reload();
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Réessayer
                  </Button>
                </div>
              </div>
            )}

            {/* Player Remotion */}
            <Player
              ref={(ref) => {
                setPlayerRef(ref);
                if (ref && isLoading) {
                  // Délai pour laisser le temps au player de se charger
                  setTimeout(() => {
                    handlePlayerReady();
                  }, 2000);
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
            
            {/* Rectangle de sélection professionnel */}
            {!isLoading && (isHovering || isDragging) && !isHidden && currentSubtitle && (
              <div
                className={`absolute border-2 bg-blue-400/10 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/20 shadow-lg border-solid' 
                    : 'border-blue-400 border-dashed'
                }`}
                style={{
                  left: `${subtitlePosition.x}%`,
                  top: `${subtitlePosition.y}%`,
                  width: `${getSubtitleBounds().width}%`,
                  height: `${getSubtitleBounds().height}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  minWidth: '120px',
                  minHeight: '40px',
                  maxWidth: '90%',
                  maxHeight: '30%',
                }}
                onMouseDown={handleSubtitleMouseDown}
                ref={subtitleBoxRef}
              >
                {/* Poignées */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                
                {/* Label */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-md font-medium whitespace-nowrap shadow-lg">
                  <span className="flex items-center gap-1.5">
                    <Move size={12} />
                    Sous-titres
                  </span>
                </div>
                
                {/* Lignes de guidage */}
                {isDragging && (
                  <>
                    <div className="absolute top-1/2 left-0 w-full h-px bg-blue-400/60 -translate-y-1/2"></div>
                    <div className="absolute left-1/2 top-0 h-full w-px bg-blue-400/60 -translate-x-1/2"></div>
                  </>
                )}
              </div>
            )}
            
            {/* Bouton play/pause */}
            {!isLoading && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <button 
                  className="bg-black/50 rounded-full p-4 backdrop-blur-sm pointer-events-auto cursor-pointer hover:bg-black/70 transition-colors"
                  onClick={togglePlay}
                >
                  {playing ? (
                    <Pause className="text-white" size={24} />
                  ) : (
                    <Play className="text-white ml-1" size={24} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Contrôles vidéo */}
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
              <div className="text-xs text-green-600 dark:text-green-400 ml-2 font-mono bg-green-50 dark:bg-green-900/30 px-1 rounded">
                60fps UI
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
          
          {/* Aide raccourcis clavier */}
          <div className="px-2 pb-1">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-4">
              <span>Espace: Play/Pause</span>
              <span>←→: ±5s</span>
              <span>Shift+←→: ±10s</span>
              <span>F: Plein écran</span>
              <span>H: Masquer</span>
              <span>M: Muet</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};