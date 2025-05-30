// src/lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  subscription?: 'free' | 'pro' | 'premium';
}

export interface AuthToken {
  userId: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

// Simuler une base de données en mémoire (remplacer par une vraie DB)
const users: Map<string, User & { password: string }> = new Map();

// Générer un token JWT
export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Vérifier un token JWT
export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthToken;
  } catch (error) {
    return null;
  }
}

// Hasher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Vérifier un mot de passe
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Créer un utilisateur
export async function createUser(email: string, password: string, name: string): Promise<User> {
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const hashedPassword = await hashPassword(password);
  
  const user: User & { password: string } = {
    id: userId,
    email: email.toLowerCase(),
    name,
    password: hashedPassword,
    createdAt: new Date(),
    subscription: 'free',
  };
  
  users.set(userId, user);
  
  // Retourner l'utilisateur sans le mot de passe
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Trouver un utilisateur par email
export async function findUserByEmail(email: string): Promise<(User & { password: string }) | null> {
  for (const user of users.values()) {
    if (user.email === email.toLowerCase()) {
      return user;
    }
  }
  return null;
}

// Trouver un utilisateur par ID
export async function findUserById(userId: string): Promise<User | null> {
  const user = users.get(userId);
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Middleware d'authentification
export async function authenticateRequest(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  
  return await findUserById(decoded.userId);
}

// Réponses d'authentification
export function createAuthResponse(data: any, token?: string): NextResponse {
  const response = NextResponse.json(data);
  
  if (token) {
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
    });
  }
  
  return response;
}

export function createLogoutResponse(): NextResponse {
  const response = NextResponse.json({ success: true, message: 'Déconnecté avec succès' });
  
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
  
  return response;
}