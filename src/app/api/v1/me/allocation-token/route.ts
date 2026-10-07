import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/serverAuth';
import { TokenService } from '@/lib/services/tokenService';

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { user } = auth;
  const tokenService = new TokenService();
  const minted = tokenService.mintAllocation(Number(user.id), user.firebase_uid);
  const qrPayload = `brewpoints://allocate?token=${minted.token}`;

  return NextResponse.json({
    data: {
      qr_payload: qrPayload,
      expires_at: minted.expires_at,
      customer: {
        id: Number(user.id),
        name: user.name,
        firebase_uid: user.firebase_uid,
      },
    },
  });
}
