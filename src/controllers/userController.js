// controllers/userController.js
import { getPool } from "../config/db.js";
import * as userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
// Listar todos los usuarios (admin)
export const getUsuarios = async (req, res) => {
  try {
    const { rol, search } = req.query;
    const pool = getPool();

    let query = `SELECT id, nombre, email, rol, telefono, created_at FROM usuarios WHERE 1=1`;
    const params = [];

    if (rol) {
      query += ` AND rol = ?`;
      params.push(rol);
    }

    if (search) {
      query += ` AND (nombre LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute(query, params);
    res.json({ ok: true, usuarios: rows });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Obtener usuario por ID
export const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await userModel.getUserById(id);

    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    res.json({ ok: true, usuario });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Crear usuario (admin)
export const createUsuario = async (req, res) => {
  try {
    const { nombre, email, pass, rol, telefono } = req.body;

    const usuarioExistente = await userModel.findUserByEmail(email);
    if (usuarioExistente) {
      return res
        .status(409)
        .json({ ok: false, message: "El email ya está registrado" });
    }

    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    );
    const hashedPassword = await bcrypt.hash(pass, salt);

    const pool = getPool();
    const query = `INSERT INTO usuarios (nombre, email, pass, rol, telefono) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await pool.execute(query, [
      nombre,
      email.toLowerCase(),
      hashedPassword,
      rol || "cliente",
      telefono || null,
    ]);

    const nuevoUsuario = await userModel.getUserById(result.insertId);

    res.status(201).json({
      ok: true,
      message: "Usuario creado exitosamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Actualizar usuario
export const updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, telefono, pass } = req.body;

    const usuarioExistente = await userModel.getUserById(id);
    if (!usuarioExistente) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    const pool = getPool();
    let query = `UPDATE usuarios SET nombre = ?, email = ?, rol = ?, telefono = ?`;
    const params = [
      nombre || usuarioExistente.nombre,
      email || usuarioExistente.email,
      rol || usuarioExistente.rol,
      telefono || null,
    ];

    if (pass) {
      const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
      );
      const hashedPassword = await bcrypt.hash(pass, salt);
      query += `, pass = ?`;
      params.push(hashedPassword);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await pool.execute(query, params);

    const usuarioActualizado = await userModel.getUserById(id);
    res.json({
      ok: true,
      message: "Usuario actualizado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await userModel.getUserById(id);
    if (!usuario) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }

    const pool = getPool();
    await pool.execute(`DELETE FROM usuarios WHERE id = ?`, [id]);

    res.json({ ok: true, message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Asignar rol a usuario
export const asignarRol = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    const rolesPermitidos = ["admin", "barbero", "cliente"];
    if (!rolesPermitidos.includes(rol)) {
      return res.status(400).json({ ok: false, message: "Rol no válido" });
    }

    const pool = getPool();
    await pool.execute(`UPDATE usuarios SET rol = ? WHERE id = ?`, [rol, id]);

    const usuarioActualizado = await userModel.getUserById(id);
    res.json({
      ok: true,
      message: "Rol asignado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al asignar rol:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Listar solo barberos
export const getBarberos = async (req, res) => {
  try {
    const pool = getPool();
    const query = `SELECT id, nombre, email, telefono FROM usuarios WHERE rol = 'barbero' AND activo = 1`;
    const [rows] = await pool.execute(query);
    res.json({
      ok: true,
      barberos: rows,
    });
  } catch (error) {
    console.error("Error al obtener barberos:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
