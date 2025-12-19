-- ============================================================
-- SCRIPT DE MIGRACION: BITEL -> LATCONECTA
-- Version: 2.0
-- Fecha: 2025-12-16
-- Autor: Equipo Latconecta
-- Descripcion: Migracion de modelo single-tenant a multi-tenant
-- ============================================================

BEGIN TRANSACTION;

-- ============================================================
-- PASO 1: CREAR TABLA LATCONECTA
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== PASO 1: CREANDO TABLA LATCONECTA ===';
END $$;

CREATE TABLE IF NOT EXISTS latconecta (
    latconecta_id INTEGER PRIMARY KEY DEFAULT 1,
    company_name VARCHAR(50) NOT NULL,
    company_logo VARCHAR(500),
    company_photo VARCHAR(500),
    company_photo_mkt1 VARCHAR(500),
    company_photo_mkt2 VARCHAR(500),
    company_photo_mkt3 VARCHAR(500),
    company_photo_mkt4 VARCHAR(500),
    company_description5 VARCHAR(500),
    company_lema_1 VARCHAR(500),
    company_lema_2 VARCHAR(500),
    company_credit_balance NUMERIC(12,2) DEFAULT 0.00,
    company_date_balance DATE,
    company_mail_customer_support VARCHAR(255),
    company_mail_commercial_support VARCHAR(255),
    company_status VARCHAR(20) DEFAULT 'active',
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    last_update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_latconecta_id CHECK (latconecta_id = 1),
    CONSTRAINT chk_latconecta_customer_email 
        CHECK (company_mail_customer_support ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' 
               OR company_mail_customer_support IS NULL),
    CONSTRAINT chk_latconecta_commercial_email 
        CHECK (company_mail_commercial_support ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' 
               OR company_mail_commercial_support IS NULL)
);

COMMENT ON TABLE latconecta IS 'Entidad corporativa unica de Latconecta';
COMMENT ON COLUMN latconecta.latconecta_id IS 'ID unico (siempre 1)';
COMMENT ON COLUMN latconecta.company_credit_balance IS 'Balance corporativo en USD';
COMMENT ON COLUMN latconecta.company_mail_customer_support IS 'Email soporte a clientes';
COMMENT ON COLUMN latconecta.company_mail_commercial_support IS 'Email soporte comercial';

DO $$ 
BEGIN
    RAISE NOTICE '[OK] Tabla latconecta creada exitosamente';
END $$;

-- ============================================================
-- PASO 2: MIGRAR DATOS DE COMPANIES A LATCONECTA
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== PASO 2: MIGRANDO DATOS A LATCONECTA ===';
END $$;

INSERT INTO latconecta (
    latconecta_id,
    company_name,
    company_logo,
    company_photo,
    company_photo_mkt1,
    company_photo_mkt2,
    company_photo_mkt3,
    company_photo_mkt4,
    company_description5,
    company_lema_1,
    company_lema_2,
    company_credit_balance,
    company_date_balance,
    company_mail_customer_support,
    company_mail_commercial_support,
    company_status,
    created_by,
    updated_by,
    last_update_date
)
SELECT 
    1 AS latconecta_id,
    'Latconecta' AS company_name,
    company_logo,
    company_photo,
    company_photo_mkt1,
    company_photo_mkt2,
    company_photo_mkt3,
    company_photo_mkt4,
    company_description5,
    company_lema_1,
    company_lema_2,
    company_credit_balance,
    company_date_balance,
    company_mail_customer_support,
    NULL AS company_mail_commercial_support,
    company_status,
    created_by,
    updated_by,
    last_update_date
FROM companies
WHERE company_id = 1
ON CONFLICT (latconecta_id) DO NOTHING;

DO $$ 
DECLARE
    record_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO record_count FROM latconecta;
    RAISE NOTICE '[OK] Datos migrados a latconecta. Registros: %', record_count;
END $$;

-- ============================================================
-- PASO 3: MODIFICAR TABLA COMPANIES
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== PASO 3: MODIFICANDO TABLA COMPANIES ===';
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'country_id'
    ) THEN
        ALTER TABLE companies ADD COLUMN country_id INTEGER;
        RAISE NOTICE '[OK] Columna country_id agregada';
    ELSE
        RAISE NOTICE '[INFO] Columna country_id ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'service_id'
    ) THEN
        ALTER TABLE companies ADD COLUMN service_id INTEGER;
        RAISE NOTICE '[OK] Columna service_id agregada';
    ELSE
        RAISE NOTICE '[INFO] Columna service_id ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'company_mail_commercial_support'
    ) THEN
        ALTER TABLE companies ADD COLUMN company_mail_commercial_support VARCHAR(255);
        RAISE NOTICE '[OK] Columna company_mail_commercial_support agregada';
    ELSE
        RAISE NOTICE '[INFO] Columna company_mail_commercial_support ya existe';
    END IF;
