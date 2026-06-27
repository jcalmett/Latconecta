# APIs Externas — Latconecta v2.0.0

*Documentación de integración con vendors y APIs externas*
*Latcom Horizons II, LLC — Junio 2026*

---

## Tabla de Contenidos

- [TISI / MEGAPUNTO — Perú y Venezuela](#tisi)
- [LATCOM / VIAONE — México](#latcom)
- [Credenciales y Ambientes QA](#credenciales)
- [Teléfonos de Prueba](#telefonos)
- [API Mappings](#mappings)

---

## TISI / MEGAPUNTO — Perú y Venezuela {#tisi}

### Credenciales QA

| Dato | Valor |
|------|-------|
| Endpoint | https://api-hub-qa-in.tisi.com.pe |
| userName | LA2410 |
| password | A0b08Mh58F1K |
| codigo_distribuidor | 0000037 |
| Token expira | 10 minutos |

### Generar Token

```bash
curl -s -X POST https://api-hub-qa-in.tisi.com.pe/Auth/token \
  -H "Content-Type: application/json" \
  -d '{"userName": "LA2410", "password": "A0b08Mh58F1K"}'
```

### Teléfonos de Prueba — Perú

| Operadora | skuid | Número | Montos |
|-----------|-------|--------|--------|
| Movistar | 907 | 990388408 | S/ 3.00 – 100.00 |
| Bitel | 66 | 998877543 | S/ 5.00 – 100.00 |
| Entel | 67 | 919499716 | S/ 3.00 – 100.00 |
| Claro | 70 | 999888777 | S/ 3.00 – 100.00 |

### Teléfonos de Prueba — Venezuela

| Operadora | skuid | Número | Montos |
|-----------|-------|--------|--------|
| Movistar Celular | 5580 | 04241403958 | 500–3,250 Bs |
| Digitel | 5583 | 04122928915 | 600–3,900 Bs |
| Movistar Fijo | 5581 | Sin número oficial | — |
| Movilnet | 5582 | Sin número oficial | — |

### Tipo de Cambio Vigente
- TC: **109.06 Bs/S/**
- Se actualiza automáticamente via sync del catálogo

### Comando de Recarga de Prueba

```bash
TOKEN=$(curl -s -X POST https://api-hub-qa-in.tisi.com.pe/Auth/token \
  -H "Content-Type: application/json" \
  -d '{"userName": "LA2410", "password": "A0b08Mh58F1K"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl -s -X POST https://api-hub-qa-in.tisi.com.pe/Recarga/procesar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"codigo_distribuidor\":\"0000037\",\"codigo_comercio\":\"0001\",
       \"nombre_comercio\":\"Latconecta\",
       \"fecha_envio\":\"$(date +%Y%m%d%H%M%S)000\",
       \"id_producto\":907,\"numero\":\"990388408\",
       \"importe\":\"3.00\",
       \"nro_transaccion_referencia\":\"TEST-$(date +%Y%m%d%H%M%S)\"}"
```

---

## LATCOM / VIAONE — México {#latcom}

### Teléfonos de Prueba — México

| Operadora | Número | Montos válidos |
|-----------|--------|----------------|
| Movistar | 5511921174 | 80, 250, 300, 400, 500 MXN |
| Telcel | 9991653533 | 80, 300, 500 MXN |
| ATT | 5657936767 | 100, 150, 200 MXN |

---

## Documentación Detallada {#mappings}

# DOCUMENTO 18
## LATCOM — GUÍA DE INTEGRACIÓN (README)

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Vendor:** LATCOM Internacional
**Plataforma técnica:** Relier
**Contacto:** Richard Mas — jcalmett@latcom.co

---

## CONTENIDO

Este documento (DOC 18) es el punto de entrada a la integración con LATCOM. Los documentos DOC 19-22 cubren los detalles específicos.

- **DOC 18** — Guía de Integración (este documento): visión general, credenciales, endpoints
- **DOC 19** — Autenticación LATCOM
- **DOC 20** — Países y Operadores
- **DOC 21** — API de TopUps
- **DOC 22** — Códigos de Error

---

## VISIÓN GENERAL

LATCOM es el vendor principal de Latconecta. Permite procesar recargas (TopUps) en múltiples países de América Latina. La plataforma tecnológica que opera detrás de LATCOM es **Relier** — toda la documentación técnica se refiere a la API de Relier (con branding LATCOM para uso de Latconecta).

### Países Soportados

| País | Código | Moneda | Operadoras | Plataforma interna |
|------|--------|--------|-----------|-------------------|
| México | MX | MXN | TELCEL, ATT, MOVISTAR | Codigo Arix / Latcom |
| Perú | PE | PEN | CLARO, BITEL, ENTEL, MOVISTAR | TISI Hub |
| Venezuela | VE | VES | MOVISTAR, DIGITEL, MOVILNET | Servipagos VZ |

### Base URL

```
UAT/Testing: https://latcom-fix-production.up.railway.app
Producción:  (coordinar con Richard Mas en jcalmett@latcom.co)
```

**Nota:** La URL UAT tiene el nombre "production" en su dominio por razones históricas del despliegue del proveedor — no indica que sea producción real.

### Endpoints Disponibles

| Método | Path | Descripción |
|--------|------|-------------|
| GET | /api/v1/balance | Consulta de saldo de la cuenta |
| POST | /api/v1/topup | Procesar recarga de airtime |
| GET | /api/v1/transaction/:id | Consulta de estado de transacción |

### Quick Start

```bash
# Verificar balance
curl -s https://latcom-fix-production.up.railway.app/api/v1/balance \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY"

# Recarga Bitel Perú — 10 PEN
curl -s -X POST https://latcom-fix-production.up.railway.app/api/v1/topup \
  -H "Content-Type: application/json" \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY" \
  -d '{"carrier":"BITEL","phone":"945678901","amount":10,"country":"PE","reference":"PE-TEST-001"}'
```

### Relación con el Motor de API Mappings

LATCOM está integrado en Latconecta a través del motor de API Mappings. La integración está configurada en:

- **vendors:** `vendor_code = 'LATCOM'` con credenciales, URL y balance
- **vendor_products:** productos de LATCOM con `api_group_code` asignado
- **vendor_api_mappings:** mappings con `vendor_code = 'LATCOM'` que definen cómo llamar a cada endpoint

No existe código Python específico para LATCOM en el sistema actual — todo funciona a través del motor genérico `UniversalVendorService` + `VendorAPIMapper`.

---

**FIN DEL DOCUMENTO 18**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 19 — LATCOM: Autenticación*


---

# DOCUMENTO 19
## LATCOM — AUTENTICACIÓN

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0

---

## MÉTODO DE AUTENTICACIÓN

La API de LATCOM/Relier usa autenticación por **API Key en headers HTTP**. No requiere login previo ni tokens temporales — las credenciales son permanentes.

Todos los requests deben incluir estos dos headers:

| Header | Descripción | Ejemplo |
|--------|-------------|---------|
| `x-customer-id` | Identificador del cliente (Latconecta) | `LATCONECTA_001` |
| `x-api-key` | API Key del entorno (UAT o Producción) | `latcom_peru_mli4fpwc_xx62baa0` |

```bash
# Ejemplo curl
curl https://latcom-fix-production.up.railway.app/api/v1/balance \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY"
```

## CONFIGURACIÓN EN LATCONECTA

Las credenciales se almacenan en la tabla `vendors`, nunca en código fuente:

| Campo | Descripción |
|-------|-------------|
| `vendor_api_key` | Valor para el header `x-api-key` |
| `vendor_user_uid` | Valor para el header `x-customer-id` |

El motor de API Mappings construye los headers automáticamente con `auth_type = 'apikey'`:

```json
{
  "auth_type": "apikey",
  "auth_config": {
    "api_key_header": "x-api-key",
    "customer_id_header": "x-customer-id",
    "token_source": "vendor_api_key",
    "customer_id_source": "vendor_user_uid"
  }
}
```

## ERRORES DE AUTENTICACIÓN

### 401 — Credenciales inválidas

```json
{
  "success": false,
  "error_code": "INVALID_CREDENTIALS",
  "error_message": "Missing x-api-key or x-customer-id header",
  "timestamp": "2026-03-25T14:30:00.000Z"
}
```

**Causas:**
- Falta alguno de los dos headers
- El valor de `x-api-key` es incorrecto
- El API Key es del entorno equivocado (UAT vs Producción)

**Solución:** Verificar los valores en `vendors.vendor_api_key` y `vendors.vendor_user_uid` en la BD.

### 403 — Cuenta deshabilitada

```json
{
  "success": false,
  "error_code": "ACCOUNT_DISABLED",
  "error_message": "Customer account is disabled. Contact support.",
  "timestamp": "2026-03-25T14:30:00.000Z"
}
```

**Solución:** Contactar a Richard Mas (jcalmett@latcom.co).

### 403 — País no autorizado

```json
{
  "success": false,
  "error_code": "COUNTRY_NOT_ALLOWED",
  "error_message": "Customer is not authorized for the requested country",
  "timestamp": "2026-03-25T14:30:00.000Z"
}
```

**Solución:** Verificar que el API Key tiene permisos para el país solicitado. Coordinar con LATCOM.

## PRUEBA RÁPIDA DE CREDENCIALES

```bash
# Verificar que las credenciales UAT funcionan:
curl -s https://latcom-fix-production.up.railway.app/api/v1/balance \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY_UAT" | python3 -m json.tool

# Respuesta esperada:
{
  "success": true,
  "balance": 4994.12,
  "currency": "USD",
  "timestamp": "2026-03-25T14:30:00.000Z"
}
```

---

**FIN DEL DOCUMENTO 19**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 20 — LATCOM: Países y Operadores*


---

# DOCUMENTO 20
## LATCOM — PAÍSES Y OPERADORES

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0

---

## RESUMEN DE PAÍSES SOPORTADOS

| País | Código API | Código BD (alpha-3) | Moneda | Formato teléfono | Plataforma |
|------|-----------|-------------------|--------|-----------------|------------|
| México | MX | MEX | MXN | 10 dígitos | Codigo Arix / Latcom |
| Perú | PE | PER | PEN | 9 dígitos | TISI Hub |
| Venezuela | VE | VEN | VES | 11 dígitos (con prefijo 04XX) | Servipagos VZ |

**Transformación de código de país:** La BD de Latconecta usa alpha-3 (PER, MEX, VEN). La API de LATCOM espera alpha-2 (PE, MX, VE). La transformación `country_alpha3_to_alpha2` en el motor de API Mappings resuelve esto automáticamente.

---

## MÉXICO (MX)

### Características

| Propiedad | Valor |
|-----------|-------|
| Código API | MX |
| Moneda | MXN (Peso Mexicano) |
| Formato teléfono | 10 dígitos — ej: `5512345678` |
| Tipo de monto | Denominaciones fijas |
| Montos válidos | 10, 20, 30, 50, 80, 100, 150, 200, 300, 500 (MXN) |

**Nota importante sobre el teléfono México:** LATCOM espera 10 dígitos (sin prefijo internacional). Si el usuario ingresa 11 dígitos con prefijo `52`, debe removerse. Usar la transformación `remove_prefix` en value_transformations si es necesario.

### Operadoras México

| Operadora | Código API | Proveedor LATCOM | Código en BD |
|-----------|-----------|-----------------|--------------|
| Telcel | `TELCEL` | Codigo Arix | telcel |
| AT&T México | `ATT` | Codigo Arix | att |
| Movistar México | `MOVISTAR` | Latcom | movistar |

### Ejemplo de Llamada

```json
POST /api/v1/topup
{
  "carrier": "TELCEL",
  "phone": "5512345678",
  "amount": 50,
  "country": "MX",
  "reference": "MX-TEST-001"
}
```

---

## PERÚ (PE)

### Características

| Propiedad | Valor |
|-----------|-------|
| Código API | PE |
| Moneda | PEN (Sol Peruano) |
| Formato teléfono | 9 dígitos — ej: `987654321` |
| Tipo de monto | Flexible — cualquier entero |
| Rango de montos | 1 a 500 PEN |

**Nota teléfono Perú:** Los números móviles peruanos tienen exactamente 9 dígitos y comienzan con 9. No llevan prefijo de país en la llamada a LATCOM.

### Operadoras Perú

| Operadora | Código API | Proveedor LATCOM | Código en BD |
|-----------|-----------|-----------------|--------------|
| Claro | `CLARO` | TISI Hub | claro |
| Bitel | `BITEL` | TISI Hub | bitel |
| Entel | `ENTEL` | TISI Hub | entel |
| Movistar | `MOVISTAR` | TISI Hub | movistar |

### Estado de Pruebas (Ronda 2)

| Operadora | Estado de Prueba |
|-----------|----------------|
| Bitel | ✅ Exitoso |
| Entel | ✅ Exitoso |
| Claro | ⚠️ Error 401 — coordinar con Richard Mas |
| Movistar | ⚠️ Pendiente de prueba |

### Ejemplo de Llamada

```json
POST /api/v1/topup
{
  "carrier": "BITEL",
  "phone": "945678901",
  "amount": 10,
  "country": "PE",
  "reference": "PE-TEST-001"
}
```

---

## VENEZUELA (VE)

### Características

| Propiedad | Valor |
|-----------|-------|
| Código API | VE |
| Moneda | VES (Bolívar Soberano) |
| Formato teléfono | 11 dígitos con prefijo 04XX — ej: `04141234567` |
| Tipo de monto | Flexible — cualquier entero |
| Rango de montos | 1 a 999,999 VES |

**Nota teléfono Venezuela:** A diferencia de Perú y México, el número venezolano incluye el prefijo del operador (04XX) dentro del número de 11 dígitos. `0414` = Movistar, `0412` = Digitel, `0416/0426` = Movilnet.

### Operadoras Venezuela

| Operadora | Código API | Proveedor LATCOM | Prefijo | Código en BD |
|-----------|-----------|-----------------|---------|--------------|
| Movistar | `MOVISTAR` | Servipagos VZ | 0414, 0424 | movistar |
| Digitel | `DIGITEL` | Servipagos VZ | 0412 | digitel |
| Movilnet | `MOVILNET` | Servipagos VZ | 0416, 0426 | movilnet |

### Estado de Pruebas (Ronda 2)

| Estado | Descripción |
|--------|-------------|
| ❌ Falla | Error "Authentication failed: Credenciales invalidas" |
| Causa | Problema del lado de LATCOM/Servipagos VZ |
| Acción | Pendiente resolución por Richard Mas (jcalmett@latcom.co) |

### Ejemplo de Llamada

```json
POST /api/v1/topup
{
  "carrier": "MOVISTAR",
  "phone": "04141234567",
  "amount": 500,
  "country": "VE",
  "reference": "VE-TEST-001"
}
```

---

## MAPEO DE CÓDIGOS: BD → API LATCOM

Para el motor de API Mappings, la transformación de códigos es:

### Países (country_alpha3_to_alpha2)

| BD (alpha-3) | API LATCOM (alpha-2) |
|-------------|---------------------|
| PER | PE |
| MEX | MX |
| VEN | VE |

### Operadoras (sin transformación necesaria)

Los códigos de operadora en `vp_operator` (BD) deben coincidir con los que LATCOM espera en el campo `carrier`:

| BD (vp_operator) | API LATCOM (carrier) | Transformación |
|-----------------|---------------------|----------------|
| bitel | BITEL | `to_upper: true` |
| claro | CLARO | `to_upper: true` |
| entel | ENTEL | `to_upper: true` |
| movistar | MOVISTAR | `to_upper: true` |
| telcel | TELCEL | `to_upper: true` |
| att | ATT | `to_upper: true` |
| digitel | DIGITEL | `to_upper: true` |
| movilnet | MOVILNET | `to_upper: true` |

Configuración en `value_transformations`:
```json
{
  "purchase_vendpro_operator": {"to_upper": true},
  "purchase_vendpro_country": {"country_alpha3_to_alpha2": true}
}
```

---

**FIN DEL DOCUMENTO 20**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 21 — LATCOM: API de TopUps*


---

# DOCUMENTO 21
## LATCOM — API DE TOPUPS

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0

---

## ENDPOINT: POST /api/v1/topup

### Request Body

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `carrier` | string | Sí | Código de la operadora en MAYÚSCULAS (BITEL, CLARO, TELCEL, etc.) |
| `phone` | string | Sí | Número de teléfono (solo dígitos, formato según país) |
| `amount` | integer | Sí | Monto en moneda local (entero, no decimal) |
| `reference` | string | Sí | Referencia única de la transacción (máx 50 chars) |
| `country` | string | No | Código país alpha-2: MX, PE, VE. Default: MX |

**Nota sobre `amount`:** LATCOM espera un entero. Si el monto es `20.0 PEN`, debe enviarse como `20`. Usar la transformación `to_integer` si es necesario.

**Nota sobre `reference`:** Se recomienda usar `purchase_reference` de Latconecta (ej: `REF-20260325143022`). Debe ser único por transacción.

### Response Exitosa (200)

```json
{
  "success": true,
  "transaction_id": "VIA-20260325-1234",
  "carrier": "BITEL",
  "phone": "945678901",
  "amount": 10,
  "currency": "PEN",
  "country": "PE",
  "status": "completed",
  "authorization_code": "ABC123",
  "timestamp": "2026-03-25T14:30:00.000Z",
  "reference": "REF-20260325143022"
}
```

### Mapeo de Campos (response_mapping en API Mappings)

```json
{
  "transaction_id": "vendor_trans_id",
  "authorization_code": "vendor_provider_trans_id",
  "status": "purchase_delivery_status"
}
```

### Success Indicators

```json
{
  "status_codes": [200],
  "success_field": "success",
  "success_values": [true, "true", "SUCCESS", "completed"]
}
```

---

## ENDPOINT: GET /api/v1/balance

Consulta el saldo disponible en la cuenta LATCOM.

**Response (200):**
```json
{
  "success": true,
  "balance": 4994.12,
  "currency": "USD",
  "timestamp": "2026-03-25T14:30:00.000Z"
}
```

---

## ENDPOINT: GET /api/v1/transaction/:id

Consulta el estado de una transacción previa por su `transaction_id`.

**Response (200):**
```json
{
  "success": true,
  "transaction_id": "VIA-20260325-1234",
  "status": "completed",
  "carrier": "BITEL",
  "phone": "945678901",
  "amount": 10,
  "country": "PE",
  "timestamp": "2026-03-25T14:30:00.000Z"
}
```

---

## EJEMPLOS COMPLETOS POR PAÍS

### Perú — Bitel 10 PEN

```bash
curl -s -X POST https://latcom-fix-production.up.railway.app/api/v1/topup \
  -H "Content-Type: application/json" \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY" \
  -d '{
    "carrier": "BITEL",
    "phone": "945678901",
    "amount": 10,
    "country": "PE",
    "reference": "PE-TEST-001"
  }'
```

### Perú — Entel 20 PEN

```bash
curl -s -X POST https://latcom-fix-production.up.railway.app/api/v1/topup \
  -H "Content-Type: application/json" \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY" \
  -d '{
    "carrier": "ENTEL",
    "phone": "912345678",
    "amount": 20,
    "country": "PE",
    "reference": "PE-TEST-002"
  }'
```

### México — Telcel 50 MXN

```bash
curl -s -X POST https://latcom-fix-production.up.railway.app/api/v1/topup \
  -H "Content-Type: application/json" \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY" \
  -d '{
    "carrier": "TELCEL",
    "phone": "5512345678",
    "amount": 50,
    "country": "MX",
    "reference": "MX-TEST-001"
  }'
```

### Venezuela — Movistar 500 VES

```bash
curl -s -X POST https://latcom-fix-production.up.railway.app/api/v1/topup \
  -H "Content-Type: application/json" \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY" \
  -d '{
    "carrier": "MOVISTAR",
    "phone": "04141234567",
    "amount": 500,
    "country": "VE",
    "reference": "VE-TEST-001"
  }'
```

---

**FIN DEL DOCUMENTO 21**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 22 — LATCOM: Códigos de Error*


---

# DOCUMENTO 22
## LATCOM — CÓDIGOS DE ERROR

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0

---

## FORMATO DE ERROR

Todos los errores de la API LATCOM/Relier siguen este formato:

```json
{
  "success": false,
  "error_code": "CODIGO_ERROR",
  "error_message": "Descripción legible del error",
  "transaction_id": "VIA-20260325-1234",
  "timestamp": "2026-03-25T14:30:00.000Z"
}
```

---

## ERRORES DE AUTENTICACIÓN

| Código | HTTP | Descripción | Acción recomendada |
|--------|------|-------------|-------------------|
| `INVALID_CREDENTIALS` | 401 | Falta o es inválido `x-api-key` / `x-customer-id` | Verificar credenciales en tabla vendors |
| `ACCOUNT_DISABLED` | 403 | La cuenta de LATCONECTA_001 está desactivada | Contactar Richard Mas |
| `COUNTRY_NOT_ALLOWED` | 403 | La cuenta no tiene permiso para el país solicitado | Coordinar con LATCOM para habilitar el país |

---

## ERRORES DE VALIDACIÓN

| Código | HTTP | Descripción | Acción recomendada |
|--------|------|-------------|-------------------|
| `INVALID_REQUEST` | 400 | Cuerpo del request inválido (campos faltantes o incorrectos) | Verificar el request_mapping en API Mappings |
| `INVALID_COUNTRY` | 400 | Código de país no soportado (debe ser MX, PE, o VE) | Verificar transformación country_alpha3_to_alpha2 |
| `INVALID_PHONE` | 400 | Número de teléfono no coincide con el formato del país | Verificar formato: PE=9 dígitos, MX=10 dígitos, VE=11 dígitos |
| `INVALID_AMOUNT` | 400 | Monto fuera del rango permitido o denominación inválida | Para MX: solo denominaciones fijas. Para PE: 1-500 PEN |
| `INVALID_CARRIER` | 400 | Operadora no soportada para el país especificado | Verificar que vp_operator está en la lista de operadoras del país |

---

## ERRORES DE TRANSACCIÓN

| Código | HTTP | Descripción | Acción recomendada |
|--------|------|-------------|-------------------|
| `NO_PROVIDER` | 400 | No hay proveedor configurado para la combinación carrier/country | Coordinar con LATCOM — puede ser un país/operadora no habilitado |
| `PROVIDER_NOT_SUPPORTED` | 500 | Implementación del proveedor no encontrada | Reportar a LATCOM/Richard Mas |
| `TRANSACTION_FAILED` | 400 | El proveedor rechazó la recarga (ver error_message) | Revisar el error_message para detalle específico del operador |
| `TRANSACTION_NOT_FOUND` | 404 | ID de transacción no encontrado | Verificar el transaction_id |

---

## ERRORES DE SISTEMA

| Código | HTTP | Descripción | Acción recomendada |
|--------|------|-------------|-------------------|
| `INTERNAL_ERROR` | 500 | Error interno inesperado del servidor LATCOM | Reportar a LATCOM con el timestamp |
| `SERVICE_UNAVAILABLE` | 503 | BD de LATCOM no configurada o inalcanzable | Reintentar en 5-10 minutos. Si persiste, contactar LATCOM |

---

## ERRORES CONOCIDOS EN PRUEBAS (Ronda 2)

### Claro Perú — Error 401

```json
{
  "success": false,
  "error_code": "INVALID_CREDENTIALS",
  "error_message": "Authentication failed"
}
```

**Estado:** Pendiente resolución por Richard Mas (jcalmett@latcom.co). El error es del lado de LATCOM/TISI Hub, no de Latconecta.

### Venezuela — Authentication Failed

```json
{
  "success": false,
  "error": "Authentication failed: Credenciales invalidas"
}
```

**Estado:** Pendiente resolución por LATCOM/Servipagos VZ. Contacto: Richard Mas.

---

## MANEJO DE ERRORES EN EL SISTEMA

### En purchases.py

```python
# UniversalVendorService retorna:
result = {
    "success": False,
    "error": "TRANSACTION_FAILED",
    "vendor_request": {...},   # JSON enviado — para auditoría
    "vendor_response": {...}   # JSON recibido — para auditoría
}

# purchases.py guarda la evidencia y ejecuta reversión:
purchase.vendor_request = json.dumps(result["vendor_request"])
purchase.vendor_response = json.dumps(result["vendor_response"])
purchase.purchase_vendor_response_code = result.get("error_code")
purchase.purchase_vendor_response_description = result.get("error_message")

if payment_was_processed:
    # Intentar reversión del pago
    reversal_result = await attempt_payment_reversal(...)
    if reversal_result["success"]:
        purchase.purchase_payment_status = "Reversed"
    else:
        purchase.requires_manual_intervention = True
```

### Errores de Red

El `UniversalVendorService` también maneja errores de conectividad y los normaliza:

| Tipo de error | Código guardado | Descripción |
|--------------|----------------|-------------|
| httpx.TimeoutException | TIMEOUT | La llamada al vendor no respondió en tiempo |
| httpx.ConnectError | NETWORK_ERROR | No se pudo conectar al servidor del vendor |
| Exception genérica | ERROR | Cualquier otro error inesperado |

Estos errores se guardan en `purchase_vendor_response_code` en la tabla purchases.

---

**FIN DEL DOCUMENTO 22**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 23 — Flujos de Negocio Completos*


---

# DOCUMENTO 25
## GUÍA DE API MAPPINGS PARA DESARROLLADORES

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Audiencia:** Desarrolladores que configuran nuevas integraciones de vendor

---

## CONTENIDO

1. [Concepto y Terminología](#concepto)
2. [Campos Disponibles como Fuente](#campos)
3. [Formatos de request_mapping](#formatos)
4. [Transformaciones de Valores](#transformaciones)
5. [Respuesta del Vendor → response_mapping](#response)
6. [Success Indicators](#success)
7. [Configuración de Autenticación](#auth-config)
8. [Checklist para Nueva Integración](#checklist)
9. [Ejemplos Completos por Caso de Uso](#ejemplos)
10. [Errores Comunes y Soluciones](#errores)

---

## CONCEPTO Y TERMINOLOGÍA <a name="concepto"></a>

### Lookup de Mapping

El motor busca un mapping por la combinación exacta:

```
vendor_code + api_group_code + operation_type
```

Esta combinación es UNIQUE en la tabla `vendor_api_mappings`. El `api_group_code` vincula también con `vendor_products.api_group_code`.

### Flujo de Datos

```
source_data (purchases + vendor_products)
    ↓
request_mapping + value_transformations
    ↓
JSON enviado al vendor (con orden preservado)
    ↓
vendor responde
    ↓
response_mapping extrae campos
    ↓
success_indicators determina éxito/fallo
    ↓
campos mapeados actualizan purchase
```

### API Group Code

Es el identificador del "grupo" de operaciones para un vendor-producto específico. Convención de nomenclatura:

```
LC01T = LATCOM (LC) + grupo 01 + TopUps (T)
LC02B = LATCOM (LC) + grupo 02 + Bill Payment (B)
NV01T = NuevoVendor (NV) + grupo 01 + TopUps (T)
```

---

## CAMPOS DISPONIBLES COMO FUENTE <a name="campos"></a>

Estos son todos los campos que pueden usarse como `source_field` en `request_mapping`:

### Campos de Purchase

| source_field | Tipo | Descripción |
|-------------|------|-------------|
| `purchase_phone_number` | string | Teléfono destino de la recarga |
| `purchase_account_number` | string | Número de cuenta (Bill Payment) |
| `purchase_vendor_amount` | float | Monto a enviar al vendor |
| `purchase_vendor_currency` | string | Moneda del vendor (PEN, USD, MXN) |
| `purchase_reference` | string | Referencia única (REF-YYYYMMDDHHMMSS) |
| `purchase_vendpro_code` | string | Snapshot vp_code del vendor_product |
| `purchase_vendpro_operator` | string | Snapshot vp_operator (bitel, claro...) |
| `purchase_vendpro_country` | string | Snapshot vp_country (PER, MEX, VEN) |
| `purchase_vendpro_product_type` | string | Snapshot vp_product_type (1 char) |
| `purchase_vendor_skuid` | string | Snapshot vp_skuid |

### Campos de Vendor Product

| source_field | Tipo | Descripción |
|-------------|------|-------------|
| `vp_code` | string | Código del producto en el vendor |
| `vp_skuid` | string | SKU del producto |
| `vp_operator` | string | Operadora (bitel, claro, etc.) |
| `vp_country` | string | País en alpha-3 (PER, MEX, VEN) |
| `vp_currency` | string | Moneda del vendor product |
| `vp_amount` | float | Monto del vendor product |
| `vp_product_type` | string | Tipo de producto (1 char) |

### Constantes

Para valores fijos que siempre son iguales independientemente de la compra:

```json
{
  "api_field": "source",
  "source_field": "constant:ECOMMERCE"
}
```

Convención en formato fields: `"source_field": "constant:VALOR"`
En formato JSONPath: `"api_field": "constant:VALOR"` (pendiente verificar implementación)

---

## FORMATOS DE REQUEST_MAPPING <a name="formatos"></a>

### Formato JSONPath (Recomendado — más conciso)

```json
{
  "phone": "purchase_phone_number",
  "amount": "purchase_vendor_amount",
  "carrier": "purchase_vendpro_operator",
  "country": "purchase_vendpro_country",
  "reference": "purchase_reference"
}
```

El motor detecta automáticamente que no hay clave `"fields"` y usa este formato.

### Formato Fields (Legado — más explícito)

```json
{
  "fields": [
    {
      "api_field": "phone",
      "source_field": "purchase_phone_number",
      "data_type": "string",
      "required": true
    },
    {
      "api_field": "amount",
      "source_field": "purchase_vendor_amount",
      "data_type": "float",
      "required": true
    },
    {
      "api_field": "carrier",
      "source_field": "purchase_vendpro_operator",
      "data_type": "string",
      "required": true
    },
    {
      "api_field": "country",
      "source_field": "purchase_vendpro_country",
      "data_type": "string",
      "required": true
    },
    {
      "api_field": "reference",
      "source_field": "purchase_reference",
      "data_type": "string",
      "required": true
    }
  ]
}
```

**Tipos de dato disponibles en formato fields:** `string`, `integer`, `float`, `boolean`

### Campos Anidados (Solo formato fields)

```json
{
  "fields": [
    {
      "api_field": "recipient.phone",
      "source_field": "purchase_phone_number",
      "data_type": "string"
    },
    {
      "api_field": "recipient.country",
      "source_field": "purchase_vendpro_country",
      "data_type": "string"
    }
  ]
}
```

Genera:
```json
{
  "recipient": {
    "phone": "987654321",
    "country": "PE"
  }
}
```

---

## TRANSFORMACIONES DE VALORES <a name="transformaciones"></a>

El campo `value_transformations` especifica transformaciones por `source_field`:

```json
{
  "purchase_vendpro_country": {
    "country_alpha3_to_alpha2": true
  },
  "purchase_phone_number": {
    "trim": true
  },
  "purchase_vendpro_operator": {
    "to_upper": true
  },
  "purchase_vendor_amount": {
    "to_integer": true
  }
}
```

### Referencia Completa de Transformaciones

| Transformación | Parámetro | Input → Output | Notas |
|----------------|-----------|----------------|-------|
| `trim` | `true` | `" 987 "` → `"987"` | Elimina espacios |
| `remove_spaces` | `true` | `"987 654"` → `"987654"` | Elimina todos los espacios |
| `to_upper` | `true` | `"bitel"` → `"BITEL"` | |
| `to_lower` | `true` | `"BITEL"` → `"bitel"` | |
| `to_float` | `true` | `"20"` → `20.0` | |
| `to_integer` | `true` | `20.5` → `20` | Trunca — útil para LATCOM que espera int |
| `to_string` | `true` | `20.0` → `"20.0"` | |
| `add_prefix` | `"51"` | `"987654321"` → `"51987654321"` | |
| `remove_prefix` | `"51"` | `"51987654321"` → `"987654321"` | |
| `format` | `"%.2f"` | `20` → `"20.00"` | Formato C-style |
| `map_value` | `{"bitel": "BIT", "claro": "CLA"}` | `"bitel"` → `"BIT"` | Mapeo de valores |
| `country_alpha3_to_alpha2` | `true` | `"PER"` → `"PE"` | BD usa alpha-3, API usa alpha-2 |
| `add_country_prefix` | `true` + `"country_source": "vp_country"` | `"987654321"` → `"51987654321"` | Lee el código de país de otro campo |
| `strip_country_code` | `true` | `"51987654321"` → `"987654321"` | Elimina prefijo internacional |

---

## RESPUESTA DEL VENDOR → RESPONSE_MAPPING <a name="response"></a>

El `response_mapping` define cómo extraer campos de la respuesta del vendor y mapearlos a campos de la tabla `purchases`.

### Formato

```json
{
  "vendor_response_field": "purchase_field_destino"
}
```

**Campos destino disponibles en purchases:**

| Campo destino | Descripción |
|---------------|-------------|
| `vendor_trans_id` | ID de la transacción del vendor |
| `vendor_provider_trans_id` | ID del operador final |
| `purchase_delivery_status` | Estado de la provisión |
| `purchase_final_balance` | Balance del vendor después de la transacción |
| `purchase_vendor_response_code` | Código de respuesta |
| `purchase_vendor_response_description` | Descripción de la respuesta |

### Acceso a Campos Anidados

```json
{
  "data.transactionId": "vendor_trans_id",
  "data.authorization": "vendor_provider_trans_id",
  "result.balance": "purchase_final_balance"
}
```

Si el vendor responde:
```json
{
  "data": {
    "transactionId": "VIA-001",
    "authorization": "BITEL-789"
  },
  "result": {
    "balance": 4974.12
  }
}
```

---

## SUCCESS INDICATORS <a name="success"></a>

Determina si la respuesta del vendor es considerada exitosa.

```json
{
  "status_codes": [200, 201],
  "success_field": "success",
  "success_values": [true, "true", "SUCCESS", "COMPLETED", "completed"]
}
```

**Lógica:**
1. HTTP status code debe estar en `status_codes`
2. Si hay `success_field`, su valor en el JSON debe estar en `success_values`
3. Si no hay `success_field`, solo verifica el status code

**Ejemplo para vendor que usa HTTP 200 con campo `status`:**
```json
{
  "status_codes": [200],
  "success_field": "status",
  "success_values": ["OK", "APPROVED", "COMPLETED"]
}
```

---

## CONFIGURACIÓN DE AUTENTICACIÓN <a name="auth-config"></a>

### apikey (LATCOM)

```json
{
  "auth_type": "apikey",
  "auth_config": {
    "api_key_header": "x-api-key",
    "customer_id_header": "x-customer-id",
    "token_source": "vendor_api_key",
    "customer_id_source": "vendor_user_uid"
  }
}
```

Genera headers:
```
x-api-key: {vendor.vendor_api_key}
x-customer-id: {vendor.vendor_user_uid}
```

### bearer

```json
{
  "auth_type": "bearer",
  "auth_config": {
    "header_name": "Authorization",
    "token_prefix": "Bearer "
  }
}
```

Genera header:
```
Authorization: Bearer {vendor.vendor_access_token}
```

### basic

```json
{
  "auth_type": "basic",
  "auth_config": {}
}
```

Genera header:
```
Authorization: Basic {base64(vendor.vendor_username:vendor.vendor_password)}
```

### none

```json
{
  "auth_type": "none",
  "auth_config": {}
}
```

Solo incluye `Content-Type: application/json`.

---

## CHECKLIST PARA NUEVA INTEGRACIÓN <a name="checklist"></a>

```
□ 1. Registrar vendor en tabla vendors
     □ vendor_code único (MAYÚSCULAS por convención)
     □ vendor_url_uat + vendor_url_prod
     □ Credenciales: vendor_api_key, vendor_user_uid, vendor_username, vendor_password
     □ vendor_status = 'active'
     □ is_production = false (para empezar con UAT)

□ 2. Elegir api_group_code
     □ Formato: XX##T/B/P/S
       (iniciales vendor) + (número) + (T=TopUp/B=BillPay/P=Package/S=Smartphone)
     □ Ej: LC01T para LATCOM TopUps primario

□ 3. Registrar vendor_products
     □ Uno por producto (o rango de productos)
     □ Asignar api_group_code elegido
     □ vp_country en alpha-3 (PER, MEX, VEN)
     □ vp_operator en minúsculas (bitel, claro, etc.)

□ 4. Crear mapping de provisión
     □ operation_type = 'provision'
     □ mapping_code único de 5 chars
     □ http_method correcto (generalmente POST)
     □ endpoint_url: solo la ruta (ej: /api/v1/topup), no la URL completa
     □ auth_type + auth_config
     □ request_mapping: todos los campos requeridos por el vendor
     □ value_transformations: country_alpha3_to_alpha2 si necesario
     □ response_mapping: al menos transaction_id → vendor_trans_id
     □ success_indicators correcto para el vendor

□ 5. Crear mapping de validación (si el vendor tiene API de validación)
     □ operation_type = 'validation'
     □ Misma api_group_code que el mapping de provisión

□ 6. Vincular products del catálogo
     □ UPDATE products SET product_vendor_code, product_vendpro_code, product_vendpro_skuid

□ 7. Probar
     □ POST /vendor-api-mappings/{mapping_id}/test con datos de prueba
     □ Verificar request generado (json en respuesta)
     □ Verificar que success_indicators detecta correctamente éxito/fallo
     □ Flujo completo en PurchasePopup con la operación en Fase 2
```

---

## EJEMPLOS COMPLETOS POR CASO DE USO <a name="ejemplos"></a>

### Caso 1: Vendor con API Key + TopUps Perú (como LATCOM)

```sql
-- vendor
INSERT INTO vendors (vendor_code, vendor_name, vendor_url_uat,
    vendor_api_key, vendor_user_uid, vendor_status)
VALUES ('LATCOM', 'LATCOM Internacional',
    'https://latcom-fix-production.up.railway.app',
    'latcom_peru_mli4fpwc_xx62baa0', 'LATCONECTA_001', 'active');

-- vendor_product
INSERT INTO vendor_products (vendor_code, api_group_code, vp_code, vp_skuid,
    vp_operator, vp_country, vp_currency, vp_amount, vp_amount_type, vp_fee_usd)
VALUES ('LATCOM', 'LC01T', 'BITEL_20_PEN', 'SKU_BITEL_20',
    'bitel', 'PER', 'PEN', 20.0, 'fixed', 0.05);

-- api_mapping provision
INSERT INTO vendor_api_mappings (
    mapping_code, vendor_code, api_group_code, operation_type,
    http_method, endpoint_url, auth_type, auth_config,
    request_mapping, value_transformations, response_mapping, success_indicators
) VALUES (
    'LC01T', 'LATCOM', 'LC01T', 'provision',
    'POST', '/api/v1/topup', 'apikey',
    '{"api_key_header": "x-api-key", "customer_id_header": "x-customer-id",
      "token_source": "vendor_api_key", "customer_id_source": "vendor_user_uid"}',
    '{"carrier": "purchase_vendpro_operator",
      "phone": "purchase_phone_number",
      "amount": "purchase_vendor_amount",
      "country": "purchase_vendpro_country",
      "reference": "purchase_reference"}',
    '{"purchase_vendpro_country": {"country_alpha3_to_alpha2": true},
      "purchase_vendpro_operator": {"to_upper": true},
      "purchase_vendor_amount": {"to_integer": true},
      "purchase_phone_number": {"trim": true}}',
    '{"transaction_id": "vendor_trans_id",
      "authorization_code": "vendor_provider_trans_id",
      "status": "purchase_delivery_status"}',
    '{"status_codes": [200], "success_field": "success", "success_values": [true, "true"]}'
);
```

### Caso 2: Vendor con Bearer Token + campos anidados

```json
{
  "auth_type": "bearer",
  "auth_config": {"header_name": "Authorization", "token_prefix": "Token "},
  "request_mapping": {
    "fields": [
      {"api_field": "transaction.phone",     "source_field": "purchase_phone_number", "data_type": "string"},
      {"api_field": "transaction.amount",    "source_field": "purchase_vendor_amount", "data_type": "float"},
      {"api_field": "transaction.country",   "source_field": "purchase_vendpro_country", "data_type": "string"},
      {"api_field": "transaction.reference", "source_field": "purchase_reference", "data_type": "string"}
    ]
  }
}
```

---

## ERRORES COMUNES Y SOLUCIONES <a name="errores"></a>

### Error: "No se encontró API Mapping para {vendor}/{group}/{operation}"

**Causa:** La combinación (vendor_code, api_group_code, operation_type) no existe en la BD, o `is_active = false`.

**Verificar:**
```sql
SELECT * FROM vendor_api_mappings
WHERE vendor_code = 'LATCOM'
  AND api_group_code = 'LC01T'
  AND operation_type = 'provision';
-- Si no retorna nada, el mapping no existe
```

### Error: Campo requerido 'X' no encontrado

**Causa:** En formato fields, un campo marcado como `required: true` no tiene valor en `source_data`.

**Verificar:** Que `source_field` esté correctamente escrito y que el vendor_product tenga ese campo populado.

### Error: JSON del request tiene campos incorrectos

**Causa:** `value_transformations` no aplicó o `request_mapping` tiene el source_field equivocado.

**Debugging:** Usar `POST /vendor-api-mappings/{id}/test` y examinar el `request_body` retornado.

### Error: success_indicators retorna False aunque el vendor respondió OK

**Causa:** El `success_field` o `success_values` no coincide exactamente con la respuesta del vendor.

**Verificar:** Examinar el JSON del vendor en `vendor_response` en la tabla purchases para ver el campo exacto que indica éxito.

```sql
SELECT vendor_response FROM purchases
WHERE vendor_request IS NOT NULL
ORDER BY purchase_date DESC LIMIT 1;
```

---

**FIN DEL DOCUMENTO 25**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 26 — Guía de Capacitación API Mappings*


---

# DOCUMENTO 26
## GUÍA DE CAPACITACIÓN — API MAPPINGS

**Versión:** 4.0
**Fecha:** Marzo 2026
**Audiencia:** Analistas de operaciones que configuran integraciones en el panel admin

---

El sistema de API Mappings permite integrar un nuevo vendor sin escribir código. Todo se configura en la tabla `vendor_api_mappings` desde el tab APIMappings del panel admin.

**Tiempo estimado:** 15-30 minutos por vendor, una vez que tienes la documentación del API del proveedor.

## PASOS EN EL PANEL ADMIN

### Paso 1: Crear el Vendor

Tab **Vendors** → "+ Nuevo Vendor"
- Ingresar código único (ej: LATCOM)
- URLs de UAT y Producción
- Credenciales (API Key, Customer ID, etc.)
- Guardar con `is_production = false`

### Paso 2: Cargar sus Productos

Tab **VendorProducts** → "+ Nuevo"
- Vendor: seleccionar el recién creado
- **API Group Code:** clave que vinculará este producto con el mapping (ej: LC01T)
- Llenar: vp_code, vp_skuid, operadora, país (alpha-3), moneda, monto
- Guardar

### Paso 3: Crear el Mapping

Tab **APIMappings** → "+ Nuevo"
- Mapping Code: 5 caracteres únicos (ej: LC01T)
- Vendor: el vendor creado
- API Group Code: el mismo del vendor_product (ej: LC01T)
- Operation Type: `provision`
- HTTP Method: POST
- Endpoint URL: `/api/v1/topup` (solo la ruta)
- Auth Type: según el vendor
- Completar request_mapping, transformations, response_mapping, success_indicators
- Guardar

### Paso 4: Vincular con el Catálogo

Tab **Products** → editar el producto comercial
- Vendor Code: el vendor
- VP Code + VP SKU ID: los del vendor_product

### Paso 5: Probar

Tab **APIMappings** → botón "Probar" en el mapping creado
- Ingresar datos de prueba
- Verificar el request generado
- Verificar la respuesta del vendor
- Verificar que success_indicators detecta correctamente el éxito

---

## TABLA DE REFERENCIA RÁPIDA

| Tipo de auth | Campos en auth_config |
|-------------|----------------------|
| apikey | api_key_header, customer_id_header, token_source, customer_id_source |
| bearer | header_name, token_prefix |
| basic | (vacío — usa vendor_username + vendor_password) |
| none | (vacío) |

---

**FIN DEL DOCUMENTO 26**

*Versión: 4.0 | Fecha: Marzo 2026*
*Continúa en: DOC 27 — Configuración del Sistema*


---

# DOCUMENTO 08
## BACKEND — SISTEMA DE API MAPPINGS SIN CÓDIGO

**Versión:** 4.2
**Fecha:** Abril 2026
**Sistema:** Latconecta v2.0.0
**Archivos clave:** `vendor_api_mapper.py`, `universal_vendor_service.py`

---

## CONTENIDO

1. [Visión General](#vision)
2. [Arquitectura Completa](#arquitectura)
3. [VendorAPIMapper](#mapper)
4. [UniversalVendorService](#universal)
5. [Autenticación con Vendors](#auth)
6. [Transformaciones de Valores](#transformaciones)
7. [Valores Dinámicos en request_mapping](#dinamicos)
8. [Configuración en BD](#configuracion)
9. [Vendors Activos — LATCOM y MEGAPUNTO](#vendors-activos)
10. [Agregar Nuevo Vendor](#agregar-vendor)
11. [Ejemplo Completo LATCOM](#ejemplo-latcom)
12. [Ejemplo Completo MEGAPUNTO/TISI — Provisión](#ejemplo-megapunto)
13. [Ejemplo Completo MEGAPUNTO/TISI — Catalog Sync](#ejemplo-catalog-sync)

---

## VISIÓN GENERAL <a name="vision"></a>

### Problema que Resuelve

| Aspecto | Sin API Mappings | Con API Mappings |
|---------|-----------------|-----------------|
| Tiempo de integración | 2–4 semanas | 15–30 minutos |
| Código nuevo por vendor | 200+ líneas Python | 0 líneas |
| Requiere deploy | Sí | No (solo SQL) |
| Conocimiento necesario | Python + FastAPI | Solo SQL |
| Mantenimiento | Código separado por vendor | Configuración centralizada |

### Concepto Clave

El motor de API Mappings es un **transformador universal** configurado en BD. Para cada combinación `(vendor_code, api_group_code, operation_type)` existe un registro en `vendor_api_mappings` que describe:

- **Dónde llamar:** `http_method` + `endpoint_url`
- **Cómo autenticarse:** `auth_type` + `auth_config`
- **Qué enviar:** `request_mapping` (Purchase → Vendor)
- **Cómo transformar valores:** `value_transformations`
- **Qué extraer de la respuesta:** `response_mapping` (Vendor → Purchase)
- **Cuándo es éxito:** `success_indicators`

---

## ARQUITECTURA COMPLETA <a name="arquitectura"></a>

```
purchases.py (router)
    │
    │ Determina: vendor_code + api_group_code + operation_type
    │ (de vendor_product.api_group_code)
    ▼
UniversalVendorService.execute_vendor_request(
    vendor_code, api_group_code, operation_type, source_data
)
    │
    ├─ 1. Consulta BD: SELECT * FROM vendor_api_mappings
    │       WHERE vendor_code = 'MEGAPUNTO'
    │         AND api_group_code = 'MP01T'
    │         AND operation_type = 'provision'
    │         AND is_active = true
    │
    ├─ 2. Consulta BD: SELECT * FROM vendors WHERE vendor_code = 'MEGAPUNTO'
    │       + token_manager.get_token('MEGAPUNTO') → JWT Bearer activo
    │
    ├─ 3. VendorAPIMapper.build_request(source_data)
    │       Detecta formato: fields array (legado) o JSONPath (nuevo)
    │       Resuelve valores dinámicos: dynamic:current_timestamp_tisi
    │       Resuelve constantes: constant:0000037
    │       Aplica value_transformations
    │       Preserva orden (OrderedDict)
    │       → request JSON listo para enviar
    │
    ├─ 4. Construye headers según auth_type:
    │       api_key_header → x-api-key + extra_headers (LATCOM)
    │       bearer         → Authorization: Bearer {token_dinamico} (MEGAPUNTO)
    │       basic          → Authorization: Basic {b64}
    │
    ├─ 5. httpx.post(vendor_url + endpoint_url, json=request, headers=headers)
    │       Si VENDOR_SIMULATOR_ENABLED=True  → localhost:5001 (desarrollo)
    │       Si VENDOR_SIMULATOR_ENABLED=False → vendor real (UAT/Prod)
    │
    ├─ 6. VendorAPIMapper.parse_response(response_data)
    │       response_mapping extrae campos del JSON del vendor
    │
    ├─ 7. VendorAPIMapper.is_success_response(http_status, response_data)
    │       Verifica success_indicators
    │
    └─ 8. Retorna resultado para grabar en purchases
```

---

## VENDORAPIMAPPER <a name="mapper"></a>

**Archivo:** `services/vendor_api_mapper.py`

### build_request(source_data) → dict

Construye el JSON a enviar al vendor. Detecta automáticamente el formato del `request_mapping`:

**Formato fields (legado — LATCOM):**
```json
{
  "fields": [
    { "api_field": "carrier", "source_field": "purchase_vendpro_operator", "data_type": "string" },
    { "api_field": "phone",   "source_field": "purchase_phone_number",     "data_type": "string" },
    { "api_field": "amount",  "source_field": "purchase_vendor_amount",    "data_type": "integer" },
    { "api_field": "country", "source_field": "purchase_vendpro_country",  "data_type": "string" },
    { "api_field": "sku",     "source_field": "purchase_vendor_skuid",     "data_type": "string" }
  ]
}
```

**Formato JSONPath (nuevo — MEGAPUNTO y otros):**
```json
{
  "clave":                      "constant:",
  "fecha_envio":                "dynamic:current_timestamp_tisi",
  "codigo_distribuidor":        "constant:0000037",
  "codigo_comercio":            "constant:0001",
  "nombre_comercio":            "constant:Latconecta",
  "id_producto":                "purchase_vendor_skuid",
  "numero":                     "purchase_phone_number",
  "importe":                    "purchase_vendor_amount",
  "nro_transaccion_referencia": "purchase_reference",
  "ubigeo":                     "constant:150101"
}
```

Ambos formatos soportan:
- **Constantes:** `"constant:USD"` → el valor siempre es el texto después de los dos puntos
- **Constante vacía:** `"constant:"` → envía string vacío `""`
- **Valores dinámicos:** `"dynamic:current_timestamp_tisi"` → genera timestamp en tiempo real
- **Campos anidados en destino:** `"api_field": "recipient.phone"` → `{"recipient": {"phone": ...}}`
- **Orden preservado:** usa `OrderedDict`

### parse_response(vendor_response) → dict

```json
// response_mapping MEGAPUNTO en BD:
{
  "nro_transaccion": "vendor_trans_id"
}

// MEGAPUNTO responde:
{"codigo": "00", "mensaje": "Operación exitosa...", "nro_transaccion": "8102"}

// parse_response retorna:
{"vendor_trans_id": "8102"}
```

### is_success_response(status_code, response_data) → bool

```json
// success_indicators MEGAPUNTO en BD:
{
  "status_codes": [200],
  "success_field": "codigo",
  "success_values": ["00"]
}

// success_indicators LATCOM en BD:
{
  "status_codes": [200],
  "success_field": "success",
  "success_values": [true, "true", "SUCCESS", "COMPLETED"]
}
```

---

## UNIVERSALVENDORSERVICE <a name="universal"></a>

**Archivo:** `services/universal_vendor_service.py`

### get_vendor_info(vendor_code) → dict

Obtiene credenciales del vendor desde BD e incluye el token Bearer dinámico del `token_manager`:

```python
async def get_vendor_info(self, vendor_code: str) -> dict:
    # Consulta BD
    row = await db.execute("SELECT vendor_url_uat, vendor_url_prod, 
                            vendor_api_key, vendor_username, ... FROM vendors ...")
    
    # Obtiene token Bearer dinámico del cache (para MEGAPUNTO)
    access_token = await token_manager.get_token(vendor_code)
    
    return {
        "base_url": row.vendor_url_prod if row.is_production else row.vendor_url_uat,
        "api_key":      row.vendor_api_key,     # Para LATCOM (api_key_header)
        "access_token": access_token,            # Para MEGAPUNTO (bearer dinámico)
        "username":     row.vendor_username,     # Para extra_headers LATCOM
        "password":     row.vendor_password,
        "is_production": row.is_production
    }
```

### _build_headers(auth_type, auth_config, vendor_info) → dict

Construye los headers HTTP según el tipo de autenticación:

```python
def _build_headers(self, auth_type, auth_config, vendor_info, additional_headers={}):
    headers = {"Content-Type": "application/json", **additional_headers}
    
    if auth_type == 'bearer':
        # MEGAPUNTO — token dinámico del token_manager
        header_name  = auth_config.get('header_name', 'Authorization')
        token_prefix = auth_config.get('token_prefix', 'Bearer ')
        access_token = vendor_info.get('access_token')  # JWT del token_manager
        headers[header_name] = f"{token_prefix}{access_token or ''}"
    
    elif auth_type == 'api_key_header':
        # LATCOM — API key estática de BD
        header_name = auth_config.get('header_name', 'X-API-Key')
        headers[header_name] = vendor_info.get('api_key') or ''  # Protegido contra None
        extra_headers = auth_config.get('extra_headers', {})
        for key, value in extra_headers.items():
            if value == '{vendor_username}':
                value = vendor_info.get('username') or ''   # Protegido contra None
            elif value == '{vendor_api_key}':
                value = vendor_info.get('api_key') or ''
            headers[key] = value
    
    elif auth_type == 'basic':
        credentials = f"{vendor_info['username']}:{vendor_info['password']}"
        encoded = base64.b64encode(credentials.encode()).decode()
        headers['Authorization'] = f"Basic {encoded}"
    
    return headers
```

**Nota importante:** La protección `or ''` en `api_key_header` es crítica. Si `vendor_api_key` o `vendor_username` son NULL en BD, Python lanzaría `TypeError: Header value must be str or bytes, not NoneType`. La protección convierte cualquier valor falsy (None, '', 0) a string vacío.

---

## AUTENTICACIÓN CON VENDORS <a name="auth"></a>

### Comparativa LATCOM vs MEGAPUNTO

| Aspecto | LATCOM | MEGAPUNTO/TISI |
|---------|--------|----------------|
| `auth_type` en BD | `api_key_header` | `bearer` |
| Tipo de credencial | API Key estática permanente | JWT Bearer con expiración |
| Vida de la credencial | Permanente (no expira) | 10 minutos |
| Login requerido al startup | No | Sí (POST /Auth/token) |
| Header generado | `x-api-key` + `x-customer-id` | `Authorization: Bearer eyJ...` |
| Token guardado en | BD (`vendor_api_key`) | `token_manager` (memoria) |
| Renovación automática | No aplica | Scheduler cada 5 min |

### auth_config LATCOM

```json
{
  "header_name": "x-api-key",
  "extra_headers": {
    "x-customer-id": "{vendor_username}"
  }
}
```

Headers generados:
```
x-api-key: latcom_peru_mli4fpwc_xx62baa0
x-customer-id: LATCONECTA_001
```

### auth_config MEGAPUNTO

```json
{
  "header_name": "Authorization",
  "token_prefix": "Bearer "
}
```

Headers generados:
```
Authorization: Bearer eyJhbGciOiJodHRwOi8vd3d3...
```

El token se obtiene de `token_manager.get_token("MEGAPUNTO")` — es el JWT activo obtenido en el último login exitoso.

---

## TRANSFORMACIONES DE VALORES <a name="transformaciones"></a>

Las transformaciones se configuran en `value_transformations` (JSONB). La clave es el `source_field` sobre el que aplican.

### Catálogo Completo

| Transformación | Config | Input | Output |
|----------------|--------|-------|--------|
| `trim` | `"trim": true` | `" 987654321 "` | `"987654321"` |
| `to_upper` | `"to_upper": true` | `"bitel"` | `"BITEL"` |
| `to_lower` | `"to_lower": true` | `"BITEL"` | `"bitel"` |
| `to_float` | `"to_float": true` | `"20"` | `20.0` |
| `to_integer` | `"to_integer": true` | `"20.5"` | `20` |
| `to_string` | `"to_string": true` | `20.0` | `"20.0"` |
| `format` | `"format": "%.2f"` | `20` | `"20.00"` |
| `to_string` + `format` | ambos | `3.0` | `"3.00"` |
| `remove_spaces` | `"remove_spaces": true` | `"999 888 777"` | `"999888777"` |
| `add_prefix` | `"add_prefix": "51"` | `"987654321"` | `"51987654321"` |
| `remove_prefix` | `"remove_prefix": "51"` | `"51987654321"` | `"987654321"` |
| `map_value` | `"map_value": {"bitel": "BIT"}` | `"bitel"` | `"BIT"` |
| `country_alpha3_to_alpha2` | `"country_alpha3_to_alpha2": true` | `"PER"` | `"PE"` |

### Transformación MEGAPUNTO — formato importe

TISI requiere el campo `importe` como string con exactamente 2 decimales (`"29.80"`, no `"29.8"`):

```json
{
  "purchase_phone_number":  {"trim": true},
  "purchase_vendor_amount": {"to_string": true, "format": "%.2f"}
}
```

El orden de aplicación es: `format` primero (convierte `29.8` → `"29.80"`), luego `to_string` (no cambia nada, ya es string).

---

## VALORES DINÁMICOS EN request_mapping <a name="dinamicos"></a>

Algunos vendors requieren campos que no provienen del purchase ni del vendor_product, sino que deben generarse en el momento exacto de cada request. Estos se configuran con el prefijo `dynamic:` en el `request_mapping`.

### dynamic:current_timestamp_tisi

Genera un timestamp en el formato especial requerido por TISI: `yyyyMMddHHmmssmss` (año, mes, día, hora, minuto, segundo, milisegundos con 3 dígitos).

**Configuración en BD:**
```json
{
  "fecha_envio": "dynamic:current_timestamp_tisi"
}
```

**Valor generado en tiempo real:**
```
"20260416013523368"
  ↑    ↑  ↑  ↑  ↑
  año  mes día hora min seg ms
```

**Implementación en vendor_api_mapper.py:**
```python
if source_field.startswith('dynamic:'):
    dynamic_type = source_field[8:]  # elimina "dynamic:"
    if dynamic_type == 'current_timestamp_tisi':
        now = datetime.now()
        value = now.strftime('%Y%m%d%H%M%S') + f"{now.microsecond // 1000:03d}"
```

### constant: (valores fijos)

Para campos que siempre tienen el mismo valor independientemente de la transacción:

```json
{
  "clave":               "constant:",        → ""
  "ubigeo":              "constant:150101",  → "150101"
  "codigo_distribuidor": "constant:0000037", → "0000037"
  "codigo_comercio":     "constant:0001",    → "0001"
  "nombre_comercio":     "constant:Latconecta" → "Latconecta"
}
```

---

## CONFIGURACIÓN EN BD <a name="configuracion"></a>

### Mappings Activos

| mapping_code | vendor_code | api_group_code | operation_type | Descripción |
|-------------|------------|----------------|----------------|-------------|
| LC01T | LATCOM | 001 | provision | TopUps Perú + México (legado) |
| LC02B | LATCOM | 002 | provision | Bill Payment (inactivo) |
| LC03M | LATCOM | 003 | provision | TopUps México + Paquetes |
| MP01T | MEGAPUNTO | MP01T | provision | Recargas Perú + Venezuela |
| MP02S | MEGAPUNTO | MP02S | catalog_sync | Sincronización catálogo Venezuela |

**Nota:** Los `api_group_code` de LATCOM son numéricos (`001`, `002`, `003`) — todos los vendor_products de LATCOM usan estos códigos. El mapping `MP01T` de MEGAPUNTO usa código alfanumérico consistente con la nomenclatura del sistema.

---

## VENDORS ACTIVOS — LATCOM Y MEGAPUNTO <a name="vendors-activos"></a>

### LATCOM

| Campo | Valor |
|-------|-------|
| vendor_code | LATCOM |
| vendor_url_uat | https://latcom-fix-production.up.railway.app |
| vendor_api_key | latcom_peru_mli4fpwc_xx62baa0 |
| vendor_user_uid | LATCONECTA_001 |
| vendor_username | LATCONECTA_001 |
| auth_type | api_key_header |
| is_production | false |
| Países activos | México (MEX), Perú (PER) |
| Operadoras México | MOVISTAR, TELCEL, ATT |
| Operadoras Perú | Bitel, Entel, Claro, Movistar |

### MEGAPUNTO / TISI

| Campo | Valor |
|-------|-------|
| vendor_code | MEGAPUNTO |
| vendor_url_uat | https://api-hub-qa-in.tisi.com.pe/ |
| vendor_username | LA2410 |
| vendor_password | (en BD) |
| codigo_distribuidor | 0000037 |
| auth_type | bearer (token dinámico) |
| is_production | false |
| Países activos | Perú (PER), Venezuela (VEN) |
| Operadoras Perú | Bitel (66), Entel (67), Claro (70), Movistar (907) |
| Operadoras Venezuela | Movistar Celular (5580), Movistar Fijo (5581), Movilnet (5582), Digitel (5583) |

### Vendor Products MEGAPUNTO — Perú

Los vendor_products de Perú usan el modelo de **rango** — un único VP por operadora, `vp_amount = NULL`, el monto lo define el producto comercial:

| vp_code | vp_skuid | Operadora | vp_amount_type | vp_amount |
|---------|---------|-----------|---------------|-----------|
| MP_BITEL | 66 | bitel | range | NULL |
| MP_ENTEL | 67 | entel | range | NULL |
| MP_CLARO | 70 | claro | range | NULL |
| MP_MOVISTAR_PER | 907 | movistar | range | NULL |

### Vendor Products MEGAPUNTO — Venezuela

Los vendor_products de Venezuela usan el modelo **N→N** — un VP por denominación, `vp_amount` = precio exacto en Soles:

| vp_code | vp_skuid | Operadora | Bs. | S/. |
|---------|---------|-----------|-----|-----|
| MP_MOVCELL_500 | 5580 | movistar | 500 | 4.58 |
| MP_MOVCELL_1000 | 5580 | movistar | 1000 | 9.17 |
| MP_MOVCELL_1500 | 5580 | movistar | 1500 | 13.75 |
| MP_MOVCELL_2250 | 5580 | movistar | 2250 | 20.63 |
| MP_MOVCELL_2750 | 5580 | movistar | 2750 | 25.22 |
| MP_MOVCELL_3250 | 5580 | movistar | 3250 | 29.80 |
| MP_MOVFIJO_500 | 5581 | movistar_fijo | 500 | 4.58 |
| MP_MOVFIJO_1000 | 5581 | movistar_fijo | 1000 | 9.17 |
| MP_MOVFIJO_3500 | 5581 | movistar_fijo | 3500 | 32.09 |
| MP_MOVFIJO_6750 | 5581 | movistar_fijo | 6750 | 61.89 |
| MP_MOVFIJO_10000 | 5581 | movistar_fijo | 10000 | 91.69 |
| MP_MOVILNET_640 | 5582 | movilnet | 640 | 5.87 |
| MP_MOVILNET_1120 | 5582 | movilnet | 1120 | 10.27 |
| MP_MOVILNET_1600 | 5582 | movilnet | 1600 | 14.67 |
| MP_MOVILNET_2560 | 5582 | movilnet | 2560 | 23.47 |
| MP_MOVILNET_5440 | 5582 | movilnet | 5440 | 49.88 |
| MP_DIGITEL_600 | 5583 | digitel | 600 | 5.50 |
| MP_DIGITEL_1200 | 5583 | digitel | 1200 | 11.00 |
| MP_DIGITEL_2100 | 5583 | digitel | 2100 | 19.26 |
| MP_DIGITEL_2700 | 5583 | digitel | 2700 | 24.76 |
| MP_DIGITEL_3000 | 5583 | digitel | 3000 | 27.51 |
| MP_DIGITEL_3900 | 5583 | digitel | 3900 | 35.76 |

**Por qué dos modelos distintos (Perú vs Venezuela):**

- **Perú (rango):** TISI acepta cualquier monto dentro de un rango para cada operadora. Un solo VP cubre múltiples productos comerciales (S/5, S/10, S/15...). El `vp_amount=NULL` indica al calculador que use `product_base_price` como monto a enviar.
- **Venezuela (N→N fijo):** TISI tiene denominaciones fijas preestablecidas en Bolívares con precios exactos en Soles. Cada denominación es un VP independiente con su `vp_amount` exacto. El tipo de cambio referencial es 109.06 Bs/Sol.

---

## AGREGAR NUEVO VENDOR <a name="agregar-vendor"></a>

### Con autenticación api_key_header (como LATCOM)

Solo configuración en BD, sin código nuevo:

```sql
-- 1. Registrar vendor
INSERT INTO vendors (vendor_code, vendor_name, vendor_url_uat,
    vendor_api_key, vendor_user_uid, vendor_username, vendor_status)
VALUES ('NUEVO', 'Nuevo Vendor', 'https://api.nuevo.com',
    'api_key_aqui', 'customer_id', 'customer_id', 'active');

-- 2. Crear mapping
INSERT INTO vendor_api_mappings (mapping_code, vendor_code, api_group_code,
    operation_type, http_method, endpoint_url, auth_type, auth_config,
    request_mapping, response_mapping, success_indicators, is_active)
VALUES ('NV01T', 'NUEVO', 'NV01T', 'provision', 'POST', '/recharge',
    'api_key_header',
    '{"header_name": "x-api-key", "extra_headers": {"x-customer-id": "{vendor_username}"}}',
    '{"phone": "purchase_phone_number", "amount": "purchase_vendor_amount", ...}',
    '{"transaction_id": "vendor_trans_id"}',
    '{"status_codes": [200], "success_field": "success", "success_values": [true]}',
    true);
```

### Con autenticación bearer dinámica (como MEGAPUNTO)

Requiere agregar un método en `vendor_login_service.py` (20 líneas):

```python
# En vendor_login_service.py:
async def execute_login(self, vendor):
    if vendor.vendor_code == "NUEVO_BEARER":
        return await self._login_nuevo_bearer(vendor)
    ...

async def _login_nuevo_bearer(self, vendor):
    url = f"{vendor.vendor_url_uat}/auth/token"
    response = await httpx.AsyncClient().post(url, json={
        "client_id": vendor.vendor_username,
        "client_secret": vendor.vendor_password
    })
    token = response.json()["access_token"]
    expires_in = response.json().get("expires_in", 3600)
    return {"success": True, "access_token": token, "expires_in": expires_in - 60}
```

Luego la configuración en BD es idéntica al ejemplo anterior, con `auth_type = 'bearer'` y el `auth_config` correspondiente.

---

## EJEMPLO COMPLETO LATCOM <a name="ejemplo-latcom"></a>

**Producto:** Recarga MOVISTAR México 300 MXN

**source_data:**
```python
{
    "purchase_phone_number": "5511921174",
    "purchase_vendor_amount": 300.0,
    "purchase_reference": "REF-20260415153553",
    "purchase_vendpro_operator": "MOVISTAR",
    "purchase_vendpro_country": "MEX",
    "purchase_vendor_skuid": "10300TC109"
}
```

**request_mapping (fields format):**
```json
{"fields": [
  {"api_field": "carrier", "source_field": "purchase_vendpro_operator"},
  {"api_field": "phone",   "source_field": "purchase_phone_number"},
  {"api_field": "amount",  "source_field": "purchase_vendor_amount", "data_type": "integer"},
  {"api_field": "country", "source_field": "purchase_vendpro_country"},
  {"api_field": "reference","source_field": "purchase_reference"},
  {"api_field": "sku",     "source_field": "purchase_vendor_skuid"}
]}
```

**value_transformations:**
```json
{
  "purchase_vendpro_country": {"country_alpha3_to_alpha2": true},
  "purchase_phone_number": {"trim": true}
}
```

**Request generado:**
```json
{
  "carrier": "MOVISTAR",
  "phone": "5511921174",
  "amount": 300,
  "country": "MX",
  "reference": "REF-20260415153553",
  "sku": "10300TC109"
}
```

**Headers:**
```
x-api-key: latcom_peru_mli4fpwc_xx62baa0
x-customer-id: LATCONECTA_001
```

**Response LATCOM (exitosa):**
```json
{
  "success": true,
  "transaction_id": "VIA-20260415-6437",
  "authorization_code": "188970298707",
  "status": "SUCCESS",
  "amount": 300,
  "currency": "MXN",
  "balance_after": 9050,
  "provider": "altamira",
  "message": "Recarga exitosa"
}
```

---

## EJEMPLO COMPLETO MEGAPUNTO/TISI — PROVISIÓN <a name="ejemplo-megapunto"></a>

**Producto:** MOVISTAR Celular Venezuela 3250 Bs / S/29.80

**source_data:**
```python
{
    "purchase_phone_number": "04241403958",
    "purchase_vendor_amount": 29.80,          # = vp_amount del vendor_product
    "purchase_reference": "REF-20260416013523",
    "purchase_vendpro_operator": "movistar",
    "purchase_vendpro_country": "VEN",
    "purchase_vendor_skuid": "5580"
}
```

**request_mapping (JSONPath format con constantes y dinámico):**
```json
{
  "clave":                      "constant:",
  "fecha_envio":                "dynamic:current_timestamp_tisi",
  "codigo_distribuidor":        "constant:0000037",
  "codigo_comercio":            "constant:0001",
  "nombre_comercio":            "constant:Latconecta",
  "id_producto":                "purchase_vendor_skuid",
  "numero":                     "purchase_phone_number",
  "importe":                    "purchase_vendor_amount",
  "nro_transaccion_referencia": "purchase_reference",
  "ubigeo":                     "constant:150101"
}
```

**value_transformations:**
```json
{
  "purchase_phone_number":  {"trim": true},
  "purchase_vendor_amount": {"to_string": true, "format": "%.2f"}
}
```

**Request generado:**
```json
{
  "clave": "",
  "fecha_envio": "20260416013523368",
  "codigo_distribuidor": "0000037",
  "codigo_comercio": "0001",
  "nombre_comercio": "Latconecta",
  "id_producto": "5580",
  "numero": "04241403958",
  "importe": "29.80",
  "nro_transaccion_referencia": "REF-20260416013523",
  "ubigeo": "150101"
}
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJodHRwOi8v...  (JWT activo del token_manager)
```

**Response TISI (exitosa):**
```json
{
  "codigo": "00",
  "mensaje": "Operación exitosa, la recarga se hará efectiva en unos segundos.",
  "nro_transaccion": "8102"
}
```

**success_indicators MEGAPUNTO:**
```json
{
  "status_codes": [200],
  "success_field": "codigo",
  "success_values": ["00"]
}
```

**response_mapping MEGAPUNTO:**
```json
{
  "nro_transaccion": "vendor_trans_id"
}
```

**Resultado final en purchase:**
```python
purchase.vendor_trans_id = "8102"
purchase.purchase_status = "Success"
purchase.vendor_request  = '{"clave":"","fecha_envio":"20260416013523368",...}'
purchase.vendor_response = '{"codigo":"00","nro_transaccion":"8102",...}'
```

---

**FIN DEL DOCUMENTO 08**

*Versión: 4.1 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Cambios v4.1: Sección nueva §7 Valores Dinámicos, §9 Vendors Activos con tablas completas LATCOM/MEGAPUNTO, §12 Ejemplo MEGAPUNTO completo, actualización §5 Autenticación con comparativa LATCOM vs MEGAPUNTO, corrección _build_headers con protección None*
*Continúa en: DOC 09 — Backend: Sistema de Control de Operaciones (Fase 1 / Fase 2)*

## EJEMPLO COMPLETO MEGAPUNTO/TISI — CATALOG SYNC <a name="ejemplo-catalog-sync"></a>

Este segundo ejemplo con MEGAPUNTO demuestra cómo el motor de API Mappings, diseñado originalmente para provisiones, se extiende para sincronización de catálogo sin código adicional específico por vendor. Solo se agrega un mapping nuevo en BD con `operation_type = 'catalog_sync'`.

**Mapping MP02S en BD:**
```json
{
  "mapping_code":    "MP02S",
  "vendor_code":     "MEGAPUNTO",
  "operation_type":  "catalog_sync",
  "endpoint_url":    "/Producto/sel",
  "auth_type":       "bearer",
  "request_mapping": {"codigo_distribuidor": "constant:0000037", "id_tipo_producto": "constant:3"},
  "response_mapping": {
    "array_path": null,
    "skuid_field": "id_producto",
    "nested_prices_array": "precios",
    "price_pen_field": "precio",
    "price_ref_field": "precio_referencial",
    "exchange_rate_field": "tipo_cambio"
  },
  "success_indicators": {"status_codes": [200]}
}
```

**Nota sobre `array_path: null`:** TISI retorna un array en la raíz del response. El valor `null` indica al motor que la respuesta completa es el array a iterar — no está dentro de ningún campo contenedor.

**Clave de matching Venezuela — (vp_skuid, precio_referencial_bs):**

El `precio_referencial` en Bolívares es el identificador inmutable de cada denominación. El precio en Soles cambia con el tipo de cambio diario; los Bolívares no cambian nunca.

```python
clave = (str(id_producto), str(precio_referencial))  # ej: ("5580", "500.00")
vp_row = bd_by_key.get(clave)  # busca en vendor_products
```

**5 estados del reporte post-sync:**

| Estado | Significado | Acción |
|--------|-------------|--------|
| `ACTUALIZADO` | Precio cambió ≤10% | UPDATE vendor_products + products |
| `ALERTA` | Precio cambió >10% | UPDATE vendor_products + products |
| `SIN_CAMBIO` | Precio idéntico | Ninguna |
| `NUEVO` | Denominación no activada en Latconecta | Ninguna (informativo) |
| `NO_VINO` | En BD pero TISI no la retornó | Ninguna (candidato a revisar) |

**Diferencias clave Provisión vs Catalog Sync:**

| Aspecto | Provisión (MP01T) | Catalog Sync (MP02S) |
|---------|------------------|----------------------|
| `operation_type` | `provision` | `catalog_sync` |
| Llamado por | Compra de usuario | Admin manual o scheduler |
| `source_data` | Datos del purchase | Vacío `{}` |
| Resultado | Graba en `purchases` | Actualiza `vendor_products` + `products` |
| Log | En `purchases` | En `vendor_sync_logs` |
| `success_indicators` | HTTP 200 + `"codigo":"00"` | Solo HTTP 200 (respuesta es array) |

---

**FIN DEL DOCUMENTO 08**

*Versión: 4.2 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Cambios v4.2: MP02S agregado a tabla de mappings, sección §13 Ejemplo Catalog Sync como segundo ejemplo de implementación MEGAPUNTO, fallback de token documentado en get_vendor_info*
*Continúa en: DOC 09 — Backend: Sistema de Control de Operaciones (Fase 1 / Fase 2)*
