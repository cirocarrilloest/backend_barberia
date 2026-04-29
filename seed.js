// BACKEND/seed.js
import { connectDB, getPool } from "./src/config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const crearUsuariosIniciales = async () => {
  try {
    await connectDB();
    const pool = getPool();

    // Limpiar usuarios existentes con esos emails
    await pool.execute("DELETE FROM usuarios WHERE email IN (?, ?, ?)", [
      "admin@barberia.com",
      "juan@barberia.com",
      "cliente@test.com",
    ]);

    // Hash de contraseñas
    const salt = await bcrypt.genSalt(10);

    const adminPass = await bcrypt.hash("admin123", salt);
    const barberoPass = await bcrypt.hash("barbero123", salt);
    const clientePass = await bcrypt.hash("123456", salt);

    // Crear ADMIN
    await pool.execute(
      "INSERT INTO usuarios (nombre, email, pass, rol, telefono) VALUES (?, ?, ?, ?, ?)",
      ["Administrador", "admin@barberia.com", adminPass, "admin", "3000000000"],
    );
    console.log("✅ Admin creado: admin@barberia.com / admin123");

    // Crear BARBERO
    await pool.execute(
      "INSERT INTO usuarios (nombre, email, pass, rol, telefono) VALUES (?, ?, ?, ?, ?)",
      ["Juan Pérez", "juan@barberia.com", barberoPass, "barbero", "3001112222"],
    );
    console.log("✅ Barbero creado: juan@barberia.com / barbero123");

    // Crear CLIENTE
    await pool.execute(
      "INSERT INTO usuarios (nombre, email, pass, rol, telefono) VALUES (?, ?, ?, ?, ?)",
      [
        "Cliente Test",
        "cliente@test.com",
        clientePass,
        "cliente",
        "3003334444",
      ],
    );
    console.log("✅ Cliente creado: cliente@test.com / 123456");

    console.log("\n🎉 Todos los usuarios creados exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

crearUsuariosIniciales();
