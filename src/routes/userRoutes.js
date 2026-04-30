// routes/userRoutes.js
import express from "express";
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";

const router = express.Router();
// Ruta pública para obtener el perfil de un barbero específico (cualquier usuario autenticado)
router.get(
  "/barberos/:id/perfil",
  authMiddleware,
  authController.getPerfilBarbero, // 👈 CAMBIADO
);
// Ruta pública para obtener barberos (cualquier usuario autenticado)
router.get("/barberos/listar", authMiddleware, userController.getBarberos);
router.get(
  "/barberos/:id/horario",
  authMiddleware,
  userController.getHorarioBarbero,
);
router.post(
  "/barberos/:id/horario",
  authMiddleware,
  esAdmin,
  userController.setHorarioBarbero,
);
router.delete(
  "/barberos/:id/horario/:dia",
  authMiddleware,
  esAdmin,
  userController.deleteHorarioBarbero,
);

// Todas las rutas requieren autenticación y ser admin
router.use(authMiddleware, esAdmin);

router.get("/", userController.getUsuarios);
router.get("/:id", userController.getUsuarioById);
router.post("/", userController.createUsuario);
router.put("/:id", userController.updateUsuario);
router.delete("/:id", userController.deleteUsuario);
router.patch("/:id/rol", userController.asignarRol);
router.get("/:id/citas", userController.getCitasDeUsuario);

export default router;
