import React from 'react';
import { registerRoot, Composition } from 'remotion';
import { CaptionedVideo } from './CaptionedVideo';
import { defaultSubtitleStyle } from '../types';

export const RemotionVideo: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo as any}
        durationInFrames={30 * 60} // Sera remplacé dynamiquement
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Vidéo de test
          subtitles: [
            {
              id: '1',
              text: 'Voici un exemple',
              start: 0,
              end: 2,
              words: [
                { text: 'Voici', start: 0, end: 0.5, confidence: 1 },
                { text: 'un', start: 0.5, end: 1, confidence: 1 },
                { text: 'exemple', start: 1, end: 2, confidence: 1 },
              ]
            },
            {
              id: '2',
              text: 'de sous-titres animés',
              start: 2,
              end: 4,
              words: [
                { text: 'de', start: 2, end: 2.3, confidence: 1 },
                { text: 'sous-titres', start: 2.3, end: 3, confidence: 1 },
                { text: 'animés', start: 3, end: 4, confidence: 1 },
              ]
            }
          ],
          style: defaultSubtitleStyle,
        }}
      />
    </>
  );
};

registerRoot(RemotionVideo);