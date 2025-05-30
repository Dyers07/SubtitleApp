// src/components/v2/style-presets.tsx - VERSION AMÉLIORÉE COMPLÈTE
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Plus, Heart, TrendingUp, User, Search, Filter } from "lucide-react"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreatePresetDialog } from './CreatePresetDialog';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface StylePresetProps {
  onSelectPreset: (preset: any) => void;
  currentStyle: any; // Pour le bouton "Create Preset"
}

interface Preset {
  id: string;
  name: string;
  isNew?: boolean;
  isPremium?: boolean;
  votes?: number;
  downvotes?: number;
  usageCount?: number;
  userName?: string;
  createdAt?: string;
  description?: string;
  tags?: string[];
  // Propriétés de style
  fontFamily: string;
  fontWeight: string;
  color: string;
  backgroundColor: string;
  strokeWeight: string;
  shadow: string;
  uppercase: boolean;
  wordHighlight: string;
  wordBackgroundColor?: string;
}

export function StylePresets({ onSelectPreset, currentStyle }: StylePresetProps) {
  const { user, profile } = useAuth();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'trending' | 'my' | 'new'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // 🎯 Presets par défaut (toujours disponibles)
  const defaultPresets: Preset[] = [
    {
      id: "sara",
      name: "Sara",
      isNew: true,
      isPremium: true,
      fontFamily: "Montserrat",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "None",
      shadow: "Medium",
      uppercase: false,
      wordHighlight: "zoom",
    },
    {
      id: "background-highlight",
      name: "Background Pop",
      isNew: true,
      isPremium: false,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "None",
      shadow: "Medium",
      uppercase: false,
      wordHighlight: "background",
      wordBackgroundColor: "#FF6B35",
    },
    {
      id: "daniel",
      name: "Daniel",
      isNew: true,
      isPremium: true,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Small",
      shadow: "Large",
      uppercase: false,
      wordHighlight: "zoom",
    },
    {
      id: "dan2",
      name: "DAN 2",
      isNew: true,
      isPremium: false,
      fontFamily: "Impact",
      fontWeight: "Heavy",
      color: "#FFFF00",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "None",
      uppercase: true,
      wordHighlight: "zoom",
    },
    {
      id: "glow-blue",
      name: "Blue Glow",
      isNew: true,
      isPremium: false,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "None",
      shadow: "None",
      uppercase: false,
      wordHighlight: "glow",
      wordBackgroundColor: "#00BFFF",
    },
    {
      id: "rainbow-trend",
      name: "Rainbow",
      isNew: true,
      isPremium: false,
      fontFamily: "Arial",
      fontWeight: "Bold",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
      wordHighlight: "rainbow",
      wordBackgroundColor: "#FF6B35",
    },
    {
      id: "hormozi-classic",
      name: "HORMOZI",
      isNew: false,
      isPremium: true,
      fontFamily: "Helvetica",
      fontWeight: "Heavy",
      color: "#FFFFFF",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Medium",
      shadow: "Large",
      uppercase: true,
      wordHighlight: "zoom",
    },
    {
      id: "pulse-energy",
      name: "Pulse Energy",
      isNew: true,
      isPremium: false,
      fontFamily: "Impact",
      fontWeight: "Bold",
      color: "#FF0080",
      backgroundColor: "rgba(0, 0, 0, 0)",
      strokeWeight: "Large",
      shadow: "Medium",
      uppercase: true,
      wordHighlight: "pulse",
      wordBackgroundColor: "#FF0080",
    },
  ];

  // 🚀 Charger les presets (lazy loading)
  const loadPresets = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/presets?public=true');
      if (response.ok) {
        const data = await response.json();
        const communityPresets = data.presets || [];
        
        // Combiner presets par défaut + communauté
        const allPresets = [...defaultPresets, ...communityPresets];
        setPresets(allPresets);
        
        console.log(`✅ ${allPresets.length} presets chargés (${communityPresets.length} communauté)`);
      } else {
        // Si l'API échoue, utiliser seulement les presets par défaut
        setPresets(defaultPresets);
        console.warn('API presets indisponible, utilisation des presets par défaut');
      }
    } catch (error) {
      console.error('Erreur chargement presets:', error);
      setPresets(defaultPresets);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // 🎯 Filtrer et rechercher
  const filteredPresets = presets.filter(preset => {
    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        preset.name.toLowerCase().includes(query) ||
        preset.description?.toLowerCase().includes(query) ||
        preset.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtre par mode
    switch (filterMode) {
      case 'trending':
        return (preset.votes || 0) > 5 || (preset.usageCount || 0) > 10;
      case 'new':
        return preset.isNew || (preset.createdAt && 
          new Date(preset.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      case 'my':
        return user && (preset.userName === profile?.name || user.email?.split('@')[0]) || 'Utilisateur';
      default:
        return true;
    }
  });

  const handleSelectPreset = (preset: Preset) => {
    // Convertir le preset en format de customization compatible
    const customization = {
      styleName: preset.name,
      fontSize: 36,
      fontFamily: preset.fontFamily,
      fontWeight: preset.fontWeight === 'Heavy' ? '800' : preset.fontWeight === 'Bold' ? 'bold' : preset.fontWeight,
      textTransform: preset.uppercase ? 'uppercase' : 'none',
      color: preset.color,
      backgroundColor: preset.backgroundColor || 'transparent',
      backgroundOpacity: 0,
      strokeWeight: preset.strokeWeight || 'none',
      strokeColor: '#000000',
      shadow: preset.shadow || 'none',
      displayWords: 3,
      position: 'middle',
      offsetY: 50,
      animation: true,
      punctuation: true,
      autoEmojis: true,
      emojiAnimation: true,
      padding: 12,
      borderRadius: 8,
      lineHeight: 1.4,
      // Propriétés highlight
      wordHighlight: preset.wordHighlight || 'zoom',
      wordBackgroundColor: preset.wordBackgroundColor || '#FF6B35',
      wordBackgroundOpacity: 1,
      wordSpacing: 0.15,
    };

    onSelectPreset(customization);
    
    // Incrémenter le compteur d'usage
    incrementUsage(preset.id);
    
    toast.success(`🎨 Preset "${preset.name}" appliqué !`, {
      duration: 2000,
    });
  };

  // 🚀 Incrémenter l'usage d'un preset
  const incrementUsage = async (presetId: string) => {
    try {
      await fetch(`/api/presets/${presetId}/use`, { method: 'POST' });
    } catch {
      // Silencieux, pas critique
    }
  };

  const handlePresetCreated = (newPreset: any) => {
    setPresets(prev => [newPreset, ...prev]);
    toast.success('🎉 Votre preset a été ajouté !');
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Chargement des presets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header avec recherche et filtres */}
      <div className="p-4 border-b bg-white dark:bg-gray-800 space-y-3 theme-transition">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Rechercher des presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        {/* Filtres et bouton Create */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {(['all', 'trending', 'new', 'my'] as const).map(mode => (
              <Button
                key={mode}
                variant={filterMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode(mode)}
                className="h-7 px-2 text-xs"
                disabled={mode === 'my' && !user}
              >
                {mode === 'all' && <Filter className="h-3 w-3 mr-1" />}
                {mode === 'trending' && <TrendingUp className="h-3 w-3 mr-1" />}
                {mode === 'new' && <Zap className="h-3 w-3 mr-1" />}
                {mode === 'my' && <User className="h-3 w-3 mr-1" />}
                {mode === 'all' ? 'Tous' : mode === 'trending' ? 'Populaires' : 
                 mode === 'new' ? 'Nouveaux' : 'Mes presets'}
              </Button>
            ))}
          </div>

          {user && (
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="h-7 px-3 bg-purple-600 hover:bg-purple-700 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Créer
            </Button>
          )}
        </div>

        {/* Compteur de résultats */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {filteredPresets.length} preset{filteredPresets.length > 1 ? 's' : ''} trouvé{filteredPresets.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grille des presets */}
      <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-800 theme-transition">
        {filteredPresets.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Aucun preset trouvé</p>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="mt-2"
              >
                Effacer la recherche
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                className="bg-gray-600 dark:bg-gray-700 rounded-lg h-20 flex flex-col items-center justify-center relative cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-600 transition-all duration-200 hover:scale-105 hover:shadow-lg group"
                onClick={() => handleSelectPreset(preset)}
              >
                {/* Badges */}
                <div className="absolute top-1 left-1 flex gap-1">
                  {preset.isNew && (
                    <div className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      New
                    </div>
                  )}
                  {preset.isPremium && (
                    <div className="bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Zap size={10} />
                      Pro
                    </div>
                  )}
                </div>

                {/* Statistiques */}
                {(preset.votes || preset.usageCount) && (
                  <div className="absolute top-1 right-1 flex items-center gap-1 text-xs text-white/80">
                    {preset.votes && (
                      <div className="flex items-center gap-0.5">
                        <Heart size={10} />
                        {preset.votes}
                      </div>
                    )}
                  </div>
                )}

                {/* Texte du preset avec style */}
                <div
                  className={`text-center ${
                    preset.id === "dan2" || preset.color === "#FFFF00"
                      ? "text-yellow-300"
                      : preset.color === "#FF5733" || preset.color === "#FF0080"
                        ? "text-orange-500"
                        : "text-white"
                  } ${preset.uppercase ? "uppercase" : ""} transition-all duration-200 group-hover:scale-110`}
                  style={{
                    fontFamily: preset.fontFamily,
                    fontWeight: preset.fontWeight === "Heavy" ? "900" : preset.fontWeight === "Bold" ? "700" : "500",
                    fontSize: '12px',
                    textShadow:
                      preset.shadow === "Large"
                        ? "2px 2px 4px rgba(0,0,0,0.8)"
                        : preset.shadow === "Medium"
                          ? "1px 1px 3px rgba(0,0,0,0.7)"
                          : preset.shadow === "Small"
                            ? "1px 1px 2px rgba(0,0,0,0.5)"
                            : "none",
                    WebkitTextStroke:
                      preset.strokeWeight === "Large"
                        ? "2px black"
                        : preset.strokeWeight === "Medium"
                          ? "1.5px black"
                          : preset.strokeWeight === "Small"
                            ? "1px black"
                            : "0",
                    // Prévisualisation du mode highlight
                    ...(preset.wordHighlight === 'background' && {
                      backgroundColor: preset.wordBackgroundColor,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#FFFFFF',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }),
                    ...(preset.wordHighlight === 'glow' && {
                      textShadow: `0 0 8px ${preset.wordBackgroundColor}, 1px 1px 3px rgba(0,0,0,0.7)`
                    }),
                    ...(preset.wordHighlight === 'rainbow' && {
                      background: 'linear-gradient(45deg, #ff6b35, #f7931e, #ffd23f)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent'
                    })
                  }}
                >
                  {preset.name}
                </div>

                {/* Informations supplémentaires au hover */}
                <div className="absolute bottom-1 left-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="text-xs text-white/90 text-center truncate">
                    {preset.userName && (
                      <span className="bg-black/50 px-1 rounded text-xs">
                        @{preset.userName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Effet de hover avancé */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-all duration-200 pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de création de preset */}
      <CreatePresetDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        currentStyle={currentStyle}
        onPresetCreated={handlePresetCreated}
      />
    </div>
  );
}