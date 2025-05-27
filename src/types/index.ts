// src/types/index.ts
/* ────────── Sous-titres – format “Remotion / Project” ────────── */
export interface Word {
  text: string
  start: number
  end: number
  confidence: number
}

export interface Subtitle {
  id: string
  text: string
  start: number
  end: number
  words?: Word[]
}

/* ────────── Sous-titres – format “v0 / UI” ────────── */
export interface SubtitleSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  style?: {
    fontSize?: number
    fontFamily?: string
    color?: string
    backgroundColor?: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    alignment?: string
    effect?: string
    animation?: string

    // ✅ Ajout de cette ligne :
    highlightWords?: boolean | string[]
  }
}

/* ────────── Style complet d’un projet Remotion ────────── */
export interface SubtitleStyle {
  fontSize: number
  fontFamily: string
  fontWeight: "normal" | "bold"
  fontStyle: "normal" | "italic"
  textDecoration: "none" | "underline" | "line-through"
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize"
  color: string

  backgroundColor: string
  backgroundOpacity: number
  padding: number
  borderRadius: number

  position: "bottom" | "top" | "middle"
  offsetY: number

  shadowEnabled: boolean
  shadowColor: string
  shadowBlur: number

  neonEnabled: boolean
  neonColor: string
  neonIntensity: number

  animationIn: "none" | "fade" | "slide-up" | "slide-down" | "scale" | "typewriter"
  animationOut: "none" | "fade" | "slide-up" | "slide-down" | "scale"
  animationDuration: number

  autoEmojis: boolean

  // ✅ Ajout ici aussi :
  highlightWords?: boolean | string[]
}

/* ────────── Projet vidéo complet ────────── */
export interface VideoProject {
  id: string
  videoUrl: string
  videoDuration: number
  subtitles: Subtitle[]
  style: SubtitleStyle
  width: number
  height: number
  fps: number
}

/* ────────── Valeurs par défaut ────────── */
export const defaultSubtitleStyle: SubtitleStyle = {
  fontSize: 36,
  fontFamily: "Arial",
  fontWeight: "bold",
  fontStyle: "normal",
  textDecoration: "none",
  textTransform: "none",
  color: "#FFFFFF",
  backgroundColor: "#000000",
  backgroundOpacity: 0.7,
  padding: 12,
  borderRadius: 8,
  position: "bottom",
  offsetY: 50,
  shadowEnabled: true,
  shadowColor: "#000000",
  shadowBlur: 4,
  neonEnabled: false,
  neonColor: "#00FF00",
  neonIntensity: 2,
  animationIn: "fade",
  animationOut: "fade",
  animationDuration: 0.3,
  autoEmojis: false,

  // ✅ Ajout ici aussi :
  highlightWords: false,
}
