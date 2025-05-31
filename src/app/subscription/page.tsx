// src/app/subscription/page.tsx - Page d'abonnement avec shadcn/ui
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Crown, 
  Check, 
  X, 
  Zap, 
  Video, 
  Sparkles,
  CreditCard,
  Shield,
  Headphones,
  Rocket,
  Star
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SubscriptionPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const plans = {
    free: {
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      credits: 20,
      features: [
        { name: '20 crédits par mois', included: true },
        { name: 'Qualité 60 FPS', included: true },
        { name: 'Transcription IA', included: true },
        { name: 'Exports HD', included: true },
        { name: 'Presets de base', included: true },
        { name: 'Exports illimités', included: false },
        { name: 'Presets premium', included: false },
        { name: 'Support prioritaire', included: false },
        { name: 'Fonctionnalités bêta', included: false },
      ]
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 19,
      annualPrice: 15,
      credits: 'Illimités',
      features: [
        { name: 'Crédits illimités', included: true },
        { name: 'Qualité 60 FPS', included: true },
        { name: 'Transcription IA avancée', included: true },
        { name: 'Exports HD/4K', included: true },
        { name: 'Tous les presets', included: true },
        { name: 'Exports illimités', included: true },
        { name: 'Presets premium', included: true },
        { name: 'Support prioritaire', included: true },
        { name: 'Fonctionnalités bêta', included: true },
      ]
    }
  };

  const handleSubscribe = async (planType: 'free' | 'pro') => {
    setIsLoading(true);
    try {
      if (planType === 'pro') {
        // Simulation d'un processus de paiement
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Abonnement Pro activé ! 🎉');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'abonnement');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = profile?.subscription || 'free';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Plans et tarifs"
        subtitle="Choisissez le plan qui correspond à vos besoins"
        showBackButton
        onBack={() => router.push('/')}
      />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header avec toggle annuel */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Débloquez votre créativité
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Créez des sous-titres professionnels sans limites
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
              Mensuel
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <span className={`text-sm ${isAnnual ? 'font-semibold text-gray-900 dark:text-gray-100' : 'text-gray-500'}`}>
              Annuel
            </span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              -20%
            </Badge>
          </div>
        </div>

        {/* Plans de tarification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Plan Free */}
          <Card className={`relative ${currentPlan === 'free' ? 'ring-2 ring-blue-500' : ''}`}>
            {currentPlan === 'free' && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                Plan actuel
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Sparkles className="h-6 w-6 text-blue-500" />
                Free
              </CardTitle>
              <CardDescription>Parfait pour découvrir</CardDescription>
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                0€<span className="text-lg font-normal text-gray-500">/mois</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                  {plans.free.credits} crédits/mois
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ~20 vidéos courtes
                </p>
              </div>

              <ul className="space-y-3">
                {plans.free.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${feature.included ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={currentPlan === 'free' ? 'outline' : 'default'}
                disabled={currentPlan === 'free'}
              >
                {currentPlan === 'free' ? 'Plan actuel' : 'Commencer gratuitement'}
              </Button>
            </CardContent>
          </Card>

          {/* Plan Pro */}
          <Card className={`relative border-orange-200 dark:border-orange-800 ${currentPlan === 'pro' ? 'ring-2 ring-orange-500' : ''}`}>
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500">
              <Crown className="h-3 w-3 mr-1" />
              {currentPlan === 'pro' ? 'Plan actuel' : 'Recommandé'}
            </Badge>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Crown className="h-6 w-6 text-orange-500" />
                Pro
              </CardTitle>
              <CardDescription>Pour les créateurs professionnels</CardDescription>
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                {isAnnual ? plans.pro.annualPrice : plans.pro.monthlyPrice}€
                <span className="text-lg font-normal text-gray-500">
                  /{isAnnual ? 'mois' : 'mois'}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Facturé {plans.pro.annualPrice * 12}€/an (économisez 48€)
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <div className="text-xl font-semibold text-orange-600 dark:text-orange-400">
                  {plans.pro.credits} crédits
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Créations illimitées
                </p>
              </div>

              <ul className="space-y-3">
                {plans.pro.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600" 
                onClick={() => handleSubscribe('pro')}
                disabled={isLoading || currentPlan === 'pro'}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {currentPlan === 'pro' 
                  ? 'Plan actuel' 
                  : isLoading 
                    ? 'Traitement...' 
                    : 'Passer au Pro'
                }
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Fonctionnalités détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Rendu 60 FPS</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Qualité ultra-fluide pour vos vidéos professionnelles
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Video className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">IA Avancée</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Transcription automatique avec reconnaissance vocale précise
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Support Prioritaire</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Assistance dédiée et réponse rapide à vos questions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Questions fréquentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Puis-je changer de plan à tout moment ?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Oui, vous pouvez passer au plan Pro ou revenir au plan gratuit à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Que se passe-t-il si j'annule mon abonnement Pro ?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vous conservez l'accès aux fonctionnalités Pro jusqu'à la fin de votre période de facturation, 
                puis vous revenez automatiquement au plan gratuit.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Les crédits non utilisés sont-ils reportés ?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pour le plan gratuit, les crédits non utilisés ne sont pas reportés et se réinitialisent chaque mois. 
                Le plan Pro offre des crédits illimités.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}