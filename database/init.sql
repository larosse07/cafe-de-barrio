-- ==============================================================================
-- CAFÉ DE BARRIO - Script de Inicialización de Base de Datos (MySQL 8 / MariaDB)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS cafe_de_barrio
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cafe_de_barrio;

-- ------------------------------------------------------------------------------
-- 1. Tabla: categorias
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(300) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_categorias_nombre UNIQUE (nombre),
    INDEX idx_categorias_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Tabla: productos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(140) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    imagen_url VARCHAR(500) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    categoria_id BIGINT NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    CONSTRAINT chk_productos_precio CHECK (precio >= 0),
    CONSTRAINT chk_productos_stock CHECK (stock >= 0),
    INDEX idx_productos_categoria (categoria_id),
    INDEX idx_productos_activo_stock (activo, stock),
    INDEX idx_productos_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Tabla: pedidos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(32) NOT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    celular VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    referencia VARCHAR(255) NULL,
    observaciones VARCHAR(500) NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(25) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    stock_devuelto BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_pedidos_codigo UNIQUE (codigo),
    CONSTRAINT chk_pedidos_total CHECK (total >= 0),
    INDEX idx_pedidos_estado (estado),
    INDEX idx_pedidos_fecha (fecha),
    INDEX idx_pedidos_cliente (cliente_nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Tabla: detalle_pedidos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_detalle_subtotal CHECK (subtotal >= 0),
    INDEX idx_detalle_pedido (pedido_id),
    INDEX idx_detalle_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Tabla: historial_estado_pedido
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS historial_estado_pedido (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    estado_anterior VARCHAR(25) NULL,
    estado_nuevo VARCHAR(25) NOT NULL,
    fecha_cambio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_historial_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_historial_pedido (pedido_id),
    INDEX idx_historial_fecha (fecha_cambio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. Tabla: usuarios
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(30) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    INDEX idx_usuarios_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Tabla: refresh_tokens
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    usuario_id BIGINT NOT NULL,
    fecha_expiracion DATETIME NOT NULL,
    revocado BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT uk_refresh_token UNIQUE (token),
    CONSTRAINT fk_refresh_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_refresh_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- DATOS INICIALES (Idempotentes)
-- Precios expresados exclusivamente en Soles Peruanos (PEN)
-- ==============================================================================

INSERT IGNORE INTO categorias (id, nombre, descripcion, activo) VALUES
(1, 'Café de Especialidad', 'Granos seleccionados de origen peruano, tostados artesanalmente en lotes pequeños para preservar notas aromáticas.', TRUE),
(2, 'Bebidas de Barra', 'Preparaciones clásicas y de autor elaboradas al momento con espresso recién extraído y leche texturizada.', TRUE),
(3, 'Pastelería Artesanal', 'Horneado diario con mantequilla de granja, cacao fino de aroma y masa madre.', TRUE),
(4, 'Métodos y Accesorios', 'Herramientas seleccionadas para extraer el mejor perfil de taza desde la comodidad de tu casa.', TRUE);

INSERT IGNORE INTO productos (id, nombre, descripcion, precio, stock, imagen_url, activo, categoria_id) VALUES
(1, 'Cajamarca Origen 250g',
 'Grano arábica 100% lavado de altura (1,850 msnm) cultivado en San Ignacio. Notas a panela, mandarina dulce y chocolate con leche. Tueste medio ideal para filtro y prensa francesa.',
 38.00, 28, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=85', TRUE, 1),

(2, 'Chanchamayo Blend de la Casa 250g',
 'Nuestro tueste insignia de la selva central. Cuerpo cremoso, acidez equilibrada y perfil achocolatado con caramelo tostado. Perfecto para espresso, moka italiana y bebidas con leche.',
 34.50, 35, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85', TRUE, 1),

(3, 'Cusco Valle Sagrado Honey 250g',
 'Micro-lote proceso Honey de Quillabamba. Aroma floral a jazmín, dulzor prolongado a miel de abeja y frutas de hueso. Edición limitada de cosecha reciente.',
 44.00, 14, 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=85', TRUE, 1),

(4, 'Amazonas Descafeinado Natural 250g',
 'Descafeinado mediante proceso natural con agua de montaña, sin solventes químicos. Mantiene notas suaves a avellana y cacao dulce para disfrutar a cualquier hora.',
 39.00, 18, 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=900&q=85', TRUE, 1),

(5, 'Espresso Doble de Origen',
 'Extracción precisa de 18g de nuestro blend de la casa. Crema color avellana, textura aterciopelada e intensidad balanceada para paladares exigentes.',
 11.00, 50, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=900&q=85', TRUE, 2),

(6, 'Flat White Artesanal',
 'Doble ristretto coronado con microespuma sedosa de leche fresca vaporizada a 60 °C. Equilibrio perfecto entre la dulzura natural de la leche y el carácter del café.',
 14.50, 45, 'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=900&q=85', TRUE, 2),

(7, 'Cold Brew de 18 Horas 300ml',
 'Infusión en frío de grano cajamarquino durante 18 horas. Baja acidez, refrescante y con intensas notas a cacao amargo y nuez tostada. Botella de vidrio lista para llevar.',
 16.00, 22, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=900&q=85', TRUE, 2),

(8, 'Latte de Vainilla de Papantla',
 'Espresso doble infusionado con sirope artesanal de vaina de vainilla natural y leche vaporizada. Suave, reconfortante y sin saborizantes artificiales.',
 16.50, 32, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=85', TRUE, 2),

(9, 'Croissant de Mantequilla Francesa',
 'Hojaldre fermentado 48 horas con mantequilla pura. Corteza crujiente dorada y miga alveolar ligera que se deshace en boca.',
 12.00, 20, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85', TRUE, 3),

(10, 'Rol de Canela y Cardamomo',
 'Masa brioche suave enrollada con azúcar rubia, canela Ceilán y un toque sutil de cardamomo recién molido, glaseado con queso crema ligero.',
 13.50, 16, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=900&q=85', TRUE, 3),

(11, 'Brownie de Cacao Piurano 70%',
 'Elaborado con chocolate orgánico de Piura al 70%, nueces pecaneras tostadas y una pizca de sal de Maras. Interior húmedo y corteza delicadamente craquelada.',
 14.00, 19, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=900&q=85', TRUE, 3),

(12, 'Cheesecake Vasco Horneado',
 'Tarta de queso estilo San Sebastián con superficie caramelizada y centro cremoso. Maridaje ideal para cafés filtrados de notas frutales.',
 18.50, 12, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85', TRUE, 3),

(13, 'Dripper V60 Cerámica Blanca',
 'Cono de extracción manual en cerámica térmica tamaño 02. Sus estrías en espiral garantizan un flujo constante y tazas limpias llenas de matices.',
 89.00, 8, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=85', TRUE, 4),

(14, 'Prensa Francesa Borosilicato 600ml',
 'Cafetera de inmersión con vidrio resistente al calor y doble filtro de acero inoxidable. Extrae aceites naturales para un café con cuerpo completo.',
 75.00, 6, 'https://images.unsplash.com/photo-1521302080334-4bebac2763a6?auto=format&fit=crop&w=900&q=85', TRUE, 4);
