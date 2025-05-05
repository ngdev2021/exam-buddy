import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  console.log("[AUTH] Token verification attempt");
  console.log("[AUTH] JWT_SECRET exists:", !!process.env.JWT_SECRET);
  console.log("[AUTH] JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  console.log("[AUTH] JWT_SECRET first chars:", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + '...' : 'undefined');
  
  if (!token) {
    console.log("[AUTH] No token provided");
    return res.status(401).json({ error: "No token provided" });
  }
  
  // Check if JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    console.error("[AUTH] JWT_SECRET is missing or empty");
    return res.status(500).json({ error: "Server configuration error", details: "JWT_SECRET is missing" });
  }
  
  try {
    // Try synchronous verification first to catch any immediate errors
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (syncErr) {
      console.error("[AUTH] Synchronous token verification failed:", syncErr.message);
      if (syncErr.name === 'TokenExpiredError') {
        return res.status(401).json({ error: "Token expired", details: syncErr.message });
      } else if (syncErr.name === 'JsonWebTokenError') {
        return res.status(403).json({ error: "Invalid token", details: syncErr.message });
      } else {
        return res.status(403).json({ error: "Token verification failed", details: syncErr.message });
      }
    }
    
    // If we get here, the token is valid
    console.log("[AUTH] Token verified successfully for user:", decoded.userId);
    req.user = decoded;
    next();
  } catch (err) {
    // This catches any other errors that might occur
    console.error("[AUTH] Unexpected error during token verification:", err);
    return res.status(500).json({ error: "Server error during authentication", details: err.message });
  }
}
