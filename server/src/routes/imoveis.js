import crypto from "node:crypto";
import { Router } from "express";
import { requireAuth } from "../auth.js";
import { pool } from "../db/pool.js";

export const imoveisRouter = Router();

const CAMPOS = [
  "titulo",
  "preco",
  "url",
  "imagem",
  "bairro",
  "cidade",
  "quartos",
  "banheiros",
  "area",
];

function extrair(body) {
  return CAMPOS.map((campo) => body[campo] ?? null);
}

imoveisRouter.get("/imoveis", async (_req, res) => {
  const { rows } = await pool.query(
    "select * from imoveis order by criado_em desc"
  );
  res.json(rows);
});

imoveisRouter.post("/imoveis", requireAuth, async (req, res) => {
  const { titulo, preco, url } = req.body ?? {};
  if (!titulo || !preco || !url) {
    return res
      .status(400)
      .json({ erro: "titulo, preco e url são obrigatórios" });
  }
  const id = crypto.randomUUID();
  const { rows } = await pool.query(
    `insert into imoveis (id, titulo, preco, url, imagem, bairro, cidade, quartos, banheiros, area, origem)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'manual') returning *`,
    [id, ...extrair(req.body)]
  );
  res.status(201).json(rows[0]);
});

imoveisRouter.put("/imoveis/:id", requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    `update imoveis set titulo=$2, preco=$3, url=$4, imagem=$5, bairro=$6, cidade=$7,
       quartos=$8, banheiros=$9, area=$10, atualizado_em=now()
     where id=$1 and origem='manual' returning *`,
    [req.params.id, ...extrair(req.body)]
  );
  if (!rows[0]) {
    return res.status(404).json({ erro: "imóvel manual não encontrado" });
  }
  res.json(rows[0]);
});

imoveisRouter.delete("/imoveis/:id", requireAuth, async (req, res) => {
  const { rowCount } = await pool.query(
    "delete from imoveis where id=$1 and origem='manual'",
    [req.params.id]
  );
  if (!rowCount) {
    return res.status(404).json({ erro: "imóvel manual não encontrado" });
  }
  res.status(204).end();
});
