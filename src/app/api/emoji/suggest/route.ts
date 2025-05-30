// src/app/api/emoji/suggest/route.ts
import { NextRequest, NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Texte manquant ou invalide' },
        { status: 400 }
      );
    }

    // Si pas de clé API, utiliser le fallback
    if (!OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY manquante, utilisation du fallback');
      return NextResponse.json({
        emoji: getFallbackEmoji(text),
        confidence: 0.5,
        reasoning: 'Fallback - pas de clé API OpenAI',
      });
    }

    // 🎯 Appel à ChatGPT pour une suggestion intelligente
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en émojis pour les réseaux sociaux. 
            Analyse le texte donné et suggère LE MEILLEUR emoji qui correspond au sentiment/contexte.
            Réponds UNIQUEMENT avec un JSON dans ce format exact:
            {"emoji": "😊", "confidence": 0.85, "reasoning": "explication courte"}
            
            Règles:
            - confidence entre 0 et 1 (1 = parfait match)
            - Un seul emoji, le plus pertinent
            - Privilégier les émojis populaires sur TikTok/Instagram
            - Considérer le contexte français et anglais`
          },
          {
            role: 'user',
            content: `Texte à analyser: "${text}"`
          }
        ],
        max_tokens: 100,
        temperature: 0.3, // Moins de créativité pour plus de cohérence
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Pas de réponse de OpenAI');
    }

    // Parser la réponse JSON de ChatGPT
    try {
      const parsed = JSON.parse(content);
      
      // Validation de la réponse
      if (!parsed.emoji || typeof parsed.confidence !== 'number') {
        throw new Error('Format de réponse invalide');
      }

      return NextResponse.json({
        emoji: parsed.emoji,
        confidence: Math.max(0, Math.min(1, parsed.confidence)), // Clamp entre 0-1
        reasoning: parsed.reasoning || 'Suggestion ChatGPT',
      });

    } catch (parseError) {
      console.error('Erreur parsing réponse ChatGPT:', parseError);
      return NextResponse.json({
        emoji: getFallbackEmoji(text),
        confidence: 0.4,
        reasoning: 'Erreur parsing ChatGPT, fallback utilisé',
      });
    }

  } catch (error) {
    console.error('Erreur API emoji:', error);
    
    // Fallback en cas d'erreur
    const { text } = await req.json().catch(() => ({ text: '' }));
    return NextResponse.json({
      emoji: getFallbackEmoji(text),
      confidence: 0.3,
      reasoning: 'Erreur API, fallback utilisé',
    });
  }
}

// Fonction de fallback simple
function getFallbackEmoji(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Détection basique par mots-clés
  if (lowerText.includes('heureux') || lowerText.includes('happy') || lowerText.includes('joie')) {
    return '😊';
  }
  if (lowerText.includes('triste') || lowerText.includes('sad')) {
    return '😢';
  }
  if (lowerText.includes('amour') || lowerText.includes('love')) {
    return '❤️';
  }
  if (lowerText.includes('rire') || lowerText.includes('drôle') || lowerText.includes('laugh')) {
    return '😂';
  }
  if (lowerText.includes('wow') || lowerText.includes('incroyable')) {
    return '😮';
  }
  if (lowerText.includes('merci') || lowerText.includes('thanks')) {
    return '🙏';
  }
  if (lowerText.includes('fire') || lowerText.includes('feu') || lowerText.includes('hot')) {
    return '🔥';
  }
  if (lowerText.includes('money') || lowerText.includes('argent')) {
    return '💰';
  }
  if (lowerText.includes('strong') || lowerText.includes('fort')) {
    return '💪';
  }
  if (lowerText.includes('question') || lowerText.includes('pourquoi') || lowerText.includes('?')) {
    return '🤔';
  }
  if (lowerText.includes('attention') || lowerText.includes('warning')) {
    return '⚠️';
  }
  
  // Émoji par défaut
  return '😊';
}