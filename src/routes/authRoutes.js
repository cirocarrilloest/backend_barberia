//src/routes/authRoutes.js
import express from "express"; //importamos express para crear el router de autenticación

import * as authController from "../controllers/authController.js"; //importamos el controlador de autenticación para manejar las rutas de autenticación
import { authMiddleware } from "../middlewares/authMiddleware.js"; //importamos el middleware de autenticación para proteger las rutas de autenticación

const router = express.Router(); //creamos el router de autenticación

//Rutas de autenticación
router.post("/registro", authController.registrarUsuario); //ruta para registrar un nuevo usuario
router.post("/ingreso", authController.ingresarUsuario); //ruta para ingresar un usuario existente
router.get("/perfil", authMiddleware, authController.getPerfilUsuario); //ruta protegida para obtener el perfil del usuario autenticado

// Exportar el router de autenticación para que pueda ser utilizado en la aplicación principal
export default router; //exportamos el router de autenticación para que pueda ser utilizado en la aplicación principal
