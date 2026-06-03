import express from "express";
import { db } from "../db.js";

const router = express.Router();

// 🔹 GET publicaciones con coordenadas para el mapa
router.get("/publicaciones", (req, res) => {
  db.query(
    `SELECT p.id_publicacion, u.nombre AS usuario, m.nombre AS material,
            m.tipo, p.cantidad, p.ubicacion, p.descripcion,
            p.latitud, p.longitud, p.estado, p.fecha_publicacion
     FROM publicaciones p
     JOIN usuarios u ON p.id_usuario = u.id_usuario
     JOIN materiales m ON p.id_material = m.id_material
     WHERE p.estado = 'Disponible'
       AND p.latitud IS NOT NULL
       AND p.longitud IS NOT NULL`,
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(result);
    }
  );
});

// 🔹 POST guardar ruta consultada
router.post("/historial-rutas", (req, res) => {
  const {
    id_usuario,
    origen_lat,
    origen_lng,
    destino_lat,
    destino_lng,
    distancia_km,
    duracion_min,
    tipo_destino,
    id_publicacion
  } = req.body;

  if (!id_usuario || !origen_lat || !origen_lng || !destino_lat || !destino_lng || !tipo_destino) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const sql = `INSERT INTO historial_rutas
    (id_usuario, origen_lat, origen_lng, destino_lat, destino_lng,
     distancia_km, duracion_min, tipo_destino, id_publicacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      id_usuario,
      origen_lat,
      origen_lng,
      destino_lat,
      destino_lng,
      distancia_km || null,
      duracion_min || null,
      tipo_destino,
      id_publicacion || null
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Ruta guardada correctamente", id: result.insertId });
    }
  );
});

export default router;