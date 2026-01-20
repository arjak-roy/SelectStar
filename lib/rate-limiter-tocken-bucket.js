const {client} = require('../config/redis');

// IMPLEMENTING TOKEN BUCKET RATE LIMITER USING REDIS
const tokenBucketLimiter = async (req, res, next) => {
    // console.log("Token Bucket Rate Limiter Invoked");
    // 1. Identify the user (using IP address)
    const ip = req.ip;
    const key = `tokens:${ip}`; // Token bucket key
    
    // 2. Define bucket parameters
    const MAX_TOKENS = 30;      // Capacity of the bucket
    const REFILL_RATE = 10;      // Tokens to be added every REFILL_INTERVAL seconds
    const REFILL_INTERVAL = 10; // Time interval in seconds for refilling tokens

    try {
        // 1. Fetch the current bucket state
        let bucket = await client.hGetAll(key); // { count: x, lastRefill: timestamp } 

        const now = Math.floor(Date.now() / 1000);

        if (Object.keys(bucket).length === 0) {
            // New user: Initialize with max tokens
            bucket = {
                count: MAX_TOKENS - 1,
                lastRefill: now
            };
        } else {
            // 2. Calculate Refill for existing user
            let count = parseInt(bucket.count);
            let lastRefill = parseInt(bucket.lastRefill);
            // 3. Calculate how many tokens to add based on time passed
            const secondsPassed = now - lastRefill;
            //4. Determine number of tokens to add -> (secondsPassed / REFILL_INTERVAL) * REFILL_RATE
            const tokensToAdd = Math.floor(secondsPassed / REFILL_INTERVAL) * REFILL_RATE;
            
            // New count cannot exceed MAX_TOKENS
            count = Math.min(MAX_TOKENS, count + tokensToAdd);

            //5. Check availability
            if (count >= 1) {
                count -= 1;
                bucket.count = count;
                bucket.lastRefill = now;
            } else {
                console.log("Rate limit exceeded for IP:", ip);
                console.log("Bucket State:", bucket);
                // Bucket is empty
                return res.status(429).json({
                    success: false,
                    message: "Bucket empty! Wait for tokens to regenerate.",
                    nextRefillIn: REFILL_INTERVAL - (secondsPassed % REFILL_INTERVAL)
                });
            }
        }

        // 6. Save updated state back to Redis
        await client.hSet(key, bucket);
        await client.expire(key, 3600); // Cleanup after 1 hour of inactivity

        next();
    } catch (err) {
        console.error("Token Bucket Error:", err);
        next(); 
    }
};

module.exports = tokenBucketLimiter;