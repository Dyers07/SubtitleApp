"use client"
// AuthContext.tsx
import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_plan?: string;     // ✅ Plan séparé (free, pro, premium, etc.)
  subscription_status?: string;   // ✅ Status séparé (active, inactive, etc.)
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  // Méthodes d'authentification
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>; // ✅ Retourne un objet avec error
  signInWithGoogle: () => Promise<{ data: any; error: any }>;
  signInWithGitHub: () => Promise<{ data: any; error: any }>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: unknown) {
      console.error('❌ Erreur fetch profile:', error instanceof Error ? error.message : 'Erreur inconnue');
      setProfile(null);
    }
  };

  // 🚀 Méthodes d'authentification
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur signIn:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
          }
        }
      });
      
      if (error) throw error;
      
      // Créer le profil dans la table profiles si l'inscription réussit
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: name,
              full_name: name,
              subscription_plan: 'free', // ✅ Plan par défaut
              subscription_status: 'active',
            }
          ]);
          
        if (profileError) {
          console.error('❌ Erreur création profil:', profileError);
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('❌ Erreur signUp:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSession(null);
      setUser(null);
      setProfile(null);
      
      return { error: null }; // ✅ Retourner un objet avec error
    } catch (error) {
      console.error('❌ Erreur signOut:', error);
      return { error }; // ✅ Retourner l'erreur
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      return { data, error };
    } catch (error) {
      console.error('❌ Erreur Google OAuth:', error);
      return { data: null, error };
    }
  };

  const signInWithGitHub = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      
      return { data, error };
    } catch (error) {
      console.error('❌ Erreur GitHub OAuth:', error);
      return { data: null, error };
    }
  };

  useEffect(() => {
    console.log('🚀 Initialisation auth...');
    
    const fetchSession = async () => {
      console.log('🔍 getSession...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error: unknown) {
        console.error('❌ Erreur getSession:', error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event);
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleanup subscription');
      subscription?.unsubscribe();
    };
  }, []);

  console.log('🔄 AuthProvider render - loading:', loading, 'user:', !!user);
  
  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      loading,
      signIn,
      signUp,
      signOut,
      signInWithGoogle,
      signInWithGitHub,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook de base
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook pour ProtectedRoute avec gestion du dialog
export function useRequireAuth() {
  const auth = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      setShowAuthDialog(true);
    } else {
      setShowAuthDialog(false);
    }
  }, [auth.loading, auth.user]);

  return {
    ...auth,
    showAuthDialog,
    setShowAuthDialog,
  };
}