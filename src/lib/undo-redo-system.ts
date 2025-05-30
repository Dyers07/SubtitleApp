// src/lib/undo-redo-system.ts - Système d'historique pour sous-titres
import { SubtitleSegment, SubtitleStyle } from '@/types';
import { toast } from 'sonner';

export interface HistoryState {
  id: string;
  timestamp: number;
  description: string;
  segments: SubtitleSegment[];
  style: SubtitleStyle;
  metadata?: {
    action: string;
    affectedSegments?: string[];
    changes?: Record<string, any>;
  };
}

export interface UndoRedoOptions {
  maxHistorySize?: number;
  enableGrouping?: boolean;
  groupingDelay?: number;
}

export class UndoRedoSystem {
  private history: HistoryState[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number;
  private enableGrouping: boolean;
  private groupingDelay: number;
  private pendingGroupId: string | null = null;
  private groupingTimer: NodeJS.Timeout | null = null;

  constructor(options: UndoRedoOptions = {}) {
    this.maxHistorySize = options.maxHistorySize || 100;
    this.enableGrouping = options.enableGrouping ?? true;
    this.groupingDelay = options.groupingDelay || 1000; // 1 seconde
  }

  /**
   * 🎯 Sauvegarder l'état actuel
   */
  saveState(
    segments: SubtitleSegment[], 
    style: SubtitleStyle, 
    description: string,
    metadata?: HistoryState['metadata']
  ): void {
    const now = Date.now();
    const stateId = `state-${now}-${Math.random().toString(36).substr(2, 9)}`;

    const newState: HistoryState = {
      id: stateId,
      timestamp: now,
      description,
      segments: JSON.parse(JSON.stringify(segments)), // Deep clone
      style: JSON.parse(JSON.stringify(style)), // Deep clone
      metadata,
    };

    // 🚀 Gestion du groupement pour actions rapides
    if (this.enableGrouping && this.shouldGroupActions(description, metadata)) {
      this.handleGrouping(newState);
      return;
    }

    this.addToHistory(newState);
  }

  /**
   * 🔄 Groupement intelligent des actions
   */
  private shouldGroupActions(description: string, metadata?: HistoryState['metadata']): boolean {
    if (!metadata) return false;

    // Actions à grouper
    const groupableActions = [
      'text-edit',
      'style-change',
      'position-drag',
      'slider-change',
      'color-pick',
    ];

    return groupableActions.includes(metadata.action);
  }

  private handleGrouping(newState: HistoryState): void {
    const lastState = this.getCurrentState();
    
    // Si c'est la même action sur le même élément dans un court délai
    if (
      lastState &&
      lastState.metadata?.action === newState.metadata?.action &&
      newState.timestamp - lastState.timestamp < this.groupingDelay
    ) {
      // Remplacer le dernier état au lieu d'ajouter
      this.history[this.currentIndex] = newState;
      
      // Reset timer de groupement
      if (this.groupingTimer) {
        clearTimeout(this.groupingTimer);
      }
      
      this.groupingTimer = setTimeout(() => {
        this.pendingGroupId = null;
      }, this.groupingDelay);
      
      return;
    }

    // Ajouter normalement si pas de groupement possible
    this.addToHistory(newState);
  }

  /**
   * ➕ Ajouter à l'historique
   */
  private addToHistory(state: HistoryState): void {
    // Supprimer tous les états après l'index actuel (pour branching)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Ajouter le nouvel état
    this.history.push(state);
    this.currentIndex++;
    
    // Limiter la taille de l'historique
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }

    console.log(`💾 État sauvé: ${state.description} (${this.history.length} états)`);
  }

  /**
   * ⬅️ Annuler (Undo)
   */
  undo(): HistoryState | null {
    if (!this.canUndo()) {
      toast.warning('Aucune action à annuler');
      return null;
    }

    this.currentIndex--;
    const previousState = this.history[this.currentIndex];
    
    toast.success(`⬅️ Annulé: ${previousState.description}`, {
      duration: 2000,
    });
    
    console.log(`⬅️ Undo vers: ${previousState.description}`);
    return previousState;
  }

  /**
   * ➡️ Refaire (Redo)
   */
  redo(): HistoryState | null {
    if (!this.canRedo()) {
      toast.warning('Aucune action à refaire');
      return null;
    }

    this.currentIndex++;
    const nextState = this.history[this.currentIndex];
    
    toast.success(`➡️ Refait: ${nextState.description}`, {
      duration: 2000,
    });
    
    console.log(`➡️ Redo vers: ${nextState.description}`);
    return nextState;
  }

