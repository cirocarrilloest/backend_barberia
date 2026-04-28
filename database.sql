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

-- Insertar datos iniciales
-- Insertar servicios por defecto
INSERT INTO servicios (nombre, descripcion, duracion, precio) VALUES
('Corte de cabello', 'Corte tradicional o moderno', 30, 15000),
('Barba', 'Arreglo y perfilado de barba', 20, 10000),
('Corte + Barba', 'Combo completo de corte y barba', 50, 22000),
('Tinte', 'Aplicación de tinte para cabello', 60, 35000),
('Lavado de cabello', 'Lavado con productos especiales', 15, 8000);

-- Insertar admin por defecto (password: admin123)
INSERT INTO usuarios (nombre, email, pass, rol) VALUES 
('Administrador', 'admin@barberia.com', '$2a$10$rVgYqG4Yq8Yq8Yq8Yq8YuO8Yq8Yq8Yq8Yq8Yq8Yq8Yq8Yq8Yq8', 'admin');

-- Insertar barbero por defecto (password: barbero123)
INSERT INTO usuarios (nombre, email, pass, rol) VALUES 
('Juan Pérez', 'juan@barberia.com', '$2a$10$rVgYqG4Yq8Yq8Yq8Yq8YuO8Yq8Yq8Yq8Yq8Yq8Yq8Yq8Yq8Yq8', 'barbero');

-- NOTA: Las contraseñas hash son ejemplos. Para producción, genera hashes reales con bcrypt
-- admin123 = $2a$10$YourHashHere
-- barbero123 = $2a$10$YourHashHere