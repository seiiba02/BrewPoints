import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { User, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export interface SessionCookiePayload {
  id: number;
  firebase_uid: string;
  role: UserRole;
  name: string;
  email: string;
}

const DEFAULT_DEMO_USER: User = {
  id: BigInt(3),
  firebase_uid: 'customer-dummy-uid-001',
  name: 'Jane Customer',
  email: 'customer@brewpoints.local',
  phone: '+1-555-0103',
  role: 'customer',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

/**
 * Resolve the currently authenticated user from either:
 * 1. `Authorization: Bearer <token>` header (REST API / mobile / test requests)
 * 2. `auth_user` httpOnly session cookie (Next.js React web app)
 * 3. Server Component fallback when invoked without a request object.
 */
export async function resolveRequestUser(
  request?: NextRequest | Request
): Promise<User | null> {
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      const token = authHeader.slice(7).trim();
      if (token) {
        const dbUser = await prisma.user.findFirst({
          where: { firebase_uid: token, deleted_at: null },
        });
        return dbUser ?? null;
      }
    }

    if ('cookies' in request && typeof request.cookies?.get === 'function') {
      const rawCookie = request.cookies.get('auth_user')?.value;
      if (rawCookie) {
        try {
          const parsed = JSON.parse(rawCookie) as Partial<SessionCookiePayload>;
          if (parsed.firebase_uid) {
            const dbUser = await prisma.user.findFirst({
              where: { firebase_uid: parsed.firebase_uid, deleted_at: null },
            });
            if (dbUser) return dbUser;
          }
          return {
            id: BigInt(parsed.id || 3),
            firebase_uid: parsed.firebase_uid || 'customer-dummy-uid-001',
            name: parsed.name || 'Jane Customer',
            email: parsed.email || 'customer@brewpoints.local',
            phone: null,
            role: (parsed.role as UserRole) || 'customer',
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          };
        } catch {
          // Ignore malformed cookie
        }
      }
    }

    try {
      const cookieStore = await cookies();
      const rawCookie = cookieStore.get('auth_user')?.value;
      if (rawCookie) {
        const parsed = JSON.parse(rawCookie) as Partial<SessionCookiePayload>;
        if (parsed.firebase_uid) {
          const dbUser = await prisma.user.findFirst({
            where: { firebase_uid: parsed.firebase_uid, deleted_at: null },
          });
          if (dbUser) return dbUser;
        }
        return {
          id: BigInt(parsed.id || 3),
          firebase_uid: parsed.firebase_uid || 'customer-dummy-uid-001',
          name: parsed.name || 'Jane Customer',
          email: parsed.email || 'customer@brewpoints.local',
          phone: null,
          role: (parsed.role as UserRole) || 'customer',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        };
      }
    } catch {
      // Outside Next.js request context
    }

    return null;
  }

  // Server Component invocation without explicit request object
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get('auth_user')?.value;
    if (rawCookie) {
      const parsed = JSON.parse(rawCookie) as Partial<SessionCookiePayload>;
      return {
        id: BigInt(parsed.id || 3),
        firebase_uid: parsed.firebase_uid || 'customer-dummy-uid-001',
        name: parsed.name || 'Jane Customer',
        email: parsed.email || 'customer@brewpoints.local',
        phone: null,
        role: (parsed.role as UserRole) || 'customer',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };
    }
  } catch {
    // Ignore outside request context
  }

  return DEFAULT_DEMO_USER;
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

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !hasRequiredRole(user, allowedRoles)
  ) {
    return {
      errorResponse: NextResponse.json(
        { message: 'Forbidden. Insufficient role.' },
        { status: 403 }
      ),
    };
  }

  return { user };
}
