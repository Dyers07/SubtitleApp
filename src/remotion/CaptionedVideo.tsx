import React from 'react';
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from 'remotion';
import { Subtitle, SubtitleStyle } from '@/types';

interface CaptionedVideoProps {
  videoUrl: string;
  subtitles: Subtitle[];
  style: SubtitleStyle;
}

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  videoUrl,
  subtitles,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const currentSub = subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  const getPositionStyle = (): React.CSSProperties => {
    const base = {
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 20px',
    };
    const oY = style.offsetY ?? 0;
    switch (style.position) {
      case 'top':
        return { ...base, top: `${20 + oY}px`, bottom: 'auto' };
      case 'middle':
        return {
          ...base,
          top: '50%',
          transform: `translateY(calc(-50% + ${oY}px))`,
          bottom: 'auto',
        };
      default:
        return { ...base, bottom: `${20 + oY}px`, top: 'auto' };
    }
  };

  const getTextStyle = (isActive: boolean): React.CSSProperties => {
    const s: React.CSSProperties = {
      transition: 'all 0.15s',
      display: 'inline-block',
      color: style.color,
      fontSize: `${style.fontSize}px`,
      fontFamily: style.fontFamily,
      lineHeight: style.lineHeight,
      fontWeight: style.fontWeight,
      textTransform: style.textTransform,
    };

    if (style.animation) {
      s.opacity = isActive ? 1 : 0.3;
      s.transform = isActive ? 'scale(1.1)' : 'scale(1)';
    }

    if (style.shadow !== 'none') {
      const map = {
        small: '1px 1px 2px rgba(0, 0, 0, 0.5)',
        medium: '2px 2px 4px rgba(0, 0, 0, 0.7)',
        large: '3px 3px 6px rgba(0, 0, 0, 0.9)',
      };
      s.textShadow = map[style.shadow] || map.medium;
    }

    return s;
  };

  const addEmojis = (text: string): string => {
    if (!style.autoEmojis) return text;
    const emojiMap: Record<string, string> = {
      happy: '😊',
      heureux: '😊',
      sad: '😢',
      triste: '😢',
      love: '❤️',
      amour: '❤️',
      laugh: '😂',
      rire: '😂',
      wow: '😮',
      super: '🎉',
      merci: '🙏',
      thanks: '🙏',
    };
    return Object.entries(emojiMap).reduce(
      (acc, [word, emoji]) =>
        acc.replace(new RegExp(`\\b${word}\\b`, 'gi'), `$& ${emoji}`),
      text
    );
  };

  return (
    <AbsoluteFill>
      {videoUrl ? (
        <Video
          src={videoUrl}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <AbsoluteFill
          style={{
            backgroundColor: '#000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            fontSize: '24px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p>Aucune vidéo chargée</p>
            <p style={{ fontSize: '16px', opacity: 0.7 }}>
              Uploadez une vidéo depuis l'interface principale
            </p>
          </div>
        </AbsoluteFill>
      )}

      {currentSub && (
        <AbsoluteFill style={getPositionStyle()}>
          <div
            style={{
              backgroundColor: style.backgroundColor,
              opacity: style.backgroundOpacity,
              padding: `${style.padding}px ${style.padding * 1.5}px`,
              borderRadius: `${style.borderRadius}px`,
              maxWidth: '90%',
              textAlign: 'center',
            }}
          >
            {currentSub.words && currentSub.words.length > 0 ? (
              currentSub.words.map((word, i) => {
                const startF = word.start * fps;
                const endF = word.end * fps;
                const active = frame >= startF && frame <= endF;
                const txt = style.autoEmojis ? addEmojis(word.text) : word.text;
                return (
                  <span
                    key={`${currentSub.id}-${i}`}
                    style={{
                      ...getTextStyle(active),
                      marginRight: '0.3em',
                      ...(word.color && {
                        backgroundColor:
                          word.color === 'yellow'
                            ? '#fbbf24'
                            : word.color === 'green'
                            ? '#34d399'
                            : '#f87171',
                        padding: '0 4px',
                        borderRadius: '2px',
                      }),
                    }}
                  >
                    {txt}
                  </span>
                );
              })
            ) : (
              <span style={getTextStyle(true)}>
                {style.autoEmojis
                  ? addEmojis(currentSub.text)
                  : currentSub.text}
              </span>
            )}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
