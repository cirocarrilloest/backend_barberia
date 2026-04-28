//src/middlewares/authMiddleware.js
import { verifyToken } from "../services/tokenService.js"; //importar función de verificación de token
//middleware de autenticación para proteger rutas que requieren autenticación
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization"); //obtener encabezado de autorización
    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        message: "no se proporcionó token de autenticación",
      }); //si no hay encabezado, devolver error 401
    }

    if (!authHeader.startsWith("Bearer ")) {
      //verificar que el encabezado tenga el formato correcto "Bearer <token>"
      return res.status(401).json({
        ok: false,
        message: "formato de token no válido. se espera 'Bearer <token>'",
      }); //si el formato del token no es válido, devolver error 401
    }
    const token = authHeader.substring(7); //extraer token del encabezado (eliminar "Bearer ")
    const decoded = verifyToken(token); //verificar token y obtener datos decodificados

    if (!decoded) {
      //si el token no es válido, decoded será null o undefined
      return res.status(403).json({
        ok: false,
        message: "token invalido o expirado",
      }); //si el token no es válido, devolver error 403
    }
    req.usuario = decoded; //agregar datos del usuario al objeto de solicitud para su uso en rutas protegidas
    next(); //continuar con la siguiente función de middleware o ruta
  } catch (error) {
    console.error("Error en el middleware de autenticación:", error);
    return res.status(500).json({
      ok: false,
      message: "error interno del servidor",
    }); //si ocurre un error, devolver error 500
  }
};
