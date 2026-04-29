//src/models/userModel.js
import { getPool } from "../config/db.js"; //Importa la función para obtener el pool de conexiones a la base de datos
import bcrypt from "bcryptjs"; //Importa bcrypt para el hashing de contraseñas

//Función para crear un nuevo usuario en la base de datos
export const createUser = async (userData) => {
  const pool = getPool(); //Obtiene el pool de conexiones
  const { nombre, email, pass, rol = "cliente", telefono = null } = userData; //Desestructura los datos del usuario

  const salt = await bcrypt.genSalt(
    parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  ); //Genera un salt para el hashing de la contraseña
  const hashedPassword = await bcrypt.hash(pass, salt); //Hashea la contraseña utilizando bcrypt

  const query = `INSERT INTO usuarios (nombre, email, pass, rol, telefono) VALUES (?, ?, ?, ?, ?)`; //Consulta SQL para insertar un nuevo usuario
  const [result] = await pool.execute(query, [
    nombre,
    email.toLowerCase(),
    hashedPassword,
    rol,
    telefono,
  ]); //Ejecuta la consulta con los datos del usuario
  return getUserById(result.insertId); //Devuelve el usuario recién creado obteniéndolo por su ID
};

//Función para obtener un usuario por su email
export const findUserByEmail = async (email) => {
  const pool = getPool(); //Obtiene el pool de conexiones
  const query = `SELECT id, nombre, email, rol, pass FROM usuarios WHERE email = ?`; //Consulta SQL para obtener un usuario por su email
  const [rows] = await pool.execute(query, [email.toLowerCase()]); //Ejecuta la consulta con el email proporcionado
  return rows[0] || null; //Devuelve el primer usuario encontrado (o null si no se encuentra)
};

//función para obtener un usuario por su ID
export const getUserById = async (id) => {
  const pool = getPool(); //Obtiene el pool de conexiones
  const query = `SELECT id, nombre, email, rol, telefono FROM usuarios WHERE id = ?`; //Consulta SQL para obtener un usuario por su ID
  const [rows] = await pool.execute(query, [id]); //Ejecuta la consulta con el ID proporcionado
  return rows[0] || null; //Devuelve el primer usuario encontrado (o null si no se encuentra)
};

// verificar contraseña
export const verifypass = async (plainpass, hashedpass) => {
  return await bcrypt.compare(plainpass, hashedpass); //Compara la contraseña proporcionada con la contraseña hasheada utilizando bcrypt
};
//Exporta las funciones para crear un usuario, obtener un usuario por email, obtener un usuario por ID y verificar la contraseña
export default {
  createUser, //Función para crear un nuevo usuario en la base de datos
  findUserByEmail, //Función para obtener un usuario por su email
  getUserById, //Función para obtener un usuario por su ID
  verifypass, //Función para verificar la contraseña
};
