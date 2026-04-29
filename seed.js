// BACKEND/seed.js
import { connectDB, getPool } from "./src/config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Datos de ejemplo
const serviciosData = [
  {
    nombre: "Corte de cabello",
    descripcion: "Corte tradicional o moderno",
    duracion: 30,
    precio: 15000,
    activo: true,
  },
  {
    nombre: "Barba",
    descripcion: "Arreglo y perfilado de barba",
    duracion: 20,
    precio: 10000,
    activo: true,
  },
  {
    nombre: "Corte + Barba",
    descripcion: "Combo completo de corte y barba",
    duracion: 50,
    precio: 22000,
    activo: true,
  },
  {
    nombre: "Tinte",
    descripcion: "Aplicación de tinte para cabello",
    duracion: 60,
    precio: 35000,
    activo: true,
  },
  {
    nombre: "Lavado de cabello",
    descripcion: "Lavado con productos especiales",
    duracion: 15,
    precio: 8000,
    activo: true,
  },
  {
    nombre: "Corte infantil",
    descripcion: "Corte para niños menores de 12 años",
    duracion: 25,
    precio: 12000,
    activo: true,
  },
  {
    nombre: "Peinado",
    descripcion: "Peinado para ocasiones especiales",
    duracion: 30,
    precio: 18000,
    activo: true,
  },
  {
    nombre: "Tratamiento capilar",
    descripcion: "Tratamiento de hidratación profunda",
    duracion: 45,
    precio: 25000,
    activo: true,
  },
];

const usuariosData = [
  {
    nombre: "Administrador",
    email: "admin@barberia.com",
    rol: "admin",
    telefono: "3000000000",
  },
  {
    nombre: "Juan Pérez",
    email: "juan@barberia.com",
    rol: "barbero",
    telefono: "3001112222",
  },
  {
    nombre: "Carlos López",
    email: "carlos@barberia.com",
    rol: "barbero",
    telefono: "3003334444",
  },
  {
    nombre: "Miguel Ángel",
    email: "miguel@barberia.com",
    rol: "barbero",
    telefono: "3005556666",
  },
  {
    nombre: "Cliente Test",
    email: "cliente@test.com",
    rol: "cliente",
    telefono: "3007778888",
  },
  {
    nombre: "Ana García",
    email: "ana@test.com",
    rol: "cliente",
    telefono: "3009990000",
  },
  {
    nombre: "Pedro Rodríguez",
    email: "pedro@test.com",
    rol: "cliente",
    telefono: "3011112222",
  },
  {
    nombre: "Laura Martínez",
    email: "laura@test.com",
    rol: "cliente",
    telefono: "3013334444",
  },
  {
    nombre: "Diego Sánchez",
    email: "diego@test.com",
    rol: "cliente",
    telefono: "3015556666",
  },
];

// Función para generar fechas aleatorias en un rango
function getRandomDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return randomDate.toISOString().split("T")[0];
}

// Función para generar hora aleatoria (entre 9:00 y 19:00)
function getRandomHour() {
  const hours = [9, 10, 11, 14, 15, 16, 17, 18]; // Horas laborales (con hora de almuerzo)
  const randomHour = hours[Math.floor(Math.random() * hours.length)];
  const minutes = [0, 15, 30, 45];
  const randomMinute = minutes[Math.floor(Math.random() * minutes.length)];
  return `${randomHour.toString().padStart(2, "0")}:${randomMinute.toString().padStart(2, "0")}:00`;
}

const citasData = [];

// Generar 50 citas aleatorias
const barberosIds = []; // Se llenará después de insertar usuarios
const clientesIds = [];
const serviciosIds = [];

const estados = ["pendiente", "confirmada", "completada", "cancelada"];
const fechaInicio = "2024-01-01";
const fechaFin = "2026-12-31";

const crearCitasAleatorias = async () => {
  for (let i = 0; i < 80; i++) {
    const clienteId =
      clientesIds[Math.floor(Math.random() * clientesIds.length)];
    const barberoId =
      barberosIds[Math.floor(Math.random() * barberosIds.length)];
    const servicioId =
      serviciosIds[Math.floor(Math.random() * serviciosIds.length)];
    const fecha = getRandomDate(fechaInicio, fechaFin);
    const hora = getRandomHour();

    // Dar más peso a estados completados y confirmados
    let estado;
    const random = Math.random();
    if (random < 0.5) estado = "completada";
    else if (random < 0.7) estado = "confirmada";
    else if (random < 0.85) estado = "pendiente";
    else estado = "cancelada";

    // Notas opcionales
    const notas = Math.random() > 0.7 ? "Cliente solicita recordatorio" : null;

    citasData.push({
      cliente_id: clienteId,
      barbero_id: barberoId,
      servicio_id: servicioId,
      fecha: fecha,
      hora: hora,
      estado: estado,
      notas: notas,
    });
  }
};

