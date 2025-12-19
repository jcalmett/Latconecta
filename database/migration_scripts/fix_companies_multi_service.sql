-- ============================================================
-- SCRIPT DE CORRECCION: CREAR COMPANIAS FALTANTES
-- Fecha: 2025-12-16
-- Descripcion: Crea una compania por cada servicio y reasigna productos
-- ============================================================

BEGIN;

-- Ver estado actual
DO $$
DECLARE
    company_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO company_count FROM companies;
    RAISE NOTICE 'Companias actuales: %', company_count;
END $$;

-- Crear companias faltantes (una por cada servicio)
INSERT INTO companies (
    country_id,
    service_id,
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
    company_barcode_available,
    company_mail_customer_support,
    company_mail_commercial_support,
    company_status,
    created_by,
    last_update_date
)
SELECT 
    1 as country_id,
    s.service_id,
    'Bitel - ' || s.service_name as company_name,
    c.company_logo,
    c.company_photo,
    c.company_photo_mkt1,
    c.company_photo_mkt2,
    c.company_photo_mkt3,
    c.company_photo_mkt4,
    c.company_description5,
    c.company_lema_1,
    c.company_lema_2,
    0.00 as company_credit_balance,
    NULL as company_date_balance,
    'No' as company_barcode_available,
    c.company_mail_customer_support,
    NULL as company_mail_commercial_support,
    'active' as company_status,
    'migration_script' as created_by,
    CURRENT_TIMESTAMP as last_update_date
FROM services s
CROSS JOIN (SELECT * FROM companies WHERE company_id = 1) c
WHERE s.service_id IN (2, 3, 4, 6)
AND NOT EXISTS (
    SELECT 1 FROM companies comp 
    WHERE comp.service_id = s.service_id 
    AND comp.country_id = 1
);

-- Mostrar companias creadas
DO $$
DECLARE
    company_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO company_count FROM companies;
    RAISE NOTICE 'Companias despues de crear: %', company_count;
END $$;

-- Actualizar nombre de la compania original
UPDATE companies 
SET company_name = 'Bitel - TopUps'
WHERE company_id = 1 AND company_name = 'Bitel';

-- Mostrar todas las companias
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE 'Lista de companias:';
    FOR rec IN SELECT company_id, company_name, service_id FROM companies ORDER BY company_id
    LOOP
        RAISE NOTICE '  ID: %, Nombre: %, Service: %', rec.company_id, rec.company_name, rec.service_id;
    END LOOP;
END $$;

-- Actualizar productos para asignarlos a la compania correcta segun su service_id
UPDATE products p
SET company_id = c.company_id
FROM companies c
WHERE p.service_id = c.service_id
  AND p.country_id = c.country_id
  AND c.country_id = 1;

-- Verificar actualizacion
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Productos actualizados: %', updated_count;
END $$;

-- Verificar que NO haya inconsistencias
DO $$
DECLARE
    inconsistent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inconsistent_count
    FROM products p
    JOIN companies c ON p.company_id = c.company_id
    WHERE p.service_id != c.service_id;
    
    IF inconsistent_count > 0 THEN
        RAISE EXCEPTION 'ERROR: % productos aun tienen service_id inconsistente', inconsistent_count;
    ELSE
        RAISE NOTICE '[OK] TODOS los productos tienen service_id consistente';
    END IF;
END $$;

-- Mostrar distribucion final
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Distribucion de productos por compania:';
    FOR rec IN 
        SELECT c.company_id, c.company_name, COUNT(p.product_id) as total_productos
        FROM companies c
        LEFT JOIN products p ON c.company_id = p.company_id
        GROUP BY c.company_id, c.company_name
        ORDER BY c.company_id
    LOOP
        RAISE NOTICE '  %: % productos', rec.company_name, rec.total_productos;
    END LOOP;
END $$;

COMMIT;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '  CORRECCION COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '=======================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Ahora puede ejecutar el script de migracion nuevamente';
    RAISE NOTICE '';
END $$;
