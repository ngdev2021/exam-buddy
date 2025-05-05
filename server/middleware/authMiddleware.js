import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  console.log("[AUTH] Token verification attempt");
  console.log("[AUTH] JWT_SECRET length:", process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
  console.log("[AUTH] JWT_SECRET first chars:", process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 3) + '...' : 'undefined');
  
  if (!token) {
    console.log("[AUTH] No token provided");
    return res.status(401).json({ error: "No token provided" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("[AUTH] Token verification failed:", err.message);
      return res.status(403).json({ error: "Invalid or expired token", details: err.message });
    }
    console.log("[AUTH] Token verified successfully for user:", user.userId);
    req.user = user;
    next();
  });
}
