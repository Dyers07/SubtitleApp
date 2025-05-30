// src/remotion/Root.tsx
import React from 'react';
import { Composition } from 'remotion';
import { CaptionedVideo } from './CaptionedVideo';
import { defaultSubtitleStyle } from '@/types';

// Wrapper optimisé pour 60 FPS
const CaptionedVideoWrapper: React.FC<any> = (props) => {
  return <CaptionedVideo {...props} />;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideoWrapper}
        durationInFrames={60 * 60} // 60 secondes à 60 fps
        fps={60} // 🎯 60 FPS fixé
        width={1080}
        height={1920}
        defaultProps={{
          id: 'default',
          videoUrl: '',
          videoDuration: 60,
          subtitles: [],
          style: {
            ...defaultSubtitleStyle,
            // 🚀 Optimisations animations 60 FPS
            animationDuration: 0.15, // Plus rapide à 60 FPS
          },
          width: 1080,
          height: 1920,
          fps: 60, // 🎯 CORRECTION: 60 FPS cohérent
          // Props pour effets visuels
          brightness: 100,
          contrast: 100,
          saturation: 100,
        }}
      />
    </>
  );
};