// src/hooks/useRequireAuth.ts
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useRequireAuth() {
  const { user, loading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setShowAuthDialog(true);
    }
  }, [user, loading]);

  return {
    user,
    loading,
    showAuthDialog,
    setShowAuthDialog,
    isAuthenticated: !!user,
  };
}