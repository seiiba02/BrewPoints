import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { User, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getLoyaltyConfig } from '@/lib/config/loyalty';

export interface SessionCookiePayload {
  id: number;
  firebase_uid: string;
  role: UserRole;
  name: string;
  email: string;
}

/**
 * Verify a real Firebase ID token against Google's SecureToken JWKS/public certs
 * or tokeninfo endpoint for the configured FIREBASE_PROJECT_ID.
 */
async function verifyRealFirebaseIdToken(
  idToken: string,
  projectId: string
): Promise<string | null> {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const payloadJson = Buffer.from(parts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as {
      aud?: string;
      iss?: string;
      sub?: string;
      exp?: number;
    };

    const now = Math.floor(Date.now() / 1000);
    if (!payload.sub || !payload.exp || payload.exp < now) {
      return null;
    }

    if (
      projectId &&
      projectId !== 'brewpoints-placeholder' &&
      (payload.aud !== projectId ||
        payload.iss !== `https://securetoken.google.com/${projectId}`)
    ) {
      return null;
    }

    // Verify signature using Google's tokeninfo endpoint
    const res = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    );
    if (!res.ok) return null;

    const verified = (await res.json()) as { sub?: string; aud?: string };
    if (!verified.sub) return null;

    return verified.sub;
  } catch {
    return null;
  }
}

/**
 * Resolve a database User from a token string (`firebase_uid` in placeholder mode,
 * or a real Firebase ID token when FIREBASE_REAL=true).
 */
export async function resolveUserFromToken(token: string): Promise<User | null> {
  if (!token) return null;

  const cfg = getLoyaltyConfig();
  let firebaseUid: string | null = token;

  if (cfg.firebaseReal) {
    firebaseUid = await verifyRealFirebaseIdToken(token, cfg.firebaseProjectId);
    if (!firebaseUid) return null;
  }

  return prisma.user.findFirst({
    where: {
      firebase_uid: firebaseUid,
      deleted_at: null,
    },
  });
}

/**
 * Resolve the currently authenticated user from either:
 * 1. `Authorization: Bearer <token>` header (REST API / mobile / test requests)
 * 2. `auth_user` httpOnly session cookie (Next.js React web app)
 */
export async function resolveRequestUser(
  request?: NextRequest | Request
): Promise<User | null> {
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      if (!token) return null;
      return resolveUserFromToken(token);
    }

    // Check NextRequest cookies if available
    if ('cookies' in request && typeof request.cookies?.get === 'function') {
      const rawCookie = request.cookies.get('auth_user')?.value;
      if (rawCookie) {
        try {
          const parsed = JSON.parse(rawCookie) as Partial<SessionCookiePayload>;
          if (parsed.firebase_uid) {
            return resolveUserFromToken(parsed.firebase_uid);
          }
        } catch {
          return null;
        }
      }
    }
  }

  // Fallback for Server Components / Server Actions using next/headers
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get('auth_user')?.value;
    if (rawCookie) {
      const parsed = JSON.parse(rawCookie) as Partial<SessionCookiePayload>;
      if (parsed.firebase_uid) {
        return resolveUserFromToken(parsed.firebase_uid);
      }
    }
  } catch {
    // cookies() may throw outside Next.js request context
  }

  return null;
}

/**
 * Check if a user satisfies the required role(s).
 * Per specification, `owner` implicitly passes all role checks.
 */
export function hasRequiredRole(user: User, allowedRoles: UserRole[]): boolean {
  if (user.role === 'owner') {
    return true;
  }
  return allowedRoles.includes(user.role);
}

/**
 * Guard helper for Next.js Route Handlers (`/api/v1/*`).
 */
export async function authenticateRequest(
  request: NextRequest | Request,
  allowedRoles?: UserRole[]
): Promise<
  | { user: User; errorResponse?: never }
  | { user?: never; errorResponse: NextResponse }
> {
  const user = await resolveRequestUser(request);

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { message: 'Unauthenticated.' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRequiredRole(user, allowedRoles)) {
    return {
      errorResponse: NextResponse.json(
        { message: 'Forbidden. Insufficient role.' },
        { status: 403 }
      ),
    };
  }

  return { user };
}
