const jwt = require("jsonwebtoken");
const JWT_SECRET = "purewave_secret_key"; // Move to .env in production

// Default middleware: requires token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ success: false, message: "Token missing" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // decoded contains user_id and other info
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Invalid token" });
  }
};

// Optional middleware: allows requests without token (for guests)
authenticateToken.optional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null; // no user, treat as guest
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null; // invalid token, treat as guest
    next();
  }
};

module.exports = authenticateToken;
