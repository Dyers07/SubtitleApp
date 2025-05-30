'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface VideoControlsProps {
  onBrightnessChange: (value: number) => void;
  onContrastChange: (value: number) => void;
  onSaturationChange: (value: number) => void;
  onAudioFileSelect: (file: File) => void;
  onAudioVolumeChange: (volume: number) => void;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  audioVolume?: number;
}

export function VideoControls({
  onBrightnessChange,
  onContrastChange,
  onSaturationChange,
  onAudioFileSelect,
  onAudioVolumeChange,
  brightness = 100,
  contrast = 100,
  saturation = 100,
  audioVolume = 50,
}: VideoControlsProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleAudioFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      onAudioFileSelect(file);
    }
  };

  const musicLibrary = [
    { name: 'Upbeat Pop', url: '/audio/upbeat-pop.mp3' },
    { name: 'Chill Lofi', url: '/audio/chill-lofi.mp3' },
    { name: 'Epic Cinematic', url: '/audio/epic-cinematic.mp3' },
    { name: 'Ambient Nature', url: '/audio/ambient-nature.mp3' },
  ];

  const resetColorSettings = () => {
    onBrightnessChange(100);
    onContrastChange(100);
    onSaturationChange(100);
  };

  return (
    <div className="flex justify-center gap-2">
      {/* Colors Dropdown avec fond assorti */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-3 py-1.5 text-xs font-medium bg-white/70 hover:bg-white/90 border border-white/50 rounded-full shadow-sm transition-all duration-200"
          >
            <span className="mr-1.5">🎨</span>
            Colors
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-4" align="end">
          <DropdownMenuLabel>Ajustements vidéo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Luminosité ({brightness}%)
              </Label>
              <Slider
                value={[brightness]}
                onValueChange={(value) => {
                  onBrightnessChange(value[0]);
                }}
                min={0}
                max={200}
                step={5}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">
                Contraste ({contrast}%)
              </Label>
              <Slider
                value={[contrast]}
                onValueChange={(value) => {
                  onContrastChange(value[0]);
                }}
                min={0}
                max={200}
                step={5}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">
                Saturation ({saturation}%)
              </Label>
              <Slider
                value={[saturation]}
                onValueChange={(value) => {
                  onSaturationChange(value[0]);
                }}
                min={0}
                max={200}
                step={5}
                className="mt-2"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetColorSettings}
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Audio Dropdown avec fond assorti */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-3 py-1.5 text-xs font-medium bg-white/70 hover:bg-white/90 border border-white/50 rounded-full shadow-sm transition-all duration-200"
          >
            <span className="mr-1.5">🎵</span>
            Audio
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-4" align="end">
          <DropdownMenuLabel>Musique de fond</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="space-y-4">
            {/* Upload custom audio */}
            <div>
              <Label className="text-sm font-medium">Importer une musique</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileSelect}
                  className="text-sm"
                />
              </div>
              {audioFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  📁 {audioFile.name}
                </p>
              )}
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Music library */}
            <div>
              <Label className="text-sm font-medium">Bibliothèque musicale</Label>
              <div className="mt-2 space-y-1">
                {musicLibrary.map((track) => (
                  <Button
                    key={track.url}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      // Simuler la sélection d'un fichier
                      fetch(track.url)
                        .then(res => res.blob())
                        .then(blob => {
                          const file = new File([blob], track.name, { type: 'audio/mpeg' });
                          setAudioFile(file);
                          onAudioFileSelect(file);
                        })
                        .catch(() => {
                          console.warn(`Fichier audio non trouvé: ${track.url}`);
                        });
                    }}
                  >
                    🎼 {track.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Volume control */}
            <div>
              <Label className="text-sm font-medium">
                Volume musique ({audioVolume}%)
              </Label>
              <Slider
                value={[audioVolume]}
                onValueChange={(value) => onAudioVolumeChange(value[0])}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}