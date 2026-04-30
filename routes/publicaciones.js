import express from "express";
import { db } from "../db.js";

const router = express.Router();

// Obtener todas las publicaciones
router.get("/", (req, res) => {
  db.query(
    `SELECT p.id_publicacion, u.nombre AS usuario, m.nombre AS material, p.cantidad, p.ubicacion, p.estado, p.fecha_publicacion
     FROM publicaciones p
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     JOIN materiales m ON p.id_material = m.id_material
     ORDER BY p.fecha_publicacion DESC`,
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

// Agregar nueva publicación
router.post("/", (req, res) => {
  const { id_usuario, id_material, cantidad, ubicacion, estado, descripcion } = req.body;

  if (!id_usuario || !id_material || !cantidad || !ubicacion) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const sql = `INSERT INTO publicaciones (id_usuario, id_material, cantidad, ubicacion, estado, descripcion)
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [id_usuario, id_material, cantidad, ubicacion, estado, descripcion || null], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Publicación registrada con éxito", id: result.insertId });
  });
});

export default router;