END $$;

DO $$ 
BEGIN
    RAISE NOTICE 'Asignando valores por defecto a registros existentes...';
END $$;

UPDATE companies 
SET country_id = 1,
    service_id = 5,
    company_mail_commercial_support = NULL
WHERE country_id IS NULL OR service_id IS NULL;

DO $$ 
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '[OK] % registros actualizados con valores por defecto', updated_count;
END $$;

ALTER TABLE companies 
    ALTER COLUMN country_id SET NOT NULL,
    ALTER COLUMN service_id SET NOT NULL;

DO $$ 
BEGIN
    RAISE NOTICE '[OK] Columnas country_id y service_id ahora son NOT NULL';
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_companies_country'
    ) THEN
        ALTER TABLE companies
        ADD CONSTRAINT fk_companies_country 
            FOREIGN KEY (country_id) 
            REFERENCES countries(country_id) 
            ON DELETE RESTRICT;
        RAISE NOTICE '[OK] FK fk_companies_country creada';
    ELSE
        RAISE NOTICE '[INFO] FK fk_companies_country ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_companies_service'
    ) THEN
        ALTER TABLE companies
        ADD CONSTRAINT fk_companies_service 
            FOREIGN KEY (service_id) 
            REFERENCES services(service_id) 
            ON DELETE RESTRICT;
        RAISE NOTICE '[OK] FK fk_companies_service creada';
    ELSE
        RAISE NOTICE '[INFO] FK fk_companies_service ya existe';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_companies_customer_email'
    ) THEN
        ALTER TABLE companies
        ADD CONSTRAINT chk_companies_customer_email 
            CHECK (company_mail_customer_support ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' 
                   OR company_mail_customer_support IS NULL);
        RAISE NOTICE '[OK] Check constraint chk_companies_customer_email creado';
    ELSE
        RAISE NOTICE '[INFO] Check constraint chk_companies_customer_email ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_companies_commercial_email'
    ) THEN
        ALTER TABLE companies
        ADD CONSTRAINT chk_companies_commercial_email 
            CHECK (company_mail_commercial_support ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' 
                   OR company_mail_commercial_support IS NULL);
        RAISE NOTICE '[OK] Check constraint chk_companies_commercial_email creado';
    ELSE
        RAISE NOTICE '[INFO] Check constraint chk_companies_commercial_email ya existe';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_companies_country'
    ) THEN
        CREATE INDEX idx_companies_country ON companies(country_id);
        RAISE NOTICE '[OK] Indice idx_companies_country creado';
    ELSE
        RAISE NOTICE '[INFO] Indice idx_companies_country ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_companies_service'
    ) THEN
        CREATE INDEX idx_companies_service ON companies(service_id);
        RAISE NOTICE '[OK] Indice idx_companies_service creado';
    ELSE
        RAISE NOTICE '[INFO] Indice idx_companies_service ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_companies_country_service'
    ) THEN
        CREATE INDEX idx_companies_country_service ON companies(country_id, service_id);
        RAISE NOTICE '[OK] Indice idx_companies_country_service creado';
    ELSE
        RAISE NOTICE '[INFO] Indice idx_companies_country_service ya existe';
    END IF;
END $$;

COMMENT ON COLUMN companies.country_id IS 'FK a countries - Pais de operacion';
COMMENT ON COLUMN companies.service_id IS 'FK a services - Servicio ofrecido';
COMMENT ON COLUMN companies.company_mail_commercial_support IS 'Email soporte comercial';

DO $$ 
BEGIN
    RAISE NOTICE '[OK] Tabla companies modificada exitosamente';
END $$;

-- ============================================================
-- PASO 4: MODIFICAR TABLA PRODUCTS
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== PASO 4: MODIFICANDO TABLA PRODUCTS ===';
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'country_id'
    ) THEN
        ALTER TABLE products ADD COLUMN country_id INTEGER;
        RAISE NOTICE '[OK] Columna country_id agregada';
    ELSE
        RAISE NOTICE '[INFO] Columna country_id ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'company_id'
    ) THEN
        ALTER TABLE products ADD COLUMN company_id INTEGER;
        RAISE NOTICE '[OK] Columna company_id agregada';
    ELSE
        RAISE NOTICE '[INFO] Columna company_id ya existe';
    END IF;
END $$;

DO $$ 
BEGIN
    RAISE NOTICE 'Asignando valores por defecto a productos existentes...';
END $$;

UPDATE products 
SET country_id = 1,
    company_id = 1
WHERE country_id IS NULL OR company_id IS NULL;

DO $$ 
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE '[OK] % productos actualizados con valores por defecto', updated_count;
END $$;

ALTER TABLE products 
    ALTER COLUMN country_id SET NOT NULL,
    ALTER COLUMN company_id SET NOT NULL;

