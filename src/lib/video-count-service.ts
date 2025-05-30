// src/lib/video-count-service.ts - Service pour compter les vidéos créées
import { supabase } from '@/lib/supabase';

export interface VideoStats {
  totalVideos: number;
  videosThisMonth: number;
  creditsUsed: number;
  creditsRemaining: number;
}

export class VideoCountService {
  private static instance: VideoCountService;
  private cache = new Map<string, { data: VideoStats; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): VideoCountService {
    if (!VideoCountService.instance) {
      VideoCountService.instance = new VideoCountService();
    }
    return VideoCountService.instance;
  }

  /**
   * 🚀 Récupérer les statistiques de vidéos pour un utilisateur
   */
  async getUserVideoStats(userId: string): Promise<VideoStats> {
    // Vérifier le cache
    const cached = this.cache.get(userId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Récupérer le profil utilisateur pour connaître son plan
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription, created_at')
        .eq('id', userId)
        .single();

      const subscription = profile?.subscription || 'free';

      // Compter le total de vidéos créées
      const { count: totalVideos } = await supabase
        .from('video_projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed');

      // Compter les vidéos de ce mois
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: videosThisMonth } = await supabase
        .from('video_projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      // Calculer les crédits selon le plan
      const creditLimits = {
        free: 3,
        pro: 20,
        premium: 100,
      };

      const totalCredits = creditLimits[subscription as keyof typeof creditLimits] || 3;
      const creditsUsed = videosThisMonth || 0;
      const creditsRemaining = Math.max(0, totalCredits - creditsUsed);

      const stats: VideoStats = {
        totalVideos: totalVideos || 0,
        videosThisMonth: videosThisMonth || 0,
        creditsUsed,
        creditsRemaining,
      };

      // Mettre en cache
      this.cache.set(userId, {
        data: stats,
        timestamp: Date.now(),
      });

      return stats;
    } catch (error) {
      console.error('Erreur récupération stats vidéo:', error);
      
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalVideos: 0,
        videosThisMonth: 0,
        creditsUsed: 0,
        creditsRemaining: 3,
      };
    }
  }

  /**
   * 🎯 Incrémenter le compteur de vidéos après création
   */
  async incrementVideoCount(userId: string, projectId: string): Promise<void> {
    try {
      // Créer ou mettre à jour l'entrée du projet
      const { error } = await supabase
        .from('video_projects')
        .upsert({
          id: projectId,
          user_id: userId,
          name: `Vidéo ${Date.now()}`,
          video_url: '', // Sera mis à jour plus tard
          video_duration: 0,
          width: 1080,
          height: 1920,
          fps: 60,
          subtitles: [],
          style: {},
          status: 'completed',
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Erreur incrémentation compteur:', error);
        return;
      }

      // Invalider le cache pour cet utilisateur
      this.cache.delete(userId);
      
      console.log(`✅ Compteur vidéo incrémenté pour l'utilisateur ${userId}`);
    } catch (error) {
      console.error('Erreur incrémentation compteur vidéo:', error);
    }
  }

  /**
   * 🔄 Vérifier si l'utilisateur peut créer une vidéo (crédits)
   */
  async canCreateVideo(userId: string): Promise<{ canCreate: boolean; reason?: string }> {
    try {
      const stats = await this.getUserVideoStats(userId);
      
      if (stats.creditsRemaining <= 0) {
        return {
          canCreate: false,
          reason: 'Limite de crédits atteinte pour ce mois. Upgradez votre plan pour continuer.',
        };
      }

      return { canCreate: true };
    } catch (error) {
      console.error('Erreur vérification crédits:', error);
      return { canCreate: true }; // En cas d'erreur, autoriser par défaut
    }
  }

  /**
   * 🗑️ Nettoyer le cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Cache statistiques vidéo nettoyé');
  }

  /**
   * 📊 Obtenir les statistiques globales de l'application (admin)
   */
  async getGlobalStats(): Promise<{
    totalUsers: number;
    totalVideos: number;
    videosToday: number;
    activeUsers: number;
  }> {
    try {
      // Nombre total d'utilisateurs
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Nombre total de vidéos
      const { count: totalVideos } = await supabase
        .from('video_projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      // Vidéos créées aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: videosToday } = await supabase
        .from('video_projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('created_at', today.toISOString());

      // Utilisateurs actifs (avec au moins une vidéo)
      const { count: activeUsers } = await supabase
        .from('video_projects')
        .select('user_id', { count: 'exact', head: true })
        .eq('status', 'completed');

      return {
        totalUsers: totalUsers || 0,
        totalVideos: totalVideos || 0,
        videosToday: videosToday || 0,
        activeUsers: activeUsers || 0,
      };
    } catch (error) {
      console.error('Erreur récupération stats globales:', error);
      return {
        totalUsers: 0,
        totalVideos: 0,
        videosToday: 0,
        activeUsers: 0,
      };
    }
  }
}

// Instance singleton
export const videoCountService = VideoCountService.getInstance();