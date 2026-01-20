const tockenbucket = require('../lib/rate-limiter-tocken-bucket');
const fixedwindow = require('../lib/rate-limiter-fixed-window');
class rateLimiter{
    static getRateLimiter(type){
        if(type==="tockenbucket"){
            return tockenbucket;
        }
        else if(type==="fixedwindow"){
            return fixedwindow;
        }
    }
}
module.exports = rateLimiter;