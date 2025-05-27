// src/utils/segment-mapper.ts
import { Subtitle } from "@/types"
import { SubtitleSegment } from "@/types/subtitle-segment"

export const toSegment = (s: Subtitle): SubtitleSegment => ({
  id:        s.id ?? crypto.randomUUID(),
  startTime: s.start,
  endTime:   s.end,
  text:      s.text,
})

export const toSubtitle = (seg: SubtitleSegment): Subtitle => ({
  id:    seg.id,
  start: seg.startTime,
  end:   seg.endTime,
  text:  seg.text,
})
