// src/app/api/auth/register/route.ts
import { NextRequest } from 'next/server';
import { createUser, findUserByEmail, generateToken, createAuthResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // Validation des données
    if (!email || !password || !name) {
      return Response.json(
        { error: 'Email, mot de passe et nom sont requis' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return Response.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return Response.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 409 }
      );
    }
    
    // Créer l'utilisateur
    const user = await createUser(email, password, name);
    const token = generateToken(user);
    
    return createAuthResponse({
      success: true,
      message: 'Compte créé avec succès',
      user,
    }, token);
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return Response.json(
      { error: 'Erreur serveur lors de l\'inscription' },
      { status: 500 }
    );
  }
}



