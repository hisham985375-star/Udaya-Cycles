const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000 // 1 minute default
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const windowData = rateLimitMap.get(identifier);

  if (!windowData) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  // If window expired, reset
  if (now - windowData.lastReset > windowMs) {
    rateLimitMap.set(identifier, { count: 1, lastReset: now });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  // Increment
  windowData.count += 1;
  
  if (windowData.count > limit) {
    return { 
      success: false, 
      limit, 
      remaining: 0, 
      reset: windowData.lastReset + windowMs 
    };
  }

  return {
    success: true,
    limit,
    remaining: limit - windowData.count,
    reset: windowData.lastReset + windowMs,
  };
}
