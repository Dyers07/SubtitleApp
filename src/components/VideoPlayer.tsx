'use client';

import React, { useState, useEffect } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CaptionedVideo } from '@/remotion/CaptionedVideo';
import { VideoProject } from '@/types';

interface VideoPlayerProps {
  project: VideoProject;
  onStyleChange: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ project, onStyleChange }) => {
  const [playerRef, setPlayerRef] = useState<PlayerRef | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!playerRef) return;

    const interval = setInterval(() => {
      const frame = playerRef.getCurrentFrame();
      setCurrentTime(frame / project.fps);
    }, 100);

    return () => clearInterval(interval);
  }, [playerRef, project.fps]);

  const handlePlayPause = () => {
    if (!playerRef) return;
    
    if (isPlaying) {
      playerRef.pause();
    } else {
      playerRef.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    if (!playerRef) return;
    playerRef.seekTo(Math.floor(time * project.fps));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Aperçu vidéo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            style={{
              width: '100%',
              aspectRatio: `${project.width} / ${project.height}`,
            }}
            controls={false}
          />
        </div>

        {/* Contrôles personnalisés */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlayPause}
              variant="outline"
              size="sm"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <div className="flex-1 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={project.videoDuration}
                step="0.1"
                value={currentTime}
                onChange={(e) => handleSeek(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">
                {formatTime(project.videoDuration)}
              </span>
            </div>
          </div>

          {/* Sous-titres actuels */}
          <div className="bg-muted p-2 rounded text-sm">
            <span className="text-muted-foreground">Sous-titre actuel : </span>
            {project.subtitles.find(
              (sub) => currentTime >= sub.start && currentTime <= sub.end
            )?.text || 'Aucun'}
          </div>
        </div>

        <Button 
          onClick={onStyleChange}
          variant="secondary"
          className="w-full"
        >
          Personnaliser les sous-titres
        </Button>
      </CardContent>
    </Card>
  );
};