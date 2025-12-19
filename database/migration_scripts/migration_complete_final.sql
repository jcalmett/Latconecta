-- ============================================================
-- SCRIPT COMPLETO: MIGRACION BITEL -> LATCONECTA
-- Version: 2.1 FINAL
-- Fecha: 2025-12-16
-- Descripcion: Migracion completa + creacion de companias multi-servicio
-- ============================================================

BEGIN;

DO $$ BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '  INICIANDO MIGRACION COMPLETA';
    RAISE NOTICE '=======================================================';
END $$;

-- ============================================================
-- PASO 1: CREAR TABLA LATCONECTA
-- ============================================================

DO $$ BEGIN
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
    CONSTRAINT chk_latconecta_id CHECK (latconecta_id = 1)
);

INSERT INTO latconecta (
    latconecta_id, company_name, company_logo, company_photo,
    company_credit_balance, company_mail_customer_support,
    company_status, created_by, last_update_date
)
SELECT 
    1, 'Latconecta', company_logo, company_photo,
    company_credit_balance, company_mail_customer_support,
    company_status, created_by, last_update_date
FROM companies WHERE company_id = 1
ON CONFLICT (latconecta_id) DO NOTHING;

DO $$ BEGIN
    RAISE NOTICE '[OK] Tabla latconecta creada y datos migrados';
END $$;

-- ============================================================
-- PASO 2: MODIFICAR TABLA COMPANIES
-- ============================================================

DO $$ BEGIN
    RAISE NOTICE '=== PASO 2: MODIFICANDO TABLA COMPANIES ===';
END $$;

ALTER TABLE companies ADD COLUMN IF NOT EXISTS country_id INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS service_id INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_mail_commercial_support VARCHAR(255);

UPDATE companies 
SET country_id = 1, service_id = 5, company_mail_commercial_support = NULL
WHERE country_id IS NULL OR service_id IS NULL;

ALTER TABLE companies ALTER COLUMN country_id SET NOT NULL;
ALTER TABLE companies ALTER COLUMN service_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_companies_country') THEN
        ALTER TABLE companies ADD CONSTRAINT fk_companies_country 
            FOREIGN KEY (country_id) REFERENCES countries(country_id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_companies_service') THEN
        ALTER TABLE companies ADD CONSTRAINT fk_companies_service 
            FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country_id);
CREATE INDEX IF NOT EXISTS idx_companies_service ON companies(service_id);

DO $$ BEGIN
    RAISE NOTICE '[OK] Tabla companies modificada';
END $$;

-- ============================================================
-- PASO 3: CREAR COMPANIAS FALTANTES
-- ============================================================

DO $$ BEGIN
    RAISE NOTICE '=== PASO 3: CREANDO COMPANIAS MULTI-SERVICIO ===';
END $$;

INSERT INTO companies (
    country_id, service_id, company_name, company_logo, company_photo,
    company_credit_balance, company_barcode_available,
    company_mail_customer_support, company_status, created_by, last_update_date
)
SELECT 
    1, s.service_id,
    'Bitel - ' || s.service_name,
    c.company_logo, c.company_photo,
    0.00, 'No',
    c.company_mail_customer_support,
    'active', 'migration_script', CURRENT_TIMESTAMP
FROM services s
CROSS JOIN (SELECT * FROM companies WHERE company_id = 1) c
WHERE s.service_id IN (2, 3, 4, 6)
AND NOT EXISTS (
    SELECT 1 FROM companies comp 
    WHERE comp.service_id = s.service_id AND comp.country_id = 1
);

UPDATE companies SET company_name = 'Bitel - TopUps' WHERE company_id = 1;

DO $$ BEGIN
    RAISE NOTICE '[OK] Companias creadas: %', (SELECT COUNT(*) FROM companies);
END $$;

-- ============================================================
-- PASO 4: MODIFICAR TABLA PRODUCTS
-- ============================================================

DO $$ BEGIN
    RAISE NOTICE '=== PASO 4: MODIFICANDO TABLA PRODUCTS ===';
END $$;

ALTER TABLE products ADD COLUMN IF NOT EXISTS country_id INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS company_id INTEGER;

UPDATE products SET country_id = 1, company_id = 1 WHERE country_id IS NULL;

