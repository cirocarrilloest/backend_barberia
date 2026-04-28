//src/controllers/citaController.js
import * as citaModel from "../models/citaModel.js";
import * as servicioModel from "../models/servicioModel.js";
import { getUserById } from "../models/userModel.js";

// Agendar nueva cita
export const agendarCita = async (req, res) => {
  try {
    const { barbero_id, servicio_id, fecha, hora, notas } = req.body;
    const cliente_id = req.usuario.id;

    // Validar que el usuario sea cliente o admin
    if (req.usuario.rol !== "cliente" && req.usuario.rol !== "admin") {
      return res.status(403).json({
        ok: false,
        message: "Solo los clientes pueden agendar citas",
      });
    }

    // Validar campos requeridos
    if (!barbero_id || !servicio_id || !fecha || !hora) {
      return res.status(400).json({
        ok: false,
        message:
          "Faltan campos requeridos: barbero_id, servicio_id, fecha, hora",
      });
    }

    // Verificar que el barbero existe y tiene rol de barbero
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

    // Crear cita
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
