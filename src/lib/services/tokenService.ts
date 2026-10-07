import crypto from 'crypto';
import { getLoyaltyConfig } from '@/lib/config/loyalty';

export interface RedemptionTokenClaims {
  type?: 'redeem';
  customer_id: number;
  reward_id: number;
  jti: string;
  iat: number;
  exp: number;
}

export interface AllocationTokenClaims {
  type: 'allocate';
  customer_id: number;
  customer_firebase_uid: string;
  jti: string;
  iat: number;
  exp: number;
}

export type TokenClaims = RedemptionTokenClaims | AllocationTokenClaims;

export interface VerifyResult<T = TokenClaims> {
  valid: boolean;
  expired: boolean;
  claims: T | null;
}

/**
 * Mints and verifies HS256 JWS tokens for reward redemptions (15m TTL)
 * and customer point allocation QR codes (10m TTL).
 */
export class TokenService {
  private readonly secret: string;
  private readonly redemptionTtl: number;
  private readonly allocationTtl: number;

  constructor(secret?: string, redemptionTtl?: number, allocationTtl?: number) {
    const cfg = getLoyaltyConfig();
    this.secret = secret ?? cfg.redemptionTokenSecret;
    this.redemptionTtl = redemptionTtl ?? cfg.redemptionTokenTtl;
    this.allocationTtl = allocationTtl ?? cfg.allocationTokenTtl;
  }

  /**
   * Mint a new redemption JWS token (15m default TTL).
   */
  mintRedemption(
    customerId: number,
    rewardId: number,
    nowSeconds?: number
  ): { token: string; expires_at: number; jti: string } {
    const now = nowSeconds ?? Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();
    const exp = now + this.redemptionTtl;

    const claims: RedemptionTokenClaims = {
      type: 'redeem',
      customer_id: customerId,
      reward_id: rewardId,
      jti,
      iat: now,
      exp,
    };

    return {
      token: this.sign(claims),
      expires_at: exp,
      jti,
    };
  }

  /**
   * Mint a new customer allocation JWS token (10m default TTL).
   */
  mintAllocation(
    customerId: number,
    customerFirebaseUid: string,
    nowSeconds?: number
  ): { token: string; expires_at: number; jti: string } {
    const now = nowSeconds ?? Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();
    const exp = now + this.allocationTtl;

    const claims: AllocationTokenClaims = {
      type: 'allocate',
      customer_id: customerId,
      customer_firebase_uid: customerFirebaseUid,
      jti,
      iat: now,
      exp,
    };

    return {
      token: this.sign(claims),
      expires_at: exp,
      jti,
    };
  }

  /**
   * Verify a JWS token and distinguish between invalid signature and expired token.
   */
  verifyWithExpiry<T extends TokenClaims = TokenClaims>(
    token: string,
    nowSeconds?: number
  ): VerifyResult<T> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, expired: false, claims: null };
    }

    const [header, payload, signature] = parts;
    const expected = this.hmac(`${header}.${payload}`);

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, expired: false, claims: null };
    }

    try {
      const decoded = Buffer.from(payload, 'base64url').toString('utf8');
      const claims = JSON.parse(decoded) as T;

      if (!claims || typeof claims.exp !== 'number') {
        return { valid: false, expired: false, claims: null };
      }

      const now = nowSeconds ?? Math.floor(Date.now() / 1000);
      if (claims.exp < now) {
        return { valid: false, expired: true, claims };
      }

      return { valid: true, expired: false, claims };
    } catch {
      return { valid: false, expired: false, claims: null };
    }
  }

  /**
   * Extract token from a deep link (`brewpoints://redeem?token=...` or `brewpoints://allocate?token=...`)
   */
  static extractToken(
    qrPayload: string,
    expectedScheme: 'redeem' | 'allocate'
  ): string | null {
    const prefix = `brewpoints://${expectedScheme}?token=`;
    if (qrPayload.startsWith(prefix)) {
      const raw = qrPayload.slice(prefix.length).trim();
      return raw.length > 0 ? raw : null;
    }
    return null;
  }

  private sign(claims: object): string {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    ).toString('base64url');
    const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const signature = this.hmac(`${header}.${payload}`);
    return `${header}.${payload}.${signature}`;
  }

  private hmac(data: string): string {
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('base64url');
  }
}
