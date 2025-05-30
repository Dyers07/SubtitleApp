// src/app/api/render/route.ts - OPTIMISÉ avec choix de performance
import { NextRequest, NextResponse } from 'next/server';
import { renderVideo } from '../../../../scripts/render.mjs';
import { renderVideoOptimized } from '../../../../scripts/render-optimized.mjs';

// Cache pour éviter les rendus en double
const activeRenders = new Map<string, Promise<string>>();

// Configuration des modes de rendu
const RENDER_MODES = {
  standard: {
    name: 'Standard',
    description: '60 FPS, qualité élevée, temps normal',
    estimatedSpeedMultiplier: 1,
    func: renderVideo,
  },
  optimized: {
    name: 'Optimisé',
    description: '60 FPS, multi-coeurs, 3x plus rapide',
    estimatedSpeedMultiplier: 3,
    func: renderVideoOptimized,
  },
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Récupérer les données du projet
    const body = await req.json();
    const { renderMode = 'optimized', ...projectData } = body;
    
    // Validation du mode de rendu
    if (!RENDER_MODES[renderMode as keyof typeof RENDER_MODES]) {
      return NextResponse.json(
        { error: 'Mode de rendu invalide', availableModes: Object.keys(RENDER_MODES) },
        { status: 400 }
      );
    }
    
    const mode = RENDER_MODES[renderMode as keyof typeof RENDER_MODES];
    const projectKey = `${projectData.id}-${renderMode}`;
    
    console.log(`🚀 Démarrage rendu ${mode.name} pour:`, projectData.id);
    console.log(`📹 Vidéo:`, projectData.videoUrl);
    console.log(`⚡ Mode:`, mode.description);

    // 2. Vérifier si un rendu identique est en cours
    if (activeRenders.has(projectKey)) {
      console.log(`⏳ Rendu ${mode.name} déjà en cours, attente...`);
      const existingRender = activeRenders.get(projectKey)!;
      const downloadUrl = await existingRender;
      
      return NextResponse.json({ 
        success: true, 
        downloadUrl,
        progress: 100,
        renderMode: mode.name,
        renderTime: Date.now() - startTime,
      });
    }

    // 3. Estimation du temps de rendu
    const estimatedTime = Math.round(
      (projectData.videoDuration * 8) / mode.estimatedSpeedMultiplier
    );
    console.log(`⏱️  Temps estimé (${mode.name}): ${estimatedTime}s`);

    // 4. Démarrer le rendu avec monitoring avancé
    let progressData = {
      stage: 'starting',
      percent: 0,
      eta: estimatedTime,
      startTime,
    };

    const renderPromise = mode.func(projectData, (progress: number) => {
      const currentPercent = Math.round(progress * 100);
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Calcul ETA dynamique
      let eta = estimatedTime;
      if (progress > 0.1) {
        eta = Math.round((elapsed / progress) * (1 - progress));
      }
      
      progressData = {
        stage: getStageFromProgress(progress),
        percent: currentPercent,
        eta,
        startTime,
      };
      
      // Log périodique pour monitoring
      if (currentPercent % 25 === 0 || currentPercent > 95) {
        console.log(`🎬 ${mode.name} - ${currentPercent}% | ETA: ${eta}s`);
      }
    });

    // 5. Stocker la promesse pour éviter les doublons
    activeRenders.set(projectKey, renderPromise);

    // 6. Attendre le rendu
    const downloadUrl = await renderPromise;
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    
    console.log(`✅ Rendu ${mode.name} terminé:`, downloadUrl);
    console.log(`⏱️  Temps réel: ${totalTime}s (estimé: ${estimatedTime}s)`);
    
    // Calculer le gain de performance
    const efficiency = estimatedTime > 0 ? (estimatedTime / totalTime).toFixed(1) : '1.0';
    console.log(`🚀 Efficacité: ${efficiency}x ${totalTime < estimatedTime ? 'plus rapide' : 'que prévu'}`);

    // 7. Nettoyer le cache
    activeRenders.delete(projectKey);

    // 8. Réponse avec métriques détaillées
    return NextResponse.json({ 
      success: true, 
      downloadUrl,
      progress: 100,
      renderMode: mode.name,
      renderTime: totalTime,
      estimatedTime,
      efficiency: parseFloat(efficiency),
      projectId: projectData.id,
      specs: {
        fps: 60,
        resolution: `${projectData.width}x${projectData.height}`,
        duration: `${projectData.videoDuration}s`,
        subtitles: projectData.subtitles?.length || 0,
        effects: {
          brightness: projectData.brightness || 100,
          contrast: projectData.contrast || 100,
          saturation: projectData.saturation || 100,
        }
      },
      metadata: {
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
      }
    });
    
  } catch (err) {
    const errorTime = Math.round((Date.now() - startTime) / 1000);
    console.error(`💥 Erreur rendu après ${errorTime}s:`, err);
    
    // Nettoyer le cache en cas d'erreur
    const body = await req.json().catch(() => ({ id: 'unknown' }));
    const projectKey = `${body.id}-${body.renderMode || 'optimized'}`;
    activeRenders.delete(projectKey);
    
    // Détails d'erreur pour debugging
    const errorDetails = {
      message: err instanceof Error ? err.message : 'Erreur inconnue',
      duration: errorTime,
      projectId: body.id,
      renderMode: body.renderMode || 'optimized',
      timestamp: new Date().toISOString(),
    };
    
    console.error('🔍 Détails erreur:', errorDetails);
    
    return NextResponse.json(
      {
        success: false,
        error: errorDetails.message,
        details: errorDetails,
        progress: 0,
        helpMessage: 'Vérifiez que la vidéo source est accessible et que le serveur a suffisamment de ressources.',
        availableModes: Object.keys(RENDER_MODES),
      },
      { status: 500 }
    );
  }
}

// 🎯 Fonction utilitaire pour déterminer l'étape de rendu
function getStageFromProgress(progress: number): string {
  if (progress < 0.05) return 'Initialisation';
  if (progress < 0.15) return 'Bundle Remotion';
  if (progress < 0.2) return 'Préparation composition';
  if (progress < 0.8) return 'Rendu vidéo';
  if (progress < 0.95) return 'Finalisation';
  return 'Terminé';
}

// 🚀 Route GET pour obtenir les modes de rendu disponibles
export async function GET() {
  return NextResponse.json({
    success: true,
    availableModes: Object.entries(RENDER_MODES).map(([key, mode]) => ({
      id: key,
      name: mode.name,
      description: mode.description,
      speedMultiplier: mode.estimatedSpeedMultiplier,
      recommended: key === 'optimized',
    })),
    systemInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      cpuCores: require('os').cpus().length,
      totalMemory: Math.round(require('os').totalmem() / 1024 / 1024 / 1024) + 'GB',
    },
    defaultMode: 'optimized',
  });
}