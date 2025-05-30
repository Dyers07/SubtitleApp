'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { ThumbsUp, ThumbsDown, Heart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AuthContextType {
  user: { session?: { access_token: string } } | null;
}

interface PresetVotingProps {
  presetId: string;
  votes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVoteChange?: (newVotes: number, newDownvotes: number) => void;
  compact?: boolean;
  animated?: boolean;
}

export function PresetVoting({
  presetId,
  votes,
  downvotes,
  userVote,
  onVoteChange,
  compact = false,
  animated = true,
}: PresetVotingProps) {
  const { user } = useAuth() as AuthContextType;
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(userVote || null);
  const [currentVotes, setCurrentVotes] = useState(votes);
  const [currentDownvotes, setCurrentDownvotes] = useState(downvotes);
  const [isVoting, setIsVoting] = useState(false);

  // Synchronisation des props avec les états locaux
  useEffect(() => {
    setCurrentVotes(votes);
    setCurrentDownvotes(downvotes);
    setCurrentVote(userVote || null);
  }, [votes, downvotes, userVote]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user || !user.session?.access_token) {
      toast.error('Connectez-vous pour voter');
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      // Optimistic update
      let newVotes = currentVotes;
      let newDownvotes = currentDownvotes;
      let newCurrentVote: 'up' | 'down' | null = voteType;

      if (currentVote === voteType) {
        if (voteType === 'up') {
          newVotes = Math.max(0, currentVotes - 1);
        } else {
          newDownvotes = Math.max(0, currentDownvotes - 1);
        }
        newCurrentVote = null;
      } else {
        if (currentVote === 'up') {
          newVotes = Math.max(0, currentVotes - 1);
        } else if (currentVote === 'down') {
          newDownvotes = Math.max(0, currentDownvotes - 1);
        }

        if (voteType === 'up') {
          newVotes = newVotes + 1;
        } else {
          newDownvotes = newDownvotes + 1;
        }
      }

      setCurrentVotes(newVotes);
      setCurrentDownvotes(newDownvotes);
      setCurrentVote(newCurrentVote);

      const response = await fetch(`/api/presets/${presetId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.session.access_token}`,
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Erreur lors du vote';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      onVoteChange?.(newVotes, newDownvotes);

      if (newCurrentVote === 'up') {
        toast.success('👍 Vote positif enregistré !', { duration: 2000 });
      } else if (newCurrentVote === 'down') {
        toast.success('👎 Vote négatif enregistré', { duration: 2000 });
      } else {
        toast.info('🔄 Vote retiré', { duration: 2000 });
      }

    } catch (error) {
      console.error('Erreur vote:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du vote');
      setCurrentVotes(votes);
      setCurrentDownvotes(downvotes);
      setCurrentVote(userVote || null);
    } finally {
      setIsVoting(false);
    }
  };

  const totalScore = currentVotes - currentDownvotes;
  const popularity = currentVotes + currentDownvotes;
  const animationClass = animated && !window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    ? 'hover:scale-105' 
    : '';

  if (compact) {
    return (
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {totalScore > 0 && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                  <TrendingUp className="h-3 w-3" />
                  +{totalScore}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentVotes} votes positས -positifs, {currentDownvotes} négatifs</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {popularity > 5 && (
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                  <Heart className="h-3 w-3" />
                  {popularity}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preset populaire • {popularity} votes</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('up')}
              disabled={isVoting}
              aria-label={currentVote === 'up' ? 'Retirer le vote positif' : 'Voter positivement'}
              className={`p-2 h-8 transition-all duration-200 ${
                currentVote === 'up'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-110'
                  : `hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 ${animationClass}`
              }`}
            >
              <ThumbsUp 
                className={`h-4 w-4 transition-transform ${
                  currentVote === 'up' && animated ? 'animate-bounce-subtle' : ''
                }`} 
              />
              {currentVotes > 0 && (
                <span className="ml-1 text-xs font-medium">{currentVotes}</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentVote === 'up' ? 'Retirer le vote positif' : 'Voter positivement'}</p>
          </TooltipContent>
        </Tooltip>

        {totalScore !== 0 && (
          <div className={`text-sm font-medium px-2 py-1 rounded-full ${
            totalScore > 0 
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' 
              : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
          }`}>
            {totalScore > 0 ? `+${totalScore}` : totalScore}
          </div>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote('down')}
              disabled={isVoting}
              aria-label={currentVote === 'down' ? 'Retirer le vote négatif' : 'Voter négativement'}
              className={`p-2 h-8 transition-all duration-200 ${
                currentVote === 'down'
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 scale-110'
                  : `hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 ${animationClass}`
              }`}
            >
              <ThumbsDown 
                className={`h-4 w-4 transition-transform ${
                  currentVote === 'down' && animated ? 'animate-bounce-subtle' : ''
                }`} 
              />
              {currentDownvotes > 0 && (
                <span className="ml-1 text-xs font-medium">{currentDownvotes}</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{currentVote === 'down' ? 'Retirer le vote négatif' : 'Voter négativement'}</p>
          </TooltipContent>
        </Tooltip>

        {popularity > 10 && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full">
                <Heart className="h-3 w-3" />
                <span className="text-xs font-medium">Hot</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Preset très populaire • {popularity} votes au total</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}