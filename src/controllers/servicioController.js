//src/controllers/servicioController.js
import * as servicioModel from "../models/servicioModel.js";
import { getPool } from "../config/db.js";
// Crear nuevo servicio (admin)
export const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio, activo } = req.body;

    if (!nombre || !duracion || !precio) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos requeridos: nombre, duracion, precio",
      });
    }

    const nuevoServicio = await servicioModel.createServicio({
      nombre,
      descripcion,
      duracion,
      precio,
      activo,
    });

    res.status(201).json({
      ok: true,
      message: "Servicio creado exitosamente",
      servicio: nuevoServicio,
    });
  } catch (error) {
    console.error("Error al crear servicio:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Obtener todos los servicios
export const getServicios = async (req, res) => {
  try {
    const soloActivos = req.query.activos === "true";
    const servicios = await servicioModel.getAllServicios(soloActivos);

    res.json({
      ok: true,
      servicios,
    });
  } catch (error) {
    console.error("Error al obtener servicios:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Obtener servicio por ID
export const getServicioById = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await servicioModel.getServicioById(id);

    if (!servicio) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado",
      });
    }

    res.json({
      ok: true,
      servicio,
    });
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Actualizar servicio (admin)
export const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion, precio, activo } = req.body;

    const servicioExistente = await servicioModel.getServicioById(id);
    if (!servicioExistente) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado",
      });
    }

    const servicioActualizado = await servicioModel.updateServicio(id, {
      nombre: nombre || servicioExistente.nombre,
      descripcion:
        descripcion !== undefined ? descripcion : servicioExistente.descripcion,
      duracion: duracion || servicioExistente.duracion,
      precio: precio || servicioExistente.precio,
      activo: activo !== undefined ? activo : servicioExistente.activo,
    });

    res.json({
      ok: true,
      message: "Servicio actualizado exitosamente",
      servicio: servicioActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

// Eliminar servicio (admin)
export const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const servicioExistente = await servicioModel.getServicioById(id);
    if (!servicioExistente) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado",
      });
    }

    const eliminado = await servicioModel.deleteServicio(id);

    if (!eliminado) {
      return res.status(400).json({
        ok: false,
        message: "No se pudo eliminar el servicio. Puede tener citas asociadas",
      });
    }

    res.json({
      ok: true,
      message: "Servicio eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
export const toggleActivoServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    const servicio = await servicioModel.getServicioById(id);
    if (!servicio) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado",
      });
    }

    // Invertir el estado activo sin tocar los demás campos
    await pool.execute(
      "UPDATE servicios SET activo = NOT activo WHERE id = ?",
      [id],
    );

    const servicioActualizado = await servicioModel.getServicioById(id);

    res.json({
      ok: true,
      message: `Servicio ${servicioActualizado.activo ? "activado" : "desactivado"} exitosamente`,
      servicio: servicioActualizado,
    });
  } catch (error) {
    console.error("Error al cambiar estado del servicio:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};

export const getBarberosPorServicio = async (req, res) => {
  try {
    const { id } = req.params;

    const servicio = await servicioModel.getServicioById(id);
    if (!servicio || !servicio.activo) {
      return res.status(404).json({
        ok: false,
        message: "Servicio no encontrado o inactivo",
      });
    }

    // Todos los barberos activos pueden realizar cualquier servicio
    // Si en el futuro hay especialidades, se filtraría aquí por tabla pivot
    const pool = getPool();
    const [barberos] = await pool.execute(
      `SELECT u.id, u.nombre, u.email, u.telefono,
              COUNT(c.id) as veces_realizado
       FROM usuarios u
       LEFT JOIN citas c ON u.id = c.barbero_id 
         AND c.servicio_id = ? 
         AND c.estado = 'completada'
       WHERE u.rol = 'barbero'
       GROUP BY u.id
       ORDER BY veces_realizado DESC`,
      [id],
    );

    res.json({
      ok: true,
      servicio: { id: servicio.id, nombre: servicio.nombre },
      barberos,
    });
  } catch (error) {
    console.error("Error al obtener barberos por servicio:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno del servidor",
    });
  }
};
