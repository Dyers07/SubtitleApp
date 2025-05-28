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

export function ExportDialog({ open, progress, status, onCancel }: ExportDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Export en cours...
          </DialogTitle>
          <DialogDescription>
            {status || 'Traitement de votre vidéo avec sous-titres personnalisés'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            {progress}%
          </p>
          <button
            className="text-xs text-red-600 hover:underline"
            onClick={onCancel}
          >
            Annuler
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
