const jwt = require("jsonwebtoken");

module.exports = function isLoggedIn(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not configured.");
    return res.status(500).json({ message: "Authentication is not configured on the server" });
  }

  const authHeader = req.get("Authorization") || "";
  const [scheme, token, extra] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token || extra) {
    return res.status(401).json({ message: "A valid Bearer token is required" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    if (!decoded.id) {
      return res.status(401).json({ message: "Token is not valid" });
    }
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Token is not valid or has expired" });
  }
};
