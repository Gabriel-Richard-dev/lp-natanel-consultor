import { Router } from "express";
import { checkPassword, issueToken } from "../auth.js";

export const authRouter = Router();

authRouter.post("/auth/login", (req, res) => {
  const { senha } = req.body ?? {};
  if (!senha || !checkPassword(senha)) {
    return res.status(401).json({ erro: "senha inválida" });
  }
  res.json({ token: issueToken() });
});
