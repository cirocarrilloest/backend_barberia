// src/routes/citaRoutes.js
import express from "express";
import * as citaController from "../controllers/citaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin, esBarberoOAdmin } from "../middlewares/roleMiddleware.js";
import { validarCita } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para clientes
router.get("/mis-citas", citaController.getMisCitas);
router.get("/proximas", citaController.getProximasCitas);
router.get("/historial", citaController.getHistorialCitas);
router.get("/disponibilidad", citaController.verificarDisponibilidad);

// Rutas para barbero
router.get("/agenda-dia", esBarberoOAdmin, citaController.getAgendaDia);
router.get("/resumen", esBarberoOAdmin, citaController.getResumenCitas);

// Rutas para admin
router.get("/todas", esAdmin, citaController.getAllCitas);
router.get("/dashboard", esAdmin, citaController.getDashboard);
router.get(
  "/distribucion-horaria",
  esAdmin,
  citaController.getDistribucionHoraria,
);

// Rutas para reportes y estadísticas (solo admin)
router.get("/reporte/ingresos", esAdmin, citaController.getReporteIngresos);
router.get("/reporte/servicios-top", esAdmin, citaController.getServiciosTop);
router.get("/reporte/clientes-top", esAdmin, citaController.getClientesTop);
router.get(
  "/reporte/tasa-cancelacion",
  esAdmin,
  citaController.getTasaCancelacion,
);

// Rutas de citas
router.post("/", validarCita, citaController.agendarCita);
router.get(
  "/barbero/:barbero_id",
  esBarberoOAdmin,
  citaController.getCitasBarbero,
);
router.put("/:id/estado", esBarberoOAdmin, citaController.actualizarEstadoCita);
router.patch("/:id/finalizar", esBarberoOAdmin, citaController.finalizarCita);
router.delete("/:id", citaController.cancelarCita);
router.get("/:id", citaController.getCitaById);

export default router;
