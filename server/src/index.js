import cors from "cors";
import express from "express";
import multer from "multer";
import { requireAuth } from "./auth.js";
import { authRouter } from "./routes/auth.js";
import { imoveisRouter } from "./routes/imoveis.js";
import { syncRouter } from "./routes/sync.js";
import { ensureBucket, uploadImagem } from "./s3.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(authRouter);
app.use(imoveisRouter);
app.use(syncRouter);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

app.post(
  "/upload",
  requireAuth,
  upload.single("imagem"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ erro: "arquivo obrigatório" });
    const url = await uploadImagem(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );
    res.json({ url });
  }
);

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT ?? 3001;

await ensureBucket();
app.listen(port, () => console.log(`API ouvindo na porta ${port}`));
