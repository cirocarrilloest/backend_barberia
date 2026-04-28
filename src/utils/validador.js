//src/utils/validador.js
import joi from "joi"; // Importar la biblioteca Joi para validacion de datos
// Función para validar los datos de entrada utilizando un esquema definido con Joi
export const validarRegistro = (data) => {
  const schema = joi.object({
    nombre: joi.string().min(2).max(100).required(), // El campo 'nombre' es obligatorio, debe ser una cadena de texto y tener entre 2 y 100 caracteres
    email: joi.string().email().required(), // El campo 'email' es obligatorio, debe ser una cadena de texto y debe tener formato de correo electrónico
    pass: joi.string().min(6).required(), // El campo 'pass' es obligatorio, debe ser una cadena de texto y debe tener al menos 6 caracteres
  });
  return schema.validate(data, { abortEarly: false }); // Validar los datos utilizando el esquema definido y retornar el resultado
};
// Función para validar los datos de ingreso utilizando un esquema definido con Joi
export const validarIngreso = (data) => {
  const schema = joi.object({
    email: joi.string().email().required(), // El campo 'email' es obligatorio, debe ser una cadena de texto y debe tener formato de correo electrónico
    pass: joi.string().required(), // El campo 'pass' es obligatorio, debe ser una cadena de texto
  });
  return schema.validate(data, { abortEarly: false }); // Validar los datos utilizando el esquema definido y retornar el resultado
};
