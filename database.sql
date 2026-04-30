-- database.sql
-- Crear base de datos (si no existe)
CREATE DATABASE IF NOT EXISTS barberia_db;
USE barberia_db;

-- Tabla de usuarios (modificada para incluir roles específicos)
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'barbero', 'cliente') DEFAULT 'cliente',
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email(email),
    INDEX idx_rol(rol)
);

-- Tabla de servicios
DROP TABLE IF EXISTS servicios;
CREATE TABLE servicios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion INT NOT NULL COMMENT 'Duración en minutos',
    precio DECIMAL(10, 2) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_activo(activo)
);

-- Tabla de citas
DROP TABLE IF EXISTS citas;
CREATE TABLE citas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    barbero_id INT NOT NULL,
    servicio_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (barbero_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_reserva (barbero_id, fecha, hora),
    INDEX idx_cliente(cliente_id),
    INDEX idx_barbero(barbero_id),
    INDEX idx_fecha_hora(fecha, hora),
    INDEX idx_estado(estado)
);

CREATE TABLE IF NOT EXISTS horarios_barbero (
  id INT PRIMARY KEY AUTO_INCREMENT,
  barbero_id INT NOT NULL,
  dia_semana ENUM('lunes','martes','miercoles','jueves','viernes','sabado','domingo') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (barbero_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_horario (barbero_id, dia_semana)
);

-- ver datos de las tablas
select * from usuarios;
select * from servicios;
select * from citas;
select * from horarios_barbero;
-- ver horarios
SELECT * FROM horarios_barbero WHERE barbero_id = 13;
-- NOTA: Las contraseñas hash son ejemplos. Para producción, genera hashes reales con bcrypt
-- admin123 = 
-- barbero123 = 
-- 123456 = usertest