const crearSemilla = async () => {
  try {
    await connectDB();
    const pool = getPool();

    console.log("🗑️  Limpiando datos existentes...");

    // Desactivar verificaciones de claves foráneas temporalmente
    await pool.execute("SET FOREIGN_KEY_CHECKS = 0");

    // Limpiar tablas en orden correcto
    await pool.execute("DELETE FROM citas");
    await pool.execute("DELETE FROM servicios");
    await pool.execute("DELETE FROM usuarios");

    // Reactivar verificaciones
    await pool.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Datos anteriores eliminados");

    // Hash de contraseñas (todas usarán 'password123' como ejemplo)
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash("password123", salt);

    // Contraseñas específicas para los usuarios importantes
    const adminPass = await bcrypt.hash("admin123", salt);
    const barberoPass = await bcrypt.hash("barbero123", salt);
    const clientePass = await bcrypt.hash("123456", salt);

    // Insertar usuarios
    console.log("👤 Creando usuarios...");

    for (const usuario of usuariosData) {
      let password = hashPassword;
      if (usuario.email === "admin@barberia.com") password = adminPass;
      if (
        usuario.email === "juan@barberia.com" ||
        usuario.email === "carlos@barberia.com" ||
        usuario.email === "miguel@barberia.com"
      )
        password = barberoPass;
      if (usuario.email === "cliente@test.com") password = clientePass;

      const [result] = await pool.execute(
        "INSERT INTO usuarios (nombre, email, pass, rol, telefono) VALUES (?, ?, ?, ?, ?)",
        [
          usuario.nombre,
          usuario.email,
          password,
          usuario.rol,
          usuario.telefono,
        ],
      );

      // Guardar IDs para referencias futuras
      if (usuario.rol === "barbero") {
        barberosIds.push(result.insertId);
      } else if (usuario.rol === "cliente") {
        clientesIds.push(result.insertId);
      }

      console.log(
        `   ✅ ${usuario.nombre} (${usuario.rol}) - ${usuario.email} / ${usuario.rol === "admin" ? "admin123" : usuario.rol === "barbero" ? "barbero123" : usuario.rol === "cliente" && usuario.email === "cliente@test.com" ? "123456" : "password123"}`,
      );
    }

    // Insertar servicios
    console.log("💇 Creando servicios...");

    for (const servicio of serviciosData) {
      const [result] = await pool.execute(
        "INSERT INTO servicios (nombre, descripcion, duracion, precio, activo) VALUES (?, ?, ?, ?, ?)",
        [
          servicio.nombre,
          servicio.descripcion,
          servicio.duracion,
          servicio.precio,
          servicio.activo,
        ],
      );
      serviciosIds.push(result.insertId);
      console.log(
        `   ✅ ${servicio.nombre} - $${servicio.precio} - ${servicio.duracion}min`,
      );
    }

    // Generar citas aleatorias
    console.log("📅 Generando citas aleatorias...");
    await crearCitasAleatorias();

    // Insertar citas
    let citasInsertadas = 0;
    for (const cita of citasData) {
      await pool.execute(
        `INSERT INTO citas (cliente_id, barbero_id, servicio_id, fecha, hora, estado, notas) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          cita.cliente_id,
          cita.barbero_id,
          cita.servicio_id,
          cita.fecha,
          cita.hora,
          cita.estado,
          cita.notas,
        ],
      );
      citasInsertadas++;
    }

    console.log(`   ✅ ${citasInsertadas} citas creadas exitosamente`);

    // Mostrar resumen estadístico
    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMEN DE LA BASE DE DATOS");
    console.log("=".repeat(50));

    const [stats] = await pool.execute(`
            SELECT 
                (SELECT COUNT(*) FROM usuarios WHERE rol = 'admin') as admins,
                (SELECT COUNT(*) FROM usuarios WHERE rol = 'barbero') as barberos,
                (SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente') as clientes,
                (SELECT COUNT(*) FROM servicios WHERE activo = 1) as servicios_activos,
                (SELECT COUNT(*) FROM citas) as total_citas,
                (SELECT COUNT(*) FROM citas WHERE estado = 'completada') as citas_completadas,
                (SELECT COUNT(*) FROM citas WHERE estado = 'cancelada') as citas_canceladas,
                (SELECT COUNT(*) FROM citas WHERE estado = 'pendiente') as citas_pendientes,
                (SELECT COUNT(*) FROM citas WHERE estado = 'confirmada') as citas_confirmadas
        `);

    console.log(`👥 Usuarios:`);
    console.log(`   - Admins: ${stats[0].admins}`);
    console.log(`   - Barberos: ${stats[0].barberos}`);
    console.log(`   - Clientes: ${stats[0].clientes}`);
    console.log(`\n💇 Servicios activos: ${stats[0].servicios_activos}`);
    console.log(`\n📅 Citas:`);
    console.log(`   - Total: ${stats[0].total_citas}`);
    console.log(`   - Completadas: ${stats[0].citas_completadas}`);
    console.log(`   - Confirmadas: ${stats[0].citas_confirmadas}`);
    console.log(`   - Pendientes: ${stats[0].citas_pendientes}`);
    console.log(`   - Canceladas: ${stats[0].citas_canceladas}`);

    // Consultas de ejemplo
    console.log("\n" + "=".repeat(50));
    console.log("🔍 CONSULTAS DE EJEMPLO");
    console.log("=".repeat(50));

    const [serviciosTop] = await pool.execute(`
            SELECT s.nombre, COUNT(c.id) as total_citas
            FROM servicios s
            JOIN citas c ON s.id = c.servicio_id
            WHERE c.estado IN ('completada', 'confirmada')
            GROUP BY s.id
            ORDER BY total_citas DESC
            LIMIT 3
        `);

    console.log("📊 Servicios más populares:");
    serviciosTop.forEach((s) => {
      console.log(`   - ${s.nombre}: ${s.total_citas} citas`);
    });

    console.log("\n🎉 ¡Semilla creada exitosamente!");
    console.log("\n🔐 CREDENCIALES DE ACCESO:");
    console.log("   Admin:    admin@barberia.com / admin123");
    console.log("   Barbero:  juan@barberia.com / barbero123");
    console.log("   Barbero:  carlos@barberia.com / barbero123");
    console.log("   Barbero:  miguel@barberia.com / barbero123");
    console.log("   Cliente:  cliente@test.com / 123456");
    console.log("   Cliente:  ana@test.com / password123");
    console.log("   Cliente:  pedro@test.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear la semilla:", error);
    process.exit(1);
  }
};

crearSemilla();
