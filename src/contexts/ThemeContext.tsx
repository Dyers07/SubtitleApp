// src/contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Détecter la préférence système
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Calculer le thème effectif
  const calculateEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Initialiser le thème depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dyers-theme') as Theme;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setTheme(stored);
      }
    } catch (error) {
      console.warn('Erreur lecture localStorage theme:', error);
    }
    setMounted(true);
  }, []);

  // Mettre à jour le thème effectif
  useEffect(() => {
    if (!mounted) return;

    const newEffectiveTheme = calculateEffectiveTheme(theme);
    setEffectiveTheme(newEffectiveTheme);
    
    // Appliquer au DOM
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newEffectiveTheme);
    
    // Pour compatibilité avec certains composants
    if (newEffectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Sauvegarder en localStorage
    try {
      localStorage.setItem('dyers-theme', theme);
    } catch (error) {
      console.warn('Erreur sauvegarde localStorage theme:', error);
    }

    // Mettre à jour la couleur de la barre d'état (mobile)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', newEffectiveTheme === 'dark' ? '#1f2937' : '#ffffff');
    }

    console.log(`🎨 Thème appliqué: ${theme} → ${newEffectiveTheme}`);
  }, [theme, mounted]);

  // Écouter les changements de préférence système
  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const newEffectiveTheme = e.matches ? 'dark' : 'light';
      setEffectiveTheme(newEffectiveTheme);
      
      // Appliquer immédiatement au DOM
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newEffectiveTheme);
      
      if (newEffectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      console.log(`🔄 Changement système détecté: ${newEffectiveTheme}`);
    };

    // Utiliser la nouvelle API si disponible, sinon fallback
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback pour navigateurs plus anciens
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(current => {
      switch (current) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'system';
        case 'system':
          return 'light';
        default:
          return 'light';
      }
    });
  };

  const value = {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  };

  // Prévenir le flash avant hydratation
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook utilitaire pour les classes conditionnelles
export function useThemeClass(lightClass: string, darkClass: string): string {
  const { effectiveTheme } = useTheme();
  return effectiveTheme === 'dark' ? darkClass : lightClass;
}

// Hook pour détecter si on est en mode sombre
export function useIsDark(): boolean {
  const { effectiveTheme } = useTheme();
  return effectiveTheme === 'dark';
}