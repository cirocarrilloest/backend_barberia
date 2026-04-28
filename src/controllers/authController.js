//src/controllers/authController.js
import * as userModel from "../models/userModel.js"; // Importar el modelo de usuario para interactuar con la base de datos
import { generarToken } from "../services/tokenService.js"; // Importar la función para generar tokens de autenticación
import { validarRegistro, validarIngreso } from "../utils/validador.js"; // Importar las funciones de validación para los datos de registro e ingreso
// Función para manejar el registro de un nuevo usuario
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
    const { nombre, email, pass } = req.body; // Desestructurar los datos de entrada para obtener el nombre, email y contraseña

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
    const nuevoUsuario = await userModel.createUser({ nombre, email, pass }); // Crear un nuevo usuario en la base de datos utilizando los datos proporcionados
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
// Exportar las funciones del controlador de autenticación para que puedan ser utilizadas en las rutas
export default {
  registrarUsuario, // Función para manejar el registro de un nuevo usuario
  ingresarUsuario, // Función para manejar el ingreso de un usuario existente
  getPerfilUsuario, // Función para obtener el perfil del usuario autenticado
};
