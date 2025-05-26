export interface Subtitle {
    id: string;
    text: string;
    start: number; // en secondes
    end: number;   // en secondes
    words?: Word[];
  }
  
  export interface Word {
    text: string;
    start: number;
    end: number;
    confidence: number;
  }
  
  export interface SubtitleStyle {
    // Texte
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    textDecoration: 'none' | 'underline' | 'line-through';
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    color: string;
    
    // Background
    backgroundColor: string;
    backgroundOpacity: number;
    padding: number;
    borderRadius: number;
    
    // Position
    position: 'bottom' | 'top' | 'middle';
    offsetY: number;
    
    // Effets
    shadowEnabled: boolean;
    shadowColor: string;
    shadowBlur: number;
    
    neonEnabled: boolean;
    neonColor: string;
    neonIntensity: number;
    
    // Animations
    animationIn: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'typewriter';
    animationOut: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'scale';
    animationDuration: number;
    
    // Emojis
    autoEmojis: boolean;
  }
  
  export interface VideoProject {
    id: string;
    videoUrl: string;
    videoDuration: number;
    subtitles: Subtitle[];
    style: SubtitleStyle;
    width: number;
    height: number;
    fps: number;
  }
  
  // Valeurs par défaut pour le style
  export const defaultSubtitleStyle: SubtitleStyle = {
    fontSize: 36,
    fontFamily: 'Arial',
    fontWeight: 'bold',
    fontStyle: 'normal',
    textDecoration: 'none',
    textTransform: 'none',
    color: '#FFFFFF',
    
    backgroundColor: '#000000',
    backgroundOpacity: 0.7,
    padding: 12,
    borderRadius: 8,
    
    position: 'bottom',
    offsetY: 50,
    
    shadowEnabled: true,
    shadowColor: '#000000',
    shadowBlur: 4,
    
    neonEnabled: false,
    neonColor: '#00FF00',
    neonIntensity: 2,
    
    animationIn: 'fade',
    animationOut: 'fade',
    animationDuration: 0.3,
    
    autoEmojis: false,
  };
  