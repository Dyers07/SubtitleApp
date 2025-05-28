'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Edit2, Trash2, Plus, ChevronDown } from 'lucide-react';
import { SubtitleSegment, Word } from '@/types';
import { cn } from '@/lib/utils';

interface EditCaptionsProps {
  segments: SubtitleSegment[];
  currentTime: number;
  onUpdateSubtitle: (id: string, update: Partial<SubtitleSegment>) => void;
  onDeleteSubtitle: (id: string) => void;
  onMoveToNext: (id: string) => void;
}

export function EditCaptions({
  segments,
  currentTime,
  onUpdateSubtitle,
  onDeleteSubtitle,
  onMoveToNext,
}: EditCaptionsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredWord, setHoveredWord] = useState<{ segmentId: string; wordIndex: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<{ segmentId: string; wordIndex: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeIndex = segments.findIndex(
      (seg) => currentTime >= seg.startTime && currentTime <= seg.endTime
    );
    if (activeIndex !== -1 && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-segment-index="${activeIndex}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentTime, segments]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const updateWord = (segmentId: string, wordIndex: number, updates: Partial<Word>) => {
    const seg = segments.find((s) => s.id === segmentId);
    if (!seg?.words) return;
    const newWords = [...seg.words];
    newWords[wordIndex] = { ...newWords[wordIndex], ...updates };
    const newText = newWords.map((w) => w.text).join(' ');
    onUpdateSubtitle(segmentId, { words: newWords, text: newText });
  };

  const deleteWord = (segmentId: string, wordIndex: number) => {
    const seg = segments.find((s) => s.id === segmentId);
    if (!seg?.words) return;
    const newWords = seg.words.filter((_, i) => i !== wordIndex);
    const newText = newWords.map((w) => w.text).join(' ');
    onUpdateSubtitle(segmentId, { words: newWords, text: newText });
  };

  const addWord = (segmentId: string, afterIndex: number) => {
    const seg = segments.find((s) => s.id === segmentId);
    if (!seg?.words) return;
    const w = prompt('Nouveau mot :')?.trim();
    if (!w) return;
    const newWords = [...seg.words];
    const prev = newWords[afterIndex];
    const next = newWords[afterIndex + 1];
    const start = prev?.end ?? seg.startTime;
    const end = next?.start ?? start + 0.3;
    newWords.splice(afterIndex + 1, 0, { text: w, start, end, confidence: 1 });
    const newText = newWords.map((x) => x.text).join(' ');
    onUpdateSubtitle(segmentId, { words: newWords, text: newText });
  };

  const splitIntoNewLine = (segmentId: string, idx: number) => {
    alert('Split à gérer dans le parent');
  };

  const addLineBreak = (segmentId: string, idx: number) => {
    const seg = segments.find((s) => s.id === segmentId);
    if (!seg?.words) return;
    const newWords = [...seg.words];
    newWords[idx] = { ...newWords[idx], lineBreak: true };
    const newText = newWords
      .map((w, i) =>
        w.text + (w.lineBreak ? '\n' : i < newWords.length - 1 ? ' ' : '')
      )
      .join('');
    onUpdateSubtitle(segmentId, { words: newWords, text: newText });
  };

  const setWordColor = (segmentId: string, idx: number, color: Word['color'] | null) => {
    updateWord(segmentId, idx, { color: color ?? undefined });
  };

  const updateTiming = (segmentId: string, field: 'startTime' | 'endTime', val: number) => {
    onUpdateSubtitle(segmentId, { [field]: val });
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Éditer les sous-titres</h3>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-2">
        {segments.map((seg, ix) => {
          const active = currentTime >= seg.startTime && currentTime <= seg.endTime;
          const editing = editingId === seg.id;
          return (
            <div
              key={seg.id}
              data-segment-index={ix}
              className={cn(
                'p-3 rounded-lg border',
                active ? 'bg-primary/10 border-primary/50' : 'bg-muted/50'
              )}
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {formatTime(seg.startTime)} – {formatTime(seg.endTime)}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingId(editing ? null : seg.id)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSubtitle(seg.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {editing ? (
                <>
                  <textarea
                    className="w-full p-2 border rounded min-h-[60px]"
                    value={seg.text}
                    onChange={(e) =>
                      onUpdateSubtitle(seg.id, { text: e.target.value })
                    }
                  />
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      value={seg.startTime}
                      onChange={(e) =>
                        updateTiming(seg.id, 'startTime', parseFloat(e.target.value))
                      }
                      step={0.1}
                      className="w-24"
                    />
                    <Input
                      type="number"
                      value={seg.endTime}
                      onChange={(e) =>
                        updateTiming(seg.id, 'endTime', parseFloat(e.target.value))
                      }
                      step={0.1}
                      className="w-24"
                    />
                    <Button onClick={() => setEditingId(null)}>OK</Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {seg.words && seg.words.length > 0 ? (
                    seg.words.map((w, wi) => (
                      <div key={wi} className="inline-flex items-center">
                        <span
                          className={cn(
                            'px-1 py-0.5 rounded cursor-pointer',
                            hoveredWord?.segmentId === seg.id &&
                              hoveredWord.wordIndex === wi
                              ? 'bg-primary/20'
                              : 'hover:bg-primary/10',
                            w.color && `text-${w.color}-600 bg-${w.color}-100`,
                            selectedWord?.segmentId === seg.id &&
                              selectedWord.wordIndex === wi
                              ? 'ring-2 ring-primary'
                              : ''
                          )}
                          onMouseEnter={() =>
                            setHoveredWord({ segmentId: seg.id, wordIndex: wi })
                          }
                          onMouseLeave={() => setHoveredWord(null)}
                          onClick={() =>
                            setSelectedWord({ segmentId: seg.id, wordIndex: wi })
                          }
                        >
                          {w.text}
                        </span>

                        {selectedWord?.segmentId === seg.id &&
                          selectedWord.wordIndex === wi && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-1 p-0 h-6 w-6"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setWordColor(seg.id, wi, null)}>
                                  Aucune couleur
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setWordColor(seg.id, wi, 'green')}>
                                  Vert
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setWordColor(seg.id, wi, 'yellow')}>
                                  Jaune
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setWordColor(seg.id, wi, 'red')}>
                                  Rouge
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => addLineBreak(seg.id, wi)}>
                                  Saut de ligne
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => splitIntoNewLine(seg.id, wi)}>
                                  Split ligne
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addWord(seg.id, wi)}>
                                  <Plus className="h-3 w-3 mr-1" /> Ajouter mot
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteWord(seg.id, wi)}>
                                  <Trash2 className="h-3 w-3 mr-1" /> Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}

                        {w.lineBreak && <br />}
                      </div>
                    ))
                  ) : (
                    <span className="text-muted-foreground">{seg.text}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
