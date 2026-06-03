import express from "express";
import { db } from "../db.js";
import multer from "multer";

const router = express.Router();

// 🔥 Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// 🔹 GET publicaciones
router.get("/", (req, res) => {
  db.query(
    `SELECT p.id_publicacion, u.nombre AS usuario, m.nombre AS material, 
            p.cantidad, p.ubicacion, p.estado, p.fecha_publicacion, p.imagen_url
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

// 🔹 POST publicación con imagen
router.post("/", upload.single("imagen"), (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  const id_usuario = req.body?.id_usuario;
  const id_material = req.body?.id_material;
  const cantidad = req.body?.cantidad;
  const ubicacion = req.body?.ubicacion;
  const estado = req.body?.estado;
  const descripcion = req.body?.descripcion;
  // 🔹 NUEVO
  const latitud = req.body?.latitud || null;
  const longitud = req.body?.longitud || null;

  if (!id_usuario || !id_material || !cantidad || !ubicacion) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  const imagen_url = req.file ? req.file.filename : null;

  const sql = `INSERT INTO publicaciones 
  (id_usuario, id_material, cantidad, ubicacion, latitud, longitud, estado, descripcion, imagen_url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [id_usuario, id_material, cantidad, ubicacion, latitud, longitud, estado, descripcion || null, imagen_url],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Publicación registrada con éxito", id: result.insertId });
    }
  );
});

export default router;