import express from "express";
import { db } from "../db.js";

const router = express.Router();


router.get("/", (req, res) => {
  db.query("SELECT * FROM notificaciones ORDER BY fecha DESC", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});


router.post("/", (req, res) => {
  const { usuario_id, mensaje } = req.body;
  const sql = "INSERT INTO notificaciones (usuario_id, mensaje) VALUES (?, ?)";
  db.query(sql, [usuario_id, mensaje], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Notificación creada" });
  });
});

export default router;
