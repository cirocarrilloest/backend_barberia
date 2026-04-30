//src/controllers/authController.js
import * as userModel from "../models/userModel.js"; // Importar el modelo de usuario para interactuar con la base de datos
import { generarToken, invalidarToken } from "../services/tokenService.js"; // Importar funciones para generar e invalidar tokens de autenticación
import { validarRegistro, validarIngreso } from "../utils/validador.js"; // Importar las funciones de validación para los datos de registro e ingreso
// Función para manejar el registro de un nuevo usuario
import { getPool } from "../config/db.js"; // Importar la función para obtener una conexión a la base de datos
import bcrypt from "bcryptjs"; // Importar bcrypt para hashear contraseñas
export const registrarUsuario = async (req, res) => {
  try {
    // Validar los datos de entrada utilizando la función de validación de registro
    const { error } = validarRegistro(req.body); // Validar los datos de entrada utilizando la función de validación de registro
    if (error) {
      return res.status(400).json({
        ok: false,
        message: error.details.map((e) => e.message), // Retornar un array con los mensajes de error de validación
      });
    }
    const { nombre, email, pass, telefono } = req.body; // Desestructurar los datos de entrada para obtener el nombre, email y contraseña

    // Verificar si el usuario ya existe en la base de datos
    const usuarioExistente = await userModel.findUserByEmail(email); // Buscar un usuario en la base de datos utilizando el email proporcionado
    if (usuarioExistente) {
      return res.status(409).json({
        // Retornar un error de conflicto si el usuario ya existe
        ok: false,
        message: "el email ya esta registrado", // Retornar un mensaje indicando que el email ya está registrado
      });
    }
    // Crear un nuevo usuario en la base de datos
    const nuevoUsuario = await userModel.createUser({
      nombre,
      email,
      pass,
      telefono,
      rol: "cliente", // Asignar el rol de "cliente" por defecto al nuevo usuario registrado
    }); // Crear un nuevo usuario en la base de datos utilizando los datos proporcionados
    delete nuevoUsuario.pass;
    res.status(201).json({
      ok: true,
      message: "Usuario registrado exitosamente", // Retornar un mensaje indicando que el usuario ha sido registrado exitosamente
      user: nuevoUsuario, // Retornar los datos del nuevo usuario registrado
    }); // Retornar una respuesta exitosa indicando que el usuario ha sido registrado
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({
      ok: false,
      message: "error interno del servidor", // Retornar un mensaje de error genérico en caso de que ocurra un error durante el proceso de registro
    });
  }
};

