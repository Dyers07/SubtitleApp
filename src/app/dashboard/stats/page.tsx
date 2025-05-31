// src/app/dashboard/stats/page.tsx - Page de statistiques avec shadcn/ui
'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Video, 
  Clock, 
  Zap, 
  Download,
  Eye,
  Calendar,
  Target,
  Award,
  Users,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StatsPage() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('30d');

  // Données de démonstration
  const stats = {
    overview: {
      totalVideos: 147,
      totalDuration: 1234, // en minutes
      totalViews: 45678,
      creditsUsed: 89,
      successRate: 98.3,
      avgRenderTime: 45, // en secondes
    },
    monthly: [
      { month: 'Jan', videos: 12, duration: 45, views: 3420 },
      { month: 'Fév', videos: 19, duration: 67, views: 5230 },
      { month: 'Mar', videos: 23, duration: 89, views: 6780 },
      { month: 'Avr', videos: 31, duration: 123, views: 8940 },
      { month: 'Mai', videos: 28, duration: 156, views: 7890 },
      { month: 'Juin', videos: 34, duration: 198, views: 9560 },
    ],
    topFormats: [
      { format: 'TikTok (9:16)', count: 89, percentage: 60.5 },
      { format: 'YouTube (16:9)', count: 34, percentage: 23.1 },
      { format: 'Instagram Stories', count: 16, percentage: 10.9 },
      { format: 'Autres', count: 8, percentage: 5.4 },
    ],
    recentActivity: [
      { date: '2025-05-30', action: 'Export vidéo', details: 'Tutorial-React-60fps.mp4', status: 'success' },
      { date: '2025-05-29', action: 'Nouveau projet', details: 'Demo-App-Mobile', status: 'success' },
      { date: '2025-05-29', action: 'Export vidéo', details: 'Présentation-Produit.mp4', status: 'success' },
      { date: '2025-05-28', action: 'Export vidéo', details: 'Formation-Team.mp4', status: 'failed' },
      { date: '2025-05-27', action: 'Export vidéo', details: 'Review-Features.mp4', status: 'success' },
    ],
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Statistiques"
        subtitle="Analysez votre activité et vos performances"
        showBackButton
        onBack={() => router.push('/')}
        actions={
          <div className="flex items-center gap-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border rounded px-3 py-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">Cette année</option>
            </select>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vidéos créées</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.overview.totalVideos}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% ce mois
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Durée totale</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatDuration(stats.overview.totalDuration)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% ce mois
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vues totales</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{formatNumber(stats.overview.totalViews)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +23% ce mois
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de succès</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.overview.successRate}%</p>
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center mt-1">
                    <Award className="h-3 w-3 mr-1" />
                    Excellent
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                  <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets détaillés */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="usage">Utilisation</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique temporel */}
              <Card>
                <CardHeader>
                  <CardTitle>Évolution mensuelle</CardTitle>
                  <CardDescription>Nombre de vidéos créées par mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.monthly.map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{month.month}</span>
                        <div className="flex-1 mx-4">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${(month.videos / 35) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                          {month.videos}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Formats populaires */}
              <Card>
                <CardHeader>
                  <CardTitle>Formats populaires</CardTitle>
                  <CardDescription>Répartition par format de sortie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topFormats.map((format, index) => (
                      <div key={format.format} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                          }`} />
                          <span className="text-sm font-medium">{format.format}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {format.count} ({format.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temps de rendu moyen</CardTitle>
                  <CardDescription>Performance du système</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {stats.overview.avgRenderTime}s
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Moyenne des 30 derniers jours
                    </p>
                    <Badge className="mt-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                      <Zap className="h-3 w-3 mr-1" />
                      Excellent
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Qualité moyenne</CardTitle>
                  <CardDescription>Résolution de sortie</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">1080p</span>
                      <span className="text-sm font-medium">73%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">720p</span>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">4K</span>
                      <span className="text-sm font-medium">9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mode de rendu</CardTitle>
                  <CardDescription>Préférences d'export</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Optimisé</span>
                      <span className="text-sm font-medium">82%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Standard</span>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                  </div>
                  <Badge className="mt-3 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    <Zap className="h-3 w-3 mr-1" />
                    Mode rapide privilégié
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Utilisation */}
          <TabsContent value="usage">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Crédits consommés</CardTitle>
                  <CardDescription>Utilisation sur les 6 derniers mois</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.monthly.map((month, index) => {
                      const credits = Math.floor(month.videos * 1.2); // Simulation
                      return (
                        <div key={month.month} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{month.month}</span>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-orange-500 h-2 rounded-full" 
                                style={{ width: `${(credits / 50) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                            {credits}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Heures d'activité</CardTitle>
                  <CardDescription>Quand vous utilisez le plus l'app</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from({ length: 24 }, (_, i) => {
                      const activity = Math.random() * 100;
                      return (
                        <div key={i} className="text-center">
                          <div 
                            className="bg-blue-500 rounded mb-1" 
                            style={{ height: `${Math.max(activity, 10)}px` }}
                          />
                          <span className="text-xs text-gray-500">{i}h</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activité récente */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>Vos dernières actions sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</p>
                        <Badge 
                          variant={activity.status === 'success' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {activity.status === 'success' ? 'Succès' : 'Échec'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}