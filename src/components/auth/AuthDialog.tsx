// src/components/auth/AuthDialog.tsx - AMÉLIORÉ avec redirections
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2, Mail, Github, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Composant Separator simple pour éviter les erreurs de type
const Separator = () => (
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t dark:border-gray-600" />
    </div>
  </div>
);

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // 🚀 NOUVEAU: État confirmation email
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const { signIn, signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Dans handleSubmit, avant le try/catch
    console.log('🔍 Debug Supabase:');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Key présente:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('Key préfixe:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10));

    try {
      let result;
      
      if (mode === 'signin') {
        result = await signIn(formData.email, formData.password);
        
        if (result?.error) {
          throw result.error;
        }

        // 🚀 CONNEXION RÉUSSIE - Fermer dialog et rediriger
        toast.success('🎉 Connexion réussie !', {
          description: 'Bienvenue dans Dyers Captions'
        });
        onOpenChange(false);
        
      } else {
        // INSCRIPTION
        if (!formData.name.trim()) {
          toast.error('Le nom est requis');
          return;
        }
        
        result = await signUp(formData.email, formData.password, formData.name);
        
        if (result?.error) {
          throw result.error;
        }

        // 🚀 INSCRIPTION RÉUSSIE - Afficher message de confirmation
        setEmailSent(true);
        toast.success('🎉 Compte créé !', {
          description: 'Vérifiez votre email pour confirmer votre compte',
          duration: 8000,
        });
      }
      
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // 🚀 Messages d'erreur améliorés
      let errorMessage = 'Erreur d\'authentification';
      
      if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (error?.message?.includes('User already registered')) {
        errorMessage = 'Un compte existe déjà avec cet email';
      } else if (error?.message?.includes('Password should be at least 6 characters')) {
        errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      } else if (error?.message?.includes('Invalid email')) {
        errorMessage = 'Format d\'email invalide';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result?.error) throw result.error;
      
      // 🚀 Fermer dialog après succès OAuth
      toast.success('🎉 Connexion Google réussie !');
      onOpenChange(false);
      
    } catch (error: any) {
      toast.error(error?.message || 'Erreur connexion Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithGitHub();
      if (result?.error) throw result.error;
      
      // 🚀 Fermer dialog après succès OAuth
      toast.success('🎉 Connexion GitHub réussie !');
      onOpenChange(false);
      
    } catch (error: any) {
      toast.error(error?.message || 'Erreur connexion GitHub');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🚀 NOUVEAU: Écran de confirmation email
  if (emailSent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Vérifiez votre email
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4 py-4">
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-semibold dark:text-gray-100">
                Email de confirmation envoyé !
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nous avons envoyé un lien de confirmation à <br />
                <strong className="text-blue-600 dark:text-blue-400">{formData.email}</strong>
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Étapes suivantes :</p>
                  <ol className="list-decimal list-inside space-y-1 text-left">
                    <li>Ouvrez votre boîte email</li>
                    <li>Cliquez sur le lien de confirmation</li>
                    <li>Revenez vous connecter ici</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setMode('signin');
                }}
                className="flex-1"
              >
                Se connecter
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {mode === 'signin' ? 'Se connecter' : 'Créer un compte'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Boutons OAuth */}
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Continuer avec Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleGitHubSignIn}
              disabled={loading}
              className="w-full"
            >
              <Github className="mr-2 h-4 w-4" />
              Continuer avec GitHub
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground dark:text-gray-400">
                ou
              </span>
            </div>
          </div>

          {/* Formulaire email/password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Votre nom"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'Minimum 6 caractères' : 'Votre mot de passe'}
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'signin' ? 'Connexion...' : 'Création...'}
                </>
              ) : (
                mode === 'signin' ? 'Se connecter' : 'Créer le compte'
              )}
            </Button>
          </form>

          {/* Basculer entre connexion et inscription */}
          <div className="text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {mode === 'signin' ? "Pas encore de compte ? " : "Déjà un compte ? "}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setEmailSent(false); // Reset email sent state
              }}
              className="text-blue-600 hover:underline font-medium dark:text-blue-400"
            >
              {mode === 'signin' ? 'Créer un compte' : 'Se connecter'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}