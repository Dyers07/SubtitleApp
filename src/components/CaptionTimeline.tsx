'use client';

import React, { useEffect, useRef } from 'react';

/* ─────────── types locaux ─────────── */
interface Word {
  text: string;
  start: number;
  end: number;
}

interface Subtitle {
  id?: string;          // ← peut être absent
  start: number;
  end: number;
  text: string;
  words?: Word[];
}

interface CaptionTimelineProps {
  subtitles: Subtitle[];
  currentTime: number;
}

/* ─────────── helper clé unique ─────────── */
const keyFor = (sub: Subtitle, idx: number) =>
  sub.id ?? `${sub.start}-${sub.end}-${idx}`;

/* ─────────── composant ─────────── */
export const CaptionTimeline: React.FC<CaptionTimelineProps> = ({
  subtitles,
  currentTime,
}) => {
  /* ligne active */
  const activeIdx = subtitles.findIndex(
    (s) => currentTime >= s.start && currentTime <= s.end,
  );

  /* refs pour scroll auto */
  const refs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeIdx !== -1) {
      refs.current[activeIdx]?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }, [activeIdx]);

  /* render */
  return (
    <div className="h-72 overflow-y-auto space-y-1 rounded-xl p-2 bg-muted/40">
      {subtitles.map((sub, i) => {
        const isActive = i === activeIdx;

        return (
          <div
            key={keyFor(sub, i)}                 /* ← toujours unique */
            ref={(el) => {
              refs.current[i] = el;             /* pas de return */
            }}
            className={`px-2 py-1 rounded cursor-pointer transition
              ${isActive ? 'bg-primary/10 animate-pulse' : 'hover:bg-muted/50'}
            `}
          >
            <div className="text-[11px] text-muted-foreground">
              {sub.start.toFixed(2)} – {sub.end.toFixed(2)}
            </div>

            <p className="text-sm leading-relaxed">
              {sub.words?.length
                ? sub.words.map((w, j) => {
                    const wordOn =
                      currentTime >= w.start && currentTime <= w.end;
                    return (
                      <span
                        key={`${keyFor(sub, i)}-w${j}`}
                        className={
                          wordOn ? 'underline decoration-primary' : ''
                        }
                      >
                        {w.text + ' '}
                      </span>
                    );
                  })
                : sub.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};
