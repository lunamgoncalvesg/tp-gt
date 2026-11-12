import { verifyToken } from "../controllers/authController.js";

export default function authenticate(req, res, next) {
  const token = req.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return res.status(401).json({ message: "Iniciá sesión para continuar." });
  req.user = user;
  return next();
}
