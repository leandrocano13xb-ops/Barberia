-- Crear base de datos
CREATE DATABASE barberia_db;
USE barberia_db;

-- Tabla CLIENTES
CREATE TABLE clientes (
  id_cliente INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100)
);

-- Tabla BARBEROS
CREATE TABLE barberos (
  id_barbero INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  especialidad VARCHAR(100),
  telefono VARCHAR(20)
);

-- Tabla SERVICIOS
CREATE TABLE servicios (
  id_servicio INT AUTO_INCREMENT PRIMARY KEY,
  nombre_servicio VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL
);

-- Tabla CITAS
CREATE TABLE citas (
  id_cita INT AUTO_INCREMENT PRIMARY KEY,
  id_cliente INT,
  id_barbero INT,
  id_servicio INT,
  fecha_cita DATE,
  hora_cita TIME,
  estado ENUM('pendiente','completada','cancelada') DEFAULT 'pendiente',
  FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
  FOREIGN KEY (id_barbero) REFERENCES barberos(id_barbero),
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);

-- Tabla VENTAS
CREATE TABLE ventas (
  id_venta INT AUTO_INCREMENT PRIMARY KEY,
  id_cita INT,
  metodo_pago ENUM('efectivo','tarjeta','transferencia'),
  total DECIMAL(10,2),
  fecha_pago DATE,
  FOREIGN KEY (id_cita) REFERENCES citas(id_cita)
);

-- CLIENTES
INSERT INTO clientes (nombre, telefono, email)
VALUES
('Carlos Pérez', '3001234567', 'carlos@gmail.com'),
('Juan Gómez', '3109876543', 'juan@gmail.com');

-- BARBEROS
INSERT INTO barberos (nombre, especialidad, telefono)
VALUES
('Andrés Rojas', 'Cortes clásicos', '3114567890'),
('Miguel Torres', 'Barbas y degradados', '3129876543');

-- SERVICIOS
INSERT INTO servicios (nombre_servicio, precio)
VALUES
('Corte de cabello', 25000.00),
('Afeitado de barba', 15000.00),
('Corte + Barba', 40000.00);

INSERT INTO citas (id_cliente, id_barbero, id_servicio, fecha_cita, hora_cita, estado)
VALUES 
(1, 1, 1, '2025-10-10', '09:00:00', 'pendiente'),
(2, 2, 2, '2025-10-10', '10:30:00', 'pendiente'),
(1, 1, 3, '2025-10-11', '14:00:00', 'completada');
-- Cuando las citas Existan 

INSERT INTO ventas (id_cita, metodo_pago, total, fecha_pago)
VALUES
(1, 'efectivo', 25000.00, '2025-10-10'),
(2, 'tarjeta', 15000.00, '2025-10-10'),
(3, 'transferencia', 40000.00, '2025-10-11');
INSERT INTO citas (id_cliente, id_barbero, id_servicio, fecha_cita, hora_cita, estado)
VALUES 
(1, 1, 1, '2025-10-10', '09:00:00', 'pendiente'),
(2, 2, 2, '2025-10-10', '10:30:00', 'pendiente'),
(1, 1, 3, '2025-10-11', '14:00:00', 'completada');
-- Cuando las citas Existan 

INSERT INTO ventas (id_cita, metodo_pago, total, fecha_pago)
VALUES
(1, 'efectivo', 25000.00, '2025-10-10'),
(2, 'tarjeta', 15000.00, '2025-10-10'),
(3, 'transferencia', 40000.00, '2025-10-11');



-- Consulta sencilla 
SELECT 
  c.nombre AS cliente,
  ci.fecha_cita,
  ci.hora_cita,
  ci.estado
FROM citas ci
JOIN clientes c ON ci.id_cliente = c.id_cliente;

select * from clientes
select * from  ventas
select * from servicios
select * from barberos