const {client} = require('../config/redis');


//IMPLEMENTING FIXED Window RATE LIMITER USING REDIS
const rateLimiter = async (req, res, next) => {
    // 1. Identify the user (using IP address)
    const ip = req.ip;
    const key = `rate_limit:${ip}`;
    
    // 2. Defining limits
    const LIMIT = 10;          // Max requests
    const WINDOW = 60;         // Time window in seconds (1 minute)

    try {
        // 3. Atomic Increment--> increasing the request count
        const requests = await client.incr(key);

        // 4. Set expiration on the first request--> expire after `WINDOW` seconds
        if (requests === 1) {
            await client.expire(key, WINDOW);
        }

        // 5. Check if limit exceeded
        if (requests > LIMIT) {
            return res.status(429).json({
                success: false,
                message: "Too many requests. Please try again in a minute.",
                retryAfter: await client.ttl(key) // Time left in seconds
            });
        }

        // 6. Proceed to next middleware (e.g., validateSQL)
        next();
    } catch (err) {
        console.error("Redis Rate Limiter Error:", err);
        next(); // Fallback: allow request if Redis is down
    }
};

module.exports = rateLimiter;