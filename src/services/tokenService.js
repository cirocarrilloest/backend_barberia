//src/services/tokenService.js
import jwt from "jsonwebtoken"; //import { User } from '../models/User.js';
import dotenv from "dotenv"; //importar dotenv para cargar variables de entorno
dotenv.config(); //cargar variables de entorno desde el archivo .env
//Genera un token JWT con el ID de usuario, correo electrónico y rol, utilizando una clave secreta y un tiempo de expiración definidos en las variables de entorno.
export const generarToken = (id, email, rol) => {
  //generar token JWT con id, email y rol del usuario
  return jwt.sign(
    {
      id,
      email,
      rol,
    },
    process.env.JWT_SECRET, //clave secreta para firmar el token
    {
      expiresIn: process.env.JWT_EXPIRES_IN, //tiempo de vencimiento del token
    },
  );
};
//Verifica el token y devuelve los datos decodificados o null si no es válido.
export const verifyToken = (token) => {
  //verificar token JWT y devolver datos decodificados o null si no es válido
  try {
    if (tokenEstaInvalidado(token)) return null; //verificar si el token ha sido invalidado antes de verificarlo
    return jwt.verify(token, process.env.JWT_SECRET); //verificar el token utilizando la clave secreta y devolver los datos decodificados
  } catch (err) {
    return null; //ficha no válida
  }
};

const tokenBlacklist = new Set();

export const invalidarToken = (token) => {
  tokenBlacklist.add(token);
};

export const tokenEstaInvalidado = (token) => {
  return tokenBlacklist.has(token);
};
