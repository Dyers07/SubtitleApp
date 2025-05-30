// scripts/render.mjs
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function renderVideo(projectData, onProgress) {
  try {
    console.log('🎬 Starting Remotion render at 60 FPS...');
    console.log('📹 Video:', projectData.videoUrl);
    console.log('⚡ FPS:', projectData.fps || 60);
    console.log('📐 Dimensions:', `${projectData.width}x${projectData.height}`);
    console.log('⏱️  Duration:', `${projectData.videoDuration}s`);

    // Construire l'URL complète de la vidéo avec vérification
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    let sourceVideoUrl = projectData.videoUrl;
    if (!sourceVideoUrl.startsWith('http')) {
      sourceVideoUrl = `${baseUrl}${projectData.videoUrl}`;
    }
    console.log('🔗 Source video URL:', sourceVideoUrl);

    // Vérifier que la vidéo source est accessible
    try {
      console.log('🔍 Checking video source accessibility...');
      const videoCheck = await fetch(sourceVideoUrl, { method: 'HEAD' });
      if (!videoCheck.ok) {
        throw new Error(`Video source not accessible: ${videoCheck.status}`);
      }
      const videoSize = videoCheck.headers.get('content-length');
      console.log(`✅ Video source accessible (${videoSize ? Math.round(parseInt(videoSize) / 1024 / 1024 * 100) / 100 : 'unknown'} MB)`);
    } catch (videoError) {
      console.error('❌ Video source check failed:', videoError);
      throw new Error(`Cannot access video source: ${sourceVideoUrl}`);
    }

    // 1. Créer le dossier output
    const outputDir = path.join(__dirname, '..', 'public', 'output');
    await fs.mkdir(outputDir, { recursive: true });
    console.log('📁 Output directory ready');

    // 2. Bundle Remotion avec optimisations 60 FPS
    console.log('📦 Bundling Remotion with 60 FPS optimizations...');
    onProgress?.(0.05);
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '..', 'src', 'remotion', 'index.tsx'),
      webpackOverride: (config) => {
        return {
          ...config,
          resolve: {
            ...config.resolve,
            alias: {
              ...config.resolve.alias,
              '@': path.resolve(__dirname, '..', 'src'),
            },
          },
          optimization: {
            ...config.optimization,
            minimize: false,
          },
          module: {
            ...config.module,
            rules: [
              ...config.module.rules.filter(
                (rule) => !rule.test?.toString().includes('tsx?')
              ),
              {
                test: /\.tsx?$/,
                use: [
                  {
                    loader: 'esbuild-loader',
                    options: {
                      loader: 'tsx',
                      target: 'es2020',
                      jsx: 'automatic',
                    },
                  },
                ],
              },
            ],
          },
        };
      },
    });
    console.log('✅ Bundle created with 60 FPS optimizations');
    onProgress?.(0.1);

    // 3. Sélectionner la composition avec 60 FPS
    console.log('🎨 Selecting composition at 60 FPS...');
    const targetFPS = 60;
    const inputProps = {
      id: projectData.id,
      videoUrl: sourceVideoUrl,
      videoDuration: projectData.videoDuration,
      subtitles: projectData.subtitles,
      style: projectData.style,
      width: projectData.width,
      height: projectData.height,
      fps: targetFPS,
      brightness: projectData.brightness || 100,
      contrast: projectData.contrast || 100,
      saturation: projectData.saturation || 100,
    };
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CaptionedVideo',
      inputProps,
    });
    console.log('✅ Composition selected at 60 FPS');
    onProgress?.(0.15);

    // 4. Ajuster la composition pour 60 FPS
    const durationInFrames = Math.floor(projectData.videoDuration * targetFPS);
    const adjustedComposition = {
      ...composition,
      width: projectData.width,
      height: projectData.height,
      fps: targetFPS,
      durationInFrames,
    };
    console.log(`🎞️  Render setup: ${durationInFrames} frames at ${targetFPS}fps (60 FPS mode)`);

    // 5. Rendu optimisé pour 60 FPS
    const outputPath = path.join(outputDir, `${projectData.id}-60fps.mp4`);
    console.log('🚀 Starting 60 FPS render to:', outputPath);
    console.log('🔍 Input props for 60 FPS render:', {
      videoUrl: inputProps.videoUrl,
      subtitlesCount: inputProps.subtitles?.length || 0,
      duration: inputProps.videoDuration,
      dimensions: `${inputProps.width}x${inputProps.height}`,
      fps: inputProps.fps,
    });
    let lastReportedProgress = 0;
    await renderMedia({
      composition: adjustedComposition,
      serveUrl: bundleLocation,
      outputLocation: outputPath,
      inputProps,
      codec: 'h264',
      crf: 12,
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
      audioBitrate: '320k',
      concurrency: 2,
      overwrite: true,
      ffmpegOverride: ({ args }) => {
        const optimizedArgs = [
          ...args.filter(arg =>
            !arg.includes('-preset') &&
            !arg.includes('-tune') &&
            !arg.includes('-x264opts')
          ),
          '-preset', 'medium',
          '-tune', 'film',
          '-x264opts', 'me=hex:subme=8:ref=3:bframes=3:b-adapt=2:direct=auto:analyse=all:trellis=2:no-fast-pskip=1',
          '-g', '120',
          '-keyint_min', '60',
          '-sc_threshold', '40',
          '-maxrate', '8M',
          '-bufsize', '16M',
          '-movflags', '+faststart+frag_keyframe+separate_moof+omit_tfhd_offset',
          '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=60',
          '-af', 'aresample=async=1',
        ];
        console.log('🔧 FFmpeg optimized for 60 FPS with args:', optimizedArgs.slice(-10));
        return optimizedArgs;
      },
      onProgress: ({ progress }) => {
        const percent = Math.round(progress * 100);
        if (percent !== lastReportedProgress && (percent % 5 === 0 || percent > 95)) {
          console.log(`🎬 60 FPS Render: ${percent}%`);
          lastReportedProgress = percent;
        }
        const adjustedProgress = 0.15 + (progress * 0.85);
        onProgress?.(adjustedProgress);
      },
      verbose: true,
      logLevel: 'info',
      timeoutInMilliseconds: 300000,
    });

    // 6. Vérification du fichier de sortie 60 FPS
    console.log('🔍 Checking 60 FPS output file...');
    try {
      const stats = await fs.stat(outputPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`✅ 60 FPS Output file: ${sizeMB}MB`);
      if (stats.size < 500000) {
        throw new Error(`Le fichier 60 FPS est trop petit (${sizeMB}MB)`);
      }
      console.log('🔍 Verifying 60 FPS metadata...');
    } catch (statError) {
      console.error('❌ 60 FPS output file check failed:', statError);
      throw new Error('Impossible de vérifier le fichier 60 FPS');
    }

    onProgress?.(1);
    console.log('🎉 60 FPS Render completed successfully!');
    return `/output/${projectData.id}-60fps.mp4`;
  } catch (error) {
    console.error('💥 60 FPS Render error:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

// CLI execution
if (process.argv[2]) {
  const projectData = JSON.parse(process.argv[2]);
  console.log('🚀 CLI: Starting 60 FPS render...');
  renderVideo(projectData, (progress) => {
    const percent = Math.round(progress * 100);
    if (percent % 10 === 0) {
      console.log(`CLI 60 FPS Progress: ${percent}%`);
    }
  })
    .then((url) => {
      console.log('✅ CLI 60 FPS Success:', url);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ CLI 60 FPS Error:', err.message);
      process.exit(1);
    });
}
