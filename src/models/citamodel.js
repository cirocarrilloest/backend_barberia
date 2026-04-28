//src/models/citamodel.js
import { getPool } from "../config/db.js";

// Crear nueva cita
export const createCita = async (citaData) => {
  const pool = getPool();
  const { cliente_id, barbero_id, servicio_id, fecha, hora, notas } = citaData;

  const query = `
        INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora, notas)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

  const [result] = await pool.execute(query, [
    cliente_id,
    barbero_id,
    servicio_id,
    fecha,
    hora,
    notas || null,
  ]);

  return getCitaById(result.insertId);
};

// Verificar si existe duplicación (mismo barbero, fecha y hora)
export const verificarDuplicado = async (barbero_id, fecha, hora) => {
  const pool = getPool();
  const query = `
        SELECT id FROM citas 
        WHERE barbero_id = ? AND fecha = ? AND hora = ? 
        AND estado NOT IN ('cancelada')
    `;
  const [rows] = await pool.execute(query, [barbero_id, fecha, hora]);
  return rows.length > 0;
};

// Obtener cita por ID con detalles
export const getCitaById = async (id) => {
  const pool = getPool();
  const query = `
        SELECT c.*, 
               u.nombre as cliente_nombre, u.email as cliente_email,
               b.nombre as barbero_nombre,
               s.nombre as servicio_nombre, s.duracion, s.precio
        FROM citas c
        JOIN usuarios u ON c.cliente_id = u.id
        JOIN usuarios b ON c.barbero_id = b.id
        JOIN servicios s ON c.servicio_id = s.id
        WHERE c.id = ?
    `;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

// Obtener citas por cliente
export const getCitasByCliente = async (cliente_id) => {
  const pool = getPool();
  const query = `
        SELECT c.*, 
               b.nombre as barbero_nombre,
               s.nombre as servicio_nombre, s.duracion, s.precio
        FROM citas c
        JOIN usuarios b ON c.barbero_id = b.id
        JOIN servicios s ON c.servicio_id = s.id
        WHERE c.cliente_id = ?
        ORDER BY c.fecha DESC, c.hora DESC
    `;
  const [rows] = await pool.execute(query, [cliente_id]);
  return rows;
};

// Obtener citas por barbero
export const getCitasByBarbero = async (barbero_id, fecha = null) => {
  const pool = getPool();
  let query = `
        SELECT c.*, 
               u.nombre as cliente_nombre, u.email as cliente_email,
               s.nombre as servicio_nombre, s.duracion, s.precio
        FROM citas c
        JOIN usuarios u ON c.cliente_id = u.id
        JOIN servicios s ON c.servicio_id = s.id
        WHERE c.barbero_id = ?
    `;
  const params = [barbero_id];

  if (fecha) {
    query += ` AND c.fecha = ?`;
    params.push(fecha);
  }

  query += ` ORDER BY c.fecha ASC, c.hora ASC`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Obtener todas las citas (admin)
export const getAllCitas = async (filtros = {}) => {
  const pool = getPool();
  let query = `
        SELECT c.*, 
               u.nombre as cliente_nombre, u.email as cliente_email,
               b.nombre as barbero_nombre,
               s.nombre as servicio_nombre, s.duracion, s.precio
        FROM citas c
        JOIN usuarios u ON c.cliente_id = u.id
        JOIN usuarios b ON c.barbero_id = b.id
        JOIN servicios s ON c.servicio_id = s.id
        WHERE 1=1
    `;
  const params = [];

  if (filtros.estado) {
    query += ` AND c.estado = ?`;
    params.push(filtros.estado);
  }

  if (filtros.fecha_desde) {
    query += ` AND c.fecha >= ?`;
    params.push(filtros.fecha_desde);
  }

  if (filtros.fecha_hasta) {
    query += ` AND c.fecha <= ?`;
    params.push(filtros.fecha_hasta);
  }

  query += ` ORDER BY c.fecha DESC, c.hora DESC`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Actualizar estado de cita
export const updateCitaEstado = async (id, estado) => {
  const pool = getPool();
  const query = `UPDATE citas SET estado = ? WHERE id = ?`;
  const [result] = await pool.execute(query, [estado, id]);

  if (result.affectedRows > 0) {
    return getCitaById(id);
  }
  return null;
};

// Cancelar cita
export const cancelarCita = async (id) => {
  return updateCitaEstado(id, "cancelada");
};

// Verificar disponibilidad de horario
export const verificarDisponibilidad = async (barbero_id, fecha, hora) => {
  const pool = getPool();
  const query = `
        SELECT COUNT(*) as count FROM citas 
        WHERE barbero_id = ? AND fecha = ? AND hora = ? 
        AND estado IN ('pendiente', 'confirmada')
    `;
  const [rows] = await pool.execute(query, [barbero_id, fecha, hora]);
  return rows[0].count === 0;
};

// Obtener horarios ocupados de un barbero en una fecha específica
export const getHorariosOcupados = async (barbero_id, fecha) => {
  const pool = getPool();
  const query = `
        SELECT hora FROM citas 
        WHERE barbero_id = ? AND fecha = ? 
        AND estado IN ('pendiente', 'confirmada')
        ORDER BY hora
    `;
  const [rows] = await pool.execute(query, [barbero_id, fecha]);
  return rows.map((row) => row.hora);
};

// Actualizar cita completa
export const updateCita = async (id, citaData) => {
  const pool = getPool();
  const { barbero_id, servicio_id, fecha, hora, notas } = citaData;

  const query = `
        UPDATE citas 
        SET barbero_id = ?, servicio_id = ?, fecha = ?, hora = ?, notas = ?
        WHERE id = ?
    `;

  const [result] = await pool.execute(query, [
    barbero_id,
    servicio_id,
    fecha,
    hora,
    notas || null,
    id,
  ]);

  if (result.affectedRows > 0) {
    return getCitaById(id);
  }
  return null;
};
