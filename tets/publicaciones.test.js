import request from "supertest";
import express from "express";
import publicacionesRoutes from "../routes/publicaciones.js";
import { db } from "../db.js";

jest.mock("../db.js");

const app = express();
app.use(express.json());
app.use("/api/publicaciones", publicacionesRoutes);

describe("Publicaciones Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/publicaciones 

  describe("GET /api/publicaciones", () => {
    it("devuelve la lista de publicaciones con status 200", async () => {
      const mockPublicaciones = [
        {
          id_publicacion: 1,
          usuario: "Ana",
          material: "Plástico",
          cantidad: 5,
          ubicacion: "Zona Norte",
          estado: "disponible",
          fecha_publicacion: "2025-01-01",
        },
      ];
      db.query.mockImplementation((sql, cb) => cb(null, mockPublicaciones));

      const res = await request(app).get("/api/publicaciones");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPublicaciones);
    });

    it("retorna 500 si ocurre un error en la DB", async () => {
      db.query.mockImplementation((sql, cb) => cb(new Error("Error SQL"), null));

      const res = await request(app).get("/api/publicaciones");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Error SQL");
    });
  });

  //  POST /api/publicaciones 

  describe("POST /api/publicaciones", () => {
    const publicacionValida = {
      id_usuario: 1,
      id_material: 2,
      cantidad: 10,
      ubicacion: "Av. Siempre Viva 742",
      estado: "disponible",
      descripcion: "Botellas PET limpias",
    };

    it("crea una publicación y devuelve su id", async () => {
      db.query.mockImplementation((sql, params, cb) => cb(null, { insertId: 99 }));

      const res = await request(app).post("/api/publicaciones").send(publicacionValida);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Publicación registrada con éxito");
      expect(res.body.id).toBe(99);
    });

    it("usa null si no se envía descripción", async () => {
      db.query.mockImplementation((sql, params, cb) => cb(null, { insertId: 100 }));

      const { descripcion, ...sinDescripcion } = publicacionValida;
      await request(app).post("/api/publicaciones").send(sinDescripcion);

      const params = db.query.mock.calls[0][1];
      expect(params[5]).toBeNull();
    });

    it("retorna 400 si faltan campos obligatorios (sin ubicacion)", async () => {
      const { ubicacion, ...incompleto } = publicacionValida;
      const res = await request(app).post("/api/publicaciones").send(incompleto);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Faltan datos obligatorios");
      expect(db.query).not.toHaveBeenCalled();
    });

    it("retorna 400 si falta id_usuario", async () => {
      const { id_usuario, ...incompleto } = publicacionValida;
      const res = await request(app).post("/api/publicaciones").send(incompleto);

      expect(res.status).toBe(400);
    });

    it("retorna 400 si falta cantidad", async () => {
      const { cantidad, ...incompleto } = publicacionValida;
      const res = await request(app).post("/api/publicaciones").send(incompleto);

      expect(res.status).toBe(400);
    });

    it("retorna 500 si la DB falla al insertar", async () => {
      db.query.mockImplementation((sql, params, cb) =>
        cb(new Error("FK constraint"), null)
      );

      const res = await request(app).post("/api/publicaciones").send(publicacionValida);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "FK constraint");
    });
  });
});
