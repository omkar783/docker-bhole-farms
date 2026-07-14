const rateLimit = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimit.get(key);

  if (!record || now - record.lastReset > WINDOW_MS) {
    rateLimit.set(key, { count: 1, lastReset: now });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - record.lastReset)) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
