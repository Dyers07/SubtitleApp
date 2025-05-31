// src/components/auth/UserMenu.tsx - Menu utilisateur CORRIGÉ
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  Crown, 
  BarChart3,
  ChevronDown,
  HelpCircle,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const displayName = profile?.name || user.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      setIsOpen(false);
      // Redirection sera gérée par le contexte auth
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'Profil',
      onClick: () => {
        console.log('Navigation vers /profile');
        window.location.href = '/profile';
        setIsOpen(false);
      }
    },
    {
      icon: BarChart3,
      label: 'Statistiques',
      onClick: () => {
        console.log('Navigation vers /dashboard/stats');
        window.location.href = '/dashboard/stats';
        setIsOpen(false);
      }
    },
    {
      icon: CreditCard,
      label: 'Abonnement',
      onClick: () => {
        console.log('Navigation vers /subscription');
        window.location.href = '/subscription';
        setIsOpen(false);
      }
    },
    {
      icon: Settings,
      label: 'Paramètres',
      onClick: () => {
        console.log('Navigation vers /settings');
        window.location.href = '/settings';
        setIsOpen(false);
      }
    },
    {
      icon: HelpCircle,
      label: 'Aide',
      onClick: () => {
        console.log('Navigation vers /help');
        window.location.href = '/help';
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        variant="ghost"
        className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-blue-600 text-white text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-blue-600 text-white font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <div className="flex items-center mt-1">
                  <Crown className="h-3 w-3 text-orange-500 mr-1" />
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                    {(profile as any)?.subscription?.toUpperCase() || 'FREE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ))}
            
            {/* Theme Toggle */}
            <button
              onClick={() => {
                toggleTheme();
                setIsOpen(false);
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" />
                  <span>Mode clair</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" />
                  <span>Mode sombre</span>
                </>
              )}
            </button>
          </div>

          {/* Separator */}
          <div className="border-t border-gray-200 dark:border-gray-700"></div>

          {/* Sign Out */}
          <div className="py-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}