// src/middlewares/validationMiddleware.js
import joi from "joi";

// Validación para crear/actualizar cita
export const validarCita = (req, res, next) => {
  const schema = joi.object({
    barbero_id: joi.number().integer().positive().required(),
    servicio_id: joi.number().integer().positive().required(),
    fecha: joi.date().iso().required(),
    hora: joi
      .string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    notas: joi.string().max(500).optional().allow(""),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      ok: false,
      message: error.details[0].message,
    });
  }

  next();
};

// Validación para crear/actualizar servicio
export const validarServicio = (req, res, next) => {
  const schema = joi.object({
    nombre: joi.string().min(3).max(100).required(),
    descripcion: joi.string().max(500).optional().allow(""),
    duracion: joi.number().integer().min(5).max(240).required(),
    precio: joi.number().positive().required(),
    activo: joi.boolean().optional(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      ok: false,
      message: error.details[0].message,
    });
  }

  next();
};

// Validación para ID en parámetros
export const validarId = (req, res, next) => {
  const schema = joi.object({
    id: joi.number().integer().positive().required(),
  });

  const { error } = schema.validate(req.params);

  if (error) {
    return res.status(400).json({
      ok: false,
      message: "ID inválido",
    });
  }

  next();
};
