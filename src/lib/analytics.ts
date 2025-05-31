// src/lib/analytics.ts - Système de monitoring avancé
import { supabase } from './supabase';

interface PerformanceMetrics {
  renderTime: number;
  renderMode: 'standard' | 'optimized';
  videoLength: number;
  subtitleCount: number;
  efficiency: number;
  errorRate: number;
  userDevice: string;
  connectionSpeed: string;
}

interface UserEvent {
  event: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  properties: Record<string, any>;
  page: string;
  userAgent: string;
}

interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  activeRenders: number;
  cacheHitRate: number;
  apiResponseTime: number;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private eventQueue: UserEvent[] = [];
  private isOnline: boolean = true;
  private performanceMetrics: PerformanceMetrics[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initNetworkDetection();
    this.startPerformanceMonitoring();
    this.flushQueuePeriodically();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // 🚀 Tracking des événements utilisateur
  track(event: string, properties: Record<string, any> = {}, userId?: string): void {
    const userEvent: UserEvent = {
      event,
      timestamp: Date.now(),
      userId,
      sessionId: this.sessionId,
      properties: {
        ...properties,
        // Données contextuelles automatiques
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onlineStatus: this.isOnline,
      },
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    // Ajouter à la queue
    this.eventQueue.push(userEvent);
    
    // Flush immédiat pour événements critiques
    if (this.isCriticalEvent(event)) {
      this.flushQueue();
    }

    console.log(`📊 Event tracked: ${event}`, properties);
  }

  // 🎯 Métriques de performance de rendu
  trackRenderPerformance(metrics: Partial<PerformanceMetrics>): void {
    const completeMetrics: PerformanceMetrics = {
      renderTime: metrics.renderTime || 0,
      renderMode: metrics.renderMode || 'optimized',
      videoLength: metrics.videoLength || 0,
      subtitleCount: metrics.subtitleCount || 0,
      efficiency: metrics.efficiency || 1,
      errorRate: 0,
      userDevice: this.getDeviceInfo(),
      connectionSpeed: this.getConnectionSpeed(),
      ...metrics,
    };

    this.performanceMetrics.push(completeMetrics);
    
    // Analyser les tendances
    this.analyzePerformanceTrends();
    
    // Envoyer immédiatement si performance anormale
    if (completeMetrics.renderTime > 300 || completeMetrics.efficiency < 0.5) {
      this.track('performance_issue', completeMetrics);
    }
  }

  // 🔍 Tracking des erreurs avec contexte
  trackError(error: Error, context: Record<string, any> = {}): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      // Informations système
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      // Métriques de performance au moment de l'erreur
      performanceNow: performance.now(),
      memoryUsage: this.getMemoryUsage(),
    };

    this.track('error_occurred', errorData);
    console.error('❌ Error tracked:', errorData);
  }

  // 📈 Métriques en temps réel
  getRealtimeMetrics(): {
    fps: number;
    memoryUsage: number;
    networkSpeed: string;
    cacheSize: number;
  } {
    return {
      fps: this.getCurrentFPS(),
      memoryUsage: this.getMemoryUsage(),
      networkSpeed: this.getConnectionSpeed(),
      cacheSize: this.getCacheSize(),
    };
  }

  // 🎭 Tracking spécifique à l'application
  trackVideoUpload(duration: number, fileSize: number, format: string): void {
    this.track('video_uploaded', {
      duration,
      fileSize,
      format,
      uploadTime: Date.now(),
    });
  }

  trackPresetUsage(presetId: string, presetName: string): void {
    this.track('preset_applied', {
      presetId,
      presetName,
      timestamp: Date.now(),
    });
  }

  trackExportStarted(mode: string, videoLength: number): void {
    this.track('export_started', {
      mode,
      videoLength,
      timestamp: Date.now(),
    });
  }

  trackExportCompleted(
    mode: string, 
    renderTime: number, 
    efficiency: number,
    fileSize: number
  ): void {
    this.track('export_completed', {
      mode,
      renderTime,
      efficiency,
      fileSize,
      timestamp: Date.now(),
    });
  }

  // 🔄 Synchronisation avec Supabase
  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline) return;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // Envoyer en batch à Supabase
      const { error } = await supabase
        .from('analytics_events')
        .insert(events.map(event => ({
          event_name: event.event,
          event_properties: event.properties,
          user_id: event.userId,
          session_id: event.sessionId,
          page_url: event.page,
          user_agent: event.userAgent,
          timestamp: new Date(event.timestamp).toISOString(),
        })));

      if (error) {
        console.error('❌ Analytics sync failed:', error);
        // Remettre en queue en cas d'erreur
        this.eventQueue.unshift(...events);
      } else {
        console.log(`✅ Analytics synced: ${events.length} events`);
      }
    } catch (error) {
      console.error('❌ Analytics flush error:', error);
    }
  }

  // 🕐 Flush périodique
  private flushQueuePeriodically(): void {
    setInterval(() => {
      this.flushQueue();
    }, 30000); // 30 secondes

    // Flush avant fermeture de page
    window.addEventListener('beforeunload', () => {
      this.flushQueue();
    });
  }

  // 🌐 Détection de la connectivité
  private initNetworkDetection(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.track('network_online');
      this.flushQueue(); // Sync quand on revient en ligne
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.track('network_offline');
    });
  }

  // 📊 Monitoring des performances
  private startPerformanceMonitoring(): void {
    // Mesurer les performances toutes les 10 secondes
    setInterval(() => {
      const metrics = this.getRealtimeMetrics();
      
      // Alertes si performance dégradée
      if (metrics.fps < 30) {
        this.track('performance_low_fps', { fps: metrics.fps });
      }
      
      if (metrics.memoryUsage > 100) { // > 100MB
        this.track('performance_high_memory', { memory: metrics.memoryUsage });
      }
    }, 10000);
  }

  // 🎯 Analyse des tendances de performance
  private analyzePerformanceTrends(): void {
    if (this.performanceMetrics.length < 5) return;

    const recent = this.performanceMetrics.slice(-5);
    const avgRenderTime = recent.reduce((sum, m) => sum + m.renderTime, 0) / recent.length;
    const avgEfficiency = recent.reduce((sum, m) => sum + m.efficiency, 0) / recent.length;

    // Détecter les régressions
    if (avgRenderTime > 180) { // Plus de 3 minutes
      this.track('performance_regression_render_time', {
        averageRenderTime: avgRenderTime,
        sampleSize: recent.length,
      });
    }

    if (avgEfficiency < 0.7) { // Efficacité < 70%
      this.track('performance_regression_efficiency', {
        averageEfficiency: avgEfficiency,
        sampleSize: recent.length,
      });
    }
  }

  // 🔧 Fonctions utilitaires
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isCriticalEvent(event: string): boolean {
    const criticalEvents = [
      'error_occurred',
      'export_completed',
      'payment_completed',
      'subscription_changed',
    ];
    return criticalEvents.includes(event);
  }

  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Mobile')) return 'mobile';
    if (ua.includes('Tablet')) return 'tablet';
    return 'desktop';
  }

  private getConnectionSpeed(): string {
    // @ts-ignore - API expérimentale
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      const speed = connection.downlink || connection.bandwidth;
      if (speed > 10) return 'fast';
      if (speed > 1) return 'medium';
      return 'slow';
    }
    return 'unknown';
  }

  private getCurrentFPS(): number {
    let lastTime = performance.now();
    let frames = 0;
    
    const countFrames = () => {
      frames++;
      requestAnimationFrame(countFrames);
    };
    
    countFrames();
    
    setTimeout(() => {
      const now = performance.now();
      const fps = Math.round((frames * 1000) / (now - lastTime));
      return fps;
    }, 1000);
    
    return 60; // Fallback
  }

  private getMemoryUsage(): number {
    // @ts-ignore - API expérimentale
    const memory = performance.memory;
    if (memory) {
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return 0;
  }

  private getCacheSize(): number {
    // Sera implémenté avec le Service Worker
    return 0;
  }
}