DO $$ 
BEGIN
    RAISE NOTICE '[OK] Columnas country_id y company_id ahora son NOT NULL';
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_products_country'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT fk_products_country 
            FOREIGN KEY (country_id) 
            REFERENCES countries(country_id) 
            ON DELETE RESTRICT;
        RAISE NOTICE '[OK] FK fk_products_country creada';
    ELSE
        RAISE NOTICE '[INFO] FK fk_products_country ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_products_company'
    ) THEN
        ALTER TABLE products
        ADD CONSTRAINT fk_products_company 
            FOREIGN KEY (company_id) 
            REFERENCES companies(company_id) 
            ON DELETE RESTRICT;
        RAISE NOTICE '[OK] FK fk_products_company creada';
    ELSE
        RAISE NOTICE '[INFO] FK fk_products_company ya existe';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_products_country'
    ) THEN
        CREATE INDEX idx_products_country ON products(country_id);
        RAISE NOTICE '[OK] Indice idx_products_country creado';
    ELSE
        RAISE NOTICE '[INFO] Indice idx_products_country ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_products_company'
    ) THEN
        CREATE INDEX idx_products_company ON products(company_id);
        RAISE NOTICE '[OK] Indice idx_products_company creado';
    ELSE
        RAISE NOTICE '[INFO] Indice idx_products_company ya existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_products_country_company_service'
    ) THEN
        CREATE INDEX idx_products_country_company_service 
            ON products(country_id, company_id, service_id);
        RAISE NOTICE '[OK] Indice idx_products_country_company_service creado';
    ELSE
        RAISE NOTICE '[INFO] Indice idx_products_country_company_service ya existe';
    END IF;
END $$;

COMMENT ON COLUMN products.country_id IS 'FK a countries - Pais del producto';
COMMENT ON COLUMN products.company_id IS 'FK a companies - Compania que ofrece el producto';

DO $$ 
BEGIN
    RAISE NOTICE '[OK] Tabla products modificada exitosamente';
END $$;

-- ============================================================
-- PASO 5: VALIDACIONES DE CONSISTENCIA
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== PASO 5: VALIDANDO CONSISTENCIA DE DATOS ===';
END $$;

DO $$
DECLARE
    inconsistent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistent_count
    FROM products p
    JOIN companies c ON p.company_id = c.company_id
    WHERE p.country_id != c.country_id;
    
    IF inconsistent_count > 0 THEN
        RAISE EXCEPTION 'ERROR: % productos con country_id inconsistente con su compania', inconsistent_count;
    ELSE
        RAISE NOTICE '[OK] Todos los productos tienen country_id consistente';
    END IF;
END $$;

DO $$
DECLARE
    inconsistent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistent_count
    FROM products p
    JOIN companies c ON p.company_id = c.company_id
    WHERE p.service_id != c.service_id;
    
    IF inconsistent_count > 0 THEN
        RAISE EXCEPTION 'ERROR: % productos con service_id inconsistente con su compania', inconsistent_count;
    ELSE
        RAISE NOTICE '[OK] Todos los productos tienen service_id consistente';
    END IF;
END $$;

DO $$
DECLARE
    invalid_companies INTEGER;
    invalid_products_country INTEGER;
    invalid_products_company INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_companies
    FROM companies c
    LEFT JOIN countries co ON c.country_id = co.country_id
    WHERE co.country_id IS NULL;
    
    IF invalid_companies > 0 THEN
        RAISE EXCEPTION 'ERROR: % companias con country_id invalido', invalid_companies;
    END IF;

    SELECT COUNT(*) INTO invalid_products_country
    FROM products p
    LEFT JOIN countries co ON p.country_id = co.country_id
    WHERE co.country_id IS NULL;
    
    IF invalid_products_country > 0 THEN
        RAISE EXCEPTION 'ERROR: % productos con country_id invalido', invalid_products_country;
    END IF;

    SELECT COUNT(*) INTO invalid_products_company
    FROM products p
    LEFT JOIN companies c ON p.company_id = c.company_id
    WHERE c.company_id IS NULL;
    
    IF invalid_products_company > 0 THEN
        RAISE EXCEPTION 'ERROR: % productos con company_id invalido', invalid_products_company;
    END IF;

    RAISE NOTICE '[OK] Todas las foreign keys son validas';
END $$;

-- ============================================================
-- PASO 6: CREAR VISTAS UTILES
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== PASO 6: CREANDO VISTAS UTILES ===';
END $$;

