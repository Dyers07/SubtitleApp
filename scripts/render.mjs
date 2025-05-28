import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function renderVideo(projectData) {
  try {
    console.log('Starting Remotion render...');
    console.log('Video FPS:', projectData.fps);
    
    // Créer le dossier output s'il n'existe pas
    const outputDir = path.join(__dirname, '..', 'public', 'output');
    await fs.mkdir(outputDir, { recursive: true });

    // Bundle Remotion
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '..', 'src', 'remotion', 'index.tsx'),
      webpackOverride: (config) => ({
        ...config,
        module: {
          ...config.module,
          rules: [
            ...config.module.rules.filter(rule => !rule.test?.toString().includes('tsx?')),
            {
              test: /\.tsx?$/,
              use: [
                {
                  loader: 'esbuild-loader',
                  options: {
                    loader: 'tsx',
                    target: 'es2015',
                  },
                },
              ],
            },
          ],
        },
      }),
    });

    // Sélectionner la composition
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CaptionedVideo',
      inputProps: {
        videoUrl: projectData.videoUrl,
        subtitles: projectData.subtitles,
        style: projectData.style,
      },
    });

    // Ajuster la composition avec les dimensions et FPS de la vidéo
    const adjustedComposition = {
      ...composition,
      width: projectData.width,
      height: projectData.height,
      fps: projectData.fps, // Utiliser le FPS de la vidéo source
      durationInFrames: Math.floor(projectData.videoDuration * projectData.fps),
    };

    // Rendre la vidéo
    const outputPath = path.join(outputDir, `${projectData.id}.mp4`);
    
    await renderMedia({
      composition: adjustedComposition,
      serveUrl: bundleLocation,
      outputLocation: outputPath,
      codec: 'h264',
      // Paramètres de qualité pour éviter les freezes
      videoBitrate: '8M',
      encodingBufferSize: 10000,
      encodingMaxRate: '10M',
      crf: 18, // Qualité élevée
      pixelFormat: 'yuv420p',
      inputProps: {
        videoUrl: projectData.videoUrl,
        subtitles: projectData.subtitles,
        style: projectData.style,
      },
      onProgress: ({ progress }) => {
        console.log(`Render progress: ${Math.round(progress * 100)}%`);
      },
    });

    console.log('Render complete:', outputPath);
    return `/output/${projectData.id}.mp4`;
    
  } catch (error) {
    console.error('Render error:', error);
    throw error;
  }
}

// Si appelé directement depuis la ligne de commande
if (process.argv[2]) {
  const projectData = JSON.parse(process.argv[2]);
  renderVideo(projectData)
    .then(url => console.log('Success:', url))
    .catch(err => {
      console.error('Error:', err);
      process.exit(1);
    });
}