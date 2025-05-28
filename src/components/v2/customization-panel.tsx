// src/components/v2/customization-panel.tsx
'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ColorPicker } from '@/components/ui/color-picker';
import type { SubtitleStyle } from '@/types';

interface CustomizationPanelProps {
  style: SubtitleStyle;
  onStyleChange: (style: SubtitleStyle) => void;
}

export function CustomizationPanel({ style, onStyleChange }: CustomizationPanelProps) {
  const updateStyle = (updates: Partial<SubtitleStyle>) => {
    onStyleChange({ ...style, ...updates });
  };

  return (
    <Card className="h-full overflow-y-auto">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Texte</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
        </TabsList>

        {/* ——— Onglet Texte ——— */}
        <TabsContent value="text" className="space-y-4 p-4">
          <div>
            <Label>Police</Label>
            <Select value={style.fontFamily} onValueChange={(v) => updateStyle({ fontFamily: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Inter','Roboto','Open Sans','Montserrat','Poppins','Arial'].map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Taille ({style.fontSize}px)</Label>
            <Slider
              value={[style.fontSize]}
              onValueChange={([v]) => updateStyle({ fontSize: v })}
              min={16} max={72} step={1}
            />
          </div>

          <div>
            <Label>Épaisseur</Label>
            <Select
              value={style.fontWeight}
              onValueChange={(v) => updateStyle({ fontWeight: v as any })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semi-Bold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
                <SelectItem value="800">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Couleur du texte</Label>
            <ColorPicker value={style.color} onChange={(c) => updateStyle({ color: c })} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Majuscules</Label>
            <Switch
              checked={style.textTransform === 'uppercase'}
              onCheckedChange={(chk) => updateStyle({ textTransform: chk ? 'uppercase' : 'none' })}
            />
          </div>
        </TabsContent>

        {/* ——— Onglet Style ——— */}
        <TabsContent value="style" className="space-y-4 p-4">
          <div>
            <Label>Couleur de fond</Label>
            <ColorPicker
              value={style.backgroundColor}
              onChange={(c) => updateStyle({ backgroundColor: c })}
            />
          </div>

          <div>
            <Label>Opacité du fond ({Math.round(style.backgroundOpacity * 100)}%)</Label>
            <Slider
              value={[style.backgroundOpacity * 100]}
              onValueChange={([v]) => updateStyle({ backgroundOpacity: v/100 })}
              min={0} max={100} step={5}
            />
          </div>

          <div>
            <Label>Padding ({style.padding}px)</Label>
            <Slider
              value={[style.padding]}
              onValueChange={([v]) => updateStyle({ padding: v })}
              min={0} max={32} step={2}
            />
          </div>

          <div>
            <Label>Arrondi ({style.borderRadius}px)</Label>
            <Slider
              value={[style.borderRadius]}
              onValueChange={([v]) => updateStyle({ borderRadius: v })}
              min={0} max={24} step={2}
            />
          </div>

          <div>
            <Label>Position</Label>
            <Select
              value={style.position}
              onValueChange={(v) => updateStyle({ position: v as any })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Haut</SelectItem>
                <SelectItem value="middle">Centre</SelectItem>
                <SelectItem value="bottom">Bas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Position Y ({style.offsetY}px)</Label>
            <Slider
              value={[style.offsetY]}
              onValueChange={([v]) => updateStyle({ offsetY: v })}
              min={-200} max={200} step={10}
            />
          </div>

          <div>
            <Label>Ombre</Label>
            <Select
              value={style.shadow}
              onValueChange={(v) => updateStyle({ shadow: v as any })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                <SelectItem value="small">Petite</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* ——— Onglet Animation ——— */}
        <TabsContent value="animation" className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <Label>Word-by-word</Label>
            <Switch
              checked={style.animation}
              onCheckedChange={(chk) => updateStyle({ animation: chk })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Emojis auto</Label>
            <Switch
              checked={style.autoEmojis}
              onCheckedChange={(chk) => updateStyle({ autoEmojis: chk })}
            />
          </div>

          <div>
            <Label>Interligne ({style.lineHeight})</Label>
            <Slider
              value={[style.lineHeight]}
              onValueChange={([v]) => updateStyle({ lineHeight: v })}
              min={1} max={2} step={0.1}
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
);
}
