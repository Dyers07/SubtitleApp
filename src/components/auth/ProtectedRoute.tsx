// src/components/auth/ProtectedRoute.tsx - Route protégée avec Supabase
'use client';

import React from 'react';
import { useRequireAuth } from '@/contexts/AuthContext';
import { AuthDialog } from './AuthDialog';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading, showAuthDialog, setShowAuthDialog } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative">
        {/* ✅ Contenu principal (fallback) */}
        {fallback || (
          <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-md mx-auto p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Authentification requise
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Vous devez être connecté pour accéder à cette fonctionnalité.
              </p>
              <button
                onClick={() => setShowAuthDialog(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Se connecter
              </button>
            </div>
          </div>
        )}
        
        {/* ✅ Dialog modal en overlay */}
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
        />
      </div>
    );
  }

  return <>{children}</>;
}