  /**
   * 🔍 Vérifications de disponibilité
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * 📄 Obtenir l'état actuel
   */
  getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * 📚 Obtenir l'historique complet
   */
  getHistory(): HistoryState[] {
    return this.history.map(state => ({
      ...state,
      isCurrent: state.id === this.getCurrentState()?.id,
    }));
  }

  /**
   * 🎯 Aller à un état spécifique
   */
  goToState(stateId: string): HistoryState | null {
    const index = this.history.findIndex(state => state.id === stateId);
    if (index === -1) {
      toast.error('État introuvable dans l\'historique');
      return null;
    }

    this.currentIndex = index;
    const targetState = this.history[index];
    
    toast.success(`🎯 Retour à: ${targetState.description}`);
    return targetState;
  }

  /**
   * 🗑️ Nettoyer l'historique
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.pendingGroupId = null;
    
    if (this.groupingTimer) {
      clearTimeout(this.groupingTimer);
      this.groupingTimer = null;
    }
    
    console.log('🗑️ Historique nettoyé');
  }

  /**
   * 📊 Statistiques de l'historique
   */
  getStats(): {
    totalStates: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
    memoryUsage: string;
  } {
    const memoryUsage = JSON.stringify(this.history).length;
    const memoryMB = (memoryUsage / 1024 / 1024).toFixed(2);

    return {
      totalStates: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      memoryUsage: `${memoryMB} MB`,
    };
  }

  /**
   * 🔧 Actions prédéfinies pour différents types de modifications
   */
  
  // Édition de texte
  saveTextEdit(segments: SubtitleSegment[], style: SubtitleStyle, segmentId: string, oldText: string, newText: string): void {
    this.saveState(
      segments,
      style,
      `Texte modifié: "${oldText}" → "${newText}"`,
      {
        action: 'text-edit',
        affectedSegments: [segmentId],
        changes: { oldText, newText },
      }
    );
  }

  // Changement de style
  saveStyleChange(segments: SubtitleSegment[], style: SubtitleStyle, property: string, oldValue: any, newValue: any): void {
    this.saveState(
      segments,
      style,
      `Style ${property}: ${oldValue} → ${newValue}`,
      {
        action: 'style-change',
        changes: { property, oldValue, newValue },
      }
    );
  }

  // Suppression de segment
  saveSegmentDeletion(segments: SubtitleSegment[], style: SubtitleStyle, deletedSegment: SubtitleSegment): void {
    this.saveState(
      segments,
      style,
      `Segment supprimé: "${deletedSegment.text}"`,
      {
        action: 'segment-delete',
        affectedSegments: [deletedSegment.id],
        changes: { deletedSegment },
      }
    );
  }

  // Déplacement de position
  savePositionChange(segments: SubtitleSegment[], style: SubtitleStyle, oldPosition: {x: number, y: number}, newPosition: {x: number, y: number}): void {
    this.saveState(
      segments,
      style,
      `Position: (${oldPosition.x}%, ${oldPosition.y}%) → (${newPosition.x}%, ${newPosition.y}%)`,
      {
        action: 'position-drag',
        changes: { oldPosition, newPosition },
      }
    );
  }

  // Application de preset
  savePresetApplication(segments: SubtitleSegment[], style: SubtitleStyle, presetName: string): void {
    this.saveState(
      segments,
      style,
      `Preset appliqué: ${presetName}`,
      {
        action: 'preset-apply',
        changes: { presetName },
      }
    );
  }
}

// Instance singleton
let undoRedoInstance: UndoRedoSystem | null = null;

export function getUndoRedoSystem(): UndoRedoSystem {
  if (!undoRedoInstance) {
    undoRedoInstance = new UndoRedoSystem({
      maxHistorySize: 50, // Limite raisonnable pour les performances
      enableGrouping: true,
      groupingDelay: 800, // 800ms pour grouper les actions rapides
    });
  }
  return undoRedoInstance;
}

// Hook pour utilisation dans les composants React
export function useUndoRedo() {
  const system = getUndoRedoSystem();
  
  return {
    saveState: system.saveState.bind(system),
    undo: system.undo.bind(system),
    redo: system.redo.bind(system),
    canUndo: system.canUndo.bind(system),
    canRedo: system.canRedo.bind(system),
    getCurrentState: system.getCurrentState.bind(system),
    getHistory: system.getHistory.bind(system),
    getStats: system.getStats.bind(system),
    clear: system.clear.bind(system),
    
    // Actions spécialisées
    saveTextEdit: system.saveTextEdit.bind(system),
    saveStyleChange: system.saveStyleChange.bind(system),
    saveSegmentDeletion: system.saveSegmentDeletion.bind(system),
    savePositionChange: system.savePositionChange.bind(system),
    savePresetApplication: system.savePresetApplication.bind(system),
  };
}