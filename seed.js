// backend/seed.js
import { connectDB, getPool } from "./src/config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// Datos de servicios
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

// Datos de usuarios
const usuariosData = [
  {
    nombre: "Administrador",
    email: "admin@barberia.com",
    rol: "admin",
    telefono: "3000000000",
    passEspecial: "admin123",
  },
  {
    nombre: "Juan Pérez",
    email: "juan@barberia.com",
    rol: "barbero",
    telefono: "3001112222",
    passEspecial: "barbero123",
  },
  {
    nombre: "Carlos López",
    email: "carlos@barberia.com",
    rol: "barbero",
    telefono: "3003334444",
    passEspecial: "barbero123",
  },
  {
    nombre: "Miguel Ángel",
    email: "miguel@barberia.com",
    rol: "barbero",
    telefono: "3005556666",
    passEspecial: "barbero123",
  },
  {
    nombre: "Ana García",
    email: "ana@test.com",
    rol: "cliente",
    telefono: "3009990000",
    passEspecial: "password123",
  },
  {
    nombre: "Pedro Rodríguez",
    email: "pedro@test.com",
    rol: "cliente",
    telefono: "3011112222",
    passEspecial: "password123",
  },
  {
    nombre: "Laura Martínez",
    email: "laura@test.com",
    rol: "cliente",
    telefono: "3013334444",
    passEspecial: "password123",
  },
  {
    nombre: "Diego Sánchez",
    email: "diego@test.com",
    rol: "cliente",
    telefono: "3015556666",
    passEspecial: "password123",
  },
  {
    nombre: "Cliente VIP",
    email: "cliente@test.com",
    rol: "cliente",
    telefono: "3007778888",
    passEspecial: "123456",
  },
];

// Horarios de barberos (días laborales)
const horariosBarberosData = [
  // Juan Pérez (id asumido 2)
  { dia_semana: "lunes", hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: "martes", hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: "miercoles", hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: "jueves", hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: "viernes", hora_inicio: "09:00", hora_fin: "18:00" },
  { dia_semana: "sabado", hora_inicio: "09:00", hora_fin: "14:00" },

  // Carlos López (id asumido 3)
  { dia_semana: "lunes", hora_inicio: "10:00", hora_fin: "19:00" },
  { dia_semana: "martes", hora_inicio: "10:00", hora_fin: "19:00" },
  { dia_semana: "miercoles", hora_inicio: "10:00", hora_fin: "19:00" },
  { dia_semana: "jueves", hora_inicio: "10:00", hora_fin: "19:00" },
  { dia_semana: "viernes", hora_inicio: "10:00", hora_fin: "19:00" },
  { dia_semana: "sabado", hora_inicio: "10:00", hora_fin: "15:00" },

  // Miguel Ángel (id asumido 4)
  { dia_semana: "lunes", hora_inicio: "08:00", hora_fin: "17:00" },
  { dia_semana: "martes", hora_inicio: "08:00", hora_fin: "17:00" },
  { dia_semana: "miercoles", hora_inicio: "08:00", hora_fin: "17:00" },
  { dia_semana: "jueves", hora_inicio: "08:00", hora_fin: "17:00" },
  { dia_semana: "viernes", hora_inicio: "08:00", hora_fin: "17:00" },
  { dia_semana: "sabado", hora_inicio: "08:00", hora_fin: "13:00" },
];

// Función para generar fechas aleatorias
function getRandomDate(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const randomDate = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return randomDate.toISOString().split("T")[0];
}

// Función para generar hora aleatoria dentro del horario laboral
function getRandomHoraLaboral(horarioInicio, horarioFin) {
  const [horaInicio, minInicio] = horarioInicio.split(":").map(Number);
  const [horaFin, minFin] = horarioFin.split(":").map(Number);

  const minutosInicio = horaInicio * 60 + minInicio;
  const minutosFin = horaFin * 60 + minFin;

  // Generar hora en intervalos de 30 minutos
  const minutosDisponibles = [];
  for (let mins = minutosInicio; mins < minutosFin; mins += 30) {
    minutosDisponibles.push(mins);
  }

  if (minutosDisponibles.length === 0) return "09:00";

  const minutosAleatorios =
    minutosDisponibles[Math.floor(Math.random() * minutosDisponibles.length)];
  const hora = Math.floor(minutosAleatorios / 60);
  const minutos = minutosAleatorios % 60;
  return `${hora.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:00`;
}

// Obtener horario laboral de un barbero para una fecha específica
function getHorarioLaboral(barberoId, fecha, horariosMap) {
  const diasSemana = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];
  const fechaObj = new Date(fecha);
  const diaSemana = diasSemana[fechaObj.getDay()];

  const horarios = horariosMap.get(barberoId) || [];
  return horarios.find((h) => h.dia_semana === diaSemana);
}

