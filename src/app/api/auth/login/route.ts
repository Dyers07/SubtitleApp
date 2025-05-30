// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { findUserByEmail, verifyPassword, generateToken, createAuthResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Validation des données
    if (!email || !password) {
      return Response.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      );
    }
    
    // Trouver l'utilisateur
    const user = await findUserByEmail(email);
    if (!user) {
      return Response.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return Response.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }
    
    // Générer le token
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);
    
    return createAuthResponse({
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword,
    }, token);
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return Response.json(
      { error: 'Erreur serveur lors de la connexion' },
      { status: 500 }
    );
  }
}

