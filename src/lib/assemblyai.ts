import { Subtitle } from '@/types';

const ASSEMBLY_AI_API_KEY = process.env.NEXT_PUBLIC_ASSEMBLY_AI_API_KEY!;

interface AssemblyAIWord {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

interface AssemblyAIResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  words?: AssemblyAIWord[];
  error?: string;
}

export class AssemblyAIService {
  private apiKey: string;
  private baseUrl = 'https://api.assemblyai.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async uploadFile(file: File): Promise<string> {
    console.log('Starting file upload to AssemblyAI...');
    console.log('File size:', file.size, 'bytes');
    console.log('File type:', file.type);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'authorization': this.apiKey,
        },
        body: file,
      });

      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Failed to upload file: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload successful, URL:', data.upload_url);
      return data.upload_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async createTranscript(audioUrl: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/transcript`, {
      method: 'POST',
      headers: {
        'authorization': this.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: 'fr', // Changez selon vos besoins
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create transcript');
    }

    const data = await response.json();
    return data.id;
  }

  async getTranscript(transcriptId: string): Promise<AssemblyAIResponse> {
    const response = await fetch(`${this.baseUrl}/transcript/${transcriptId}`, {
      headers: {
        'authorization': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get transcript');
    }

    return response.json();
  }

  async waitForTranscript(transcriptId: string): Promise<AssemblyAIResponse> {
    let transcript: AssemblyAIResponse;
    
    do {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Attendre 3 secondes
      transcript = await this.getTranscript(transcriptId);
    } while (transcript.status === 'queued' || transcript.status === 'processing');

    if (transcript.status === 'error') {
      throw new Error(transcript.error || 'Transcription failed');
    }

    return transcript;
  }

  // Convertir la réponse AssemblyAI en nos sous-titres
  static convertToSubtitles(transcript: AssemblyAIResponse): Subtitle[] {
    if (!transcript.words) return [];

    const subtitles: Subtitle[] = [];
    let currentSubtitle: Subtitle | null = null;
    let wordCount = 0;
    const maxWordsPerLine = 8;
    const maxDuration = 4; // secondes max par sous-titre

    transcript.words.forEach((word, index) => {
      // Convertir de millisecondes en secondes
      const startTime = word.start / 1000;
      const endTime = word.end / 1000;

      // Commencer un nouveau sous-titre si nécessaire
      if (!currentSubtitle || 
          wordCount >= maxWordsPerLine || 
          (endTime - currentSubtitle.start) > maxDuration ||
          (startTime - currentSubtitle.end) > 1) { // Gap de plus d'1 seconde
        
        if (currentSubtitle) {
          subtitles.push(currentSubtitle);
        }

        currentSubtitle = {
          id: `subtitle-${index}`,
          text: word.text,
          start: startTime,
          end: endTime,
          words: [{
            text: word.text,
            start: startTime,
            end: endTime,
            confidence: word.confidence,
          }],
        };
        wordCount = 1;
      } else {
        // Ajouter le mot au sous-titre actuel
        currentSubtitle.text += ' ' + word.text;
        currentSubtitle.end = endTime;
        currentSubtitle.words!.push({
          text: word.text,
          start: startTime,
          end: endTime,
          confidence: word.confidence,
        });
        wordCount++;
      }
    });

    // Ajouter le dernier sous-titre
    if (currentSubtitle) {
      subtitles.push(currentSubtitle);
    }

    return subtitles;
  }
}

// Instance singleton
let assemblyAIInstance: AssemblyAIService | null = null;

export function getAssemblyAI(): AssemblyAIService {
  if (!assemblyAIInstance) {
    if (!ASSEMBLY_AI_API_KEY) {
      console.error('NEXT_PUBLIC_ASSEMBLY_AI_API_KEY is not set in environment variables');
      throw new Error('NEXT_PUBLIC_ASSEMBLY_AI_API_KEY is not set');
    }
    console.log('AssemblyAI API key found, length:', ASSEMBLY_AI_API_KEY.length);
    assemblyAIInstance = new AssemblyAIService(ASSEMBLY_AI_API_KEY);
  }
  return assemblyAIInstance;
}