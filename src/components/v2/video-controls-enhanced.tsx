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
import { Palette, Music, Upload } from 'lucide-react';
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

  return (
    <div className="flex gap-2">
      {/* Colors Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4 mr-1" />
            Colors
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 p-4">
          <DropdownMenuLabel>Ajustements vidéo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Luminosité ({brightness}%)</Label>
              <Slider
                value={[brightness]}
                onValueChange={(value) => onBrightnessChange(value[0])}
                min={0}
                max={200}
                step={10}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm">Contraste ({contrast}%)</Label>
              <Slider
                value={[contrast]}
                onValueChange={(value) => onContrastChange(value[0])}
                min={0}
                max={200}
                step={10}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-sm">Saturation ({saturation}%)</Label>
              <Slider
                value={[saturation]}
                onValueChange={(value) => onSaturationChange(value[0])}
                min={0}
                max={200}
                step={10}
                className="mt-2"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onBrightnessChange(100);
                onContrastChange(100);
                onSaturationChange(100);
              }}
              className="w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Audio Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Music className="h-4 w-4 mr-1" />
            Audio
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 p-4">
          <DropdownMenuLabel>Musique de fond</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="space-y-4">
            {/* Upload custom audio */}
            <div>
              <Label className="text-sm">Importer une musique</Label>
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
                  {audioFile.name}
                </p>
              )}
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Music library */}
            <div>
              <Label className="text-sm">Bibliothèque musicale</Label>
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
                        });
                    }}
                  >
                    {track.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Volume control */}
            <div>
              <Label className="text-sm">Volume musique ({audioVolume}%)</Label>
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