// 🚀 Hook React pour utiliser les analytics
export function useAnalytics() {
  const analytics = AnalyticsService.getInstance();
  
  return {
    track: analytics.track.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackRenderPerformance: analytics.trackRenderPerformance.bind(analytics),
    trackVideoUpload: analytics.trackVideoUpload.bind(analytics),
    trackPresetUsage: analytics.trackPresetUsage.bind(analytics),
    trackExportStarted: analytics.trackExportStarted.bind(analytics),
    trackExportCompleted: analytics.trackExportCompleted.bind(analytics),
    getRealtimeMetrics: analytics.getRealtimeMetrics.bind(analytics),
  };
}

// Instance globale
export const analytics = AnalyticsService.getInstance();

// 🎯 Types pour le dashboard analytics
export interface AnalyticsDashboardData {
  totalUsers: number;
  totalVideos: number;
  averageRenderTime: number;
  averageEfficiency: number;
  topPresets: Array<{ name: string; usage: number }>;
  errorRate: number;
  performanceTrends: Array<{ date: string; renderTime: number; efficiency: number }>;
  userSegments: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

// 🚀 Fonction pour récupérer les données du dashboard
export async function getAnalyticsDashboard(): Promise<AnalyticsDashboardData> {
  const { data: events } = await supabase
    .from('analytics_events')
    .select('*')
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 derniers jours

  if (!events) return getEmptyDashboard();

  // Traitement des données...
  const totalVideos = events.filter(e => e.event_name === 'export_completed').length;
  const renderEvents = events.filter(e => e.event_name === 'export_completed');
  
  const averageRenderTime = renderEvents.length > 0
    ? renderEvents.reduce((sum, e) => sum + (e.event_properties.renderTime || 0), 0) / renderEvents.length
    : 0;

  const averageEfficiency = renderEvents.length > 0
    ? renderEvents.reduce((sum, e) => sum + (e.event_properties.efficiency || 1), 0) / renderEvents.length
    : 1;

  return {
    totalUsers: new Set(events.map(e => e.user_id)).size,
    totalVideos,
    averageRenderTime,
    averageEfficiency,
    topPresets: [], // À implémenter
    errorRate: events.filter(e => e.event_name === 'error_occurred').length / events.length,
    performanceTrends: [], // À implémenter
    userSegments: {
      mobile: events.filter(e => e.event_properties.platform?.includes('Mobile')).length,
      desktop: events.filter(e => !e.event_properties.platform?.includes('Mobile')).length,
      tablet: 0,
    },
  };
}

function getEmptyDashboard(): AnalyticsDashboardData {
  return {
    totalUsers: 0,
    totalVideos: 0,
    averageRenderTime: 0,
    averageEfficiency: 1,
    topPresets: [],
    errorRate: 0,
    performanceTrends: [],
    userSegments: { mobile: 0, desktop: 0, tablet: 0 },
  };
}