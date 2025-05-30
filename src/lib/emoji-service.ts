// src/lib/emoji-service.ts - SERVICE D'ÉMOJIS INTELLIGENT AVEC CHATGPT
import { toast } from 'sonner';

interface EmojiResponse {
  emoji: string;
  confidence: number;
  reasoning?: string;
}

class EmojiService {
  private static instance: EmojiService;
  private cache = new Map<string, EmojiResponse>();
  
  // Dictionnaire de base pour les cas hors ligne
  private fallbackEmojis: Record<string, string> = {
    // Émotions de base
    'heureux': '😊', 'happy': '😊', 'joie': '😄', 'content': '😀',
    'triste': '😢', 'sad': '😢', 'malheureux': '😔', 'pleure': '😭',
    'amour': '❤️', 'love': '❤️', 'aimer': '💕', 'coeur': '💖',
    'rire': '😂', 'drôle': '🤣', 'mdr': '😆', 'laugh': '😂',
    'wow': '😮', 'incroyable': '😲', 'amazing': '🤩', 'surpris': '😯',
    
    // Actions et objets
    'super': '🎉', 'génial': '🎉', 'fantastique': '✨', 'excellent': '👌',
    'merci': '🙏', 'thanks': '🙏', 'gratitude': '🙏',
    'question': '❓', 'pourquoi': '🤔', 'comment': '🤔', 'quoi': '❓',
    'idée': '💡', 'idea': '💡', 'penser': '💭', 'réflexion': '🧠',
    'attention': '⚠️', 'warning': '⚠️', 'danger': '⚠️', 'alerte': '🚨',
    'bravo': '👏', 'félicitations': '🎊', 'congrats': '🎉',
    
    // Tendances
    'fire': '🔥', 'feu': '🔥', 'hot': '🔥', 'chaud': '🔥',
    'cool': '😎', 'classe': '😎', 'stylé': '😎', 'swag': '😎',
    'money': '💰', 'argent': '💰', 'cash': '💵', 'riche': '💸',
    'strong': '💪', 'fort': '💪', 'muscle': '💪', 'puissant': '💪',
    'fast': '⚡', 'rapide': '⚡', 'speed': '💨', 'vite': '💨',
    'boom': '💥', 'explosion': '💥', 'bang': '💥', 'impact': '💥',
    
    // Réseaux sociaux
    'like': '👍', 'dislike': '👎', 'follow': '➕', 'share': '🔄',
    'viral': '📈', 'trending': '🔥', 'views': '👀', 'subscribers': '📊',
  };

  static getInstance(): EmojiService {
    if (!EmojiService.instance) {
      EmojiService.instance = new EmojiService();
    }
    return EmojiService.instance;
  }

  // 🚀 Utiliser ChatGPT pour une détection intelligente d'émojis
  async getEmojiForText(text: string, useAI: boolean = true): Promise<EmojiResponse> {
    const cacheKey = text.toLowerCase().trim();
    
    // Vérifier le cache d'abord
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Si AI désactivé, utiliser le dictionnaire de base
    if (!useAI) {
      return this.getFallbackEmoji(text);
    }

    try {
      // 🎯 Appel à ChatGPT via votre API
      const response = await fetch('/api/emoji/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('API emoji indisponible');
      }

      const data = await response.json();
      const result: EmojiResponse = {
        emoji: data.emoji || '😊',
        confidence: data.confidence || 0.5,
        reasoning: data.reasoning,
      };

      // Mettre en cache le résultat
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.warn('Erreur API emoji, utilisation du fallback:', error);
      return this.getFallbackEmoji(text);
    }
  }

  // Méthode de fallback avec le dictionnaire existant
  private getFallbackEmoji(text: string): EmojiResponse {
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (this.fallbackEmojis[word]) {
        return {
          emoji: this.fallbackEmojis[word],
          confidence: 0.8,
          reasoning: `Correspondance directe: ${word}`,
        };
      }
    }

    // Détection par motifs
    if (text.includes('!') || text.includes('wow') || text.includes('incroyable')) {
      return { emoji: '😮', confidence: 0.6, reasoning: 'Exclamation détectée' };
    }
    
    if (text.includes('?')) {
      return { emoji: '🤔', confidence: 0.6, reasoning: 'Question détectée' };
    }

    // Émoji par défaut
    return { emoji: '😊', confidence: 0.3, reasoning: 'Émoji par défaut' };
  }

  // 🎯 Traitement automatique d'un texte complet
  async processText(text: string, autoEmojis: boolean = true): Promise<string> {
    if (!autoEmojis) return text;

    try {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim());
      let processedText = text;

      for (const sentence of sentences) {
        if (sentence.trim().length > 3) {
          const emojiResult = await this.getEmojiForText(sentence.trim());
          
          // Ajouter l'emoji seulement si la confiance est suffisante
          if (emojiResult.confidence > 0.5) {
            const sentenceRegex = new RegExp(`\\b${sentence.trim()}\\b`, 'gi');
            processedText = processedText.replace(
              sentenceRegex, 
              `${sentence.trim()} ${emojiResult.emoji}`
            );
          }
        }
      }

      return processedText;
    } catch (error) {
      console.error('Erreur traitement émojis:', error);
      return text;
    }
  }

  // Nettoyer le cache périodiquement
  clearCache(): void {
    this.cache.clear();
    console.log('Cache émojis nettoyé');
  }
}

export default EmojiService;