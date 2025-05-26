'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { SubtitleStyle } from '@/types';

interface SubtitleEditorProps {
  style: SubtitleStyle;
  onStyleChange: (style: SubtitleStyle) => void;
  onExport: () => void;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({
  style,
  onStyleChange,
  onExport,
}) => {
  const updateStyle = (updates: Partial<SubtitleStyle>) => {
    onStyleChange({ ...style, ...updates });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personnalisation des sous-titres</CardTitle>
        <CardDescription>
          Ajustez l'apparence et les animations de vos sous-titres
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text">Texte</TabsTrigger>
            <TabsTrigger value="background">Fond</TabsTrigger>
            <TabsTrigger value="effects">Effets</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
          </TabsList>

          {/* Onglet Texte */}
          <TabsContent value="text" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fontSize">Taille de police</Label>
                <Slider
                  id="fontSize"
                  min={16}
                  max={72}
                  step={2}
                  value={[style.fontSize]}
                  onValueChange={(value) => updateStyle({ fontSize: value[0] })}
                />
                <span className="text-sm text-muted-foreground">{style.fontSize}px</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Police</Label>
                <Select value={style.fontFamily} onValueChange={(value) => updateStyle({ fontFamily: value })}>
                  <SelectTrigger id="fontFamily">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                    <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Couleur du texte</Label>
                <Input
                  id="color"
                  type="color"
                  value={style.color}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textTransform">Casse</Label>
                <Select value={style.textTransform} onValueChange={(value: any) => updateStyle({ textTransform: value })}>
                  <SelectTrigger id="textTransform">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Normal</SelectItem>
                    <SelectItem value="uppercase">MAJUSCULES</SelectItem>
                    <SelectItem value="lowercase">minuscules</SelectItem>
                    <SelectItem value="capitalize">Première Lettre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="bold"
                  checked={style.fontWeight === 'bold'}
                  onCheckedChange={(checked) => updateStyle({ fontWeight: checked ? 'bold' : 'normal' })}
                />
                <Label htmlFor="bold">Gras</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="italic"
                  checked={style.fontStyle === 'italic'}
                  onCheckedChange={(checked) => updateStyle({ fontStyle: checked ? 'italic' : 'normal' })}
                />
                <Label htmlFor="italic">Italique</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="underline"
                  checked={style.textDecoration === 'underline'}
                  onCheckedChange={(checked) => updateStyle({ textDecoration: checked ? 'underline' : 'none' })}
                />
                <Label htmlFor="underline">Souligné</Label>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Fond */}
          <TabsContent value="background" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Couleur de fond</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={style.backgroundColor}
                  onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundOpacity">Opacité</Label>
                <Slider
                  id="backgroundOpacity"
                  min={0}
                  max={1}
                  step={0.1}
                  value={[style.backgroundOpacity]}
                  onValueChange={(value) => updateStyle({ backgroundOpacity: value[0] })}
                />
                <span className="text-sm text-muted-foreground">{Math.round(style.backgroundOpacity * 100)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="padding">Espacement</Label>
                <Slider
                  id="padding"
                  min={0}
                  max={32}
                  step={2}
                  value={[style.padding]}
                  onValueChange={(value) => updateStyle({ padding: value[0] })}
                />
                <span className="text-sm text-muted-foreground">{style.padding}px</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="borderRadius">Arrondi</Label>
                <Slider
                  id="borderRadius"
                  min={0}
                  max={24}
                  step={2}
                  value={[style.borderRadius]}
                  onValueChange={(value) => updateStyle({ borderRadius: value[0] })}
                />
                <span className="text-sm text-muted-foreground">{style.borderRadius}px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={style.position} onValueChange={(value: any) => updateStyle({ position: value })}>
                <SelectTrigger id="position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom">Bas</SelectItem>
                  <SelectItem value="middle">Centre</SelectItem>
                  <SelectItem value="top">Haut</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offsetY">Décalage vertical</Label>
              <Slider
                id="offsetY"
                min={-100}
                max={100}
                step={5}
                value={[style.offsetY]}
                onValueChange={(value) => updateStyle({ offsetY: value[0] })}
              />
              <span className="text-sm text-muted-foreground">{style.offsetY}px</span>
            </div>
          </TabsContent>

          {/* Onglet Effets */}
          <TabsContent value="effects" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="shadow"
                  checked={style.shadowEnabled}
                  onCheckedChange={(checked) => updateStyle({ shadowEnabled: checked })}
                />
                <Label htmlFor="shadow">Ombre portée</Label>
              </div>

              {style.shadowEnabled && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="shadowColor">Couleur de l'ombre</Label>
                    <Input
                      id="shadowColor"
                      type="color"
                      value={style.shadowColor}
                      onChange={(e) => updateStyle({ shadowColor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shadowBlur">Flou de l'ombre</Label>
                    <Slider
                      id="shadowBlur"
                      min={0}
                      max={20}
                      step={1}
                      value={[style.shadowBlur]}
                      onValueChange={(value) => updateStyle({ shadowBlur: value[0] })}
                    />
                    <span className="text-sm text-muted-foreground">{style.shadowBlur}px</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="neon"
                  checked={style.neonEnabled}
                  onCheckedChange={(checked) => updateStyle({ neonEnabled: checked })}
                />
                <Label htmlFor="neon">Effet néon</Label>
              </div>

              {style.neonEnabled && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="neonColor">Couleur néon</Label>
                    <Input
                      id="neonColor"
                      type="color"
                      value={style.neonColor}
                      onChange={(e) => updateStyle({ neonColor: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="neonIntensity">Intensité</Label>
                    <Slider
                      id="neonIntensity"
                      min={1}
                      max={10}
                      step={1}
                      value={[style.neonIntensity]}
                      onValueChange={(value) => updateStyle({ neonIntensity: value[0] })}
                    />
                    <span className="text-sm text-muted-foreground">{style.neonIntensity}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="autoEmojis"
                  checked={style.autoEmojis}
                  onCheckedChange={(checked) => updateStyle({ autoEmojis: checked })}
                />
                <Label htmlFor="autoEmojis">Emojis automatiques</Label>
              </div>
            </div>
          </TabsContent>

          {/* Onglet Animations */}
          <TabsContent value="animations" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="animationIn">Animation d'entrée</Label>
                <Select value={style.animationIn} onValueChange={(value: any) => updateStyle({ animationIn: value })}>
                  <SelectTrigger id="animationIn">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="fade">Fondu</SelectItem>
                    <SelectItem value="slide-up">Glisser vers le haut</SelectItem>
                    <SelectItem value="slide-down">Glisser vers le bas</SelectItem>
                    <SelectItem value="scale">Zoom</SelectItem>
                    <SelectItem value="typewriter">Machine à écrire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="animationOut">Animation de sortie</Label>
                <Select value={style.animationOut} onValueChange={(value: any) => updateStyle({ animationOut: value })}>
                  <SelectTrigger id="animationOut">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="fade">Fondu</SelectItem>
                    <SelectItem value="slide-up">Glisser vers le haut</SelectItem>
                    <SelectItem value="slide-down">Glisser vers le bas</SelectItem>
                    <SelectItem value="scale">Zoom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animationDuration">Durée des animations</Label>
              <Slider
                id="animationDuration"
                min={0.1}
                max={2}
                step={0.1}
                value={[style.animationDuration]}
                onValueChange={(value) => updateStyle({ animationDuration: value[0] })}
              />
              <span className="text-sm text-muted-foreground">{style.animationDuration}s</span>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button onClick={onExport} className="w-full">
            Exporter la vidéo avec sous-titres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
