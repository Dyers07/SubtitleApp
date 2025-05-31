// src/components/v2/edit-captions.tsx - Version corrigée avec timing optimisé
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmojiPicker } from '@/components/ui/emoji-picker';
import { Trash2, Edit3, Smile } from 'lucide-react';
import { SubtitleSegment, Word } from '@/types';
import { formatTime } from '@/lib/utils';
import { calculateAverageConfidence } from '@/utils/calculate-confidence';

interface EditCaptionsProps {
  segments: SubtitleSegment[];
  currentTime: number;
  onUpdateSubtitle: (id: string, updates: Partial<SubtitleSegment>) => void;
  onDeleteSubtitle: (id: string) => void;
  onMoveToNext: () => void;
}

interface WordEditDialog {
  open: boolean;
  segmentId: string;
  wordIndex: number;
  word: Word | null;
}

export function EditCaptions({
  segments,
  currentTime,
  onUpdateSubtitle,
  onDeleteSubtitle,
}: EditCaptionsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [wordDialog, setWordDialog] = useState<WordEditDialog>({
    open: false,
    segmentId: '',
    wordIndex: -1,
    word: null,
  });

  // 🎯 Calcul de la précision moyenne
  const averageConfidence = React.useMemo(() => {
    const allWords = segments.flatMap(seg => seg.words || []);
    return calculateAverageConfidence(allWords);
  }, [segments]);

  const handleEditStart = (segment: SubtitleSegment) => {
    setEditingId(segment.id);
    setEditText(segment.text);
  };

  const handleEditSave = (segmentId: string) => {
    onUpdateSubtitle(segmentId, { text: editText });
    setEditingId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleWordClick = (segmentId: string, wordIndex: number, word: Word) => {
    setWordDialog({
      open: true,
      segmentId,
      wordIndex,
      word: { ...word },
    });
  };

  const handleWordUpdate = () => {
    if (!wordDialog.word) return;

    const segment = segments.find(s => s.id === wordDialog.segmentId);
    if (!segment?.words) return;

    const updatedWords = [...segment.words];
    updatedWords[wordDialog.wordIndex] = wordDialog.word;

    // Recalculer le texte du segment
    const newText = updatedWords.map(w => w.text).join(' ');

    onUpdateSubtitle(wordDialog.segmentId, {
      words: updatedWords,
      text: newText,
    });

    setWordDialog({ open: false, segmentId: '', wordIndex: -1, word: null });
  };

  const updateWordInDialog = (updates: Partial<Word>) => {
    if (!wordDialog.word) return;
    setWordDialog(prev => ({
      ...prev,
      word: { ...prev.word!, ...updates }
    }));
  };

  // 🚀 Handler pour émojis FONCTIONNEL
  const handleEmojiSelect = (segmentId: string, emoji: string) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;

    // Ajouter l'emoji à la fin du texte avec un espace
    const newText = segment.text + (segment.text.endsWith(' ') ? '' : ' ') + emoji;
    
    // Mettre à jour le segment
    onUpdateSubtitle(segmentId, { text: newText });
    
    console.log(`🎉 Emoji ${emoji} ajouté au segment ${segmentId}`);
  };

  const isSegmentActive = (segment: SubtitleSegment) => {
    return currentTime >= segment.startTime && currentTime <= segment.endTime;
  };

  // 🚀 CORRECTION: Style optimisé avec transition ultra-rapide
  const getWordStyle = (word: Word, isActive: boolean) => {
    const baseStyle = {
      cursor: 'pointer',
      padding: '2px 4px',
      borderRadius: '3px',
      margin: '0 1px',
      transition: 'all 0.05s ease', // ✅ CORRIGÉ: 0.05s au lieu de 0.15s
      fontSize: '14px',
      display: 'inline-block',
    };

    if (isActive) {
      return {
        ...baseStyle,
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
        color: '#1e40af',
        transform: 'scale(1.02)', // Légèrement réduit pour plus de fluidité
        fontWeight: '600',
        boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)',
      };
    }

    if (word.color) {
      const colorMap = {
        yellow: '#fef3c7',
        green: '#d1fae5',  
        red: '#fee2e2',
      };
      return {
        ...baseStyle,
        backgroundColor: colorMap[word.color] || '#f3f4f6',
        color: '#374151',
      };
    }

    return {
      ...baseStyle,
      backgroundColor: 'transparent',
      color: '#6b7280',
    };
  };

  // 🎯 Fonction pour obtenir la couleur de confiance
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.8) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <>
      {/* 🎯 Header uniforme avec précision et rond animé */}
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.8)]"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Éditeur</span>
          <div className="text-xs text-gray-500 dark:text-gray-400">({segments.length})</div>
        </div>
        
        {/* 🚀 Affichage de la précision */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-400">Précision:</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getConfidenceColor(averageConfidence / 100)}`}>
            {averageConfidence.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-[calc(87vh-3.5rem)] overflow-y-auto p-4 space-y-3">
        {segments.map((segment) => {
          const isActive = isSegmentActive(segment);
          const isEditing = editingId === segment.id;
          
          // Calcul de la confiance du segment
          const segmentConfidence = segment.words?.length 
            ? calculateAverageConfidence(segment.words)
            : 0;

          return (
            <div
              key={segment.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                isActive 
                  ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">
                    {formatTime(segment.startTime)} → {formatTime(segment.endTime)}
                  </span>
                  {/* Confiance du segment */}
                  {segment.words?.length && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${getConfidenceColor(segmentConfidence / 100)}`}>
                      {segmentConfidence.toFixed(0)}%
                    </span>
                  )}
                </div>
                
                <div className="flex gap-1">
                  {/* 🎉 Bouton emoji FONCTIONNEL */}
                  <EmojiPicker
                    onEmojiSelect={(emoji) => handleEmojiSelect(segment.id, emoji)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                      title="Ajouter un emoji"
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                  </EmojiPicker>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditStart(segment)}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Éditer le texte"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSubtitle(segment.id)}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEditSave(segment.id);
                      } else if (e.key === 'Escape') {
                        handleEditCancel();
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditSave(segment.id)}
                      className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      Sauvegarder
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleEditCancel}
                      className="h-7 px-3 text-xs"
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed">
                  {segment.words && segment.words.length > 0 ? (
                    segment.words.map((word, index) => {
                      // 🚀 CORRECTION: Tolérance de timing pour compenser les micro-délais
                      const wordActive = isActive && 
                        currentTime >= (word.start - 0.02) && // ✅ Tolérance -20ms
                        currentTime <= (word.end + 0.02);     // ✅ Tolérance +20ms
                      
                      return (
                        <span
                          key={`${segment.id}-word-${index}`}
                          style={getWordStyle(word, wordActive)}
                          onClick={() => handleWordClick(segment.id, index, word)}
                          className="hover:bg-gray-100 hover:shadow-sm transition-all duration-75" // ✅ Transition plus rapide
                          title={`Confiance: ${Math.round(word.confidence * 100)}%`}
                          onMouseEnter={(e) => {
                            if (!wordActive) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!wordActive) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {word.text}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-700">{segment.text}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dialog d'édition de mot */}
      <Dialog open={wordDialog.open} onOpenChange={(open) => 
        setWordDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Éditer le mot</DialogTitle>
          </DialogHeader>
          
          {wordDialog.word && (
            <div className="space-y-4">
              <div>
                <Label>Texte</Label>
                <Input
                  value={wordDialog.word.text}
                  onChange={(e) => updateWordInDialog({ text: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Début (s)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={wordDialog.word.start}
                    onChange={(e) => updateWordInDialog({ start: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Fin (s)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={wordDialog.word.end}
                    onChange={(e) => updateWordInDialog({ end: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Couleur de surlignage</Label>
                <Select
                  value={wordDialog.word.color || 'none'}
                  onValueChange={(value) => 
                    updateWordInDialog({ 
                      color: value === 'none' ? undefined : value as any 
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucune</SelectItem>
                    <SelectItem value="yellow">🟡 Jaune</SelectItem>
                    <SelectItem value="green">🟢 Vert</SelectItem>
                    <SelectItem value="red">🔴 Rouge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Confiance: {Math.round((wordDialog.word.confidence || 0) * 100)}%</Label>
                <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                    style={{ width: `${(wordDialog.word.confidence || 0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleWordUpdate} className="flex-1">
                  Mettre à jour
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setWordDialog({ open: false, segmentId: '', wordIndex: -1, word: null })}
                >
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}