// Generar citas aleatorias respetando horarios laborales
async function generarCitasAleatorias(
  pool,
  barberosIds,
  clientesIds,
  serviciosIds,
  horariosMap,
) {
  const citasData = [];
  const fechaInicio = "2025-05-01";
  const fechaFin = "2025-05-31";
  const estados = ["pendiente", "confirmada", "completada", "cancelada"];

  for (let i = 0; i < 60; i++) {
    const clienteId =
      clientesIds[Math.floor(Math.random() * clientesIds.length)];
    const barberoId =
      barberosIds[Math.floor(Math.random() * barberosIds.length)];
    const servicioId =
      serviciosIds[Math.floor(Math.random() * serviciosIds.length)];
    const fecha = getRandomDate(fechaInicio, fechaFin);

    // Verificar horario laboral
    const horario = getHorarioLaboral(barberoId, fecha, horariosMap);
    if (!horario) continue; // No trabaja ese día

    const hora = getRandomHoraLaboral(horario.hora_inicio, horario.hora_fin);

    // Verificar que no haya duplicado (mismo barbero, fecha, hora)
    const [existe] = await pool.execute(
      "SELECT id FROM citas WHERE barbero_id = ? AND fecha = ? AND hora = ?",
      [barberoId, fecha, hora],
    );

    if (existe.length > 0) continue;

    const random = Math.random();
    let estado;
    if (random < 0.5) estado = "completada";
    else if (random < 0.7) estado = "confirmada";
    else if (random < 0.85) estado = "pendiente";
    else estado = "cancelada";

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

  return citasData;
}

// Función principal
const crearSemilla = async () => {
  try {
    await connectDB();
    const pool = getPool();

    console.log("🗑️  Limpiando datos existentes...");
    await pool.execute("SET FOREIGN_KEY_CHECKS = 0");
    await pool.execute("DELETE FROM citas");
    await pool.execute("DELETE FROM horarios_barbero");
    await pool.execute("DELETE FROM servicios");
    await pool.execute("DELETE FROM usuarios");
    await pool.execute("SET FOREIGN_KEY_CHECKS = 1");

    console.log("✅ Datos anteriores eliminados");

    const salt = await bcrypt.genSalt(10);
    const defaultPass = await bcrypt.hash("password123", salt);

    // Insertar usuarios
    console.log("👤 Creando usuarios...");
    const barberosIds = [];
    const clientesIds = [];
    const usuariosMap = new Map();

    for (const usuario of usuariosData) {
      let password;
      if (usuario.email === "admin@barberia.com") {
        password = await bcrypt.hash("admin123", salt);
      } else if (usuario.rol === "barbero") {
        password = await bcrypt.hash("barbero123", salt);
      } else if (usuario.email === "cliente@test.com") {
        password = await bcrypt.hash("123456", salt);
      } else {
        password = defaultPass;
      }

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

      usuariosMap.set(usuario.email, result.insertId);

      if (usuario.rol === "barbero") barberosIds.push(result.insertId);
      if (usuario.rol === "cliente") clientesIds.push(result.insertId);

      console.log(
        `   ✅ ${usuario.nombre} (${usuario.rol}) - ${usuario.email}`,
      );
    }

    // Insertar horarios de barberos
    console.log("⏰ Configurando horarios de barberos...");
    const horariosMap = new Map();

    // Mapear emails a IDs
    const emailToId = {
      "juan@barberia.com": barberosIds[0],
      "carlos@barberia.com": barberosIds[1],
      "miguel@barberia.com": barberosIds[2],
    };

    for (const horario of horariosBarberosData) {
      let barberoId;
      if (horariosBarberosData.indexOf(horario) < 6)
        barberoId = emailToId["juan@barberia.com"];
      else if (horariosBarberosData.indexOf(horario) < 12)
        barberoId = emailToId["carlos@barberia.com"];
      else barberoId = emailToId["miguel@barberia.com"];

      await pool.execute(
        `INSERT INTO horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin, activo) 
         VALUES (?, ?, ?, ?, TRUE)`,
        [barberoId, horario.dia_semana, horario.hora_inicio, horario.hora_fin],
      );

      if (!horariosMap.has(barberoId)) horariosMap.set(barberoId, []);
      horariosMap.get(barberoId).push(horario);
    }
    console.log(
      `   ✅ Horarios configurados para ${barberosIds.length} barberos`,
    );

    // Insertar servicios
    console.log("💇 Creando servicios...");
    const serviciosIds = [];
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
    console.log("📅 Generando citas aleatorias respetando horarios...");
    const citasData = await generarCitasAleatorias(
      pool,
      barberosIds,
      clientesIds,
      serviciosIds,
      horariosMap,
    );

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

    // Mostrar resumen
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
        (SELECT COUNT(*) FROM horarios_barbero WHERE activo = 1) as horarios_configurados
    `);

    console.log(`👥 Usuarios:`);
    console.log(`   - Admins: ${stats[0].admins}`);
    console.log(`   - Barberos: ${stats[0].barberos}`);
    console.log(`   - Clientes: ${stats[0].clientes}`);
    console.log(`\n💇 Servicios activos: ${stats[0].servicios_activos}`);
    console.log(`📅 Citas generadas: ${stats[0].total_citas}`);
    console.log(`⏰ Horarios configurados: ${stats[0].horarios_configurados}`);

    console.log("\n" + "=".repeat(50));
    console.log("🔐 CREDENCIALES DE ACCESO");
    console.log("=".repeat(50));
    console.log("   Admin:    admin@barberia.com / admin123");
    console.log("   Barbero:  juan@barberia.com / barbero123");
    console.log("   Barbero:  carlos@barberia.com / barbero123");
    console.log("   Barbero:  miguel@barberia.com / barbero123");
    console.log("   Cliente:  cliente@test.com / 123456");
    console.log("   Cliente:  ana@test.com / password123");
    console.log("   Cliente:  pedro@test.com / password123");

    console.log("\n🎉 ¡Semilla creada exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al crear la semilla:", error);
    process.exit(1);
  }
};

crearSemilla();
