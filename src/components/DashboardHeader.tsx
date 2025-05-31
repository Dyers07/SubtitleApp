// src/components/DashboardHeader.tsx - Header unifié pour le dashboard CORRIGÉ
'use client';

import React from 'react';
import { Logo } from '@/components/v2/logo';
import { UserMenu } from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  isLoading?: boolean;
}

export function DashboardHeader({ 
  title = "Dashboard", 
  subtitle,
  showBackButton = false,
  onBack,
  actions,
  isLoading = false
}: DashboardHeaderProps) {
  const { user, profile } = useAuth();

  const displayName = profile?.name || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-40 theme-transition">
      <div className="flex items-center justify-between">
        {/* 🚀 Section gauche: Logo + Navigation */}
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition"
              title="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex items-center space-x-4">
            <Logo />
            
            {/* Indicateur version/mode */}
            <div className="flex items-center space-x-2">
              <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-xs font-bold">
                60 FPS ⚡
              </span>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                v1.0 Alpha
              </span>
            </div>
          </div>
        </div>

        {/* 🎯 Section centre: Titre */}
        <div className="flex-1 text-center max-w-md mx-4">
          {title && (
            <div className="space-y-1">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2 truncate">
                {isLoading && <Loader2 className="h-5 w-5 animate-spin flex-shrink-0" />}
                <span className="truncate">{title}</span>
              </h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* 🚀 Section droite: Actions + Profil utilisateur */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Actions personnalisées */}
          <div className="flex items-center space-x-2">
            {actions}
          </div>
          
          {/* Info utilisateur */}
          {user && (
            <div className="hidden lg:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-32">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(profile && 'subscription' in profile && typeof (profile as any).subscription === 'string'
                    ? ((profile as any).subscription as string).toUpperCase()
                    : 'FREE')}
                </p>
              </div>
            </div>
          )}
          
          {/* Menu utilisateur avec mode sombre */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}