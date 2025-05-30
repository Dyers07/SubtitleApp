// src/components/ui/theme-toggle.tsx - Composant de bascule thème
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const getIcon = () => {
    switch (effectiveTheme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Sombre';
      case 'light':
        return 'Clair';
      case 'system':
        return 'Système';
      default:
        return 'Thème';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-auto px-3 py-2 h-auto gap-2 theme-transition hover:bg-gray-100 dark:hover:bg-gray-800"
          title={`Mode ${getLabel()}`}
        >
          {getIcon()}
          <span className="hidden sm:inline text-sm">{getLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="dropdown-content">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={`cursor-pointer ${theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Clair</span>
          {theme === 'light' && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={`cursor-pointer ${theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Sombre</span>
          {theme === 'dark' && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={`cursor-pointer ${theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Système</span>
          {theme === 'system' && (
            <span className="ml-auto text-xs text-blue-600 dark:text-blue-400">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}