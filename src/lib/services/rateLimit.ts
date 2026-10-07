import { NextResponse } from 'next/server';

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

/**
 * Simple sliding-window rate limiter matching Laravel's `throttle:10,1` (10 requests / 60s).
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 60_000
): NextResponse | null {
  if (process.env.DISABLE_RATE_LIMIT === 'true') {
    return null;
  }

  const now = Date.now();
  const cutoff = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] };

  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= maxAttempts) {
    return NextResponse.json(
      { message: 'Too Many Attempts.' },
      { status: 429 }
    );
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return null;
}

export function resetRateLimits(): void {
  buckets.clear();
}
