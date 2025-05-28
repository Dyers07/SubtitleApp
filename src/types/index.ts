// src/types/index.ts

/* ────────── Mot – format “Remotion / Project” ────────── */
export interface Word {
  text: string;
  start: number;                  // début en secondes
  end: number;                    // fin en secondes
  confidence: number;             // score STT
  color?: 'red' | 'green' | 'yellow'; // pour le highlight mot-à-mot
  lineBreak?: boolean;            // si on force un saut de ligne après
}

/* ────────── Sous-titre – format “Remotion / Project” ────────── */
export interface Subtitle {
  id: string;
  text: string;
  start: number;
  end: number;
  words?: Word[];
}

/* ────────── Segment – format “UI / v2” ────────── */
export interface SubtitleSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  words?: Word[];
  style?: Partial<{
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    alignment: 'left' | 'center' | 'right';
    effect: string;
    animation: boolean; // au survol / play
    highlightWords: boolean | Array<'red' | 'green' | 'yellow'>;
  }>;
}

/* ────────── Style global d’un projet Remotion ────────── */
export interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | '500' | '600' | 'bold' | '800';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color: string;

  backgroundColor: string;
  backgroundOpacity: number;
  padding: number;
  borderRadius: number;

  position: 'bottom' | 'top' | 'middle';
  offsetY: number;

  shadow: 'none' | 'small' | 'medium' | 'large';
  shadowColor: string;
  shadowBlur: number;

  neonEnabled: boolean;
  neonColor: string;
  neonIntensity: number;

  animationIn: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'typewriter';
  animationOut: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'scale';
  animationDuration: number;
  animation: boolean;             // mot-à-mot on/off

  autoEmojis: boolean;
  lineHeight: number;

  highlightWords: boolean | Array<'red' | 'green' | 'yellow'>;
}

/* ────────── Projet vidéo complet ────────── */
export interface VideoProject {
  id: string;
  videoUrl: string;
  videoDuration: number;
  subtitles: Subtitle[];
  style: SubtitleStyle;
  width: number;
  height: number;
  fps: number;
}

/* ────────── Props ExportDialog ────────── */
export interface ExportDialogProps {
  open: boolean;
  progress: number;               // 0–100
  onCancel: () => void;
  status?: string;
}

/* ────────── Props SubtitleCustomizer ────────── */
export interface SubtitleCustomizerProps {
  project: VideoProject;
  rawSubtitles: Subtitle[];
  onProjectUpdate: (p: VideoProject) => void;
  onReset: () => void;
  onStartExport: () => void;
  onExportProgress: (progress: number) => void;
}

/* ────────── Valeurs par défaut ────────── */
export const defaultSubtitleStyle: SubtitleStyle = {
  fontSize: 36,
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fontStyle: 'normal',
  textDecoration: 'none',
  textTransform: 'none',
  color: '#FFFFFF',

  backgroundColor: '#000000',
  backgroundOpacity: 0.7,
  padding: 12,
  borderRadius: 8,

  position: 'bottom',
  offsetY: 50,

  shadow: 'medium',
  shadowColor: '#000000',
  shadowBlur: 4,

  neonEnabled: false,
  neonColor: '#00FF00',
  neonIntensity: 2,

  animationIn: 'fade',
  animationOut: 'fade',
  animationDuration: 0.3,
  animation: true,

  autoEmojis: false,
  lineHeight: 1.4,

  highlightWords: false,
};
