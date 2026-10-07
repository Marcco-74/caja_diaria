-- 1. TABLA DE CATEGORÍAS
CREATE TABLE categoria_movimiento (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('INGRESO', 'EGRESO')),
    activo BOOLEAN DEFAULT TRUE
);

-- 2. TABLA DE MOVIMIENTOS (Ajustada con Fecha Operativa y Hora de Registro)
CREATE TABLE movimiento_caja (
    id_movimiento SERIAL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('INGRESO', 'EGRESO')),
    monto NUMERIC(10, 2) NOT NULL,
    descripcion VARCHAR(150),
    id_categoria INT REFERENCES categoria_movimiento(id_categoria) ON DELETE SET NULL,
    
    -- Campo para el día comercial (se muestra en grande en la UI)
    fecha_operacion DATE NOT NULL DEFAULT CURRENT_DATE, 
    
    -- Momento exacto en que se guardó en la BD
    fecha_hora_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP 
);

-- 3. TABLA DE CIERRES DIARIOS
CREATE TABLE cierre_diario (
    id_cierre SERIAL PRIMARY KEY,
    fecha DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    total_ingresos NUMERIC(10, 2) DEFAULT 0.00,
    total_egresos NUMERIC(10, 2) DEFAULT 0.00,
    saldo_final NUMERIC(10, 2) DEFAULT 0.00,
    cerrado_el TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICE OPTIMIZADO PARA BUSCAR POR FECHA COMERCIAL
CREATE INDEX idx_movimiento_fecha_operacion ON movimiento_caja (fecha_operacion);

-- DATOS INICIALES
INSERT INTO categoria_movimiento (nombre, tipo) VALUES 
('Venta del Día', 'INGRESO'),
('Cobro de Cuentas', 'INGRESO'),
('Mercadería / Proveedor', 'EGRESO'),
('Bolsas / Empaque', 'EGRESO'),
('Pasajes / Transporte', 'EGRESO'),
('Comida / Almuerzo', 'EGRESO'),
('Otros Gastos', 'EGRESO');