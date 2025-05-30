// src/app/api/auth/logout/route.ts
import { createLogoutResponse } from '@/lib/auth';

export async function POST() {
  return createLogoutResponse();
}