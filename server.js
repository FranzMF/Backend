import express from "express";
import cors from "cors";
import { db } from "./db.js";

import userRoutes from "./routes/users.js";
import publicacionesRoutes from "./routes/publicaciones.js";
import notificacionesRoutes from "./routes/notificaciones.js";
import configuracionesRoutes from "./routes/configuraciones.js";
import materialesRoutes from "./routes/materiales.js";

const app = express();
app.use(express.json());
app.use(cors());

// RUTAS
app.use("/api/users", userRoutes);
app.use("/api/publicaciones", publicacionesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/api/configuraciones", configuracionesRoutes);
app.use("/api/materiales", materialesRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente 🚀");
});

const PORT = 8800;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
