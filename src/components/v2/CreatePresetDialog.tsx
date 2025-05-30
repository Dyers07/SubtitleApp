// src/components/v2/CreatePresetDialog.tsx - Avec Supabase
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SubtitleStyle } from '@/types';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface CreatePresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStyle: SubtitleStyle & { displayWords?: number };
  onPresetCreated: (preset: any) => void;
}

export function CreatePresetDialog({
  open,
  onOpenChange,
  currentStyle,
  onPresetCreated,
}: CreatePresetDialogProps) {
  const { user, session } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user || !session) {
      toast.error('Vous devez être connecté');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Le nom du preset est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les données de style
      const {
        displayWords,
        ...styleProperties
      } = currentStyle;

      const presetData = {
        name: name.trim(),
        description: description.trim() || null,
        isPublic,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        displayWords: displayWords || 3,
        ...styleProperties,
      };

      // Créer le preset via Supabase
      const { data: newPreset, error } = await supabase
        .from('presets')
        .insert({
          name: presetData.name,
          description: presetData.description,
          user_id: user.id,
          user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Utilisateur',
          is_public: presetData.isPublic,
          tags: presetData.tags,
          style_data: {
            fontFamily: presetData.fontFamily,
            fontWeight: presetData.fontWeight,
            fontSize: presetData.fontSize,
            color: presetData.color,
            backgroundColor: presetData.backgroundColor,
            backgroundOpacity: presetData.backgroundOpacity,
            strokeWeight: presetData.strokeWeight,
            strokePixels: presetData.strokePixels || 0,
            strokeColor: presetData.strokeColor,
            shadow: presetData.shadow,
            textTransform: presetData.textTransform,
            wordHighlight: presetData.wordHighlight,
            wordBackgroundColor: presetData.wordBackgroundColor,
            animationDuration: presetData.animationDuration,
            displayWords: presetData.displayWords,
            position: presetData.position,
            offsetY: presetData.offsetY,
            padding: presetData.padding,
            borderRadius: presetData.borderRadius,
            lineHeight: presetData.lineHeight,
            wordSpacing: presetData.wordSpacing,
            animation: presetData.animation,
            autoEmojis: presetData.autoEmojis,
            emojiAnimation: presetData.emojiAnimation,
            punctuation: presetData.punctuation,
            textMovement: presetData.textMovement,
          }
        })
        .select(`
          *,
          profiles!inner(name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Erreur création preset:', error);
        throw new Error(error.message || 'Erreur lors de la création du preset');
      }

      // Transformer pour le frontend
      const transformedPreset = {
        id: newPreset.id,
        name: newPreset.name,
        description: newPreset.description,
        userName: newPreset.user_name,
        authorName: newPreset.profiles?.name,
        authorAvatar: newPreset.profiles?.avatar_url,
        votes: newPreset.votes,
        downvotes: newPreset.downvotes,
        usageCount: newPreset.usage_count,
        tags: newPreset.tags,
        createdAt: newPreset.created_at,
        isPublic: newPreset.is_public,
        ...newPreset.style_data,
      };

      // Succès !
      toast.success(`🎨 Preset "${name}" créé avec succès !`, {
        description: isPublic ? 'Visible par la communauté' : 'Privé uniquement',
        duration: 5000,
      });

      onPresetCreated(transformedPreset);
      onOpenChange(false);
      
      // Reset form
      setName('');
      setDescription('');
      setTags('');
      setIsPublic(false);

    } catch (error: any) {
      console.error('Erreur création preset:', error);
      toast.error(`❌ ${error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Créer un preset
          </DialogTitle>
          <DialogDescription>
            Sauvegardez votre style actuel comme nouveau preset
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name">Nom du preset *</Label>
            <Input
              id="preset-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mon style génial"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-description">Description</Label>
            <Textarea
              id="preset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Parfait pour les vidéos lifestyle, avec animations dynamiques..."
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-tags">Tags (séparés par des virgules)</Label>
            <Input
              id="preset-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="lifestyle, dynamique, coloré"
              maxLength={100}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Preset public</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Partager avec la communauté et permettre les votes
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Aperçu des propriétés actuelles */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Label className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 block">
              Aperçu du style
            </Label>
            <div className="grid grid-cols-2 gap-2 text-xs text-blue-800 dark:text-blue-200">
              <span>Police: {currentStyle.fontFamily}</span>
              <span>Taille: {currentStyle.fontSize}px</span>
              <span>Animation: {currentStyle.wordHighlight}</span>
              <span>Mots: {currentStyle.displayWords || 3}</span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Créer le preset
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}