// src/components/v2/customization-panel.tsx - VERSION COMPLÈTE avec contrôles X/Y
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { Button } from '@/components/ui/button';
import { RotateCcw, Move } from 'lucide-react';
import type { SubtitleStyle } from '@/types';

interface CustomizationPanelProps {
  style: SubtitleStyle & { displayWords?: number; strokePixels?: number; offsetX?: number };
  onStyleChange: (style: SubtitleStyle & { displayWords?: number; strokePixels?: number; offsetX?: number }) => void;
}

export function CustomizationPanel({ style, onStyleChange }: CustomizationPanelProps) {
  const updateStyle = (updates: Partial<SubtitleStyle & { displayWords?: number; strokePixels?: number; offsetX?: number }>) => {
    onStyleChange({ ...style, ...updates });
  };

  // 🎯 Reset position
  const resetPosition = () => {
    updateStyle({ 
      offsetX: 50, 
      offsetY: 50, 
      position: 'middle' 
    });
  };

  // 🚀 Conversion des pixels en strokeWeight pour compatibilité
  const strokePixels = style.strokePixels || 0;
  const getStrokeWeightFromPixels = (pixels: number): SubtitleStyle['strokeWeight'] => {
    if (pixels === 0) return 'none';
    if (pixels <= 2) return 'small';
    if (pixels <= 4) return 'medium';
    return 'large';
  };

  // 🚀 Animation Speed: conversion correcte pourcentage ↔ durée
  const getAnimationSpeedPercent = (duration: number): number => {
    const minDuration = 0.05; // 100% speed
    const maxDuration = 0.3;  // 0% speed
    const clamped = Math.max(minDuration, Math.min(maxDuration, duration));
    return Math.round(((maxDuration - clamped) / (maxDuration - minDuration)) * 100);
  };

  const getDurationFromPercent = (percent: number): number => {
    const minDuration = 0.05; // 100% speed
    const maxDuration = 0.3;  // 0% speed
    return maxDuration - (percent / 100) * (maxDuration - minDuration);
  };

  return (
    <Card className="h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 space-y-6">
        
        {/* 🚀 SECTION POSITION - NOUVEAU */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Move className="h-4 w-4" />
            📍 Position
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full text-xs font-bold">
              X/Y Control
            </span>
          </h3>
          
          <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            {/* Position X (Horizontal) - NOUVEAU */}
            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                🔄 Position X - Horizontal ({(style.offsetX || 50).toFixed(0)}%)
              </Label>
              <Slider
                value={[style.offsetX || 50]}
                onValueChange={([v]) => updateStyle({ offsetX: v })}
                min={5}
                max={95}
                step={1}
                className="mt-1"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Gauche</span>
                <span>Centre</span>
                <span>Droite</span>
              </div>
            </div>

            {/* Position Y (Vertical) */}
            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                ↕️ Position Y - Vertical ({style.offsetY}%)
              </Label>
              <Slider
                value={[style.offsetY]}
                onValueChange={([v]) => updateStyle({ offsetY: v })}
                min={5}
                max={95}
                step={1}
                className="mt-1"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Haut</span>
                <span>Centre</span>
                <span>Bas</span>
              </div>
            </div>

            {/* Zone de référence */}
            <div>
              <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Zone de référence</Label>
              <Select
                value={style.position}
                onValueChange={(v) => updateStyle({ position: v as any })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Zone haute</SelectItem>
                  <SelectItem value="middle">Zone centrale</SelectItem>
                  <SelectItem value="bottom">Zone basse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bouton de reset */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetPosition}
              className="w-full text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Centrer (50%, 50%)
            </Button>
          </div>
        </div>

        {/* Section Text */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            📝 Text
            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full text-xs font-bold">
              60fps
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-4">
            
            {/* Row 1: Font Family + Font Color */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Font Family</Label>
                <Select value={style.fontFamily} onValueChange={(v) => updateStyle({ fontFamily: v })}>
                  <SelectTrigger className="h-8 text-xs">
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
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Font Color</Label>
                <ColorPicker 
                  value={style.color} 
                  onChange={(color) => updateStyle({ color })} 
                />
              </div>
            </div>

            {/* Row 2: Font Weight + Stroke Pixels */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Font Weight</Label>
                <Select
                  value={style.fontWeight}
                  onValueChange={(v) => updateStyle({ fontWeight: v as any })}
                >
                  <SelectTrigger className="h-8 text-xs">
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

              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  🎯 Stroke Width ({strokePixels}px)
                </Label>
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
                  className="mt-1"
                />
              </div>
            </div>

            {/* Row 3: Size + Display Words */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Size ({style.fontSize}px)
                </Label>
                <Slider
                  value={[style.fontSize]}
                  onValueChange={([v]) => updateStyle({ fontSize: v })}
                  min={16}
                  max={72}
                  step={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Display Words ({style.displayWords || 3})
                </Label>
                <Slider
                  value={[style.displayWords || 3]}
                  onValueChange={([v]) => updateStyle({ displayWords: v })}
                  min={1}
                  max={7}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Row 4: Uppercase + Stroke Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Uppercase</Label>
                <Switch
                  checked={style.textTransform === 'uppercase'}
                  onCheckedChange={(checked) => updateStyle({ textTransform: checked ? 'uppercase' : 'none' })}
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">Stroke Color</Label>
                <ColorPicker 
                  value={style.strokeColor || '#000000'} 
                  onChange={(color) => updateStyle({ strokeColor: color })} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Style */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Style</h3>
          <div className="grid grid-cols-2 gap-6">
            
            {/* Colonne 1 */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Background Color</Label>
                <div className="mt-1">
                  <ColorPicker
                    value={style.backgroundColor}
                    onChange={(color) => updateStyle({ backgroundColor: color })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Background Opacity ({Math.round(style.backgroundOpacity * 100)}%)
                </Label>
                <Slider
                  value={[style.backgroundOpacity * 100]}
                  onValueChange={([v]) => updateStyle({ backgroundOpacity: v / 100 })}
                  min={0}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Padding ({style.padding}px)
                </Label>
                <Slider
                  value={[style.padding]}
                  onValueChange={([v]) => updateStyle({ padding: v })}
                  min={0}
                  max={32}
                  step={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Border Radius ({style.borderRadius}px)
                </Label>
                <Slider
                  value={[style.borderRadius]}
                  onValueChange={([v]) => updateStyle({ borderRadius: v })}
                  min={0}
                  max={24}
                  step={2}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Colonne 2 */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shadow</Label>
                <Select
                  value={style.shadow}
                  onValueChange={(v) => updateStyle({ shadow: v as any })}
                >
                  <SelectTrigger className="mt-1">
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

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Line Height ({style.lineHeight})
                </Label>
                <Slider
                  value={[style.lineHeight]}
                  onValueChange={([v]) => updateStyle({ lineHeight: v })}
                  min={1}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 Section Animation & Effects - ÉTENDUE */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Animation & Effects
            <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full text-xs font-bold">
              8 modes
            </span>
          </h3>
          <div className="space-y-4">
            
            {/* Animation Mode */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                🎭 Animation Mode
              </Label>
              <Select
                value={style.wordHighlight}
                onValueChange={(v) => updateStyle({ wordHighlight: v as any })}
              >
                <SelectTrigger>
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

            {/* Animation Color */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                🎨 Animation Color
              </Label>
              <ColorPicker 
                value={style.wordBackgroundColor || '#FF6B35'} 
                onChange={(color) => updateStyle({ wordBackgroundColor: color })} 
              />
            </div>

            {/* Animation Speed */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                ⚡ Animation Speed ({getAnimationSpeedPercent(style.animationDuration || 0.15)}%)
              </Label>
              <Slider
                value={[getAnimationSpeedPercent(style.animationDuration || 0.15)]}
                onValueChange={([v]) => updateStyle({ animationDuration: getDurationFromPercent(v) })}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            {/* Word Spacing */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                📏 Word Spacing ({Math.round((style.wordSpacing || 0.12) * 100)}%)
              </Label>
              <Slider
                value={[(style.wordSpacing || 0.12) * 100]}
                onValueChange={([v]) => updateStyle({ wordSpacing: v / 100 })}
                min={5}
                max={30}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Options d'animation */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Word Animation</Label>
                  <Switch
                    checked={style.animation}
                    onCheckedChange={(checked) => updateStyle({ animation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Punctuation</Label>
                  <Switch
                    checked={style.punctuation || false}
                    onCheckedChange={(checked) => updateStyle({ punctuation: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Movement</Label>
                  <Switch
                    checked={style.textMovement || false}
                    onCheckedChange={(checked) => updateStyle({ textMovement: checked })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Emojis</Label>
                  <Switch
                    checked={style.autoEmojis}
                    onCheckedChange={(checked) => updateStyle({ autoEmojis: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Emoji Animation</Label>
                  <Switch
                    checked={style.emojiAnimation || false}
                    onCheckedChange={(checked) => updateStyle({ emojiAnimation: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Preview des modes d'animation */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 block">
                🎬 Preview Mode: {style.wordHighlight} | Speed: {getAnimationSpeedPercent(style.animationDuration || 0.15)}%
              </Label>
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
              
              {/* Indicateur de position */}
              <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                Position: {(style.offsetX || 50).toFixed(0)}% X, {style.offsetY}% Y
              </div>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
}