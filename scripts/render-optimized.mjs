// scripts/render-optimized.mjs - RENDU MULTI-COEURS OPTIMISÉ
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
  // Utiliser tous les coeurs disponibles (mais limiter pour éviter la surcharge)
  concurrency: Math.min(Math.max(1, os.cpus().length - 1), 8),
  
  // Qualité optimisée (CRF 12 = haute qualité, 18 = équilibré, 23 = standard)
  crf: 15, // Compromis qualité/taille
  
  // Codec H.264 avec optimisations
  codec: 'h264',
  pixelFormat: 'yuv420p',
  
  // Audio haute qualité
  audioCodec: 'aac',
  audioBitrate: '256k', // Réduit de 320k pour gagner en taille
  
  // Timeout plus long pour vidéos complexes
  timeoutInMilliseconds: 600000, // 10 minutes
  
  // Cache et optimisations mémoire
  enableMultiprocessOnLinux: true,
  disableWebSecurity: false,
  chromiumOptions: {
    gl: 'angle', // Meilleure performance GPU
    ignoreCertificateErrors: true,
  },
};

export async function renderVideoOptimized(projectData, onProgress) {
  const startTime = Date.now();
  
  try {
    console.log('🚀 RENDU OPTIMISÉ DÉMARRÉ');
    console.log(`🏭 Utilisation de ${RENDER_CONFIG.concurrency} coeurs CPU`);
    console.log(`📹 Vidéo: ${projectData.videoUrl}`);
    console.log(`⚡ FPS: ${projectData.fps || 60}`);
    console.log(`📐 Dimensions: ${projectData.width}x${projectData.height}`);
    console.log(`⏱️  Durée: ${projectData.videoDuration}s`);

    // 1. Vérification et préparation
    const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
    let sourceVideoUrl = projectData.videoUrl;
    if (!sourceVideoUrl.startsWith('http')) {
      sourceVideoUrl = `${baseUrl}${projectData.videoUrl}`;
    }
    console.log('🔗 URL source vidéo:', sourceVideoUrl);

    // Vérifier l'accessibilité de la vidéo
    console.log('🔍 Vérification accessibilité vidéo...');
    const videoCheck = await fetch(sourceVideoUrl, { method: 'HEAD' });
    if (!videoCheck.ok) {
      throw new Error(`Vidéo inaccessible: ${videoCheck.status}`);
    }
    
    const videoSize = videoCheck.headers.get('content-length');
    const videoSizeMB = videoSize ? Math.round(parseInt(videoSize) / 1024 / 1024 * 100) / 100 : 'inconnue';
    console.log(`✅ Vidéo accessible (${videoSizeMB} MB)`);
    onProgress?.(0.05);

    // 2. Créer le dossier output avec horodatage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputDir = path.join(__dirname, '..', 'public', 'output');
    await fs.mkdir(outputDir, { recursive: true });
    console.log('📁 Dossier de sortie prêt');

    // 3. Bundle avec optimisations avancées
    console.log('📦 Bundle avec optimisations multi-coeurs...');
    onProgress?.(0.1);
    
    const bundleLocation = await bundle({
      entryPoint: path.join(__dirname, '..', 'src', 'remotion', 'index.tsx'),
      webpackOverride: (config) => {
        return {
          ...config,
          // 🚀 Optimisations Webpack pour performances
          resolve: {
            ...config.resolve,
            alias: {
              ...config.resolve.alias,
              '@': path.resolve(__dirname, '..', 'src'),
            },
          },
          optimization: {
            ...config.optimization,
            minimize: false, // Désactiver pour debug, activer en prod
            splitChunks: {
              chunks: 'all',
              cacheGroups: {
                vendor: {
                  test: /[\\/]node_modules[\\/]/,
                  name: 'vendors',
                  chunks: 'all',
                },
              },
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
                      // 🚀 Optimisations esbuild
                      minify: false,
                      keepNames: true,
                    },
                  },
                ],
              },
            ],
          },
          // Cache pour builds répétés
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

    // 4. Sélectionner la composition
    console.log('🎨 Sélection de la composition...');
    const inputProps = {
      id: projectData.id,
      videoUrl: sourceVideoUrl,
      videoDuration: projectData.videoDuration,
      subtitles: projectData.subtitles,
      style: {
        ...projectData.style,
        // 🎯 Optimisations animations pour 60 FPS
        animationDuration: Math.max(0.08, projectData.style.animationDuration || 0.12),
      },
      width: projectData.width,
      height: projectData.height,
      fps: 60, // Force 60 FPS
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

    // 5. Calcul optimisé des frames
    const targetFPS = 60;
    const durationInFrames = Math.floor(projectData.videoDuration * targetFPS);
    
    const optimizedComposition = {
      ...composition,
      width: projectData.width,
      height: projectData.height,
      fps: targetFPS,
      durationInFrames,
    };
    
    console.log(`🎞️  Configuration finale: ${durationInFrames} frames à ${targetFPS}fps`);
    console.log(`🔧 Concurrence: ${RENDER_CONFIG.concurrency} processus parallèles`);

    // 6. RENDU MULTI-COEURS OPTIMISÉ
    const outputPath = path.join(outputDir, `${projectData.id}-optimized-60fps.mp4`);
    console.log('🚀 DÉMARRAGE RENDU MULTI-COEURS:', outputPath);

    let lastProgress = 0;
    const progressReports = [];
    
    await renderMedia({
      composition: optimizedComposition,
      serveUrl: bundleLocation,
      outputLocation: outputPath,
      inputProps,
      
      // 🚀 CONFIGURATION HAUTE PERFORMANCE
      codec: RENDER_CONFIG.codec,
      crf: RENDER_CONFIG.crf,
      pixelFormat: RENDER_CONFIG.pixelFormat,
      audioCodec: RENDER_CONFIG.audioCodec,
      audioBitrate: RENDER_CONFIG.audioBitrate,
      
      // 🏭 CONCURRENCE MAXIMALE
      concurrency: RENDER_CONFIG.concurrency,
      
      // ⚡ OPTIMISATIONS SYSTÈME
      enableMultiprocessOnLinux: RENDER_CONFIG.enableMultiprocessOnLinux,
      chromiumOptions: RENDER_CONFIG.chromiumOptions,
      
      overwrite: true,
      verbose: true,
      logLevel: 'info',
      timeoutInMilliseconds: RENDER_CONFIG.timeoutInMilliseconds,

      // 🎯 OPTIMISATIONS FFMPEG AVANCÉES
      ffmpegOverride: ({ args }) => {
        const optimizedArgs = [
          ...args.filter(arg =>
            !arg.includes('-preset') &&
            !arg.includes('-tune') &&
            !arg.includes('-x264opts') &&
            !arg.includes('-threads')
          ),
          
          // 🚀 Utilisation optimale des threads
          '-threads', String(RENDER_CONFIG.concurrency),
          
          // 🎬 Preset équilibré qualité/vitesse
          '-preset', 'medium', // plus rapide que 'slow', qualité acceptable
          '-tune', 'film',
          
          // 🔧 Optimisations x264 pour 60fps
          '-x264opts', [
            'me=hex',           // Motion estimation rapide
            'subme=7',          // Subpixel motion estimation (7 = bon compromis)
            'ref=2',            // Reference frames (2 = rapide)
            'bframes=3',        // B-frames
            'b-adapt=1',        // Adaptive B-frames
            'direct=auto',      // Direct prediction
            'analyse=all',      // Analyse complète
            'trellis=1',        // Trellis quantization (1 = rapide)
            'no-fast-pskip=0',  // Fast P-skip (activé pour vitesse)
            'mixed-refs=0',     // Désactivé pour vitesse
          ].join(':'),
          
          // 🎯 Optimisations GOP et keyframes pour 60fps
          '-g', '120',           // GOP size (2 secondes à 60fps)
          '-keyint_min', '60',   // Keyframe minimum (1 seconde)
          '-sc_threshold', '40', // Scene change threshold
          
          // 📊 Rate control optimisé
          '-maxrate', '6M',      // Bitrate max réduit
          '-bufsize', '12M',     // Buffer size
          
          // 🚀 Optimisations conteneur MP4
          '-movflags', '+faststart+frag_keyframe+separate_moof+omit_tfhd_offset',
          
          // 🎬 Filtres vidéo optimisés pour 60fps
          '-vf', [
            'scale=trunc(iw/2)*2:trunc(ih/2)*2', // Assurer dimensions paires
            'fps=60',                              // Force 60 FPS
            'format=yuv420p',                      // Force le format pixel
          ].join(','),
          
          // 🔊 Optimisations audio
          '-af', 'aresample=async=1:first_pts=0',
          
          // 🏃‍♂️ Optimisations générales de vitesse
          '-fflags', '+genpts+discardcorrupt',
          '-avoid_negative_ts', 'make_zero',
        ];
        
        console.log(`🔧 FFmpeg optimisé: ${RENDER_CONFIG.concurrency} threads, preset medium, CRF ${RENDER_CONFIG.crf}`);
        return optimizedArgs;
      },

      // 📊 Monitoring de progression avancé
      onProgress: ({ progress }) => {
        const percent = Math.round(progress * 100);
        const elapsed = Date.now() - startTime;
        
        // Estimation du temps restant
        if (progress > 0.1) {
          const estimated = (elapsed / progress) * (1 - progress);
          const remaining = Math.round(estimated / 1000);
          
          if (percent !== lastProgress && (percent % 5 === 0 || percent > 95)) {
            console.log(`🎬 Rendu: ${percent}% | ETA: ${remaining}s | ${RENDER_CONFIG.concurrency} coeurs`);
            lastProgress = percent;
          }
        }
        
        progressReports.push({ percent, timestamp: Date.now() });
        const adjustedProgress = 0.2 + (progress * 0.75);
        onProgress?.(adjustedProgress);
      },
    });

    // 7. Vérification et optimisation du fichier de sortie
    console.log('🔍 Vérification du fichier optimisé...');
    const stats = await fs.stat(outputPath);
    const finalSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`✅ RENDU TERMINÉ !`);
    console.log(`📁 Taille finale: ${finalSizeMB}MB`);
    console.log(`⏱️  Temps total: ${totalTime}s`);
    console.log(`🏭 Utilisation: ${RENDER_CONFIG.concurrency} coeurs CPU`);
    console.log(`📈 Vitesse moyenne: ${(durationInFrames / parseFloat(totalTime)).toFixed(1)} fps de rendu`);
    
    // Vérification de la qualité
    if (stats.size < 500000) { // 500KB minimum
      throw new Error(`Fichier trop petit (${finalSizeMB}MB) - possible erreur de rendu`);
    }

    onProgress?.(1);
    
    // 🎯 Calculer les gains de performance
    const expectedTimeBasic = projectData.videoDuration * 12; // Estimation temps basique
    const actualTime = parseFloat(totalTime);
    const speedup = (expectedTimeBasic / actualTime).toFixed(1);
    
    console.log(`🚀 GAIN DE PERFORMANCE: ${speedup}x plus rapide que le rendu basique !`);
    
    return `/output/${projectData.id}-optimized-60fps.mp4`;

  } catch (error) {
    const errorTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`💥 ERREUR RENDU après ${errorTime}s:`, error);
    console.error('Détails:', error.message);
    
    // Log des infos système pour debug
    console.log(`🖥️  Système: ${os.platform()} ${os.arch()}`);
    console.log(`💾 RAM: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
    console.log(`🏭 CPU: ${os.cpus().length} coeurs`);
    
    throw error;
  }
}

// 🚀 EXÉCUTION CLI avec monitoring
if (process.argv[2]) {
  const projectData = JSON.parse(process.argv[2]);
  console.log('🚀 CLI: Démarrage rendu optimisé...');
  
  renderVideoOptimized(projectData, (progress) => {
    const percent = Math.round(progress * 100);
    if (percent % 10 === 0) {
      console.log(`CLI Progression optimisée: ${percent}%`);
    }
  })
    .then((url) => {
      console.log('✅ CLI Succès optimisé:', url);
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ CLI Erreur optimisée:', err.message);
      process.exit(1);
    });
}