// Función para manejar el ingreso de un usuario existente
export const ingresarUsuario = async (req, res) => {
  try {
    // Validar los datos de entrada utilizando la función de validación de ingreso
    const { error } = validarIngreso(req.body); // Validar los datos de entrada utilizando la función de validación de ingreso
    if (error) {
      return res.status(400).json({
        ok: false,
        message: error.details.map((e) => e.message), // Retornar un array con los mensajes de error de validación
      });
    }
    const { email, pass } = req.body; // Desestructurar los datos de entrada para obtener el email y la contraseña

    // Verificar si el usuario existe en la base de datos
    const usuarioExistente = await userModel.findUserByEmail(email); // Buscar un usuario en la base de datos utilizando el email proporcionado
    if (!usuarioExistente) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas", // Retornar un mensaje indicando que las credenciales son inválidas
      });
    }
    // Verificar si la contraseña es correcta
    const contraseniaValida = await userModel.verifypass(
      pass,
      usuarioExistente.pass,
    ); // Verificar si la contraseña proporcionada coincide con la contraseña hasheada almacenada en la base de datos
    if (!contraseniaValida) {
      return res.status(401).json({
        ok: false,
        message: "Credenciales inválidas", // Retornar un mensaje indicando que las credenciales son inválidas
      });
    }
    // Generar un token de autenticación para el usuario
    const token = generarToken(
      usuarioExistente.id,
      usuarioExistente.email,
      usuarioExistente.rol,
    ); // Generar un token de autenticación utilizando la función de generación de tokens, pasando el ID, email y rol del usuario

    // Crear un objeto de respuesta con los datos del usuario (sin incluir la contraseña)
    const usuarioRespuesta = {
      id: usuarioExistente.id,
      nombre: usuarioExistente.nombre,
      email: usuarioExistente.email,
      rol: usuarioExistente.rol,
    }; // Crear un objeto de respuesta con los datos del usuario (sin incluir la contraseña)

    res.json({
      ok: true,
      message: "Ingreso exitoso", // Retornar un mensaje indicando que el ingreso ha sido exitoso
      token, // Retornar el token de autenticación generado
      user: usuarioRespuesta, // Retornar los datos del usuario en la respuesta
    }); // Retornar una respuesta exitosa indicando que el ingreso ha sido exitoso
  } catch (error) {
    console.error("Error al ingresar usuario:", error);
    res.status(500).json({
      ok: false,
      message: "error interno del servidor", // Retornar un mensaje de error genérico en caso de que ocurra un error durante el proceso de ingreso'
    });
  }
};
// Función para manejar el cierre de sesión de un usuario
export const logoutUsuario = async (req, res) => {
  try {
    const token = req.header("Authorization").substring(7);
    invalidarToken(token);
    res.json({
      ok: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Función para obtener el perfil del usuario autenticado
export const getPerfilUsuario = async (req, res) => {
  try {
    const usuario = await userModel.getUserById(req.usuario.id); // Obtener los datos del usuario utilizando su ID, que se encuentra en el objeto req.user (establecido por el middleware de autenticación)
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado", // Retornar un mensaje indicando que el usuario no fue encontrado
      });
    }
    delete usuario.pass;
    res.json({
      ok: true,
      usuario,
    }); // Retornar una respuesta exitosa con los datos del usuario
  } catch (error) {
    console.error("Error al obtener perfil de usuario:", error);
    res.status(500).json({
      ok: false,
      message: "error interno del servidor", // Retornar un mensaje de error genérico en caso de que ocurra un error durante el proceso de obtención del perfil de usuario
    });
  }
};

export const cambiarPassword = async (req, res) => {
  try {
    const { pass_actual, pass_nueva } = req.body;

    if (!pass_actual || !pass_nueva) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere pass_actual y pass_nueva",
      });
    }

    if (pass_nueva.length < 6) {
      return res.status(400).json({
        ok: false,
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    // Obtener usuario con su contraseña hasheada
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id, pass FROM usuarios WHERE id = ?",
      [req.usuario.id],
    );

    const usuario = rows[0];
    if (!usuario) {
      return res.status(404).json({
        ok: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar que la contraseña actual es correcta
    const contraseniaValida = await userModel.verifypass(
      pass_actual,
      usuario.pass,
    );
    if (!contraseniaValida) {
      return res.status(401).json({
        ok: false,
        message: "La contraseña actual es incorrecta",
      });
    }

    // Hashear y guardar la nueva contraseña
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
    );
    const hashedPassword = await bcrypt.hash(pass_nueva, salt);

    await pool.execute("UPDATE usuarios SET pass = ? WHERE id = ?", [
      hashedPassword,
      req.usuario.id,
    ]);

    res.json({
      ok: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const getPerfilBarbero = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    // Obtener datos del barbero
    const [rows] = await pool.execute(
      `SELECT id, nombre, email, telefono FROM usuarios 
       WHERE id = ? AND rol = 'barbero'`,
      [id],
    );

    if (!rows[0]) {
      return res.status(404).json({
        ok: false,
        message: "Barbero no encontrado",
      });
    }

    // Obtener estadísticas públicas del barbero
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_citas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas
       FROM citas WHERE barbero_id = ?`,
      [id],
    );

    // Obtener servicios más realizados por este barbero
    const [servicios] = await pool.execute(
      `SELECT s.id, s.nombre, s.precio, s.duracion, COUNT(c.id) as veces_realizado
       FROM servicios s
       JOIN citas c ON s.id = c.servicio_id
       WHERE c.barbero_id = ? AND c.estado = 'completada'
       GROUP BY s.id
       ORDER BY veces_realizado DESC
       LIMIT 5`,
      [id],
    );

    res.json({
      ok: true,
      barbero: {
        ...rows[0],
        estadisticas: {
          total_citas: stats[0].total_citas,
          citas_completadas: stats[0].citas_completadas,
          citas_canceladas: stats[0].citas_canceladas,
        },
        servicios_frecuentes: servicios,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil de barbero:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Exportar las funciones del controlador de autenticación para que puedan ser utilizadas en las rutas
export default {
  registrarUsuario, // Función para manejar el registro de un nuevo usuario
  ingresarUsuario, // Función para manejar el ingreso de un usuario existente
  cambiarPassword, // Función para cambiar la contraseña de un usuario autenticado
  getPerfilUsuario, // Función para obtener el perfil del usuario autenticado
  logoutUsuario, // Función para cerrar sesión de un usuario
  getPerfilBarbero, // Función para obtener el perfil de un barbero específico
};
