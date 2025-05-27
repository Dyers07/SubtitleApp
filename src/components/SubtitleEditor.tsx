'use client';

import React, { useState } from 'react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';

import {
  TextCursorInput,
  ArrowUpAZ,
  ArrowDownAZ,
  Sparkles,
  Bold,
  Italic,
  Underline,
} from 'lucide-react';

import { Subtitle, SubtitleStyle } from '@/types';
import { splitSubtitles } from '@/utils/splitSubtitles';

/* ───────── props ───────── */
interface SubtitleEditorProps {
  style: SubtitleStyle;
  onStyleChange: (style: SubtitleStyle) => void;
  onExport: () => void;

  /** liste brute non découpée */
  rawSubtitles: Subtitle[];

  /** liste actuellement affichée */
  subtitles: Subtitle[];

  /** callback pour mettre à jour la liste découpée */
  onSubtitlesChange: (subs: Subtitle[]) => void;
}

/* ───────── component ───────── */
export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({
  style,
  onStyleChange,
  onExport,
  rawSubtitles,
  subtitles,
  onSubtitlesChange,
}) => {
  const [maxWords, setMaxWords] = useState(3);

  const updateStyle = (u: Partial<SubtitleStyle>) =>
    onStyleChange({ ...style, ...u });

  /* découpe dynamique */
  const handleMaxWords = (v: number) => {
    setMaxWords(v);
    onSubtitlesChange(splitSubtitles(rawSubtitles, v));
  };

  /* ---------- render ---------- */
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Personnalisation des sous-titres</CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="text">Texte</TabsTrigger>
            <TabsTrigger value="background">Fond</TabsTrigger>
            <TabsTrigger value="effects">Effets</TabsTrigger>
            <TabsTrigger value="animations">Animations</TabsTrigger>
          </TabsList>

          {/* ─────────── ONGLET TEXTE ─────────── */}
          <TabsContent value="text" className="space-y-4">

            {/* Taille / Police */}
            <div className="grid grid-cols-2 gap-4">
              {/* taille */}
              <div className="space-y-2">
                <Label htmlFor="fontSize">Taille de police</Label>
                <Slider
                  id="fontSize"
                  min={16}
                  max={72}
                  step={2}
                  value={[style.fontSize]}
                  onValueChange={([v]) => updateStyle({ fontSize: v })}
                />
                <span className="text-sm text-muted-foreground">
                  {style.fontSize}px
                </span>
              </div>

              {/* police */}
              <div className="space-y-2 w-full justify-self-end text-right">
                <Label htmlFor="fontFamily">Police</Label>
                <Select
                  value={style.fontFamily}
                  onValueChange={(v) => updateStyle({ fontFamily: v })}
                >
                  <SelectTrigger id="fontFamily">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Arial',
                      'Inter',
                      'Poppins',
                      'Montserrat',
                      'Helvetica',
                      'Times New Roman',
                      'Georgia',
                      'Verdana',
                      'Comic Sans MS',
                    ].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Couleur / nb mots */}
            <div className="grid grid-cols-2 gap-4">
              {/* couleur */}
              <div className="space-y-2">
                <Label htmlFor="color">Couleur du texte</Label>
                <Input
                  id="color"
                  type="color"
                  value={style.color}
                  onChange={(e) => updateStyle({ color: e.target.value })}
                />
              </div>

              {/* slider mots */}
              <div className="space-y-2 w-full justify-self-end text-right">
                <Label htmlFor="maxWords">Mots / sous-titre</Label>
                <Slider
                  id="maxWords"
                  min={1}
                  max={6}
                  step={1}
                  value={[maxWords]}
                  onValueChange={([v]) => handleMaxWords(v)}
                />
                <span className="text-sm text-muted-foreground">
                  {maxWords} mot{maxWords > 1 && 's'} max
                </span>
              </div>
            </div>

            {/* Style / Casse */}
            <div className="flex flex-wrap gap-4">
              {/* bold / italic / underline */}
              <ToggleGroup
                type="multiple"
                value={[
                  style.fontWeight === 'bold' ? 'bold' : '',
                  style.fontStyle === 'italic' ? 'italic' : '',
                  style.textDecoration === 'underline' ? 'underline' : '',
                ].filter(Boolean)}
                onValueChange={(vals: string[]) =>
                  updateStyle({
                    fontWeight: vals.includes('bold') ? 'bold' : 'normal',
                    fontStyle: vals.includes('italic') ? 'italic' : 'normal',
                    textDecoration: vals.includes('underline')
                      ? 'underline'
                      : 'none',
                  })
                }
                className="flex gap-2"
              >
                <ToggleGroupItem value="bold" aria-label="Gras">
                  <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Italique">
                  <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Souligné">
                  <Underline className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>

              {/* casse */}
              <ToggleGroup
                type="single"
                value={style.textTransform}
                onValueChange={(v) =>
                  v && updateStyle({ textTransform: v as any })
                }
                className="flex gap-2 justify-end flex-1"
              >
                <ToggleGroupItem value="none" aria-label="Normal">
                  <TextCursorInput className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="uppercase" aria-label="MAJUSCULES">
                  <ArrowUpAZ className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="lowercase" aria-label="minuscules">
                  <ArrowDownAZ className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="capitalize" aria-label="Première Lettre">
                  <Sparkles className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </TabsContent>

          {/* ─────────── ONGLET FOND / EFFECTS / ANIMS … (inchangé) ─────────── */}
        </Tabs>

        <div className="mt-6">
          <Button onClick={onExport} className="w-full cursor-pointer">
            Exporter la vidéo avec sous-titres
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
