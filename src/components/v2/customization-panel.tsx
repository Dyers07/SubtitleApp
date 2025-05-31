// src/components/v2/customization-panel.tsx - Version redesignée inspirée de Figma
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move, Type, Palette, Play } from 'lucide-react';
import type { SubtitleStyle } from '@/types';

interface CustomizationPanelProps {
  style: SubtitleStyle & { displayWords?: number; strokePixels?: number; offsetX?: number };
  onStyleChange: (style: SubtitleStyle & { displayWords?: number; strokePixels?: number; offsetX?: number }) => void;
}

export function CustomizationPanel({ style, onStyleChange }: CustomizationPanelProps) {
  const updateStyle = (updates: Partial<SubtitleStyle & { displayWords?: number; strokePixels?: number; offsetX?: number }>) => {
    onStyleChange({ ...style, ...updates });
  };

  const resetPosition = () => {
    updateStyle({ offsetX: 50, offsetY: 50, position: 'middle' });
  };

  const strokePixels = style.strokePixels || 0;
  
  const getStrokeWeightFromPixels = (pixels: number): SubtitleStyle['strokeWeight'] => {
    if (pixels === 0) return 'none';
    if (pixels <= 2) return 'small';
    if (pixels <= 4) return 'medium';
    return 'large';
  };

  const getAnimationSpeedPercent = (duration: number): number => {
    const minDuration = 0.05;
    const maxDuration = 0.3;
    const clamped = Math.max(minDuration, Math.min(maxDuration, duration));
    return Math.round(((maxDuration - clamped) / (maxDuration - minDuration)) * 100);
  };

  const getDurationFromPercent = (percent: number): number => {
    const minDuration = 0.05;
    const maxDuration = 0.3;
    return maxDuration - (percent / 100) * (maxDuration - minDuration);
  };

  // Composant pour les sections
  const Section = ({ icon, title, badge, children }: { 
    icon: React.ReactNode; 
    title: string; 
    badge?: string; 
    children: React.ReactNode 
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-blue-500">{icon}</div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</span>
        {badge && (
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );

  // Composant pour les contrôles en ligne
  const ControlRow = ({ label, value, unit = '', children }: { 
    label: string; 
    value?: number; 
    unit?: string; 
    children: React.ReactNode 
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</Label>
        {value !== undefined && (
          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {value}{unit}
          </span>
        )}
      </div>
      {children}
    </div>
  );

  // Composant pour les contrôles inline (2 colonnes)
  const InlineControl = ({ children }: { children: React.ReactNode }) => (
    <div className="grid grid-cols-2 gap-3">{children}</div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        
        {/* 📍 POSITION */}
        <Section icon={<Move className="h-4 w-4" />} title="Position" badge="X/Y Control">
          <div className="space-y-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <ControlRow label="🔄 Position X - Horizontal" value={Math.round(style.offsetX || 50)} unit="%">
              <Slider
                value={[style.offsetX || 50]}
                onValueChange={([v]) => updateStyle({ offsetX: v })}
                min={5}
                max={95}
                step={1}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Gauche</span>
                <span>Centre</span>
                <span>Droite</span>
              </div>
            </ControlRow>

            <ControlRow label="↕️ Position Y - Vertical" value={style.offsetY} unit="%">
              <Slider
                value={[style.offsetY]}
                onValueChange={([v]) => updateStyle({ offsetY: v })}
                min={5}
                max={95}
                step={1}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Haut</span>
                <span>Centre</span>
                <span>Bas</span>
              </div>
            </ControlRow>

            <InlineControl>
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Zone de référence</Label>
                <Select value={style.position} onValueChange={(v) => updateStyle({ position: v as any })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Zone haute</SelectItem>
                    <SelectItem value="middle">Zone centrale</SelectItem>
                    <SelectItem value="bottom">Zone basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" size="sm" onClick={resetPosition} className="w-full h-8 text-xs">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </InlineControl>
          </div>
        </Section>

        {/* 📝 TEXT */}
        <Section icon={<Type className="h-4 w-4" />} title="Text" badge="60fps">
          <div className="space-y-4">
            {/* Ligne 1: Font Family + Font Color */}
            <InlineControl>
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Font Family</Label>
                <Select value={style.fontFamily} onValueChange={(v) => updateStyle({ fontFamily: v })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Inter', 'Roboto', 'Open Sans', 'Montserrat', 'Poppins', 'Arial', 'Helvetica', 'Impact'].map(font => (
                      <SelectItem key={font} value={font}>{font}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Font Color</Label>
                <ColorPicker value={style.color} onChange={(color) => updateStyle({ color })} />
              </div>
            </InlineControl>

            {/* Ligne 2: Font Weight + Stroke */}
            <InlineControl>
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Font Weight</Label>
                <Select value={style.fontWeight} onValueChange={(v) => updateStyle({ fontWeight: v as any })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="500">Medium</SelectItem>
                    <SelectItem value="600">Semi-Bold</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="800">Extra-Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ControlRow label="🎯 Stroke Width" value={strokePixels} unit="px">
                <Slider
                  value={[strokePixels]}
                  onValueChange={([v]) => {
                    updateStyle({ 
                      strokePixels: v,
                      strokeWeight: getStrokeWeightFromPixels(v)
                    });
                  }}
                  min={0}
                  max={8}
                  step={1}
                  className="h-2"
                />
              </ControlRow>
            </InlineControl>

            {/* Ligne 3: Size + Display Words */}
            <InlineControl>
              <ControlRow label="Size" value={style.fontSize} unit="px">
                <Slider
                  value={[style.fontSize]}
                  onValueChange={([v]) => updateStyle({ fontSize: v })}
                  min={16}
                  max={72}
                  step={2}
                  className="h-2"
                />
              </ControlRow>
              <ControlRow label="Display Words" value={style.displayWords || 3}>
                <Slider
                  value={[style.displayWords || 3]}
                  onValueChange={([v]) => updateStyle({ displayWords: v })}
                  min={1}
                  max={7}
                  step={1}
                  className="h-2"
                />
              </ControlRow>
            </InlineControl>

            {/* Ligne 4: Uppercase + Stroke Color */}
            <InlineControl>
              <div className="flex items-center justify-between py-2">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Uppercase</Label>
                <Switch
                  checked={style.textTransform === 'uppercase'}
                  onCheckedChange={(checked) => updateStyle({ textTransform: checked ? 'uppercase' : 'none' })}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Stroke Color</Label>
                <ColorPicker value={style.strokeColor || '#000000'} onChange={(color) => updateStyle({ strokeColor: color })} />
              </div>
            </InlineControl>
          </div>
        </Section>

        {/* 🎨 STYLE */}
        <Section icon={<Palette className="h-4 w-4" />} title="Style">
          <div className="space-y-4">
            {/* Ligne 1: Background Color + Shadow */}
            <InlineControl>
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Background Color</Label>
                <ColorPicker value={style.backgroundColor} onChange={(color) => updateStyle({ backgroundColor: color })} />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">Shadow</Label>
                <Select value={style.shadow} onValueChange={(v) => updateStyle({ shadow: v as any })}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </InlineControl>

            {/* Ligne 2: Background Opacity + Line Height */}
            <InlineControl>
              <ControlRow label="Background Opacity" value={Math.round(style.backgroundOpacity * 100)} unit="%">
                <Slider
                  value={[style.backgroundOpacity * 100]}
                  onValueChange={([v]) => updateStyle({ backgroundOpacity: v / 100 })}
                  min={0}
                  max={100}
                  step={5}
                  className="h-2"
                />
              </ControlRow>
              <ControlRow label="Line Height" value={style.lineHeight}>
                <Slider
                  value={[style.lineHeight]}
                  onValueChange={([v]) => updateStyle({ lineHeight: v })}
                  min={1}
                  max={2}
                  step={0.1}
                  className="h-2"
                />
              </ControlRow>
            </InlineControl>

            {/* Ligne 3: Padding + Border Radius */}
            <InlineControl>
              <ControlRow label="Padding" value={style.padding} unit="px">
                <Slider
                  value={[style.padding]}
                  onValueChange={([v]) => updateStyle({ padding: v })}
                  min={0}
                  max={32}
                  step={2}
                  className="h-2"
                />
              </ControlRow>
              <ControlRow label="Border Radius" value={style.borderRadius} unit="px">
                <Slider
                  value={[style.borderRadius]}
                  onValueChange={([v]) => updateStyle({ borderRadius: v })}
                  min={0}
                  max={24}
                  step={2}
                  className="h-2"
                />
              </ControlRow>
            </InlineControl>
          </div>
        </Section>

        {/* 🎬 ANIMATION & EFFECTS */}
        <Section icon={<Play className="h-4 w-4" />} title="Animation & Effects" badge="8 modes">
          <div className="space-y-4">
            {/* Animation Mode */}
            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">🎭 Animation Mode</Label>
              <Select value={style.wordHighlight} onValueChange={(v) => updateStyle({ wordHighlight: v as any })}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">🔍 Zoom - Classic scale effect</SelectItem>
                  <SelectItem value="background">🎨 Background - Colored highlight</SelectItem>
                  <SelectItem value="glow">✨ Glow - Radiant effect</SelectItem>
                  <SelectItem value="pulse">💓 Pulse - Rhythmic beat</SelectItem>
                  <SelectItem value="rainbow">🌈 Rainbow - Color rotation</SelectItem>
                  <SelectItem value="bounce">🏀 Bounce - Elastic motion</SelectItem>
                  <SelectItem value="slide">📱 Slide - Smooth transition</SelectItem>
                  <SelectItem value="opacity">👻 Opacity - Fade effect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Animation Color + Speed */}
            <InlineControl>
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">🎨 Animation Color</Label>
                <ColorPicker value={style.wordBackgroundColor || '#FF6B35'} onChange={(color) => updateStyle({ wordBackgroundColor: color })} />
              </div>
              <ControlRow label="⚡ Animation Speed" value={getAnimationSpeedPercent(style.animationDuration || 0.15)} unit="%">
                <Slider
                  value={[getAnimationSpeedPercent(style.animationDuration || 0.15)]}
                  onValueChange={([v]) => updateStyle({ animationDuration: getDurationFromPercent(v) })}
                  min={0}
                  max={100}
                  step={5}
                  className="h-2"
                />
              </ControlRow>
            </InlineControl>

            {/* Word Spacing */}
            <ControlRow label="📏 Word Spacing" value={Math.round((style.wordSpacing || 0.12) * 100)} unit="%">
              <Slider
                value={[(style.wordSpacing || 0.12) * 100]}
                onValueChange={([v]) => updateStyle({ wordSpacing: v / 100 })}
                min={5}
                max={30}
                step={1}
                className="h-2"
              />
            </ControlRow>

            {/* Options d'animation en grid compact */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                { key: 'animation', label: 'Word Animation', checked: style.animation },
                { key: 'punctuation', label: 'Show Punctuation', checked: style.punctuation || false },
                { key: 'textMovement', label: 'Text Movement', checked: style.textMovement || false },
                { key: 'autoEmojis', label: 'Auto Emojis', checked: style.autoEmojis },
                { key: 'emojiAnimation', label: 'Emoji Animation', checked: style.emojiAnimation || false },
              ].map(({ key, label, checked }, index) => (
                <div key={key} className={`flex items-center justify-between py-1 ${index >= 4 ? 'col-span-1' : ''}`}>
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</Label>
                  <Switch
                    checked={checked}
                    onCheckedChange={(checked) => updateStyle({ [key]: checked })}
                  />
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  🎬 Preview Mode: {style.wordHighlight}
                </Label>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {getAnimationSpeedPercent(style.animationDuration || 0.15)}% speed
                </span>
              </div>
              <div className="flex items-center justify-center h-12 bg-black rounded text-white text-sm font-bold">
                <span 
                  className="px-2 py-1 rounded transition-all duration-200"
                  style={{
                    ...(style.wordHighlight === 'background' && {
                      backgroundColor: style.wordBackgroundColor || '#FF6B35',
                      color: '#FFFFFF'
                    }),
                    ...(style.wordHighlight === 'glow' && {
                      textShadow: `0 0 10px ${style.wordBackgroundColor || '#FF6B35'}`
                    }),
                    ...(style.wordHighlight === 'rainbow' && {
                      background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    }),
                    ...(strokePixels > 0 && {
                      WebkitTextStroke: `${strokePixels}px ${style.strokeColor || '#000000'}`,
                      paintOrder: 'stroke fill'
                    })
                  }}
                >
                  Sample Text 60fps
                </span>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Position: {Math.round(style.offsetX || 50)}% X, {style.offsetY}% Y
                </span>
              </div>
            </div>
          </div>
        </Section>

      </div>
    </div>
  );
}