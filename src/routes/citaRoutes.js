// src/routes/citaRoutes.js
import express from "express";
import * as citaController from "../controllers/citaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin, esBarberoOAdmin } from "../middlewares/roleMiddleware.js";
import { validarCita } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas de citas
router.post("/", validarCita, citaController.agendarCita);
router.get("/mis-citas", citaController.getMisCitas);
router.get("/disponibilidad", citaController.verificarDisponibilidad);

// Ruta para obtener citas por barbero - separada en dos rutas específicas
router.get("/barbero/:barbero_id", citaController.getCitasBarbero);
router.get("/todas", esAdmin, citaController.getAllCitas);

router.put("/:id/estado", esBarberoOAdmin, citaController.actualizarEstadoCita);
router.delete("/:id", citaController.cancelarCita);
router.patch("/:id/finalizar", esBarberoOAdmin, citaController.finalizarCita);
router.get("/:id", citaController.getCitaById);

export default router;
