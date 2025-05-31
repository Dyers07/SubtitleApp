// src/app/settings/page.tsx - Page de paramètres complète avec shadcn/ui
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Video, 
  Bell, 
  Shield, 
  Palette,
  Download,
  Zap,
  Moon,
  Sun,
  Monitor,
  Save,
  RotateCcw,
  AlertTriangle,
  HardDrive,
  Cpu,
  Globe,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // États des paramètres
  const [settings, setSettings] = useState({
    // Paramètres vidéo
    defaultQuality: '1080p',
    defaultFps: '60',
    defaultFormat: 'mp4',
    renderMode: 'optimized',
    
    // Paramètres d'export
    autoDownload: true,
    compressionLevel: 'medium',
    watermark: false,
    
    // Notifications
    emailNotifications: true,
    exportNotifications: true,
    marketingEmails: false,
    pushNotifications: true,
    
    // Interface
    language: 'fr',
    autoSave: true,
    showTooltips: true,
    
    // Confidentialité
    analytics: true,
    crashReports: true,
    videoRetention: '30',
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulation de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Paramètres sauvegardés avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      defaultQuality: '1080p',
      defaultFps: '60',
      defaultFormat: 'mp4',
      renderMode: 'optimized',
      autoDownload: true,
      compressionLevel: 'medium',
      watermark: false,
      emailNotifications: true,
      exportNotifications: true,
      marketingEmails: false,
      pushNotifications: true,
      language: 'fr',
      autoSave: true,
      showTooltips: true,
      analytics: true,
      crashReports: true,
      videoRetention: '30',
    });
    toast.info('Paramètres remis par défaut');
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Paramètres"
        subtitle="Personnalisez votre expérience Dyers Captions"
        showBackButton
        onBack={() => router.push('/')}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetSettings}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="video" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="video">
              <Video className="h-4 w-4 mr-2" />
              Vidéo
            </TabsTrigger>
            <TabsTrigger value="interface">
              <Palette className="h-4 w-4 mr-2" />
              Interface
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="h-4 w-4 mr-2" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Settings className="h-4 w-4 mr-2" />
              Avancé
            </TabsTrigger>
          </TabsList>

          {/* Paramètres Vidéo */}
          <TabsContent value="video">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres par défaut</CardTitle>
                  <CardDescription>
                    Configuration par défaut pour vos nouveaux projets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Qualité de sortie</Label>
                      <Select value={settings.defaultQuality} onValueChange={(value) => updateSetting('defaultQuality', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720p (HD)</SelectItem>
                          <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                          <SelectItem value="1440p">1440p (2K)</SelectItem>
                          <SelectItem value="2160p">2160p (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Images par seconde</Label>
                      <Select value={settings.defaultFps} onValueChange={(value) => updateSetting('defaultFps', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 FPS</SelectItem>
                          <SelectItem value="60">60 FPS (Recommandé)</SelectItem>
                          <SelectItem value="120">120 FPS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Format de sortie</Label>
                      <Select value={settings.defaultFormat} onValueChange={(value) => updateSetting('defaultFormat', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4 (Recommandé)</SelectItem>
                          <SelectItem value="mov">MOV</SelectItem>
                          <SelectItem value="avi">AVI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Mode de rendu</Label>
                      <Select value={settings.renderMode} onValueChange={(value) => updateSetting('renderMode', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="optimized">🚀 Optimisé (3x plus rapide)</SelectItem>
                          <SelectItem value="standard">⚡ Standard (qualité max)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertDescription>
                      Le mode optimisé utilise des algorithmes avancés pour réduire le temps de rendu 
                      tout en conservant une qualité exceptionnelle.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export et téléchargement</CardTitle>
                  <CardDescription>
                    Options pour le processus d'export
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Téléchargement automatique</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Télécharger automatiquement après l'export
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoDownload}
                      onCheckedChange={(checked) => updateSetting('autoDownload', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Niveau de compression</Label>
                    <Select value={settings.compressionLevel} onValueChange={(value) => updateSetting('compressionLevel', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible (meilleure qualité, fichier plus lourd)</SelectItem>
                        <SelectItem value="medium">Moyen (équilibré)</SelectItem>
                        <SelectItem value="high">Élevé (fichier plus petit, qualité réduite)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Filigrane Dyers Captions</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ajouter le logo sur les exports (plan gratuit uniquement)
                      </p>
                    </div>
                    <Switch
                      checked={settings.watermark}
                      onCheckedChange={(checked) => updateSetting('watermark', checked)}
                      disabled
                    />
                  </div>

                  <Alert>
                    <Download className="h-4 w-4" />
                    <AlertDescription>
                      Les utilisateurs Pro peuvent désactiver le filigrane et bénéficient 
                      de téléchargements prioritaires.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Interface */}
          <TabsContent value="interface">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Apparence</CardTitle>
                  <CardDescription>
                    Personnalisez l'apparence de l'interface
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Thème de l'interface</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('light')}
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        Clair
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('dark')}
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        Sombre
                      </Button>
                      <Button
                        variant={theme === 'system' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('system')}
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        Système
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Le thème système s'adapte automatiquement à vos préférences OS
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Langue de l'interface</Label>
                    <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                        <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                        <SelectItem value="pt">🇵🇹 Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sauvegarde automatique</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sauvegarder automatiquement vos modifications
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoSave}
                        onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Infobulles d'aide</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Afficher les conseils au survol des éléments
                        </p>
                      </div>
                      <Switch
                        checked={settings.showTooltips}
                        onCheckedChange={(checked) => updateSetting('showTooltips', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Raccourcis clavier</CardTitle>
                  <CardDescription>
                    Personnalisez vos raccourcis pour gagner du temps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Lecture/Pause</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Espace</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Exporter</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl + E</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Annuler</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl + Z</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Refaire</span>
                      <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">Ctrl + Y</kbd>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    Personnaliser les raccourcis
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de notification</CardTitle>
                  <CardDescription>
                    Choisissez comment et quand vous souhaitez être notifié
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications par email</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recevoir des notifications importantes par email
                      </p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications d'export</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Être notifié quand un export est terminé ou échoue
                      </p>
                    </div>
                    <Switch
                      checked={settings.exportNotifications}
                      onCheckedChange={(checked) => updateSetting('exportNotifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications push</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Notifications directement dans le navigateur
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Emails marketing</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nouveautés, conseils et offres spéciales
                      </p>
                    </div>
                    <Switch
                      checked={settings.marketingEmails}
                      onCheckedChange={(checked) => updateSetting('marketingEmails', checked)}
                    />
                  </div>

                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertDescription>
                      Les notifications d'export vous permettent de suivre vos rendus 
                      même si vous fermez l'onglet.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fréquence des notifications</CardTitle>
                  <CardDescription>
                    Contrôlez la fréquence des emails que vous recevez
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Résumé d'activité</Label>
                    <Select defaultValue="weekly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidien</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="never">Jamais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Conseils et astuces</Label>
                    <Select defaultValue="monthly">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="never">Jamais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Confidentialité */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Données et confidentialité</CardTitle>
                  <CardDescription>
                    Gérez vos données personnelles et leur utilisation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rétention des vidéos</Label>
                    <Select value={settings.videoRetention} onValueChange={(value) => updateSetting('videoRetention', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 jours</SelectItem>
                        <SelectItem value="30">30 jours (Recommandé)</SelectItem>
                        <SelectItem value="90">90 jours</SelectItem>
                        <SelectItem value="never">Jamais supprimer</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Durée de conservation de vos vidéos sur nos serveurs sécurisés
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Analyses d'utilisation</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Nous aider à améliorer le produit (données anonymisées)
                      </p>
                    </div>
                    <Switch
                      checked={settings.analytics}
                      onCheckedChange={(checked) => updateSetting('analytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Rapports de crash</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Envoyer automatiquement les rapports d'erreur
                      </p>
                    </div>
                    <Switch
                      checked={settings.crashReports}
                      onCheckedChange={(checked) => updateSetting('crashReports', checked)}
                    />
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Vos vidéos et données personnelles sont toujours chiffrées de bout en bout 
                      et ne sont jamais partagées avec des tiers.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contrôle des données</CardTitle>
                  <CardDescription>
                    Gérez vos données personnelles selon le RGPD
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger mes données
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      Voir la politique de confidentialité
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Données collectées :</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Métadonnées des vidéos (durée, résolution)</li>
                      <li>• Historique d'utilisation (anonymisé)</li>
                      <li>• Préférences et paramètres</li>
                      <li>• Données de facturation (si applicable)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Paramètres avancés */}
          <TabsContent value="advanced">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de performance</CardTitle>
                  <CardDescription>
                    Optimisez les performances selon votre matériel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Ces paramètres sont destinés aux utilisateurs expérimentés. 
                      Modifiez-les uniquement si vous savez ce que vous faites.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Serveur de rendu préféré</Label>
                      <Select defaultValue="auto">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">🌍 Automatique (recommandé)</SelectItem>
                          <SelectItem value="eu-west">🇪🇺 Europe Ouest</SelectItem>
                          <SelectItem value="us-east">🇺🇸 États-Unis Est</SelectItem>
                          <SelectItem value="asia-pacific">🌏 Asie Pacifique</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Choisir le serveur le plus proche réduit la latence
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Limite de concurrence de rendu</Label>
                      <Select defaultValue="auto">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Automatique</SelectItem>
                          <SelectItem value="1">1 processus (économie d'énergie)</SelectItem>
                          <SelectItem value="2">2 processus (équilibré)</SelectItem>
                          <SelectItem value="4">4 processus (performance)</SelectItem>
                          <SelectItem value="8">8 processus (maximum)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Plus de processus = rendu plus rapide mais consommation accrue
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Qualité d'encodage</Label>
                      <Select defaultValue="balanced">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fast">Rapide (qualité réduite)</SelectItem>
                          <SelectItem value="balanced">Équilibré (recommandé)</SelectItem>
                          <SelectItem value="quality">Qualité maximum (plus lent)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outils de développement</CardTitle>
                  <CardDescription>
                    Outils de diagnostic et de maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cache local</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Logs système
                        </Button>
                        <Button variant="outline" size="sm">
                          <Cpu className="h-4 w-4 mr-2" />
                          Test performance
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Outils pour diagnostiquer les problèmes techniques
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Mode développeur</Label>
                    <div className="flex items-center gap-4">
                      <Switch defaultChecked={false} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Active la console de débogage et les logs détaillés
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Zone de danger</CardTitle>
                  <CardDescription>
                    Actions irréversibles - utilisez avec précaution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        Supprimer toutes les vidéos
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Supprime définitivement toutes vos vidéos et projets stockés.
                      </p>
                      <Button variant="destructive" size="sm">
                        Supprimer toutes les vidéos
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        Réinitialiser tous les paramètres
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Remet tous les paramètres à leur valeur par défaut.
                      </p>
                      <Button variant="destructive" size="sm">
                        Réinitialiser les paramètres
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">
                        Supprimer définitivement le compte
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Supprime votre compte et toutes les données associées de manière irréversible.
                      </p>
                      <Button variant="destructive" size="sm">
                        Supprimer mon compte
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informations système</CardTitle>
                  <CardDescription>
                    Détails techniques sur votre environnement et l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Version de l'app</p>
                        <p className="text-gray-500 dark:text-gray-400">v1.2.3-alpha</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Build</p>
                        <p className="text-gray-500 dark:text-gray-400">#2547 (30 mai 2025)</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Navigateur</p>
                        <p className="text-gray-500 dark:text-gray-400">Chrome 120.0.0</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Système d'exploitation</p>
                        <p className="text-gray-500 dark:text-gray-400">Windows 11 Pro</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Région</p>
                        <p className="text-gray-500 dark:text-gray-400">Europe/Paris (UTC+1)</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Dernière synchronisation</p>
                        <p className="text-gray-500 dark:text-gray-400">Il y a 2 minutes</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Statut de synchronisation
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✅ Tous les paramètres sont synchronisés
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Forcer la synchronisation
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Section Backup et Restauration */}
              <Card>
                <CardHeader>
                  <CardTitle>Sauvegarde et restauration</CardTitle>
                  <CardDescription>
                    Gérez vos sauvegardes de paramètres et projets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sauvegarde automatique</Label>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={true} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Sauvegarder automatiquement tous les paramètres
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Dernière sauvegarde : Il y a 5 minutes
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Actions manuelles</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Exporter
                        </Button>
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Importer
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Sauvegardez ou restaurez manuellement
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      Les sauvegardes sont chiffrées et stockées de manière sécurisée. 
                      Vous pouvez les restaurer sur n'importe quel appareil.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Section Expérimental */}
              <Card>
                <CardHeader>
                  <CardTitle>Fonctionnalités expérimentales</CardTitle>
                  <CardDescription>
                    Testez les nouvelles fonctionnalités en avant-première
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Les fonctionnalités expérimentales peuvent être instables. 
                      Utilisez-les à vos risques et périls.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Rendu GPU accéléré</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Utilise votre carte graphique pour accélérer le rendu (Beta)
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Transcription en temps réel</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Génère les sous-titres pendant l'upload (Alpha)
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Interface redessinée</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nouvelle interface utilisateur plus moderne (Preview)
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Export 4K optimisé</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Rendu 4K avec algorithmes d'upscaling IA (Beta)
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </TabsContent>
        </Tabs>

        {/* Footer avec informations de sauvegarde */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Paramètres synchronisés
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Dernière sauvegarde automatique : il y a 2 minutes
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Historique des modifications
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}