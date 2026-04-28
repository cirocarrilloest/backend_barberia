//src/models/servicioModel.js
import { getPool } from "../config/db.js";

// Crear servicio
export const createServicio = async (servicioData) => {
  const pool = getPool();
  const { nombre, descripcion, duracion, precio, activo = true } = servicioData;

  const query = `
        INSERT INTO servicios (nombre, descripcion, duracion, precio, activo)
        VALUES (?, ?, ?, ?, ?)
    `;

  const [result] = await pool.execute(query, [
    nombre,
    descripcion || null,
    duracion,
    precio,
    activo,
  ]);

  return getServicioById(result.insertId);
};

// Obtener todos los servicios
export const getAllServicios = async (soloActivos = false) => {
  const pool = getPool();
  let query = `SELECT * FROM servicios`;
  const params = [];

  if (soloActivos) {
    query += ` WHERE activo = TRUE`;
  }

  query += ` ORDER BY nombre`;

  const [rows] = await pool.execute(query, params);
  return rows;
};

// Obtener servicio por ID
export const getServicioById = async (id) => {
  const pool = getPool();
  const query = `SELECT * FROM servicios WHERE id = ?`;
  const [rows] = await pool.execute(query, [id]);
  return rows[0] || null;
};

// Actualizar servicio
export const updateServicio = async (id, servicioData) => {
  const pool = getPool();
  const { nombre, descripcion, duracion, precio, activo } = servicioData;

  const query = `
        UPDATE servicios 
        SET nombre = ?, descripcion = ?, duracion = ?, precio = ?, activo = ?
        WHERE id = ?
    `;

  const [result] = await pool.execute(query, [
    nombre,
    descripcion || null,
    duracion,
    precio,
    activo,
    id,
  ]);

  if (result.affectedRows > 0) {
    return getServicioById(id);
  }
  return null;
};

// Eliminar servicio
export const deleteServicio = async (id) => {
  const pool = getPool();
  const query = `DELETE FROM servicios WHERE id = ?`;
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0;
};
