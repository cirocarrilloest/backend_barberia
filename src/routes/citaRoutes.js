import express from "express";
import * as citaController from "../controllers/citaController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { esAdmin, esBarberoOAdmin } from "../middlewares/roleMiddleware.js";
import { validarCita } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Rutas fijas — deben ir ANTES de las rutas con parámetros
router.get("/mis-citas", citaController.getMisCitas);
router.get("/proximas", citaController.getProximasCitas);
router.get("/historial", citaController.getHistorialCitas);
router.get("/disponibilidad", citaController.verificarDisponibilidad);
router.get("/agenda-dia", esBarberoOAdmin, citaController.getAgendaDia);
router.get("/resumen", esBarberoOAdmin, citaController.getResumenCitas);
router.get("/todas", esAdmin, citaController.getAllCitas);
router.get("/dashboard", esAdmin, citaController.getDashboard);
router.get(
  "/distribucion-horaria",
  esAdmin,
  citaController.getDistribucionHoraria,
);
router.get("/reporte/ingresos", esAdmin, citaController.getReporteIngresos);
router.get("/reporte/servicios-top", esAdmin, citaController.getServiciosTop);
router.get("/reporte/clientes-top", esAdmin, citaController.getClientesTop);
router.get(
  "/reporte/tasa-cancelacion",
  esAdmin,
  citaController.getTasaCancelacion,
);

// Rutas de barbero con segmentos específicos ANTES de /:id
router.get(
  "/barbero/:id/horarios-disponibles",
  citaController.getHorariosDisponibles,
);
router.get(
  "/barbero/:id/semana",
  esBarberoOAdmin,
  citaController.getAgendaSemana,
);
router.get(
  "/barbero/:barbero_id",
  esBarberoOAdmin,
  citaController.getCitasBarbero,
);

// Rutas con parámetro :id — siempre al final
router.post("/", validarCita, citaController.agendarCita);
router.put("/:id/estado", esBarberoOAdmin, citaController.actualizarEstadoCita);
router.put("/:id/reagendar", citaController.reagendarCita);
router.patch("/:id/confirmar", esBarberoOAdmin, citaController.confirmarCita);
router.patch("/:id/finalizar", esBarberoOAdmin, citaController.finalizarCita);
router.delete("/:id", citaController.cancelarCita);

// GET /:id siempre el último
router.get("/:id", citaController.getCitaById);

export default router;
