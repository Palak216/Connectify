
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET is missing from environment configuration.");
    return res.status(500).json({
      message: "Server authentication is not configured",
    });
  }

  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "No token, authorization denied",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({ message: "Token is not valid" });
  }

  try {
    req.user = jwt.verify(token, secret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
