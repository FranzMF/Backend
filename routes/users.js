import express from "express";
import { db } from "../db.js";

const router = express.Router();


router.get("/", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});


router.post("/register", (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;
  const sql = "INSERT INTO usuarios (nombre, correo, contrasena, id_rol) VALUES (?, ?, ? , ?)";
db.query(sql, [nombre, correo, contrasena, rol === 'reciclador' ? 2 : 1], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Usuario registrado con éxito" });
  });
});


router.post("/login", (req, res) => {
  const { correo, contrasena } = req.body;
  const sql = "SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?";
  db.query(sql, [correo, contrasena], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length > 0) {
      res.json({ message: "Inicio de sesión exitoso", usuario: result[0] });
    } else {
      res.status(401).json({ message: "Credenciales incorrectas" });
    }
  });
});

export default router;
