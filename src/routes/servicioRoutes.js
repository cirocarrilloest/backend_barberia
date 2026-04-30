//src/routes/servicioRoutes.js
import express from "express";
import * as servicioController from "../controllers/servicioController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin } from "../middlewares/roleMiddleware.js";
import {
  validarActualizarServicio,
  validarServicio,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Rutas públicas (requieren autenticación pero cualquier rol puede ver)
router.get("/", authMiddleware, servicioController.getServicios);
router.get(
  "/:id/barberos",
  authMiddleware,
  servicioController.getBarberosPorServicio,
);
router.get("/:id", authMiddleware, servicioController.getServicioById);

// Rutas solo para admin
router.post(
  "/",
  authMiddleware,
  esAdmin,
  validarServicio,
  servicioController.crearServicio,
);
router.put(
  "/:id",
  authMiddleware,
  esAdmin,
  validarActualizarServicio,
  servicioController.actualizarServicio,
);

router.patch(
  "/:id/toggle-activo",
  authMiddleware,
  esAdmin,
  servicioController.toggleActivoServicio,
);

router.delete(
  "/:id",
  authMiddleware,
  esAdmin,
  servicioController.eliminarServicio,
);

export default router;
