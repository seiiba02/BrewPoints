import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { user } = auth;

  return NextResponse.json({
    data: {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      firebase_uid: user.firebase_uid,
    },
  });
}
