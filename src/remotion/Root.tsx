import React from 'react';
import { Composition } from 'remotion';
import { CaptionedVideo } from './CaptionedVideo';
import { defaultSubtitleStyle } from '@/types';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo as any}
        durationInFrames={30 * 60} // 60 secondes à 30 fps par défaut
        fps={30}
        width={1080} // Format vertical TikTok
        height={1920}
        defaultProps={{
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          subtitles: [],
          style: defaultSubtitleStyle,
        }}
      />
    </>
  );
};