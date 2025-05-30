// src/app/profile/page.tsx - Page principale du profil
'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  BarChart3, 
  Video, 
  Palette, 
  Settings,
  Camera,
  Save,
  Loader2
} from 'lucide-react';

interface ProfileSection {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const sections: ProfileSection[] = [
  { id: 'general', name: 'Informations générales', icon: <User className="h-4 w-4" /> },
  { id: 'subscription', name: 'Abonnement', icon: <Crown className="h-4 w-4" /> },
  { id: 'statistics', name: 'Statistiques', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'presets', name: 'Mes presets', icon: <Palette className="h-4 w-4" /> },
  { id: 'settings', name: 'Paramètres', icon: <Settings className="h-4 w-4" /> },
];

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: user?.email || '',
  });

  if (!user) return null;

  const displayName = profile?.name || user.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({ name: formData.name });
      if (error) throw error;
      
      toast.success('✅ Profil mis à jour');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    const badges = {
      free: { color: 'bg-gray-100 text-gray-800', icon: null },
      pro: { color: 'bg-blue-100 text-blue-800', icon: <BarChart3 className="h-3 w-3" /> },
      premium: { color: 'bg-purple-100 text-purple-800', icon: <Crown className="h-3 w-3" /> },
    };
    
    const badge = badges[subscription as keyof typeof badges] || badges.free;
    
    return (
      <Badge className={`${badge.color} flex items-center gap-1`}>
        {badge.icon}
        {subscription.toUpperCase()}
      </Badge>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo de profil */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url || ''} alt={displayName} />
                    <AvatarFallback className="text-lg bg-blue-500 text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{displayName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {getSubscriptionBadge(profile?.subscription || 'free')}
                </div>
              </div>

              <Separator />

              {/* Formulaire */}
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Votre nom"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Membre depuis</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(profile?.created_at || user.created_at || Date.now()).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <Button onClick={handleSave} disabled={loading} className="w-fit">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Sauvegarder
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'subscription':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Abonnement et facturation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <Crown className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Plan {(profile?.subscription || 'free').toUpperCase()}</h3>
                
                {profile?.subscription === 'free' && (
                  <>
                    <p className="text-muted-foreground mb-4">
                      3 vidéos par mois • Qualité standard • Support communautaire
                    </p>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                      Upgrader vers Pro
                    </Button>
                  </>
                )}
                
                {profile?.subscription === 'pro' && (
                  <p className="text-muted-foreground">
                    20 vidéos par mois • Qualité HD • Support prioritaire
                  </p>
                )}
                
                {profile?.subscription === 'premium' && (
                  <p className="text-muted-foreground">
                    100 vidéos par mois • Qualité 4K • Support VIP • API access
                  </p>
                )}
              </div>

              {/* Plans disponibles */}
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { 
                    name: 'Free', 
                    price: '0€', 
                    videos: '3', 
                    features: ['Qualité standard', 'Support communautaire', '8 animations'],
                    current: (profile?.subscription || 'free') === 'free'
                  },
                  { 
                    name: 'Pro', 
                    price: '9€', 
                    videos: '20', 
                    features: ['Qualité HD', 'Support prioritaire', 'Presets avancés'],
                    current: profile?.subscription === 'pro'
                  },
                  { 
                    name: 'Premium', 
                    price: '29€', 
                    videos: '100', 
                    features: ['Qualité 4K', 'Support VIP', 'API access', 'Fonctions beta'],
                    current: profile?.subscription === 'premium'
                  },
                ].map((plan, index) => (
                  <Card key={index} className={plan.current ? 'ring-2 ring-blue-500' : ''}>
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal">/mois</span></div>
                      <p className="text-sm text-muted-foreground">{plan.videos} vidéos/mois</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full mt-4" 
                        variant={plan.current ? 'secondary' : 'default'}
                        disabled={plan.current}
                      >
                        {plan.current ? 'Plan actuel' : 'Choisir ce plan'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'statistics':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistiques d'utilisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Vidéos créées', value: '12', icon: <Video className="h-4 w-4" />, color: 'text-blue-500' },
                  { label: 'Temps de traitement', value: '2h 34m', icon: <BarChart3 className="h-4 w-4" />, color: 'text-green-500' },
                  { label: 'Presets créés', value: '5', icon: <Palette className="h-4 w-4" />, color: 'text-purple-500' },
                  { label: 'Votes reçus', value: '28', icon: <Crown className="h-4 w-4" />, color: 'text-orange-500' },
                ].map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-4 text-center">
                      <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Section en développement...</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Profil utilisateur"
        subtitle={`Gérez votre compte ${displayName}`}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar navigation */}
          <div className="w-64 space-y-2">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'default' : 'ghost'}
                onClick={() => setActiveSection(section.id)}
                className="w-full justify-start"
              >
                {section.icon}
                {section.name}
              </Button>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}