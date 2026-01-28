/**
 * Rate limiting with Upstash Redis
 *
 * Uses sliding window algorithm for fair rate limiting.
 * Configured with generous limits to handle campaign traffic bursts.
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// Lazy initialization to avoid errors if env vars are missing at import time
let redis: Redis | null = null;
const limiters: Record<string, Ratelimit> = {};

function getRedis(): Redis {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error("Upstash Redis credentials not configured");
    }

    redis = new Redis({ url, token });
  }
  return redis;
}

/**
 * Get or create a rate limiter with specific configuration
 */
function getLimiter(name: string, requests: number, window: string): Ratelimit {
  const key = `${name}-${requests}-${window}`;

  if (!limiters[key]) {
    limiters[key] = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
      prefix: `ratelimit:${name}`,
      analytics: true,
    });
  }

  return limiters[key];
}

/**
 * Rate limiter getters for different endpoints
 * Using sliding window for smoother rate limiting
 */

// Petition signing - generous for campaign bursts
// 20 signatures per minute per IP
export function getPetitionLimiter(): Ratelimit {
  return getLimiter("petition", 20, "1 m");
}

// Activity registration - moderate limits
// 10 registrations per minute per IP
export function getActivityLimiter(): Ratelimit {
  return getLimiter("activity", 10, "1 m");
}

// Volunteer signup - lower limits (more valuable action)
// 5 signups per minute per IP
export function getVolunteerLimiter(): Ratelimit {
  return getLimiter("volunteer", 5, "1 m");
}

// Material orders - strict limits (has real cost)
// 3 orders per minute per IP
export function getMaterialLimiter(): Ratelimit {
  return getLimiter("material", 3, "1 m");
}

// Contact politician - moderate limits
// 5 emails per minute per IP
export function getContactLimiter(): Ratelimit {
  return getLimiter("contact", 5, "1 m");
}

/**
 * Helper to get client IP from request
 */
export function getClientIp(request: Request): string {
  // Vercel/Cloudflare headers
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback
  return "anonymous";
}

/**
 * Check rate limit and return error response if exceeded
 * Returns null if within limits, NextResponse if rate limited
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "För många förfrågningar. Försök igen om en stund.",
          retryAfter
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": retryAfter.toString(),
          }
        }
      );
    }

    return null; // Within limits
  } catch (error) {
    // If rate limiting fails, log but allow request through
    // Better to allow potential spam than block legitimate users
    console.error("Rate limit check failed:", error);
    return null;
  }
}
