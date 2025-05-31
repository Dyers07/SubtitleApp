// scripts/render-optimized.mjs - RENDU MULTI-CŒURS OPTIMISÉ
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Configuration optimisée pour performances
const RENDER_CONFIG = {
  concurrency: Math.min(Math.max(1, os.cpus().length - 1), 8),
  crf: 15,
  codec: 'h264',
  pixelFormat: 'yuv420p',
  audioCodec: 'aac',
  audioBitrate: '256k',
  timeoutInMilliseconds: 600000,
  enableMultiprocessOnLinux: true,
  chromiumOptions: {
    gl: 'angle',
    ignoreCertificateErrors: true,
  },
};

export async function renderVideoOptimized(projectData, onProgress) {
  const startTime = Date.now();

  try {
    console.log('🚀 RENDU OPTIMISÉ DÉMARRÉ');
    console.log(`🏭 CPU cores: ${RENDER_CONFIG.concurrency}`);
    console.log(`📹 Vidéo: ${projectData.videoUrl}`);
    console.log(`📐 Dimensions: ${projectData.width}x${projectData.height}, FPS: ${projectData.fps || 60}`);
    console.log(`⏱️  Durée: ${projectData.videoDuration}s`);

    // 1. Préparation vidéo
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    let sourceVideoUrl = projectData.videoUrl;
    if (!sourceVideoUrl.startsWith('http')) {
      sourceVideoUrl = `${baseUrl}${projectData.videoUrl}`;
    }
    console.log('🔗 URL source vidéo:', sourceVideoUrl);

    // HEAD pour vérifier accessibilité
    console.log('🔍 Vérification accessibilité vidéo...');
    const videoCheck = await fetch(sourceVideoUrl, { method: 'HEAD' });
    if (!videoCheck.ok) {
      throw new Error(`Vidéo inaccessible: ${videoCheck.status}`);
    }
    const sizeHeader = videoCheck.headers.get('content-length');
    const sizeMB = sizeHeader
      ? Math.round((parseInt(sizeHeader) / 1024 / 1024) * 100) / 100
      : 'inconnue';
    console.log(`✅ Vidéo accessible (${sizeMB} MB)`);
    onProgress?.(0.05);

    // 2. Créer dossier de sortie
    const outputDir = path.join(__dirname, '..', 'public', 'output');
    await fs.mkdir(outputDir, { recursive: true });
    console.log('📁 Dossier de sortie prêt');

    // 3. Bundle Webpack Remotion
    console.log('📦 Bundle avec optimisations multi-cœurs...');
    onProgress?.(0.1);

    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '..', 'src', 'remotion', 'index.tsx'),
      webpackOverride: (config) => {
        return {
          ...config,
          output: {
            filename: 'bundle.js',
            chunkFilename: 'unused-[contenthash].js',
          },
          resolve: {
            ...config.resolve,
            alias: {
              ...config.resolve.alias,
              '@': path.resolve(__dirname, '..', 'src'),
            },
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
                      minify: false,
                      keepNames: true,
                    },
                  },
                ],
              },
            ],
          },
          optimization: {
            ...config.optimization,
            minimize: false,
            splitChunks: false,
          },
          cache: {
            type: 'filesystem',
            buildDependencies: {
              config: [__filename],
            },
          },
        };
      },
    });

    console.log('✅ Bundle créé avec optimisations');
    onProgress?.(0.15);

    // 4. Sélection de la composition
    console.log('🎨 Sélection de la composition…');
    const inputProps = {
      id: projectData.id,
      videoUrl: sourceVideoUrl,
      videoDuration: projectData.videoDuration,
      subtitles: projectData.subtitles,
      style: {
        ...projectData.style,
        animationDuration: Math.max(0.08, projectData.style.animationDuration || 0.12),
      },
      width: projectData.width,
      height: projectData.height,
      fps: 60,
      brightness: projectData.brightness || 100,
      contrast: projectData.contrast || 100,
      saturation: projectData.saturation || 100,
    };

    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: 'CaptionedVideo',
      inputProps,
    });

    console.log('✅ Composition sélectionnée');
    onProgress?.(0.2);

    // 5. Config finale du rendu
    const targetFPS = 60;
    const durationInFrames = Math.floor(projectData.videoDuration * targetFPS);
    const optimizedComposition = {
      ...composition,
      width: projectData.width,
      height: projectData.height,
      fps: targetFPS,
      durationInFrames,
    };

    console.log(`🎞️ Configuration finale: ${durationInFrames} frames à ${targetFPS}fps`);
    console.log(`🔧 Concurrence: ${RENDER_CONFIG.concurrency} threads`);

    // 6. Lancer le rendu
    const outputPath = path.join(outputDir, `${projectData.id}-optimized-60fps.mp4`);
    console.log('🚀 DÉMARRAGE RENDU MULTI-CŒURS:', outputPath);

    await renderMedia({
      composition: optimizedComposition,
      serveUrl: bundleLocation,
      outputLocation: outputPath,
      inputProps,

      // Configuration vidéo/codec
      codec: RENDER_CONFIG.codec,
      crf: RENDER_CONFIG.crf,
      pixelFormat: RENDER_CONFIG.pixelFormat,
      audioCodec: RENDER_CONFIG.audioCodec,
      audioBitrate: RENDER_CONFIG.audioBitrate,

      // Concurrence
      concurrency: RENDER_CONFIG.concurrency,

      // Options pour Chromium
      enableMultiprocessOnLinux: RENDER_CONFIG.enableMultiprocessOnLinux,
      chromiumOptions: RENDER_CONFIG.chromiumOptions,

      // On réduit la verbosité : pas d’info à chaque étape
      logLevel: 'error',

      timeoutInMilliseconds: RENDER_CONFIG.timeoutInMilliseconds,
      overwrite: true,
      verbose: false,

      // (Facultatif) Vous pouvez laisser ffmpegOverride vide ou le supprimer si la vidéo est déjà optimisée
      // ffmpegOverride: () => { ... },

      onProgress: ({ progress }) => {
        const percent = Math.round(progress * 100);
        const elapsed = Date.now() - startTime;
        if (progress > 0.1) {
          const estimated = (elapsed / progress) * (1 - progress);
          const remaining = Math.round(estimated / 1000);
          if (percent % 10 === 0) {
            console.log(`🎬 ${percent}% | ETA: ${remaining}s`);
          }
        }
        onProgress?.(0.2 + progress * 0.75);
      },
    });

    // 7. Vérification finale
    console.log('🔍 Vérification du fichier optimisé…');
    const stats = await fs.stat(outputPath);
    const finalSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ RENDU TERMINÉ ! 📁 Taille: ${finalSizeMB} MB – ⏱️ Temps: ${totalTime}s`);

    if (stats.size < 500000) {
      throw new Error(`Fichier trop petit (${finalSizeMB} MB) – possible erreur de rendu`);
    }

    return `/output/${projectData.id}-optimized-60fps.mp4`;
  } catch (err) {
    const errorTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`💥 ERREUR RENDU (${errorTime}s):`, err.message);
    console.error(`🖥️  Système: ${os.platform()} ${os.arch()} – RAM: ${Math.round(os.totalmem()/1024/1024/1024)} GB – CPU: ${os.cpus().length} cores`);
    throw err;
  }
}

// CLI
if (process.argv[2]) {
  const projectData = JSON.parse(process.argv[2]);
  renderVideoOptimized(projectData, (p) => {
    const pct = Math.round(p * 100);
    if (pct % 10 === 0) {
      console.log(`Progression: ${pct}%`);
    }
  })
    .then((url) => {
      console.log('✅ Succès:', url);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Erreur:', err.message);
      process.exit(1);
    });
}
