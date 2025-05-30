// src/components/export-dialog.tsx
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import type { ExportDialogProps } from '@/types';

export function ExportDialog({ open, progress, status, onCancel, estimatedTimeRemaining = null }: ExportDialogProps & { estimatedTimeRemaining?: number | null }) {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
  
    const getStatusText = () => {
      if (progress < 10) return "Préparation du rendu...";
      if (progress < 30) return "Traitement de la vidéo...";
      if (progress < 60) return "Génération des sous-titres...";
      if (progress < 85) return "Encodage vidéo...";
      if (progress < 95) return "Finalisation...";
      return "Presque terminé !";
    };
  
    return (
      <Dialog open={open}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Export en cours...
            </DialogTitle>
            <DialogDescription>
              {status || getStatusText()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
            
            {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Temps restant estimé</span>
                <span className="font-medium">{formatTime(estimatedTimeRemaining)}</span>
              </div>
            )}
            
            <div className="flex justify-center">
              <button
                className="text-xs text-gray-500 hover:text-red-600 hover:underline transition-colors"
                onClick={onCancel}
              >
                Annuler l'export
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  