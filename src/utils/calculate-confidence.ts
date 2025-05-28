import { Word } from '@/types';

export function calculateAverageConfidence(words: Word[]): number {
  if (!words || words.length === 0) return 0;
  
  const totalConfidence = words.reduce((sum, word) => sum + (word.confidence || 0), 0);
  const averageConfidence = totalConfidence / words.length;
  
  // Convertir en pourcentage et arrondir à 2 décimales
  return Math.round(averageConfidence * 10000) / 100;
}