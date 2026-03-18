/**
 * Request logging middleware
 * Logs incoming requests and response times
 */

export function requestLogger(req, res, next) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const status = res.statusCode;
    const statusEmoji = status >= 500 ? "❌" : status >= 400 ? "⚠️" : "✅";

    console.log(
      `${statusEmoji} ${req.method.padEnd(6)} ${req.path.padEnd(30)} ${status} ${duration}ms`
    );
  });

  next();
}

/**
 * Security headers middleware
 */
export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}

/**
 * Rate limiting (basic, in-memory)
 * For production, use redis-based rate limiter
 */
const requestCounts = {};

export function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    if (!requestCounts[key]) {
      requestCounts[key] = [];
    }

    // Remove old requests outside the time window
    requestCounts[key] = requestCounts[key].filter((time) => now - time < windowMs);

    if (requestCounts[key].length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
      });
    }

    requestCounts[key].push(now);
    next();
  };
}
