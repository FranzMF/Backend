import request from "supertest";
import express from "express";
import materialesRoutes from "../routes/materiales.js";
import notificacionesRoutes from "../routes/notificaciones.js";
import configuracionesRoutes from "../routes/configuraciones.js";
import { db } from "../db.js";

jest.mock("../db.js");


function makeApp(path, router) {
  const app = express();
  app.use(express.json());
  app.use(path, router);
  return app;
}

// MATERIALES 

describe("Materiales Routes", () => {
  const app = makeApp("/api/materiales", materialesRoutes);

  beforeEach(() => jest.clearAllMocks());

  describe("GET /api/materiales", () => {
    it("devuelve todos los materiales con status 200", async () => {
      const mockMateriales = [
        { id_material: 1, nombre: "Plástico" },
        { id_material: 2, nombre: "Vidrio" },
      ];
      db.query.mockImplementation((sql, cb) => cb(null, mockMateriales));

      const res = await request(app).get("/api/materiales");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMateriales);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM materiales",
        expect.any(Function)
      );
    });

    it("retorna 500 si la DB falla", async () => {
      db.query.mockImplementation((sql, cb) => cb(new Error("Timeout"), null));

      const res = await request(app).get("/api/materiales");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Timeout");
    });
  });
});

// NOTIFICACIONES 

describe("Notificaciones Routes", () => {
  const app = makeApp("/api/notificaciones", notificacionesRoutes);

  beforeEach(() => jest.clearAllMocks());

  describe("GET /api/notificaciones", () => {
    it("devuelve todas las notificaciones ordenadas por fecha", async () => {
      const mockNotifs = [
        { id: 2, usuario_id: 1, mensaje: "Nueva recogida", fecha: "2025-02-01" },
        { id: 1, usuario_id: 2, mensaje: "Solicitud aceptada", fecha: "2025-01-15" },
      ];
      db.query.mockImplementation((sql, cb) => cb(null, mockNotifs));

      const res = await request(app).get("/api/notificaciones");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockNotifs);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM notificaciones ORDER BY fecha DESC",
        expect.any(Function)
      );
    });

    it("retorna 500 si la DB falla", async () => {
      db.query.mockImplementation((sql, cb) => cb(new Error("DB error"), null));

      const res = await request(app).get("/api/notificaciones");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "DB error");
    });
  });

  describe("POST /api/notificaciones", () => {
    it("crea una notificación correctamente", async () => {
      db.query.mockImplementation((sql, params, cb) => cb(null, { insertId: 5 }));

      const res = await request(app).post("/api/notificaciones").send({
        usuario_id: 3,
        mensaje: "Tu material fue recogido",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Notificación creada" });

      const params = db.query.mock.calls[0][1];
      expect(params[0]).toBe(3);
      expect(params[1]).toBe("Tu material fue recogido");
    });

    it("retorna 500 si la DB falla al insertar", async () => {
      db.query.mockImplementation((sql, params, cb) =>
        cb(new Error("Insert failed"), null)
      );

      const res = await request(app).post("/api/notificaciones").send({
        usuario_id: 1,
        mensaje: "Test",
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Insert failed");
    });
  });
});

// CONFIGURACIONES

describe("Configuraciones Routes", () => {
  const app = makeApp("/api/configuraciones", configuracionesRoutes);

  beforeEach(() => jest.clearAllMocks());

  describe("PUT /api/configuraciones/perfil/:id", () => {
    it("actualiza el perfil correctamente", async () => {
      db.query.mockImplementation((sql, params, cb) =>
        cb(null, { affectedRows: 1 })
      );

      const res = await request(app)
        .put("/api/configuraciones/perfil/7")
        .send({ nombre: "Nuevo Nombre", correo: "nuevo@mail.com" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Perfil actualizado correctamente" });

      const params = db.query.mock.calls[0][1];
      expect(params[0]).toBe("Nuevo Nombre");
      expect(params[1]).toBe("nuevo@mail.com");
      expect(params[2]).toBe("7");
    });

    it("retorna 500 si la DB falla al actualizar", async () => {
      db.query.mockImplementation((sql, params, cb) =>
        cb(new Error("Update error"), null)
      );

      const res = await request(app)
        .put("/api/configuraciones/perfil/1")
        .send({ nombre: "X", correo: "x@x.com" });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Update error");
    });
  });
});