ALTER TABLE products ALTER COLUMN country_id SET NOT NULL;
ALTER TABLE products ALTER COLUMN company_id SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_country') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_country 
            FOREIGN KEY (country_id) REFERENCES countries(country_id) ON DELETE RESTRICT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_products_company') THEN
        ALTER TABLE products ADD CONSTRAINT fk_products_company 
            FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE RESTRICT;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_country ON products(country_id);
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);

DO $$ BEGIN
    RAISE NOTICE '[OK] Tabla products modificada';
END $$;

-- ============================================================
-- PASO 5: REASIGNAR PRODUCTOS A COMPANIAS CORRECTAS
-- ============================================================

DO $$ BEGIN
    RAISE NOTICE '=== PASO 5: REASIGNANDO PRODUCTOS ===';
END $$;

UPDATE products p
SET company_id = c.company_id
FROM companies c
WHERE p.service_id = c.service_id
  AND p.country_id = c.country_id;

DO $$ BEGIN
    RAISE NOTICE '[OK] Productos reasignados';
END $$;

-- ============================================================
-- PASO 6: VALIDACIONES FINALES
-- ============================================================

DO $$ BEGIN
    RAISE NOTICE '=== PASO 6: VALIDANDO CONSISTENCIA ===';
END $$;

DO $$
DECLARE
    inconsistent INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistent
    FROM products p JOIN companies c ON p.company_id = c.company_id
    WHERE p.country_id != c.country_id OR p.service_id != c.service_id;
    
    IF inconsistent > 0 THEN
        RAISE EXCEPTION 'ERROR: % productos inconsistentes', inconsistent;
    END IF;
    
    RAISE NOTICE '[OK] Validaciones pasadas: 0 inconsistencias';
END $$;

-- ============================================================
-- PASO 7: CREAR VISTAS
-- ============================================================

DO $$ BEGIN
    RAISE NOTICE '=== PASO 7: CREANDO VISTAS ===';
END $$;

CREATE OR REPLACE VIEW v_products_full AS
SELECT 
    p.product_id, p.product_code, p.product_name, p.product_total_price,
    p.product_currency, p.product_status,
    c.company_id, c.company_name,
    co.country_id, co.country_code, co.country_name,
    s.service_id, s.service_name
FROM products p
JOIN companies c ON p.company_id = c.company_id
JOIN countries co ON p.country_id = co.country_id
JOIN services s ON p.service_id = s.service_id;

CREATE OR REPLACE VIEW v_companies_full AS
SELECT 
    c.company_id, c.company_name, c.company_status, c.company_credit_balance,
    co.country_id, co.country_name,
    s.service_id, s.service_name
FROM companies c
JOIN countries co ON c.country_id = co.country_id
JOIN services s ON c.service_id = s.service_id;

CREATE OR REPLACE VIEW v_latconecta_info AS
SELECT latconecta_id, company_name, company_logo, company_credit_balance,
       company_mail_customer_support, company_mail_commercial_support,
       company_status, last_update_date
FROM latconecta WHERE latconecta_id = 1;

DO $$ BEGIN
    RAISE NOTICE '[OK] Vistas creadas';
END $$;

-- ============================================================
-- RESUMEN FINAL
-- ============================================================

DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '  MIGRACION COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'RESUMEN:';
    RAISE NOTICE '  - Tabla latconecta: % registros', (SELECT COUNT(*) FROM latconecta);
    RAISE NOTICE '  - Companias: % registros', (SELECT COUNT(*) FROM companies);
    RAISE NOTICE '  - Productos: % registros', (SELECT COUNT(*) FROM products);
    RAISE NOTICE '';
    RAISE NOTICE 'COMPANIAS CREADAS:';
    FOR rec IN SELECT company_id, company_name, service_id FROM companies ORDER BY company_id LOOP
        RAISE NOTICE '  [%] % (service_id: %)', rec.company_id, rec.company_name, rec.service_id;
    END LOOP;
    RAISE NOTICE '';
    RAISE NOTICE 'DISTRIBUCION DE PRODUCTOS:';
    FOR rec IN 
        SELECT c.company_name, COUNT(p.product_id) as total
        FROM companies c
        LEFT JOIN products p ON c.company_id = p.company_id
        GROUP BY c.company_name ORDER BY c.company_name
    LOOP
        RAISE NOTICE '  %: % productos', rec.company_name, rec.total;
    END LOOP;
    RAISE NOTICE '';
    RAISE NOTICE 'Siguiente paso: Actualizar backend y frontend';
    RAISE NOTICE '';
END $$;

COMMIT;
