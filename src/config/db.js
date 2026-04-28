//src/config/db.js
import mysql from "mysql2/promise";
import chalk from "chalk";
let pool = null;

// Crear conexión a la base de datos
export const connectDB = async () => {
  // Función para conectar a la base de datos MySQL utilizando mysql2/promise
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Probar conexión
    const connection = await pool.getConnection();
    console.log("MySQL conectado correctamente");
    connection.release();
    return pool;
  } catch (error) {
    console.error(chalk.red("Error conectando a MySQL:", error));
    process.exit(1);
  }
};
// Obtener pool en otras partes
export const getPool = () => {
  // Función para obtener el pool de conexiones a la base de datos
  if (!pool) {
    throw new Error(
      "base de datos no conectada. asegúrate de llamar a connectDB() primero.",
    );
  }
  return pool;
};
