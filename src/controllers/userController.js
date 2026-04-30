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

// Actualizar mi propio perfil (cliente/barbero)
export const updateMiPerfil = async (req, res) => {
  try {
    // ✅ Verificar que req.body existe
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        ok: false,
        message: "No se enviaron datos para actualizar",
      });
    }

    const usuarioId = req.usuario.id;
    const { nombre, email, telefono, pass } = req.body;

    const usuarioExistente = await userModel.getUserById(usuarioId);
    if (!usuarioExistente) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    const pool = getPool();

    // Construir query dinámicamente según los campos enviados
    const updates = [];
    const params = [];

    if (nombre !== undefined) {
      updates.push("nombre = ?");
      params.push(nombre);
    }

    if (email !== undefined) {
      // Verificar que el nuevo email no esté en uso por otro usuario
      if (email !== usuarioExistente.email) {
        const [emailExiste] = await pool.execute(
          "SELECT id FROM usuarios WHERE email = ? AND id != ?",
          [email.toLowerCase(), usuarioId],
        );
        if (emailExiste.length > 0) {
          return res.status(409).json({
            ok: false,
            message: "El email ya está en uso por otro usuario",
          });
        }
        updates.push("email = ?");
        params.push(email.toLowerCase());
      }
    }

    if (telefono !== undefined) {
      updates.push("telefono = ?");
      params.push(telefono || null);
    }

    if (pass) {
      const salt = await bcrypt.genSalt(
        parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
      );
      const hashedPassword = await bcrypt.hash(pass, salt);
      updates.push("pass = ?");
      params.push(hashedPassword);
    }

    // Si no hay nada que actualizar
    if (updates.length === 0) {
      return res.status(400).json({
        ok: false,
        message: "No se proporcionaron campos válidos para actualizar",
      });
    }

    const query = `UPDATE usuarios SET ${updates.join(", ")} WHERE id = ?`;
    params.push(usuarioId);

    await pool.execute(query, params);

    const usuarioActualizado = await userModel.getUserById(usuarioId);
    res.json({
      ok: true,
      message: "Perfil actualizado exitosamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Eliminar mi propia cuenta
export const deleteMiCuenta = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    // Verificar si tiene citas pendientes
    const pool = getPool();
    const [citas] = await pool.execute(
      `SELECT COUNT(*) as total FROM citas 
       WHERE cliente_id = ? AND estado IN ('pendiente', 'confirmada')`,
      [usuarioId],
    );

    if (citas[0].total > 0) {
      return res.status(400).json({
        ok: false,
        message: `No puedes eliminar tu cuenta porque tienes ${citas[0].total} cita(s) pendiente(s)`,
      });
    }

    await pool.execute(`DELETE FROM usuarios WHERE id = ?`, [usuarioId]);

    res.json({
      ok: true,
      message: "Cuenta eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Listar solo barberos
export const getBarberos = async (req, res) => {
  try {
    const pool = getPool();
    const query = `SELECT id, nombre, email, telefono FROM usuarios WHERE rol = 'barbero'`;
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

export const getCitasDeUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.query;

    const usuario = await userModel.getUserById(id);
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    const pool = getPool();
    let query = `
      SELECT c.*,
             b.nombre as barbero_nombre,
             s.nombre as servicio_nombre, s.duracion, s.precio
      FROM citas c
      JOIN usuarios b ON c.barbero_id = b.id
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.cliente_id = ?
    `;
    const params = [id];

    if (estado) {
      query += " AND c.estado = ?";
      params.push(estado);
    }

    query += " ORDER BY c.fecha DESC, c.hora DESC";

    const [citas] = await pool.execute(query, params);

    res.json({
      ok: true,
      usuario: { id: usuario.id, nombre: usuario.nombre },
      citas,
      total: citas.length,
    });
  } catch (error) {
    console.error("Error al obtener citas de usuario:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const setHorarioBarbero = async (req, res) => {
  try {
    const { id } = req.params;
    const { dia_semana, hora_inicio, hora_fin } = req.body;

    const diasValidos = [
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado",
      "domingo",
    ];
    if (!diasValidos.includes(dia_semana)) {
      return res.status(400).json({
        ok: false,
        message: `Día no válido. Use: ${diasValidos.join(", ")}`,
      });
    }

    if (!hora_inicio || !hora_fin) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere hora_inicio y hora_fin",
      });
    }

    const pool = getPool();
    await pool.execute(
      `INSERT INTO horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE hora_inicio = ?, hora_fin = ?, activo = TRUE`,
      [id, dia_semana, hora_inicio, hora_fin, hora_inicio, hora_fin],
    );

    res.json({
      ok: true,
      message: "Horario configurado exitosamente",
    });
  } catch (error) {
    console.error("Error al configurar horario:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const getHorarioBarbero = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [rows] = await pool.execute(
      "SELECT * FROM horarios_barbero WHERE barbero_id = ? AND activo = TRUE ORDER BY FIELD(dia_semana,'lunes','martes','miercoles','jueves','viernes','sabado','domingo')",
      [id],
    );

    res.json({ ok: true, horarios: rows });
  } catch (error) {
    console.error("Error al obtener horario:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const deleteHorarioBarbero = async (req, res) => {
  try {
    const { id, dia } = req.params;
    const pool = getPool();

    await pool.execute(
      "UPDATE horarios_barbero SET activo = FALSE WHERE barbero_id = ? AND dia_semana = ?",
      [id, dia],
    );

    res.json({ ok: true, message: "Horario eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar horario:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export default { setHorarioBarbero, getHorarioBarbero, deleteHorarioBarbero };
