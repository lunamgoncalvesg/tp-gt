-- Esquema nuevo para la demo. No ejecutar los scripts históricos que empiezan con DROP DATABASE.
CREATE TABLE IF NOT EXISTS clientes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dni VARCHAR(10) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  fecha_nacimiento DATE NOT NULL,
  password_hash VARCHAR(160) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS secciones (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(250) NOT NULL DEFAULT '',
  habilitada BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS tipos_tramite (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  seccion_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(140) NOT NULL UNIQUE,
  descripcion VARCHAR(250) NOT NULL DEFAULT '',
  habilitado BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_tipo_seccion FOREIGN KEY (seccion_id) REFERENCES secciones(id)
);

CREATE TABLE IF NOT EXISTS oficinas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  seccion_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  direccion VARCHAR(200) NOT NULL,
  habilitada BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_oficina_seccion FOREIGN KEY (seccion_id) REFERENCES secciones(id),
  UNIQUE KEY uq_oficina_nombre_direccion (nombre, direccion)
);

CREATE TABLE IF NOT EXISTS requisitos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tipo_id INT UNSIGNED NOT NULL,
  etiqueta VARCHAR(100) NOT NULL,
  obligatorio BOOLEAN NOT NULL DEFAULT TRUE,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_requisito_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_tramite(id),
  UNIQUE KEY uq_requisito_tipo_etiqueta (tipo_id, etiqueta)
);

CREATE TABLE IF NOT EXISTS tramites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cliente_id BIGINT UNSIGNED NOT NULL,
  tipo_id INT UNSIGNED NOT NULL,
  oficina_id INT UNSIGNED NOT NULL,
  turno_at DATETIME NOT NULL,
  estado ENUM('Pendiente', 'En revisión', 'Finalizado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
  slot_activo DATETIME GENERATED ALWAYS AS (CASE WHEN estado = 'Cancelado' THEN NULL ELSE turno_at END) STORED,
  tipo_activo INT GENERATED ALWAYS AS (CASE WHEN estado IN ('Pendiente', 'En revisión') THEN tipo_id ELSE NULL END) STORED,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tramite_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  CONSTRAINT fk_tramite_tipo FOREIGN KEY (tipo_id) REFERENCES tipos_tramite(id),
  CONSTRAINT fk_tramite_oficina FOREIGN KEY (oficina_id) REFERENCES oficinas(id),
  UNIQUE KEY uq_slot_oficina (oficina_id, slot_activo),
  UNIQUE KEY uq_tramite_activo_cliente_tipo (cliente_id, tipo_activo),
  INDEX ix_tramite_cliente_fecha (cliente_id, turno_at)
);

CREATE TABLE IF NOT EXISTS respuestas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  tramite_id BIGINT UNSIGNED NOT NULL,
  requisito_id INT UNSIGNED NOT NULL,
  respuesta VARCHAR(250) NOT NULL,
  CONSTRAINT fk_respuesta_tramite FOREIGN KEY (tramite_id) REFERENCES tramites(id) ON DELETE CASCADE,
  CONSTRAINT fk_respuesta_requisito FOREIGN KEY (requisito_id) REFERENCES requisitos(id),
  UNIQUE KEY uq_respuesta_tramite_requisito (tramite_id, requisito_id)
);

INSERT IGNORE INTO secciones (id, nombre, descripcion) VALUES
 (1, 'Registro Civil', 'Gestiones de documentación e identidad'),
 (2, 'Registro del Automotor', 'Gestiones de vehículos');

INSERT IGNORE INTO tipos_tramite (id, seccion_id, nombre, descripcion) VALUES
 (1, 1, 'Partida de nacimiento', 'Solicitud de partida para una persona'),
 (2, 1, 'Cambio de domicilio', 'Actualización de domicilio registrado'),
 (3, 2, 'Transferencia de vehículo', 'Inicio de una transferencia de titularidad');

INSERT IGNORE INTO oficinas (id, seccion_id, nombre, direccion) VALUES
 (1, 1, 'Oficina Centro', 'Av. Rivadavia 1000, Ciudad Autónoma de Buenos Aires'),
 (2, 1, 'Oficina Norte', 'Av. Cabildo 2000, Ciudad Autónoma de Buenos Aires'),
 (3, 2, 'Oficina Automotor', 'Av. Belgrano 500, Ciudad Autónoma de Buenos Aires');

INSERT IGNORE INTO requisitos (tipo_id, etiqueta, orden) VALUES
 (1, 'Nombre completo', 1), (1, 'DNI de la persona', 2), (1, 'Fecha de nacimiento', 3),
 (2, 'Nombre completo', 1), (2, 'DNI', 2), (2, 'Nuevo domicilio', 3),
 (3, 'DNI de quien transfiere', 1), (3, 'DNI de quien recibe', 2), (3, 'Patente', 3);
