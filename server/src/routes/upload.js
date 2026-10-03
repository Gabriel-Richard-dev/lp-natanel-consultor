import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../auth.js";
import { uploadImagem } from "../s3.js";

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

uploadRouter.post(
  "/upload",
  requireAuth,
  upload.single("imagem"),
  async (req, res) => {
    if (!req.file?.mimetype.startsWith("image/")) {
      return res.status(400).json({ erro: "envie um arquivo de imagem" });
    }
    const url = await uploadImagem(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );
    res.json({ url });
  }
);
