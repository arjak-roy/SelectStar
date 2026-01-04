const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Grab the token from the cookie (Parsed by cookie-parser)
  const token = req.cookies.token;

  // 2. If no token, return 401 (Unauthorized)
  if (!token) {
    return res.status(401).json({ message: "Access denied. No session found." });
  }

  try {
    // 3. Verify the token using your Secret Key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user data to the 'req' object 
    // This allows the next function to know WHO is making the request
    req.user = decoded;

    // 5. Move to the next function (the Controller)
    next();
  } catch (err) {
    // 6. If token is expired or tampered with, return 403 (Forbidden)
    return res.status(403).json({ message: "Invalid or expired session." });
  }
};

module.exports = verifyToken;