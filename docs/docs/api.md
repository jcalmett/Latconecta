# APIs Externas — Latconecta v2.0.0

**Documento técnico interno | Latcom Horizons II, LLC | Junio 2026**

---

## Tabla de Contenidos

1. [Visión General](#1-vision-general)
2. [MEGAPUNTO / TISI — Perú y Venezuela](#2-megapunto--tisi--peru-y-venezuela)
3. [LATCOM / VIAONE — México](#3-latcom--viaone--mexico)
4. [Números de Prueba por Vendor](#4-numeros-de-prueba-por-vendor)
5. [Tarjetas de Prueba Culqi](#5-tarjetas-de-prueba-culqi)
6. [Estado de Pruebas](#6-estado-de-pruebas)

---

## 1. Visión General

Latconecta integra dos vendors externos para la provisión de TopUps:

| Vendor | Plataforma técnica | Países | Autenticación |
|--------|-------------------|--------|---------------|
| MEGAPUNTO | TISI API Hub v19 | Perú, Venezuela | Bearer Token dinámico |
| LATCOM | Relier (VIAONE) | México | Dual header: `x-customer-id` + `x-api-key` |

Ambos vendors están integrados a través del motor genérico `UniversalVendorService` + `VendorAPIMapper`. No existe código Python específico por vendor — todo se configura en la tabla `vendor_api_mappings` de la BD.

---

## 2. MEGAPUNTO / TISI — Perú y Venezuela

### 2.1 Credenciales QA

| Parámetro | Valor |
|-----------|-------|
| Ambiente | QA |
| Distribuidor | LATCOM |
| `codigo_distribuidor` | `0000037` |
| `API_URL` | `https://api-hub-qa-in.tisi.com.pe/` |
| `API_userName` | `LA2410` |
| `API_password` | `A0b08Mh58F1K09` |

> Las credenciales de producción se coordinarán con soporte MEGAPUNTO/TISI cuando se requieran.

### 2.2 Autenticación — Generar Token

El token es dinámico — se genera al inicio del sistema (startup) y se renueva automáticamente.

```
POST {API_URL}/Auth/token
Content-Type: application/json

{
  "userName": "LA2410",
  "password": "A0b08Mh58F1K09"
}
```

**Response:**
```json
{
  "token": "cadena_del_token"
}
```

El token se almacena en `vendor_access_token` de la tabla `vendors` y se envía como `Authorization: Bearer {token}` en todas las llamadas posteriores.

### 2.3 Endpoints de Recargas (TopUps)

#### Listar Productos disponibles

```
POST {API_URL}/Recarga/listar
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo_distribuidor": "0000037"
}
```

**Response:**
```json
[
  {
    "id_producto": 1,
    "nombre_producto": "Producto Nacional",
    "pais_destino": "Peru",
    "precio_variable": "SI",
    "precios": [...],
    "campos_referencia": [
      { "id": "001", "descripcion": "Celular", "tipo": "NUMERICO",
        "longitud_maxima": "9", "obligatorio": "SI" }
    ]
  }
]
```

**SKUIDs relevantes para Latconecta:**

| Operadora | País | skuid |
|-----------|------|-------|
| Bitel | Perú | 66 |
| Entel | Perú | 67 |
| Claro | Perú | 70 |
| Movistar | Perú | 907 |
| Movistar Celular | Venezuela | 5580 |
| Movistar Fijo | Venezuela | 5581 |
| Movilnet | Venezuela | 5582 |
| Digitel | Venezuela | 5583 |

#### Realizar Venta de Recarga

```
POST {API_URL}/Recarga/procesar
Authorization: Bearer {token}
Content-Type: application/json

{
  "clave": "<clave_generada>",
  "fecha_envio": "20260203145700000",
  "codigo_distribuidor": "0000037",
  "codigo_comercio": "0001",
  "nombre_comercio": "Latconecta",
  "id_producto": "66",
  "numero": "998877543",
  "importe": "5",
  "nro_transaccion_referencia": "REF-UNICO-001",
  "ubigeo": "150101"
}
```

> **Nota:** `fecha_envio` formato `yyyyMMddHHmmssmss`. `clave` se genera con el proyecto de encriptación TISI usando: `fecha_envio`, `codigo_distribuidor`, `codigo_comercio`, `id_producto`.

**Response exitosa:**
```json
{
  "codigo": "00",
  "mensaje": "Operación exitosa, la recarga se hará efectiva en unos segundos.",
  "nro_transaccion": "7983"
}
```

#### Consultar Estado de Transacción

```
POST {API_URL}/Recarga/consultar
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo_distribuidor": "0000037",
  "nro_transaccion_referencia": "REF-UNICO-001"
}
```

### 2.4 Códigos de Respuesta TISI

**Generales:**

| Código | Mensaje |
|--------|---------|
| 00 | Transacción procesada correctamente |
| 01 | El código de distribuidor no existe |
| 95 | No cuenta con saldo suficiente |
| 97 | Datos incorrectos |
| 98 | La clave de seguridad es incorrecta |
| 99 | Hubo un error al procesar la transacción — reintentar en unos minutos |

**Recargas:**

| Código | Mensaje |
|--------|---------|
| 20 | El número de teléfono es inválido |
| 30 | El número del cliente debe ser numérico |
| 80 | La recarga no ha sido procesada — verificar operador e importe |
| 82 | El monto de la recarga no es válido |
| 85 | El número de la recarga no es válido |

> **Nota sobre código 99 en QA:** Los códigos 99 recibidos con Entel y Claro en el ambiente QA son limitaciones del ambiente de pruebas de TISI, no errores del sistema. Se envió informe a TISI solicitando números oficiales — pendiente respuesta.

### 2.5 Sincronización de Catálogo

Latconecta sincroniza automáticamente los precios de productos Venezuela desde TISI via el endpoint `catalog_sync` en el `vendor_api_mappings`.

**Sync manual desde admin:**
```
Admin → tab Vendors → botón 🔃 en MEGAPUNTO → Ejecutar Sincronización
```

**Sync manual desde servidor:**
```bash
TOKEN=$(curl -s -X POST http://localhost:8100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jorge.calmett@gmail.com","password":"PASSWORD"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -s -X POST http://localhost:8100/api/v1/vendors/MEGAPUNTO/sync-catalog \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

## 3. LATCOM / VIAONE — México

### 3.1 Credenciales

| Parámetro | Valor |
|-----------|-------|
| Base URL UAT | `https://latcom-fix-production.up.railway.app` |
| `x-customer-id` | `LATCONECTA_001` |
| `x-api-key` | Coordinar con Richard Mas — `jcalmett@latcom.co` |

> La URL UAT tiene "production" en su dominio por razones históricas del despliegue del proveedor — no indica que sea producción real.

### 3.2 Autenticación

LATCOM usa dual header en todas las llamadas — no requiere generación de token previo:

```
x-customer-id: LATCONECTA_001
x-api-key: {api_key}
```

### 3.3 Endpoints

#### Consulta de Saldo

```
GET {BASE_URL}/api/v1/balance
x-customer-id: LATCONECTA_001
x-api-key: {api_key}
```

#### Procesar TopUp

```
POST {BASE_URL}/api/v1/topup
Content-Type: application/json
x-customer-id: LATCONECTA_001
x-api-key: {api_key}

{
  "carrier": "BITEL",
  "phone": "945678901",
  "amount": 10,
  "country": "PE",
  "reference": "PE-TEST-001"
}
```

#### Consultar Estado de Transacción

```
GET {BASE_URL}/api/v1/transaction/{id}
x-customer-id: LATCONECTA_001
x-api-key: {api_key}
```

### 3.4 Operadoras México disponibles

| Operadora | Código | Montos validados |
|-----------|--------|-----------------|
| TELCEL | TELCEL | 80, 300, 500 MXN |
| ATT | ATT | 100, 150, 200 MXN |
| MOVISTAR | MOVISTAR | 80, 250, 300, 400, 500 MXN |

### 3.5 Contacto

| Contacto | Rol | Email |
|----------|-----|-------|
| Richard Mas | Technical Vendor Contact LATCOM | `jcalmett@latcom.co` |

---

## 4. Números de Prueba por Vendor

### MEGAPUNTO / TISI — Perú

| Operadora | skuid | Número | Importe | Estado |
|-----------|-------|--------|---------|--------|
| Bitel | 66 | 998877543 | S/5.00 | ✅ Validado |
| Movistar | 907 | 990388408 | S/3.00 | ✅ Validado |
| Entel | 67 | 919499716 | S/3.00 | ⚠️ Código 99 en QA |
| Claro | 70 | 999888777 | S/3.00 | ⚠️ Código 99 en QA |

### MEGAPUNTO / TISI — Venezuela

| Operadora | skuid | Número | Denominaciones (Bs.) | Estado |
|-----------|-------|--------|---------------------|--------|
| Movistar Celular | 5580 | 04241403958 | 500, 1000, 1500, 2250, 2750, 3250 | ✅ Validado |
| Digitel | 5583 | 04122928915 | 600, 1200, 2100, 2700, 3000, 3900 | ✅ Validado |
| Movistar Fijo | 5581 | Sin número oficial | 500, 1000, 3500, 6750, 10000 | ⏳ Pendiente |
| Movilnet | 5582 | Sin número oficial | 640, 1120, 1600, 2560, 5440 | ⏳ Pendiente |

### LATCOM / VIAONE — México

| Operadora | Número | Montos válidos | Estado |
|-----------|--------|---------------|--------|
| MOVISTAR | 5511921174 | 80, 250, 300, 400, 500 MXN | ✅ Validado |
| TELCEL | 9991653533 | 80, 300, 500 MXN | ✅ Validado |
| ATT | 5657936767 | 100, 150, 200 MXN | ✅ Validado |

---

## 5. Tarjetas de Prueba Culqi

| Red | Número | Vencimiento | CVV | Resultado |
|-----|--------|-------------|-----|-----------|
| Visa | 4111 1111 1111 1111 | 09/25 | 123 | ✅ Aprobada |
| Visa | 4000 0200 0000 0000 | 09/25 | 123 | ❌ Rechazada (fondos insuficientes) |
| Mastercard | 5111 1111 1111 1118 | 06/25 | 123 | ✅ Aprobada |

---

## 6. Estado de Pruebas

### Culqi — Gateway de Pagos (Perú)

| Prueba | Estado | Referencia |
|--------|--------|-----------|
| Cargo con tarjeta (simulador) | ✅ Funcional | `chr_test_t05WaQ7GE3g84CMn` |
| Refund con tarjeta (simulador) | ✅ Funcional | `ref_test_LsJJ6U7hiPxJrlYK` |
| Cargo con Yape (simulador) | ✅ Funcional | `chr_test_bBByv5q9X7Ne109g` |
| Cargo en Latconecta Users (F1) | ✅ Funcional | Probado 11/06/2026 |
| Cargo con tarjeta real | ⏳ Pendiente | Requiere tarjeta habilitada para compras online |

### MEGAPUNTO / TISI — Perú

| Operadora | Estado | Notas |
|-----------|--------|-------|
| Bitel | ✅ Funcional | Purchase ID 26 — S/5.00 exitosa |
| Movistar | ✅ Funcional | nro_transaccion 8224 (sesión 08/06) |
| Entel | ⚠️ Código 99 en QA | Normal en ambiente QA de TISI |
| Claro | ⚠️ Código 99 en QA | Normal en ambiente QA de TISI |

### MEGAPUNTO / TISI — Venezuela

| Operadora | Estado | Notas |
|-----------|--------|-------|
| Movistar Celular | ✅ Funcional | Purchase ID 56 — 3250 Bs exitosa |
| Digitel | ✅ Funcional | Validado |
| Movistar Fijo | ⏳ Pendiente | Sin número oficial de TISI |
| Movilnet | ⏳ Pendiente | Sin número oficial de TISI |

### LATCOM / VIAONE — México

| Operadora | Estado | Notas |
|-----------|--------|-------|
| Movistar | ✅ Funcional | Purchase ID 15 — 300 MXN exitosa |
| Telcel | ✅ Funcional | Validado |
| ATT | ✅ Funcional | Validado |

---

*Documento técnico interno — Latcom Horizons II, LLC — Latconecta v2.0.0 — Junio 2026*
