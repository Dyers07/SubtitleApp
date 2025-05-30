// src/remotion/CaptionedVideo.tsx - CORRIGÉ pour éviter les erreurs de rendu
import React from 'react';
import {
  AbsoluteFill,
  Video,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { Subtitle, SubtitleStyle } from '@/types';

export interface CaptionedVideoProps {
  id: string;
  videoUrl: string;
  videoDuration: number;
  subtitles: Subtitle[];
  style: SubtitleStyle;
  width: number;
  height: number;
  fps: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  videoUrl,
  subtitles,
  style,
  brightness = 100,
  contrast = 100,
  saturation = 100,
}): React.ReactElement => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const currentSub = subtitles.find(
    (sub) => currentTime >= sub.start && currentTime <= sub.end
  );

  const getVideoStyle = (): React.CSSProperties => {
    return {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
    };
  };

  const getPositionStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 20px',
      zIndex: 10,
    };

    const yPercent = style.offsetY || 50;
    
    switch (style.position) {
      case 'top':
        return { 
          ...base, 
          top: `${yPercent}%`,
        };
      case 'middle':
        return {
          ...base,
          top: '50%',
          transform: `translateY(-50%) translateY(${(yPercent - 50) * 2}%)`,
        };
      default:
        return { 
          ...base, 
          bottom: `${100 - yPercent}%`,
        };
    }
  };

  // 🚀 Animation ultra-fluide optimisée pour 60 FPS
  const getWordAnimation = (wordStartFrame: number, wordEndFrame: number, animationType: SubtitleStyle['wordHighlight']) => {
    const isActive = frame >= wordStartFrame && frame <= wordEndFrame;
    
    if (!isActive || !style.animation) {
      return {
        opacity: style.animation ? 0.82 : 1,
        transform: 'scale(1)',
        filter: 'none',
      };
    }

    const springConfig = {
      damping: 12,
      stiffness: 200,
      mass: 0.5,
    };

    const springValue = spring({
      frame: Math.max(0, frame - wordStartFrame),
      fps,
      config: springConfig,
    });

    const animSpeed = style.animationDuration || 0.15;
    const speedFrames = Math.max(6, Math.floor(animSpeed * fps));

    const progress = interpolate(
      frame,
      [wordStartFrame, wordStartFrame + speedFrames],
      [0, 1],
      {
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      }
    );

    switch (animationType) {
      case 'zoom':
        return {
          opacity: 1,
          transform: `scale(${1 + springValue * 0.08})`,
          filter: 'none',
          marginLeft: `${(style.wordSpacing || 0.12) + springValue * 0.02}em`,
          marginRight: `${(style.wordSpacing || 0.12) + springValue * 0.02}em`,
        };
      
      case 'bounce':
        const bounceY = Math.sin(springValue * Math.PI * 2) * 3 * (1 - springValue);
        return {
          opacity: 1,
          transform: `translateY(${-bounceY}px) scale(${1 + springValue * 0.06})`,
          filter: 'none',
        };
      
      case 'slide':
        return {
          opacity: progress,
          transform: `translateY(${interpolate(progress, [0, 1], [12, 0])}px) scale(${0.96 + progress * 0.04})`,
          filter: 'none',
        };
      
      case 'glow':
        return {
          opacity: 1,
          transform: 'scale(1.02)',
          filter: `brightness(${100 + springValue * 20}%) drop-shadow(0 0 8px ${style.wordBackgroundColor || '#FF6B35'})`,
        };
      
      case 'pulse':
        const pulseScale = 1 + Math.sin(frame * 0.3) * 0.04;
        return {
          opacity: 0.96 + Math.sin(frame * 0.3) * 0.04,
          transform: `scale(${pulseScale})`,
          filter: 'none',
        };

      case 'rainbow':
        const hue = (frame * 4) % 360;
        return {
          opacity: 1,
          transform: `scale(${1 + springValue * 0.04})`,
          backgroundImage: `linear-gradient(45deg, hsl(${hue}, 75%, 65%), hsl(${hue + 120}, 75%, 65%), hsl(${hue + 240}, 75%, 65%))`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'none',
        };
      
      default:
        return {
          opacity: 1,
          transform: `scale(${1 + springValue * 0.08})`,
          filter: 'none',
        };
    }
  };

  const getTextStyle = (isActive: boolean, word?: any, wordStartFrame?: number, wordEndFrame?: number): React.CSSProperties => {
    const textStyle: React.CSSProperties = {
      display: 'inline-block',
      color: style.color || '#FFFFFF',
      fontSize: `${style.fontSize || 36}px`,
      fontFamily: style.fontFamily || 'Arial',
      lineHeight: style.lineHeight || 1.4,
      fontWeight: style.fontWeight || 'bold',
      textTransform: style.textTransform || 'none',
      marginRight: `${Math.max(0.15, (style.wordSpacing || 0.12) * 2)}em`,
      transition: 'all 0.06s cubic-bezier(0.23, 1, 0.32, 1)',
    };

    // 🚀 Application des animations optimisées
    if (isActive && style.animation && wordStartFrame && wordEndFrame) {
      const animation = getWordAnimation(wordStartFrame, wordEndFrame, style.wordHighlight || 'zoom');
      
      if (animation.opacity !== undefined) textStyle.opacity = animation.opacity;
      if (animation.transform !== undefined) textStyle.transform = animation.transform;
      if (animation.filter !== undefined) textStyle.filter = animation.filter;
      if (animation.marginLeft !== undefined) textStyle.marginLeft = animation.marginLeft;
      if (animation.marginRight !== undefined) textStyle.marginRight = animation.marginRight;
      
      // 🎯 Propriétés background spéciales pour rainbow
      if (style.wordHighlight === 'rainbow' && animation.backgroundImage) {
        const rainbowStyle = {
          backgroundImage: animation.backgroundImage,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        };
        Object.assign(textStyle, rainbowStyle);
        delete textStyle.color;
      } else {
        switch (style.wordHighlight) {
          case 'background':
            textStyle.backgroundColor = style.wordBackgroundColor || '#FF6B35';
            textStyle.color = '#FFFFFF';
            textStyle.padding = '4px 10px';
            textStyle.borderRadius = '8px';
            textStyle.boxShadow = '0 3px 8px rgba(0,0,0,0.4)';
            break;
            
          case 'glow':
            textStyle.textShadow = `0 0 15px ${style.wordBackgroundColor || '#FF6B35'}, 0 0 25px ${style.wordBackgroundColor || '#FF6B35'}`;
            break;
        }
      }
    } else if (style.animation) {
      textStyle.opacity = 0.82;
      textStyle.transform = 'scale(1)';
    }

    // 🎯 Animation globale du texte
    if (style.textMovement && currentTime > 0) {
      const moveOffset = Math.sin(currentTime * 2.5) * 1.2;
      const currentTransform = textStyle.transform || 'scale(1)';
      textStyle.transform = `${currentTransform} translateY(${moveOffset}px)`;
    }

    // 🚀 Stroke (contour) avec support pixels
    if (style.strokeWeight && style.strokeWeight !== 'none') {
      const strokeSize = style.strokePixels 
        ? `${style.strokePixels}px`
        : (() => {
            const strokeSizes = {
              small: '3px',
              medium: '5px',
              large: '8px',
            };
            return strokeSizes[style.strokeWeight];
          })();
      
      textStyle.WebkitTextStroke = `${strokeSize} ${style.strokeColor || '#000000'}`;
      textStyle.paintOrder = 'stroke fill';
      
      const existingShadow = textStyle.textShadow || '';
      const strokeShadow = `0 0 6px ${style.strokeColor || '#000000'}`;
      textStyle.textShadow = existingShadow 
        ? `${existingShadow}, ${strokeShadow}`
        : strokeShadow;
    }

    // Highlight manuel par couleur
    if (word?.color && isActive) {
      const colorMap: Record<string, string> = {
        yellow: '#FFD700',
        green: '#32CD32',
        red: '#FF6B6B',
      };
      const highlightColor = colorMap[word.color as keyof typeof colorMap];
      if (highlightColor) {
        if (style.wordHighlight === 'background') {
          textStyle.backgroundColor = highlightColor;
        } else {
          textStyle.color = highlightColor;
          textStyle.textShadow = `0 0 12px ${highlightColor}`;
        }
      }
    }

    // Shadow avec intensité renforcée
    if (style.shadow && style.shadow !== 'none') {
      const shadowMap = {
        small: '2px 2px 4px rgba(0, 0, 0, 0.9)',
        medium: '3px 3px 8px rgba(0, 0, 0, 0.95)',
        large: '5px 5px 15px rgba(0, 0, 0, 1)',
      };
      const existingShadow = textStyle.textShadow || '';
      textStyle.textShadow = existingShadow 
        ? `${existingShadow}, ${shadowMap[style.shadow]}`
        : shadowMap[style.shadow];
    }

    return textStyle;
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!style.backgroundColor || 
        style.backgroundColor === 'transparent' || 
        style.backgroundOpacity === 0) {
      return {};
    }

    let bgColor = style.backgroundColor;
    
    if (bgColor.startsWith('#') && bgColor.length === 7) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      bgColor = `rgba(${r}, ${g}, ${b}, ${style.backgroundOpacity || 0})`;
    }

    return {
      backgroundColor: bgColor,
      padding: `${style.padding || 12}px ${(style.padding || 12) * 1.5}px`,
      borderRadius: `${style.borderRadius || 8}px`,
      display: 'inline-block',
      backdropFilter: 'blur(4px)',
    };
  };

  // 🎯 Traitement des émojis DIRECT (pas de service externe pour éviter les erreurs de rendu)
  const processText = (text: string): string => {
    let processedText = text;

    if (!style.punctuation) {
      processedText = processedText.replace(/[.,!?;:]/g, '');
    }

    if (style.autoEmojis) {
      // 🚀 Dictionnaire d'émojis intégré directement
      const emojiMap: Record<string, string> = {
        // Émotions de base
        'happy': '😊', 'heureux': '😀', 'content': '😊', 'joie': '😄',
        'sad': '😢', 'triste': '😢', 'malheureux': '😔', 'pleure': '😭',
        'love': '❤️', 'amour': '❤️', 'aimer': '💕', 'coeur': '💖',
        'laugh': '😂', 'rire': '😂', 'drôle': '🤣', 'mdr': '😆',
        'wow': '😮', 'incroyable': '😲', 'amazing': '🤩', 'surpris': '😯',
        
        // Actions et objets
        'super': '🎉', 'génial': '🎉', 'fantastique': '✨', 'excellent': '👌',
        'merci': '🙏', 'thanks': '🙏', 'thank': '🙏', 'gratitude': '🙏',  
        'question': '❓', 'pourquoi': '🤔', 'comment': '🤔', 'quoi': '❓',
        'idée': '💡', 'idea': '💡', 'penser': '💭', 'réflexion': '🧠',
        'attention': '⚠️', 'warning': '⚠️', 'danger': '⚠️', 'alerte': '🚨',
        'bravo': '👏', 'félicitations': '🎊', 'congrats': '🎉', 'applaudir': '👏',
        
        // Nouveaux emojis tendance
        'fire': '🔥', 'feu': '🔥', 'hot': '🔥', 'chaud': '🔥',
        'cool': '😎', 'classe': '😎', 'stylé': '😎', 'swag': '😎',
        'money': '💰', 'argent': '💰', 'cash': '💵', 'riche': '💸',
        'strong': '💪', 'fort': '💪', 'muscle': '💪', 'puissant': '💪',
        'fast': '⚡', 'rapide': '⚡', 'speed': '💨', 'vite': '💨',
        'boom': '💥', 'explosion': '💥', 'bang': '💥', 'impact': '💥',
        
        // Réseaux sociaux
        'like': '👍', 'dislike': '👎', 'follow': '➕', 'share': '🔄',
        'viral': '📈', 'trending': '🔥', 'views': '👀', 'subscribers': '📊',
      };

      Object.entries(emojiMap).forEach(([word, emoji]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        processedText = processedText.replace(regex, `$& ${emoji}`);
      });
    }

    return processedText;
  };

  // 🎯 Animation des émojis si activée
  const getEmojiStyle = (): React.CSSProperties => {
    if (!style.emojiAnimation) {
      return { display: 'inline-block' };
    }

    // Animation de rotation légère pour les émojis
    const rotation = Math.sin(frame * 0.1) * 5;
    const scale = 1 + Math.sin(frame * 0.15) * 0.1;

    return {
      display: 'inline-block',
      transform: `rotate(${rotation}deg) scale(${scale})`,
      transformOrigin: 'center',
      marginLeft: '0.2em',
    };
  };

  // 🎯 Fonction pour séparer texte et émojis
  const separateTextAndEmojis = (text: string) => {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const parts = [];
    let lastIndex = 0;

    text.replace(emojiRegex, (match, index) => {
      if (index > lastIndex) {
        parts.push({ type: 'text', content: text.slice(lastIndex, index) });
      }
      parts.push({ type: 'emoji', content: match });
      lastIndex = index + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.slice(lastIndex) });
    }

    return parts;
  };

  return (
    <AbsoluteFill>
      {/* Vidéo de fond */}
      {videoUrl ? (
        <Video
          src={videoUrl}
          style={getVideoStyle()}
          volume={1}
          muted={false}
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
            <p>❌ Aucune vidéo chargée</p>
            <p style={{ fontSize: '16px', opacity: 0.7 }}>
              URL: {videoUrl || 'undefined'}
            </p>
          </div>
        </AbsoluteFill>
      )}

      {/* Sous-titres avec émojis animés */}
      {currentSub && (
        <div style={getPositionStyle()}>
          <div style={getBackgroundStyle()}>
            <div style={{ maxWidth: '90%', textAlign: 'center' }}>
              {currentSub.words && currentSub.words.length > 0 ? (
                currentSub.words.map((word, index) => {
                  const wordStartFrame = Math.floor(word.start * fps);
                  const wordEndFrame = Math.floor(word.end * fps);
                  const isWordActive = frame >= wordStartFrame && frame <= wordEndFrame;
                  
                  const processedText = processText(word.text);
                  const parts = separateTextAndEmojis(processedText);
                  
                  return (
                    <span key={`${currentSub.id}-word-${index}`}>
                      {parts.map((part, partIndex) => (
                        <span key={`part-${partIndex}`}>
                          {part.type === 'emoji' ? (
                            <span style={getEmojiStyle()}>
                              {part.content}
                            </span>
                          ) : (
                            <span style={getTextStyle(isWordActive, word, wordStartFrame, wordEndFrame)}>
                              {part.content}
                            </span>
                          )}
                        </span>
                      ))}
                    </span>
                  );
                })
              ) : (
                // Traitement des émojis pour les sous-titres sans granularité de mots
                (() => {
                  const processedText = processText(currentSub.text);
                  const parts = separateTextAndEmojis(processedText);
                  return parts.map((part, partIndex) => (
                    <span key={`fallback-part-${partIndex}`}>
                      {part.type === 'emoji' ? (
                        <span style={getEmojiStyle()}>
                          {part.content}
                        </span>
                      ) : (
                        <span style={getTextStyle(true)}>
                          {part.content}
                        </span>
                      )}
                    </span>
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};