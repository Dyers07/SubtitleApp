// src/app/profile/page.tsx - Page de profil avec shadcn/ui
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Crown, 
  Calendar, 
  Video, 
  Zap, 
  Settings,
  CreditCard,
  BarChart3,
  Save,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // États du formulaire
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }
    setName(profile?.name || '');
    setEmail(user?.email || '');
  }, [user, profile, router]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({ name });
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Redirection...</div>;
  }

  const displayName = profile?.name || user.email?.split('@')[0] || 'Utilisateur';
  const initials = displayName.slice(0, 2).toUpperCase();
  const joinDate = new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR');

  // Stats factices pour la démo
  const stats = {
    videosCreated: 12,
    totalDuration: 45.6,
    creditsUsed: 8,
    creditsRemaining: 12,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Profil utilisateur"
        subtitle={`Gérez votre compte et vos préférences`}
        showBackButton
        onBack={() => router.push('/')}
      />

      <div className="max-w-4xl mx-auto p-6">
        {/* Header de profil */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {displayName}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-2">{email}</p>
                
                <div className="flex items-center gap-3">
                  <Badge variant={profile?.subscription === 'pro' ? 'default' : 'secondary'}>
                    <Crown className="h-3 w-3 mr-1" />
                    {profile?.subscription?.toUpperCase() || 'FREE'}
                  </Badge>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    Membre depuis le {joinDate}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.creditsRemaining}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Crédits restants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vidéos créées</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.videosCreated}</p>
                </div>
                <Video className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Durée totale</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalDuration}min</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Crédits utilisés</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.creditsUsed}</p>
                </div>
                <Zap className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <Crown className="h-4 w-4 mr-2" />
              Abonnement
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          {/* Onglet Profil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Modifiez vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Votre nom"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="bg-gray-50 dark:bg-gray-800"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      L'email ne peut pas être modifié
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveProfile} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Abonnement */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Gestion de l'abonnement</CardTitle>
                <CardDescription>
                  Gérez votre plan et vos crédits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan actuel */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Plan {profile?.subscription?.toUpperCase() || 'FREE'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {profile?.subscription === 'pro' 
                          ? 'Créations illimitées et fonctionnalités avancées' 
                          : 'Plan gratuit avec crédits limités'
                        }
                      </p>
                    </div>
                    <Badge variant={profile?.subscription === 'pro' ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                      <Crown className="h-4 w-4 mr-2" />
                      {profile?.subscription?.toUpperCase() || 'FREE'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Crédits utilisés ce mois</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.creditsUsed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Crédits restants</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.creditsRemaining}</p>
                    </div>
                  </div>

                  {profile?.subscription !== 'pro' && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Passez au plan Pro pour des crédits illimités et des fonctionnalités avancées !
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Plans disponibles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className={profile?.subscription === 'free' ? 'ring-2 ring-blue-500' : ''}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Plan Free
                        <Badge variant="secondary">Actuel</Badge>
                      </CardTitle>
                      <CardDescription>Parfait pour commencer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">0€<span className="text-sm font-normal">/mois</span></div>
                      <ul className="space-y-2 text-sm">
                        <li>✅ 20 crédits par mois</li>
                        <li>✅ Qualité 60 FPS</li>
                        <li>✅ IA de transcription</li>
                        <li>❌ Exports illimités</li>
                        <li>❌ Presets avancés</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className={profile?.subscription === 'pro' ? 'ring-2 ring-orange-500' : 'border-orange-200'}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Plan Pro
                        <Badge className="bg-orange-500">
                          <Crown className="h-3 w-3 mr-1" />
                          Recommandé
                        </Badge>
                      </CardTitle>
                      <CardDescription>Pour les créateurs professionnels</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold mb-4">19€<span className="text-sm font-normal">/mois</span></div>
                      <ul className="space-y-2 text-sm">
                        <li>✅ Crédits illimités</li>
                        <li>✅ Qualité 60 FPS</li>
                        <li>✅ IA de transcription avancée</li>
                        <li>✅ Exports illimités</li>
                        <li>✅ Presets premium</li>
                        <li>✅ Support prioritaire</li>
                      </ul>
                      <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {profile?.subscription === 'pro' ? 'Gérer l\'abonnement' : 'Passer au Pro'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences d'export</CardTitle>
                  <CardDescription>
                    Configurez vos paramètres par défaut
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mode de rendu par défaut</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Choisissez votre mode de rendu préféré</p>
                    </div>
                    <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700">
                      <option>Optimisé (3x plus rapide)</option>
                      <option>Standard (qualité max)</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Qualité vidéo par défaut</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Résolution de sortie</p>
                    </div>
                    <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700">
                      <option>1080x1920 (TikTok/Instagram)</option>
                      <option>1920x1080 (YouTube)</option>
                      <option>720x1280 (Stories)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Gérez vos préférences de notification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications d'export</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir un email quand l'export est terminé</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Nouveautés produit</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Être informé des nouvelles fonctionnalités</p>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Zone de danger</CardTitle>
                  <CardDescription>
                    Actions irréversibles sur votre compte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Supprimer le compte</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Cette action supprimera définitivement votre compte et toutes vos données.
                    </p>
                    <Button variant="destructive" size="sm">
                      Supprimer mon compte
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}