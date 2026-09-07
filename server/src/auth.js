import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export function checkPassword(senha) {
  return bcrypt.compareSync(senha, process.env.ADMIN_PASSWORD_HASH ?? "");
}

export function issueToken() {
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "não autenticado" });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: "token inválido" });
  }
}

// ponytail: sincronismo automático (cron do GitHub Actions) usa um segredo
// fixo em vez de login, já que não há usuário interativo nessa chamada.
export function requireSyncAuth(req, res, next) {
  const secret = req.headers["x-sync-secret"];
  if (secret && secret === process.env.SYNC_SECRET) return next();
  return requireAuth(req, res, next);
}
