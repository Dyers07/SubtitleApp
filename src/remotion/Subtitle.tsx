import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { SubtitleStyle } from '@/types';

interface SubtitleProps {
  text: string;
  style: SubtitleStyle;
  startFrame: number;
  endFrame: number;
  fps: number;
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text,
  style,
  startFrame,
  endFrame,
  fps,
}) => {
  const frame = useCurrentFrame();
  const duration = endFrame - startFrame;
  const animDurationFrames = style.animationDuration * fps;

  // Calculer l'opacité pour les animations d'entrée/sortie
  let opacity = 1;
  let translateY = 0;
  let scale = 1;

  // Animation d'entrée
  if (frame < startFrame + animDurationFrames) {
    const progress = interpolate(
      frame,
      [startFrame, startFrame + animDurationFrames],
      [0, 1]
    );

    switch (style.animationIn) {
      case 'fade':
        opacity = progress;
        break;
      case 'slide-up':
        opacity = progress;
        translateY = interpolate(progress, [0, 1], [50, 0]);
        break;
      case 'slide-down':
        opacity = progress;
        translateY = interpolate(progress, [0, 1], [-50, 0]);
        break;
      case 'scale':
        opacity = progress;
        scale = interpolate(progress, [0, 1], [0.5, 1]);
        break;
      case 'typewriter':
        // Pour l'effet typewriter, on affiche progressivement les caractères
        const charCount = Math.floor(text.length * progress);
        text = text.substring(0, charCount);
        break;
    }
  }
  
  // Animation de sortie
  else if (frame > endFrame - animDurationFrames) {
    const progress = interpolate(
      frame,
      [endFrame - animDurationFrames, endFrame],
      [1, 0]
    );

    switch (style.animationOut) {
      case 'fade':
        opacity = progress;
        break;
      case 'slide-up':
        opacity = progress;
        translateY = interpolate(progress, [1, 0], [0, -50]);
        break;
      case 'slide-down':
        opacity = progress;
        translateY = interpolate(progress, [1, 0], [0, 50]);
        break;
      case 'scale':
        opacity = progress;
        scale = interpolate(progress, [1, 0], [1, 0.5]);
        break;
    }
  }

  // Position Y basée sur le style
  let positionY = '85%';
  if (style.position === 'top') {
    positionY = '15%';
  } else if (style.position === 'middle') {
    positionY = '50%';
  }

  // Styles CSS
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: positionY,
    transform: `translate(-50%, -50%) translateY(${translateY + style.offsetY}px) scale(${scale})`,
    opacity,
    maxWidth: '80%',
    textAlign: 'center',
    zIndex: 10,
  };

  const textStyle: React.CSSProperties = {
    fontSize: `${style.fontSize}px`,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    textTransform: style.textTransform as any,
    color: style.color,
    backgroundColor: `${style.backgroundColor}${Math.floor(style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
    padding: `${style.padding}px ${style.padding * 1.5}px`,
    borderRadius: `${style.borderRadius}px`,
    display: 'inline-block',
    lineHeight: 1.4,
    ...(style.shadowEnabled && {
      textShadow: `0 0 ${style.shadowBlur}px ${style.shadowColor}`,
      boxShadow: `0 2px ${style.shadowBlur}px ${style.shadowColor}`,
    }),
    ...(style.neonEnabled && {
      textShadow: `
        0 0 ${style.neonIntensity}px ${style.neonColor},
        0 0 ${style.neonIntensity * 2}px ${style.neonColor},
        0 0 ${style.neonIntensity * 3}px ${style.neonColor},
        0 0 ${style.neonIntensity * 4}px ${style.neonColor}
      `,
      filter: `brightness(1.2) contrast(1.2)`,
    }),
  };

  // Ajouter des emojis si activé
  let displayText = text;
  if (style.autoEmojis) {
    displayText = addEmojis(text);
  }

  if (frame < startFrame || frame > endFrame) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <span style={textStyle}>{displayText}</span>
    </div>
  );
};

// Fonction pour ajouter des emojis automatiquement
function addEmojis(text: string): string {
  const emojiMap: { [key: string]: string } = {
    'heureux': '😊',
    'happy': '😊',
    'triste': '😢',
    'sad': '😢',
    'amour': '❤️',
    'love': '❤️',
    'rire': '😂',
    'laugh': '😂',
    'wow': '😮',
    'super': '🎉',
    'merci': '🙏',
    'thanks': '🙏',
    'question': '❓',
    'idée': '💡',
    'idea': '💡',
    'attention': '⚠️',
    'warning': '⚠️',
    'bravo': '👏',
    'musique': '🎵',
    'music': '🎵',
  };

  let result = text;
  Object.entries(emojiMap).forEach(([word, emoji]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, `$& ${emoji}`);
  });

  return result;
}
