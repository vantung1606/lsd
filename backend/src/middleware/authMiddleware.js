const jwt = require("jsonwebtoken");

function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Missing or invalid Authorization header." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "lsd_quiz_default_jwt_secret_2026");
    request.user = payload;
    next();
  } catch (error) {
    return response.status(401).json({ message: "Token is invalid or expired." });
  }
}

module.exports = requireAuth;
