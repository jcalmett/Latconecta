-- =============================================================================
-- 002_latcom_api_v09.sql
-- LATCOM en su nueva plataforma (Distributor API v0.9)
--
-- Qué hace:
--   1. Vendor LATCOM: URLs nuevas (sandbox / producción) y limpieza de la API key
--      antigua. Queda en sandbox (is_production = false).
--   2. Mapping LC03M (grupo 003, provisión — lo usan los 28 vendor_products de
--      LATCOM): pasa a POST /api/tn/fast con JWT bearer.
--   3. Mapping LC04B nuevo (grupo 003, saldo): GET /api/balance → saldo USD.
--   4. Desactiva LC01T (grupo 001) y LC02B (grupo 002): API anterior, sin uso.
--
-- Qué NO hace (a propósito):
--   - No escribe credenciales. Cargar en el admin → Vendors → LATCOM:
--       Usuario  (vendor_username) = API key   (sandbox: sbx_..., producción: gld_...)
--       Password (vendor_password) = Secret key
--   - No cambia vendor_products (SKU) ni products (moneda/precios): pendiente de
--     que LATCOM habilite el catálogo para LATCOMTEL.
--   - No crea mapping de consulta de estado: GET /api/tn/status/{id} lleva el id
--     en la ruta y el motor de mappings no soporta parámetros de ruta.
--
-- Seguro de re-ejecutar: usa UPDATE / ON CONFLICT.
-- =============================================================================

-- 1. Vendor LATCOM -------------------------------------------------------------
UPDATE vendors
SET vendor_url_uat   = 'https://apigla.mitopup.com:8090',
    vendor_url_prod  = 'https://apigla.mitopup.com',
    vendor_api_key   = NULL,     -- API key de la plataforma anterior (obsoleta)
    vendor_user_uid  = NULL,
    vendor_access_token = NULL,
    vendor_token_expiry = NULL,
    is_production    = false,
    vendor_timeout   = 45,
    vendor_description = 'LATCOM — plataforma propia (Distributor API v0.9). México: Movistar, Telcel, AT&T, BAIT. Recargas y paquetes.',
    updated_by       = 'migration_002',
    last_update_date = NOW()
WHERE vendor_code = 'LATCOM';

-- 2. Provisión (recargas y paquetes) — LC03M, grupo 003 --------------------------
--    Request (JSON):  {"targetMSISDN": "5512345678", "Amount": 100,
--                      "operator": "TELCEL", "productId": "<SKU LATCOM>",
--                      "dist_transid": "REF-WEB-20261018114905-K7Q2XA"}
--    Éxito:           {"success": true, "status": "Success", "transId": "GLD-...",
--                      "response_code": "00", "response_message": "Aprobado", ...}
--    Teléfono: LATCOM acepta 10 dígitos y retira +52 automáticamente.
INSERT INTO vendor_api_mappings (
    mapping_code, vendor_code, api_group_code, operation_type, http_method,
    endpoint_url, auth_type, auth_config, request_mapping, value_transformations,
    response_mapping, success_indicators, timeout_seconds, headers, is_active
) VALUES (
    'LC03M', 'LATCOM', '003', 'provision', 'POST',
    '/api/tn/fast', 'bearer',
    '{"header_name": "Authorization", "token_prefix": "Bearer "}',
    '{"targetMSISDN": "purchase_phone_number",
      "Amount":       "purchase_vendor_amount",
      "operator":     "purchase_vendpro_operator",
      "productId":    "purchase_vendor_skuid",
      "dist_transid": "purchase_reference"}',
    '{"purchase_phone_number": {"trim": true, "remove_spaces": true}}',
    '{"transId":          "vendor_trans_id",
      "response_code":    "purchase_vendor_response_code",
      "response_message": "purchase_vendor_response_description"}',
    '{"status_codes": [200], "success_field": "response_code", "success_values": ["00"]}',
    45, '{}', true
)
ON CONFLICT (vendor_code, api_group_code, operation_type) DO UPDATE SET
    mapping_code          = EXCLUDED.mapping_code,
    http_method           = EXCLUDED.http_method,
    endpoint_url          = EXCLUDED.endpoint_url,
    auth_type             = EXCLUDED.auth_type,
    auth_config           = EXCLUDED.auth_config,
    request_mapping       = EXCLUDED.request_mapping,
    value_transformations = EXCLUDED.value_transformations,
    response_mapping      = EXCLUDED.response_mapping,
    success_indicators    = EXCLUDED.success_indicators,
    timeout_seconds       = EXCLUDED.timeout_seconds,
    headers               = EXCLUDED.headers,
    is_active             = EXCLUDED.is_active,
    updated_at            = NOW();

-- 3. Saldo — LC04B, grupo 003 ---------------------------------------------------
--    GET /api/balance → {"balance": 1500.50, "credit_limit": 500.00,
--                        "available": 2000.50, "currency": "USD"}
--    Se usa "available" (saldo + crédito = lo que realmente se puede vender).
--    Lo usan Vendors → 💰 Sincronizar saldo y 🔌 Probar conexión.
INSERT INTO vendor_api_mappings (
    mapping_code, vendor_code, api_group_code, operation_type, http_method,
    endpoint_url, auth_type, auth_config, request_mapping, value_transformations,
    response_mapping, success_indicators, timeout_seconds, headers, is_active
) VALUES (
    'LC04B', 'LATCOM', '003', 'balance', 'GET',
    '/api/balance', 'bearer',
    '{"header_name": "Authorization", "token_prefix": "Bearer "}',
    '{}',
    '{}',
    '{"available": "balance_usd"}',
    '{"status_codes": [200], "success_field": "success", "success_values": [true, "True", "true"]}',
    30, '{}', true
)
ON CONFLICT (vendor_code, api_group_code, operation_type) DO UPDATE SET
    mapping_code          = EXCLUDED.mapping_code,
    http_method           = EXCLUDED.http_method,
    endpoint_url          = EXCLUDED.endpoint_url,
    auth_type             = EXCLUDED.auth_type,
    auth_config           = EXCLUDED.auth_config,
    request_mapping       = EXCLUDED.request_mapping,
    value_transformations = EXCLUDED.value_transformations,
    response_mapping      = EXCLUDED.response_mapping,
    success_indicators    = EXCLUDED.success_indicators,
    timeout_seconds       = EXCLUDED.timeout_seconds,
    headers               = EXCLUDED.headers,
    is_active             = EXCLUDED.is_active,
    updated_at            = NOW();

-- 4. Mappings de la API anterior, sin uso ---------------------------------------
UPDATE vendor_api_mappings
SET is_active = false, updated_at = NOW()
WHERE vendor_code = 'LATCOM' AND mapping_code IN ('LC01T', 'LC02B');
