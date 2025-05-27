// src/types/subtitle-segment.ts
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
  }
}