CREATE OR REPLACE VIEW v_products_full AS
SELECT 
    p.product_id,
    p.product_code,
    p.product_name,
    p.product_description,
    p.product_total_price,
    p.product_currency,
    p.product_status,
    p.product_photo,
    c.company_id,
    c.company_name,
    c.company_logo,
    co.country_id,
    co.country_code,
    co.country_name,
    s.service_id,
    s.service_name,
    s.service_photo,
    p.product_vendor_code,
    p.product_vendpro_code,
    p.product_vendpro_skuid,
    p.created_by,
    p.updated_by,
    p.last_update_date
FROM products p
JOIN companies c ON p.company_id = c.company_id
JOIN countries co ON p.country_id = co.country_id
JOIN services s ON p.service_id = s.service_id;

COMMENT ON VIEW v_products_full IS 'Vista completa de productos con todas sus relaciones';

DO $$ 
BEGIN
    RAISE NOTICE '[OK] Vista v_products_full creada';
END $$;

CREATE OR REPLACE VIEW v_companies_full AS
SELECT 
    c.company_id,
    c.company_name,
    c.company_logo,
    c.company_status,
    c.company_credit_balance,
    c.company_barcode_available,
    c.company_mail_customer_support,
    c.company_mail_commercial_support,
    co.country_id,
    co.country_code,
    co.country_name,
    s.service_id,
    s.service_name,
    c.created_by,
    c.updated_by,
    c.last_update_date
FROM companies c
JOIN countries co ON c.country_id = co.country_id
JOIN services s ON c.service_id = s.service_id;

COMMENT ON VIEW v_companies_full IS 'Vista completa de companias con todas sus relaciones';

DO $$ 
BEGIN
    RAISE NOTICE '[OK] Vista v_companies_full creada';
END $$;

CREATE OR REPLACE VIEW v_latconecta_info AS
SELECT 
    latconecta_id,
    company_name,
    company_logo,
    company_credit_balance,
    company_date_balance,
    company_mail_customer_support,
    company_mail_commercial_support,
    company_status,
    last_update_date
FROM latconecta
WHERE latconecta_id = 1;

COMMENT ON VIEW v_latconecta_info IS 'Vista de informacion corporativa de Latconecta';

DO $$ 
BEGIN
    RAISE NOTICE '[OK] Vista v_latconecta_info creada';
END $$;

-- ============================================================
-- PASO 7: ESTADISTICAS FINALES
-- ============================================================

DO $$ 
BEGIN
    RAISE NOTICE '=== PASO 7: ESTADISTICAS DE MIGRACION ===';
END $$;

DO $$
DECLARE
    latconecta_count INTEGER;
    companies_count INTEGER;
    products_count INTEGER;
    countries_count INTEGER;
    services_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO latconecta_count FROM latconecta;
    SELECT COUNT(*) INTO companies_count FROM companies;
    SELECT COUNT(*) INTO products_count FROM products;
    SELECT COUNT(*) INTO countries_count FROM countries;
    SELECT COUNT(*) INTO services_count FROM services;
    
    RAISE NOTICE '';
    RAISE NOTICE '+---------------------------------------+';
    RAISE NOTICE '|  ESTADISTICAS DE MIGRACION            |';
    RAISE NOTICE '+---------------------------------------+';
    RAISE NOTICE '| Latconecta:      % registro(s)        |', latconecta_count;
    RAISE NOTICE '| Companias:       % registro(s)        |', companies_count;
    RAISE NOTICE '| Productos:       % registro(s)        |', products_count;
    RAISE NOTICE '| Paises:          % registro(s)        |', countries_count;
    RAISE NOTICE '| Servicios:       % registro(s)        |', services_count;
    RAISE NOTICE '+---------------------------------------+';
    RAISE NOTICE '';
END $$;

COMMIT;

DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '  MIGRACION COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Cambios realizados:';
    RAISE NOTICE '  [OK] Tabla latconecta creada';
    RAISE NOTICE '  [OK] Datos migrados a latconecta';
    RAISE NOTICE '  [OK] Tabla companies modificada';
    RAISE NOTICE '  [OK] Tabla products modificada';
    RAISE NOTICE '  [OK] 4 Foreign Keys creadas';
    RAISE NOTICE '  [OK] 6 Indices creados';
    RAISE NOTICE '  [OK] 4 Check Constraints creados';
    RAISE NOTICE '  [OK] 3 Vistas creadas';
    RAISE NOTICE '  [OK] Validaciones de consistencia pasadas';
    RAISE NOTICE '';
    RAISE NOTICE 'Proximos pasos:';
    RAISE NOTICE '  1. Verificar: SELECT * FROM v_companies_full;';
    RAISE NOTICE '  2. Verificar: SELECT * FROM v_products_full;';
    RAISE NOTICE '  3. Actualizar backend (models, schemas, routers)';
    RAISE NOTICE '  4. Actualizar frontends (components, services)';
    RAISE NOTICE '';
END $$;

-- ============================================================
-- FIN DEL SCRIPT DE MIGRACION
-- ============================================================
