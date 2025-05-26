'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from "sonner";
import { getAssemblyAI, AssemblyAIService } from '@/lib/assemblyai';
import { Subtitle } from '@/types';

interface VideoUploadProps {
  onVideoProcessed: (videoUrl: string, videoDuration: number, subtitles: Subtitle[], width: number, height: number) => void;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoProcessed }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Veuillez sélectionner un fichier vidéo');
      return;
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
      console.log(`Video metadata - Duration: ${duration}s, Dimensions: ${width}x${height}`);
      setUploadProgress(20);

      // Uploader la vidéo vers notre API (version avec stockage sur disque)
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
        toast.error(message);      // feedback UX
        console.warn(message);     // log dev
        return;                    // stop ici, pas besoin de throw
      }
      
      const { path: videoPath } = await uploadResponse.json();
      const videoUrl = videoPath; // Utiliser le chemin public direct
      setUploadProgress(30);

      // Uploader vers AssemblyAI
      setProcessingStatus('Upload vers AssemblyAI...');
      try {
        const assemblyAI = getAssemblyAI();
        console.log('Uploading to AssemblyAI...');
        const uploadUrl = await assemblyAI.uploadFile(file);
        console.log('AssemblyAI upload URL:', uploadUrl);
        setUploadProgress(40);

        // Créer la transcription
        setProcessingStatus('Démarrage de la transcription...');
        const transcriptId = await assemblyAI.createTranscript(uploadUrl);
        console.log('Transcript ID:', transcriptId);
        setUploadProgress(50);

        // Attendre la transcription
        setProcessingStatus('Transcription en cours...');
        const checkProgress = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 5, 90));
        }, 1000);

        const transcript = await assemblyAI.waitForTranscript(transcriptId);
        clearInterval(checkProgress);
        console.log('Transcript result:', transcript);
        setUploadProgress(95);

        // Convertir en sous-titres
        setProcessingStatus('Génération des sous-titres...');
        const subtitles = AssemblyAIService.convertToSubtitles(transcript);
        console.log('Generated subtitles:', subtitles.length);
        setUploadProgress(100);

        // Succès !
        toast.success(`Vidéo traitée avec ${subtitles.length} sous-titres générés`);

        onVideoProcessed(videoUrl, duration, subtitles, width, height);
      } catch (assemblyError) {
        console.error('AssemblyAI error:', assemblyError);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de vidéo</CardTitle>
        <CardDescription>
          Sélectionnez une vidéo MP4 pour générer automatiquement les sous-titres
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="video">Fichier vidéo</Label>
            <Input
              ref={fileInputRef}
              id="video"
              type="file"
              accept="video/mp4,video/webm,video/mov"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{processingStatus}</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
            >
              Choisir une vidéo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};