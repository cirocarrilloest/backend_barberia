//src/controllers/citaController.js
import citaModel from "../models/citaModel.js";
import * as servicioModel from "../models/servicioModel.js";
import { getUserById } from "../models/userModel.js";

// Agendar nueva cita
export const agendarCita = async (req, res) => {
  try {
    const { barbero_id, servicio_id, fecha, hora, notas } = req.body;
    const cliente_id = req.usuario.id;

    if (req.usuario.rol !== "cliente" && req.usuario.rol !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Solo los clientes pueden agendar citas",
      });
    }

    if (!barbero_id || !servicio_id || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        message:
          "Faltan campos requeridos: barbero_id, servicio_id, fecha, hora",
      });
    }

    // Primero verificar que el barbero existe
    const barbero = await getUserById(barbero_id);
    if (!barbero || barbero.rol !== "barbero") {
      return res.status(400).json({
        ok: false,
        message: "El barbero seleccionado no es válido",
      });
    }

    // Verificar que el servicio existe
    const servicio = await servicioModel.getServicioById(servicio_id);
    if (!servicio || !servicio.activo) {
      return res.status(400).json({
        ok: false,
        message: "El servicio seleccionado no está disponible",
      });
    }

    // Ahora sí verificar horario laboral
    const enHorarioLaboral = await citaModel.verificarHorarioLaboral(
      barbero_id,
      fecha,
      hora,
    );
    if (!enHorarioLaboral) {
      return res.status(400).json({
        ok: false,
        message:
          "El horario seleccionado está fuera de la jornada laboral del barbero. Consulta los horarios disponibles.",
      });
    }

    // Verificar duplicación
    const duplicado = await citaModel.verificarDuplicado(
      barbero_id,
      fecha,
      hora,
    );
    if (duplicado) {
      return res.status(409).json({
        ok: false,
        message: "El barbero ya tiene una cita agendada en ese horario",
      });
    }

    const nuevaCita = await citaModel.createCita({
      cliente_id,
      barbero_id,
      servicio_id,
      fecha,
      hora,
      notas,
    });

    res.status(201).json({
      ok: true,
      message: "Cita agendada exitosamente",
      cita: nuevaCita,
    });
  } catch (error) {
    console.error("Error al agendar cita:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Obtener mis citas (cliente)
export const getMisCitas = async (req, res) => {
  try {
    const citas = await citaModel.getCitasByCliente(req.usuario.id);
    res.json({
      ok: true,
      citas,
    });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Obtener cita por ID
export const getCitaById = async (req, res) => {
  try {
    const { id } = req.params;
    const cita = await citaModel.getCitaById(id);

    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    // Verificar permisos
    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para ver esta cita",
      });
    }

    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para ver esta cita",
      });
    }

    res.json({
      ok: true,
      cita,
    });
  } catch (error) {
    console.error("Error al obtener cita:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Obtener citas de barbero (barbero/admin)
export const getCitasBarbero = async (req, res) => {
  try {
    const barbero_id = req.params.barbero_id;
    const { fecha } = req.query;

    // Si es admin y NO proporcionó barbero_id, obtener todas las citas
    if (req.usuario.rol === "admin" && !barbero_id) {
      const filtros = {};
      if (fecha) filtros.fecha = fecha;
      const citas = await citaModel.getAllCitas(filtros);
      return res.json({
        ok: true,
        citas,
      });
    }

    // Si es barbero, solo puede ver sus propias citas
    if (req.usuario.rol === "barbero") {
      // Si es barbero, ignoramos el barbero_id de la URL y usamos el suyo
      const citas = await citaModel.getCitasByBarbero(req.usuario.id, fecha);
      return res.json({
        ok: true,
        citas,
      });
    }

    // Si es admin con barbero_id específico
    if (req.usuario.rol === "admin" && barbero_id) {
      const citas = await citaModel.getCitasByBarbero(barbero_id, fecha);
      return res.json({
        ok: true,
        citas,
      });
    }

    // Si es cliente tratando de ver citas de barbero - denegar
    if (req.usuario.rol === "cliente") {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para ver citas de barberos",
      });
    }

    return res.status(400).json({
      ok: false,
      message: "Parámetros inválidos",
    });
  } catch (error) {
    console.error("Error al obtener citas del barbero:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Cancelar cita
export const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await citaModel.getCitaById(id);
    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    // Verificar permisos
    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para cancelar esta cita",
      });
    }

    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para cancelar esta cita",
      });
    }

    const citaCancelada = await citaModel.cancelarCita(id);

    res.json({
      ok: true,
      message: "Cita cancelada exitosamente",
      cita: citaCancelada,
    });
  } catch (error) {
    console.error("Error al cancelar cita:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Actualizar estado de cita (barbero/admin)
export const actualizarEstadoCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosPermitidos = [
      "pendiente",
      "confirmada",
      "completada",
      "cancelada",
    ];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        ok: false,
        message: "Estado no válido",
      });
    }

    const cita = await citaModel.getCitaById(id);
    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    // Verificar permisos
    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para modificar esta cita",
      });
    }

    const citaActualizada = await citaModel.updateCitaEstado(id, estado);

    res.json({
      ok: true,
      message: "Estado de la cita actualizado",
      cita: citaActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar cita:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Verificar disponibilidad de horario
export const verificarDisponibilidad = async (req, res) => {
  try {
    const { barbero_id, fecha, hora } = req.query;

    if (!barbero_id || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere barbero_id, fecha y hora",
      });
    }

    const disponible = await citaModel.verificarDisponibilidad(
      barbero_id,
      fecha,
      hora,
    );
    const horariosOcupados = await citaModel.getHorariosOcupados(
      barbero_id,
      fecha,
    );

    res.json({
      ok: true,
      disponible,
      horarios_ocupados: horariosOcupados,
    });
  } catch (error) {
    console.error("Error al verificar disponibilidad:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Obtener todas las citas (admin)
export const getAllCitas = async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta } = req.query;
    const filtros = { estado, fecha_desde, fecha_hasta };

    const citas = await citaModel.getAllCitas(filtros);

    res.json({
      ok: true,
      citas,
    });
  } catch (error) {
    console.error("Error al obtener todas las citas:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const confirmarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await citaModel.getCitaById(id);
    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para confirmar esta cita",
      });
    }

    if (cita.estado !== "pendiente") {
      return res.status(400).json({
        ok: false,
        message: `No se puede confirmar una cita en estado "${cita.estado}"`,
      });
    }

    const citaConfirmada = await citaModel.updateCitaEstado(id, "confirmada");

    res.json({
      ok: true,
      message: "Cita confirmada exitosamente",
      cita: citaConfirmada,
    });
  } catch (error) {
    console.error("Error al confirmar cita:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Finalizar cita (marcar como completada)
export const finalizarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const cita = await citaModel.getCitaById(id);
    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    // Solo barbero o admin pueden finalizar
    if (req.usuario.rol === "barbero" && cita.barbero_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para finalizar esta cita",
      });
    }

    const citaFinalizada = await citaModel.updateCitaEstado(id, "completada");

    res.json({
      ok: true,
      message: "Cita finalizada exitosamente",
      cita: citaFinalizada,
    });
  } catch (error) {
    console.error("Error al finalizar cita:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const reagendarCita = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora } = req.body;

    if (!fecha || !hora) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere fecha y hora",
      });
    }

    const cita = await citaModel.getCitaById(id);
    if (!cita) {
      return res.status(404).json({
        ok: false,
        message: "Cita no encontrada",
      });
    }

    // Solo el cliente dueño o admin pueden reagendar
    if (req.usuario.rol === "cliente" && cita.cliente_id !== req.usuario.id) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para reagendar esta cita",
      });
    }

    // Solo se pueden reagendar citas pendientes
    if (cita.estado !== "pendiente") {
      return res.status(400).json({
        ok: false,
        message: `No se puede reagendar una cita en estado "${cita.estado}". Solo se permiten citas pendientes`,
      });
    }

    // Verificar que la nueva fecha no sea en el pasado
    const hoy = new Date().toISOString().split("T")[0];
    if (fecha < hoy) {
      return res.status(400).json({
        ok: false,
        message: "No se puede reagendar a una fecha pasada",
      });
    }

    // Verificar que el nuevo slot esté disponible
    const duplicado = await citaModel.verificarDuplicado(
      cita.barbero_id,
      fecha,
      hora,
    );
    if (duplicado) {
      return res.status(409).json({
        ok: false,
        message: "El barbero ya tiene una cita en ese horario",
      });
    }

    const citaActualizada = await citaModel.updateCita(id, {
      barbero_id: cita.barbero_id,
      servicio_id: cita.servicio_id,
      fecha,
      hora,
      notas: cita.notas,
    });

    res.json({
      ok: true,
      message: "Cita reagendada exitosamente",
      cita: citaActualizada,
    });
  } catch (error) {
    console.error("Error al reagendar cita:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// CONSULTAS PARA CLIENTES

// Obtener próximas citas
export const getProximasCitas = async (req, res) => {
  try {
    const citas = await citaModel.getProximasCitasByCliente(req.usuario.id);
    res.json({
      ok: true,
      citas,
      total: citas.length,
    });
  } catch (error) {
    console.error("Error al obtener próximas citas:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Obtener historial completo de citas
export const getHistorialCitas = async (req, res) => {
  try {
    let { limite = 10 } = req.query;

    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) limiteNum = 10;
    if (limiteNum > 100) limiteNum = 100;

    const citas = await citaModel.getHistorialCitasByCliente(
      req.usuario.id,
      limiteNum,
    );

    res.json({
      ok: true,
      citas,
      total: citas.length,
      limite: limiteNum,
    });
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};
// CONSULTAS PARA BARBEROS

// Agenda del día para barbero
export const getAgendaDia = async (req, res) => {
  try {
    const { fecha } = req.query;

    if (req.usuario.rol !== "barbero" && req.usuario.rol !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para ver la agenda del día",
      });
    }

    let barbero_id = req.usuario.id;
    if (req.usuario.rol === "admin" && req.query.barbero_id) {
      barbero_id = req.query.barbero_id;
    }

    const citas = await citaModel.getAgendaDiaByBarbero(barbero_id, fecha);

    res.json({
      ok: true,
      fecha: fecha || new Date().toISOString().split("T")[0],
      citas,
      total_citas: citas.length,
    });
  } catch (error) {
    console.error("Error al obtener agenda del día:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Resumen de citas para barbero
export const getResumenCitas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    console.log("getResumenCitas - Usuario:", req.usuario.id);
    console.log("getResumenCitas - Rol:", req.usuario.rol);
    console.log("getResumenCitas - Fecha inicio:", fecha_inicio);
    console.log("getResumenCitas - Fecha fin:", fecha_fin);

    const resumen = await citaModel.getResumenCitasByBarbero(
      req.usuario.id,
      fecha_inicio,
      fecha_fin,
    );
    console.log("Resultado resumen:", resumen);
    res.json({
      ok: true,
      resumen,
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// CONSULTAS PARA ADMIN

// Reporte de ingresos
export const getReporteIngresos = async (req, res) => {
  try {
    const { periodo = "mes", fecha_inicio, fecha_fin } = req.query;

    const periodosValidos = ["dia", "mes", "año"];
    if (!periodosValidos.includes(periodo)) {
      return res.status(400).json({
        ok: false,
        message: `Período no válido. Use: ${periodosValidos.join(", ")}`,
      });
    }

    // Validar fechas
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere fecha_inicio y fecha_fin",
      });
    }

    const reporte = await citaModel.getReporteIngresos(
      periodo,
      fecha_inicio,
      fecha_fin,
    );
    res.json({
      ok: true,
      periodo,
      fecha_inicio,
      fecha_fin,
      reporte,
    });
  } catch (error) {
    console.error("Error al generar reporte de ingresos:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Servicios más solicitados
export const getServiciosTop = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, limite = 5 } = req.query;
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) {
      limiteNum = 5; // Valor por defecto si el límite no es válido
    }
    const servicios = await citaModel.getServiciosMasSolicitados(
      fecha_inicio,
      fecha_fin,
      limiteNum,
    );
    res.json({
      ok: true,
      servicios,
    });
  } catch (error) {
    console.error("Error al obtener servicios top:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Clientes más frecuentes
export const getClientesTop = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, limite = 10 } = req.query;
    let limiteNum = parseInt(limite);
    if (isNaN(limiteNum) || limiteNum <= 0) {
      limiteNum = 10; // Valor por defecto si el límite no es válido
    }
    const clientes = await citaModel.getClientesMasFrecuentes(
      fecha_inicio,
      fecha_fin,
      limiteNum,
    );
    res.json({
      ok: true,
      clientes,
    });
  } catch (error) {
    console.error("Error al obtener clientes top:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Dashboard estadísticas
export const getDashboard = async (req, res) => {
  try {
    const stats = await citaModel.getDashboardStats();
    res.json({
      ok: true,
      dashboard: {
        citas_hoy: stats.citas_hoy,
        citas_pendientes: stats.citas_pendientes,
        ingresos_mes: stats.ingresos_mes,
        clientes_totales: stats.clientes_totales,
        barberos_activos: stats.barberos_activos,
        tasa_ocupacion: stats.tasa_ocupacion,
      },
    });
  } catch (error) {
    console.error("Error al obtener dashboard:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Distribución por hora
export const getDistribucionHoraria = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const distribucion = await citaModel.getDistribucionCitasPorHora(
      fecha_inicio,
      fecha_fin,
    );
    res.json({
      ok: true,
      distribucion,
    });
  } catch (error) {
    console.error("Error al obtener distribución horaria:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

// Tasa de cancelación por barbero
export const getTasaCancelacion = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    const reporte = await citaModel.getTasaCancelacionPorBarbero(
      fecha_inicio,
      fecha_fin,
    );
    res.json({
      ok: true,
      reporte,
    });
  } catch (error) {
    console.error("Error al obtener tasa de cancelación:", error);
    res.status(500).json({ ok: false, message: "Error interno del servidor" });
  }
};

export const getHorariosDisponibles = async (req, res) => {
  try {
    const { id: barbero_id } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({
        ok: false,
        message: "Se requiere el parámetro fecha (YYYY-MM-DD)",
      });
    }

    // Verificar que el barbero existe
    const barbero = await getUserById(barbero_id);
    if (!barbero || barbero.rol !== "barbero") {
      return res.status(404).json({
        ok: false,
        message: "Barbero no encontrado",
      });
    }

    const disponibles = await citaModel.getHorariosDisponibles(
      barbero_id,
      fecha,
    );

    res.json({
      ok: true,
      barbero_id,
      fecha,
      horarios_disponibles: disponibles,
      total_disponibles: disponibles.length,
    });
  } catch (error) {
    console.error("Error al obtener horarios disponibles:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Agenda semanal para barbero
export const getAgendaSemana = async (req, res) => {
  try {
    const { id: barbero_id } = req.params;
    const { fecha_inicio } = req.query;

    const fecha = fecha_inicio || new Date().toISOString().split("T")[0];

    // Si es barbero, solo puede ver su propia agenda
    if (
      req.usuario.rol === "barbero" &&
      parseInt(barbero_id) !== req.usuario.id
    ) {
      return res.status(403).json({
        ok: false,
        message: "No tienes permiso para ver la agenda de otro barbero",
      });
    }

    const resultado = await citaModel.getCitasSemanaByBarbero(
      barbero_id,
      fecha,
    );

    res.json({
      ok: true,
      ...resultado,
      total_citas: Object.values(resultado.agenda).flat().length,
    });
  } catch (error) {
    console.error("Error al obtener agenda semanal:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export default {
  agendarCita,
  getMisCitas,
  getCitaById,
  getCitasBarbero,
  cancelarCita,
  reagendarCita,
  actualizarEstadoCita,
  verificarDisponibilidad,
  getAllCitas,
  confirmarCita,
  finalizarCita,
  getProximasCitas,
  getHistorialCitas,
  getAgendaDia,
  getResumenCitas,
  getReporteIngresos,
  getServiciosTop,
  getClientesTop,
  getDashboard,
  getDistribucionHoraria,
  getTasaCancelacion,
  getHorariosDisponibles,
  getAgendaSemana,
};
