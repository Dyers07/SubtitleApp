// src/app/help/page.tsx - Page d'aide complète avec shadcn/ui
'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  HelpCircle, 
  Video, 
  Zap, 
  Settings, 
  CreditCard,
  Mail,
  MessageCircle,
  Book,
  Play,
  Download,
  Upload,
  Wand2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'getting-started',
      title: 'Commencer',
      icon: Play,
      color: 'text-blue-500',
      articles: [
        { title: 'Comment créer ma première vidéo sous-titrée', popular: true },
        { title: 'Importer une vidéo', popular: false },
        { title: 'Comprendre les crédits', popular: true },
      ]
    },
    {
      id: 'customization',
      title: 'Personnalisation',
      icon: Wand2,
      color: 'text-purple-500',
      articles: [
        { title: 'Modifier les styles de sous-titres', popular: true },
        { title: 'Utiliser les presets', popular: false },
        { title: 'Positionnement des sous-titres', popular: true },
      ]
    },
    {
      id: 'export',
      title: 'Export & Qualité',
      icon: Download,
      color: 'text-green-500',
      articles: [
        { title: 'Exporter en 60 FPS', popular: true },
        { title: 'Choisir la qualité de sortie', popular: false },
        { title: 'Résoudre les problèmes d\'export', popular: false },
      ]
    },
    {
      id: 'billing',
      title: 'Facturation',
      icon: CreditCard,
      color: 'text-orange-500',
      articles: [
        { title: 'Comprendre les plans tarifaires', popular: true },
        { title: 'Gérer mon abonnement', popular: false },
        { title: 'Remboursements et annulations', popular: false },
      ]
    }
  ];

  const faqs = [
    {
      question: "Comment fonctionne la transcription automatique ?",
      answer: "Notre IA analyse votre vidéo et génère automatiquement les sous-titres. Vous pouvez ensuite les modifier, ajuster le timing et personnaliser l'apparence avant l'export final.",
    },
    {
      question: "Pourquoi choisir le rendu 60 FPS ?",
      answer: "Le rendu 60 FPS offre une fluidité exceptionnelle, particulièrement visible lors des animations de sous-titres. C'est idéal pour les contenus destinés aux réseaux sociaux modernes.",
    },
    {
      question: "Quels formats vidéo sont supportés ?",
      answer: "Nous supportons MP4, MOV, AVI, et la plupart des formats vidéo courants. La taille maximale est de 500 MB pour le plan gratuit et 2 GB pour le plan Pro.",
    },
    {
      question: "Puis-je utiliser mes propres polices ?",
      answer: "Actuellement, nous proposons une sélection de polices optimisées pour la lisibilité. Le support des polices personnalisées sera ajouté dans une future mise à jour.",
    },
    {
      question: "Comment optimiser mes crédits ?",
      answer: "Chaque export consomme 1 crédit. Pour optimiser : utilisez le mode preview avant l'export final, testez avec des vidéos courtes, et passez au plan Pro pour des crédits illimités.",
    },
    {
      question: "Mes données sont-elles sécurisées ?",
      answer: "Oui, toutes vos vidéos sont stockées de manière sécurisée et supprimées automatiquement après 30 jours. Nous ne partageons jamais vos contenus avec des tiers.",
    },
    {
      question: "Comment déplacer les sous-titres sur ma vidéo ?",
      answer: "Cliquez sur les sous-titres dans le lecteur vidéo pour les sélectionner, puis glissez-les à la position souhaitée. Des guides vous aident à aligner parfaitement.",
    },
    {
      question: "Puis-je modifier le texte des sous-titres ?",
      answer: "Absolument ! Utilisez l'éditeur de légendes à droite pour modifier le texte, ajuster les timings, ou supprimer des segments entiers.",
    },
    {
      question: "Que faire si l'export échoue ?",
      answer: "Vérifiez votre connexion internet, essayez avec une vidéo plus courte, ou contactez le support. La plupart des échecs sont dus à des fichiers trop volumineux ou corrompus.",
    },
    {
      question: "Comment annuler mon abonnement Pro ?",
      answer: "Allez dans Profil > Abonnement et cliquez sur 'Gérer l'abonnement'. Vous pouvez annuler à tout moment et garder l'accès jusqu'à la fin de la période payée.",
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Centre d'aide"
        subtitle="Trouvez rapidement les réponses à vos questions"
        showBackButton
        onBack={() => router.push('/')}
      />

      <div className="max-w-4xl mx-auto p-6">
        {/* Barre de recherche */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher dans l'aide..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact rapide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Support par email</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Réponse sous 24h</p>
                </div>
                <Button variant="outline" size="sm">
                  Contacter
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Chat en direct</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Lun-Ven 9h-18h</p>
                </div>
                <Button variant="outline" size="sm">
                  Démarrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Catégories d'aide */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4 inline-block">
                      <Icon className={`h-8 w-8 ${category.color}`} />
                    </div>
                    <h3 className="font-semibold mb-2">{category.title}</h3>
                    <div className="space-y-1">
                      {category.articles.map((article, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 truncate">
                            {article.title}
                          </span>
                          {article.popular && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Populaire
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Questions fréquentes
            </CardTitle>
            <CardDescription>
              Les réponses aux questions les plus courantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            {filteredFaqs.length === 0 && searchQuery && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun résultat trouvé pour "{searchQuery}"
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setSearchQuery('')}
                >
                  Effacer la recherche
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guides pas à pas */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Guides pas à pas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-500" />
                  Créer sa première vidéo
                </CardTitle>
                <CardDescription>
                  Guide complet pour débuter avec Dyers Captions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>1. Importez votre vidéo (MP4, MOV, AVI)</li>
                  <li>2. Attendez la transcription automatique</li>
                  <li>3. Personnalisez vos sous-titres</li>
                  <li>4. Prévisualisez le résultat</li>
                  <li>5. Exportez en 60 FPS</li>
                </ol>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Book className="h-4 w-4 mr-2" />
                  Voir le guide détaillé
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  Optimiser ses sous-titres
                </CardTitle>
                <CardDescription>
                  Conseils pour des sous-titres professionnels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>1. Choisissez la bonne police</li>
                  <li>2. Ajustez la taille et les couleurs</li>
                  <li>3. Positionnez strategiquement</li>
                  <li>4. Testez sur différents écrans</li>
                  <li>5. Utilisez les presets Pro</li>
                </ol>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Voir les conseils
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-500" />
                  Formats supportés
                </CardTitle>
                <CardDescription>
                  Tout savoir sur les formats d'import et export
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Import :</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">MP4, MOV, AVI, WMV, MKV</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Export :</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">MP4 (H.264), 60 FPS</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-1">Taille max :</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">500 MB (Free), 2 GB (Pro)</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Upload className="h-4 w-4 mr-2" />
                  Guide des formats
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Résoudre les problèmes
                </CardTitle>
                <CardDescription>
                  Solutions aux problèmes les plus courants
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Export qui échoue ou se bloque</li>
                  <li>• Transcription incorrecte</li>
                  <li>• Problèmes de synchronisation</li>
                  <li>• Qualité dégradée</li>
                  <li>• Erreurs de téléchargement</li>
                </ul>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Settings className="h-4 w-4 mr-2" />
                  Guide dépannage
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Status et mises à jour */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>État du service</CardTitle>
            <CardDescription>
              Statut en temps réel de nos services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>API de transcription</span>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                  Opérationnel
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Serveurs de rendu</span>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                  Opérationnel
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Exports 4K</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                  Maintenance
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Stockage utilisateur</span>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                  Opérationnel
                </Badge>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Dernière mise à jour: v1.2.3
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Améliorations de performance 60 FPS
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Voir les notes de version
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact final */}
        <div className="mt-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Vous ne trouvez pas ce que vous cherchez ?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Notre équipe support est là pour vous aider
          </p>
          <div className="flex justify-center gap-4">
            <Button>
              <Mail className="h-4 w-4 mr-2" />
              Envoyer un email
            </Button>
            <Button variant="outline">
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat en direct
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}