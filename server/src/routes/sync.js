import { Router } from "express";
import { requireSyncAuth } from "../auth.js";
import { sincronizarChavesNaMao } from "../sync.js";

export const syncRouter = Router();

syncRouter.post("/sync/chaves-na-mao", requireSyncAuth, async (_req, res) => {
  try {
    const total = await sincronizarChavesNaMao();
    res.json({ ok: true, total });
  } catch (err) {
    res.status(502).json({ erro: err.message });
  }
});
