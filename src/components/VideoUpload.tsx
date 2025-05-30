// src/components/VideoUpload.tsx - AMÉLIORÉ avec compteur et crédits
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from "sonner";
import { getAssemblyAI, AssemblyAIService } from '@/lib/assemblyai';
import { videoCountService, VideoStats } from '@/lib/video-count-service';
import { useAuth } from '@/contexts/AuthContext';
import { Subtitle } from '@/types';
import { Loader2, Upload, Video, BarChart3, Crown, AlertCircle } from 'lucide-react';

interface VideoUploadProps {
  onVideoProcessed: (videoUrl: string, videoDuration: number, subtitles: Subtitle[], width: number, height: number) => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoProcessed }) => {
  const { user, profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [videoStats, setVideoStats] = useState<VideoStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🚀 Charger les statistiques au montage
  useEffect(() => {
    if (user) {
      loadVideoStats();
    }
  }, [user]);

  const loadVideoStats = async () => {
    if (!user) return;
    
    try {
      setLoadingStats(true);
      const stats = await videoCountService.getUserVideoStats(user.id);
      setVideoStats(stats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo');
      return;
    }

    // 🎯 Vérifier les crédits avant de commencer
    if (user) {
      const { canCreate, reason } = await videoCountService.canCreateVideo(user.id);
      if (!canCreate) {
        toast.error(reason || 'Limite de crédits atteinte', {
          description: 'Upgradez votre plan pour continuer',
          duration: 8000,
        });
        return;
      }
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);
      setProcessingStatus('Préparation du fichier...');

      // Générer un ID unique pour la vidéo
      const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Obtenir la durée et les dimensions de la vidéo
      setProcessingStatus('Analyse de la vidéo...');
      const { duration, width, height } = await getVideoMetadata(file);
      console.log(`📹 Métadonnées vidéo - Durée: ${duration}s, Dimensions: ${width}x${height}`);
      setUploadProgress(20);

      // Uploader la vidéo vers notre API
      setProcessingStatus('Upload de la vidéo...');
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch(`/api/video/${videoId}`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        const message = `Upload: ${uploadResponse.status} – ${errorText || 'Erreur inconnue'}`;
        toast.error(message);
        console.warn(message);
        return;
      }
      
      const { path: videoPath } = await uploadResponse.json();
      const videoUrl = videoPath;
      setUploadProgress(30);

      // Uploader vers AssemblyAI
      setProcessingStatus('Upload vers AssemblyAI...');
      try {
        const assemblyAI = getAssemblyAI();
        console.log('🚀 Upload vers AssemblyAI...');
        const uploadUrl = await assemblyAI.uploadFile(file);
        console.log('✅ URL AssemblyAI:', uploadUrl);
        setUploadProgress(40);

        // Créer la transcription
        setProcessingStatus('Démarrage de la transcription...');
        const transcriptId = await assemblyAI.createTranscript(uploadUrl);
        console.log('🎯 ID transcription:', transcriptId);
        setUploadProgress(50);

        // Attendre la transcription
        setProcessingStatus('Transcription en cours...');
        const checkProgress = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 5, 90));
        }, 1000);

        const transcript = await assemblyAI.waitForTranscript(transcriptId);
        clearInterval(checkProgress);
        console.log('✅ Transcription terminée:', transcript);
        setUploadProgress(95);

        // Convertir en sous-titres
        setProcessingStatus('Génération des sous-titres...');
        const subtitles = AssemblyAIService.convertToSubtitles(transcript);
        console.log(`🎬 ${subtitles.length} sous-titres générés`);
        setUploadProgress(100);

        // 🚀 Incrémenter le compteur de vidéos
        if (user) {
          await videoCountService.incrementVideoCount(user.id, videoId);
          // Recharger les stats
          await loadVideoStats();
        }

        // Succès !
        toast.success(`🎉 Vidéo traitée avec succès !`, {
          description: `${subtitles.length} sous-titres générés automatiquement`,
          duration: 5000,
        });

        onVideoProcessed(videoUrl, duration, subtitles, width, height);

      } catch (assemblyError) {
        console.error('Erreur AssemblyAI:', assemblyError);
        throw new Error(`Erreur AssemblyAI: ${assemblyError instanceof Error ? assemblyError.message : 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du traitement');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setProcessingStatus('');
    }
  };

  const getVideoMetadata = (file: File): Promise<{ duration: number; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.src = url;
      video.onloadedmetadata = () => {
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
        URL.revokeObjectURL(url);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Impossible de lire la vidéo'));
      };
    });
  };

  const getSubscriptionIcon = (subscription: string) => {
    if (subscription === 'premium') return <Crown className="h-4 w-4 text-purple-500" />;
    if (subscription === 'pro') return <BarChart3 className="h-4 w-4 text-blue-500" />;
    return null;
  };

  const getCreditStatus = () => {
    if (!videoStats) return { color: 'text-gray-500', bg: 'bg-gray-100' };
    
    const ratio = videoStats.creditsRemaining / (videoStats.creditsUsed + videoStats.creditsRemaining || 1);
    
    if (ratio <= 0.2) return { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
    if (ratio <= 0.5) return { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' };
    return { color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
  };

  const creditStatus = getCreditStatus();

  return (
    <Card className="app-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Upload de vidéo 🎬
            </CardTitle>
            <CardDescription>
              Sélectionnez une vidéo MP4 pour générer automatiquement les sous-titres
            </CardDescription>
          </div>
          
          {profile?.subscription && (
            <div className="flex items-center gap-2">
              {getSubscriptionIcon(profile.subscription)}
              <span className="text-xs font-medium">
                {profile.subscription.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* 🚀 STATISTIQUES UTILISATEUR */}
          <div className="grid grid-cols-3 gap-4">
            <div className="app-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {loadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                ) : (
                  videoStats?.totalVideos || 0
                )}
              </div>
              <div className="text-sm text-secondary">Vidéos créées</div>
            </div>
            
            <div className="app-card p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">60</div>
              <div className="text-sm text-secondary">FPS maximum</div>
            </div>
            
            <div className="app-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8</div>
              <div className="text-sm text-secondary">Animations</div>
            </div>
          </div>

          {/* 🎯 CRÉDITS RESTANTS */}
          {videoStats && (
            <div className={`p-4 rounded-lg ${creditStatus.bg}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className={`h-4 w-4 ${creditStatus.color}`} />
                  <span className="font-medium text-primary">Crédits ce mois</span>
                </div>
                <div className={`text-sm font-bold ${creditStatus.color}`}>
                  {videoStats.creditsRemaining} restants
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between text-xs text-secondary mb-1">
                  <span>Utilisés: {videoStats.creditsUsed}</span>
                  <span>Total: {videoStats.creditsUsed + videoStats.creditsRemaining}</span>
                </div>
                <Progress 
                  value={(videoStats.creditsUsed / (videoStats.creditsUsed + videoStats.creditsRemaining)) * 100} 
                  className="h-2"
                />
              </div>
              
              {videoStats.creditsRemaining === 0 && (
                <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Limite atteinte. Upgradez pour continuer.</span>
                </div>
              )}
            </div>
          )}

          {/* ZONE D'UPLOAD */}
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="video">Fichier vidéo</Label>
              <Input
                ref={fileInputRef}
                id="video"
                type="file"
                accept="video/mp4,video/webm,video/mov"
                onChange={handleFileSelect}
                disabled={isUploading || (videoStats?.creditsRemaining === 0)}
                className="input-primary"
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary">{processingStatus}</span>
                  <span className="font-medium text-primary">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="progress-bg" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || (videoStats?.creditsRemaining === 0)}
                className="btn-primary flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Choisir une vidéo
                  </>
                )}
              </Button>
              
              {videoStats?.creditsRemaining === 0 && (
                <Button
                  variant="outline"
                  className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrader
                </Button>
              )}
            </div>

            {/* Formats supportés */}
            <div className="text-xs text-secondary">
              <p>Formats supportés: MP4, WebM, MOV | Taille max: 100MB</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};