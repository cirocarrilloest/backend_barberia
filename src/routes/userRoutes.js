// routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Ruta pública para obtener barberos (cualquier usuario autenticado)
router.get("/barberos/listar", authMiddleware, userController.getBarberos);
// Todas las rutas requieren autenticación y ser admin
router.use(authMiddleware, esAdmin);

router.get("/", userController.getUsuarios);
router.get("/:id", userController.getUsuarioById);
router.post("/", userController.createUsuario);
router.put("/:id", userController.updateUsuario);
router.delete("/:id", userController.deleteUsuario);
router.patch("/:id/rol", userController.asignarRol);

export default router;
