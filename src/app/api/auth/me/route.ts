// src/app/api/auth/me/route.ts
import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return Response.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    return Response.json({
      success: true,
      user,
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return Response.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}