// src/components/auth/UserMenu.tsx - AMÉLIORÉ avec ThemeToggle
'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, CreditCard, Palette, BarChart3, Crown } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    );
  }

  const displayName = profile?.name || user.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      
      toast.success('✅ Déconnecté avec succès');
    } catch (error: any) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const getSubscriptionStyle = (subscriptionPlan: string) => {
    const styles = {
      free: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return styles[subscriptionPlan as keyof typeof styles] || styles.free;
  };

  const getSubscriptionIcon = (subscriptionPlan: string) => {
    if (subscriptionPlan === 'premium') return <Crown className="mr-2 h-4 w-4 text-purple-500" />;
    if (subscriptionPlan === 'pro') return <BarChart3 className="mr-2 h-4 w-4 text-blue-500" />;
    return <User className="mr-2 h-4 w-4" />;
  };

  const currentPlan = profile?.subscription_plan || 'free';

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
              <AvatarFallback className="bg-blue-500 text-white text-sm dark:bg-blue-600">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 dropdown-content" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                  <AvatarFallback className="bg-blue-500 text-white dark:bg-blue-600">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-primary">{displayName}</p>
                  <p className="text-xs leading-none text-secondary">
                    {user.email}
                  </p>
                </div>
              </div>
              
              {profile?.subscription_plan && (
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getSubscriptionStyle(currentPlan)}`}>
                    {currentPlan.toUpperCase()}
                  </span>
                  {currentPlan === 'free' && (
                    <span className="text-xs text-secondary">3 crédits restants</span>
                  )}
                </div>
              )}
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition">
            {getSubscriptionIcon(currentPlan)}
            <span>Profil</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition">
            <Palette className="mr-2 h-4 w-4" />
            <span>Mes presets</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Statistiques</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition">
            <CreditCard className="mr-2 h-4 w-4" />
            <div className="flex items-center justify-between w-full">
              <span>Abonnement</span>
              {currentPlan === 'free' && (
                <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full">
                  Upgrade
                </span>
              )}
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 focus:dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 theme-transition"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}