import request from "supertest";
import express from "express";
import userRoutes from "../routes/users.js";
import { db } from "../db.js";

jest.mock("../db.js");

const app = express();
app.use(express.json());
app.use("/api/users", userRoutes);

describe("Users Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── GET /api/users 

  describe("GET /api/users", () => {
    it("devuelve la lista de usuarios con status 200", async () => {
      const mockUsuarios = [
        { id_usuario: 1, nombre: "Ana", correo: "ana@mail.com" },
        { id_usuario: 2, nombre: "Carlos", correo: "carlos@mail.com" },
      ];
      db.query.mockImplementation((sql, cb) => cb(null, mockUsuarios));

      const res = await request(app).get("/api/users");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUsuarios);
      expect(db.query).toHaveBeenCalledWith("SELECT * FROM usuarios", expect.any(Function));
    });

    it("retorna 500 si ocurre un error en la DB", async () => {
      db.query.mockImplementation((sql, cb) => cb(new Error("DB caída"), null));

      const res = await request(app).get("/api/users");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "DB caída");
    });
  });

  // ─── POST /api/users/register 

  describe("POST /api/users/register", () => {
    it("registra un usuario ciudadano (rol != reciclador) con id_rol 1", async () => {
      db.query.mockImplementation((sql, params, cb) => cb(null, { insertId: 10 }));

      const res = await request(app).post("/api/users/register").send({
        nombre: "Laura",
        correo: "laura@mail.com",
        contrasena: "1234",
        rol: "ciudadano",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Usuario registrado con éxito" });

      const params = db.query.mock.calls[0][1];
      expect(params[3]).toBe(1); 
    });

    it("registra un usuario con rol reciclador (id_rol = 2)", async () => {
      db.query.mockImplementation((sql, params, cb) => cb(null, { insertId: 11 }));

      const res = await request(app).post("/api/users/register").send({
        nombre: "Pedro",
        correo: "pedro@mail.com",
        contrasena: "abcd",
        rol: "reciclador",
      });

      expect(res.status).toBe(200);
      const params = db.query.mock.calls[0][1];
      expect(params[3]).toBe(2);
    });

    it("retorna 500 si la DB falla al registrar", async () => {
      db.query.mockImplementation((sql, params, cb) =>
        cb(new Error("Duplicate entry"), null)
      );

      const res = await request(app).post("/api/users/register").send({
        nombre: "X",
        correo: "x@mail.com",
        contrasena: "x",
        rol: "ciudadano",
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error");
    });
  });

  // ─── POST /api/users/login 

  describe("POST /api/users/login", () => {
    it("responde con éxito y datos del usuario si las credenciales son correctas", async () => {
      const mockUser = { id_usuario: 1, nombre: "Ana", correo: "ana@mail.com" };
      db.query.mockImplementation((sql, params, cb) => cb(null, [mockUser]));

      const res = await request(app).post("/api/users/login").send({
        correo: "ana@mail.com",
        contrasena: "1234",
      });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Inicio de sesión exitoso");
      expect(res.body.usuario).toEqual(mockUser);
    });

    it("retorna 401 si las credenciales son incorrectas", async () => {
      db.query.mockImplementation((sql, params, cb) => cb(null, []));

      const res = await request(app).post("/api/users/login").send({
        correo: "noexiste@mail.com",
        contrasena: "wrong",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Credenciales incorrectas");
    });

    it("retorna 500 si la DB falla en el login", async () => {
      db.query.mockImplementation((sql, params, cb) =>
        cb(new Error("Timeout"), null)
      );

      const res = await request(app).post("/api/users/login").send({
        correo: "a@b.com",
        contrasena: "x",
      });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Timeout");
    });
  });
});
