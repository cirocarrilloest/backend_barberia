//src/app.js
import express from "express"; //Importa Express para crear el servidor
import cors from "cors"; //Importa CORS para manejar las políticas de seguridad de las solicitudes HTTP
import morgan from "morgan"; //Importa Morgan para registrar las solicitudes HTTP en la consola
import chalk from "chalk"; //Importa Chalk para colorear los mensajes en la consola
import clear from "clear"; //Importa Clear para limpiar la consola al iniciar la aplicación
import dotenv from "dotenv"; //Importa Dotenv para cargar las variables de entorno desde un archivo .env
//Importa la función para conectar a la base de datos y las rutas de autenticación
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"; //Importa el modelo de usuario para manejar las operaciones relacionadas con los usuarios
import citaRoutes from "./routes/citaRoutes.js";
import servicioRoutes from "./routes/servicioRoutes.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config(); //Carga las variables de entorno desde el archivo .env

const app = express(); //Crea una instancia de Express para configurar el servidor

// Limpiar consola al iniciar
clear();

// 🚀 Función principal
const startApp = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    // Si la conexión es exitosa, se muestra un mensaje en la consola
    console.log(chalk.green("Base de datos conectada"));

    // Middlewares
    app.use(cors()); //Habilita CORS para permitir solicitudes desde diferentes orígenes
    app.use(express.json()); //Habilita el análisis de JSON en las solicitudes entrantes
    app.use(express.urlencoded({ extended: true })); //Habilita el análisis de datos codificados en URL en las solicitudes entrantes

    // Logs HTTP (peticiones)
    app.use(morgan("dev"));

    // Rutas
    app.use("/api/auth", authRoutes);
    app.use("/api/citas", citaRoutes);
    app.use("/api/servicios", servicioRoutes);
    app.use("/api/usuarios", userRoutes);
    // Ruta no encontrada
    app.use((req, res) => {
      res.status(404).json({
        //Maneja las rutas no encontradas y devuelve un error 404
        ok: false,
        message: "ruta no encontrada",
      });
    });

    // Middleware global de errores
    app.use((err, req, res, next) => {
      //Maneja los errores que ocurren en cualquier parte de la aplicación
      console.error(chalk.red("Error:"), err.message); //Registra el error en la consola con un mensaje en rojo

      // Error general → 500
      res.status(500).json({
        ok: false,
        message: "error interno del servidor",
      });
    });

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      //Inicia el servidor en el puerto especificado y muestra un mensaje en la consola con la URL y el entorno de ejecución
      console.log(
        chalk.blue(`
    Servidor iniciado correctamente
    Puerto: ${PORT}
    URL: http://localhost:${PORT}
    Entorno: ${process.env.NODE_ENV || "development"}
      `),
      );
    });
  } catch (error) {
    //Si ocurre un error durante la conexión a la base de datos o la configuración del servidor, se muestra un mensaje de error en la consola y se detiene la aplicación
    console.error(chalk.red("Error al iniciar la app:"), error.message);
    process.exit(1);
  }
};

// Ejecutar app
startApp();
