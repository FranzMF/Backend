import express from "express";
import { db } from "../db.js";

const router = express.Router();


router.put("/perfil/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;
  const sql = "UPDATE usuarios SET nombre = ?, correo = ? WHERE id = ?";
  db.query(sql, [nombre, correo, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Perfil actualizado correctamente" });
  });
});

export default router;
