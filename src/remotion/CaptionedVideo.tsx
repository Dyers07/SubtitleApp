import React from 'react';
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion';
import { Subtitle, SubtitleStyle } from '@/types';

interface Word {
  text: string;
  start: number;
  end: number;
}

interface CaptionedVideoProps {
  videoUrl?: string;
  subtitles: Subtitle[];
  style: SubtitleStyle;
}

/* ───────────────── composant mot animé ─────────────────────────────── */
const WordComponent: React.FC<{
  word: Word;
  frame: number;
  fps: number;
  style: SubtitleStyle;
}> = ({ word, frame, fps, style }) => {
  const start = word.start * fps;
  const end   = word.end   * fps;
  const active = frame >= start && frame <= end;

  return (
    <span
      style={{
        opacity:   active ? 1 : 0.3,
        transform: `scale(${active ? 1.1 : 1})`,
        transition: 'all 0.15s',
        marginRight: '0.3em',
        display: 'inline-block',
        color: style.color,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        textDecoration: style.textDecoration,
        textTransform: style.textTransform as any,
        textShadow: style.shadowEnabled
          ? `0 0 ${style.shadowBlur}px ${style.shadowColor}`
          : undefined,
        ...(style.neonEnabled && active && {
          textShadow: `
            0 0 ${style.neonIntensity}px ${style.neonColor},
            0 0 ${style.neonIntensity * 2}px ${style.neonColor},
            0 0 ${style.neonIntensity * 3}px ${style.neonColor}
          `,
          filter: 'brightness(1.3)',
        }),
      }}
    >
      {word.text}
    </span>
  );
};

/* ───────────────────── Composant principal ─────────────────────────── */
export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  videoUrl,
  subtitles,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* sous-titre courant ------------------------------------------------- */
  const now         = frame / fps;
  const currentSub  = subtitles.find((s) => now >= s.start && now <= s.end);

  /* position du bloc de sous-titres ----------------------------------- */
  const posStyle = () => {
    switch (style.position) {
      case 'top':
        return { top: `${style.offsetY}px` };
      case 'middle':
        return { top: '50%', transform: 'translateY(-50%)' };
      default:
        return { bottom: `${style.offsetY}px` };
    }
  };

  /* URL vidéo utilisable par Remotion --------------------------------- */
  const src = React.useMemo(() => {
    if (!videoUrl) return '';

    // 1. URLs absolues http(s) – on les laisse intactes
    if (/^https?:\/\//.test(videoUrl)) return videoUrl;

    // 2. Chemins Next.js "/uploads/…" ou "uploads/…"  ->  /static/uploads/…
    const trimmed = videoUrl.replace(/^\/+/, '');      // retire les éventuels '/'
    if (trimmed.startsWith('uploads/')) {
      return staticFile(trimmed);                      // => /static/uploads/…
    }

    // 3. Tout autre chemin relatif passe aussi par staticFile
    return staticFile(trimmed);
  }, [videoUrl]);

  /* ------------------------------------------------------------------- */
  return (
    <AbsoluteFill>
      {src ? (
        <Video
          src={src}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          volume={1}
          playsInline
          crossOrigin="anonymous"
          onError={(err) => console.error('Video playback error:', err)}
        />
      ) : (
        /* Fallback si aucune vidéo ------------------------------------- */
        <AbsoluteFill
          style={{
            backgroundColor: '#000',
            color: '#fff',
            fontFamily: 'Arial',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p style={{ fontSize: 24 }}>Aucune vidéo chargée</p>
          <p style={{ fontSize: 16, opacity: 0.7 }}>
            Uploadez une vidéo depuis l&rsquo;interface principale
          </p>
        </AbsoluteFill>
      )}

      {/* Bloc de sous-titres ------------------------------------------- */}
      {currentSub && (
        <AbsoluteFill
          style={{
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px',
            ...posStyle(),
          }}
        >
          <div
            style={{
              maxWidth: '90%',
              textAlign: 'center',
              lineHeight: 1.4,
              fontSize: `${style.fontSize}px`,
              fontFamily: style.fontFamily,
              backgroundColor: `${style.backgroundColor}${Math.floor(
                style.backgroundOpacity * 255,
              )
                .toString(16)
                .padStart(2, '0')}`,
              padding: `${style.padding}px ${style.padding * 1.5}px`,
              borderRadius: `${style.borderRadius}px`,
              boxShadow: style.shadowEnabled
                ? `0 2px ${style.shadowBlur}px ${style.shadowColor}`
                : undefined,
            }}
          >
            {currentSub.words ? (
              currentSub.words.map((w, i) => (
                <WordComponent
                  key={`${currentSub.id}-${i}`}
                  word={w}
                  frame={frame}
                  fps={fps}
                  style={style}
                />
              ))
            ) : (
              <span
                style={{
                  color: style.color,
                  fontWeight: style.fontWeight,
                  fontStyle: style.fontStyle,
                  textDecoration: style.textDecoration,
                  textTransform: style.textTransform as any,
                  textShadow: style.shadowEnabled
                    ? `0 0 ${style.shadowBlur}px ${style.shadowColor}`
                    : undefined,
                  ...(style.neonEnabled && {
                    textShadow: `
                      0 0 ${style.neonIntensity}px ${style.neonColor},
                      0 0 ${style.neonIntensity * 2}px ${style.neonColor},
                      0 0 ${style.neonIntensity * 3}px ${style.neonColor}
                    `,
                    filter: 'brightness(1.3)',
                  }),
                }}
              >
                {currentSub.text}
              </span>
            )}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
