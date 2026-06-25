# Latconecta v2.0.0 — Documentación Técnica Completa
*Latcom Horizons II, LLC — Documento consolidado — Junio 2026*

---

## Tabla de Contenidos

- [00 RESUMEN EJECUTIVO LATCONECTA — DOCUMENTO 00](#00-resumen-ejecutivo-latconecta)
- [01 VISION ARQUITECTURA LATCONECTA — DOCUMENTO 01](#01-vision-arquitectura-latconecta)
- [02 BASE DATOS COMPLETA — DOCUMENTO 02](#02-base-datos-completa)
- [03 DICCIONARIO DATOS COMPLETO — DOCUMENTO 03](#03-diccionario-datos-completo)
- [04 BACKEND CONFIGURACION CORE — DOCUMENTO 04](#04-backend-configuracion-core)
- [05 BACKEND ROUTERS ENDPOINTS — DOCUMENTO 05](#05-backend-routers-endpoints)
- [06 BACKEND MODELS SCHEMAS — DOCUMENTO 06](#06-backend-models-schemas)
- [07 BACKEND AUTENTICACION SEGURIDAD — DOCUMENTO 07](#07-backend-autenticacion-seguridad)
- [08 BACKEND SISTEMA API MAPPINGS — DOCUMENTO 08](#08-backend-sistema-api-mappings)
- [09 BACKEND CONTROL OPERACIONES — DOCUMENTO 09](#09-backend-control-operaciones)
- [10 BACKEND SISTEMA PAGOS — DOCUMENTO 10](#10-backend-sistema-pagos)
- [11 BACKEND TIPO CAMBIO — DOCUMENTO 11](#11-backend-tipo-cambio)
- [12 BACKEND CALCULO PRECIOS — DOCUMENTO 12](#12-backend-calculo-precios)
- [13 FRONTEND ADMIN ARQUITECTURA CORE — DOCUMENTO 13](#13-frontend-admin-arquitectura-core)
- [14 FRONTEND ADMIN COMPONENTES TABS — DOCUMENTO 14](#14-frontend-admin-componentes-tabs)
- [15 FRONTEND USERS ARQUITECTURA CORE — DOCUMENTO 15](#15-frontend-users-arquitectura-core)
- [16 FRONTEND USERS VISTAS COMPONENTES — DOCUMENTO 16](#16-frontend-users-vistas-componentes)
- [17 VENDOR SIMULATOR — DOCUMENTO 17](#17-vendor-simulator)
- [18 LATCOM README — DOCUMENTO 18](#18-latcom-readme)
- [19 LATCOM AUTENTICACION — DOCUMENTO 19](#19-latcom-autenticacion)
- [20 LATCOM PAISES OPERADORES — DOCUMENTO 20](#20-latcom-paises-operadores)
- [21 LATCOM TOPUPS — DOCUMENTO 21](#21-latcom-topups)
- [22 LATCOM ERROR CODES — DOCUMENTO 22](#22-latcom-error-codes)
- [23 FLUJOS DE NEGOCIO COMPLETOS — DOCUMENTO 23](#23-flujos-de-negocio-completos)
- [24 GUIA DEL DESARROLLADOR — DOCUMENTO 24](#24-guia-del-desarrollador)
- [25 GUIA API MAPPINGS DESARROLLADORES — DOCUMENTO 25](#25-guia-api-mappings-desarrolladores)
- [26 GUIA CAPACITACION API MAPPINGS — DOCUMENTO 26](#26-guia-capacitacion-api-mappings)
- [27 CONFIGURACION SISTEMA — DOCUMENTO 27](#27-configuracion-sistema)
- [28 INSTALACION DESPLIEGUE — DOCUMENTO 28](#28-instalacion-despliegue)
- [29 CONFIGURACION DESPLIEGUE REF — DOCUMENTO 29](#29-configuracion-despliegue-ref)
- [30 GUIA OPERACION SOPORTE — DOCUMENTO 30](#30-guia-operacion-soporte)
- [31 TROUBLESHOOTING MANTENIMIENTO — DOCUMENTO 31](#31-troubleshooting-mantenimiento)
- [32 35 CAPACITACION TESTING GLOSARIO — DOCUMENTO 32](#32-35-capacitacion-testing-glosario)
- [36 DOCUMENTO MAESTRO — DOCUMENTO 36](#36-documento-maestro)
- [37 ESTADO ACTUAL — DOCUMENTO 37](#37-estado-actual)
- [38 LIBRO RECLAMACIONES — DOCUMENTO 38](#38-libro-reclamaciones)

---

<a name="00-resumen-ejecutivo-latconecta"></a>

# DOCUMENTO 00
## RESUMEN EJECUTIVO — LATCONECTA v2.0.0

**Versión del Sistema:** 2.0.0
**Fecha de Documentación:** Mayo 2026
**Estado del Sistema:** Backend 100% · Admin 100% · Users 100% · Vendor Simulator 100%
**Servidor de Producción:** CalmetServer — Ubuntu 24.04 — IP 77.42.92.151

---

## ÍNDICE COMPLETO DE DOCUMENTOS

### PARTE 0 — RESUMEN Y VISIÓN
- **DOC 00:** Resumen Ejecutivo e Índice General ← *este documento*
- **DOC 01:** Visión General y Arquitectura del Sistema

### PARTE I — CAPA DE DATOS
- **DOC 02:** Base de Datos Completa
- **DOC 03:** Diccionario de Datos Completo

### PARTE II — BACKEND
- **DOC 04:** Backend — Configuración y Arquitectura Core
- **DOC 05:** Backend — Routers y Endpoints (16 routers activos)
- **DOC 06:** Backend — Models y Schemas
- **DOC 07:** Backend — Autenticación y Seguridad
- **DOC 08:** Backend — Sistema de API Mappings
- **DOC 09:** Backend — Sistema de Control de Operaciones (Fase 1 / Fase 2)
- **DOC 10:** Backend — Sistema de Pagos (Culqi + Multi-Gateway)
- **DOC 11:** Backend — Sistema de Tipo de Cambio y Multi-Moneda
- **DOC 12:** Backend — Sistema de Cálculo de Precios

### PARTE III — FRONTEND
- **DOC 13:** Frontend Admin — Arquitectura Core
- **DOC 14:** Frontend Admin — Componentes y Tabs
- **DOC 15:** Frontend Users — Arquitectura Core
- **DOC 16:** Frontend Users — Vistas y Componentes

### PARTE IV — VENDOR SIMULATOR
- **DOC 17:** Vendor Simulator — Servidor de Simulación LATCOM

### PARTE V — INTEGRACIÓN VENDOR LATCOM
- **DOC 18:** LATCOM — Guía de Integración (README)
- **DOC 19:** LATCOM — Autenticación
- **DOC 20:** LATCOM — Países y Operadores
- **DOC 21:** LATCOM — TopUps y Productos
- **DOC 22:** LATCOM — Códigos de Error

### PARTE VI — FLUJOS Y OPERACIÓN
- **DOC 23:** Flujos de Negocio Completos
- **DOC 24:** Guía del Desarrollador
- **DOC 25:** Guía de API Mappings para Desarrolladores
- **DOC 26:** Guía de Capacitación API Mappings

### PARTE VII — DESPLIEGUE Y OPERACIÓN
- **DOC 27:** Configuración del Sistema
- **DOC 28:** Instalación y Despliegue
- **DOC 29:** Configuración y Despliegue — Referencia Completa
- **DOC 30:** Guía de Operación y Soporte
- **DOC 31:** Troubleshooting y Mantenimiento

### PARTE VIII — CAPACITACIÓN
- **DOC 32:** Guía de Capacitación — Administradores
- **DOC 33:** Guía de Capacitación — Soporte Técnico

### PARTE IX — CALIDAD
- **DOC 34:** Testing y Quality Assurance

### PARTE X — REFERENCIA
- **DOC 35:** Glosario y Referencias

### DOCUMENTO MAESTRO
- **DOC 36:** Documento Maestro — Guía Completa del Sistema

---

## DESCRIPCIÓN DEL SISTEMA

**Latconecta v2.0.0** es una plataforma multi-tenant de servicios digitales de telecomunicaciones para América Latina. Permite a usuarios de múltiples países adquirir recargas móviles, paquetes de datos, pagos de servicios, transferencias y smartphones de diferentes operadoras, integrando vendors externos mediante un motor de API Mappings configurable sin código.

### Modelo de Negocio

```
PAÍS → SERVICIO → COMPAÑÍA → PRODUCTO → VENDOR → OPERADOR
```

**Ejemplo concreto:**
```
Perú → TopUps → Claro → Recarga S/20 → LATCOM (via Relier) → Claro Perú
```

LATCOM es el vendor con quien Latconecta tiene relación comercial. LATCOM utiliza la plataforma tecnológica Relier para procesar las transacciones hacia los operadores finales.

---

## COMPONENTES DEL SISTEMA

| Componente | Tecnología | Puerto | Ambiente | Estado |
|------------|------------|--------|----------|--------|
| **Base de Datos** | PostgreSQL 14.19 | 5432 | Ubuntu | ✅ 100% |
| **Backend API** | FastAPI 0.120.4 + Python 3.11 | 8100 | Ubuntu | ✅ 100% |
| **Frontend Admin** | React 18 + Vite + Tailwind | HTTPS/443 `/latconecta_admin` | Ubuntu Nginx | ✅ 100% |
| **Frontend Users** | React 18 + Vite + Tailwind | HTTPS/443 `/latconecta_users` | Ubuntu Nginx | ✅ 100% |
| **Vendor Simulator** | Flask + Python 3.11 | 5001 | Ubuntu | ✅ 100% |
| **Culqi Sandbox** | HTML estático | HTTPS/5176 | Ubuntu Nginx | ✅ Solo pruebas |

### Ambientes de Operación

| Ambiente | Descripción | Vendor | Backend URL |
|----------|-------------|--------|-------------|
| **Development** | PC local, simulator activo | Vendor Simulator (puerto 5001) | http://localhost:8100 |
| **UAT** | Servidor Ubuntu, vendor real UAT | LATCOM ambiente desarrollo | https://77.42.92.151 |
| **Production** | Servidor Ubuntu, vendor real PROD | LATCOM ambiente producción | https://77.42.92.151 |

La variable `ENVIRONMENT` en `.env` controla el comportamiento. El sistema **nunca requiere cambios de código** para cambiar de ambiente, solo cambios en `.env`.

---

## MÉTRICAS DEL SISTEMA

### Base de Datos (latconecta_db)

| Elemento | Cantidad |
|----------|----------|
| Tablas operativas | 11 |
| Campos tabla purchases | 60+ |
| Índices | 30+ |
| Países activos | 2 (Perú, México) |
| Servicios disponibles | 5 tipos |
| Vendors configurados | Variable (BD) |
| API Mappings | Configurables sin código |

### Backend (FastAPI)

| Elemento | Cantidad |
|----------|----------|
| Archivos Python | ~75 |
| Routers activos | 16 |
| Endpoints totales | ~85 |
| Models SQLAlchemy | 11 |
| Services especializados | 14 |
| Líneas de código | ~16,000 |

### Frontend Admin

| Elemento | Cantidad |
|----------|----------|
| Archivos JSX/JS | ~45 |
| Tabs administrativos | 11 |
| Services API | 13 |
| Líneas de código | ~8,000 |

### Frontend Users

| Elemento | Cantidad |
|----------|----------|
| Archivos JSX/JS | ~40 |
| Vistas principales | 4 |
| Servicios activos | 13 |
| Líneas de código | ~5,000 |

### Vendor Simulator

| Elemento | Detalle |
|----------|---------|
| Framework | Flask (Python) |
| Endpoints simulados | 4 |
| Puerto | 5001 |
| Gestión | systemd service |

---

## ESTADO DE DESARROLLO

| Módulo | Estado | Completitud | Notas |
|--------|--------|-------------|-------|
| Base de Datos | ✅ Operativo | 100% | 12 tablas, 60+ campos en purchases |
| Backend Core | ✅ Operativo | 100% | 16 routers, ~87 endpoints |
| Sistema API Mappings | ✅ Operativo | 100% | JSONPath + formato fields, transformaciones |
| Sistema Control Operaciones | ✅ Operativo | 100% | 10 operaciones, fase1/fase2, 9 presets |
| Sistema Pagos Culqi | ✅ Operativo | 100% | Charge, refund, cancel — Tarjeta + Yape |
| Pago Barcode | ✅ Operativo | 100% | Generación real via barcodeapi.org (México) |
| Sistema Tipo de Cambio | ✅ Operativo | 100% | Multi-moneda, scheduler automático |
| Catalog Sync Venezuela | ✅ Operativo | 100% | Sync automático precios Bs/Sol, reporte 5 estados |
| Vendor LATCOM | ✅ Operativo | 100% | API Mappings + login automático + token renewal |
| Vendor MEGAPUNTO/TISI | ✅ Operativo | 100% | Bearer dinámico + provisión Perú/Venezuela + catalog sync |
| Vendor Simulator | ✅ Operativo | 100% | Simula API LATCOM/Relier completa |
| Simulador Culqi Sandbox | ✅ Operativo | 100% | Pruebas de pago/refund — puerto 5176 |
| Admin — Countries | ✅ Operativo | 100% | CRUD completo |
| Admin — Services | ✅ Operativo | 100% | CRUD completo |
| Admin — Companies | ✅ Operativo | 100% | CRUD completo |
| Admin — Vendors | ✅ Operativo | 100% | CRUD + balance dual USD/local + sync catálogo |
| Admin — VendorProducts | ✅ Operativo | 100% | CRUD + api_group_code |
| Admin — Products | ✅ Operativo | 100% | CRUD + tipos F/R/V |
| Admin — API Mappings | ✅ Operativo | 100% | Gestión visual completa |
| Admin — Users | ✅ Operativo | 100% | Gestión usuarios admin |
| Admin — Sales | ✅ Operativo | 100% | Reporte ventas + Column Picker + CSV |
| Admin — Latconecta | ✅ Operativo | 100% | Configuración corporativa |
| Users — WelcomeView | ✅ Operativo | 100% | Landing con carousel |
| Users — SelectView | ✅ Operativo | 100% | Wizard multi-tenant |
| Users — ShopView | ✅ Operativo | 100% | Catálogo + filtros URL |
| Users — ProfileView | ✅ Operativo | 100% | Perfil + historial compras |
| Users — PurchasePopup | ✅ Operativo | 100% | Flujo completo 7 pasos + Culqi Checkout V4 |
| Users — OperationsPanel | ✅ Operativo | 100% | Control fase1/fase2 en tiempo real |
| Recuperación de contraseña | ✅ Operativo | 100% | Email 6 dígitos — Users + Admin |

---

## CARACTERÍSTICAS PRINCIPALES

### 1. Gateway de Pagos Multi-País (Culqi)

Latconecta opera con **Culqi Checkout V4** como gateway de pagos para Perú. La arquitectura multi-gateway permite agregar nuevos gateways (Conekta para México, Stripe para USA) sin cambiar el código de negocio — solo registrando el adaptador correspondiente y actualizando `PAYMENT_GATEWAY` en `.env`.

Métodos soportados actualmente (Perú):
- **Tarjeta** (Visa, Mastercard, Amex) — sincrónico, `tkn_` token
- **Yape** — sincrónico, `ype_` token, flujo idéntico a tarjeta

El campo `antifraud_details` fue deliberadamente excluido — Culqi no lo requiere y el uso de datos ficticios genera alertas innecesarias en sistemas antifraude.

### 2. Sistema de Control de Operaciones (Fase 1 / Fase 2)

10 operaciones controlables en tiempo real desde el **OperationsPanel** del frontend:

| Operación | Fase 2 hace |
|-----------|-------------|
| val_telefono | API Mapping validation |
| val_cuenta | API Mapping validation (Bill Payment) |
| pago_tarjeta | Culqi Checkout V4 real |
| pago_barcode | Genera barcode real en barcodeapi.org |
| anulacion_tarjeta | Refund real en Culqi |
| provision_topup/package/smartphone/transfer/billpay | API Mapping provision (UniversalVendorService) |

### 3. Motor de API Mappings (Sin Código)

El motor permite integrar nuevos vendors sin escribir código Python. La configuración se hace desde el panel admin:
- `request_mapping` — JSONPath para construir el request al vendor
- `response_mapping` — JSONPath para extraer datos de la respuesta
- `value_transformations` — transformaciones de valores (fecha, formato, cálculos)
- `success_indicators` — condiciones que determinan si la operación fue exitosa

### 4. Control de Pagos por País

```bash
CARD_AVAILABLE=True      # Perú: sí
BARCODE_AVAILABLE=False  # Perú: no (México: True — OXXO Pay)
```

Publicado al frontend vía `GET /payments/config` que incluye también `card.mode` para controlar si el pago usa el gateway real (fase2) o la simulación interna (fase1).

### 5. Balance Dual de Vendors

Cada vendor mantiene dos balances independientes:
- `vendor_usd_balance` — saldo en USD
- `vendor_local_balance` — saldo en moneda local (PEN, MXN, etc.)

### 6. Evidencia Completa de Transacciones

La tabla `purchases` registra la traza completa:
- `vendor_request` / `vendor_response` — JSON completo
- `purchase_status` — Pending / Success / Failed
- `purchase_payment_status` — Pending / Success / Reversed / Refunded
- `requires_manual_intervention` — flag crítico cuando pago exitoso + provisión fallida + reversión fallida

### 7. Reversión Automática del Pago

```
Pago exitoso (Culqi) → Provisión falla → Intenta refund en Culqi
                                              ↓
                              Refund OK → payment_status = Refunded, status = Failed
                              Refund FAIL → requires_manual_intervention = TRUE ← CRÍTICO
```

---

## ARQUITECTURA DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTES (Browsers)                       │
├────────────────────────┬────────────────────────────────────┤
│   Frontend Admin       │        Frontend Users               │
│   React + Vite         │        React + Vite                 │
│   Puerto 443 (HTTPS)   │        Puerto 443 (HTTPS)           │
│   /latconecta_admin    │        /latconecta_users            │
│                        │        basename="/latconecta_users" │
└────────────┬───────────┴──────────────┬────────────────────-┘
             │                          │
             ▼                          ▼
┌────────────────────────────────────────────────────────────-┐
│                    NGINX (Reverse Proxy)                      │
│                    Ubuntu 24.04 — Puerto 443                  │
│                    SSL: Self-signed (latconecta-selfsigned)   │
│                    CSP: incluye js.culqi.com                  │
│                    Puerto 5176: Culqi Sandbox (pruebas)       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI + Uvicorn)                      │
│              Python 3.11 — Puerto 8100                        │
│              Servicio: latconecta-backend (systemd)           │
├─────────────────────────────────────────────────────────────┤
│  16 Routers · ~85 Endpoints · 14 Services · 11 Models        │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │ Operations      │  │ API Mappings Engine              │  │
│  │ Config Service  │  │ VendorAPIMapper                  │  │
│  │ (10 operaciones │  │ UniversalVendorService           │  │
│  │  fase1/fase2)   │  │ (sin código nuevo)               │  │
│  └─────────────────┘  └──────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │ Payment Gateway │  │ Vendor Login + Token Manager     │  │
│  │ CulqiAdapter    │  │ Scheduler (renovación automática)│  │
│  └─────────────────┘  └──────────────────────────────────┘  │
└────────────┬────────────────────────┬───────────────────────┘
             │ SQLAlchemy AsyncIO      │ httpx
             ▼                        ▼
┌────────────────────┐   ┌────────────────────────────────────┐
│  PostgreSQL 14.19  │   │  Externos                          │
│  latconecta_db     │   ├────────────────────────────────────┤
│  Puerto 5432       │   │  Culqi API (pagos):                │
│                    │   │  https://api.culqi.com             │
│                    │   │  https://secure.culqi.com          │
│                    │   ├────────────────────────────────────┤
│                    │   │  Vendors (dev/UAT/prod):           │
│                    │   │  Vendor Simulator localhost:5001   │
│                    │   │  LATCOM UAT (Relier)               │
│                    │   │  MEGAPUNTO/TISI                    │
└────────────────────┘   └────────────────────────────────────┘
```

---

## FLUJO DE COMPRA — VISIÓN GENERAL

```
1. Usuario accede a /latconecta_users (WelcomeView)
   ↓
2. Navega SelectView: País → Servicio → Compañía
   ↓
3. Ve catálogo en ShopView, selecciona producto
   ↓
4. PurchasePopup — Step 2: Validación teléfono/cuenta
   ↓
5. PurchasePopup — Step 2.5 (opcional): Datos entrega (smartphones)
   ↓
6. PurchasePopup — Step 2.6 (opcional): Monto (bill payment)
   ↓
7. PurchasePopup — Step 3 (opcional): Selección monto (rango)
   ↓
8. PurchasePopup — Step 4: Verificar balance vendor
   ↓
9. PurchasePopup — Step 4: Selección método de pago
   Tarjeta/Yape fase2 → CulqiCheckout V4 → cargo real Culqi
   Tarjeta fase1 → simulado internamente
   ↓
10. PurchasePopup — Step 5: Procesar compra
    POST /api/v1/purchases/create
    Backend:
      a. Pago Culqi ya procesado (charge_id viene en el request)
      b. Provisiona con vendor (API Mappings o simulado)
      c. Si provisión falla → refund automático en Culqi
      d. Actualiza balances del vendor
      e. Graba purchase con evidencia completa
   ↓
11. PurchasePopup — Step 6: Resultado
    Éxito: Confetti + datos + botón descarga PDF
    Fallo: Mensaje de error + referencia de reversión si aplica
```

---

## SERVICIOS SYSTEMD EN PRODUCCIÓN

| Servicio | Descripción | Puerto |
|----------|-------------|--------|
| `latconecta-backend` | FastAPI + Uvicorn | 8100 |
| `latconecta-vendor-simulator` | Flask simulator | 5001 |
| `nginx` | Reverse proxy + SSL | 80, 443, 5176 |

---

## INFORMACIÓN DE ACCESO

### Servidor de Producción

| Dato | Valor |
|------|-------|
| Servidor | CalmetServer |
| IP | 77.42.92.151 |
| OS | Ubuntu 24.04 |
| Usuario SSH | jcalmett |
| Directorio base | /var/www/latconecta/ |

### URLs de Acceso

| Componente | URL Servidor |
|------------|-------------|
| Frontend Users | https://77.42.92.151/latconecta_users |
| Frontend Admin | https://77.42.92.151/latconecta_admin |
| Backend API directo | http://77.42.92.151:8100 |
| Backend API vía proxy | https://77.42.92.151/api/ |
| Swagger Docs | http://77.42.92.151:8100/docs |
| Health Check | https://77.42.92.151/health |
| Culqi Sandbox | https://77.42.92.151:5176 |

### Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Superadmin | jorge.calmett@gmail.com | Admin123 |

---

## CONTACTO VENDOR LATCOM

| Contacto | Detalle |
|----------|---------|
| Responsable técnico | Richard Mas |
| Email | jcalmett@latcom.co |
| Plataforma | Relier (via LATCOM) |

---

## CÓMO USAR ESTA DOCUMENTACIÓN

**Para desarrolladores:**
DOC 04-12 para backend · DOC 13-16 para frontend · DOC 08 para API Mappings · DOC 24-25 para guías técnicas

**Para soporte técnico:**
DOC 23 para flujos de negocio · DOC 30-31 para operación y troubleshooting · DOC 33 para capacitación soporte

**Para administradores del sistema:**
DOC 01 para visión general · DOC 27-29 para configuración y despliegue · DOC 32 para capacitación admin

**Para integración de nuevos vendors:**
DOC 08 para API Mappings · DOC 18-22 para referencia LATCOM/Relier · DOC 25-26 para guías

---

**FIN DEL DOCUMENTO 00**

*Versión: 5.0 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Cambios v5.0: Migración Izipay → Culqi. Simulador Culqi Sandbox (puerto 5176). BARCODE_AVAILABLE=False para Perú. SPA routing con basename. Credenciales superadmin actualizadas. Arquitectura actualizada con Culqi API.*
*Continúa en: DOC 01 — Visión General y Arquitectura del Sistema*


---

<a name="01-vision-arquitectura-latconecta"></a>

# DOCUMENTO 01
## VISIÓN GENERAL Y ARQUITECTURA DEL SISTEMA LATCONECTA

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0

---

## CONTENIDO

1. [Visión y Propósito](#vision)
2. [Modelo de Negocio Multi-Tenant](#multi-tenant)
3. [Arquitectura General](#arquitectura)
4. [Componentes del Sistema](#componentes)
5. [Stack Tecnológico](#stack)
6. [Flujos de Datos Principales](#flujos)
7. [Ambientes de Operación](#ambientes)
8. [Estructura de Directorios](#directorios)
9. [Métricas del Sistema](#metricas)

---

## VISIÓN Y PROPÓSITO <a name="vision"></a>

### Visión

Ser la plataforma líder en servicios digitales de telecomunicaciones en América Latina, facilitando el acceso universal a productos de comunicación de manera simple, rápida y confiable.

### Misión

Proporcionar una solución tecnológica integral que conecte a usuarios finales con proveedores de servicios de telecomunicaciones a través de una plataforma unificada, multi-país y multi-operador, garantizando experiencia de usuario superior, seguridad, confiabilidad y flexibilidad.

### Propósito por Actor

**Para usuarios finales:**
- Compra de recargas, paquetes, pagos de servicios y smartphones sin importar ubicación
- Múltiples métodos de pago (tarjeta de crédito/débito, código de barras)
- Confirmación inmediata con comprobante descargable en PDF
- Historial completo de transacciones en perfil de usuario
- Compras anónimas sin necesidad de registro

**Para administradores:**
- Gestión centralizada del catálogo multi-país desde panel administrativo
- Configuración de vendors e integraciones sin código
- Reportes de ventas y control de balances
- Control operacional en tiempo real (fase1/fase2 por operación)

**Para vendors técnicos:**
- Integración en 15 a 30 minutos mediante API Mappings
- Sin desarrollo de código personalizado
- Testing robusto con vendor simulator y sistema de control de operaciones

---

## MODELO DE NEGOCIO MULTI-TENANT <a name="multi-tenant"></a>

### Concepto

El sistema Latconecta es **multi-tenant**, lo que significa que una única instalación soporta múltiples países, servicios, operadoras y vendors de forma simultánea, compartiendo infraestructura pero manteniendo separación lógica completa de catálogos.

### Jerarquía de 5 Niveles

```
NIVEL 1: PAÍS (countries)
    — Define mercado, moneda, tipo de cambio
    ↓
NIVEL 2: SERVICIO (services)
    — TopUps, Paquetes, Bill Payment, Transfers, Smartphones
    ↓
NIVEL 3: COMPAÑÍA (companies)
    — Operadoras: Claro, Bitel, Entel, Movistar, Telcel, etc.
    ↓
NIVEL 4: PRODUCTO COMERCIAL (products)
    — Producto visible al usuario final con precio y marketing
    ↓
NIVEL 5: PRODUCTO TÉCNICO (vendor_products)
    — SKU del vendor, moneda, tipo de monto, api_group_code
    ↓
VENDOR TÉCNICO (vendors)
    — LATCOM, etc. — con credenciales, URLs y balance
```

### Ejemplos Prácticos

```
Perú → TopUps → Claro Perú → Recarga S/20 → LATCOM (api_group: LC01T)
Perú → TopUps → Bitel → Recarga S/10 → LATCOM (api_group: LC01T)
Perú → Bill Payment → Luz del Sur → Pago servicio → LATCOM (api_group: LC02B)
México → TopUps → Telcel → Recarga $100 → [vendor MX] (api_group: MX01T)
```

### Filtrado Cascada

El frontend implementa un wizard donde cada selección filtra dinámicamente el nivel siguiente:

```
Selecciona País
    → filtra: servicios disponibles para ese país
Selecciona Servicio
    → filtra: compañías para ese país + servicio
Selecciona Compañía
    → filtra: productos para esa compañía
Selecciona Producto
    → vincula automáticamente: vendor_product + vendor + api_group_code
```

Un usuario nunca ve opciones de otro país ni de otro servicio. El sistema garantiza coherencia en toda la jerarquía.

### Ventajas del Modelo

| Aspecto | Ventaja |
|---------|---------|
| Escalabilidad | Agregar un país = configuración en BD, no código |
| Mantenimiento | Un código base para todos los mercados |
| Despliegue | Deploy único para N países |
| Velocidad | Expansión a nuevo país en horas, no semanas |
| Consistencia | UX uniforme en todos los mercados |

---

## ARQUITECTURA GENERAL <a name="arquitectura"></a>

### Arquitectura de 4 Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA 1: PRESENTACIÓN                          │
├─────────────────────────┬───────────────────────────────────────┤
│   Frontend Admin        │        Frontend Users                  │
│   React 18 + Vite       │        React 18 + Vite                 │
│   Tailwind CSS          │        Tailwind CSS                    │
│   HTTPS / Nginx         │        HTTPS / Nginx                   │
│                         │                                        │
│   11 tabs admin         │   4 vistas + PurchasePopup             │
│   CRUD catálogos        │   Wizard multi-tenant                  │
│   Config mappings       │   Compra completa (7 pasos)            │
│   Reportes ventas       │   Panel control operaciones            │
└─────────────┬───────────┴──────────────┬───────────────────────-┘
              │  HTTPS + Axios           │  HTTPS + Axios
              ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA 2: NGINX                                  │
│                    Reverse Proxy + SSL                            │
│                    Ubuntu 24.04 — Puerto 443                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA 3: APLICACIÓN                             │
│              Backend FastAPI + Uvicorn — Puerto 8100             │
│              Python 3.11 — systemd: latconecta-backend           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  16 ROUTERS ACTIVOS:                                             │
│  auth · users · countries · services · companies · products      │
│  vendors · vendor_products · vendor_api_mappings · mock_vendors  │
│  operations_config · purchases · latconecta · upload             │
│  exchange_rate · payments                                        │
│                                                                  │
│  SERVICIOS CORE:                                                 │
│  ┌──────────────────┐  ┌────────────────────────────────────┐   │
│  │ OperationsConfig │  │ API Mappings Engine                │   │
│  │ Service          │  │ VendorAPIMapper                    │   │
│  │ 10 operaciones   │  │ UniversalVendorService             │   │
│  │ fase1 / fase2    │  │ (JSONPath + transformaciones)      │   │
│  └──────────────────┘  └────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────┐  ┌────────────────────────────────────┐   │
│  │ Payment Gateway  │  │ Vendor Auth                        │   │
│  │ IzipayAdapter    │  │ VendorLoginService                 │   │
│  │ Multi-gateway    │  │ TokenManager                       │   │
│  │ (PE/MX/US)       │  │ SchedulerService                   │   │
│  └──────────────────┘  └────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────┐  ┌────────────────────────────────────┐   │
│  │ Exchange Rate    │  │ Purchase Calculator                │   │
│  │ Service          │  │ Service                            │   │
│  │ Multi-moneda     │  │ (precios + márgenes + conversión)  │   │
│  └──────────────────┘  └────────────────────────────────────┘   │
│                                                                  │
└──────────────┬──────────────────────────┬────────────────────---┘
               │ SQLAlchemy 2.0 AsyncIO   │ httpx
               │ asyncpg                  │
               ▼                          ▼
┌──────────────────────┐   ┌─────────────────────────────────────┐
│   CAPA 4: DATOS      │   │  CAPA 4b: VENDORS EXTERNOS          │
│   PostgreSQL 14.19   │   ├─────────────────────────────────────┤
│   Puerto 5432        │   │  Development:                       │
│   latconecta_db      │   │  Vendor Simulator (Flask/5001)      │
│                      │   │  systemd: latconecta-vendor-sim     │
│   11 tablas          │   ├─────────────────────────────────────┤
│   60+ campos         │   │  UAT:                               │
│   en purchases       │   │  LATCOM UAT vía Relier              │
│   30+ índices        │   │  https://latcom-fix-production      │
└──────────────────────┘   │         .up.railway.app             │
                           ├─────────────────────────────────────┤
                           │  Production:                        │
                           │  LATCOM Prod vía Relier             │
                           └─────────────────────────────────────┘
```

---

## COMPONENTES DEL SISTEMA <a name="componentes"></a>

### Backend — FastAPI

El backend es el núcleo del sistema. Gestiona toda la lógica de negocio, las integraciones con vendors y la persistencia de datos.

| Elemento | Detalle |
|----------|---------|
| Framework | FastAPI 0.120.4 |
| Runtime | Python 3.11.7 |
| Servidor | Uvicorn (ASGI) |
| ORM | SQLAlchemy 2.0 (async) |
| Validación | Pydantic 2.12.3 |
| Driver BD | asyncpg 0.30.0 |
| HTTP Client | httpx (async) |
| Puerto | 8100 |
| Gestión proceso | systemd |

**Características del diseño:**
- Completamente asíncrono (async/await en todos los endpoints)
- Inyección de dependencias para autenticación y BD
- Separación clara en routers, services y models
- Configuración centralizada en `config.py` (sin datos de vendors en código)

### Frontend Admin — React

Panel de administración accesible únicamente por usuarios con rol `admin` o `superadmin`.

| Elemento | Detalle |
|----------|---------|
| Framework | React 18 |
| Build tool | Vite |
| Estilos | Tailwind CSS |
| HTTP Client | Axios |
| Router | React Router v6 |
| Tabs | 11 tabs funcionales |
| Puerto desarrollo | 5173 |

### Frontend Users — React

Interfaz pública para usuarios finales. Soporta compras anónimas y autenticadas.

| Elemento | Detalle |
|----------|---------|
| Framework | React 18 |
| Build tool | Vite |
| Estilos | Tailwind CSS |
| HTTP Client | Axios / fetch |
| PDF | jsPDF |
| Puerto desarrollo | 5174 |
| Vistas | 4 principales + PurchasePopup |

### Vendor Simulator — Flask

Servidor independiente que simula la API de LATCOM/Relier para desarrollo local. Permite probar el flujo completo sin costos y sin acceder al ambiente UAT del vendor.

| Elemento | Detalle |
|----------|---------|
| Framework | Flask |
| Puerto | 5001 |
| Gestión proceso | systemd |
| Endpoints | POST /api/v1/topup · GET /api/v1/balance · GET /api/v1/transaction/:id · GET /health |
| Autenticación | Verifica presencia de headers (no valores) |
| Storage | En memoria (transacciones dentro de sesión) |

### Base de Datos — PostgreSQL

| Elemento | Detalle |
|----------|---------|
| Motor | PostgreSQL 14.19 |
| Base de datos | latconecta_db |
| Puerto | 5432 |
| Tablas | 11 |
| Campos en purchases | 60+ |
| Índices | 30+ |

---

## STACK TECNOLÓGICO <a name="stack"></a>

### Backend

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| Web Framework | FastAPI | 0.120.4 | API REST asíncrona |
| Runtime | Python | 3.11.7 | Lenguaje base |
| ASGI Server | Uvicorn | 0.24.0 | Servidor de producción |
| ORM | SQLAlchemy | 2.0.44 | Acceso a BD async |
| Validation | Pydantic | 2.12.3 | Schemas y validación |
| DB Driver | asyncpg | 0.30.0 | Driver async PostgreSQL |
| HTTP Client | httpx | 0.25.2 | Llamadas a vendors |
| Auth | python-jose | 3.3.0 | JWT tokens |
| Passwords | passlib/bcrypt | 1.7.4 | Hash de contraseñas |
| Config | pydantic-settings | 2.1.0 | Variables de entorno |
| Barcode | python-barcode | 0.15.1 | Generación códigos |

### Frontend

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| UI Framework | React | 18 | Interfaz de usuario |
| Build Tool | Vite | 5.x | Bundler + dev server |
| CSS Framework | Tailwind CSS | 3.x | Estilos utilitarios |
| HTTP | Axios | 1.x | Llamadas al backend |
| Router | React Router | 6.x | Navegación SPA |
| Icons | Lucide React | 0.383.0 | Iconografía |
| PDF | jsPDF | 2.x | Comprobantes descargables |
| Phone Input | react-phone-input-2 | 2.x | Input teléfono internacional |

### Infraestructura

| Componente | Tecnología | Versión | Propósito |
|------------|-----------|---------|-----------|
| Servidor | Ubuntu | 24.04 | Sistema operativo |
| Proxy | Nginx | 1.24.x | Reverse proxy + SSL |
| SSL | Self-signed cert | — | HTTPS en desarrollo/UAT |
| Procesos | systemd | — | Gestión de servicios |
| BD | PostgreSQL | 14.19 | Base de datos relacional |
| Firewall | UFW | — | Reglas de red |

---

## FLUJOS DE DATOS PRINCIPALES <a name="flujos"></a>

### Flujo de Catálogo (Lectura)

```
Usuario selecciona país en SelectView
    ↓
GET /api/v1/services?country_id=X
    ↓ Backend consulta BD
SELECT services JOIN countries
    ↓
Usuario selecciona servicio
    ↓
GET /api/v1/companies?country_id=X&service_id=Y
    ↓
Usuario selecciona compañía
    ↓
GET /api/v1/products?company_id=Z
    ↓
ShopView muestra productos filtrados
```

### Flujo de Compra (Transacción)

```
Usuario selecciona producto → abre PurchasePopup
    ↓
Step 2: POST /api/v1/purchases/validate-phone
    Backend: ops_config.is_fase1('val_telefono')
    → Fase 1: simula respuesta
    → Fase 2: UniversalVendorService → API Mapping → vendor
    ↓
Step 4: POST /api/v1/purchases/check-balance
    Backend verifica vendor_usd_balance o vendor_local_balance
    ↓
Step 4: Usuario elige método de pago
    Tarjeta fase2: frontend → POST /api/v1/payments/token → Izipay SDK
    Tarjeta fase1: simulado internamente
    Barcode fase2: POST /api/v1/purchases/create → barcode_service.generate()
    Barcode fase1: simulado internamente
    ↓
Step 5: POST /api/v1/purchases/create
    Backend:
    1. Carga product + vendor_product + vendor + company
    2. purchase_calculator_service.calculate()
    3. Valida balance del vendor
    4. Procesa pago (real o simulado)
    5. Provisiona con vendor (API Mappings o simulado)
       → Si falla: intenta reversión del pago
       → Si reversión también falla: requires_manual_intervention = TRUE
    6. Actualiza balance del vendor
    7. Graba purchase con evidencia completa
    ↓
Step 6: Frontend muestra resultado
    Éxito: confetti + datos transacción + botón PDF
    Fallo: mensaje + referencia para soporte
```

### Flujo de Autenticación

```
Usuario ingresa credenciales en LoginModal
    ↓
POST /api/v1/auth/login
    Backend: busca user → verifica bcrypt → genera JWT
    ↓
Frontend guarda token en localStorage
    ↓
Requests posteriores: Authorization: Bearer {token}
    ↓
Backend: get_current_user_required() o get_current_admin_user()
    Decodifica JWT → busca user en BD → verifica rol
    ↓
Endpoint ejecuta con usuario autenticado
```

### Flujo de API Mapping (Provisión con Vendor)

```
purchases.py → UniversalVendorService.execute_vendor_request(
    vendor_code, api_group_code, operation_type='provision', data
)
    ↓
Consulta vendor_api_mappings WHERE vendor_code + api_group_code + operation_type
    ↓
Consulta vendors para obtener URL + credenciales + token
    ↓
VendorAPIMapper.build_request(source_data)
    → Detecta formato: fields array (legado) o JSONPath (nuevo)
    → Aplica value_transformations (country_alpha3_to_alpha2, etc.)
    → Genera JSON con orden preservado (OrderedDict)
    ↓
UniversalVendorService construye headers según auth_type
    bearer: Authorization: Bearer {vendor_access_token}
    apikey: x-api-key + x-customer-id
    basic: Authorization: Basic {base64(user:pass)}
    ↓
httpx.post(vendor_url + endpoint_url, json=request, headers=headers)
    → En desarrollo: va al Vendor Simulator (puerto 5001)
    → En UAT/Prod: va al vendor real
    ↓
VendorAPIMapper parsea response según response_mapping
    Evalúa success_indicators
    Extrae campos hacia purchase
    ↓
Retorna resultado a purchases.py
```

---

## AMBIENTES DE OPERACIÓN <a name="ambientes"></a>

El sistema opera en tres ambientes bien diferenciados, controlados exclusivamente por el archivo `.env`. No se requiere cambio de código para cambiar de ambiente.

### Development (PC Local)

```
ENVIRONMENT=development
VENDOR_SIMULATOR_ENABLED=True
VENDOR_SIMULATOR_URL=http://localhost:5001
ENABLE_VENDOR_LOGIN=False
```

- Backend en localhost:8100
- Frontends en localhost:5173 y localhost:5174
- Vendor Simulator corriendo localmente en puerto 5001
- Las llamadas a vendors van al simulator
- BD local (PostgreSQL en la misma PC)
- Todas las operaciones en Fase 1 por defecto (simuladas)

### UAT (Servidor Ubuntu)

```
ENVIRONMENT=uat
VENDOR_SIMULATOR_ENABLED=False
ENABLE_VENDOR_LOGIN=True
```

- Backend en 77.42.92.151:8100
- Frontends servidos por Nginx en HTTPS
- Las llamadas a vendors van a LATCOM ambiente UAT
- BD en el servidor Ubuntu
- Login automático de vendors al iniciar backend
- Permite mezcla de fase1/fase2 por operación desde el panel

### Production (Servidor Ubuntu)

```
ENVIRONMENT=production
VENDOR_SIMULATOR_ENABLED=False
ENABLE_VENDOR_LOGIN=True
```

- Igual que UAT pero apunta a LATCOM ambiente producción
- `is_production=True` en la tabla vendors para el vendor LATCOM
- Todas las operaciones en Fase 2 (real)

### Flujo de Promoción de Código

```
1. Desarrollar y probar en PC (Development)
   → Pruebas con Vendor Simulator local
   ↓
2. Subir código a Ubuntu (git push o scp)
   → Solo código fuente, nunca .env
   ↓
3. Reconstruir frontends si hubo cambios
   npm run build → dist/
   ↓
4. Reiniciar backend
   sudo systemctl restart latconecta-backend
   ↓
5. Probar en Ubuntu con LATCOM UAT
   → Credenciales UAT en tabla vendors
   ↓
6. Promover a producción
   → Actualizar vendors.is_production = True en BD
   → O actualizar URLs/credenciales en BD
```

---

## ESTRUCTURA DE DIRECTORIOS EN SERVIDOR <a name="directorios"></a>

```
/var/www/latconecta/
├── backend/                     # Backend FastAPI
│   ├── app/
│   │   ├── main.py              # Entry point, routers, middleware
│   │   ├── config.py            # Configuración centralizada
│   │   ├── database.py          # Conexión async PostgreSQL
│   │   ├── dependencies.py      # Auth dependencies
│   │   ├── events.py            # Startup/shutdown (vendor login)
│   │   ├── models/              # 11 modelos SQLAlchemy
│   │   ├── schemas/             # Schemas Pydantic
│   │   ├── routers/             # 16 routers activos
│   │   ├── services/            # 14 servicios especializados
│   │   ├── payments/            # Gateway de pagos (Izipay)
│   │   ├── barcode/             # Generación de códigos de barras
│   │   └── utils/               # Auth, validators, helpers
│   ├── uploads/                 # Archivos subidos (imágenes)
│   ├── requirements.txt
│   ├── .env                     # Variables de entorno (NO en git)
│   └── .venv/                   # Entorno virtual Python
│
├── latconecta_admin/            # Frontend Admin
│   ├── src/
│   │   ├── App.jsx              # Rutas: / (welcome) y /admin
│   │   ├── pages/               # LatconectaAdmin.jsx, WelcomeView.jsx
│   │   ├── components/
│   │   │   ├── admin/           # 11 tabs administrativos
│   │   │   ├── auth/            # LoginForm, ProtectedRoute
│   │   │   └── common/          # Button, Loading, Notification
│   │   ├── services/            # 13 servicios API
│   │   ├── hooks/               # useApi, useAuth, useNotification
│   │   ├── context/             # AppContext, AuthContext
│   │   └── utils/               # formatters, validators, helpers
│   ├── dist/                    # Build de producción (servido por Nginx)
│   ├── package.json
│   └── vite.config.js
│
├── latconecta_users/            # Frontend Users
│   ├── src/
│   │   ├── App.jsx              # Rutas: / select/ shop/ profile/ login/
│   │   ├── views/               # WelcomeView, SelectView, ShopView, ProfileView
│   │   ├── components/
│   │   │   ├── PurchasePopup.jsx   # Componente crítico (flujo compra)
│   │   │   ├── OperationsPanel.jsx # Control fase1/fase2
│   │   │   ├── payment/            # IzipayCheckout.jsx
│   │   │   ├── auth/               # LoginModal, SignUpModal
│   │   │   └── common/             # Header, Footer, Notification
│   │   ├── services/            # 13 servicios activos
│   │   └── utils/               # imageHelper, uploadHelper
│   ├── dist/                    # Build de producción (servido por Nginx)
│   ├── package.json
│   └── vite.config.js
│
└── vendor_simulator/            # Vendor Simulator
    ├── vendor_simulator.py      # Servidor Flask completo
    ├── vendor_simulator.log     # Log de transacciones
    └── .venv/                   # Entorno virtual Python
```

---

## MÉTRICAS DEL SISTEMA <a name="metricas"></a>

### Código

| Componente | Archivos | Líneas aprox. |
|------------|----------|---------------|
| Backend Python | ~75 | ~16,000 |
| Frontend Admin (JSX/JS) | ~45 | ~8,000 |
| Frontend Users (JSX/JS) | ~40 | ~5,000 |
| Vendor Simulator | 1 | ~450 |
| **Total** | **~161** | **~29,500** |

### Base de Datos

| Métrica | Valor |
|---------|-------|
| Tablas | 11 |
| Campos tabla purchases | 60+ |
| Campos totales (todas las tablas) | ~270 |
| Índices | 30+ |
| Triggers | 2 (update timestamps) |
| Constraints CHECK | 8 |
| Foreign Keys | 10 |

### API

| Métrica | Valor |
|---------|-------|
| Routers activos | 16 |
| Endpoints totales | ~85 |
| Endpoints públicos (sin auth) | ~20 |
| Endpoints usuario | ~25 |
| Endpoints admin | ~40 |

### Performance (objetivos)

| Métrica | Objetivo |
|---------|----------|
| Response time API (promedio) | < 200ms |
| Page load time frontend | < 2s |
| Query BD (promedio) | < 50ms |
| Transacción completa end-to-end | < 5s |

---

**FIN DEL DOCUMENTO 01**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 02 — Base de Datos Completa*


---

<a name="02-base-datos-completa"></a>

# DOCUMENTO 02
## BASE DE DATOS COMPLETA — SISTEMA LATCONECTA

**Versión:** 4.4
**Fecha:** Junio 2026
**Motor:** PostgreSQL 14.19
**Base de Datos:** latconecta_db

---

## CONTENIDO

1. [Visión General](#vision)
2. [Diagrama Entidad-Relación](#er)
3. [Organización de Tablas](#organizacion)
4. [Tablas de Catálogo Multi-Tenant](#catalogos)
5. [Tablas Técnicas de Vendor](#vendor)
6. [Tablas de Configuración de APIs](#config-apis)
7. [Tablas Transaccionales](#transaccionales)
8. [Tabla de Sincronización](#sincronizacion)
9. [Tabla Corporativa](#corporativo)
10. [Relaciones y Constraints](#relaciones)
11. [Queries Multi-Tenant Comunes](#queries)

---

## VISIÓN GENERAL <a name="vision"></a>

| Parámetro | Valor |
|-----------|-------|
| Motor | PostgreSQL 14.19 |
| Base de datos | latconecta_db |
| Character Set | UTF-8 |
| Tablas operativas | 15 |
| Campos en purchases | 60+ |
| Foreign Keys | 11 relaciones |
| Índices | 35+ |
| Campos JSONB | 8 (configuraciones dinámicas) |
| Triggers | 2 (update timestamps) |

### Principios de Diseño

- **Normalización:** Tercera forma normal en catálogos
- **Desnormalización controlada:** En purchases para performance y auditoría (snapshots de datos del vendor al momento de la compra)
- **Multi-Tenant:** Jerarquía countries → services → companies → products
- **Auditoría:** Campos `created_by`, `updated_by`, `last_update_date` en todas las tablas
- **Flexibilidad:** Campos JSONB para configuraciones dinámicas de API Mappings
- **Integridad referencial:** Foreign keys con ON DELETE RESTRICT o CASCADE según entidad

---

## DIAGRAMA ENTIDAD-RELACIÓN <a name="er"></a>

```
┌─────────────────┐
│    latconecta   │  (1 registro — info corporativa)
└─────────────────┘

┌─────────────────┐
│    countries    │──────────────────────────────────┐
│  country_id PK  │                                  │
│  country_code   │                                  │
└────────┬────────┘                                  │
         │ FK: country_id                            │ FK: country_id
         ▼                                           ▼
┌─────────────────┐                      ┌───────────────────┐
│    services     │◄─────────────────────│    companies      │
│  service_id PK  │   FK: service_id     │  company_id PK    │
└────────┬────────┘                      └─────────┬─────────┘
         │ FK: service_id                          │ FK: company_id
         │                                         │
         └──────────────────┬──────────────────────┘
                            │ FK: service_id + company_id
                            ▼                + country_id
                  ┌─────────────────┐
                  │    products     │
                  │  product_id PK  │
                  │  product_vendor_code ─────────────┐
                  │  product_vendpro_code              │ referencial
                  │  product_vendpro_skuid             │ (no FK formal)
                  └────────┬────────┘                  │
                           │ FK: product_id             │
                           ▼                            ▼
                  ┌─────────────────┐      ┌───────────────────────┐
                  │    purchases    │      │    vendor_products    │
                  │  purchase_id PK │      │  vp_id PK             │
                  │  purchase_user_id──┐   │  vendor_code FK ──────┤
                  └─────────────────┘  │   │  api_group_code       │
                                       │   └───────────────────────┘
                  ┌─────────────────┐  │
                  │      users      │◄─┘   ┌───────────────────────┐
                  │  user_id PK     │      │       vendors         │
                  └─────────────────┘      │  vendor_code PK       │
                                           └──────────┬────────────┘
                                                      │ FK: vendor_code
                                           ┌──────────┴────────────┐
                                           │                       │
                                           ▼                       ▼
                                ┌──────────────────┐  ┌───────────────────────┐
                                │vendor_api_mappings│  │  vendor_sync_logs    │
                                │  mapping_id PK   │  │  sync_id PK          │
                                │  mapping_code    │  │  vendor_code FK      │
                                │  vendor_code FK  │  └───────────────────────┘
                                │  api_group_code  │
                                │  operation_type  │
                                └──────────────────┘
```

### Relación api_group_code

El campo `api_group_code` es el vínculo entre `vendor_products` y `vendor_api_mappings`. No es una FK formal sino un código de agrupación que permite que un vendor_product tenga asociadas múltiples operaciones (provision, validation, query, reversal, catalog_sync) bajo el mismo grupo de APIs.

```
vendor_products.api_group_code ←→ vendor_api_mappings.api_group_code
                                    (+ vendor_code + operation_type)
```

**Ejemplo LATCOM:**
```
vendor_products: api_group_code = 'LC01T'  (grupo TopUps Peru)
vendor_api_mappings:
  - vendor=LATCOM, group=LC01T, operation=provision  → POST /api/v1/topup
  - vendor=LATCOM, group=LC01T, operation=validation → POST /api/v1/validate
  - vendor=LATCOM, group=LC01T, operation=query      → GET /api/v1/status
```

**Ejemplo MEGAPUNTO:**
```
vendor_products: api_group_code = 'MP01T'  (grupo TopUps MEGAPUNTO)
vendor_api_mappings:
  - vendor=MEGAPUNTO, group=MP01T, operation=provision → POST /Recarga/procesar
  - vendor=MEGAPUNTO, group=MP02S, operation=catalog_sync → POST /Producto/Sel
```

---

## ORGANIZACIÓN DE TABLAS <a name="organizacion"></a>

| Grupo | Tablas | Propósito |
|-------|--------|-----------|
| Catálogo Multi-Tenant | countries, services, companies, products | Jerarquía de productos comerciales |
| Técnico Vendor | vendors, vendor_products | Configuración técnica de proveedores |
| Configuración APIs | vendor_api_mappings | Motor de integración sin código |
| Transaccional | purchases, users | Operaciones y usuarios |
| Sincronización | vendor_sync_logs | Historial de sincronizaciones de catálogo |
| Corporativo | latconecta | Información de la empresa |

---

## TABLAS DE CATÁLOGO MULTI-TENANT <a name="catalogos"></a>

### countries — Países

Define los mercados donde opera el sistema.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| country_id | integer | NOT NULL | auto | PK |
| country_code | varchar(3) | NOT NULL | — | Código ISO 3166-1 alpha-3 (PER, MEX, VEN) |
| country_name | varchar(100) | NOT NULL | — | Nombre del país |
| country_flag_photo | varchar(500) | NULL | — | URL foto bandera |
| country_photo | varchar(500) | NULL | — | URL foto representativa |
| country_description | varchar(500) | NULL | — | Descripción |
| status | varchar(20) | NULL | 'active' | Estado: active, inactive |
| country_er_usd | numeric(10,6) | NULL | 3.75 | Tipo de cambio USD (ej: 3.75 para PEN) |
| country_er_date | timestamp | NULL | NOW() | Fecha última actualización tipo cambio |
| created_by | varchar(100) | NULL | — | Auditoría |
| updated_by | varchar(100) | NULL | — | Auditoría |
| last_update_date | timestamp | NULL | NOW() | Auditoría |

**Índices:** PK en country_id, UNIQUE en country_code.

**Nota importante:** `country_code` usa 3 caracteres (PER, MEX, VEN). Los vendors como LATCOM/Relier esperan 2 caracteres (PE, MX, VE). La transformación `country_alpha3_to_alpha2` en el motor de API Mappings resuelve esta diferencia automáticamente.

---

### services — Servicios

Define los tipos de servicio disponibles. Es el segundo nivel de la jerarquía multi-tenant.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| service_id | integer | NOT NULL | auto | PK |
| service_name | varchar(50) | NOT NULL | — | Nombre exacto del servicio |
| service_photo | varchar(500) | NULL | — | URL ícono del servicio |
| service_photo_mkt | varchar(500) | NULL | — | URL foto marketing |
| service_description | varchar(500) | NULL | — | Descripción |
| status | varchar(20) | NULL | 'active' | Estado |
| created_by | varchar(100) | NULL | — | Auditoría |
| updated_by | varchar(100) | NULL | — | Auditoría |
| last_update_date | timestamp | NULL | NOW() | Auditoría |

**Valores de service_name:** Los nombres exactos son críticos para la lógica del sistema:
- `TopUps` — recargas de saldo
- `Paquetes` — paquetes de datos/minutos
- `Bill Payment` — pago de servicios (luz, agua, telefonía fija)
- `Transfers` — transferencias
- `Smartphones` — venta de dispositivos

**Nota:** `service_name` es leído por el backend para determinar el tipo de producto y la lógica de validación aplicable (teléfono vs cuenta).

---

### companies — Compañías Operadoras

Define las operadoras disponibles por combinación país-servicio. Tercer nivel de la jerarquía.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| company_id | integer | NOT NULL | auto | PK |
| company_name | varchar(50) | NOT NULL | — | Nombre de la operadora |
| company_logo | varchar(500) | NULL | — | URL logo |
| company_photo | varchar(500) | NULL | — | URL foto principal |
| company_photo_mkt1..4 | varchar(500) | NULL | — | URLs fotos de marketing (4 fotos) |
| company_description5 | varchar(500) | NULL | — | Descripción |
| company_lema_1 | varchar(500) | NULL | — | Eslogan línea 1 |
| company_lema_2 | varchar(500) | NULL | — | Eslogan línea 2 |
| company_status | varchar(20) | NULL | 'active' | Estado |
| company_usd_balance | numeric(10,2) | NULL | 0.00 | Balance referencial en USD |
| company_usd_date_balance | date | NULL | — | Fecha balance USD |
| company_local_currency | varchar(3) | NULL | — | Moneda local (PEN, MXN) |
| company_local_balance | numeric(12,2) | NULL | — | Balance referencial en moneda local |
| company_local_date_balance | timestamp | NULL | — | Fecha balance local |
| company_barcode_available | varchar(2) | NULL | 'No' | Acepta pago barcode: Si / No |
| company_mail_customer_support | varchar(255) | NULL | — | Email soporte al cliente |
| company_mail_commercial_support | varchar(255) | NULL | — | Email soporte comercial |
| country_id | integer | NOT NULL | — | FK → countries |
| service_id | integer | NOT NULL | — | FK → services |
| created_by | varchar(100) | NULL | — | Auditoría |
| updated_by | varchar(100) | NULL | — | Auditoría |
| last_update_date | timestamp | NULL | NOW() | Auditoría |

**Constraints:**
- `company_barcode_available` solo acepta 'Si' o 'No'
- `company_mail_customer_support` validado como email válido (regex)
- FK a countries con ON DELETE RESTRICT
- FK a services con ON DELETE RESTRICT

**Índices:** PK en company_id, índices en country_id y service_id.

---

### products — Productos Comerciales

Define los productos visibles al usuario final. Cuarto nivel de la jerarquía. Contiene información de marketing y precios comerciales.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| product_id | integer | NOT NULL | auto | PK |
| service_id | integer | NOT NULL | — | FK → services |
| country_id | integer | NOT NULL | — | FK → countries |
| company_id | integer | NOT NULL | — | FK → companies |
| product_code | varchar(50) | NOT NULL | — | Código único del producto |
| product_name | varchar(100) | NOT NULL | — | Nombre visible al usuario |
| product_description | varchar(500) | NULL | — | Descripción |
| product_photo | varchar(500) | NULL | — | URL foto del producto |
| product_currency | varchar(10) | NOT NULL | — | Moneda de venta (PEN, MXN) |
| product_amount_type | varchar(1) | NOT NULL | 'F' | F=Fixed, R=Range, V=Variable |
| product_base_price | numeric(10,2) | NOT NULL | — | Precio base (único si F, mínimo si R) |
| product_base_price_max | numeric(10,2) | NULL | — | Precio máximo (solo si R) |
| product_discount_percentage | numeric(5,2) | NOT NULL | 0 | Descuento en porcentaje |
| product_discount_amount | numeric(10,2) | NOT NULL | 0 | Monto calculado: `base_price × (discount_pct / 100)` — siempre derivado del porcentaje, no independiente |
| product_discount_amount_max | numeric(10,2) | NULL | NULL | Descuento máximo (solo si R) |
| product_fee | numeric(10,2) | NOT NULL | 0 | Cargo adicional |
| product_total_price | numeric(10,2) | NOT NULL | — | `ROUND(base - (base × discount_pct/100) + fee, 2)` |
| product_total_price_max | numeric(10,2) | NULL | NULL | Precio total máximo (solo si R) |
| product_vendor_code | varchar(100) | NULL | — | Referencia al vendor (referencial) |
| product_vendpro_code | varchar(50) | NOT NULL | 'Vend001' | Código del vendor_product asociado |
| product_vendpro_skuid | varchar(50) | NOT NULL | — | SKU del vendor_product asociado |
| product_status | varchar(20) | NOT NULL | 'active' | Estado |
| created_by | varchar(100) | NULL | — | Auditoría |
| updated_by | varchar(100) | NULL | — | Auditoría |
| last_update_date | timestamp | NULL | NOW() | Auditoría |

**Tipos de monto (`product_amount_type`):**

| Tipo | Descripción | Campos requeridos |
|------|-------------|------------------|
| F | Fixed — monto fijo único | product_base_price |
| R | Range — el usuario elige monto dentro del rango | product_base_price (mín) + product_base_price_max |
| V | Variable — monto determinado por validación de cuenta | product_base_price (referencial) |

**Fórmula de precios — Regla crítica:**

Los campos de descuento y precio total siguen una relación fija:
```
product_discount_amount = ROUND(product_base_price × product_discount_percentage / 100, 2)
product_total_price     = ROUND(product_base_price - product_discount_amount + product_fee, 2)
```

`product_discount_amount` **nunca es un valor independiente** — siempre se deriva del porcentaje. Cuando el catalog_sync actualiza `product_base_price`, recalcula automáticamente `product_discount_amount` y `product_total_price` aplicando esta fórmula.

**Vinculación con vendor_products:** El trio `(product_vendor_code, product_vendpro_code, product_vendpro_skuid)` identifica unívocamente el vendor_product técnico.

**Constraints:**
- UNIQUE en product_code
- CHECK `product_amount_type` IN ('F','R','V')
- CHECK que si type='R', product_base_price_max NOT NULL

**Índices:** PK, UNIQUE en product_code, índices en service_id, company_id, country_id, product_status, product_amount_type, product_vendor_code, y combinado (vendor_code, vendpro_code, vendpro_skuid).

---

## TABLAS TÉCNICAS DE VENDOR <a name="vendor"></a>

### vendors — Proveedores Técnicos

Almacena la configuración técnica y credenciales de cada vendor. Incluye sistema de balance dual (USD + moneda local) y campos de control de sincronización automática de catálogo.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| vendor_code | varchar(50) | NOT NULL | — | PK — código único (LATCOM, MEGAPUNTO) |
| vendor_name | varchar(100) | NOT NULL | — | Nombre técnico |
| vendor_display_name | varchar(100) | NULL | — | Nombre para mostrar en UI |
| vendor_description | text | NULL | — | Descripción |
| vendor_url_uat | varchar(255) | NULL | — | URL ambiente UAT/Testing |
| vendor_url_prod | varchar(255) | NULL | — | URL ambiente Producción |
| vendor_username | varchar(100) | NULL | — | Usuario para autenticación |
| vendor_password | varchar(255) | NULL | — | Password cifrado |
| vendor_api_key | varchar(255) | NULL | — | API Key (x-api-key en LATCOM) |
| vendor_user_uid | varchar(100) | NULL | — | User UID específico del vendor |
| vendor_access_token | text | NULL | — | Token de acceso actual (renovado automáticamente) |
| vendor_token_expiry | timestamp | NULL | — | Expiración del token actual |
| vendor_usd_balance | numeric(15,2) | NULL | — | Balance en USD |
| vendor_usd_date_balance | timestamp | NULL | — | Última actualización balance USD |
| vendor_local_currency | varchar(10) | NULL | — | Moneda local del vendor (PEN, MXN) |
| vendor_local_balance | numeric(10,2) | NULL | — | Balance en moneda local |
| vendor_local_date_balance | timestamp | NULL | — | Última actualización balance local |
| vendor_status | varchar(20) | NULL | 'active' | Estado: active, inactive |
| vendor_timeout | integer | NULL | 45 | Timeout HTTP en segundos |
| is_production | boolean | NULL | false | TRUE = usar URL prod, FALSE = usar URL UAT |
| auto_sync_products | boolean | NULL | false | Habilita sincronización automática de catálogo |
| sync_interval_hours | integer | NULL | 24 | Intervalo de sincronización en horas (legacy — ver sync_time) |
| sync_time | varchar(5) | NULL | '06:00' | Hora fija diaria de sync automático (formato HH:MM) |
| last_sync_date | timestamp | NULL | — | Fecha/hora de la última sincronización ejecutada |
| created_by | varchar(100) | NULL | — | Auditoría |
| updated_by | varchar(100) | NULL | — | Auditoría |
| created_at | timestamp | NULL | NOW() | Auditoría |
| last_update_date | timestamp | NULL | NOW() | Auditoría |

**Sistema de Balance Dual:**
El vendor puede tener balance en dos monedas simultáneamente. El sistema selecciona cuál usar según la moneda del vendor_product:
- Si `vp_currency = 'USD'` → usa `vendor_usd_balance`
- Si `vp_currency != 'USD'` → usa `vendor_local_balance`

**Selección de URL:**
- `is_production = false` → usa `vendor_url_uat`
- `is_production = true` → usa `vendor_url_prod`

**Control de Sincronización Automática:**
- `auto_sync_products = true` → el scheduler ejecuta catalog_sync diariamente a la hora indicada en `sync_time`
- `sync_time` define la hora fija de ejecución (ej: '06:00' = 6:00 AM local del servidor)
- `last_sync_date` se actualiza tras cada sync exitoso — el scheduler lo usa para evitar doble ejecución en el mismo día

**Índices:** PK en vendor_code, índices en vendor_status y vendor_usd_date_balance DESC.

---

### vendor_products — Productos Técnicos del Vendor

Define los productos disponibles en cada vendor con sus características técnicas. Es el puente entre el catálogo comercial (products) y el vendor externo.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| vp_id | integer | NOT NULL | auto | PK |
| vendor_code | varchar(50) | NOT NULL | — | FK → vendors (ON DELETE CASCADE) |
| api_group_code | varchar(50) | NULL | — | Código de grupo de APIs (vincula con vendor_api_mappings) |
| vp_code | varchar(100) | NOT NULL | — | Código del producto en el vendor |
| vp_skuid | varchar(100) | NULL | — | SKU del producto en el vendor |
| vp_name | varchar(255) | NULL | — | Nombre del producto |
| vp_description | text | NULL | — | Descripción |
| vp_operator | varchar(50) | NULL | — | Operador: bitel, claro, movistar, entel, telcel |
| vp_country | varchar(50) | NULL | — | País en formato alpha-3: PER, MEX, VEN |
| vp_currency | varchar(10) | NULL | — | Moneda: PEN, USD, MXN, VES |
| vp_amount | numeric(10,2) | NULL | — | Monto fijo. NULL si vp_amount_type='range' (el monto lo define product_base_price) |
| vp_amount_type | varchar(20) | NULL | — | Tipo: fixed, range, variable |
| vp_minimum_amount | numeric(10,2) | NULL | — | Monto mínimo (para rangos) |
| vp_maximum_amount | numeric(10,2) | NULL | — | Monto máximo (para rangos) |
| vp_product_type | char(1) | NULL | — | Tipo de producto del vendor (1 carácter) |
| vp_service_type | varchar(50) | NULL | — | Tipo servicio: data, voice, sms, combo |
| vp_commission | numeric(10,2) | NULL | — | Comisión del vendor |
| vp_cost | numeric(10,2) | NULL | — | Costo real del vendor |
| vp_fee_usd | numeric(10,5) | NOT NULL | 0.00000 | Fee en USD |
| vp_status | varchar(20) | NULL | 'active' | Estado: active, inactive |
| vp_metadata | jsonb | NULL | — | Metadata adicional en JSON |
| created_by | varchar(100) | NULL | — | Auditoría |
| updated_by | varchar(100) | NULL | — | Auditoría |
| created_at | timestamp | NULL | NOW() | Auditoría |
| last_update_date | timestamp | NULL | NOW() | Auditoría |

**Campo `vp_amount` cuando es NULL:**
Aplica cuando `vp_amount_type = 'range'` y el vendor usa una sola API para todos los montos (ej: MEGAPUNTO/TISI). En ese caso el monto a enviar al vendor es `product_base_price` del producto comercial de Latconecta. Esta lógica está implementada en `purchase_calculator_service.py`.

**Campo `vp_metadata`:**
Usado principalmente para productos Venezuela (precios dinámicos en Bolívares). Estructura:
```json
{
  "precio_referencial": "500.00",
  "moneda_referencial": "VES",
  "tipo_cambio": "109.060000",
  "last_sync_date": "2026-04-18T06:00:00",
  "last_sync_by": "scheduler"
}
```

**Constraints:**
- UNIQUE en (vendor_code, vp_code, vp_skuid)
- CHECK vp_status IN ('active', 'inactive')
- Trigger: actualiza last_update_date en cada UPDATE

**Índices:** PK, UNIQUE (vendor_code, vp_code, vp_skuid), índices en api_group_code, vp_code, (vp_operator, vp_country), (vendor_code, vp_status).

---

## TABLAS DE CONFIGURACIÓN DE APIS <a name="config-apis"></a>

### vendor_api_mappings — Motor de Integración Sin Código

La tabla más importante del sistema de integración. Define cómo comunicarse con cada API de vendor sin escribir código.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| mapping_id | integer | NOT NULL | auto | PK |
| mapping_code | varchar(5) | NOT NULL | — | Código único de 5 chars (ej: LC01T, MP02S) |
| vendor_code | varchar(50) | NOT NULL | — | FK → vendors (ON DELETE CASCADE) |
| api_group_code | varchar(50) | NOT NULL | — | Código de grupo (ej: LC01T para TopUps LATCOM Perú) |
| operation_type | varchar(50) | NOT NULL | — | Tipo: provision, validation, query, reversal, catalog_sync |
| http_method | varchar(10) | NULL | 'POST' | Método HTTP |
| endpoint_url | varchar(500) | NULL | — | Ruta del endpoint (ej: /api/v1/topup) |
| auth_type | varchar(50) | NULL | — | bearer, api_key_header, basic, none |
| auth_config | jsonb | NULL | — | Configuración de autenticación |
| request_mapping | jsonb | NOT NULL | — | Mapeo Purchase → Vendor API |
| value_transformations | jsonb | NULL | — | Transformaciones de valores |
| response_mapping | jsonb | NULL | — | Mapeo Vendor API → Purchase. Para catalog_sync: metadatos del array de respuesta |
| success_indicators | jsonb | NULL | — | Cómo detectar éxito en la respuesta |
| timeout_seconds | integer | NULL | 30 | Timeout HTTP |
| headers | jsonb | NULL | — | Headers HTTP adicionales |
| is_active | boolean | NULL | true | Activo/Inactivo |
| created_at | timestamp | NULL | NOW() | Auditoría |
| updated_at | timestamp | NULL | NOW() | Auditoría |

**Constraint UNIQUE:** (vendor_code, api_group_code, operation_type) — garantiza un solo mapping activo por grupo + operación.

**Índices:** PK, UNIQUE en mapping_code, UNIQUE en (vendor_code, api_group_code, operation_type), índice en api_group_code.

**Valores de operation_type:**

| Valor | Descripción |
|-------|-------------|
| `provision` | Provisión del servicio al usuario final |
| `validation` | Validación de teléfono o número de cuenta |
| `query` | Consulta del estado de una transacción |
| `reversal` | Reversión de una transacción |
| `catalog_sync` | Sincronización de precios desde el vendor |

**Estructura de los campos JSONB:**

`request_mapping` — formato fields array (legado):
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
    }
  ]
}
```

`request_mapping` — formato JSONPath (nuevo):
```json
{
  "phone": "purchase_phone_number",
  "amount": "purchase_vendor_amount",
  "country": "purchase_vendpro_country",
  "carrier": "purchase_vendpro_operator"
}
```

`value_transformations`:
```json
{
  "purchase_vendpro_country": {
    "country_alpha3_to_alpha2": true
  },
  "purchase_phone_number": {
    "trim": true
  }
}
```

`success_indicators`:
```json
{
  "status_codes": [200],
  "success_field": "success",
  "success_values": [true, "true", "SUCCESS"]
}
```

`response_mapping` — para catalog_sync (metadatos del array):
```json
{
  "array_path":          "productos",
  "skuid_field":         "id_producto",
  "nested_prices_array": "precios",
  "price_pen_field":     "precio",
  "price_ref_field":     "precio_referencial",
  "exchange_rate_field": "tipo_cambio"
}
```

`auth_config` para tipo `bearer` (MEGAPUNTO):
```json
{
  "header_name": "Authorization",
  "token_prefix": "Bearer "
}
```

`auth_config` para tipo `api_key_header` (LATCOM):
```json
{
  "header_name": "x-api-key",
  "extra_headers": {
    "x-customer-id": "{vendor_username}"
  }
}
```

---

## TABLAS TRANSACCIONALES <a name="transaccionales"></a>

### users — Usuarios

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| user_id | integer | NOT NULL | auto | PK |
| user_name | varchar(50) | NOT NULL | — | Nombre |
| user_email | varchar(50) | NOT NULL | — | Email (UNIQUE) |
| user_password | varchar(255) | NOT NULL | — | Hash bcrypt |
| user_photo | varchar(500) | NULL | — | URL foto perfil |
| user_phone_country_code | varchar(50) | NULL | — | Código país del teléfono |
| user_phone_number | varchar(50) | NULL | — | Número de teléfono |
| user_role | varchar(20) | NULL | 'user' | Rol: superadmin, admin, user |
| user_status | varchar(20) | NULL | 'active' | Estado: active, inactive |
| user_session_token | varchar(255) | NULL | — | Token de sesión (reutilizado para código de recuperación de password) |
| user_session_expiry | timestamp | NULL | — | Expiración sesión (reutilizado para expiración del código de recuperación) |
| user_last_login_date | timestamp | NULL | — | Último login |
| created_by | varchar(100) | NULL | — | Auditoría |
| updated_by | varchar(100) | NULL | — | Auditoría |
| last_update_date | timestamp | NULL | NOW() | Auditoría |

**Roles del sistema:**
- `superadmin` — acceso total, puede gestionar usuarios admin
- `admin` — acceso al panel admin, puede gestionar catálogos
- `user` — usuario final, puede hacer compras

**Recuperación de contraseña:** Los campos `user_session_token` y `user_session_expiry` son reutilizados para el flujo de recuperación de contraseña por código email. `user_session_token` almacena el hash bcrypt del código de 6 dígitos; `user_session_expiry` almacena la expiración (15 minutos). Este reutilización evita cambiar el esquema de BD.

**Compras anónimas:** Las compras no requieren usuario registrado. Si `purchase_user_id IS NULL`, la compra es anónima y se identifica por `purchase_reference + purchase_phone_number`.

**Índices:** PK, UNIQUE en user_email, índices en user_email y user_role.

---

### purchases — Transacciones de Compra

La tabla más grande y compleja del sistema. Registra la traza completa de cada transacción con snapshots de datos del vendor al momento de la compra para auditoría e independencia de cambios futuros.

#### Grupo: Identificación

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| purchase_id | integer | NOT NULL | auto | PK |
| purchase_reference | varchar(50) | NOT NULL | — | UNIQUE — referencia legible (REF-YYYYMMDDHHMMSS) |
| purchase_date | timestamp | NOT NULL | NOW() | Fecha y hora de la compra |
| purchase_user_id | integer | NULL | — | FK → users (NULL = compra anónima) |
| purchase_product_id | integer | NULL | — | FK → products |
| purchase_ip_petition | varchar(50) | NULL | — | IP del cliente |

#### Grupo: Producto Comprado

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| purchase_service_name | varchar(100) | NOT NULL | Snapshot: nombre del servicio |
| purchase_product_name | varchar(100) | NOT NULL | Snapshot: nombre del producto |
| purchase_product_type | varchar(50) | NULL | topup, bill_payment, transfer, smartphone, package |
| purchase_phone_number | varchar(15) | NULL | Teléfono destino de la recarga. NULL para Bill Payment |
| purchase_account_number | varchar(100) | NULL | Número de cuenta (Bill Payments) |

**Regla:** `purchase_phone_number` es NULL cuando `purchase_product_type = 'bill_payment'` — en ese caso el identificador del servicio va en `purchase_account_number`.

#### Grupo: Precios y Montos

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| purchase_currency | varchar(10) | NULL | Moneda de venta (PEN, MXN) |
| purchase_base_price | numeric(10,2) | NOT NULL | Precio base del producto |
| purchase_discount | numeric(12,2) | NOT NULL | Descuento aplicado |
| purchase_fee | numeric(12,2) | NOT NULL | Cargo adicional |
| purchase_total_amount | numeric(10,2) | NOT NULL | Total cobrado al usuario |
| purchase_exch_rate | numeric(10,4) | NULL | Tipo de cambio aplicado |

#### Grupo: Pago

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| purchase_payment_method | varchar(50) | NOT NULL | card, barcode |
| purchase_payment_status | varchar(30) | NOT NULL | Pending, Success, Reversed, Refunded |
| purchase_payment_ref | varchar(255) | NULL | Referencia del pago (del gateway) |
| purchase_credit_card_last_digits | varchar(4) | NULL | Últimos 4 dígitos tarjeta |
| purchase_barcode_code | varchar(50) | NULL | Código de barras generado |
| purchase_barcode_image | varchar(255) | NULL | URL imagen del código de barras |
| purchase_receip_url | varchar(255) | NULL | URL del recibo PDF generado (descarga directa) |

#### Grupo: Provisión y Entrega

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| purchase_status | varchar(30) | NULL | Estado global: Pending, Success, Failed |
| purchase_delivery_status | varchar(100) | NULL | Estado delivery (smartphones: Ordered, In Transit, Delivered) |
| purchase_provision_ref | varchar(255) | NULL | Referencia de la provisión exitosa |
| purchase_reversal_ref | varchar(255) | NULL | Referencia de la reversión (si aplica) |
| purchase_delivery_name | varchar(50) | NULL | Nombre destinatario (smartphones) |
| purchase_delivery_phone | varchar(20) | NULL | Teléfono destinatario (smartphones) |
| purchase_delivery_address | varchar(100) | NULL | Dirección entrega (smartphones) |
| requires_manual_intervention | boolean | NOT NULL | Flag crítico: pago OK + provisión FAIL + reversión FAIL |

#### Grupo: Vendor (Datos Técnicos)

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| purchase_vendor_code | varchar(50) | NULL | Código del vendor usado |
| vendor_name | varchar(50) | NULL | Nombre del vendor |
| purchase_vendor_amount | numeric(10,2) | NULL | Monto enviado al vendor |
| purchase_vendor_currency | varchar(10) | NULL | Moneda del vendor |
| purchase_vendor_cost | numeric(10,2) | NULL | Costo real del vendor (para análisis de márgenes) |
| purchase_vendor_skuid | varchar(50) | NULL | SKU en el sistema del vendor |
| purchase_vendor_response_code | varchar(50) | NULL | Código de respuesta del vendor |
| purchase_vendor_response_description | varchar(255) | NULL | Descripción de la respuesta |
| purchase_vendor_purchase_id | varchar(50) | NULL | ID de compra asignado por el vendor |
| purchase_vendor_date_petition | timestamp | NULL | Fecha/hora de la petición al vendor |
| purchase_vendor_date_response | timestamp | NULL | Fecha/hora de la respuesta del vendor |
| purchase_vendor_json | text | NULL | JSON completo de la respuesta del vendor (legacy) |
| vendor_trans_id | varchar(100) | NULL | ID de transacción del vendor (ej: LT123456) |
| vendor_provider_trans_id | varchar(100) | NULL | ID del operador final (ej: BITEL789) |
| vendor_request | text | NULL | JSON completo enviado al vendor (auditoría) |
| vendor_response | text | NULL | JSON completo recibido del vendor (auditoría) |

#### Grupo: Datos Snapshot del Vendor Product

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| purchase_vendpro_code | varchar(50) | NULL | Snapshot: vp_code |
| purchase_vendpro_country | varchar(50) | NULL | Snapshot: vp_country |
| purchase_vendpro_operator | varchar(50) | NULL | Snapshot: vp_operator |
| purchase_vendpro_product_type | char(1) | NULL | Snapshot: vp_product_type |
| purchase_vendpro_amount_type | varchar(20) | NULL | Snapshot: vp_amount_type (F, R, V) |
| purchase_vendpro_maximum_amount | numeric(10,2) | NULL | Snapshot: vp_maximum_amount |

#### Grupo: Balance del Vendor

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| purchase_balance_currency | varchar(10) | NULL | Moneda del balance deducido |
| purchase_initial_balance | numeric(10,2) | NULL | Balance del vendor antes de la compra |
| purchase_final_balance | numeric(10,2) | NULL | Balance del vendor después de la compra |

#### Grupo: Auditoría y Conciliación

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| created_by | varchar(100) | NOT NULL | 'System' | Quién creó el registro |
| updated_by | varchar(100) | NOT NULL | 'System' | Quién actualizó |
| last_update_date | timestamp | NOT NULL | NOW() | Última actualización |
| purchase_date_sent_to_conciliation | timestamp | NULL | — | Fecha de envío a conciliación contable |

**Índices en purchases:**
- PK en purchase_id
- UNIQUE en purchase_reference
- Índice en purchase_date
- Índice en purchase_payment_status
- Índice en purchase_user_id
- Índice en purchase_product_id
- Índice en purchase_phone_number
- Índice en vendor_trans_id (WHERE NOT NULL)
- Índice en vendor_name (WHERE NOT NULL)
- Índice en purchase_vendor_purchase_id
- Índice en requires_manual_intervention
- Índice compuesto (purchase_reference, purchase_phone_number) WHERE purchase_user_id IS NULL — para búsqueda de compras anónimas

---

## TABLA DE SINCRONIZACIÓN <a name="sincronizacion"></a>

### vendor_sync_logs — Historial de Sincronización de Catálogo

Registra el resultado de cada ejecución de sincronización de catálogo de productos (catalog_sync). Permite auditar cambios de precios, detectar errores y monitorear el funcionamiento del scheduler automático.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| sync_id | integer | NOT NULL | auto | PK autoincrement |
| vendor_code | varchar(50) | NOT NULL | — | FK → vendors (ON DELETE CASCADE) |
| api_group_code | varchar(50) | NOT NULL | — | Grupo de APIs usado para el sync (ej: MP02S) |
| sync_date | timestamp | NOT NULL | NOW() | Fecha y hora de ejecución del sync |
| triggered_by | varchar(100) | NOT NULL | 'scheduler' | Quién disparó el sync: 'scheduler' o 'manual:email' |
| status | varchar(20) | NOT NULL | — | Resultado: success, error, no_changes |
| products_reviewed | integer | NOT NULL | 0 | Cantidad de productos revisados en el vendor |
| products_updated | integer | NOT NULL | 0 | Cantidad de productos con precio actualizado |
| error_message | text | NULL | — | Descripción del error (solo si status='error') |
| changes_detail | jsonb | NULL | — | Array JSON con detalle de cada precio revisado |
| created_by | varchar(100) | NOT NULL | 'System' | Auditoría |

**Constraint CHECK en status:**
```sql
status IN ('success', 'error', 'no_changes')
```

**Foreign Key:**
```sql
vendor_code REFERENCES vendors(vendor_code) ON DELETE CASCADE
```
Si se elimina un vendor, se eliminan todos sus logs de sync.

**Índices:**
- PK en sync_id
- Índice en vendor_code
- Índice en sync_date DESC
- Índice compuesto (vendor_code, sync_date DESC) — para consultar el último sync de un vendor específico

**Estructura del campo `changes_detail`:**
Array JSON donde cada elemento representa un producto revisado:
```json
[
  {
    "vp_code": "MP_MOVISTAR_VEN",
    "vp_skuid": "5580",
    "nombre_producto": "Movistar 500 Bs",
    "status": "ACTUALIZADO",
    "vp_amount_old": 4.45,
    "vp_amount_new": 4.58,
    "precio_referencial_bs": "500.00",
    "tipo_cambio": "109.060000",
    "alerta_precio": false
  }
]
```

**Valores de status por ítem en `changes_detail`:**

| Valor | Descripción |
|-------|-------------|
| `ACTUALIZADO` | Precio cambió dentro del rango normal (< 10%) |
| `ALERTA` | Precio cambió más del 10% — requiere revisión |
| `SIN_CAMBIO` | El vendor retornó el mismo precio que ya teníamos |
| `NUEVO` | SKUID retornado por el vendor no existe en nuestra BD |
| `NO_VINO` | SKUID que tenemos en BD no fue retornado por el vendor |

**Valores de `triggered_by`:**

| Valor | Descripción |
|-------|-------------|
| `scheduler` | Ejecución automática programada |
| `manual:email` | Disparado manualmente por un administrador desde el panel |

**Consultas útiles:**
```sql
-- Último sync de cada vendor
SELECT DISTINCT ON (vendor_code)
    vendor_code, sync_date, status, products_reviewed, products_updated
FROM vendor_sync_logs
ORDER BY vendor_code, sync_date DESC;

-- Syncs con alertas de precio
SELECT sync_id, vendor_code, sync_date,
       jsonb_array_elements(changes_detail) AS item
FROM vendor_sync_logs
WHERE changes_detail @> '[{"alerta_precio": true}]';

-- Historial de un vendor
SELECT sync_id, sync_date, triggered_by, status,
       products_reviewed, products_updated
FROM vendor_sync_logs
WHERE vendor_code = 'MEGAPUNTO'
ORDER BY sync_date DESC
LIMIT 30;
```

---

## TABLA CORPORATIVA <a name="corporativo"></a>

### latconecta — Configuración Corporativa

Tabla de un único registro que almacena toda la información corporativa de Latconecta. El `latconecta_id` siempre es 1 (forzado por CHECK constraint).

| Campo | Tipo | Nullable | Descripción |
|-------|------|----------|-------------|
| latconecta_id | integer | NOT NULL | PK — siempre 1 |
| latconecta_name | varchar(50) | NOT NULL | Nombre de la empresa |
| latconecta_logo | varchar(500) | NULL | URL logo |
| latconecta_photo | varchar(500) | NULL | URL foto principal |
| latconecta_photo_mkt1..4 | varchar(500) | NULL | URLs fotos carrusel marketing (4) |
| latconecta_description | varchar(500) | NULL | Descripción de la empresa |
| latconecta_lema_1 | varchar(500) | NULL | Eslogan línea 1 |
| latconecta_lema_2 | varchar(500) | NULL | Eslogan línea 2 |
| latconecta_credit_balance | numeric(12,2) | NULL | Balance de crédito referencial |
| latconecta_date_balance | date | NULL | Fecha balance |
| latconecta_mail_support | varchar(255) | NULL | Email soporte técnico |
| latconecta_mail_comercial | varchar(255) | NULL | Email comercial |
| latconecta_web | varchar(255) | NULL | URL sitio web |
| latconecta_facebook | varchar(255) | NULL | URL Facebook |
| latconecta_instagram | varchar(255) | NULL | URL Instagram |
| latconecta_twitter | varchar(255) | NULL | URL Twitter/X |
| latconecta_linkedin | varchar(255) | NULL | URL LinkedIn |
| latconecta_youtube | varchar(255) | NULL | URL YouTube |
| latconecta_phone | varchar(50) | NULL | Teléfono de contacto |
| latconecta_address | varchar(500) | NULL | Dirección física |
| latconecta_status | varchar(20) | NULL | Estado: active, inactive |
| created_by | varchar(100) | NULL | Auditoría |
| updated_by | varchar(100) | NULL | Auditoría |
| last_update_date | timestamp | NULL | NOW() |

**Constraint:** `CHECK (latconecta_id = 1)` — garantiza que solo puede existir un registro.

---

## RELACIONES Y CONSTRAINTS <a name="relaciones"></a>

### Mapa de Foreign Keys

```
purchases.purchase_user_id      → users.user_id          (ON DELETE SET NULL)
purchases.purchase_product_id   → products.product_id    (ON DELETE RESTRICT)
products.service_id             → services.service_id    (ON DELETE RESTRICT)
products.country_id             → countries.country_id   (ON DELETE RESTRICT)
products.company_id             → companies.company_id   (ON DELETE RESTRICT)
companies.country_id            → countries.country_id   (ON DELETE RESTRICT)
companies.service_id            → services.service_id    (ON DELETE RESTRICT)
vendor_products.vendor_code     → vendors.vendor_code    (ON DELETE CASCADE)
vendor_api_mappings.vendor_code → vendors.vendor_code    (ON DELETE CASCADE)
vendor_sync_logs.vendor_code    → vendors.vendor_code    (ON DELETE CASCADE)
```

**Nota sobre ON DELETE CASCADE en vendor:**
Si se elimina un vendor, se eliminan automáticamente sus vendor_products, sus vendor_api_mappings y su historial de sync logs. Esto es intencional — sin vendor no hay productos, mappings ni historial asociado.

### Relación Referencial No-FK: products → vendor_products

El vínculo entre products y vendor_products es referencial (no hay FK formal) para permitir flexibilidad en la configuración:

```
products.product_vendor_code  (referencia a vendors.vendor_code)
products.product_vendpro_code  (referencia a vendor_products.vp_code)
products.product_vendpro_skuid (referencia a vendor_products.vp_skuid)
```

El backend resuelve el vendor_product haciendo:
```sql
SELECT * FROM vendor_products
WHERE vendor_code = products.product_vendor_code
  AND vp_code = products.product_vendpro_code
  AND vp_skuid = products.product_vendpro_skuid
```

---

## QUERIES MULTI-TENANT COMUNES <a name="queries"></a>

### Catálogo completo para un país

```sql
-- Servicios disponibles para un país
SELECT s.*
FROM services s
JOIN companies c ON c.service_id = s.service_id
JOIN countries co ON co.country_id = c.country_id
WHERE co.country_code = 'PER'
  AND c.company_status = 'active'
GROUP BY s.service_id;

-- Compañías para país + servicio
SELECT c.*
FROM companies c
JOIN countries co ON co.country_id = c.country_id
WHERE co.country_code = 'PER'
  AND c.service_id = 1
  AND c.company_status = 'active';

-- Productos para una compañía
SELECT p.*, vp.api_group_code, vp.vp_amount_type, vp.vp_maximum_amount
FROM products p
LEFT JOIN vendor_products vp ON (
    vp.vendor_code = p.product_vendor_code
    AND vp.vp_code = p.product_vendpro_code
    AND vp.vp_skuid = p.product_vendpro_skuid
)
WHERE p.company_id = 5
  AND p.product_status = 'active';
```

### Lookup de API Mapping

```sql
-- Buscar mapping para una operación
SELECT *
FROM vendor_api_mappings
WHERE vendor_code = 'MEGAPUNTO'
  AND api_group_code = 'MP01T'
  AND operation_type = 'provision'
  AND is_active = true;
```

### Historial de compras de un usuario

```sql
SELECT p.*, pr.product_name
FROM purchases p
LEFT JOIN products pr ON pr.product_id = p.purchase_product_id
WHERE p.purchase_user_id = 5
ORDER BY p.purchase_date DESC
LIMIT 20;
```

### Compras que requieren intervención manual

```sql
SELECT purchase_id, purchase_reference, purchase_date,
       purchase_total_amount, purchase_payment_status,
       vendor_name, vendor_trans_id
FROM purchases
WHERE requires_manual_intervention = true
ORDER BY purchase_date DESC;
```

### Balance de vendors

```sql
SELECT vendor_code, vendor_name,
       vendor_usd_balance, vendor_usd_date_balance,
       vendor_local_currency, vendor_local_balance, vendor_local_date_balance,
       is_production, last_sync_date
FROM vendors
WHERE vendor_status = 'active'
ORDER BY vendor_code;
```

### Estado de sincronización de catálogos

```sql
-- Último sync de cada vendor con auto_sync habilitado
SELECT DISTINCT ON (v.vendor_code)
    v.vendor_code, v.vendor_name,
    v.auto_sync_products, v.sync_time,
    vsl.sync_date AS last_sync_date,
    vsl.status AS last_sync_status,
    vsl.products_updated
FROM vendors v
LEFT JOIN vendor_sync_logs vsl ON vsl.vendor_code = v.vendor_code
WHERE v.auto_sync_products = true
ORDER BY v.vendor_code, vsl.sync_date DESC;
```

---

**FIN DEL DOCUMENTO 02**

*Versión: 4.3 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 03 — Diccionario de Datos Completo*


---

<a name="03-diccionario-datos-completo"></a>

# DOCUMENTO 03
## DICCIONARIO DE DATOS COMPLETO — LATCONECTA v2.0.0

**Versión:** 4.1
**Fecha:** Mayo 2026
**Base de Datos:** PostgreSQL 14.19 — latconecta_db

---

## CONTENIDO

1. [Convenciones y Estándares](#convenciones)
2. [Tabla: countries](#countries)
3. [Tabla: services](#services)
4. [Tabla: companies](#companies)
5. [Tabla: vendors](#vendors)
6. [Tabla: vendor_products](#vendor-products)
7. [Tabla: vendor_api_mappings](#api-mappings)
8. [Tabla: products](#products)
9. [Tabla: users](#users)
10. [Tabla: purchases](#purchases)
11. [Tabla: vendor_sync_logs](#vendor-sync-logs)
12. [Tabla: latconecta](#latconecta)
13. [Enumeraciones y Valores Permitidos](#enums)
14. [Reglas de Negocio Críticas](#reglas)

---

## CONVENCIONES Y ESTÁNDARES <a name="convenciones"></a>

### Nomenclatura

- Nombres de tablas: `snake_case` en plural (countries, vendors, purchases)
- Nombres de campos: `tabla_campo` donde aplica (purchase_status, vendor_code)
- Primary Keys: `tabla_id` para autoincrement, o el campo natural cuando es string (vendor_code, country_code)
- Foreign Keys: usan el mismo nombre del PK referenciado

### Campos de Auditoría

Presentes en todas las tablas excepto latconecta (donde son opcionales):

| Campo | Tipo | Propósito |
|-------|------|-----------|
| created_by | varchar(100) | Usuario o proceso que creó el registro |
| updated_by | varchar(100) | Usuario o proceso que actualizó el registro |
| last_update_date | timestamp | Fecha y hora de última modificación |
| created_at | timestamp | Fecha de creación (en algunas tablas) |

### Tipos Especiales

- **JSONB:** Usado para configuraciones dinámicas (vendor_api_mappings, vp_metadata, changes_detail). Permite indexación y consultas dentro del JSON.
- **NUMERIC(p,s):** Para montos financieros — evita errores de punto flotante.
- **CHAR(1):** Para campos codificados de un solo carácter (vp_product_type, purchase_vendpro_product_type).

---

## TABLA: countries <a name="countries"></a>

Almacena los mercados donde opera el sistema. Primer nivel de la jerarquía multi-tenant.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| country_id | integer | NO | auto | PK autoincrement | 1 |
| country_code | varchar(3) | NO | — | Código ISO 3166-1 alpha-3 UNIQUE | 'PER', 'MEX', 'VEN' |
| country_name | varchar(100) | NO | — | Nombre completo | 'Perú', 'México' |
| country_flag_photo | varchar(500) | SÍ | NULL | URL bandera | '/uploads/flags/pe.png' |
| country_photo | varchar(500) | SÍ | NULL | URL foto representativa | '/uploads/countries/peru.jpg' |
| country_description | varchar(500) | SÍ | NULL | Descripción del mercado | 'Mercado peruano' |
| status | varchar(20) | SÍ | 'active' | Estado | 'active', 'inactive' |
| country_er_usd | numeric(10,6) | SÍ | 3.75 | Tipo de cambio local/USD | 3.750000 |
| country_er_date | timestamp | SÍ | NOW() | Fecha actualización tipo cambio | 2026-03-25 10:00:00 |
| created_by | varchar(100) | SÍ | — | Auditoría | 'admin@latconecta.com' |
| updated_by | varchar(100) | SÍ | — | Auditoría | 'admin@latconecta.com' |
| last_update_date | timestamp | SÍ | NOW() | Auditoría | 2026-03-25 10:00:00 |

**Notas importantes:**
- `country_code` usa 3 caracteres (alpha-3). La transformación a 2 caracteres para vendors externos se hace en el motor de API Mappings (`country_alpha3_to_alpha2`).
- `country_er_usd` es el tipo de cambio que el sistema usa para conversiones. Se actualiza periódicamente por el scheduler.

---

## TABLA: services <a name="services"></a>

Define los tipos de servicio disponibles. Segundo nivel de la jerarquía.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| service_id | integer | NO | auto | PK autoincrement | 1 |
| service_name | varchar(50) | NO | — | Nombre del servicio (crítico — usado por lógica backend) | 'TopUps' |
| service_photo | varchar(500) | SÍ | NULL | URL ícono del servicio | '/uploads/services/topups.svg' |
| service_photo_mkt | varchar(500) | SÍ | NULL | URL foto marketing | '/uploads/services/topups_mkt.jpg' |
| service_description | varchar(500) | SÍ | NULL | Descripción | 'Recargas de saldo móvil' |
| status | varchar(20) | SÍ | 'active' | Estado | 'active', 'inactive' |
| created_by | varchar(100) | SÍ | — | Auditoría | — |
| updated_by | varchar(100) | SÍ | — | Auditoría | — |
| last_update_date | timestamp | SÍ | NOW() | Auditoría | — |

**Valores válidos de service_name (críticos — no modificar sin revisar lógica backend):**

| Valor | Descripción | Validación que aplica |
|-------|-------------|----------------------|
| `TopUps` | Recargas de saldo | Teléfono |
| `Paquetes` | Paquetes de datos/minutos | Teléfono |
| `Bill Payment` | Pago de servicios | Número de cuenta |
| `Transfers` | Transferencias | Teléfono |
| `Smartphones` | Venta de dispositivos | Teléfono + datos entrega |

---

## TABLA: companies <a name="companies"></a>

Define las operadoras disponibles por combinación país-servicio.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| company_id | integer | NO | auto | PK autoincrement | 1 |
| country_id | integer | NO | — | FK → countries | 1 |
| service_id | integer | NO | — | FK → services | 1 |
| company_name | varchar(50) | NO | — | Nombre de la operadora | 'Claro Perú' |
| company_logo | varchar(500) | SÍ | NULL | URL logo | '/uploads/companies/claro.png' |
| company_photo | varchar(500) | SÍ | NULL | URL foto principal | — |
| company_photo_mkt1 | varchar(500) | SÍ | NULL | URL foto marketing 1 | — |
| company_photo_mkt2 | varchar(500) | SÍ | NULL | URL foto marketing 2 | — |
| company_photo_mkt3 | varchar(500) | SÍ | NULL | URL foto marketing 3 | — |
| company_photo_mkt4 | varchar(500) | SÍ | NULL | URL foto marketing 4 | — |
| company_description5 | varchar(500) | SÍ | NULL | Descripción | — |
| company_lema_1 | varchar(500) | SÍ | NULL | Eslogan línea 1 | 'Conectando vidas' |
| company_lema_2 | varchar(500) | SÍ | NULL | Eslogan línea 2 | — |
| company_status | varchar(20) | SÍ | 'active' | Estado | 'active', 'inactive' |
| company_usd_balance | numeric(10,2) | SÍ | 0.00 | Balance referencial USD | 1500.00 |
| company_usd_date_balance | date | SÍ | NULL | Fecha balance USD | 2026-03-25 |
| company_local_currency | varchar(3) | SÍ | NULL | Moneda local | 'PEN' |
| company_local_balance | numeric(12,2) | SÍ | NULL | Balance referencial local | 5625.00 |
| company_local_date_balance | timestamp | SÍ | NULL | Fecha balance local | — |
| company_barcode_available | varchar(2) | SÍ | 'No' | Acepta pago barcode | 'Si', 'No' |
| company_mail_customer_support | varchar(255) | SÍ | NULL | Email soporte cliente | 'soporte@claro.com.pe' |
| company_mail_commercial_support | varchar(255) | SÍ | NULL | Email soporte comercial | — |
| created_by | varchar(100) | SÍ | — | Auditoría | — |
| updated_by | varchar(100) | SÍ | — | Auditoría | — |
| last_update_date | timestamp | SÍ | NOW() | Auditoría | — |

**Campo crítico:** `company_barcode_available` — el frontend lo lee para mostrar u ocultar la opción de pago con código de barras. Solo acepta exactamente 'Si' o 'No' (constraint CHECK).

---

## TABLA: vendors <a name="vendors"></a>

Configuración técnica y credenciales de cada proveedor externo.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| vendor_code | varchar(50) | NO | — | PK — código único del vendor | 'LATCOM', 'MEGAPUNTO' |
| vendor_name | varchar(100) | NO | — | Nombre técnico | 'LATCOM Internacional' |
| vendor_display_name | varchar(100) | SÍ | NULL | Nombre para UI | 'LATCOM' |
| vendor_description | text | SÍ | NULL | Descripción | — |
| vendor_url_uat | varchar(255) | SÍ | NULL | URL ambiente UAT | 'https://latcom-fix-production.up.railway.app' |
| vendor_url_prod | varchar(255) | SÍ | NULL | URL ambiente Producción | 'https://api.latcom.com' |
| vendor_username | varchar(100) | SÍ | NULL | Usuario autenticación | — |
| vendor_password | varchar(255) | SÍ | NULL | Password cifrado | — |
| vendor_api_key | varchar(255) | SÍ | NULL | API Key (x-api-key en LATCOM) | 'latcom_peru_mli4fpwc_xx62baa0' |
| vendor_user_uid | varchar(100) | SÍ | NULL | Customer ID (x-customer-id en LATCOM) | 'LATCONECTA_001' |
| vendor_access_token | text | SÍ | NULL | Token JWT actual (renovado automáticamente) | 'eyJ0...' |
| vendor_token_expiry | timestamp | SÍ | NULL | Expiración del token | 2026-03-25 11:00:00 |
| vendor_usd_balance | numeric(15,2) | SÍ | NULL | Balance en USD | 4994.12 |
| vendor_usd_date_balance | timestamp | SÍ | NULL | Última actualización balance USD | 2026-03-25 10:30:00 |
| vendor_local_currency | varchar(10) | SÍ | NULL | Moneda local del vendor | 'PEN' |
| vendor_local_balance | numeric(10,2) | SÍ | NULL | Balance en moneda local | 18727.95 |
| vendor_local_date_balance | timestamp | SÍ | NULL | Última actualización balance local | 2026-03-25 10:30:00 |
| vendor_status | varchar(20) | SÍ | 'active' | Estado | 'active', 'inactive' |
| vendor_timeout | integer | SÍ | 45 | Timeout HTTP en segundos | 45 |
| is_production | boolean | SÍ | false | TRUE = usar URL producción | false |
| auto_sync_products | boolean | SÍ | false | Sincronización automática de catálogo | false |
| sync_interval_hours | integer | SÍ | 24 | Intervalo de sincronización (legacy) | 24 |
| sync_time | varchar(5) | SÍ | '06:00' | Hora fija diaria de sync automático (HH:MM) | '06:00' |
| last_sync_date | timestamp | SÍ | NULL | Última sincronización ejecutada | 2026-04-18 06:00:00 |
| created_by | varchar(100) | SÍ | NULL | Auditoría | — |
| updated_by | varchar(100) | SÍ | NULL | Auditoría | — |
| created_at | timestamp | SÍ | NOW() | Auditoría | — |
| last_update_date | timestamp | SÍ | NOW() | Auditoría | — |

**Lógica de URL activa:**
```
is_production = false → usa vendor_url_uat
is_production = true  → usa vendor_url_prod
```

**Lógica de balance activo:**
```
Si vp_currency = 'USD'         → usa vendor_usd_balance
Si vp_currency = moneda local  → usa vendor_local_balance
```

**Control de Sync Automático:**
```
auto_sync_products = true + sync_time = '06:00'
→ El scheduler ejecuta catalog_sync diariamente a las 06:00
→ Compara last_sync_date.date() con NOW().date() para evitar doble ejecución
```

---

## TABLA: vendor_products <a name="vendor-products"></a>

Productos técnicos del vendor. Puente entre catálogo comercial y proveedor externo.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| vp_id | integer | NO | auto | PK autoincrement | 1 |
| vendor_code | varchar(50) | NO | — | FK → vendors (CASCADE) | 'LATCOM' |
| api_group_code | varchar(50) | SÍ | NULL | Código grupo de APIs | 'LC01T', 'MP01T' |
| vp_code | varchar(100) | NO | — | Código del producto en el vendor | 'BITEL_10_PEN' |
| vp_skuid | varchar(100) | SÍ | NULL | SKU del producto | 'SKU_BITEL_10' |
| vp_name | varchar(255) | SÍ | NULL | Nombre del producto | 'Recarga Bitel S/10' |
| vp_description | text | SÍ | NULL | Descripción | — |
| vp_operator | varchar(50) | SÍ | NULL | Operadora | 'bitel', 'claro', 'movistar', 'entel' |
| vp_country | varchar(50) | SÍ | NULL | País en alpha-3 | 'PER', 'MEX', 'VEN' |
| vp_currency | varchar(10) | SÍ | NULL | Moneda | 'PEN', 'USD', 'MXN', 'VES' |
| vp_amount | numeric(10,2) | SÍ | NULL | Monto fijo. NULL si vp_amount_type='range' | 10.00 |
| vp_amount_type | varchar(20) | SÍ | NULL | Tipo monto | 'fixed', 'range', 'variable' |
| vp_minimum_amount | numeric(10,2) | SÍ | NULL | Monto mínimo (rangos) | 1.00 |
| vp_maximum_amount | numeric(10,2) | SÍ | NULL | Monto máximo (rangos) | 500.00 |
| vp_product_type | char(1) | SÍ | NULL | Tipo de producto del vendor (1 char) | '1', '2' |
| vp_service_type | varchar(50) | SÍ | NULL | Tipo de servicio | 'data', 'voice', 'combo' |
| vp_commission | numeric(10,2) | SÍ | NULL | Comisión del vendor | 0.50 |
| vp_cost | numeric(10,2) | SÍ | NULL | Costo real del vendor | 9.50 |
| vp_fee_usd | numeric(10,5) | NO | 0.00000 | Fee en USD | 0.05000 |
| vp_status | varchar(20) | SÍ | 'active' | Estado | 'active', 'inactive' |
| vp_metadata | jsonb | SÍ | NULL | Metadata adicional | ver abajo |
| created_by | varchar(100) | SÍ | NULL | Auditoría | — |
| updated_by | varchar(100) | SÍ | NULL | Auditoría | — |
| created_at | timestamp | SÍ | NOW() | Auditoría | — |
| last_update_date | timestamp | SÍ | NOW() | Auditoría | — |

**Campo crítico: `api_group_code`**
Vincula el vendor_product con el grupo de API Mappings. Ejemplo: todos los vendor_products de TopUps Perú LATCOM tienen `api_group_code = 'LC01T'`.

**Campo `vp_amount` cuando es NULL:**
Cuando `vp_amount_type = 'range'` y el vendor usa una sola API para todos los montos (ej: MEGAPUNTO/TISI), `vp_amount` es NULL. El monto a enviar al vendor es `product_base_price` del producto comercial.

**Campo `vp_metadata` para Venezuela (precios dinámicos):**
```json
{
  "precio_referencial": "500.00",
  "moneda_referencial": "VES",
  "tipo_cambio": "109.060000",
  "nombre_template": "Movistar 500 Bs",
  "last_sync_date": "2026-04-18T06:00:00",
  "last_sync_by": "scheduler"
}
```

---

## TABLA: vendor_api_mappings <a name="api-mappings"></a>

Motor de integración sin código. Define cómo comunicarse con cada operación de cada vendor.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| mapping_id | integer | NO | auto | PK autoincrement | 1 |
| mapping_code | varchar(5) | NO | — | UNIQUE — código de 5 chars | 'LC01T', 'MP02S' |
| vendor_code | varchar(50) | NO | — | FK → vendors | 'LATCOM' |
| api_group_code | varchar(50) | NO | — | Grupo de APIs | 'LC01T' |
| operation_type | varchar(50) | NO | — | Tipo de operación | 'provision', 'catalog_sync' |
| http_method | varchar(10) | SÍ | 'POST' | Método HTTP | 'POST', 'GET' |
| endpoint_url | varchar(500) | SÍ | NULL | Ruta del endpoint | '/Recarga/procesar' |
| auth_type | varchar(50) | SÍ | NULL | Tipo de autenticación | 'bearer', 'api_key_header' |
| auth_config | jsonb | SÍ | NULL | Configuración de autenticación | ver abajo |
| request_mapping | jsonb | NO | — | Mapeo campos Purchase → Vendor | ver abajo |
| value_transformations | jsonb | SÍ | NULL | Transformaciones de valores | ver abajo |
| response_mapping | jsonb | SÍ | NULL | Mapeo campos Vendor → Purchase (o metadatos array para catalog_sync) | ver abajo |
| success_indicators | jsonb | SÍ | NULL | Indicadores de éxito | ver abajo |
| timeout_seconds | integer | SÍ | 30 | Timeout HTTP | 60 |
| headers | jsonb | SÍ | NULL | Headers HTTP adicionales | {"Content-Type": "application/json"} |
| is_active | boolean | SÍ | true | Activo/Inactivo | true |
| created_at | timestamp | SÍ | NOW() | Auditoría | — |
| updated_at | timestamp | SÍ | NOW() | Auditoría | — |

**Valores de operation_type:**

| Valor | Descripción |
|-------|-------------|
| `provision` | Provisión principal del servicio |
| `validation` | Validación de teléfono o cuenta |
| `query` | Consulta de estado de transacción |
| `reversal` | Reversión de una transacción |
| `catalog_sync` | Sincronización de precios desde el vendor |

**Valores de auth_type:**

| Valor | Descripción | Vendor |
|-------|-------------|--------|
| `bearer` | Token JWT en Authorization: Bearer | MEGAPUNTO/TISI |
| `api_key_header` | API Key en header personalizado + extra_headers | LATCOM |
| `basic` | Base64(user:password) | — |
| `none` | Sin autenticación | Vendor Simulator |

**Estructura auth_config para bearer (MEGAPUNTO):**
```json
{
  "header_name": "Authorization",
  "token_prefix": "Bearer "
}
```

**Estructura auth_config para api_key_header (LATCOM):**
```json
{
  "header_name": "x-api-key",
  "extra_headers": {
    "x-customer-id": "{vendor_username}"
  }
}
```

**Estructura request_mapping — formato JSONPath (nuevo):**
```json
{
  "nro_telefono": "purchase_phone_number",
  "importe": "purchase_vendor_amount",
  "id_producto": "purchase_vendor_skuid",
  "codigo_distribuidor": "constant:0000037",
  "fecha_envio": "dynamic:current_timestamp_tisi"
}
```

**Estructura request_mapping — formato fields (legado):**
```json
{
  "fields": [
    {
      "api_field": "phone",
      "source_field": "purchase_phone_number",
      "data_type": "string",
      "required": true
    }
  ]
}
```

**Campos source disponibles en request_mapping:**
`purchase_phone_number`, `purchase_account_number`, `purchase_vendor_amount`, `purchase_vendor_currency`, `purchase_reference`, `purchase_vendpro_code`, `purchase_vendpro_operator`, `purchase_vendpro_country`, `purchase_vendpro_product_type`, `purchase_vendor_skuid`, `vp_code`, `vp_operator`, `vp_country`, `vp_currency`, `vp_amount`, `vp_skuid`

**Prefijos especiales en source_field:**
- `constant:valor` — valor literal fijo (ej: `constant:0000037`)
- `dynamic:nombre_funcion` — valor generado en runtime:
  - `dynamic:current_timestamp_tisi` → timestamp formato `yyyyMMddHHmmssmss` requerido por TISI

**Estructura value_transformations:**
```json
{
  "purchase_vendpro_country": {
    "country_alpha3_to_alpha2": true
  },
  "purchase_phone_number": {
    "trim": true
  }
}
```

**Transformaciones disponibles:**

| Transformación | Descripción | Ejemplo |
|----------------|-------------|---------|
| `trim` | Elimina espacios | " 912345678 " → "912345678" |
| `to_upper` | Convierte a mayúsculas | "bitel" → "BITEL" |
| `to_lower` | Convierte a minúsculas | "BITEL" → "bitel" |
| `to_float` | Convierte a decimal | "20" → 20.0 |
| `to_integer` | Convierte a entero | "20.0" → 20 |
| `to_string` | Convierte a string | 20 → "20" |
| `format` | Formatea número | "%.2f" → "20.00" |
| `add_prefix` | Agrega prefijo | "12345" → "51_12345" |
| `remove_prefix` | Elimina prefijo | "51_12345" → "12345" |
| `country_alpha3_to_alpha2` | ISO 3 → ISO 2 | "PER" → "PE", "MEX" → "MX" |

**Estructura success_indicators:**
```json
{
  "status_codes": [200],
  "success_field": "codigo",
  "success_values": ["00"]
}
```

**Estructura response_mapping para provision:**
```json
{
  "nro_transaccion": "vendor_trans_id",
  "nro_transaccion_operador": "vendor_provider_trans_id"
}
```

**Estructura response_mapping para catalog_sync:**
```json
{
  "array_path":          "productos",
  "skuid_field":         "id_producto",
  "nested_prices_array": "precios",
  "price_pen_field":     "precio",
  "price_ref_field":     "precio_referencial",
  "exchange_rate_field": "tipo_cambio"
}
```

---

## TABLA: products <a name="products"></a>

Productos comerciales visibles al usuario final.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| product_id | integer | NO | auto | PK | 1 |
| service_id | integer | NO | — | FK → services | 1 |
| country_id | integer | NO | — | FK → countries | 1 |
| company_id | integer | NO | — | FK → companies | 1 |
| product_code | varchar(50) | NO | — | UNIQUE | 'CLARO_PE_10' |
| product_name | varchar(100) | NO | — | Nombre visible usuario | 'Recarga Claro S/10' |
| product_description | varchar(500) | SÍ | NULL | Descripción (solo marketing — no operacional) | '10 soles en saldo' |
| product_photo | varchar(500) | SÍ | NULL | URL foto | '/uploads/products/claro10.png' |
| product_currency | varchar(10) | NO | — | Moneda de venta | 'PEN' |
| product_amount_type | varchar(1) | NO | 'F' | F=Fixed, R=Range, V=Variable | 'F' |
| product_base_price | numeric(10,2) | NO | — | Precio base | 10.00 |
| product_base_price_max | numeric(10,2) | SÍ | NULL | Precio máximo (solo R) | 500.00 |
| product_discount_percentage | numeric(5,2) | NO | 0 | Descuento % | 5.00 |
| product_discount_amount | numeric(10,2) | NO | 0 | Descuento monto — siempre derivado de discount_pct | 0.50 |
| product_discount_amount_max | numeric(10,2) | SÍ | NULL | Descuento máximo (solo R) | 25.00 |
| product_fee | numeric(10,2) | NO | 0 | Cargo adicional | 0.00 |
| product_total_price | numeric(10,2) | NO | — | Total = base - discount + fee | 9.50 |
| product_total_price_max | numeric(10,2) | SÍ | NULL | Total máximo (solo R) | 475.00 |
| product_vendor_code | varchar(100) | SÍ | NULL | Referencia al vendor | 'LATCOM' |
| product_vendpro_code | varchar(50) | NO | 'Vend001' | Código vendor_product asociado | 'CLARO_10_PEN' |
| product_vendpro_skuid | varchar(50) | NO | — | SKU vendor_product asociado | 'SKU_CLARO_10' |
| product_status | varchar(20) | NO | 'active' | Estado | 'active', 'inactive' |
| created_by | varchar(100) | SÍ | — | Auditoría | — |
| updated_by | varchar(100) | SÍ | — | Auditoría | — |
| last_update_date | timestamp | SÍ | NOW() | Auditoría | — |

**Campo `product_description`:** Campo de marketing exclusivamente. No tiene uso operacional — el sistema no lo lee para ninguna lógica de negocio.

**Lógica del tipo de monto (`product_amount_type`):**

| Tipo | Descripción | product_base_price | product_base_price_max | Flujo en PurchasePopup |
|------|-------------|-------------------|----------------------|----------------------|
| F | Monto fijo único | Monto exacto | NULL | Sin step 3 |
| R | Rango — usuario elige | Monto mínimo | Monto máximo | Con step 3 (slider) |
| V | Variable — determinado por validación | Referencial | NULL | Monto determinado en step 2 (val_cuenta) |

---

## TABLA: users <a name="users"></a>

Usuarios del sistema — tanto administradores como usuarios finales.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| user_id | integer | NO | auto | PK | 1 |
| user_name | varchar(50) | NO | — | Nombre | 'Juan' |
| user_email | varchar(50) | NO | — | UNIQUE — email de login | 'juan@email.com' |
| user_password | varchar(255) | NO | — | Hash bcrypt | '$2b$12$...' |
| user_photo | varchar(500) | SÍ | NULL | URL foto perfil | '/uploads/users/juan.jpg' |
| user_phone_country_code | varchar(50) | SÍ | NULL | Código país teléfono | '+51' |
| user_phone_number | varchar(50) | SÍ | NULL | Número de teléfono | '987654321' |
| user_role | varchar(20) | SÍ | 'user' | Rol de acceso | 'user', 'admin', 'superadmin' |
| user_status | varchar(20) | SÍ | 'active' | Estado | 'active', 'inactive' |
| user_session_token | varchar(255) | SÍ | NULL | Código de recuperación hasheado (bcrypt) — reutilizado para flujo forgot-password | — |
| user_session_expiry | timestamp | SÍ | NULL | Expiración del código de recuperación (15 min) — reutilizado | — |
| user_last_login_date | timestamp | SÍ | NULL | Último login | 2026-03-25 09:15:00 |
| created_by | varchar(100) | SÍ | NULL | Auditoría | — |
| updated_by | varchar(100) | SÍ | NULL | Auditoría | — |
| last_update_date | timestamp | SÍ | NOW() | Auditoría | — |

**Roles y accesos:**

| Rol | Puede comprar | Puede acceder admin | Puede gestionar usuarios |
|-----|--------------|---------------------|--------------------------|
| user | Sí | No | No |
| admin | Sí | Sí | No |
| superadmin | Sí | Sí | Sí |

---

## TABLA: purchases <a name="purchases"></a>

Registro completo de cada transacción. Diseñada con desnormalización controlada para garantizar auditoría total e independencia de cambios en catálogos.

### Grupo: Identificación y Fecha

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| purchase_id | integer | NO | auto | PK | 12345 |
| purchase_reference | varchar(50) | NO | — | UNIQUE — referencia legible | 'REF-20260325143022' |
| purchase_date | timestamp | NO | NOW() | Fecha y hora de la compra | 2026-03-25 14:30:22 |
| purchase_user_id | integer | SÍ | NULL | FK → users (NULL = compra anónima) | 5 |
| purchase_product_id | integer | SÍ | NULL | FK → products | 10 |
| purchase_ip_petition | varchar(50) | SÍ | NULL | IP del cliente | '192.168.1.100' |

### Grupo: Producto (Snapshots)

| Campo | Tipo | Nulo | Descripción | Ejemplo |
|-------|------|------|-------------|---------|
| purchase_service_name | varchar(100) | NO | Snapshot nombre servicio | 'TopUps' |
| purchase_product_name | varchar(100) | NO | Snapshot nombre producto | 'Recarga Claro S/20' |
| purchase_product_type | varchar(50) | SÍ | Tipo: topup, bill_payment, transfer, smartphone, package | 'topup' |
| purchase_phone_number | varchar(15) | SÍ | Teléfono destino. NULL para bill_payment | '987654321' |
| purchase_account_number | varchar(100) | SÍ | Número cuenta (Bill Payment) | '123456789' |

### Grupo: Precios

| Campo | Tipo | Nulo | Descripción | Ejemplo |
|-------|------|------|-------------|---------|
| purchase_currency | varchar(10) | SÍ | Moneda de venta | 'PEN' |
| purchase_base_price | numeric(10,2) | NO | Precio base | 20.00 |
| purchase_discount | numeric(12,2) | NO | Descuento aplicado | 1.00 |
| purchase_fee | numeric(12,2) | NO | Cargo adicional | 0.00 |
| purchase_total_amount | numeric(10,2) | NO | Total cobrado al usuario | 19.00 |
| purchase_exch_rate | numeric(10,4) | SÍ | Tipo de cambio aplicado | 3.7500 |

### Grupo: Pago

| Campo | Tipo | Nulo | Descripción | Valores |
|-------|------|------|-------------|---------|
| purchase_payment_method | varchar(50) | NO | Método de pago | 'card', 'barcode' |
| purchase_payment_status | varchar(30) | NO | Estado del pago | 'Pending', 'Success', 'Reversed', 'Refunded' |
| purchase_payment_ref | varchar(255) | SÍ | Referencia del pago del gateway | 'PAY-20260325-001' |
| purchase_credit_card_last_digits | varchar(4) | SÍ | Últimos 4 dígitos tarjeta | '1234' |
| purchase_barcode_code | varchar(50) | SÍ | Código de barras | 'LC260325143022000020.00' |
| purchase_barcode_image | varchar(255) | SÍ | URL imagen barcode | 'https://barcodeapi.org/...' |
| purchase_receip_image | varchar(255) | SÍ | URL imagen recibo | — |

### Grupo: Provisión y Estado Global

| Campo | Tipo | Nulo | Descripción | Valores |
|-------|------|------|-------------|---------|
| purchase_status | varchar(30) | SÍ | Estado global de la transacción | 'Pending', 'Success', 'Failed' |
| purchase_delivery_status | varchar(100) | SÍ | Estado de entrega/provisión | 'completed', 'Ordered', 'In Transit', 'Delivered' |
| purchase_provision_ref | varchar(255) | SÍ | Referencia de la provisión | 'SIM-PROV-TOPUP-20260325143022' |
| purchase_reversal_ref | varchar(255) | SÍ | Referencia de la reversión | 'SIM-REV-20260325143030' |
| requires_manual_intervention | boolean | NO | Flag crítico — intervención manual requerida | false |
| purchase_delivery_name | varchar(50) | SÍ | Destinatario (smartphones) | 'Juan García' |
| purchase_delivery_phone | varchar(20) | SÍ | Teléfono destinatario | '987654321' |
| purchase_delivery_address | varchar(100) | SÍ | Dirección entrega | 'Av. Lima 123' |

### Grupo: Vendor — Datos Técnicos

| Campo | Tipo | Nulo | Descripción | Ejemplo |
|-------|------|------|-------------|---------|
| purchase_vendor_code | varchar(50) | SÍ | Código del vendor | 'LATCOM' |
| vendor_name | varchar(50) | SÍ | Nombre del vendor | 'LATCOM Internacional' |
| purchase_vendor_amount | numeric(10,2) | SÍ | Monto enviado al vendor | 20.00 |
| purchase_vendor_currency | varchar(10) | SÍ | Moneda del vendor | 'PEN' |
| purchase_vendor_cost | numeric(10,2) | SÍ | Costo real del vendor | 19.00 |
| purchase_vendor_skuid | varchar(50) | SÍ | SKU en sistema vendor | 'BITEL_20_PEN' |
| purchase_vendor_response_code | varchar(50) | SÍ | Código respuesta vendor | '00', 'SUCCESS' |
| purchase_vendor_response_description | varchar(255) | SÍ | Descripción respuesta | 'Transaction successful' |
| purchase_vendor_purchase_id | varchar(50) | SÍ | ID compra asignado por vendor | 'VIA-20260325-1234' |
| purchase_vendor_date_petition | timestamp | SÍ | Fecha/hora petición al vendor | 2026-03-25 14:30:23 |
| purchase_vendor_date_response | timestamp | SÍ | Fecha/hora respuesta del vendor | 2026-03-25 14:30:24 |
| purchase_vendor_json | text | SÍ | JSON respuesta vendor (legacy) | '{"success": true, ...}' |
| vendor_trans_id | varchar(100) | SÍ | ID transacción del vendor | 'VIA-20260325-1234' |
| vendor_provider_trans_id | varchar(100) | SÍ | ID del operador final | 'BITEL789456' |
| vendor_request | text | SÍ | JSON completo enviado (auditoría) | '{"phone": "987654321", ...}' |
| vendor_response | text | SÍ | JSON completo recibido (auditoría) | '{"success": true, ...}' |

### Grupo: Snapshots de Vendor Product

| Campo | Tipo | Nulo | Descripción | Ejemplo |
|-------|------|------|-------------|---------|
| purchase_vendpro_code | varchar(50) | SÍ | Snapshot vp_code | 'BITEL_20_PEN' |
| purchase_vendpro_country | varchar(50) | SÍ | Snapshot vp_country | 'PER' |
| purchase_vendpro_operator | varchar(50) | SÍ | Snapshot vp_operator | 'bitel' |
| purchase_vendpro_product_type | char(1) | SÍ | Snapshot vp_product_type | '2' |
| purchase_vendpro_amount_type | varchar(20) | SÍ | Snapshot vp_amount_type | 'fixed' |
| purchase_vendpro_maximum_amount | numeric(10,2) | SÍ | Snapshot vp_maximum_amount | 500.00 |

### Grupo: Balance del Vendor

| Campo | Tipo | Nulo | Descripción | Ejemplo |
|-------|------|------|-------------|---------|
| purchase_balance_currency | varchar(10) | SÍ | Moneda del balance deducido | 'PEN' |
| purchase_initial_balance | numeric(10,2) | SÍ | Balance antes de la compra | 18747.95 |
| purchase_final_balance | numeric(10,2) | SÍ | Balance después de la compra | 18727.95 |

### Grupo: Conciliación y Auditoría

| Campo | Tipo | Nulo | Default | Descripción |
|-------|------|------|---------|-------------|
| purchase_date_sent_to_conciliation | timestamp | SÍ | NULL | Fecha envío conciliación contable |
| created_by | varchar(100) | NO | 'System' | Auditoría |
| updated_by | varchar(100) | NO | 'System' | Auditoría |
| last_update_date | timestamp | NO | NOW() | Auditoría |

---

## TABLA: vendor_sync_logs <a name="vendor-sync-logs"></a>

Historial de sincronizaciones de catálogo de productos. Registra cada ejecución de catalog_sync para auditoría y monitoreo.

| Campo | Tipo | Nulo | Default | Descripción | Ejemplo |
|-------|------|------|---------|-------------|---------|
| sync_id | integer | NO | auto | PK autoincrement | 1 |
| vendor_code | varchar(50) | NO | — | FK → vendors (CASCADE) | 'MEGAPUNTO' |
| api_group_code | varchar(50) | NO | — | Grupo de APIs del sync | 'MP02S' |
| sync_date | timestamp | NO | NOW() | Fecha y hora de ejecución | 2026-04-18 06:00:00 |
| triggered_by | varchar(100) | NO | 'scheduler' | Quién disparó el sync | 'scheduler', 'manual:admin@latconecta.com' |
| status | varchar(20) | NO | — | Resultado del sync | 'success', 'error', 'no_changes' |
| products_reviewed | integer | NO | 0 | Productos revisados en el vendor | 22 |
| products_updated | integer | NO | 0 | Productos con precio actualizado | 3 |
| error_message | text | SÍ | NULL | Descripción del error (solo si status='error') | — |
| changes_detail | jsonb | SÍ | NULL | Array con detalle de cada producto revisado | ver abajo |
| created_by | varchar(100) | NO | 'System' | Auditoría | 'System' |

**Valores de status:**

| Valor | Descripción |
|-------|-------------|
| `success` | Sync ejecutado con al menos un precio actualizado |
| `no_changes` | Sync ejecutado sin cambios — todos los precios iguales |
| `error` | Sync falló — ver error_message para detalle |

**Valores de triggered_by:**

| Valor | Descripción |
|-------|-------------|
| `scheduler` | Ejecución automática programada (hora fija diaria) |
| `manual:email` | Disparado manualmente por admin desde el panel |

**Estructura del campo changes_detail:**

Array JSON donde cada elemento representa un producto revisado:
```json
[
  {
    "vp_code":               "MP_MOVISTAR_VEN_500",
    "vp_skuid":              "5580",
    "nombre_producto":       "Movistar 500 Bs",
    "status":                "ACTUALIZADO",
    "vp_amount_old":         4.45,
    "vp_amount_new":         4.58,
    "precio_referencial_bs": "500.00",
    "tipo_cambio":           "109.060000",
    "alerta_precio":         false
  }
]
```

**Valores de status por ítem en changes_detail:**

| Valor | Descripción | Acción requerida |
|-------|-------------|-----------------|
| `ACTUALIZADO` | Precio cambió < 10% | Ninguna — automático |
| `ALERTA` | Precio cambió > 10% | Revisión por marketing |
| `SIN_CAMBIO` | Mismo precio | Ninguna |
| `NUEVO` | SKUID no existe en BD | Decisión de marketing para crear producto |
| `NO_VINO` | SKUID en BD no retornado por vendor | Revisar si vendor desactivó el producto |

**Índices:**
- PK en sync_id
- idx_vsl_vendor_code en vendor_code
- idx_vsl_sync_date en sync_date DESC
- idx_vsl_vendor_date en (vendor_code, sync_date DESC)

---

## TABLA: latconecta <a name="latconecta"></a>

Tabla de configuración corporativa. Siempre contiene exactamente 1 registro (latconecta_id = 1).

| Campo | Tipo | Nulo | Descripción | Ejemplo |
|-------|------|------|-------------|---------|
| latconecta_id | integer | NO | PK — siempre 1 (CHECK constraint) | 1 |
| latconecta_name | varchar(50) | NO | Nombre de la empresa | 'Latconecta' |
| latconecta_logo | varchar(500) | SÍ | URL logo | '/uploads/corp/logo.png' |
| latconecta_photo | varchar(500) | SÍ | URL foto principal | — |
| latconecta_photo_mkt1..4 | varchar(500) | SÍ | URLs carrusel marketing (4 fotos) | — |
| latconecta_description | varchar(500) | SÍ | Descripción de la empresa | — |
| latconecta_lema_1 | varchar(500) | SÍ | Eslogan línea 1 | 'Conectando América Latina' |
| latconecta_lema_2 | varchar(500) | SÍ | Eslogan línea 2 | — |
| latconecta_credit_balance | numeric(12,2) | SÍ | Balance de crédito referencial | 0.00 |
| latconecta_date_balance | date | SÍ | Fecha balance | — |
| latconecta_mail_support | varchar(255) | SÍ | Email soporte técnico | 'support@latcom.co' |
| latconecta_mail_comercial | varchar(255) | SÍ | Email comercial | 'info@latcom.co' |
| latconecta_web | varchar(255) | SÍ | URL sitio web | 'https://latconecta.com' |
| latconecta_facebook | varchar(255) | SÍ | URL Facebook | — |
| latconecta_instagram | varchar(255) | SÍ | URL Instagram | — |
| latconecta_twitter | varchar(255) | SÍ | URL Twitter/X | — |
| latconecta_linkedin | varchar(255) | SÍ | URL LinkedIn | — |
| latconecta_youtube | varchar(255) | SÍ | URL YouTube | — |
| latconecta_phone | varchar(50) | SÍ | Teléfono de contacto | '+1 305 XXX XXXX' |
| latconecta_address | varchar(500) | SÍ | Dirección física | '1155 Brickell Bay Dr, Miami, FL 33131' |
| latconecta_status | varchar(20) | SÍ | Estado | 'active' |

---

## ENUMERACIONES Y VALORES PERMITIDOS <a name="enums"></a>

### purchase_status (estado global de la transacción)

| Valor | Descripción |
|-------|-------------|
| Pending | Transacción iniciada, pago pendiente o en proceso |
| Success | Transacción completada exitosamente |
| Failed | Transacción fallida |

### purchase_payment_status (estado del pago)

| Valor | Descripción |
|-------|-------------|
| Pending | Pago pendiente (barcode generado, esperando pago en agente) |
| Success | Pago procesado exitosamente |
| Reversed | Pago revertido/anulado exitosamente |
| Refunded | Pago reembolsado vía gateway (cancel con cancel_id) |

### purchase_delivery_status (estado de provisión)

| Valor | Descripción | Aplica a |
|-------|-------------|----------|
| completed | Provisión completada | TopUps, Paquetes, Bill Payment, Transfers |
| Ordered | Pedido registrado | Smartphones |
| In Transit | En camino | Smartphones |
| Delivered | Entregado | Smartphones |
| (nulo) | Sin estado (pago pendiente) | Barcode antes del pago |

### purchase_payment_method

| Valor | Descripción |
|-------|-------------|
| card | Pago con tarjeta de crédito/débito (gateway activo: Culqi) |
| barcode | Pago con código de barras en agente/bodega (barcodeapi.org) |

### product_amount_type / purchase_vendpro_amount_type

| Valor | Descripción |
|-------|-------------|
| F | Fixed — monto fijo único |
| R | Range — el usuario elige entre mínimo y máximo |
| V | Variable — determinado por validación de cuenta |

### vendor_status / company_status / product_status / vp_status

| Valor | Descripción |
|-------|-------------|
| active | Activo y disponible |
| inactive | Inactivo, no visible ni procesable |

### user_role

| Valor | Nivel de acceso |
|-------|----------------|
| superadmin | Total — gestiona usuarios admin y todo el sistema |
| admin | Panel admin — gestiona catálogos |
| user | Usuario final — solo puede comprar |

### operation_type (vendor_api_mappings)

| Valor | Descripción |
|-------|-------------|
| provision | Provisión del servicio al usuario final |
| validation | Validación de teléfono o número de cuenta |
| query | Consulta del estado de una transacción |
| reversal | Reversión de una transacción |
| catalog_sync | Sincronización de precios desde el vendor |

### vendor_sync_logs.status

| Valor | Descripción |
|-------|-------------|
| success | Al menos un precio actualizado |
| no_changes | Sin cambios de precios |
| error | El sync falló |

---

## REGLAS DE NEGOCIO CRÍTICAS <a name="reglas"></a>

### 1. Integridad del catálogo multi-tenant

- No se puede eliminar un país si tiene companies activas (ON DELETE RESTRICT)
- No se puede eliminar un servicio si tiene companies activas (ON DELETE RESTRICT)
- No se puede eliminar una company si tiene products activos (ON DELETE RESTRICT)
- Si se elimina un vendor, se eliminan en cascada sus vendor_products, mappings y sync_logs (ON DELETE CASCADE)

### 2. Vinculación producto-vendor

El trio `(product_vendor_code, product_vendpro_code, product_vendpro_skuid)` debe existir en vendor_products. Esta vinculación no es FK formal — el backend la valida en tiempo de ejecución al procesar una compra.

### 3. Lookup de API Mapping

La combinación `(vendor_code, api_group_code, operation_type)` es única en vendor_api_mappings (UNIQUE constraint). Si no existe un mapping activo (`is_active = true`) para una operación, el sistema retorna error `CONFIG_NOT_FOUND`.

### 4. Compras anónimas

Si `purchase_user_id IS NULL`, la compra es anónima. Se identifica posteriormente por `purchase_reference + purchase_phone_number`. El índice `idx_purchases_anonymous` está optimizado para esta búsqueda.

### 5. Flag de intervención manual

`requires_manual_intervention = TRUE` ocurre solo cuando:
- El pago fue exitoso (`purchase_payment_status = 'Success'`)
- La provisión falló
- La reversión/anulación también falló

Este estado requiere acción manual del equipo de soporte.

### 6. country_code: 3 vs 2 caracteres

La tabla countries usa códigos alpha-3 (PER, MEX, VEN). Los vendors externos como LATCOM/Relier usan alpha-2 (PE, MX, VE). La transformación se aplica en el motor de API Mappings con la transformación `country_alpha3_to_alpha2`. No modificar los códigos en countries.

### 7. Tipo de cambio

`country_er_usd` representa cuántas unidades de moneda local equivalen a 1 USD. Por ejemplo, si `country_er_usd = 3.75` para Perú, entonces 1 USD = 3.75 PEN.

### 8. Balance dual de vendors

Cada vendor puede operar con balance en USD y/o en moneda local simultáneamente. El sistema selecciona automáticamente cuál verificar y deducir según la moneda del `vendor_product`. La fecha de actualización del balance permite detectar si el dato es "fresco" (menos de 24 horas) o "stale".

### 9. purchase_phone_number es nullable

`purchase_phone_number` es NULL cuando `purchase_product_type = 'bill_payment'`. En ese caso el identificador del servicio va en `purchase_account_number`. Esta distinción es importante para búsquedas y reportes.

### 10. Precios Venezuela — modelo dinámico

Los vendor_products de Venezuela (MEGAPUNTO) tienen `vp_amount` en Soles (PEN) correspondiente a denominaciones fijas en Bolívares. Los precios se actualizan diariamente vía catalog_sync. El nombre del producto muestra solo la denominación en Bs (ej: "Movistar 500 Bs") — nunca el precio en PEN, que va en `vp_metadata.precio_referencial`.

### 11. product_description es campo de marketing

`product_description` es un campo exclusivamente para contenido de marketing visible al usuario. No tiene uso operacional y el sistema nunca lo lee para ninguna lógica de negocio o de pricing.

### 12. Recuperación de contraseña sin cambio de esquema

El flujo de recuperación de contraseña reutiliza los campos `user_session_token` y `user_session_expiry` de la tabla users para almacenar el código de 6 dígitos hasheado y su expiración (15 minutos). No se requirió ningún cambio al esquema de BD.

---

**FIN DEL DOCUMENTO 03**

*Versión: 4.1 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 04 — Backend: Configuración y Arquitectura Core*


---

<a name="04-backend-configuracion-core"></a>

# DOCUMENTO 04
## BACKEND — CONFIGURACIÓN Y ARQUITECTURA CORE

**Versión:** 5.0
**Fecha:** Mayo 2026
**Sistema:** Latconecta v2.0.0
**Framework:** FastAPI 0.120.4 + Python 3.11.7

---

## CONTENIDO

1. [Estructura del Backend](#estructura)
2. [main.py — Entry Point](#main)
3. [config.py — Configuración Centralizada](#config)
4. [database.py — Conexión Async](#database)
5. [dependencies.py — Autenticación](#dependencies)
6. [events.py — Startup y Shutdown](#events)
7. [token_manager.py — Cache de Tokens de Vendors](#token-manager)
8. [vendor_login_service.py — Login Automático de Vendors](#vendor-login)
9. [scheduler_service.py — Renovación Automática de Tokens](#scheduler)
10. [Middleware](#middleware)
11. [Variables de Entorno (.env)](#variables)
12. [Exception Handlers](#exceptions)

---

## ESTRUCTURA DEL BACKEND <a name="estructura"></a>

### Tecnologías

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Framework | FastAPI | 0.120.4 |
| Runtime | Python | 3.11.7 |
| Servidor | Uvicorn (ASGI) | 0.24.0 |
| ORM | SQLAlchemy | 2.0.44 (async) |
| Validación | Pydantic | 2.12.3 |
| Driver BD | asyncpg | 0.30.0 |
| HTTP Client | httpx | 0.25.2 |
| SDK Pagos | culqi-python-oficial | 1.0.0 |
| Encriptación | pycryptodome | — |

### Estructura de Directorios

```
backend/app/
├── main.py                 # Entry point — routers, middleware, configuración CORS
├── config.py               # Configuración centralizada (Settings via pydantic-settings)
├── database.py             # Conexión async PostgreSQL, AsyncSession
├── dependencies.py         # Dependencies de autenticación (4 funciones)
├── events.py               # Startup/shutdown (vendor login, scheduler)
│
├── routers/                # 16 routers activos
│   ├── auth.py             # Login, register, me, change-password, forgot-password, reset-password
│   ├── users.py            # CRUD usuarios
│   ├── countries.py        # CRUD países
│   ├── services.py         # CRUD servicios
│   ├── companies.py        # CRUD compañías
│   ├── products.py         # CRUD productos
│   ├── vendors.py          # CRUD vendors + balance + test-connection
│   ├── vendor_products.py  # CRUD vendor products
│   ├── vendor_api_mappings.py  # Motor de API Mappings (sin código)
│   ├── mock_vendors.py     # Mock HTTP del vendor para testing
│   ├── mock_config_storage.py  # Storage de configuración del mock
│   ├── operations_config.py    # Control centralizado fase1/fase2
│   ├── purchases.py        # Transacciones de compra (router principal)
│   ├── latconecta.py       # Información corporativa
│   ├── upload.py           # Upload de imágenes
│   └── exchange_rate.py    # Tipo de cambio
│
├── models/                 # 11 modelos SQLAlchemy
│   ├── __init__.py
│   ├── country.py
│   ├── service.py
│   ├── company.py
│   ├── vendor.py           # Balance dual USD + local
│   ├── vendor_product.py   # Con api_group_code
│   ├── vendor_api_mapping.py
│   ├── product.py          # Tipos F/R/V
│   ├── user.py
│   ├── purchase.py         # 60+ campos, snapshots completos
│   └── latconecta.py
│
├── schemas/                # Schemas Pydantic (request/response)
│
├── services/               # 15 servicios especializados
│   ├── email_service.py              # Envío de emails (recuperación de contraseña) ← ACTIVO
│   ├── exchange_rate_service.py
│   ├── exceptions.py
│   ├── operations_config_service.py  # Control centralizado fase1/fase2
│   ├── phone_validation_service.py   # Validación local por prefijos
│   ├── purchase_calculator_service.py  # Cálculo de precios y márgenes
│   ├── refresh_token_manager.py      # Manager de tokens de refresh ← ACTIVO
│   ├── scheduler_service.py          # Renovación automática de tokens ← ACTIVO
│   ├── token_manager.py              # Cache de tokens de vendors ← ACTIVO
│   ├── universal_vendor_service.py   # Motor de integración universal ← ACTIVO
│   ├── vendor_api_mapper.py          # Transformación request/response ← ACTIVO
│   └── vendor_login_service.py       # Login de vendors al startup ← ACTIVO
│
├── payments/               # Sistema de pagos (Culqi + Multi-Gateway)
│   ├── culqi_adapter.py    # Adaptador Culqi: charge, order, refund, cancel
│   ├── gateway.py          # Orquestador PaymentGatewayService (multi-gateway)
│   ├── router.py           # 6 endpoints HTTP: /charge, /order, /refund, /cancel, /config, /gateways
│   ├── schemas.py          # Pydantic schemas Culqi
│   └── service.py          # Orquestación de llamadas al adapter
│
└── utils/                  # Autenticación JWT, validadores
```

---

## main.py — ENTRY POINT <a name="main"></a>

### Metadata de la API

```python
app = FastAPI(
    title="Latconecta API",
    version="2.0.0",
    description="API REST para Latconecta Platform",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)
```

### Configuración CORS

El CORS se configura usando `settings.CORS_ORIGINS` que proviene de `config.py`. Los orígenes se dividen en dos grupos:

```python
# En config.py:
LOCAL_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

PRODUCTION_ORIGINS: List[str] = [
    "https://77.42.92.151",
    "https://77.42.92.151/latconecta_admin",
    "https://77.42.92.151/latconecta_users",
    "http://77.42.92.151:8100",     # Backend directo (debugging)
    "https://77.42.92.151:5176",    # Culqi sandbox simulator
]

@property
def CORS_ORIGINS(self) -> List[str]:
    if self.ENVIRONMENT in ["production", "uat"]:
        return self.PRODUCTION_ORIGINS
    return self.LOCAL_ORIGINS + self.PRODUCTION_ORIGINS
```

```python
# En main.py:
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Routers Registrados (16 activos)

```python
app.include_router(auth.router,     prefix="/api/v1/auth")
app.include_router(users.router,    prefix="/api/v1/users")
app.include_router(companies.router,  prefix="/api/v1/companies")
app.include_router(services.router,   prefix="/api/v1/services")
app.include_router(countries.router,  prefix="/api/v1/countries")
app.include_router(products.router,   prefix="/api/v1/products")
app.include_router(vendors.router,          prefix="/api/v1/vendors")
app.include_router(vendor_products.router,  prefix="/api/v1/vendor-products")
app.include_router(vendor_api_mappings.router, prefix="/api/v1/vendor-api-mappings")
app.include_router(purchases.router,     prefix="/api/v1/purchases")
app.include_router(exchange_rate.router, prefix="/api/v1/exchange-rate")
app.include_router(operations_config.router, prefix="/api/v1/operations")
app.include_router(mock_vendors.router,      prefix="/api/v1/mock")
app.include_router(upload.router,   prefix="/api/v1")
app.include_router(payments_router, prefix="/api/v1")
```

---

## config.py — CONFIGURACIÓN CENTRALIZADA <a name="config"></a>

`config.py` usa `pydantic-settings` para leer variables de entorno desde `.env`.

### Variables de Gateway de Pagos

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `PAYMENT_GATEWAY` | str | culqi | Gateway activo: `culqi` / `conekta` (futuro) / `stripe` (futuro) |
| `DEPLOYMENT_COUNTRY` | str | PE | País de instalación: `PE`, `MX`, `US` |
| `CULQI_PUBLIC_KEY` | str | — | Llave pública Culqi — va al frontend vía `/payments/config` |
| `CULQI_SECRET_KEY` | str | — | Llave privada Culqi — **solo backend, nunca al frontend** |
| `CULQI_RSA_ID` | str | — | ID RSA para encriptación opcional |
| `CULQI_RSA_PUBLIC_KEY` | str | — | Llave pública RSA para encriptación opcional |

### Variables de Métodos de Pago por País

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `CARD_AVAILABLE` | bool | True | Si el país tiene gateway de tarjeta activo |
| `BARCODE_AVAILABLE` | bool | False | Si el país opera con barcode (Perú: False, México: True) |

Estas variables se publican al frontend vía `GET /api/v1/payments/config` junto con `card.mode` y `barcode.mode` que controlan si el pago es real (fase2) o simulado (fase1).

### Variables para Vendors

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `ENABLE_VENDOR_LOGIN` | bool | False | Activa login automático de vendors al startup |
| `VENDOR_SIMULATOR_ENABLED` | bool | True | Redirige llamadas al simulador local |
| `VENDOR_SIMULATOR_URL` | str | http://localhost:5001 | URL del simulador local |

### Variables SMTP — Recuperación de Contraseña

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `SMTP_HOST` | str | smtp.gmail.com | Servidor SMTP |
| `SMTP_PORT` | int | 587 | Puerto SMTP (STARTTLS) |
| `SMTP_USER` | str | — | Email remitente (Gmail con App Password) |
| `SMTP_PASSWORD` | str | — | App Password de Google (16 caracteres) |
| `SMTP_FROM_NAME` | str | LatConecta | Nombre visible del remitente |

**Comportamiento según combinación:**

| `ENABLE_VENDOR_LOGIN` | `VENDOR_SIMULATOR_ENABLED` | Comportamiento |
|-----------------------|---------------------------|----------------|
| False | True | Desarrollo local — mock universal, sin login real |
| True | False | UAT/Producción — login real, llamadas al vendor real |
| True | True | No recomendado — login real pero llamadas al simulador |
| False | False | Login desactivado, llamadas al vendor real sin token |

---

## database.py — CONEXIÓN ASYNC <a name="database"></a>

```python
engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

---

## dependencies.py — AUTENTICACIÓN <a name="dependencies"></a>

Define 4 funciones de dependencia para proteger endpoints:

- `get_current_user_optional()` — retorna usuario o None (anónimo permitido)
- `get_current_user_required()` — lanza HTTP 401 si no hay token válido
- `get_current_admin_user()` — requiere `user_role IN ('admin', 'superadmin')`
- `get_current_superadmin_user()` — solo `user_role = 'superadmin'`

---

## events.py — STARTUP Y SHUTDOWN <a name="events"></a>

`events.py` coordina el ciclo de vida completo del backend, incluyendo el login automático de vendors con autenticación Bearer (como MEGAPUNTO/TISI).

### Flujo de Startup

```
on_startup()
    │
    ├─ Log de configuración (ambiente, modo, vendor login)
    │
    ├─ Si ENABLE_VENDOR_LOGIN = True:
    │   ├─ initial_vendor_login()
    │   │   ├─ SELECT * FROM vendors WHERE vendor_status = 'active'
    │   │   ├─ Para cada vendor:
    │   │   │   ├─ VendorLoginService.execute_login(vendor)
    │   │   │   │   ├─ LATCOM → retorna NO_LOGIN_REQUIRED (usa api_key estático)
    │   │   │   │   └─ MEGAPUNTO → POST /Auth/token → obtiene JWT Bearer
    │   │   │   └─ Si exitoso: token_manager.set_token(vendor_code, token, expires_in)
    │   │   └─ Log resumen: X exitosos, Y fallidos
    │   │
    │   └─ scheduler_service.start()
    │       └─ Loop async cada 5 min → renueva tokens próximos a expirar
    │
    └─ Si ENABLE_VENDOR_LOGIN = False:
        └─ Log: "Usando simulador/mock local"
```

### Comportamiento por Vendor

| Vendor | Tipo Auth | Comportamiento en Startup |
|--------|-----------|--------------------------|
| LATCOM | api_key_header | Retorna `NO_LOGIN_REQUIRED` — no necesita login, usa `vendor_api_key` estático de BD |
| MEGAPUNTO | bearer dinámico | Llama a `POST /Auth/token` con `userName/password` → obtiene JWT con vida útil de 10 min |

### Output de Startup (CalmetServer)

```
============================================================
LATCONECTA - CONFIGURACIÓN
============================================================
Ambiente: DEVELOPMENT
País: PE | Gateway: culqi
Tarjeta: SI | Barcode: NO
Modo: DEVELOPMENT
VENDOR LOGIN: HABILITADO
============================================================
LATCOM usa api_key_header — no requiere login bearer
Login exitoso MEGAPUNTO. Token: eyJ... (válido 10 min, renueva en 9 min)
```

### Shutdown

```python
async def on_shutdown():
    if settings.ENABLE_VENDOR_LOGIN:
        await scheduler_service.stop()
```

---

## token_manager.py — CACHE DE TOKENS DE VENDORS <a name="token-manager"></a>

**Archivo:** `services/token_manager.py`

Singleton que mantiene en memoria los tokens Bearer de todos los vendors que requieren autenticación dinámica (actualmente MEGAPUNTO/TISI).

### Funcionamiento

```python
# Estructura interna (en memoria, no persiste en BD):
_tokens = {
    "MEGAPUNTO": {
        "token": "eyJhbGciOi...",
        "expires_at": datetime(2026, 4, 16, 10, 45, 00)  # UTC
    }
}
```

### API del TokenManager

```python
# Guardar token al hacer login
await token_manager.set_token(
    vendor_code="MEGAPUNTO",
    token="eyJhbGciOi...",
    expires_in_seconds=540    # 9 min (token dura 10 min, renovamos antes)
)

# Obtener token para construir headers
token = await token_manager.get_token("MEGAPUNTO")
# → "eyJhbGciOi..." o None si no hay token o expiró

# Verificar si necesita renovación
needs_refresh = await token_manager.needs_refresh("MEGAPUNTO", threshold_seconds=300)
# → True si expira en menos de 5 minutos
```

### Ciclo de Vida del Token MEGAPUNTO/TISI

```
Startup:
    POST /Auth/token → JWT (vida: 10 min)
    token_manager.set_token("MEGAPUNTO", token, expires_in=540)  ← 9 min
    
Cada transacción:
    token = token_manager.get_token("MEGAPUNTO")
    headers["Authorization"] = f"Bearer {token}"
    
Scheduler (cada 5 min):
    Si token expira en < 5 min:
        POST /Auth/token → nuevo JWT
        token_manager.set_token(...)
```

### Relación con universal_vendor_service.py

El `UniversalVendorService.get_vendor_info()` llama al `token_manager` para incluir el token activo en el diccionario de información del vendor:

```python
access_token = await token_manager.get_token(vendor_code)
return {
    "base_url": ...,
    "api_key": row.vendor_api_key,
    "access_token": access_token,   # ← token dinámico para auth bearer
    "username": row.vendor_username,
    ...
}
```

---

## vendor_login_service.py — LOGIN AUTOMÁTICO DE VENDORS <a name="vendor-login"></a>

**Archivo:** `services/vendor_login_service.py`

Servicio que implementa el login específico de cada vendor.

### Método Principal

```python
async def execute_login(self, vendor: Vendor) -> dict:
    if vendor.vendor_code == "MEGAPUNTO":
        return await self._login_megapunto(vendor)
    elif vendor.vendor_code == "LATCOM":
        return {"success": False, "error": "NO_LOGIN_REQUIRED"}
    else:
        return {"success": False, "error": "NO_LOGIN_REQUIRED"}
```

### Login MEGAPUNTO (_login_megapunto)

```python
async def _login_megapunto(self, vendor: Vendor) -> dict:
    url = f"{base_url}/Auth/token"
    payload = {
        "userName": vendor.vendor_username,
        "password": vendor.vendor_password
    }
    response = await httpx.AsyncClient().post(url, json=payload)
    token = response.json()["token"]
    return {
        "success": True,
        "access_token": token,
        "expires_in": 540  # 9 min en segundos
    }
```

### Extender para Nuevos Vendors

```python
async def execute_login(self, vendor):
    if vendor.vendor_code == "NUEVO_VENDOR":
        return await self._login_nuevo_vendor(vendor)
    ...
```

---

## scheduler_service.py — RENOVACIÓN AUTOMÁTICA DE TOKENS <a name="scheduler"></a>

**Archivo:** `services/scheduler_service.py`

Loop async que se ejecuta en segundo plano y renueva automáticamente los tokens de vendors antes de que expiren.

### Configuración

```python
CHECK_INTERVAL_SECONDS = 300    # Verificar cada 5 minutos
REFRESH_THRESHOLD_SECONDS = 300  # Renovar si expira en menos de 5 minutos
```

### Flujo del Scheduler

```
Cada 5 minutos:
    Para cada vendor_code en token_manager._tokens:
        Si token_manager.needs_refresh(vendor_code, threshold=300):
            vendor = SELECT * FROM vendors WHERE vendor_code = vendor_code
            result = await VendorLoginService.execute_login(vendor)
            Si result.success:
                token_manager.set_token(vendor_code, result.access_token, result.expires_in)
            Si no:
                Log: "No se pudo renovar token para MEGAPUNTO"
```

### Protección contra Race Conditions

1. El startup completa el login inicial antes de arrancar el scheduler
2. El scheduler solo renueva — no crea — tokens existentes
3. Las transacciones leen el token en el momento exacto de construcción del request

---

## MIDDLEWARE <a name="middleware"></a>

El backend tiene 4 middlewares registrados en main.py:

### 1. CORSMiddleware
Usa `settings.CORS_ORIGINS` — lista diferenciada por ambiente (ver sección config.py).

### 2. Middleware CORS para archivos estáticos
Agrega `Access-Control-Allow-Origin: *` a respuestas de imágenes en `/uploads/`.

### 3. Middleware Charset UTF-8
Asegura `charset=utf-8` en todas las respuestas JSON.

### 4. Middleware Process Time
Agrega header `X-Process-Time` con tiempo de procesamiento en segundos.

---

## VARIABLES DE ENTORNO (.env) <a name="variables"></a>

### Archivo .env — CalmetServer (UAT actual)

```bash
# ── BASE DE DATOS ──────────────────────────────────
DATABASE_URL=postgresql+asyncpg://postgres:admin@localhost:5432/latconecta_db

# ── SEGURIDAD JWT ──────────────────────────────────
SECRET_KEY=tu-secret-key-super-segura-cambiar-en-produccion-12345678
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ── APLICACIÓN ────────────────────────────────────
ENVIRONMENT=development
DEBUG=True
DEPLOYMENT_COUNTRY=PE

# ── GATEWAY DE PAGOS — CULQI ──────────────────────
PAYMENT_GATEWAY=culqi
CULQI_PUBLIC_KEY=pk_test_7jTfx9nRR69ACCpu
CULQI_SECRET_KEY=sk_test_sG8xgqCq1r1xq7fc
CULQI_RSA_ID=
CULQI_RSA_PUBLIC_KEY=

# ── MÉTODOS DE PAGO POR PAÍS ──────────────────────
CARD_AVAILABLE=True
BARCODE_AVAILABLE=False    # Perú no usa barcode — México sí (OXXO)

# ── VENDORS ────────────────────────────────────────
VENDOR_MODE=mock
LATCOM_URL=https://uatlat.mitopup.com
LATCOM_USERNAME=
LATCOM_PASSWORD=
LATCOM_API_KEY=
LATCOM_USER_UID=
LATCOM_TIMEOUT=45
MOCK_MODE=success
MOCK_DELAY=1.0
MOCK_SUCCESS_RATE=0.95

# ── VENDOR SIMULATOR ──────────────────────────────
VENDOR_SIMULATOR_ENABLED=False
VENDOR_SIMULATOR_URL=http://localhost:5001

# ── VENDOR LOGIN ──────────────────────────────────
ENABLE_VENDOR_LOGIN=true

# ── SMTP — RECUPERACIÓN DE CONTRASEÑA ────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=latconecta.digital@gmail.com
SMTP_PASSWORD=cols dkia bvfu jfjl
SMTP_FROM_NAME=LatConecta

# ── UPLOADS ───────────────────────────────────────
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=5242880
RATE_LIMIT_PER_MINUTE=60
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://77.42.92.151:5173,http://77.42.92.151:5174,https://77.42.92.151:5176,http://localhost:5173,http://localhost:5174
```

### Variables de Control de Vendors — Detalle

#### ENABLE_VENDOR_LOGIN

- `False` (desarrollo): backend arranca sin ejecutar ningún login. El simulador no los necesita.
- `True` (UAT/Producción): al arrancar, hace login con todos los vendors activos que lo requieran (actualmente MEGAPUNTO). El `token_manager` queda cargado con el JWT.

#### VENDOR_SIMULATOR_ENABLED

- `True` (desarrollo): todas las llamadas de provisión van a `VENDOR_SIMULATOR_URL` (Flask local). Permite probar el flujo completo sin consumir saldo real.
- `False` (UAT/Producción): las llamadas van a las URLs reales de los vendors (`vendor_url_uat` o `vendor_url_prod` según `is_production` en BD).

#### PAYMENT_GATEWAY y CULQI

El gateway Culqi se identifica con las llaves API — no hay número de comercio ni nombre de merchant en el código. Culqi resuelve internamente a qué cuenta pertenece la `secret_key`. Las llaves actuales pertenecen a LATCOM HORIZONS PERU SRL (empresa propietaria del contrato con Culqi).

---

## EXCEPTION HANDLERS <a name="exceptions"></a>

```python
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={
        "detail": "Endpoint no encontrado",
        "path": str(request.url)
    })

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(status_code=500, content={
        "detail": "Error interno del servidor",
        "message": str(exc) if settings.DEBUG else "Error interno"
    })
```

---

**FIN DEL DOCUMENTO 04**

*Versión: 5.0 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Cambios v5.0: Migración Izipay → Culqi. Directorio payments actualizado (culqi_adapter.py, gateway.py). Variables CULQI_* en config.py. BARCODE_AVAILABLE=False para Perú. CORS via settings.CORS_ORIGINS con puerto 5176. SDK culqi-python-oficial + pycryptodome. refresh_token_manager.py en services. .env actualizado sin variables Izipay.*
*Continúa en: DOC 05 — Backend: Routers y Endpoints*


---

<a name="05-backend-routers-endpoints"></a>

# DOCUMENTO 05
## BACKEND — ROUTERS Y ENDPOINTS

**Versión:** 4.1
**Fecha:** Abril 2026
**Sistema:** Latconecta v2.0.0
**Total:** 16 routers activos · ~87 endpoints

---

## CONTENIDO

1. [Resumen de Routers](#resumen)
2. [Router: auth](#auth)
3. [Router: users](#users)
4. [Router: countries](#countries)
5. [Router: services](#services)
6. [Router: companies](#companies)
7. [Router: products](#products)
8. [Router: vendors](#vendors)
9. [Router: vendor_products](#vendor-products)
10. [Router: vendor_api_mappings](#api-mappings)
11. [Router: mock_vendors](#mock-vendors)
12. [Router: operations_config](#operations-config)
13. [Router: purchases](#purchases)
14. [Router: latconecta](#latconecta)
15. [Router: upload](#upload)
16. [Router: exchange_rate](#exchange-rate)
17. [Router: payments](#payments)
18. [Endpoints Inline en main.py](#inline)

---

## RESUMEN DE ROUTERS <a name="resumen"></a>

| # | Router | Archivo | Prefix | Endpoints | Descripción |
|---|--------|---------|--------|-----------|-------------|
| 1 | auth | auth.py | /api/v1/auth | 6 | Login, register, perfil, cambio password, recuperación password |
| 2 | users | users.py | /api/v1/users | 5 | CRUD usuarios |
| 3 | countries | countries.py | /api/v1/countries | 5 | CRUD países |
| 4 | services | services.py | /api/v1/services | 5 | CRUD servicios |
| 5 | companies | companies.py | /api/v1/companies | 5 | CRUD compañías |
| 6 | products | products.py | /api/v1/products | 5 | CRUD productos |
| 7 | vendors | vendors.py | /api/v1/vendors | 14 | CRUD vendors + balance + test + catalog sync |
| 8 | vendor_products | vendor_products.py | /api/v1/vendor-products | 9 | CRUD vendor products |
| 9 | vendor_api_mappings | vendor_api_mappings.py | /api/v1/vendor-api-mappings | 15 | Motor API Mappings |
| 10 | mock_vendors | mock_vendors.py | /api/v1/mock | 20 | Mock HTTP de vendors |
| 11 | operations_config | operations_config.py | /api/v1/operations | 14 | Control fase1/fase2 |
| 12 | purchases | purchases.py | /api/v1/purchases | 6 | Transacciones de compra |
| 13 | latconecta | latconecta.py | /api/v1/latconecta | 2 | Info corporativa |
| 14 | upload | upload.py | /api/v1 | 2 | Upload de imágenes |
| 15 | exchange_rate | exchange_rate.py | /api/v1/exchange-rate | 1 | Tipo de cambio |
| 16 | payments | router.py | /api/v1/payments | 5 | Gateway de pagos |
| — | inline (main.py) | main.py | / | 2 | Root + health |
| **TOTAL** | **16 routers** | — | — | **~89** | — |

---

## ROUTER: auth — Autenticación <a name="auth"></a>

**Prefix:** `/api/v1/auth`

```
POST   /api/v1/auth/login             # Login de usuario
POST   /api/v1/auth/register          # Registrar nuevo usuario
GET    /api/v1/auth/me                # Obtener usuario actual
POST   /api/v1/auth/change-password   # Cambiar contraseña (autenticado)
POST   /api/v1/auth/forgot-password   # Solicitar código de recuperación (público)
POST   /api/v1/auth/reset-password    # Restablecer contraseña con código (público)
```

### POST /login

**Request:**
```json
{
  "email": "juan@email.com",
  "password": "Admin123"
}
```

**Response 200:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "user_id": 2,
    "user_email": "juan@email.com",
    "user_name": "Juan",
    "user_role": "user"
  }
}
```

**Errores:** 401 si credenciales inválidas, 400 si usuario inactivo.

### POST /register

**Request:**
```json
{
  "user_email": "nuevo@email.com",
  "user_password": "Nuevaclave1",
  "user_name": "Nuevo",
  "user_lastname": "Usuario"
}
```

**Validación de contraseña:** mínimo 8 caracteres + primera letra mayúscula.

**Response 201:** igual a login (retorna token).

### GET /me

**Headers:** `Authorization: Bearer {token}`

**Response 200:** datos del usuario autenticado.

### POST /change-password

**Headers:** `Authorization: Bearer {token}`

**Request:**
```json
{
  "current_password": "Admin123",
  "new_password": "NuevaClave1",
  "confirm_password": "NuevaClave1"
}
```

**Validación de contraseña:** mínimo 8 caracteres + primera letra mayúscula.

**Response 200:** `{ "success": true, "message": "Contraseña actualizada exitosamente" }`

### POST /forgot-password

Endpoint público. Genera un código de 6 dígitos y lo envía al email del usuario. Por seguridad, la respuesta es siempre idéntica independientemente de si el email existe.

**Request:**
```json
{
  "email": "juan@email.com"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Si el email está registrado, recibirás un código en los próximos minutos."
}
```

El código es válido 15 minutos. Se almacena hasheado en `user_session_token` de la tabla `users`.

### POST /reset-password

Endpoint público. Verifica el código y actualiza la contraseña. El código queda invalidado tras usarse.

**Request:**
```json
{
  "email": "juan@email.com",
  "code": "482951",
  "new_password": "NuevaClave1"
}
```

**Validación de contraseña:** mínimo 8 caracteres + primera letra mayúscula.

**Response 200:**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente. Ya puedes iniciar sesión."
}
```

**Errores:** 400 si el código es inválido, expirado o la contraseña no cumple las reglas.

---

## ROUTER: users — Usuarios <a name="users"></a>

**Prefix:** `/api/v1/users`  
**Auth requerida:** admin/superadmin para la mayoría de operaciones

```
GET    /api/v1/users           # Listar usuarios (admin)
POST   /api/v1/users           # Crear usuario (admin)
GET    /api/v1/users/{user_id} # Obtener usuario
PUT    /api/v1/users/{user_id} # Actualizar usuario
DELETE /api/v1/users/{user_id} # Eliminar usuario (superadmin)
```

---

## ROUTER: countries — Países <a name="countries"></a>

**Prefix:** `/api/v1/countries`

```
GET    /api/v1/countries                 # Listar países activos
POST   /api/v1/countries                 # Crear país (admin)
GET    /api/v1/countries/{country_id}    # Obtener país por ID
PUT    /api/v1/countries/{country_id}    # Actualizar país (admin)
DELETE /api/v1/countries/{country_id}    # Eliminar país (admin)
```

**Response GET / (lista):**
```json
[
  {
    "country_id": 1,
    "country_code": "PER",
    "country_name": "Perú",
    "country_flag_photo": "/uploads/flags/pe.png",
    "country_er_usd": 3.750000,
    "status": "active"
  }
]
```

---

## ROUTER: services — Servicios <a name="services"></a>

**Prefix:** `/api/v1/services`

```
GET    /api/v1/services                  # Listar servicios
POST   /api/v1/services                  # Crear servicio (admin)
GET    /api/v1/services/{service_id}     # Obtener servicio
PUT    /api/v1/services/{service_id}     # Actualizar (admin)
DELETE /api/v1/services/{service_id}     # Eliminar (admin)
```

**Query params:** `country_id` para filtrar por país.

---

## ROUTER: companies — Compañías <a name="companies"></a>

**Prefix:** `/api/v1/companies`

```
GET    /api/v1/companies                  # Listar compañías
POST   /api/v1/companies                  # Crear compañía (admin)
GET    /api/v1/companies/{company_id}     # Obtener compañía
PUT    /api/v1/companies/{company_id}     # Actualizar (admin)
DELETE /api/v1/companies/{company_id}     # Eliminar (admin)
```

**Query params:** `country_id`, `service_id` para filtrar en jerarquía multi-tenant.

---

## ROUTER: products — Productos <a name="products"></a>

**Prefix:** `/api/v1/products`

```
GET    /api/v1/products                  # Listar productos
POST   /api/v1/products                  # Crear producto (admin)
GET    /api/v1/products/{product_id}     # Obtener producto
PUT    /api/v1/products/{product_id}     # Actualizar (admin)
DELETE /api/v1/products/{product_id}     # Eliminar (admin)
```

**Query params:** `company_id`, `product_status`, `service_id`.

---

## ROUTER: vendors — Vendors <a name="vendors"></a>

**Prefix:** `/api/v1/vendors`

```
GET    /api/v1/vendors                              # Listar vendors
POST   /api/v1/vendors                              # Crear vendor (admin)
GET    /api/v1/vendors/{vendor_code}                # Obtener vendor
PUT    /api/v1/vendors/{vendor_code}                # Actualizar vendor (admin)
DELETE /api/v1/vendors/{vendor_code}                # Eliminar vendor (admin)
GET    /api/v1/vendors/{vendor_code}/products       # Productos del vendor
GET    /api/v1/vendors/{vendor_code}/verify-currency-consistency  # Verificar consistencia de moneda
PUT    /api/v1/vendors/{vendor_code}/balance        # Actualizar balance manualmente (admin)
POST   /api/v1/vendors/{vendor_code}/sync-balance   # Sincronizar balance con vendor
GET    /api/v1/vendors/balance/low-alerts           # Vendors con balance bajo
GET    /api/v1/vendors/balance/summary              # Resumen de balances
POST   /api/v1/vendors/{vendor_code}/test-connection  # Probar conexión con vendor
POST   /api/v1/vendors/{vendor_code}/sync-catalog    # Sincronizar catálogo de productos
GET    /api/v1/vendors/{vendor_code}/sync-logs       # Historial de sincronizaciones
```

### GET /balance/low-alerts

Retorna lista de vendors cuyo saldo (USD o local) está por debajo del umbral mínimo.

```json
[
  {
    "vendor_code": "LATCOM",
    "vendor_name": "LATCOM Internacional",
    "usd_balance": 45.20,
    "alert_type": "low_usd",
    "threshold": 100.0
  }
]
```

### GET /balance/summary

```json
{
  "total_vendors": 1,
  "total_usd_balance": 4994.12,
  "vendors": [
    {
      "vendor_code": "LATCOM",
      "usd_balance": 4994.12,
      "usd_balance_status": "fresh",
      "local_balance": 18727.95,
      "local_currency": "PEN",
      "local_balance_status": "fresh",
      "is_production": false
    }
  ]
}
```

### POST /test-connection

Prueba la conexión real con el vendor (hace una llamada de prueba). Usa `vendor_manager.py` internamente.

---

### POST /sync-catalog

Ejecuta la sincronización de catálogo de productos del vendor bajo demanda. Obtiene los precios actualizados desde la API del vendor y los actualiza en `vendor_products` y `products`.

**Requiere:** Admin o Superadmin

**Parámetros:** `vendor_code` en la URL.

**Proceso:**
1. Busca el mapping activo con `operation_type='catalog_sync'` para el vendor
2. Ejecuta `UniversalVendorService.execute_catalog_sync()`
3. Guarda el resultado en `vendor_sync_logs`

**Response exitoso:**
```json
{
  "success": true,
  "vendor_code": "MEGAPUNTO",
  "mapping_code": "MP02S",
  "triggered_by": "manual:admin@latconecta.com",
  "sync_date": "2026-04-17T21:35:35.499141",
  "products_reviewed": 67,
  "products_updated": 3,
  "count_nuevo": 45,
  "count_sin_cambio": 19,
  "count_no_vino": 0,
  "count_alerta": 3,
  "changes_detail": [...],
  "message": "Sync completado: 3 actualizados, 45 nuevos, 0 no vinieron, 3 alertas de precio"
}
```

**Campos de `changes_detail`:** Un objeto por denominación procesada con: `vp_code`, `vp_skuid`, `nombre_producto`, `status` (ACTUALIZADO/SIN_CAMBIO/NUEVO/NO_VINO/ALERTA), `vp_amount_old`, `vp_amount_new`, `precio_referencial_bs`, `tipo_cambio`, `alerta_precio`.

**Errores:**
- `404` — Vendor no encontrado
- `400` — Vendor inactivo
- `404` — No existe mapping `catalog_sync` activo para el vendor
- `500` — Error en la sincronización (detalle en `error_message`)

---

### GET /sync-logs

Retorna el historial de sincronizaciones de catálogo para un vendor.

**Requiere:** Admin o Superadmin

**Response:**
```json
[
  {
    "sync_id": 1,
    "vendor_code": "MEGAPUNTO",
    "sync_date": "2026-04-17T21:35:35",
    "triggered_by": "manual:admin@latconecta.com",
    "status": "success",
    "products_reviewed": 67,
    "products_updated": 3
  }
]
```

---

## ROUTER: vendor_products — Productos de Vendor <a name="vendor-products"></a>

**Prefix:** `/api/v1/vendor-products`

```
GET    /api/v1/vendor-products                        # Listar vendor products
POST   /api/v1/vendor-products                        # Crear vendor product (admin)
GET    /api/v1/vendor-products/{vp_id}                # Obtener vendor product
PUT    /api/v1/vendor-products/{vp_id}                # Actualizar (admin)
DELETE /api/v1/vendor-products/{vp_id}                # Eliminar (admin)
GET    /api/v1/vendor-products/summary/               # Resumen estadístico
GET    /api/v1/vendor-products/by-keys/               # Buscar por vendor_code + vp_code + vp_skuid
GET    /api/v1/vendor-products/by-code/{vp_code}/     # Buscar por código
PUT    /api/v1/vendor-products/bulk-status/           # Cambio masivo de estado
```

---

## ROUTER: vendor_api_mappings — Motor de API Mappings <a name="api-mappings"></a>

**Prefix:** `/api/v1/vendor-api-mappings`

```
GET    /api/v1/vendor-api-mappings                                        # Listar mappings
POST   /api/v1/vendor-api-mappings                                        # Crear mapping (admin)
GET    /api/v1/vendor-api-mappings/{mapping_id}                           # Obtener mapping
PUT    /api/v1/vendor-api-mappings/{mapping_id}                           # Actualizar (admin)
DELETE /api/v1/vendor-api-mappings/{mapping_id}                           # Eliminar (admin)
GET    /api/v1/vendor-api-mappings/available-fields                       # Campos disponibles para mapeo
GET    /api/v1/vendor-api-mappings/operation-types                        # Tipos de operación disponibles
GET    /api/v1/vendor-api-mappings/stats/summary                          # Estadísticas de mappings
GET    /api/v1/vendor-api-mappings/vendor/{vendor_code}                   # Mappings de un vendor
GET    /api/v1/vendor-api-mappings/vendor/{vendor_code}/group/{api_group_code}  # Mappings por grupo
GET    /api/v1/vendor-api-mappings/lookup/{vendor_code}/{api_group_code}/{operation_type}  # Lookup exacto
GET    /api/v1/vendor-api-mappings/by-code/{vendor_code}/{mapping_code}   # Por mapping_code
POST   /api/v1/vendor-api-mappings/{mapping_id}/test                      # Probar mapping con datos reales
PATCH  /api/v1/vendor-api-mappings/{mapping_id}/toggle                    # Activar/desactivar
POST   /api/v1/vendor-api-mappings/validate                               # Validar configuración
```

### GET /available-fields

Retorna la lista completa de campos disponibles como `source_field` en `request_mapping`:

```json
{
  "purchase_fields": [
    "purchase_phone_number",
    "purchase_account_number",
    "purchase_vendor_amount",
    "purchase_vendor_currency",
    "purchase_reference",
    "purchase_vendpro_code",
    "purchase_vendpro_operator",
    "purchase_vendpro_country",
    "purchase_vendpro_product_type",
    "purchase_vendor_skuid"
  ],
  "vendor_product_fields": [
    "vp_code", "vp_skuid", "vp_operator", "vp_country",
    "vp_currency", "vp_amount", "vp_product_type"
  ]
}
```

### GET /lookup/{vendor_code}/{api_group_code}/{operation_type}

Endpoint crítico usado por `UniversalVendorService` para encontrar el mapping correcto:

```
GET /api/v1/vendor-api-mappings/lookup/LATCOM/LC01T/provision
```

### POST /{mapping_id}/test

Ejecuta el mapping con datos de prueba reales y retorna el request JSON que se enviaría al vendor, la respuesta real del vendor, y si se detectó como exitosa.

```json
{
  "mapping_id": 1,
  "test_data": {
    "purchase_phone_number": "987654321",
    "purchase_vendor_amount": 20.00,
    "purchase_vendpro_country": "PER",
    "purchase_vendpro_operator": "bitel"
  }
}
```

---

## ROUTER: mock_vendors — Mock HTTP de Vendors <a name="mock-vendors"></a>

**Prefix:** `/api/v1/mock`

Este router implementa un simulador HTTP completo de las APIs de vendors. A diferencia del vendor simulator (Flask separado), este mock está integrado en el backend FastAPI y responde con datos configurables desde `mock_config_storage`.

### Endpoints de Simulación de Operaciones

```
POST /api/v1/mock/{vendor_code}/provision    # Simula provisión de servicio
POST /api/v1/mock/{vendor_code}/validation   # Simula validación de teléfono/cuenta
POST /api/v1/mock/{vendor_code}/query        # Simula consulta de estado
POST /api/v1/mock/{vendor_code}/reversal     # Simula reversión de transacción
POST /api/v1/mock/{vendor_code}/reservation  # Simula reserva de saldo
POST /api/v1/mock/{vendor_code}/confirmation # Simula confirmación
GET  /api/v1/mock/{vendor_code}/balance      # Simula consulta de balance
POST /api/v1/mock/legacy/{api_name}          # Mock de APIs legacy (LATCOM)
```

### Endpoints de Configuración del Mock

```
GET  /api/v1/mock/config                           # Config global actual
POST /api/v1/mock/config/success-rate/{rate}       # Cambiar tasa de éxito global
POST /api/v1/mock/config/delay/{min_delay}/{max_delay}  # Configurar delays
POST /api/v1/mock/config/force-error/{error_type}  # Forzar tipo de error
GET  /api/v1/mock/config/stats                     # Estadísticas del mock
GET  /api/v1/mock/health                           # Health del mock

# Config legacy (para APIs LATCOM anteriores)
GET  /api/v1/mock/config/legacy/{api_name}         # Config de API específica
POST /api/v1/mock/config/legacy/{api_name}         # Actualizar config de API
GET  /api/v1/mock/config/legacy                    # Todas las configs legacy
POST /api/v1/mock/config/legacy/bulk               # Actualización masiva
POST /api/v1/mock/config/legacy/{api_name}/toggle  # Toggle success/fail
POST /api/v1/mock/config/legacy/reset              # Resetear a defaults
```

**Respuesta simulada de provision (éxito):**
```json
{
  "success": true,
  "transaction_id": "MOCK-LATCOM-20260325143022",
  "status": "completed",
  "vendor_code": "LATCOM",
  "amount": 20.0,
  "timestamp": "2026-03-25T14:30:22"
}
```

---

## ROUTER: operations_config — Control de Operaciones <a name="operations-config"></a>

**Prefix:** `/api/v1/operations`

Este router expone el `OperationsConfigService` al frontend y a herramientas de testing. Permite controlar en tiempo real si cada operación del sistema trabaja en Fase 1 (simulada) o Fase 2 (real), sin reiniciar el servidor.

### Endpoints de Consulta

```
GET /api/v1/operations/config          # Config completa de las 10 operaciones
GET /api/v1/operations/payment-config  # Config específica de métodos de pago
GET /api/v1/operations/presets         # Lista de presets disponibles
```

### Endpoints de Modificación

```
POST /api/v1/operations/config/val-cuenta-params        # Parámetros de simulación val_cuenta
POST /api/v1/operations/config/{operation}              # Cambiar modo de una operación
```

**Request POST /config/{operation}:**
```json
{
  "mode": "fase2",
  "fase1_response": "success"
}
```

### Presets (Escenarios Predefinidos)

```
POST /api/v1/operations/presets/all-fase1-success        # Todo simulado, todo exitoso
POST /api/v1/operations/presets/all-fase1-fail           # Todo simulado, todo fallido
POST /api/v1/operations/presets/all-fase2                # Todo en modo real
POST /api/v1/operations/presets/happy-path               # Alias de all-fase1-success
POST /api/v1/operations/presets/payment-fail             # Pago rechazado
POST /api/v1/operations/presets/provision-fail-reversal-ok    # Provisión falla, reversión OK
POST /api/v1/operations/presets/provision-fail-reversal-fail  # Provisión falla, reversión falla (CRÍTICO)
POST /api/v1/operations/presets/bill-payment-partial     # Bill payment con pago parcial
POST /api/v1/operations/presets/bill-payment-total       # Bill payment solo total
```

### GET /config — Respuesta completa

```json
{
  "val_telefono": {
    "mode": "fase1",
    "fase1_response": "success",
    "label": "Validación Teléfono",
    "fase2_description": "API Mapping / Backend codificado"
  },
  "val_cuenta": {
    "mode": "fase1",
    "fase1_response": "success",
    "label": "Validación Cuenta",
    "fase2_description": "API Mapping / Backend codificado",
    "fase1_params": {
      "monto_base": 8550.00,
      "indicador": "R",
      "account_holder": "Juan Pérez (Simulado)"
    }
  },
  "pago_tarjeta": { "mode": "fase1", "fase1_response": "success", ... },
  "pago_barcode": { "mode": "fase1", "fase1_response": "success", ... },
  "anulacion_tarjeta": { "mode": "fase1", "fase1_response": "success", ... },
  "provision_topup": { "mode": "fase1", "fase1_response": "success", ... },
  "provision_package": { "mode": "fase1", "fase1_response": "success", ... },
  "provision_smartphone": { "mode": "fase1", "fase1_response": "success", ... },
  "provision_transfer": { "mode": "fase1", "fase1_response": "success", ... },
  "provision_billpay": { "mode": "fase1", "fase1_response": "success", ... }
}
```

---

## ROUTER: purchases — Transacciones <a name="purchases"></a>

**Prefix:** `/api/v1/purchases`

El router más complejo del sistema. Gestiona todo el ciclo de vida de una compra.

```
POST /api/v1/purchases/create          # Crear compra (flujo completo)
POST /api/v1/purchases/validate-phone  # Validar número de teléfono
POST /api/v1/purchases/validate-account  # Validar número de cuenta
POST /api/v1/purchases/check-balance   # Verificar balance del vendor antes de pagar
GET  /api/v1/purchases/{purchase_id}   # Obtener compra por ID
GET  /api/v1/purchases/                # Listar compras (admin)
```

### POST /validate-phone

**Query params:** `product_id`, `phone_number`

Valida que el número de teléfono sea válido para el producto seleccionado. El comportamiento depende de ops_config:
- **Fase 1:** Retorna simulación (valid=true/false según configuración)
- **Fase 2:** Si el vendor_product tiene `api_group_code`, ejecuta validación real via API Mapping. Si no tiene mapping de validación, ejecuta validación local por prefijos (`phone_validation_service.py`)

**Response:**
```json
{
  "status": 200,
  "data": {
    "valid": true,
    "phone_number": "987654321",
    "message": ""
  },
  "message": "Phone validation via API mapping"
}
```

### POST /validate-account

**Query params:** `product_id`, `account_number`

Solo aplica a servicios de tipo `Bill Payment`. Retorna el monto de la deuda.

**Response:**
```json
{
  "status": 200,
  "data": {
    "valid": true,
    "account_number": "123456789",
    "monto_base": 8550.00,
    "indicador": "R",
    "account_holder": "Juan Pérez"
  },
  "message": "Account validation via API mapping"
}
```

`indicador` puede ser:
- `"T"` (Total) — el usuario debe pagar el monto exacto
- `"R"` (Rango) — el usuario puede elegir entre monto mínimo y la deuda total

### POST /check-balance

**Query params:** `product_id`, `product_type`, `user_selected_amount`, `bill_total_debt`, `bill_currency`, `payment_type`, `exchange_rate`

Verifica si el vendor tiene balance suficiente para ejecutar la compra. Se llama antes de mostrar los métodos de pago. Si el balance es insuficiente, retorna HTTP 400 con mensaje al usuario (sin revelar el motivo técnico).

**Response 200:**
```json
{"ok": true}
```

**Response 400:**
```json
{
  "detail": "Lo sentimos, este producto no está disponible en este momento."
}
```

### POST /create

El endpoint principal del sistema. Ejecuta el flujo completo de compra.

**Request:**
```json
{
  "product_id": 10,
  "user_id": 5,
  "product_type": "topup",
  "phone_number": "987654321",
  "payment_method": "card",
  "payment_gateway": "izipay",
  "payment_transaction_uuid": "uuid-del-pago-izipay",
  "payment_transaction_id": "txn-id-izipay",
  "payment_reference_number": "ref-pago",
  "payment_order_number": "order-001",
  "payment_method_detail": "CARD",
  "payment_code_auth": "AUTH123",
  "payment_amount": 19.00,
  "payment_currency": "PEN",
  "payment_transaction_datetime": "2026-03-25T14:30:00",
  "ip_address": "192.168.1.100"
}
```

**Flujo interno:**
1. Carga product + vendor_product + vendor + company desde BD
2. `purchase_calculator_service.calculate()` — calcula precios y montos
3. Valida balance del vendor (usd o local según moneda)
4. Procesa pago:
   - Si `payment_method = 'card'` y hay datos del gateway → pago ya procesado por frontend (Fase 2)
   - Si `payment_method = 'card'` sin datos → simula pago (Fase 1)
   - Si `payment_method = 'barcode'` en Fase 2 → genera barcode real
   - Si `payment_method = 'barcode'` en Fase 1 → simula barcode
5. Si pago exitoso, provisiona con vendor:
   - Fase 1: `ops_config.simulate_response(provision_op)`
   - Fase 2: `UniversalVendorService.execute_vendor_request()`
6. Si provisión falla → `_attempt_payment_reversal()` (real o simulado)
7. Actualiza balance del vendor en BD
8. Graba el registro en purchases con evidencia completa
9. Retorna PurchaseResponse

**Estados de retorno:**
- `purchase_status = 'Success'` + `purchase_payment_status = 'Success'` → Transacción completada
- `purchase_status = 'Failed'` + `purchase_payment_status = 'Reversed'` → Provisión falló, reversión OK
- `purchase_status = 'Failed'` + `requires_manual_intervention = true` → CRÍTICO, requiere soporte
- `purchase_status = 'Pending'` + `purchase_payment_status = 'Pending'` → Barcode generado, esperando pago

### GET /

**Query params:** `skip`, `limit`, `user_id`, `purchase_status`

Lista compras con filtros opcionales. Para el admin panel (Sales tab).

---

## ROUTER: latconecta — Info Corporativa <a name="latconecta"></a>

**Prefix:** `/api/v1/latconecta`

```
GET /api/v1/latconecta    # Obtener información corporativa
PUT /api/v1/latconecta    # Actualizar información corporativa (admin)
```

Ambos endpoints operan sobre el único registro de la tabla `latconecta` (latconecta_id = 1). El frontend carga este dato al iniciar para mostrar el logo, nombre, redes sociales y fotos del carrusel.

---

## ROUTER: upload — Subida de Archivos <a name="upload"></a>

**Prefix:** `/api/v1`

```
POST   /api/v1/upload/{category}             # Subir imagen
DELETE /api/v1/upload/{category}/{filename}  # Eliminar imagen
```

`category` determina el subdirectorio: `countries`, `services`, `companies`, `products`, `vendors`, `users`, `latconecta`.

Los archivos se guardan en `backend/uploads/{category}/` y se sirven como estáticos en `/uploads/{category}/filename`.

**Tamaño máximo:** 5MB (configurable con `MAX_UPLOAD_SIZE`).

---

## ROUTER: exchange_rate — Tipo de Cambio <a name="exchange-rate"></a>

**Prefix:** `/api/v1/exchange-rate`

```
GET /api/v1/exchange-rate    # Obtener tasas de cambio actuales
```

Retorna las tasas de cambio de todos los países activos en la BD.

```json
{
  "rates": {
    "PER": {
      "currency": "PEN",
      "rate_usd": 3.750000,
      "last_updated": "2026-03-25T10:00:00"
    },
    "MEX": {
      "currency": "MXN",
      "rate_usd": 17.250000,
      "last_updated": "2026-03-25T10:00:00"
    }
  }
}
```

---

## ROUTER: payments — Gateway de Pagos <a name="payments"></a>

**Prefix:** `/api/v1/payments`

```
POST /api/v1/payments/token     # Generar token de sesión Izipay
POST /api/v1/payments/validate  # Validar firma HMAC del resultado
POST /api/v1/payments/cancel    # Anular transacción (multi-gateway)
GET  /api/v1/payments/config    # Configuración pública del SDK
GET  /api/v1/payments/gateways  # Lista de gateways disponibles
```

### POST /token

El frontend llama este endpoint antes de mostrar el formulario de Izipay. El backend solicita un `formToken` a la API de Izipay y lo retorna al frontend.

**Request:**
```json
{
  "order_number": "ORDER-20260325-001",
  "amount": 1900,
  "currency": "PEN"
}
```

**Response:**
```json
{
  "success": true,
  "order_number": "ORDER-20260325-001",
  "amount": 1900,
  "currency": "PEN",
  "token": "eyJhbGciOiJSUzI1NiIsIn...",
  "transaction_id": "txn-001",
  "merchant_code": "12345678"
}
```

### POST /validate

Valida la firma HMAC-SHA256 del resultado que retorna el SDK de Izipay al frontend. Verifica que los datos del pago no fueron alterados.

**Request:**
```json
{
  "order_number": "ORDER-20260325-001",
  "transaction_id": "txn-001",
  "payload_http": "{\"code\":\"00\",\"message\":\"ACCEPTED\",...}",
  "signature": "base64_hmac_sha256"
}
```

**Response (firma válida):**
```json
{
  "success": true,
  "valid_signature": true,
  "order_number": "ORDER-20260325-001",
  "payment_status": "Autorizado",
  "unique_id": "uuid-de-izipay",
  "authorization_code": "AUTH456",
  "transaction_datetime": "2026-03-25T14:30:00",
  "pay_method": "CARD",
  "amount": "19.00",
  "currency": "PEN"
}
```

Los campos `unique_id`, `authorization_code` y `transaction_datetime` son necesarios para una eventual anulación.

### POST /cancel

Anula una transacción de pago ya procesada. Soporta múltiples gateways.

**Request:**
```json
{
  "gateway": "izipay",
  "transaction_id": "txn-001",
  "order_number": "ORDER-20260325-001",
  "amount": "19.00",
  "currency": "PEN",
  "unique_id": "uuid-de-izipay",
  "authorization_code": "AUTH456",
  "transaction_datetime": "2026-03-25T14:30:00",
  "pay_method": "CARD",
  "channel": "ecommerce"
}
```

**Response:**
```json
{
  "success": true,
  "gateway": "izipay",
  "order_number": "ORDER-20260325-001",
  "cancel_id": "CANCEL-001",
  "authorization_code_cancel": "CAUTH789",
  "message": "Transacción anulada exitosamente"
}
```

### GET /config

Retorna la configuración pública del SDK y la disponibilidad de métodos de pago según el país de instalación (sin claves secretas). El frontend la usa para inicializar el SDK y determinar qué métodos de pago mostrar.

```json
{
  "gateway": "izipay",
  "merchantCode": "12345678",
  "keyRSA": "-----BEGIN PUBLIC KEY-----\n...",
  "environment": "sandbox",
  "sdkUrl": "https://sandbox-checkout.izipay.pe/payments/v1/js/index.js",
  "card_available": true,
  "barcode_available": true
}
```

| Campo | Descripción |
|-------|-------------|
| `gateway` | Gateway activo según `PAYMENT_GATEWAY` en `.env` (izipay, conekta, stripe) |
| `card_available` | Si el pago con tarjeta está disponible en esta instalación (`CARD_AVAILABLE` en `.env`) |
| `barcode_available` | Si el barcode está disponible a nivel país (`BARCODE_AVAILABLE` en `.env`). El control granular por operadora se mantiene en `company_barcode_available` |

### GET /gateways

```json
{
  "gateways": [
    {
      "id": "izipay",
      "name": "IZIPAY",
      "country": "PE",
      "description": "IZIPAY - Perú (tarjeta, Yape, Plin)"
    }
  ],
  "default": "izipay"
}
```

---

## ENDPOINTS INLINE EN main.py <a name="inline"></a>

```
GET /         # Información básica de la API
GET /health   # Health check
```

### GET /

```json
{
  "message": "Latconecta API - Backend",
  "version": "2.0.0",
  "docs": "/docs",
  "redoc": "/redoc",
  "status": "operational"
}
```

### GET /health

```json
{
  "status": "ok",
  "app": "Latconecta API",
  "version": "2.0.0",
  "environment": "uat"
}
```

---

**FIN DEL DOCUMENTO 05**

*Versión: 4.1 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 06 — Backend: Models y Schemas*


---

<a name="06-backend-models-schemas"></a>

# DOCUMENTO 06
## BACKEND — MODELS Y SCHEMAS

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**ORM:** SQLAlchemy 2.0.44 (Async)
**Validación:** Pydantic 2.12.3

---

## CONTENIDO

1. [Resumen](#resumen)
2. [Models SQLAlchemy](#models)
3. [Schemas Pydantic](#schemas)
4. [Relaciones entre Models](#relaciones)
5. [Patrones de Diseño](#patrones)

---

## RESUMEN <a name="resumen"></a>

### Models SQLAlchemy (11)

| # | Model | Archivo | Tabla | Campos principales |
|---|-------|---------|-------|-------------------|
| 1 | Country | country.py | countries | 12 campos |
| 2 | Service | service.py | services | 9 campos |
| 3 | Company | company.py | companies | 24 campos |
| 4 | Vendor | vendor.py | vendors | 28 campos + properties |
| 5 | VendorProduct | vendor_product.py | vendor_products | 24 campos |
| 6 | VendorApiMapping | vendor_api_mapping.py | vendor_api_mappings | 18 campos |
| 7 | Product | product.py | products | 24 campos |
| 8 | User | user.py | users | 15 campos |
| 9 | Purchase | purchase.py | purchases | 60+ campos |
| 10 | Latconecta | latconecta.py | latconecta | 27 campos |

### Schemas Pydantic

Cada entidad tiene schemas separados por propósito (Base, Create, Update, Response/Public). El patrón general es:
- `XxxBase` — campos comunes
- `XxxCreate` — campos para POST
- `XxxUpdate` — campos para PUT (opcionales)
- `XxxPublic` / `XxxResponse` / `XxxInDB` — campos para respuestas GET

---

## MODELS SQLALCHEMY <a name="models"></a>

### Model: Country

```python
class Country(Base):
    __tablename__ = "countries"

    country_id   = Column(Integer, primary_key=True)
    country_code = Column(String(3), unique=True, nullable=False)  # PER, MEX, VEN
    country_name = Column(String(100), nullable=False)
    country_flag_photo  = Column(String(500))
    country_photo       = Column(String(500))
    country_description = Column(String(500))
    status         = Column(String(20), default='active')
    country_er_usd = Column(Numeric(10, 6), default=3.75)
    country_er_date = Column(TIMESTAMP, default=func.current_timestamp())
    created_by     = Column(String(100))
    updated_by     = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp())
```

### Model: Service

```python
class Service(Base):
    __tablename__ = "services"

    service_id          = Column(Integer, primary_key=True)
    service_name        = Column(String(50), nullable=False)  # TopUps, Paquetes, Bill Payment...
    service_photo       = Column(String(500))
    service_photo_mkt   = Column(String(500))
    service_description = Column(String(500))
    status           = Column(String(20), default='active')
    created_by       = Column(String(100))
    updated_by       = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp())
```

### Model: Company

```python
class Company(Base):
    __tablename__ = "companies"

    company_id      = Column(Integer, primary_key=True)
    country_id      = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    service_id      = Column(Integer, ForeignKey("services.service_id"), nullable=False)
    company_name    = Column(String(50), nullable=False)
    company_logo    = Column(String(500))
    company_photo   = Column(String(500))
    company_photo_mkt1 = Column(String(500))
    company_photo_mkt2 = Column(String(500))
    company_photo_mkt3 = Column(String(500))
    company_photo_mkt4 = Column(String(500))
    company_description5 = Column(String(500))
    company_lema_1  = Column(String(500))
    company_lema_2  = Column(String(500))
    company_status  = Column(String(20), default='active')
    company_usd_balance      = Column(Numeric(10, 2), default=0.00)
    company_usd_date_balance = Column(Date)
    company_local_currency   = Column(String(3))
    company_local_balance    = Column(Numeric(12, 2))
    company_local_date_balance = Column(TIMESTAMP)
    company_barcode_available        = Column(String(2), default='No')  # 'Si' | 'No'
    company_mail_customer_support    = Column(String(255))
    company_mail_commercial_support  = Column(String(255))
    created_by       = Column(String(100))
    updated_by       = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp())
```

### Model: Vendor

Este es el model más rico en properties calculados.

```python
class Vendor(Base):
    __tablename__ = "vendors"

    # PK
    vendor_code = Column(String(50), primary_key=True)

    # Info general
    vendor_name         = Column(String(100), nullable=False)
    vendor_display_name = Column(String(100))
    vendor_description  = Column(Text)

    # URLs
    vendor_url_uat  = Column(String(255))  # URL ambiente UAT
    vendor_url_prod = Column(String(255))  # URL ambiente Producción

    # Credenciales
    vendor_username  = Column(String(100))
    vendor_password  = Column(String(255))
    vendor_api_key   = Column(String(255))  # x-api-key para LATCOM
    vendor_user_uid  = Column(String(100))  # x-customer-id para LATCOM

    # Tokens
    vendor_access_token = Column(Text)       # Token JWT actual
    vendor_token_expiry = Column(TIMESTAMP)  # Cuándo expira

    # Balance USD
    vendor_usd_balance      = Column(Numeric(15, 2))
    vendor_usd_date_balance = Column(TIMESTAMP)

    # Balance Moneda Local
    vendor_local_currency      = Column(String(10))
    vendor_local_balance       = Column(Numeric(10, 2))
    vendor_local_date_balance  = Column(TIMESTAMP)

    # Configuración
    vendor_status   = Column(String(20), default='active')
    vendor_timeout  = Column(Integer, default=45)
    is_production   = Column(Boolean, default=False)

    # Sincronización
    auto_sync_products  = Column(Boolean, default=False)
    sync_interval_hours = Column(Integer, default=24)
    last_sync_date      = Column(TIMESTAMP)

    # Auditoría
    created_by       = Column(String(100))
    updated_by       = Column(String(100))
    created_at       = Column(TIMESTAMP, default=func.current_timestamp())
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp())

    # Relaciones
    vendor_products = relationship("VendorProduct", back_populates="vendor",
                                   cascade="all, delete-orphan")
```

**Properties del modelo Vendor:**

```python
@property
def url(self) -> str:
    """URL activa según is_production"""
    return self.vendor_url_prod if self.is_production else self.vendor_url_uat

@property
def is_active(self) -> bool:
    return self.vendor_status == 'active'

@property
def has_usd_balance_info(self) -> bool:
    return self.vendor_usd_balance is not None

@property
def has_local_balance_info(self) -> bool:
    return (self.vendor_local_balance is not None
            and self.vendor_local_currency is not None)

@property
def usd_balance_is_fresh(self) -> bool:
    """Balance USD tiene menos de 24 horas de antigüedad"""
    if not self.vendor_usd_date_balance:
        return False
    return (datetime.now() - self.vendor_usd_date_balance) < timedelta(hours=24)

@property
def usd_balance_status(self) -> str:
    """'fresh' | 'stale' | 'unknown'"""

@property
def formatted_usd_balance(self) -> str:
    """Ej: '4,994.12 USD'"""

@property
def formatted_local_balance(self) -> str:
    """Ej: '18,727.95 PEN'"""

def is_low_usd_balance(self, threshold: float = 100.0) -> bool: ...
def is_low_local_balance(self, threshold: float = 1000.0) -> bool: ...
def update_usd_balance(self, amount: float) -> None: ...
def update_local_balance(self, amount: float, currency: str = None) -> None: ...
def to_dict(self) -> dict: ...  # Sin credenciales
def to_dict_with_credentials(self) -> dict: ...  # Con credentials (solo admin)
```

### Model: VendorProduct

```python
class VendorProduct(Base):
    __tablename__ = "vendor_products"

    vp_id       = Column(Integer, primary_key=True)
    vendor_code = Column(String(50), ForeignKey("vendors.vendor_code", ondelete="CASCADE"),
                         nullable=False)

    # Campo crítico: vincula con vendor_api_mappings
    api_group_code = Column(String(50), index=True)  # Ej: 'LC01T', 'LC02B'

    # Identificación del producto en el vendor
    vp_code   = Column(String(100), nullable=False)
    vp_skuid  = Column(String(100))
    vp_name   = Column(String(255))
    vp_description = Column(Text)

    # Información del servicio
    vp_operator = Column(String(50))   # bitel, claro, movistar, entel, telcel
    vp_country  = Column(String(50))   # PER, MEX, VEN (alpha-3)
    vp_currency = Column(String(10))   # PEN, USD, MXN, VES

    # Montos
    vp_amount         = Column(Numeric(10, 2))
    vp_amount_type    = Column(String(20))  # fixed, range, variable
    vp_minimum_amount = Column(Numeric(10, 2))
    vp_maximum_amount = Column(Numeric(10, 2))

    # Tipo de producto
    vp_product_type = Column(String(1))   # 1 carácter
    vp_service_type = Column(String(50))  # data, voice, combo

    # Costos
    vp_commission = Column(Numeric(10, 2))
    vp_cost       = Column(Numeric(10, 2))
    vp_fee_usd    = Column(Numeric(10, 5), nullable=False, default=0.00000)

    # Estado y metadata
    vp_status   = Column(String(20), default='active')
    vp_metadata = Column(JSONB)

    # Auditoría
    created_by       = Column(String(100))
    updated_by       = Column(String(100))
    created_at       = Column(TIMESTAMP, default=func.current_timestamp())
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp())

    # Relaciones
    vendor = relationship("Vendor", back_populates="vendor_products")
```

**Properties del modelo VendorProduct:**

```python
@property
def is_active(self) -> bool: ...

@property
def is_range(self) -> bool:
    return self.vp_amount_type == 'range'

@property
def display_amount(self) -> str:
    """Ej: '10.00-500.00 PEN' para rangos, '20.00 PEN' para fijos"""

@property
def has_api_group(self) -> bool:
    return self.api_group_code is not None
```

### Model: VendorApiMapping

```python
class VendorApiMapping(Base):
    __tablename__ = "vendor_api_mappings"

    mapping_id   = Column(Integer, primary_key=True, autoincrement=True)
    mapping_code = Column(String(5), unique=True, nullable=False)  # 'LC01T'

    vendor_code    = Column(String(50), nullable=False)
    api_group_code = Column(String(50), nullable=False)  # Clave de agrupación
    operation_type = Column(String(50), nullable=False)  # provision, validation, etc.

    http_method  = Column(String(10), default='POST')
    endpoint_url = Column(String(500))

    # Autenticación
    auth_type   = Column(String(50))   # bearer, apikey, basic, none
    auth_config = Column(JSONB)

    # Mapeos (core del sistema)
    request_mapping     = Column(JSONB, nullable=False)
    value_transformations = Column(JSONB)
    response_mapping    = Column(JSONB)
    success_indicators  = Column(JSONB)

    # Configuración adicional
    timeout_seconds = Column(Integer, default=30)
    headers   = Column(JSONB)
    is_active = Column(Boolean, default=True)

    created_at = Column(TIMESTAMP, default=func.current_timestamp())
    updated_at = Column(TIMESTAMP, default=func.current_timestamp())
```

**Properties del modelo VendorApiMapping:**

```python
@property
def is_configured(self) -> bool:
    """Verifica que tiene todos los campos mínimos"""
    return (self.mapping_code and self.vendor_code
            and self.api_group_code and self.operation_type
            and self.request_mapping)

@property
def request_fields_count(self) -> int:
    """Número de campos en request_mapping"""

@property
def response_fields_count(self) -> int:
    """Número de campos en response_mapping"""

def build_api_request(self, source_data: dict) -> dict: ...
def parse_api_response(self, api_response: dict) -> dict: ...
```

### Model: Product

```python
class Product(Base):
    __tablename__ = "products"

    product_id      = Column(Integer, primary_key=True)
    service_id      = Column(Integer, ForeignKey("services.service_id"), nullable=False)
    country_id      = Column(Integer, ForeignKey("countries.country_id"), nullable=False)
    company_id      = Column(Integer, ForeignKey("companies.company_id"), nullable=False)

    product_code        = Column(String(50), unique=True, nullable=False)
    product_name        = Column(String(100), nullable=False)
    product_description = Column(String(500))
    product_photo       = Column(String(500))
    product_currency    = Column(String(10), nullable=False)

    # Tipo de monto: F=Fixed, R=Range, V=Variable
    product_amount_type      = Column(String(1), nullable=False, default='F')
    product_base_price       = Column(Numeric(10, 2), nullable=False)
    product_base_price_max   = Column(Numeric(10, 2))      # Solo para R
    product_discount_percentage = Column(Numeric(5, 2), nullable=False, default=0)
    product_discount_amount     = Column(Numeric(10, 2), nullable=False, default=0)
    product_discount_amount_max = Column(Numeric(10, 2))   # Solo para R
    product_fee              = Column(Numeric(10, 2), nullable=False, default=0)
    product_total_price      = Column(Numeric(10, 2), nullable=False)
    product_total_price_max  = Column(Numeric(10, 2))      # Solo para R

    # Vinculación con vendor_product (referencial, no FK formal)
    product_vendor_code   = Column(String(100))
    product_vendpro_code  = Column(String(50), nullable=False, default='Vend001')
    product_vendpro_skuid = Column(String(50), nullable=False)

    product_status = Column(String(20), nullable=False, default='active')

    created_by       = Column(String(100))
    updated_by       = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp())

    # Relaciones (para joinedload en purchases)
    company = relationship("Company", foreign_keys=[company_id])
    service = relationship("Service", foreign_keys=[service_id])
```

### Model: User

```python
class User(Base):
    __tablename__ = "users"

    user_id       = Column(Integer, primary_key=True)
    user_name     = Column(String(50), nullable=False)
    user_email    = Column(String(50), unique=True, nullable=False)
    user_password = Column(String(255), nullable=False)  # Hash bcrypt
    user_photo    = Column(String(500))
    user_phone_country_code = Column(String(50))
    user_phone_number       = Column(String(50))
    user_role     = Column(String(20), default='user')   # user, admin, superadmin
    user_status   = Column(String(20), default='active')
    user_session_token  = Column(String(255))  # Legacy
    user_session_expiry = Column(TIMESTAMP)    # Legacy
    user_last_login_date = Column(TIMESTAMP)
    created_by       = Column(String(100))
    updated_by       = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp())

    # Relaciones
    purchases = relationship("Purchase", foreign_keys="Purchase.purchase_user_id",
                             back_populates="user")
```

### Model: Purchase

El model más grande y complejo. Secciones de campos:

```python
class Purchase(Base):
    __tablename__ = "purchases"

    # PK
    purchase_id = Column(Integer, primary_key=True)

    # FKs
    purchase_user_id    = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    purchase_product_id = Column(Integer, ForeignKey("products.product_id"), nullable=True)

    # Identificación
    purchase_reference = Column(String(50), nullable=False)  # UNIQUE
    purchase_date      = Column(TIMESTAMP, nullable=False, default=func.current_timestamp())
    purchase_ip_petition = Column(String(50))

    # Producto (snapshots)
    purchase_service_name  = Column(String(100), nullable=False)
    purchase_product_name  = Column(String(100), nullable=False)
    purchase_product_type  = Column(String(50))  # topup, bill_payment, transfer, smartphone, package
    purchase_phone_number  = Column(String(15))
    purchase_account_number = Column(String(100))

    # Precios
    purchase_currency     = Column(String(10), default='USD')
    purchase_base_price   = Column(Numeric(10, 2), nullable=False)
    purchase_discount     = Column(Numeric(12, 2), nullable=False, default=0)
    purchase_fee          = Column(Numeric(12, 2), nullable=False, default=0)
    purchase_total_amount = Column(Numeric(10, 2), nullable=False)
    purchase_exch_rate    = Column(Numeric(10, 4))

    # Pago
    purchase_payment_method             = Column(String(50), nullable=False)  # card, barcode
    purchase_payment_status             = Column(String(30), nullable=False, default='pending')
    purchase_credit_card_last_digits    = Column(String(4))
    purchase_payment_ref                = Column(String(255))
    purchase_barcode_code               = Column(String(50))
    purchase_barcode_image              = Column(String(255))
    purchase_receip_image               = Column(String(255))
    izipay_order_code                   = Column(String(255))  # no en BD real aún
    izipay_form_token                   = Column(String(500))  # no en BD real aún

    # Estado y provisión
    purchase_status          = Column(String(30))  # Pending, Success, Failed
    purchase_delivery_status = Column(String(100))
    purchase_provision_ref   = Column(String(255))
    purchase_reversal_ref    = Column(String(255))
    purchase_delivery_name   = Column(String(50))
    purchase_delivery_phone  = Column(String(20))
    purchase_delivery_address = Column(String(100))
    requires_manual_intervention = Column(Boolean, nullable=False, default=False)

    # Vendor — datos técnicos
    purchase_vendor_code              = Column(String(50))
    vendor_name                       = Column(String(50))
    purchase_vendor_amount            = Column(Numeric(10, 2))
    purchase_vendor_currency          = Column(String(10))
    purchase_vendor_cost              = Column(Numeric(10, 2))
    purchase_vendor_skuid             = Column(String(50))
    purchase_vendor_response_code     = Column(String(50))
    purchase_vendor_response_description = Column(String(255))
    purchase_vendor_purchase_id       = Column(String(50))
    purchase_vendor_date_petition     = Column(TIMESTAMP)
    purchase_vendor_date_response     = Column(TIMESTAMP)
    purchase_vendor_json              = Column(Text)  # Legacy
    vendor_trans_id                   = Column(String(100))
    vendor_provider_trans_id          = Column(String(100))
    vendor_request                    = Column(Text)  # JSON completo enviado
    vendor_response                   = Column(Text)  # JSON completo recibido

    # Snapshots de vendor_product
    purchase_vendpro_code           = Column(String(50))
    purchase_vendpro_country        = Column(String(50))
    purchase_vendpro_operator       = Column(String(50))
    purchase_vendpro_product_type   = Column(String(1))
    purchase_vendpro_amount_type    = Column(String(20))
    purchase_vendpro_maximum_amount = Column(Numeric(10, 2))

    # Balance del vendor
    purchase_balance_currency   = Column(String(10))
    purchase_initial_balance    = Column(Numeric(10, 2))
    purchase_final_balance      = Column(Numeric(10, 2))

    # Auditoría y conciliación
    purchase_date_sent_to_conciliation = Column(TIMESTAMP)
    created_by       = Column(String(100), nullable=False, default='System')
    updated_by       = Column(String(100), nullable=False, default='System')
    last_update_date = Column(TIMESTAMP, nullable=False, default=func.current_timestamp())

    # Relaciones
    user    = relationship("User", foreign_keys=[purchase_user_id], back_populates="purchases")
    product = relationship("Product", foreign_keys=[purchase_product_id])
```

### Model: Latconecta

```python
class Latconecta(Base):
    __tablename__ = "latconecta"

    latconecta_id   = Column(Integer, primary_key=True, default=1)  # Siempre 1
    latconecta_name = Column(String(50), nullable=False)
    latconecta_logo    = Column(String(500))
    latconecta_photo   = Column(String(500))
    latconecta_photo_mkt1 = Column(String(500))
    latconecta_photo_mkt2 = Column(String(500))
    latconecta_photo_mkt3 = Column(String(500))
    latconecta_photo_mkt4 = Column(String(500))
    latconecta_description = Column(String(500))
    latconecta_lema_1  = Column(String(500))
    latconecta_lema_2  = Column(String(500))
    latconecta_credit_balance = Column(Numeric(12, 2), default=0.00)
    latconecta_date_balance   = Column(Date)
    latconecta_mail_support   = Column(String(255))
    latconecta_mail_comercial = Column(String(255))
    latconecta_status  = Column(String(20), default='active')
    latconecta_web     = Column(String(255))
    latconecta_facebook  = Column(String(255))
    latconecta_instagram = Column(String(255))
    latconecta_twitter   = Column(String(255))
    latconecta_linkedin  = Column(String(255))
    latconecta_youtube   = Column(String(255))
    latconecta_phone   = Column(String(50))
    latconecta_address = Column(String(500))
    created_by       = Column(String(100))
    updated_by       = Column(String(100))
    last_update_date = Column(TIMESTAMP, default=func.current_timestamp())
```

---

## SCHEMAS PYDANTIC <a name="schemas"></a>

Los schemas Pydantic definen los contratos de entrada/salida de los endpoints. Versión 2.x con `model_config = ConfigDict(from_attributes=True)` para compatibilidad con SQLAlchemy.

### Patrón General

```python
# Base con campos comunes
class CountryBase(BaseModel):
    country_code: str
    country_name: str
    country_er_usd: Optional[float] = None
    status: str = 'active'

# Para crear (POST) — hereda de Base
class CountryCreate(CountryBase):
    pass

# Para actualizar (PUT) — todos opcionales
class CountryUpdate(BaseModel):
    country_name: Optional[str] = None
    country_er_usd: Optional[float] = None
    status: Optional[str] = None

# Para respuesta (GET) — incluye campos de BD
class CountryResponse(CountryBase):
    country_id: int
    last_update_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
```

### Schema PurchaseCreateRequest

El schema de creación de purchase es el más complejo del sistema:

```python
class PurchaseCreateRequest(BaseModel):
    # Producto
    product_id: int
    user_id: Optional[int] = None
    product_type: Literal['topup', 'smartphone', 'transfer', 'bill_payment', 'package']
    phone_number: Optional[str] = None
    account_number: Optional[str] = None
    validation_data: Optional[Dict[str, Any]] = None
    exchange_rate: Optional[float] = None
    user_selected_amount: Optional[Decimal] = None

    # Datos del vendor product (para R y V)
    purchase_vendpro_product_type: Optional[str] = None
    purchase_vendpro_amount_type: Optional[str] = None
    purchase_vendpro_maximum_amount: Optional[Decimal] = None

    # Bill Payment
    payment_type: Optional[Literal['full', 'partial']] = 'full'
    bill_total_debt: Optional[Decimal] = None
    bill_currency: Optional[str] = None

    # Entrega (Smartphones)
    delivery_name: Optional[str] = None
    delivery_phone: Optional[str] = None
    delivery_address: Optional[str] = None

    # Pago
    payment_method: Literal['card', 'barcode']
    payment_gateway: Optional[str] = None            # 'izipay'
    payment_transaction_uuid: Optional[str] = None  # uniqueId de Izipay
    payment_transaction_id: Optional[str] = None    # transactionId
    payment_reference_number: Optional[str] = None
    payment_order_number: Optional[str] = None
    payment_method_detail: Optional[str] = None     # 'CARD', 'YAPE', etc.
    payment_code_auth: Optional[str] = None         # authorizationCode de Izipay
    payment_amount: Optional[Decimal] = None
    payment_currency: Optional[str] = None
    payment_transaction_datetime: Optional[str] = None

    # Metadata
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
```

### Schema PurchaseResponse

Retorna todos los datos de la purchase. Más de 60 campos con aliases para compatibilidad:

```python
class PurchaseResponse(BaseModel):
    purchase_id: int
    purchase_reference: str
    purchase_status: Optional[str] = None        # Pending, Success, Failed
    purchase_payment_status: str
    purchase_delivery_status: Optional[str] = None
    requires_manual_intervention: bool = False
    # ... 55+ campos más

    # Aliases para compatibilidad frontend
    payment_status: Optional[str] = None    # = purchase_payment_status
    delivery_status: Optional[str] = None  # = purchase_delivery_status
    payment_ref: Optional[str] = None      # = purchase_payment_ref
    provision_ref: Optional[str] = None    # = purchase_provision_ref
    barcode: Optional[str] = None          # = purchase_barcode_code
    barcode_image: Optional[str] = None    # = purchase_barcode_image

    model_config = ConfigDict(from_attributes=True)
```

### Schemas de Payments

```python
class PaymentCreateRequest(BaseModel):
    order_number: str
    amount: int           # En centavos (1900 = S/19.00)
    currency: str = "PEN"

class PaymentCreateResponse(BaseModel):
    success: bool
    order_number: str
    amount: int
    currency: str
    token: Optional[str] = None
    transaction_id: Optional[str] = None
    merchant_code: Optional[str] = None
    error: Optional[str] = None

class PaymentValidateRequest(BaseModel):
    order_number: str
    transaction_id: str
    payload_http: str    # JSON string del resultado Izipay
    signature: str       # HMAC-SHA256 en base64

class PaymentValidateResponse(BaseModel):
    success: bool
    valid_signature: bool
    order_number: str
    payment_status: Optional[str] = None
    message: Optional[str] = None
    # Datos para eventual anulación:
    unique_id: Optional[str] = None
    authorization_code: Optional[str] = None
    transaction_datetime: Optional[str] = None
    pay_method: Optional[str] = None
    channel: Optional[str] = None
    amount: Optional[str] = None
    currency: Optional[str] = None

class PaymentCancelRequest(BaseModel):
    gateway: str
    transaction_id: str
    order_number: str
    amount: str
    currency: str
    unique_id: Optional[str] = None
    authorization_code: Optional[str] = None
    transaction_datetime: Optional[str] = None
    pay_method: Optional[str] = None
    channel: Optional[str] = None

class PaymentCancelResponse(BaseModel):
    success: bool
    gateway: str
    order_number: str
    cancel_id: Optional[str] = None
    authorization_code_cancel: Optional[str] = None
    message: Optional[str] = None
    raw_response: Optional[dict] = None
```

---

## RELACIONES ENTRE MODELS <a name="relaciones"></a>

```
Country (1) ──────── (N) Company
           (via FK: companies.country_id)

Service (1) ──────── (N) Company
            (via FK: companies.service_id)

Company (1) ──────── (N) Product
            (via FK: products.company_id)

Service (1) ──────── (N) Product
            (via FK: products.service_id)

Country (1) ──────── (N) Product
            (via FK: products.country_id)

Vendor (1) ──────── (N) VendorProduct
           (via FK: vendor_products.vendor_code, CASCADE)

Vendor (1) ──────── (N) VendorApiMapping
           (via FK: vendor_api_mappings.vendor_code, CASCADE)

VendorProduct ──────── VendorApiMapping
              (via api_group_code — referencial, no FK)

User (1) ──────── (N) Purchase
         (via FK: purchases.purchase_user_id, SET NULL on delete)

Product (1) ──────── (N) Purchase
            (via FK: purchases.purchase_product_id)
```

### Uso de joinedload en Purchases

Para evitar N+1 queries, `purchases.py` usa `joinedload`:

```python
product_query = await db.execute(
    select(Product)
    .options(
        joinedload(Product.company),
        joinedload(Product.service)
    )
    .where(Product.product_id == request.product_id)
)
```

Esto carga el product junto con su company y service en una sola query, necesario para acceder a `product.service.service_name` y `product.company`.

---

## PATRONES DE DISEÑO <a name="patrones"></a>

### 1. Async con SQLAlchemy

Todos los accesos a BD son asíncronos usando `AsyncSession`:

```python
async def get_vendor(vendor_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Vendor).where(Vendor.vendor_code == vendor_code)
    )
    return result.scalar_one_or_none()
```

### 2. Snapshots en Purchase

La tabla purchases guarda copias (snapshots) de datos del vendor_product al momento de la compra. Esto garantiza que los reportes históricos sean correctos incluso si los datos del catálogo cambian posteriormente.

```python
purchase = Purchase(
    purchase_vendpro_country=vendor_product.vp_country,    # snapshot
    purchase_vendpro_operator=vendor_product.vp_operator,  # snapshot
    purchase_vendpro_amount_type=vendor_product.vp_amount_type,  # snapshot
    ...
)
```

### 3. Lazy Attributes en Purchase Response

`PurchaseResponse` usa `getattr` con default para campos que pueden no existir todavía en todos los registros de BD (campos agregados en versiones posteriores):

```python
izipay_order_code=getattr(purchase, 'izipay_order_code', None),
izipay_form_token=getattr(purchase, 'izipay_form_token', None),
```

### 4. JSONB para Configuraciones Dinámicas

Los campos de configuración en `vendor_api_mappings` usan `JSONB` de PostgreSQL, que permite indexación y consultas dentro del JSON sin necesidad de parsear:

```python
# SQLAlchemy con JSONB
from sqlalchemy.dialects.postgresql import JSONB
request_mapping = Column(JSONB, nullable=False)
```

---

**FIN DEL DOCUMENTO 06**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 07 — Backend: Autenticación y Seguridad*


---

<a name="07-backend-autenticacion-seguridad"></a>

# DOCUMENTO 07
## BACKEND — AUTENTICACIÓN Y SEGURIDAD

**Versión:** 4.1
**Fecha:** Abril 2026
**Sistema:** Latconecta v2.0.0
**Tecnologías:** JWT + bcrypt + FastAPI Security + aiosmtplib

---

## CONTENIDO

1. [Arquitectura de Seguridad](#arquitectura)
2. [Sistema JWT](#jwt)
3. [Hashing de Contraseñas (bcrypt)](#bcrypt)
4. [Reglas de Validación de Contraseñas](#validacion-password)
5. [Dependencies de Autenticación](#dependencies)
6. [Roles y Permisos](#roles)
7. [Protección de Endpoints](#proteccion)
8. [CORS](#cors)
9. [Flujos Completos](#flujos)

---

## ARQUITECTURA DE SEGURIDAD <a name="arquitectura"></a>

```
Cliente (Admin o Users Frontend)
    │
    │ POST /api/v1/auth/login { email, password }
    ▼
auth.py router
    │ 1. Busca user en BD por email
    │ 2. verify_password(plain, hashed) → bcrypt
    │ 3. create_access_token({ user_id, email, role }) → JWT
    ▼
Response: { access_token, token_type: "bearer", user: {...} }
    │
    ▼
Cliente guarda token en localStorage

Requests subsecuentes:
    Header: Authorization: Bearer eyJ0eXAiOiJKV1Qi...
    │
    ▼
dependencies.py
    │ get_current_user_required()
    │ - extrae Bearer token del header
    │ - jwt.decode(token, SECRET_KEY, HS256)
    │ - extrae sub (user_id o email)
    │ - busca user en BD
    │ - verifica user_status = 'active'
    │ - verifica rol si el endpoint lo requiere
    ▼
Endpoint protegido recibe objeto User válido
```

### Librerías

| Librería | Propósito |
|----------|-----------|
| python-jose[cryptography] 3.3.0 | Generación y verificación de tokens JWT |
| passlib[bcrypt] 1.7.4 | Hash de contraseñas con bcrypt |
| fastapi.security.OAuth2PasswordBearer | Extracción de Bearer token del header |
| aiosmtplib | Envío async de emails para recuperación de contraseña |

---

## SISTEMA JWT <a name="jwt"></a>

### Generación del Token

```python
# utils/auth.py
from jose import JWTError, jwt
from datetime import datetime, timedelta

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM                    # "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES  # 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

**Payload del token:**
```json
{
  "sub": "2",
  "email": "juan@email.com",
  "role": "user",
  "exp": 1742912222
}
```

`sub` es el `user_id` como string (estándar JWT).

### Verificación del Token

```python
def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return payload
    except JWTError:
        return None
```

Si el token está expirado o la firma no coincide, `JWTError` se lanza y se retorna `None`.

### Configuración

| Variable | Valor | Descripción |
|----------|-------|-------------|
| SECRET_KEY | String largo y aleatorio | Clave de firma — NUNCA compartir |
| ALGORITHM | HS256 | HMAC-SHA256 — simétrico |
| ACCESS_TOKEN_EXPIRE_MINUTES | 30 | Expiración en minutos |

**Nota de seguridad:** En producción la `SECRET_KEY` debe ser al menos 32 caracteres aleatorios. Regenerar si hay sospecha de compromiso. Todos los tokens activos quedan invalidados al cambiarla.

---

## HASHING DE CONTRASEÑAS (bcrypt) <a name="bcrypt"></a>

```python
# utils/auth.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

### Características de bcrypt

- Factor de costo: 12 (configurable, más alto = más seguro pero más lento)
- Salt aleatorio generado automáticamente en cada hash
- El mismo password siempre produce hashes diferentes (debido al salt)
- Resistente a ataques de rainbow table y fuerza bruta
- La verificación compara correctamente aunque el hash sea diferente

**Almacenamiento en BD:**
```
password plano:   "Admin123"
hash en BD:       "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/igw3fEqmS"
```

---

## REGLAS DE VALIDACIÓN DE CONTRASEÑAS <a name="validacion-password"></a>

Todos los endpoints que crean o modifican contraseñas aplican las mismas reglas en el backend:

| Regla | Detalle |
|-------|---------|
| Longitud mínima | 8 caracteres |
| Primera letra | Debe ser mayúscula |

Estas reglas aplican a:
- `POST /auth/register` — al crear una cuenta nueva
- `POST /auth/change-password` — al cambiar la contraseña estando autenticado
- `POST /auth/reset-password` — al restablecer la contraseña con código de recuperación

**Validación en backend (`auth.py`):**
```python
if len(new_password) < 8:
    raise HTTPException(400, "La nueva contraseña debe tener al menos 8 caracteres.")
if not new_password[0].isupper():
    raise HTTPException(400, "La nueva contraseña debe comenzar con una letra mayúscula.")
```

El frontend también valida estas reglas antes de enviar la solicitud, para dar feedback inmediato sin necesidad de una llamada al backend.

---

## DEPENDENCIES DE AUTENTICACIÓN <a name="dependencies"></a>

Las 4 funciones en `dependencies.py` son FastAPI dependencies — se inyectan en los endpoints mediante `Depends()`.

```python
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
```

### 1. get_current_user_optional()

Retorna el usuario si el token es válido, o `None` si no hay token o es inválido. No lanza excepciones.

```python
async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None
    payload = verify_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.user_id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user or user.user_status != 'active':
        return None
    return user
```

**Uso:** Endpoints que permiten acceso anónimo pero personalizan la respuesta si hay usuario.

### 2. get_current_user_required()

Igual al anterior pero lanza `HTTP 401 Unauthorized` si no retorna un usuario válido.

```python
async def get_current_user_required(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No autenticado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.user_id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None or user.user_status != 'active':
        raise credentials_exception
    return user
```

**Uso:** Cualquier endpoint que requiera login.

### 3. get_current_admin_user()

Extiende `get_current_user_required()`. Verifica que el rol sea `admin` o `superadmin`. Lanza `HTTP 403 Forbidden` si no tiene permiso.

```python
async def get_current_admin_user(
    current_user: User = Depends(get_current_user_required)
) -> User:
    if current_user.user_role not in ['admin', 'superadmin']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes. Se requiere rol de administrador."
        )
    return current_user
```

### 4. get_current_superadmin_user()

Solo permite `user_role = 'superadmin'`.

```python
async def get_current_superadmin_user(
    current_user: User = Depends(get_current_user_required)
) -> User:
    if current_user.user_role != 'superadmin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permisos insuficientes. Se requiere rol de superadministrador."
        )
    return current_user
```

**Uso:** Eliminación de usuarios, gestión de roles, operaciones destructivas críticas.

---

## ROLES Y PERMISOS <a name="roles"></a>

### Tabla de Permisos

| Operación | Sin Auth | user | admin | superadmin |
|-----------|----------|------|-------|------------|
| Ver países/servicios/compañías | ✅ | ✅ | ✅ | ✅ |
| Ver productos | ✅ | ✅ | ✅ | ✅ |
| Ver info corporativa (latconecta) | ✅ | ✅ | ✅ | ✅ |
| Hacer compra anónima | ✅ | ✅ | ✅ | ✅ |
| Ver tipo de cambio | ✅ | ✅ | ✅ | ✅ |
| Recuperar contraseña (código email) | ✅ | ✅ | ✅ | ✅ |
| Hacer compra autenticada | ❌ | ✅ | ✅ | ✅ |
| Ver historial propio | ❌ | ✅ | ✅ | ✅ |
| Actualizar perfil propio | ❌ | ✅ | ✅ | ✅ |
| Cambiar contraseña propia | ❌ | ✅ | ✅ | ✅ |
| Panel admin (CRUD catálogos) | ❌ | ❌ | ✅ | ✅ |
| CRUD Vendors | ❌ | ❌ | ✅ | ✅ |
| API Mappings | ❌ | ❌ | ✅ | ✅ |
| Control operaciones (fase1/2) | ❌ | ❌ | ✅ | ✅ |
| Ver todas las compras | ❌ | ❌ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ❌ | ✅ |
| Eliminar usuarios | ❌ | ❌ | ❌ | ✅ |
| Cambiar roles | ❌ | ❌ | ❌ | ✅ |

### Usuarios de Prueba en Sistema

| Email | Password | Rol |
|-------|----------|-----|
| admin@bitel.com.pe | Admin123 | superadmin |
| juan@email.com | Admin123 | user |

---

## PROTECCIÓN DE ENDPOINTS <a name="proteccion"></a>

### Endpoints Sensibles y su Protección

| Endpoint | Protección | Razón |
|----------|-----------|-------|
| POST /auth/login | Sin auth | Pública por diseño |
| POST /auth/register | Sin auth | Registro abierto |
| POST /auth/forgot-password | Sin auth | Pública — inicia recuperación |
| POST /auth/reset-password | Sin auth | Pública — valida código y resetea |
| GET /auth/me | user_required | Solo el propio usuario |
| POST /auth/change-password | user_required | Solo usuario autenticado |
| POST /purchases/create | user_optional | Permite compras anónimas |
| GET /purchases/ | admin | Lista de todas las compras |
| POST /vendor-api-mappings/ | admin | Configuración crítica |
| POST /operations/presets/* | admin | Control operacional |
| DELETE /users/{id} | superadmin | Operación destructiva |
| PUT /vendors/{code} | admin | Credenciales sensibles |

---

## CORS <a name="cors"></a>

### Configuración Actual

```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### CORS para Archivos Estáticos

```python
@app.middleware("http")
async def add_cors_headers_to_static_files(request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/uploads/"):
        ext = request.url.path.split(".")[-1].lower()
        if ext in ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]:
            response.headers["Access-Control-Allow-Origin"] = "*"
    return response
```

---

## FLUJOS COMPLETOS <a name="flujos"></a>

### Flujo de Login

```
1. Cliente: POST /api/v1/auth/login
   Body: { "email": "juan@email.com", "password": "Admin123" }

2. auth.py:
   a. SELECT * FROM users WHERE user_email = 'juan@email.com'
   b. Si no existe: HTTP 401 "Email o password incorrecto"
   c. bcrypt.verify("Admin123", user.user_password)
   d. Si falla: HTTP 401 "Email o password incorrecto"
   e. Si user.user_status != 'active': HTTP 400 "Usuario inactivo"
   f. token = create_access_token({"sub": str(user.user_id), "email": email, "role": role})
   g. UPDATE users SET user_last_login_date = NOW() WHERE user_id = X
   h. COMMIT

3. Response 200:
   {
     "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     "token_type": "bearer",
     "user": {
       "user_id": 2,
       "user_email": "juan@email.com",
       "user_name": "Juan",
       "user_role": "user"
     }
   }
```

### Flujo de Registro

```
1. Cliente: POST /api/v1/auth/register
   Body: { user_email, user_password, user_name }

2. auth.py:
   a. SELECT * FROM users WHERE user_email = X
   b. Si existe: HTTP 400 "Email ya registrado"
   c. Validar contraseña: mínimo 8 chars + primera letra mayúscula
   d. hashed = get_password_hash(user_password)
   e. INSERT INTO users (...)
   f. COMMIT
   g. Genera token igual que en login

3. Response 201: igual que login (token + user data)
```

### Flujo de Cambio de Contraseña

```
1. Cliente: POST /api/v1/auth/change-password
   Headers: Authorization: Bearer {token}
   Body: { current_password, new_password, confirm_password }

2. auth.py:
   a. get_current_user_required() → valida token, retorna User
   b. verify_password(current_password, user.user_password)
   c. Si falla: HTTP 400 "Contraseña actual incorrecta"
   d. Validar new_password: mínimo 8 chars + primera letra mayúscula
   e. Si new_password != confirm_password: HTTP 400
   f. Si new_password == current_password: HTTP 400
   g. UPDATE users SET user_password = get_password_hash(new_password)
   h. COMMIT

3. Response 200: { "success": true, "message": "Contraseña actualizada exitosamente" }
```

### Flujo de Recuperación de Contraseña (Código Email)

Permite restablecer la contraseña sin estar autenticado. Usa dos endpoints públicos y reutiliza campos legacy de la tabla `users` sin cambio de esquema.

**Campos reutilizados:**
- `user_session_token` — almacena el código hasheado con bcrypt
- `user_session_expiry` — almacena la expiración (15 minutos)

```
PASO 1 — Solicitar código:
1. Cliente: POST /api/v1/auth/forgot-password
   Body: { "email": "juan@email.com" }

2. auth.py:
   a. Busca usuario por email
   b. Si existe y está activo:
      - Genera código 6 dígitos aleatorio
      - Hashea el código con bcrypt
      - Guarda en user_session_token / user_session_expiry (+15 min)
      - Llama a email_service.send_reset_code()
        → Email HTML con el código visible en grande
   c. Si no existe: no hace nada (no revela si el email existe)

3. Response 200 siempre idéntico:
   { "success": true, "message": "Si el email está registrado, recibirás un código..." }

PASO 2 — Verificar código y nueva contraseña:
1. Cliente: POST /api/v1/auth/reset-password
   Body: { "email": "juan@email.com", "code": "482951", "new_password": "Nuevaclave1" }

2. auth.py:
   a. Busca usuario por email
   b. Verifica que user_session_token y user_session_expiry no sean NULL
   c. Verifica que datetime.utcnow() <= user_session_expiry
      - Si expirado: limpia token, HTTP 400
   d. bcrypt.verify(code, user_session_token)
      - Si falla: HTTP 400
   e. Valida new_password: mínimo 8 chars + primera letra mayúscula
   f. Actualiza user_password, limpia user_session_token y user_session_expiry
   g. COMMIT

3. Response 200:
   { "success": true, "message": "Contraseña restablecida exitosamente." }
```

**Propiedades de seguridad:**
- El código se almacena hasheado — nunca en texto plano en BD
- La respuesta de `forgot-password` es siempre idéntica (no revela si el email existe)
- El código expira en 15 minutos
- El código queda invalidado inmediatamente tras ser usado
- Un solo uso por código — no se puede reutilizar

### Servicio de Email (email_service.py)

**Archivo:** `services/email_service.py`

```python
async def send_reset_code(to_email: str, user_name: str, code: str) -> bool:
    """
    Envía email HTML con el código de recuperación vía Gmail SMTP.
    Requiere SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD en .env.
    """
    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,    # smtp.gmail.com
        port=settings.SMTP_PORT,         # 587
        username=settings.SMTP_USER,
        password=settings.SMTP_PASSWORD, # App Password de Google
        start_tls=True,
    )
    return True
```

**Variables de entorno requeridas (`.env`):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=latconecta.digital@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME=LatConecta
```

---

**FIN DEL DOCUMENTO 07**

*Versión: 4.1 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Cambios v4.1: Nueva sección — Reglas de validación de contraseñas (mínimo 8 chars + primera mayúscula). Nuevos endpoints — forgot-password y reset-password. Nuevo servicio — email_service.py con aiosmtplib. Tabla de permisos y endpoints actualizada.*
*Continúa en: DOC 08 — Backend: Sistema de API Mappings*


---

<a name="08-backend-sistema-api-mappings"></a>

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


---

<a name="09-backend-control-operaciones"></a>

# DOCUMENTO 09
## BACKEND — SISTEMA DE CONTROL DE OPERACIONES (FASE 1 / FASE 2)

**Versión:** 6.0
**Fecha:** Junio 2026
**Sistema:** Latconecta v2.0.0
**Archivo principal:** `services/operations_config_service.py`
**Router:** `routers/operations_config.py`

---

## CONTENIDO

1. [Visión General](#vision)
2. [Las 10 Operaciones Controlables](#operaciones)
3. [Modos: Fase 1 y Fase 2](#modos)
4. [Reglas de Uso por Modo](#reglas-uso)
5. [OperationsConfigService](#service)
6. [Presets Predefinidos](#presets)
7. [Uso en purchases.py](#uso)
8. [Panel de Control (Frontend)](#panel)
9. [Flujos de Prueba Completos](#flujos)

---

## VISIÓN GENERAL <a name="vision"></a>

El **Sistema de Control de Operaciones** permite controlar en tiempo real si cada operación del flujo de compra trabaja en modo **simulado (Fase 1)** o **real (Fase 2)**, sin necesidad de reiniciar el servidor ni cambiar código.

### Diferencias con el sistema anterior

| Aspecto | Sistema Mock (anterior) | Control de Operaciones (actual) |
|---------|------------------------|--------------------------------|
| Granularidad | Global (todo mock o todo real) | Por operación (10 operaciones independientes) |
| Configuración | Variables de entorno | En memoria, API en tiempo real |
| Presets | No | 9 escenarios predefinidos |
| Visibilidad | No tenía panel | Panel visual en frontend |
| Reinicio necesario | Sí para cambios | No — en tiempo real |

### Componentes

| Componente | Archivo | Propósito |
|------------|---------|-----------|
| OperationsConfigService | services/operations_config_service.py | Servicio central — almacena y consulta configuración |
| operations_config router | routers/operations_config.py | Expone la configuración al frontend y a tests |
| OperationsPanel.jsx | Frontend Users | Panel de control visual |
| purchases.py | Consumidor principal | Consulta la config en cada paso del flujo |

---

## LAS 10 OPERACIONES CONTROLABLES <a name="operaciones"></a>

| Operación | Label | Qué hace en Fase 2 |
|-----------|-------|-------------------|
| `val_telefono` | Validación Teléfono | API Mapping validation / validación local por prefijos |
| `val_cuenta` | Validación Cuenta | API Mapping validation para Bill Payment |
| `pago_tarjeta` | Pago Tarjeta | Culqi Checkout V4 real (SDK frontend + charge_id al backend) |
| `pago_barcode` | Pago Barcode | Genera barcode real en barcodeapi.org |
| `anulacion_tarjeta` | Anulación Tarjeta | Refund real en Culqi (culqi_adapter.create_refund) |
| `provision_topup` | Provisión TopUp | API Mapping provision (UniversalVendorService) |
| `provision_package` | Provisión Paquete | API Mapping provision (UniversalVendorService) |
| `provision_smartphone` | Provisión Smartphone | API Mapping provision (UniversalVendorService) |
| `provision_transfer` | Provisión Transfer | API Mapping provision (UniversalVendorService) |
| `provision_billpay` | Provisión Bill Payment | API Mapping provision (UniversalVendorService) |

---

## MODOS: FASE 1 Y FASE 2 <a name="modos"></a>

Existen 3 modos de operación efectivos. El modo se configura por operación desde el panel de control.

### Modo 1 — Fase 1 (Simulación interna total)

El sistema genera una respuesta simulada **internamente** sin hacer ninguna llamada HTTP externa. No se consulta la tabla `vendor_api_mappings`, no se llama al simulador Flask, no se llama al vendor real.

**Las respuestas success y fail están hardcodeadas** en `operations_config_service.simulate_response()`. Son genéricas e independientes del vendor — funcionan igual para LATCOM, MEGAPUNTO o cualquier vendor futuro.

Respuestas reales de `simulate_response()` para provisión:

```python
# provision_topup / provision_package / etc. — SUCCESS:
{
    'success': True,
    'provision_ref': 'SIM-PROV-TOPUP-20260401143022',
    'delivery_status': 'completed',
    'vendor_reference': 'SIM-VEND-143022'
}

# provision_topup / provision_package / etc. — FAIL:
{
    'success': False,
    'error_code': 'PROVISION_FAILED',
    'error_message': 'Error en provisión de topup (simulado)'
}
```

### Modo 2 — Fase 2 con Simulador Flask

El sistema ejecuta el flujo real completo: busca el mapping en BD, construye el request, y llama al **simulador Flask** en lugar del vendor real. Permite verificar que el request se construye correctamente según el API Mapping.

La URL de destino **NO es `vendor_url_uat`** — el sistema ignora ese campo y usa `VENDOR_SIMULATOR_URL` del `.env`.

### Modo 3 — Fase 2 con Vendor Real (UAT o Producción)

El sistema ejecuta el flujo real completo y llama al vendor real. La URL de destino es:
- `vendor_url_uat` si `vendors.is_production = false`
- `vendor_url_prod` si `vendors.is_production = true`

---

## REGLAS DE USO POR MODO <a name="reglas-uso"></a>

### Fase 1 — Simulación interna

**Cuándo usar:** Probar flujo completo de compra, lógica de BD, cálculo de precios, estados, UI — sin dependencias externas.

**Requisitos:**
- Panel de operaciones → operación en `fase1`
- Nada más. El estado de `vendor_api_mappings`, del simulador y del vendor es irrelevante.

**Comportamiento:**
- `operations_config_service.simulate_response()` retorna respuesta hardcodeada
- `UniversalVendorService` **no se ejecuta**
- `vendor_api_mappings` **no se consulta**
- Ninguna llamada HTTP externa

---

### Fase 2 con Simulador Flask

**Cuándo usar:** Verificar que el request al vendor se construye correctamente según el API Mapping, y que la respuesta se procesa bien — sin costos reales.

**Requisitos:**

| Requisito | Valor requerido |
|-----------|----------------|
| Panel de operaciones | `fase2` |
| `vendor_api_mappings.is_active` | `true` |
| `.env` `VENDOR_SIMULATOR_ENABLED` | `True` |
| `.env` `VENDOR_SIMULATOR_URL` | `http://localhost:5001` |
| Simulador Flask | Corriendo en puerto 5001 |

**Comportamiento:**
- `UniversalVendorService` busca el mapping en BD — **solo registros con `is_active = true`**
- Construye el request según `request_mapping` y `value_transformations`
- Llama a `VENDOR_SIMULATOR_URL + endpoint_url` (ignora `vendor_url_uat`)
- Procesa la respuesta según `response_mapping` y `success_indicators`

> **Si no hay mapping activo:** Error `CONFIG_NOT_FOUND` — la compra falla. No hay fallback a simulación.

---

### Fase 2 con Vendor Real

**Cuándo usar:** Pruebas contra el ambiente UAT real del vendor o paso a producción.

**Requisitos:**

| Requisito | Valor requerido |
|-----------|----------------|
| Panel de operaciones | `fase2` |
| `vendor_api_mappings.is_active` | `true` |
| `.env` `VENDOR_SIMULATOR_ENABLED` | `False` |
| `vendors.vendor_url_uat` | URL real del vendor |
| `vendors.vendor_username/password` | Credenciales reales |
| `vendors.is_production` | `false` para UAT / `true` para producción |

**Comportamiento:**
- Igual que con simulador pero la URL es `vendor_url_uat` (o `vendor_url_prod`)
- Transacción real en el ambiente del vendor

---

### Tabla resumen

| | Fase 1 | Fase 2 + Simulador | Fase 2 + Vendor Real |
|--|:------:|:-----------------:|:-------------------:|
| Panel → `fase2` | ❌ | ✅ | ✅ |
| `is_active = true` en mapping | No importa | ✅ obligatorio | ✅ obligatorio |
| `VENDOR_SIMULATOR_ENABLED=True` | No importa | ✅ | ❌ |
| Simulador Flask corriendo | No importa | ✅ obligatorio | No importa |
| Credenciales reales vendor | No importa | No importa | ✅ obligatorio |
| Llamada HTTP externa | ❌ Ninguna | ✅ localhost:5001 | ✅ URL vendor |
| Costo real | ❌ Cero | ❌ Cero | ✅ Posible |

### Configuración por Operación

Cada operación tiene su propio objeto de configuración:

```python
{
    "mode": "fase1",               # "fase1" | "fase2"
    "fase1_response": "success",   # "success" | "fail" (solo para fase1)
    "label": "Provisión TopUp",
    "fase2_description": "API Mapping (UniversalVendorService)"
}
```

La operación `val_cuenta` tiene adicionalmente `fase1_params`:

```python
{
    "mode": "fase1",
    "fase1_response": "success",
    "label": "Validación Cuenta",
    "fase2_description": "API Mapping",
    "fase1_params": {
        "monto_base": 8550.00,
        "indicador": "R",    # "T" = Total, "R" = Rango
        "account_holder": "Juan Pérez (Simulado)"
    }
}
```

---

## OPERATIONSCONFIGSERVICE <a name="service"></a>

**Archivo:** `services/operations_config_service.py`

El servicio almacena la configuración en memoria (dict de Python). Es un singleton que se inicializa una vez al arrancar el backend y persiste durante toda la vida del proceso.

### Estructura Interna

```python
class OperationsConfigService:

    # Estado por defecto al iniciar
    _default_config = {
        "val_telefono":         {"mode": "fase1", "fase1_response": "success"},
        "val_cuenta":           {"mode": "fase1", "fase1_response": "success",
                                 "fase1_params": {"monto_base": 8550.00, "indicador": "R",
                                                  "account_holder": "Juan Pérez (Simulado)"}},
        "pago_tarjeta":         {"mode": "fase1", "fase1_response": "success"},
        "pago_barcode":         {"mode": "fase1", "fase1_response": "success"},
        "anulacion_tarjeta":    {"mode": "fase1", "fase1_response": "success"},
        "provision_topup":      {"mode": "fase1", "fase1_response": "success"},
        "provision_package":    {"mode": "fase1", "fase1_response": "success"},
        "provision_smartphone": {"mode": "fase1", "fase1_response": "success"},
        "provision_transfer":   {"mode": "fase1", "fase1_response": "success"},
        "provision_billpay":    {"mode": "fase1", "fase1_response": "success"},
    }

    def __init__(self):
        self._config = deepcopy(self._default_config)
```

### Métodos de Consulta

```python
def is_fase1(self, operation: str) -> bool:
    """¿Está la operación en modo simulado?"""
    return self._config.get(operation, {}).get("mode") == "fase1"

def is_fase2(self, operation: str) -> bool:
    return not self.is_fase1(operation)

def get_fase1_response(self, operation: str) -> str:
    """'success' o 'fail'"""
    return self._config.get(operation, {}).get("fase1_response", "success")

def simulate_response(self, operation: str) -> dict:
    """Genera la respuesta simulada completa para la operación"""
    ...

def get_config(self) -> dict:
    """Config completa de las 10 operaciones"""
    return deepcopy(self._config)
```

### Métodos de Modificación

```python
def set_operation_mode(self, operation: str, mode: str, fase1_response: str = "success"):
    """Cambia el modo de una operación específica"""
    if operation not in self._config:
        raise ValueError(f"Operación desconocida: {operation}")
    self._config[operation]["mode"] = mode
    if mode == "fase1":
        self._config[operation]["fase1_response"] = fase1_response

def set_val_cuenta_params(self, monto_base: float, indicador: str, account_holder: str):
    """Configura los parámetros de simulación de val_cuenta"""
    self._config["val_cuenta"]["fase1_params"] = {
        "monto_base": monto_base,
        "indicador": indicador,
        "account_holder": account_holder
    }

def apply_preset(self, preset_name: str):
    """Aplica un preset predefinido"""
    ...

def reset_to_defaults(self):
    """Vuelve a la config por defecto"""
    self._config = deepcopy(self._default_config)
```

### Instancia Global

```python
# Al final del archivo
operations_config_service = OperationsConfigService()
```

Se importa en purchases.py y en el router:

```python
from app.services.operations_config_service import operations_config_service
```

### Respuestas Simuladas por Operación

#### val_telefono (Fase 1 Success)
```python
{
    "valid": True,
    "phone_number": source_data.get("purchase_phone_number"),
    "message": "",
    "simulated": True
}
```

#### val_cuenta (Fase 1 Success)
```python
{
    "valid": True,
    "account_number": source_data.get("purchase_account_number"),
    "monto_base": params["monto_base"],
    "indicador": params["indicador"],
    "account_holder": params["account_holder"],
    "simulated": True
}
```

#### pago_tarjeta (Fase 1 Success)
```python
{
    "success": True,
    "payment_status": "Success",
    "charge_id": f"SIM-CHR-{timestamp}",       # simula charge_id de Culqi
    "transaction_id": f"SIM-TXN-{timestamp}",
    "order_number": source_data.get("order_number"),
    "simulated": True
}
```

#### pago_barcode (Fase 1 Success)
```python
{
    "success": True,
    "barcode_code": f"SIM-BC{timestamp}",
    "barcode_image": f"/uploads/barcodes/sim_barcode_{timestamp}.png",
    "simulated": True
}
```

#### anulacion_tarjeta (Fase 1 Success)
```python
{
    "success": True,
    "cancel_id": f"SIM-CANCEL-{timestamp}",
    "message": "Anulación simulada exitosa",
    "simulated": True
}
```

#### provision_topup / provision_package / provision_smartphone / provision_transfer / provision_billpay (Fase 1 Success)

```python
{
    "success": True,
    "vendor_trans_id": f"SIM-{vendor_code}-{timestamp}",
    "vendor_provider_trans_id": f"SIM-PROV-{operator}-{timestamp}",
    "purchase_delivery_status": "completed",
    "purchase_final_balance": current_balance - vendor_amount,
    "vendor_request": {"simulated": True, "operation": operation_name},
    "vendor_response": {"simulated": True, "success": True, "status": "COMPLETED"},
    "simulated": True
}
```

Cuando `fase1_response = "fail"`, todas las operaciones retornan:
```python
{
    "success": False,
    "error": "SIMULATED_FAILURE",
    "message": f"Simulación de fallo para {operation}",
    "simulated": True
}
```

---

## PRESETS PREDEFINIDOS <a name="presets"></a>

Los presets permiten configurar instantáneamente todos las operaciones para un escenario de prueba específico.

### Preset 1: all-fase1-success (Happy Path)

Todas las operaciones en Fase 1, todas exitosas. **El preset por defecto al iniciar el sistema.**

```
val_telefono:      fase1/success
val_cuenta:        fase1/success
pago_tarjeta:      fase1/success
pago_barcode:      fase1/success
anulacion_tarjeta: fase1/success
provision_topup:   fase1/success
provision_package: fase1/success
provision_smartphone: fase1/success
provision_transfer: fase1/success
provision_billpay: fase1/success
```

**Resultado esperado en flujo:** Compra exitosa en todos los servicios.

### Preset 2: all-fase1-fail

Todas las operaciones en Fase 1, todas fallidas.

**Resultado esperado:** Validación falla, pago falla, provisión falla.

### Preset 3: all-fase2

Todas las operaciones en Fase 2 (real).

**⚠️ USAR SOLO CON CREDENCIALES REALES ACTIVAS.**

### Preset 4: happy-path

Alias de `all-fase1-success`. Nombre más descriptivo para tests de flujo completo.

### Preset 5: payment-fail

```
pago_tarjeta:  fase1/fail
pago_barcode:  fase1/fail
resto:         fase1/success
```

**Resultado esperado:** Paso 4 del PurchasePopup rechaza el pago. La compra no llega a provisión.

### Preset 6: provision-fail-reversal-ok

```
pago_tarjeta:      fase1/success
pago_barcode:      fase1/success
anulacion_tarjeta: fase1/success   ← reversión exitosa
provision_topup:   fase1/fail      ← provisión falla
provision_package: fase1/fail
provision_transfer: fase1/fail
provision_billpay: fase1/fail
provision_smartphone: fase1/fail
resto:             fase1/success
```

**Resultado esperado:**
- `purchase_payment_status = 'Refunded'`
- `purchase_status = 'Failed'`
- `requires_manual_intervention = false`

### Preset 7: provision-fail-reversal-fail (CRÍTICO)

```
pago_tarjeta:      fase1/success
pago_barcode:      fase1/success
anulacion_tarjeta: fase1/fail    ← reversión también falla
provision_topup:   fase1/fail    ← provisión falla
provision_package: fase1/fail
provision_transfer: fase1/fail
provision_billpay: fase1/fail
provision_smartphone: fase1/fail
resto:             fase1/success
```

**Resultado esperado:**
- `purchase_payment_status = 'Success'` (pago cobrado)
- `purchase_status = 'Failed'` (provisión falló)
- `requires_manual_intervention = TRUE` ← CASO CRÍTICO

Este preset prueba el escenario más delicado: el usuario pagó pero no recibió el servicio y el sistema no pudo anular el pago. Requiere intervención manual del equipo de soporte.

### Preset 8: bill-payment-partial

```
val_cuenta: fase1/success con
    indicador: "R"     ← usuario puede pagar monto parcial
    monto_base: 8550.00
resto: fase1/success
```

**Resultado esperado:** El PurchasePopup muestra step 2.6 con slider para elegir monto entre mínimo y S/8550.

### Preset 9: bill-payment-total

```
val_cuenta: fase1/success con
    indicador: "T"     ← usuario DEBE pagar el total
    monto_base: 8550.00
resto: fase1/success
```

**Resultado esperado:** El PurchasePopup muestra step 2.6 con monto fijo S/8550 sin opción de reducirlo.

---

## USO EN purchases.py <a name="uso"></a>

```python
from app.services.operations_config_service import operations_config_service

# ─── Validación de teléfono ───
if operations_config_service.is_fase1("val_telefono"):
    result = operations_config_service.simulate_response("val_telefono", source_data)
else:
    result = await UniversalVendorService.execute_vendor_request(
        db, vendor_code, api_group_code, "validation", source_data
    )

# ─── Pago con tarjeta ───
if operations_config_service.is_fase1("pago_tarjeta"):
    payment_result = operations_config_service.simulate_response("pago_tarjeta", source_data)
else:
    # El pago ya fue procesado por el frontend (Culqi Checkout V4)
    # Los datos llegan en el request: payment_transaction_id = charge_id (chr_live_XXX / chr_test_XXX)
    payment_result = {
        "success": True,
        "payment_status": "Success",
        "charge_id": request.payment_transaction_id,
        "order_number": request.payment_order_number,
        ...
    }

# ─── Provisión (por tipo de servicio) ───
provision_operation = f"provision_{service_name_to_operation(purchase_product_type)}"
# topup → provision_topup, bill_payment → provision_billpay, etc.

if operations_config_service.is_fase1(provision_operation):
    provision_result = operations_config_service.simulate_response(provision_operation, source_data)
else:
    provision_result = await universal_vendor_service.execute_vendor_request(
        db, vendor_code, api_group_code, "provision", source_data
    )

# ─── Si provisión falla, intentar reversión ───
if not provision_result["success"] and payment_result["success"]:
    reversal_op = "anulacion_tarjeta"
    if operations_config_service.is_fase1(reversal_op):
        reversal_result = operations_config_service.simulate_response(reversal_op, source_data)
    else:
        # Reversión real en Culqi: refund del charge_id
        cancel_data = {
            "gateway":   request.payment_gateway,      # "culqi"
            "charge_id": request.payment_transaction_id,  # chr_live_XXX
            "amount":    int(float(purchase.purchase_total_amount) * 100),
            "currency":  request.payment_currency,
            "reason":    "solicitud_comprador",
        }
        reversal_result = await payment_gateway_service.cancel_transaction(cancel_data)

    if reversal_result["success"]:
        purchase.purchase_payment_status = "Refunded"
        purchase.purchase_status = "Failed"
        purchase.requires_manual_intervention = False
    else:
        # CASO CRÍTICO: pago cobrado, sin reversión, sin provisión
        purchase.purchase_payment_status = "Success"
        purchase.purchase_status = "Failed"
        purchase.requires_manual_intervention = True
```

---

## PANEL DE CONTROL (FRONTEND) <a name="panel"></a>

El `OperationsPanel.jsx` en el Frontend Users es el panel de control visual del sistema.

### Funciones del Panel

- Muestra el estado actual de las 10 operaciones (Fase 1 / Fase 2)
- Permite cambiar el modo de cada operación individualmente
- Permite aplicar presets con un clic
- Muestra descripción de qué ejecutará cada operación en Fase 2

### Endpoints que usa

```
GET  /api/v1/operations/config          → carga estado actual (requiere PIN)
POST /api/v1/operations/config/{op}     → cambia modo de una operación (requiere PIN)
GET  /api/v1/operations/presets         → lista presets disponibles (requiere PIN)
POST /api/v1/operations/presets/{name}  → aplica preset (requiere PIN)
```

Todos los endpoints requieren el header `X-Ops-Pin` con el PIN configurado en `.env`:
```
OPS_PANEL_PIN=tu_pin_aqui
```

### Acceso al Panel

El panel está controlado por la variable de entorno del frontend:
```
VITE_SHOW_OPS_PANEL=true   # visible (desarrollo/UAT)
VITE_SHOW_OPS_PANEL=false  # oculto (producción)
```

Al hacer click en "Control Ops", el panel solicita el PIN antes de mostrar los controles.
El PIN se guarda en `sessionStorage` — dura mientras la pestaña esté abierta.
En producción: `OPS_PANEL_PIN` vacío en `.env` → backend rechaza cualquier request al panel.

---

## FLUJOS DE PRUEBA COMPLETOS <a name="flujos"></a>

### Prueba: Flujo Feliz (Happy Path) — Todo Fase 1

1. Panel → aplicar preset `happy-path`
2. Frontend → seleccionar país Perú → TopUps → Bitel → Recarga S/20
3. PurchasePopup → ingresar teléfono → validación pasa (simulada)
4. PurchasePopup → verificar balance → OK (simulado)
5. PurchasePopup → seleccionar tarjeta → pago OK (simulado)
6. PurchasePopup → provisión OK (simulada)
7. **Resultado esperado:** Step 6 con confetti, `purchase_status = 'Success'`

### Prueba: Pago Rechazado

1. Panel → aplicar preset `payment-fail`
2. Mismo flujo hasta paso de pago
3. **Resultado esperado:** Error en paso de pago, popup de error sin llegar a provisión

### Prueba: Intervención Manual (Caso Crítico)

1. Panel → aplicar preset `provision-fail-reversal-fail`
2. Flujo completo con pago con tarjeta
3. **Resultado esperado:**
   - `purchase_status = 'Failed'`
   - `purchase_payment_status = 'Success'` ← pago cobrado
   - `requires_manual_intervention = TRUE`
   - Panel admin → Sales tab → aparece con intervención requerida

### Prueba: Bill Payment Rango

1. Panel → aplicar preset `bill-payment-partial`
2. Frontend → seleccionar Bill Payment → Luz del Sur
3. PurchasePopup step 2 → ingresar número de cuenta → `indicador="R"`, `monto=8550`
4. PurchasePopup step 2.6 → slider de monto entre mínimo y 8550
5. Usuario elige S/3000 → continúa flujo
6. **Resultado esperado:** Compra exitosa por S/3000 (parcial)

### Prueba: Mezcla Fase 1 / Fase 2 — Culqi real + provisión simulada

Para probar el gateway de pagos Culqi real manteniendo la provisión simulada:

1. Panel → `pago_tarjeta` → Fase 2
2. Panel → `anulacion_tarjeta` → Fase 2
3. Panel → `provision_topup` → Fase 1
4. Ejecutar flujo de compra — el checkout de Culqi abrirá directamente
5. Ingresar tarjeta de prueba `4111 1111 1111 1111` / CVV 123 / fecha futura
6. El cargo se procesa en Culqi (ambiente test), la provisión es simulada

Esto permite validar la integración con Culqi sin costos de vendor.

### Prueba: Mezcla Fase 2 completa — Culqi real + Vendor real

1. Panel → `pago_tarjeta` → Fase 2
2. Panel → `anulacion_tarjeta` → Fase 2
3. Panel → `provision_topup` → Fase 2
4. `.env` → `VENDOR_SIMULATOR_ENABLED=False`
5. Ejecutar flujo completo — pago real en Culqi + provisión real en MEGAPUNTO/LATCOM

---


---

## GUÍA DE AMBIENTES DE PRUEBA <a name="ambientes"></a>

El sistema tiene tres niveles de operación que se combinan de forma independiente:
- **ops_config (F1/F2)** — controlado desde el OperationsPanel en tiempo real
- **VENDOR_SIMULATOR_ENABLED** — controlado desde `.env`, requiere reinicio
- **Pago con tarjeta** — Culqi sandbox (F2) o simulado interno (F1)

### NIVEL 1 — F1 Puro (todo simulado, sin llamadas externas)

El backend arranca con todas las operaciones en F1 por defecto. No se necesita ningún cambio.

| Componente | Estado |
|------------|--------|
| ops_config | Todo `fase1` (default al arrancar) |
| VENDOR_SIMULATOR_ENABLED | Irrelevante — F1 no llega al vendor |
| Pago tarjeta | Simulado internamente — NO abre Culqi |
| Provisión | Simulada internamente |

**Usar para:** pruebas de flujo completo sin depender de ningún sistema externo.

**Cómo activar:** El sistema ya arranca en F1. Si fue cambiado, desde el OperationsPanel aplicar preset "✅ Todo F1 OK".

---

### NIVEL 2 — F2 con Vendor Simulator

La provisión llama al Flask simulator local en vez del vendor real. El pago con tarjeta abre Culqi sandbox real.

| Componente | Estado |
|------------|--------|
| ops_config | Operaciones de provisión en `fase2` |
| VENDOR_SIMULATOR_ENABLED | `True` en `.env` + reinicio backend |
| Pago tarjeta | Culqi sandbox real (abre modal Culqi) |
| Provisión | Llama a Flask simulator en `localhost:5001` |

**Usar para:** probar el flujo con Culqi real pero sin consumir saldo del vendor.

**Cómo activar:**
```bash
# 1. Cambiar .env
VENDOR_SIMULATOR_ENABLED=True

# 2. Reiniciar backend
sudo systemctl restart latconecta-backend

# 3. Desde OperationsPanel — poner provisiones en F2
# O aplicar preset "🚀 Todo F2"
```

---

### NIVEL 3 — F2 con Vendor Real (QA/Sandbox del vendor)

La provisión llama directamente al vendor (TISI/MEGAPUNTO) en su ambiente de QA. El pago usa Culqi sandbox.

| Componente | Estado |
|------------|--------|
| ops_config | Operaciones de provisión en `fase2` |
| VENDOR_SIMULATOR_ENABLED | `False` en `.env` + reinicio backend |
| Pago tarjeta | Culqi sandbox real |
| Provisión | Llama a TISI/MEGAPUNTO QA directamente |

**Usar para:** pruebas de integración real end-to-end antes del go-live.

**Cómo activar:**
```bash
# 1. Cambiar .env
VENDOR_SIMULATOR_ENABLED=False

# 2. Reiniciar backend
sudo systemctl restart latconecta-backend

# Las operaciones ya deben estar en F2 desde el OperationsPanel
```

---

### COMBINACIONES POSIBLES

| ops_config | VENDOR_SIMULATOR | Pago tarjeta | Provisión |
|-----------|-----------------|--------------|-----------|
| F1 | cualquiera | Simulado interno | Simulada interna |
| F2 | True | Culqi sandbox | Flask simulator |
| F2 | False | Culqi sandbox | Vendor QA real |
| Mixto* | False | Según op | Según op |

*Mixto: algunas operaciones en F1 y otras en F2 — útil para aislar partes del flujo.

---

### ESTADO ACTUAL EN PRODUCCIÓN (19/06/2026)

```
VENDOR_SIMULATOR_ENABLED=False   # Vendor real (TISI sandbox)
OPS_PANEL_PIN=definido en .env   # PIN requerido para usar el panel
VITE_SHOW_OPS_PANEL=true         # Panel visible (aún en pruebas)
```

ops_config al arrancar: todo F1. Para pasar a F2 usar el OperationsPanel con el PIN.

**Para ir a producción real:**
```
VITE_SHOW_OPS_PANEL=false        # Ocultar panel
OPS_PANEL_PIN=                   # Vaciar PIN — backend rechaza cualquier cambio
```


---

**FIN DEL DOCUMENTO 09**

*Versión: 6.0 | Fecha: Junio 2026 | Cambios v6.0: Endpoints ops protegidos por PIN (X-Ops-Pin header). OperationsPanel controlado por VITE_SHOW_OPS_PANEL. GET /payments/config conectado con ops_config (fix hardcoded fase2). Sección completa de ambientes F1/F2/Simulator. Cambios v5.0: | Sistema: Latconecta v2.0.0*
*Cambios v5.0: pago_tarjeta — Culqi Checkout V4 real (antes Izipay). anulacion_tarjeta — refund real en Culqi (antes Cancel API Izipay). pago_tarjeta Fase 1 simula charge_id en lugar de transaction_uuid. Flujo de reversión actualizado: usa charge_id + cancel_transaction de PaymentGatewayService. Preset provision-fail-reversal-ok actualizado: payment_status = Refunded (antes Reversed). Flujos de prueba actualizados con tarjetas Culqi.*
*Continúa en: DOC 10 — Backend: Sistema de Pagos (Culqi + Multi-Gateway)*


---

<a name="10-backend-sistema-pagos"></a>

# DOCUMENTO 10
## BACKEND — SISTEMA DE PAGOS (CULQI + MULTI-GATEWAY)

**Versión:** 5.1
**Fecha:** Junio 2026
**Sistema:** Latconecta v2.0.0
**Archivos:** `payments/router.py`, `payments/service.py`, `payments/culqi_adapter.py`, `payments/gateway.py`, `payments/schemas.py`

---

## CONTENIDO

1. [Visión General](#vision)
2. [Arquitectura Multi-Gateway](#arquitectura)
3. [Integración Culqi (Checkout V4)](#culqi)
4. [Flujo de Pago Completo](#flujo)
5. [Endpoints del Backend](#endpoints)
6. [Adaptador Culqi](#adaptador)
7. [Configuración Pública (GET /payments/config)](#config)
8. [Configuración .env y Credenciales](#credenciales)
9. [Frontend: CulqiCheckout.jsx](#frontend)
10. [Pago con Código de Barras](#barcode)
11. [Reversión Automática](#reversion)
12. [Errores Conocidos y Trampas Críticas](#errores)

---

## VISIÓN GENERAL <a name="vision"></a>

El sistema de pagos de Latconecta está diseñado con arquitectura **multi-gateway**: el código de `purchases.py` nunca hace referencia a "Culqi" directamente — siempre llama a `payment_gateway_service.cancel_transaction()`. El gateway activo se determina por la variable `PAYMENT_GATEWAY` en `.env`.

| País de Instalación | `DEPLOYMENT_COUNTRY` | Gateway Activo | Métodos |
|---------------------|---------------------|----------------|---------|
| Perú | PE | Culqi | Tarjeta, Yape |
| México (futuro) | MX | Conekta | Tarjeta, OXXO, SPEI |
| USA (futuro) | US | Stripe | Tarjeta, Apple Pay |

### Métodos de Pago Disponibles — Perú

| Método | Gateway | Estado | Descripción |
|--------|---------|--------|-------------|
| Tarjeta de crédito/débito | Culqi | ✅ Funcional | Visa, MC, Amex |
| Yape | Culqi | ✅ Funcional | Token `ype_live_XXX` — flujo idéntico a tarjeta |
| Código de barras | barcodeapi.org | ✅ Funcional | Solo disponible en países con `BARCODE_AVAILABLE=True` |

### Métodos NO implementados (decisión de diseño)

| Método | Razón |
|--------|-------|
| Billeteras digitales / PagoEfectivo | Requieren Order creado previamente + flujo asíncrono + Webhooks — fuera del alcance actual |
| Cuotéalo | Requiere Order — misma razón |

### Legacy Izipay

El código de Izipay fue reemplazado completamente en Mayo 2026. Los archivos originales están preservados en:
- **Git tag:** `v-izipay-backup-abril2026`
- **Carpeta legacy:** `/var/www/latconecta/_legacy/izipay_abril2026/` (revisión programada octubre 2026)

---

## ARQUITECTURA MULTI-GATEWAY <a name="arquitectura"></a>

### Estructura de Archivos

```
backend/app/payments/
├── router.py          # 6 endpoints HTTP
├── service.py         # Orquesta llamadas al adapter vía gateway
├── culqi_adapter.py   # Adaptador Culqi: charge, order, refund, cancel
├── gateway.py         # Orquestador multi-gateway (PaymentGatewayService)
└── schemas.py         # Pydantic: PaymentChargeRequest, PaymentOrderRequest, etc.
```

### Orquestador gateway.py

```python
PAYMENT_ADAPTER_REGISTRY = {
    "culqi": {
        "module": "app.payments.culqi_adapter",
        "class": "CulqiAdapter",
        "country": "PE",
        "description": "Culqi - Perú (tarjeta, Yape)"
    },
    # "conekta": { ... }  # México — futuro
    # "stripe":  { ... }  # USA — futuro
}

class PaymentGatewayService:
    """Selecciona el adapter correcto según PAYMENT_GATEWAY en .env"""

    def __init__(self):
        self._active_gateway = settings.PAYMENT_GATEWAY  # "culqi"
        self._register_active_adapter()

    def get_adapter(self, gateway_name=None):
        name = gateway_name or self._active_gateway
        return self._adapters[name]

    async def cancel_transaction(self, cancel_data, gateway_name=None):
        adapter = self.get_adapter(gateway_name)
        return await adapter.cancel_transaction(cancel_data)

# Instancia global singleton
payment_gateway_service = PaymentGatewayService()
```

---

## INTEGRACIÓN CULQI (CHECKOUT V4) <a name="culqi"></a>

### Decisión de Arquitectura

Se eligió Culqi Checkout V4 porque:
1. Soporta tarjeta y Yape con una sola integración (flujo sincrónico — sin Webhooks)
2. El SDK maneja completamente la UI del formulario de pago
3. El token generado por el SDK llega al backend para crear el cargo real
4. Sin `antifraud_details` — Culqi no lo requiere y su uso con datos ficticios genera alertas en sistemas antifraude

### Flujo de Autenticación

Culqi usa la `secret_key` como Bearer token en todos los requests al API:

```
Authorization: Bearer sk_live_XXXX   (o sk_test_XXXX en pruebas)
```

La `secret_key` pertenece a la cuenta **LATCOM HORIZONS PERU SRL** (empresa propietaria del contrato con Culqi). El comercio **MITOPUPCOM** es la entidad comercial registrada bajo esa cuenta.

### Llaves de Acceso

| Llave | Prefijo | Uso | Exposición |
|-------|---------|-----|-----------|
| Public Key | `pk_live_` / `pk_test_` | Frontend (SDK) | ✅ Seguro exponer |
| Secret Key | `sk_live_` / `sk_test_` | Backend únicamente | ❌ Nunca al frontend |

**Llaves activas (Latconecta — ambiente de prueba):**
- `pk_test_7jTfx9nRR69ACCpu` → frontend
- `sk_test_sG8xgqCq1r1xq7fc` → backend

> **Nota:** Culqi informó que no existe ambiente de pruebas separado. Las llaves `pk_test_`/`sk_test_` son las proporcionadas para pruebas — los cargos con tarjetas de prueba no generan cobros reales.

### Tarjetas de Prueba Culqi

| Red | Número | Exp. | CVV | Resultado |
|-----|--------|------|-----|-----------|
| Visa | 4111 1111 1111 1111 | Cualquier futura | 123 | Aprobada |
| Visa | 4000 0200 0000 0000 | Cualquier futura | 123 | Fondos insuficientes |
| Mastercard | 5111 1111 1111 1118 | Cualquier futura | 123 | Aprobada |

**Monto mínimo:** S/6.00 (600 céntimos) para crear Orders (no aplica para cargos directos con tarjeta).

---

## FLUJO DE PAGO COMPLETO <a name="flujo"></a>

```
1. Usuario en PurchasePopup Step 4 elige "Pago con tarjeta"
   (ops_config: pago_tarjeta = fase2)
   ↓
2. Click en "Procesar Compra"
   → setShowGatewayCheckout(true)
   → CulqiCheckout se monta con autoStart=true
   ↓
3. CulqiCheckout llama GET /payments/config
   → obtiene public_key, rsa_id, card.mode
   ↓
4. CulqiCheckout inicializa SDK con:
   { title, currency, amount }
   paymentMethods: { yape: true, tarjeta: true, billetera: false }
   ↓
5. SDK abre el checkout de Culqi (modal)
   Usuario ingresa datos de tarjeta o aprueba con Yape
   ↓
6. Culqi procesa y retorna token:
   - Tarjeta: token.id = "tkn_live_XXX" o "tkn_test_XXX"
   - Yape:    token.id = "ype_live_XXX" o "ype_test_XXX"
   ↓
7. CulqiCheckout llama POST /payments/charge con:
   { token_id, amount, currency_code, email, description, order_number }
   (SIN antifraud_details — no requerido ni recomendado)
   ↓
8. Backend (culqi_adapter.create_charge):
   - Detecta tipo de token (tkn_ vs ype_)
   - Llama a culqi.charge.create(data=body)
   - Retorna { success, charge_id, outcome_type, amount, currency_code, message }
   ↓
9. CulqiCheckout llama onResult con:
   { success, charge_id, outcome_type, amount, currency, orderNumber, cancelData }
   ↓
10. PurchasePopup llama handlePaymentAndProvision con:
    { payment_gateway: 'culqi', payment_transaction_id: charge_id, ... }
    ↓
11. Backend (purchases.py) procesa provisión del servicio
    Si provisión falla → reversión automática vía culqi_adapter.create_refund()
```

---

## ENDPOINTS DEL BACKEND <a name="endpoints"></a>

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/v1/payments/charge | Crea cargo con token del Checkout V4 |
| POST | /api/v1/payments/order | Crea Order para Yape/billeteras (no usado actualmente) |
| POST | /api/v1/payments/refund | Devuelve un cargo (parcial o total) |
| POST | /api/v1/payments/cancel | Cancela/revierte un cargo (usado por purchases.py) |
| GET  | /api/v1/payments/config | Configuración pública para el SDK frontend |
| GET  | /api/v1/payments/gateways | Lista gateways disponibles |

### POST /payments/charge

**Request:**
```json
{
  "token_id": "tkn_test_XXX",
  "amount": 1500,
  "currency_code": "PEN",
  "email": "cliente@ejemplo.com",
  "description": "Latconecta",
  "order_number": "LC779069347681"
}
```

**Response exitosa:**
```json
{
  "success": true,
  "charge_id": "chr_test_XXX",
  "outcome_type": "venta_exitosa",
  "amount": 1500,
  "currency_code": "PEN",
  "message": "Su compra ha sido exitosa"
}
```

### POST /payments/refund

**Request:**
```json
{
  "charge_id": "chr_test_XXX",
  "amount": 1500,
  "reason": "solicitud_comprador"
}
```

**Response exitosa:**
```json
{
  "success": true,
  "refund_id": "ref_test_XXX",
  "amount": 1500,
  "message": "Devolución exitosa"
}
```

### GET /payments/config

**Response:**
```json
{
  "gateway": "culqi",
  "public_key": "pk_test_7jTfx9nRR69ACCpu",
  "rsa_id": null,
  "rsa_public_key": null,
  "card_available": true,
  "barcode_available": false,
  "yape_available": true,
  "wallet_available": true,
  "card": { "mode": "fase2" },
  "barcode": { "mode": "fase2" }
}
```

> **Nota:** `card.mode` y `barcode.mode` controlan el flujo en PurchasePopup — `fase2` abre el checkout real de Culqi, `fase1` simula el pago internamente.

---

## ADAPTADOR CULQI <a name="adaptador"></a>

**Archivo:** `backend/app/payments/culqi_adapter.py`
**SDK:** `culqi-python-oficial` (v1.0.0) + `pycryptodome`
**Import:** `from culqi.client import Culqi`

### Métodos implementados

#### create_charge(charge_data)

Crea un cargo usando el token del Checkout V4.

```python
body = {
    "amount":        charge_data['amount'],
    "currency_code": charge_data.get('currency_code', 'PEN'),
    "email":         charge_data['email'],
    "source_id":     charge_data['token_id'],
    "capture":       True,
    "installments":  0,
    "description":   charge_data.get('description', 'Latconecta'),
    "metadata":      {"order_number": charge_data.get('order_number', '')},
    # SIN antifraud_details — no requerido y genera alertas con datos ficticios
}
```

**Retorna:**
```python
{
    "success": bool,
    "charge_id": str | None,       # chr_live_XXX o chr_test_XXX
    "outcome_type": str | None,    # "venta_exitosa" = aprobado
    "amount": int | None,
    "currency_code": str | None,
    "message": str,
    "raw_response": dict
}
```

#### create_order(order_data)

Crea una Order en Culqi. Necesaria para habilitar billeteras y PagoEfectivo (flujo asíncrono con Webhooks — no implementado actualmente).

**Retorna:**
```python
{
    "success": bool,
    "order_id": str | None,       # ord_live_XXX
    "order_number": str | None,
    "message": str,
    "raw_response": dict
}
```

#### create_refund(refund_data)

Devuelve un cargo (parcial o total).

```python
body = {
    "amount":    refund_data['amount'],
    "charge_id": refund_data['charge_id'],
    "reason":    refund_data.get('reason', 'solicitud_comprador'),
}
```

**Retorna:**
```python
{
    "success": bool,
    "refund_id": str | None,      # ref_live_XXX
    "amount": int | None,
    "message": str,
    "raw_response": dict
}
```

#### cancel_transaction(cancel_data)

Wrapper de `create_refund` para compatibilidad con `PaymentGatewayService`. Una cancelación en Culqi es un refund total.

---

## CONFIGURACIÓN PÚBLICA <a name="config"></a>

El endpoint `GET /payments/config` retorna la configuración que el frontend necesita para inicializar el SDK. **Nunca expone la `secret_key`.**

El campo `card.mode` / `barcode.mode` indica al `PurchasePopup.jsx` si debe usar el gateway real (`fase2`) o la simulación interna (`fase1`). Este campo no existe en el sistema de `ops_config` — es una adición específica del endpoint de pagos para transmitir el modo al frontend.

---

## CONFIGURACIÓN .env Y CREDENCIALES <a name="credenciales"></a>

```bash
# Gateway activo
PAYMENT_GATEWAY=culqi
DEPLOYMENT_COUNTRY=PE

# Culqi — Latconecta (pruebas)
CULQI_PUBLIC_KEY=pk_test_7jTfx9nRR69ACCpu
CULQI_SECRET_KEY=sk_test_sG8xgqCq1r1xq7fc
CULQI_RSA_ID=                    # Vacío = sin encriptación RSA
CULQI_RSA_PUBLIC_KEY=            # Vacío = sin encriptación RSA

# Disponibilidad de métodos por país
CARD_AVAILABLE=True
BARCODE_AVAILABLE=False          # Perú no usa barcode — México sí (OXXO)
```

---

## FRONTEND: CulqiCheckout.jsx <a name="frontend"></a>

**Archivo:** `latconecta_users/src/components/payment/CulqiCheckout.jsx`

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `amount` | number | Monto en la moneda del producto (ej: 15.00) |
| `currency` | string | Código de moneda ('PEN') |
| `orderNumber` | string | Número de orden único |
| `user` | object | Usuario autenticado (email) |
| `onResult` | function | Callback con resultado del pago |
| `onCancel` | function | Callback si el usuario cancela |
| `autoStart` | boolean | Si true, abre el checkout al montarse |

### Flujo interno

```javascript
// 1. Obtiene config del backend (public_key, rsa_id)
const config = await paymentService.getConfig();

// 2. Calcula monto en céntimos
const amountCents = Math.round(parseFloat(amount) * 100);

// 3. Configura el Checkout V4
const culqiSettings = {
    title:    "Latconecta",
    currency: currency,
    amount:   amountCents,
    // SIN "order" — solo tarjeta + Yape (sincrónicos)
};

const paymentMethods = {
    yape:       true,   // Yape primero
    tarjeta:    true,
    billetera:  false,  // Requiere Order + Webhook — no implementado
    bancaMovil: false,
    agente:     false,
    cuotealo:   false,
};

// 4. Abre el checkout
culqiInstance = new window.CulqiCheckout(publicKey, config);
culqiInstance.culqi = handleCulqiAction;
culqiInstance.open();

// 5. Handler de resultado
async function handleCulqiAction() {
    if (culqiInstance.token) {
        // Tarjeta o Yape tokenizada
        const token = culqiInstance.token;  // tkn_ o ype_
        // → llama createCharge en el backend
        const chargeResp = await paymentService.createCharge({
            token_id: token.id,
            amount:   amountCents,
            email:    token.email,  // email del token, no del formulario
            ...
        });
        // → llama onResult con charge_id y cancelData
    }
}
```

### Carga del SDK en index.html

```html
<!-- Culqi Checkout V4 SDK -->
<script src="https://js.culqi.com/checkout-js"></script>
```

> **Sin `defer`** — el SDK de Culqi debe cargarse de forma síncrona para estar disponible cuando el componente React lo necesita.

### Integración en PurchasePopup.jsx

El `PurchasePopup.jsx` controla cuándo mostrar el checkout:

```javascript
// cardMode viene de paymentConfig?.card?.mode || 'fase1'
// paymentConfig proviene de GET /payments/config

if (purchaseData.paymentMethod === 'card') {
    if (cardMode === 'fase2') {
        setShowGatewayCheckout(true);  // → monta CulqiCheckout con autoStart=true
    } else {
        handlePaymentAndProvision();   // → Fase 1: simulación interna
    }
}
```

---

## PAGO CON CÓDIGO DE BARRAS <a name="barcode"></a>

El sistema de barcode es independiente del gateway Culqi. Usa `barcodeapi.org` para generar la imagen del código.

### Disponibilidad por País

**Perú:** `BARCODE_AVAILABLE=False` — Perú opera con tarjeta y Yape únicamente.
**México:** `BARCODE_AVAILABLE=True` — México opera con barcode (OXXO Pay).

### Control de dos niveles

**Nivel 1 — País/Instalación (.env):**
```bash
BARCODE_AVAILABLE=False
```

**Nivel 2 — Operadora (BD):**
```javascript
company.company_barcode_available === 'Si'
```

Ambas condiciones deben ser `True` para que el usuario vea la opción de barcode.

---

## REVERSIÓN AUTOMÁTICA <a name="reversion"></a>

Cuando la provisión del servicio falla después de un pago exitoso, el sistema intenta una reversión automática del cargo en Culqi.

### Flujo en purchases.py

```python
# Si provisión falla y el pago fue exitoso:
if not provision_result["success"] and payment_result["success"]:
    cancel_data = {
        "gateway":   request.payment_gateway,    # "culqi"
        "charge_id": request.payment_transaction_id,  # chr_live_XXX
        "amount":    int(float(calculation.purchase_total_amount) * 100),
        "currency":  request.payment_currency or calculation.purchase_currency,
        "reason":    "solicitud_comprador",
    }
    result = await payment_gateway_service.cancel_transaction(cancel_data)

    if result["success"]:
        purchase.purchase_payment_status = "Refunded"
        purchase.purchase_reversal_ref = result["cancel_id"]
        purchase.purchase_status = "Failed"
        # requires_manual_intervention = False
    else:
        purchase.purchase_payment_status = "Success"  # cobrado pero no devuelto
        purchase.purchase_status = "Failed"
        purchase.requires_manual_intervention = True   # ← CASO CRÍTICO
```

### Condición para ejecutar reversión real

```python
has_gw = (
    request.payment_method == 'card'
    and request.payment_gateway          # "culqi"
    and request.payment_transaction_id   # chr_live_XXX
)
```

> **Nota importante:** A diferencia de Izipay (que requería `payment_transaction_uuid` y `payment_code_auth`), Culqi solo necesita el `charge_id` para ejecutar la reversión. El campo `izipay_order_code` en la BD se usa temporalmente para almacenar el `order_number` de Culqi — pendiente renombrar en una migración futura.

---

## ERRORES CONOCIDOS Y TRAMPAS CRÍTICAS <a name="errores"></a>

| Error | Causa | Solución |
|-------|-------|---------|
| `address is invalid` (param_error) | `antifraud_details.address` enviado con valor `'N/A'` (4 chars, mínimo 5) | Eliminado `antifraud_details` completamente — no requerido por Culqi |
| `description invalid` | Campo `description` menor a 5 caracteres | Default mínimo `'Latconecta'` (10 chars) |
| `token inactive` | Token generado hace más de 15 minutos | Los tokens Culqi expiran en 15 min — usar inmediatamente |
| `Excede límite diario de intentos por correo` | Culqi bloquea el correo después de N intentos fallidos | Usar correo diferente — se resetea al día siguiente |
| `Excede límite diario de intentos por tarjeta` | Idem para tarjeta | Usar tarjeta diferente |
| `Excede límite diario de intentos por dispositivo` | Idem para IP/dispositivo | Resetea al día siguiente |
| `Culqi3DS is not defined` | El dominio no está registrado en Culqi para 3DS | Warning ignorable — no afecta el cargo. Desaparece con dominio real registrado |
| `Mixed Content` fetch bloqueado | Frontend HTTPS llama a backend HTTP | Usar proxy Nginx en puerto 443 — no llamar directamente al 8100 |
| CORS bloqueado desde `https://IP:5176` | Origen del simulador no estaba en `CORS_ORIGINS` | Agregar `"https://77.42.92.151:5176"` a `PRODUCTION_ORIGINS` en `config.py` |
| Checkout no abre (se queda cargando) | `setShowGatewayCheckout(true)` faltaba en el bloque `fase2` de `PurchasePopup.jsx` | Bug corregido en Mayo 2026 |
| 404 al navegar de vuelta en la SPA | Rutas absolutas `/select` sin prefijo `basename` en `ShopView.jsx` y `ProfileView.jsx` | Corregido a `/latconecta_users/select` y `/latconecta_users/shop` |

### Warnings del SDK de Culqi en consola — clasificación

| Warning | Origen | Afecta funcionamiento |
|---------|--------|----------------------|
| `Culqi3DS is not defined` | Dominio no registrado para 3DS | No |
| `Rejected message from untrusted origin` | Dominio no registrado en Culqi | No |
| Errores CORS de `dynatrace.com` | Telemetría interna del SDK | No |

---

## IMPUESTO A LAS VENTAS — IGV/IVA <a name="igv"></a>

### Configuración por País

El impuesto a las ventas es un parámetro del sistema configurable por país de instalación. Se define en `.env` y se expone via `settings`:

```bash
TAX_LABEL=IGV    # Denominación local: IGV (Perú), IVA (México, Venezuela)
TAX_RATE=0.18    # Tasa: 18% Perú, 16% México/Venezuela
```

| País | TAX_LABEL | TAX_RATE |
|------|-----------|----------|
| Perú (activo) | IGV | 0.18 |
| México | IVA | 0.16 |
| Venezuela | IVA | 0.16 |

### Regla de Cálculo — Protección Cliente + SUNAT

Los precios en productos **ya incluyen IGV**. El cálculo desglosa desde el total:

```python
# purchase_calculator_service.py
def _calculate_tax(total: Decimal) -> tuple:
    rate = Decimal(str(settings.TAX_RATE))
    tax_amount = round(total / (1 + rate) * rate, 2)  # IGV redondeado
    base_imponible = total - tax_amount                # Base absorbe residuo
    return float(base_imponible), float(tax_amount)
```

**Regla de redondeo:** Total es fijo (lo cobrado) → IGV redondeado a 2 decimales → Op. Gravada = Total − IGV. Garantiza que el IMPORTE TOTAL del recibo siempre coincide con el monto cobrado.

### Campos en PurchaseCalculation y PurchaseResponse

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `purchase_tax_label` | str | Denominación del impuesto (IGV/IVA) |
| `purchase_tax_rate` | float | Tasa aplicada (0.18) |
| `purchase_tax_amount` | float | Monto del impuesto |
| `purchase_base_imponible` | float | Base imponible (total − igv) |

### Formato del Recibo — Alineado SUNAT (R.S. 340-2017/SUNAT)

```
Valor de venta:    PEN XX.XX
Descuento (X%):   -PEN XX.XX  [si aplica]
Comisión:         +PEN XX.XX  [si aplica]
Op. Gravada:       PEN XX.XX
IGV (18%):        +PEN XX.XX
──────────────────────────────
IMPORTE TOTAL:     PEN XX.XX
```

Aplica a: recibo en pantalla (`PurchasePopup.jsx`), descarga PDF y descarga TXT.

> **Referencia:** Ver `IGV_Tratamiento_Latconecta.docx` — base legal completa y criterios de diseño.


---

**FIN DEL DOCUMENTO 10**

*Versión: 5.0 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Cambios v5.0: Migración completa Izipay → Culqi. Nuevo CulqiAdapter (charge, order, refund, cancel). Checkout V4 con Yape primero + Tarjeta. Sin antifraud_details. Reversión automática adaptada para charge_id. SPA routing corregido. CORS extendido para simulador. card.mode en payments/config. BARCODE_AVAILABLE=False para Perú.*
*Continúa en: DOC 11 — Backend: Sistema de Tipo de Cambio y Multi-Moneda*


---

<a name="11-backend-tipo-cambio"></a>

# DOCUMENTO 11
## BACKEND — SISTEMA DE TIPO DE CAMBIO Y MULTI-MONEDA

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Archivo:** `services/exchange_rate_service.py`

---

## CONTENIDO

1. [Visión General](#vision)
2. [ExchangeRateService](#service)
3. [Tipos de Conversión y Márgenes](#margenes)
4. [Scheduler de Actualización Automática](#scheduler)
5. [Almacenamiento en countries](#almacenamiento)
6. [Monedas Soportadas](#monedas)
7. [Uso en el Sistema](#uso)

---

## VISIÓN GENERAL <a name="vision"></a>

Latconecta opera en múltiples países con monedas distintas. El sistema necesita resolver conversiones en tres situaciones:

1. **Cobro al usuario:** el producto está en una moneda (ej: PEN) y el usuario paga en otra (ej: USD)
2. **Costo al vendor:** el vendor cobra en una moneda y el balance se lleva en otra
3. **Bill Payment:** el usuario elige cuánto pagar y el sistema convierte al monto del vendor

El `ExchangeRateService` centraliza todas las conversiones con márgenes comerciales configurables.

### Relación con la BD

El tipo de cambio se almacena en `countries.country_er_usd` — representa cuántas unidades de moneda local equivalen a 1 USD:

```
PER → country_er_usd = 3.750000  (1 USD = 3.75 PEN)
MEX → country_er_usd = 17.250000 (1 USD = 17.25 MXN)
VEN → country_er_usd = 36.50000  (1 USD = 36.50 VES)
```

---

## EXCHANGERATESERVICE <a name="service"></a>

**Archivo:** `services/exchange_rate_service.py`

```python
class ExchangeRateService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cache = {}       # Cache en memoria para la sesión
        self.last_update = None
```

### Método Principal: get_exchange_rate()

```python
async def get_exchange_rate(
    self,
    from_currency: str,   # 'USD'
    to_currency: str,     # 'PEN'
    margin_type: str = 'none'  # 'none' | 'pricing' | 'conciliation'
) -> float:
```

**Flujo interno:**

```
1. Si from_currency == to_currency → retorna 1.0

2. Busca en cache en memoria (cache_key = "USD_PEN")
   → Si está: usa el valor cacheado

3. Si no está en cache: busca en BD
   SELECT country_er_usd FROM countries
   WHERE country_code = 'PER' (o 'MEX' según la moneda destino)

4. Si no está en BD o está desactualizado:
   → Llama a API externa (ExchangeRate-API.com)
   → Fallback: Open Exchange Rates
   → Último recurso: valor antiguo en BD

5. Aplica margen según margin_type
6. Retorna el tipo de cambio final
```

### Método: convert_amount()

```python
async def convert_amount(
    self,
    amount: float,
    from_currency: str,
    to_currency: str,
    margin_type: str = 'none'
) -> dict:
```

**Retorna:**
```python
{
    "original_amount": 100.0,
    "original_currency": "USD",
    "converted_amount": 375.0,
    "converted_currency": "PEN",
    "exchange_rate": 3.75,
    "margin_type": "none"
}
```

### APIs Externas (Prioridad)

| Prioridad | API | URL base |
|-----------|-----|---------|
| 1 | ExchangeRate-API | https://api.exchangerate-api.com/v4 |
| 2 | Open Exchange Rates | https://openexchangerates.org/api |
| 3 | Fallback BD | Valor en countries.country_er_usd |

Si todas fallan → usa el último valor guardado en BD con un warning en logs.

---

## TIPOS DE CONVERSIÓN Y MÁRGENES <a name="margenes"></a>

### Tres Tipos de Margen

| Tipo | Multiplicador | Dirección | Beneficiado |
|------|--------------|-----------|-------------|
| `none` | × 1.00 | Sin margen | Informativo |
| `pricing` | × 0.95 | TC 5% menos favorable | Latconecta (cobra más) |
| `conciliation` | × 1.05 | TC 5% más favorable | Latconecta (descuenta menos) |

### Ejemplo Completo: Producto en USD pagado en PEN

```
TC base: 1 USD = 3.75 PEN

Tipo pricing (cobro al usuario):
  TC_pricing = 3.75 × 0.95 = 3.5625 PEN/USD
  Usuario paga: 20 USD × 3.5625 = S/71.25

  (Con TC real el usuario pagaría S/75.00
   Latconecta recibe S/75 pero convierte al vendor solo S/71.25)
   Margen Latconecta = S/3.75
```

### Implementación del Margen

```python
def _apply_margin(self, base_rate: float, margin_type: str) -> float:
    margins = {
        'none':          1.00,
        'pricing':       0.95,   # -5% → menos PEN por dólar
        'conciliation':  1.05    # +5% → más PEN por dólar
    }
    multiplier = margins.get(margin_type, 1.00)
    return base_rate * multiplier
```

---

## SCHEDULER DE ACTUALIZACIÓN AUTOMÁTICA <a name="scheduler"></a>

**Archivo:** `services/scheduler_service.py`

El SchedulerService corre en background y actualiza los tipos de cambio periódicamente.

### Inicialización

```python
# events.py — startup del backend
if settings.ENABLE_VENDOR_LOGIN:
    scheduler_service.start()
```

### Tareas del Scheduler

| Tarea | Frecuencia | Descripción |
|-------|-----------|-------------|
| Actualizar tipos de cambio | Cada hora | Consulta APIs externas, actualiza countries.country_er_usd |
| Renovar tokens de vendor | Cada 50 min | Renueva vendor_access_token antes de que expire |

### Actualización de Tipo de Cambio

```python
async def update_exchange_rates(self, db: AsyncSession):
    """
    Para cada país activo con country_code:
    1. Determina moneda del país (PER→PEN, MEX→MXN)
    2. Obtiene TC actual de API externa
    3. Actualiza countries.country_er_usd
    4. Actualiza countries.country_er_date
    """
    countries = await db.execute(
        select(Country).where(Country.status == 'active')
    )
    for country in countries.scalars():
        currency = COUNTRY_CURRENCY_MAP.get(country.country_code)
        if currency and currency != 'USD':
            rate = await exchange_service.get_rate_from_api('USD', currency)
            country.country_er_usd = rate
            country.country_er_date = datetime.now()
    await db.commit()
```

### Renovación de Tokens de Vendor

```python
async def renew_vendor_tokens(self, db: AsyncSession):
    """
    Para cada vendor activo con ENABLE_VENDOR_LOGIN=True:
    1. Verifica si el token expira en menos de 10 minutos
    2. Si va a expirar: ejecuta login y renueva el token
    3. Actualiza vendors.vendor_access_token y vendor_token_expiry
    """
```

---

## ALMACENAMIENTO EN countries <a name="almacenamiento"></a>

El tipo de cambio se persiste en la tabla `countries`:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| country_er_usd | numeric(10,6) | TC: unidades de moneda local por 1 USD |
| country_er_date | timestamp | Cuándo se actualizó el TC |

### Lectura del TC en el Frontend

El frontend lee el tipo de cambio al cargar la vista de ShopView para mostrarlo al usuario y para calcular conversiones de Bill Payment:

```javascript
// GET /api/v1/countries → incluye country_er_usd
const country = await countriesService.getCountry(countryId)
const exchangeRate = country.country_er_usd   // 3.75 para Perú
```

### Frescura del Dato

El sistema considera un tipo de cambio como "fresco" si `country_er_date` tiene menos de 24 horas de antigüedad. Si es más antiguo, el scheduler lo actualizará en su próxima ejecución.

---

## MONEDAS SOPORTADAS <a name="monedas"></a>

| Código | Moneda | País | Símbolo | Decimales |
|--------|--------|------|---------|-----------|
| USD | Dólar Estadounidense | USA | $ | 2 |
| PEN | Sol Peruano | Perú | S/ | 2 |
| MXN | Peso Mexicano | México | $ | 2 |
| VES | Bolívar Soberano | Venezuela | Bs. | 2 |
| COP | Peso Colombiano | Colombia | $ | 0 |
| CLP | Peso Chileno | Chile | $ | 0 |
| ARS | Peso Argentino | Argentina | $ | 2 |
| BRL | Real Brasileño | Brasil | R$ | 2 |

### Mapa País → Moneda (en código)

```python
COUNTRY_CURRENCY_MAP = {
    'PER': 'PEN',
    'MEX': 'MXN',
    'VEN': 'VES',
    'COL': 'COP',
    'CHL': 'CLP',
    'ARG': 'ARS',
    'BRA': 'BRL',
    'USA': 'USD',
}
```

---

## USO EN EL SISTEMA <a name="uso"></a>

### En purchase_calculator_service.py

```python
# Para productos donde el vendor cobra en USD y el usuario paga en PEN
if vendor_currency == 'USD' and purchase_currency == 'PEN':
    rate = await exchange_service.get_exchange_rate('USD', 'PEN', 'pricing')
    purchase_total_amount = vendor_amount_usd * rate
    purchase_exch_rate = rate
```

### En Bill Payment (conversión de deuda)

```python
# El usuario elige cuánto pagar en PEN, el sistema convierte a USD para el vendor
user_selected_amount_pen = 3000.00
rate = await exchange_service.get_exchange_rate('PEN', 'USD', 'conciliation')
vendor_amount_usd = user_selected_amount_pen * rate
```

### En vendors — Balance Check

```python
# Verificar si el vendor tiene balance suficiente en la moneda correcta
if vp_currency == 'USD':
    available = vendor.vendor_usd_balance
    required = purchase_vendor_cost_usd
else:
    available = vendor.vendor_local_balance
    required = purchase_vendor_cost_local
```

---

**FIN DEL DOCUMENTO 11**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 12 — Backend: Sistema de Cálculo de Precios*


---

<a name="12-backend-calculo-precios"></a>

# DOCUMENTO 12
## BACKEND — SISTEMA DE CÁLCULO DE PRECIOS

**Versión:** 4.3
**Fecha:** Abril 2026
**Sistema:** Latconecta v2.0.0
**Archivo:** `services/purchase_calculator_service.py`

---

## CONTENIDO

1. [Visión General](#vision)
2. [PurchaseCalculatorService](#service)
3. [Fórmula Maestra de Pricing](#formula)
4. [Cálculo por Tipo de Producto](#tipos)
5. [Verificación de Balance](#balance)
6. [Integración con purchases.py](#integracion)
7. [Matriz Completa de Casos Multimoneda](#matriz)
8. [Reglas Críticas de Conversión](#reglas-criticas)

---

## VISIÓN GENERAL <a name="vision"></a>

El `PurchaseCalculatorService` es el servicio que determina todos los montos de una compra antes de procesarla. Centraliza la lógica de:

- Precio base del producto (fijo, rango o variable)
- Descuentos (porcentaje o monto fijo)
- Fees adicionales
- Conversión de moneda (si el vendor y el usuario usan monedas distintas)
- Costo real del vendor (`purchase_vendor_amount`)
- Determinación del `vendor_amount` cuando `vp_amount` es NULL (vendors tipo rango como MEGAPUNTO)

### Principio de Diseño

El calculador opera **antes** de hacer cualquier pago o provisión. Si detecta un problema (balance insuficiente, monto fuera de rango, etc.) lanza una excepción y el flujo se detiene sin cobrar al usuario.

---

## PURCHASECALCULATORSERVICE <a name="service"></a>

**Archivo:** `services/purchase_calculator_service.py`

```python
class PurchaseCalculatorService:
    @staticmethod
    async def calculate(
        product: Product,
        vendor_product: VendorProduct,
        vendor: Vendor,
        user_data: Dict[str, Any],
        exchange_rate_override: Optional[Decimal] = None,
        db: AsyncSession = None
    ) -> PurchaseCalculation
```

El método `calculate()` detecta el tipo de cálculo según `product.product_amount_type`:

| `product_amount_type` | Función interna | Caso de uso |
|-----------------------|----------------|-------------|
| `F` — Fijo | `_calculate_fixed_price()` | TopUps fijos, Paquetes, Smartphones |
| `R` — Rango | `_calculate_range_amount()` | Transfers, TopUps variables |
| `V` — Variable | `_calculate_bill_payment()` | Bill Payment con validación previa |

### Resultado PurchaseCalculation

```python
@dataclass
class PurchaseCalculation:
    # Montos del cliente (lo que paga)
    purchase_base_price: Decimal
    purchase_discount: Decimal
    purchase_fee: Decimal
    purchase_total_amount: Decimal
    purchase_currency: str

    # Montos del vendor (lo que se provisiona)
    purchase_vendor_amount: Decimal      # Monto enviado al vendor en su moneda
    purchase_vendor_currency: str

    # Tipo de cambio aplicado
    purchase_exch_rate: Decimal
    # Almacena el TC aplicado en la conversión.
    # Es Decimal('1.0') cuando no hay conversión de monedas.

    conversion_applied: bool
    margin_type: str   # 'none', 'pricing', 'inverse'
    info_message: Optional[str]
    amount_breakdown: Optional[Dict[str, Any]]
```

---

## FÓRMULA MAESTRA DE PRICING <a name="formula"></a>

### Para Productos de Precio Fijo (type = F)

```
purchase_base_price  = product.product_base_price

# El descuento SIEMPRE se calcula desde el porcentaje:
purchase_discount = ROUND(base_price × (product_discount_percentage / 100), 2)

# product_discount_amount es el valor pre-calculado en BD (idéntico al anterior)
# Nunca es un valor independiente — siempre derivado del porcentaje.

purchase_fee = product.product_fee

purchase_total_amount = ROUND(base_price - purchase_discount + purchase_fee, 2)
```

> **Regla crítica — discount_amount vs discount_percentage:**
> `product_discount_amount` es un campo calculado que se guarda en BD para
> referencia y auditoría. Su valor es siempre `base_price × discount_pct / 100`.
> El catalog_sync recalcula ambos campos automáticamente al actualizar precios:
> ```sql
> product_discount_amount = ROUND(new_price * product_discount_percentage / 100, 2)
> product_total_price     = ROUND(new_price - (new_price * product_discount_percentage / 100) + product_fee, 2)
> ```

### Determinación del vendor_amount en productos tipo F

Esta es la lógica crítica actualizada para soportar vendors con API de rango (como MEGAPUNTO):

```python
# En _calculate_fixed_price():

if vendor_product.vp_amount is not None:
    # Vendor tiene monto fijo por SKU (ej: LATCOM)
    vendor_amount = Decimal(str(vendor_product.vp_amount))
else:
    # Vendor tiene API de rango — vp_amount es NULL
    # El monto a enviar es el product_base_price del producto de Latconecta
    # (que ya está dentro del rango vp_minimum_amount / vp_maximum_amount)
    vendor_amount = base_price
```

**Por qué existe el caso `vp_amount = NULL`:**

Algunos vendors (ej: MEGAPUNTO/TISI) exponen una única API por operadora que acepta un rango de montos, en lugar de SKUs individuales por denominación. Esto permite que Latconecta defina múltiples productos comerciales (S/5, S/10, S/15, S/20, S/30) usando el mismo `vendor_product`, reduciendo la configuración de 15 registros a 3 (uno por operadora: Bitel, Entel, Claro).

```
MEGAPUNTO vendor_products (3 registros, vp_amount = NULL):
  MP_BITEL  skuid=66  vp_min=3.00  vp_max=100.00  vp_amount=NULL
  MP_ENTEL  skuid=67  vp_min=3.00  vp_max=100.00  vp_amount=NULL
  MP_CLARO  skuid=70  vp_min=3.00  vp_max=100.00  vp_amount=NULL

Latconecta products (15 registros, todos tipo F):
  Bitel S/5  → MP_BITEL → vendor recibe 5.00 PEN (= product_base_price)
  Bitel S/10 → MP_BITEL → vendor recibe 10.00 PEN
  Bitel S/15 → MP_BITEL → vendor recibe 15.00 PEN
  Bitel S/20 → MP_BITEL → vendor recibe 20.00 PEN
  Bitel S/30 → MP_BITEL → vendor recibe 30.00 PEN
  ... (mismo patrón para Entel y Claro)
```

### Para Productos Tipo Rango (type = R)

El usuario elige un monto entre `product_base_price` (mínimo) y `product_base_price_max` (máximo).

```
base_amount = user_selected_amount   ← elegido por el usuario
min_amount  = product.product_base_price
max_amount  = product.product_base_price_max

Validar: min_amount ≤ base_amount ≤ max_amount

discount_pct = product.product_discount_percentage
purchase_discount = base_amount × (discount_pct / 100)

purchase_fee = product.product_fee

purchase_total_amount = base_amount - purchase_discount + purchase_fee
vendor_amount = base_amount  (sin conversión si misma moneda)
```

### Para Productos Variables — Bill Payment (type = V)

El monto está determinado por la validación de cuenta (`val_cuenta`):

```
Si payment_type = 'full':
    base_amount = bill_total_debt    ← deuda completa de la cuenta
Elif payment_type = 'partial':
    base_amount = user_selected_amount  ← monto elegido por el usuario
    Validar: base_amount ≤ bill_total_debt

purchase_total_amount = base_amount
vendor_amount = bill_total_debt  ← MONTO EXACTO del validation (sin reconvertir)
```

### Conversión de Moneda

El sistema aplica **márgenes diferenciales de tipo de cambio** para generar margen comercial en las conversiones. El tipo de cambio base (X) se obtiene de APIs externas; sobre él se aplica:

| Tipo de margen | Multiplicador | Cuándo se usa |
|---------------|---------------|---------------|
| `pricing` (X - 5%) | × 0.95 | Mostrar rangos al usuario / conversión para informar |
| `conciliation` (X + 5%) | × 1.05 | Descuento del balance del vendor en USD |
| `none` (X) | × 1.00 | Conversiones informativas internas |

#### Caso A: vp_currency = Local / product_currency = Local (sin conversión)

```
vendor_amount = purchase_total_amount  (mismo valor)
purchase_vendor_currency = moneda local
purchase_exch_rate = Decimal('1.0')
Balance descontado: vendor_local_balance directo
```

Este es el caso de MEGAPUNTO/Perú: producto en PEN, vendor en PEN, sin conversión.

#### Caso B: vp_currency = USD / product_currency = USD (sin conversión)

```
vendor_amount = purchase_total_amount  (mismo valor)
purchase_vendor_currency = 'USD'
purchase_exch_rate = Decimal('1.0')
Balance descontado: vendor_usd_balance directo
```

#### Caso C: vp_currency = Local / product_currency = USD

El vendor cobra en moneda local pero Latconecta vende en USD.

```
API de provisión recibe: vendor_amount en moneda local
Balance descontado en USD:
    TC_pricing = TC_base × 0.95
    vendor_amount_local = user_amount_USD × TC_pricing
    TC_conciliation = TC_base × 1.05
    amount_USD_to_deduct = vendor_amount_local / TC_conciliation
    vendor.vendor_usd_balance -= amount_USD_to_deduct
purchase_exch_rate = TC_pricing
```

#### Caso especial — Rango con conversión (type = R, vp_currency = Local / product_currency = USD)

```
# 1. Convertir rango para mostrar al usuario:
TC_pricing = TC_base × 0.95
min_USD = product_base_price / TC_pricing
max_USD = product_base_price_max / TC_pricing

# 2. Usuario elige un monto en USD (ej: 50 USD)

# 3. Convertir monto elegido a moneda local para la API de provisión:
TC_pricing = TC_base × 0.95
amount_local = user_selected_amount_USD × TC_pricing

# 4. Calcular descuento del balance en USD usando TC_conciliation:
TC_conciliation = TC_base × 1.05
amount_to_deduct_USD = amount_local / TC_conciliation
vendor.vendor_usd_balance -= amount_to_deduct_USD

# Doble margen: Latconecta cobra más (pricing) y descuenta menos (conciliation)
```

---

## CÁLCULO POR TIPO DE PRODUCTO <a name="tipos"></a>

### TopUps MEGAPUNTO — Caso vp_amount NULL (Abril 2026)

```
Producto: Bitel Prepago S/15
product_base_price  = 15.00 PEN  (tipo F)
product_total_price = 15.00 PEN
product_discount    = 0.00
product_fee         = 0.00

vendor_product MP_BITEL:
  vp_amount      = NULL          ← vendor de tipo rango
  vp_amount_type = 'range'
  vp_minimum_amount = 3.00 PEN
  vp_maximum_amount = 100.00 PEN
  vp_currency    = PEN

Cálculo:
  purchase_base_price   = 15.00
  purchase_discount     = 0.00
  purchase_fee          = 0.00
  purchase_total_amount = 15.00 PEN
  vendor_amount         = 15.00 PEN  ← = product_base_price (por ser vp_amount NULL)
  purchase_exch_rate    = Decimal('1.0')

La API TISI/MEGAPUNTO recibe: { id_producto: 66, importe: 15.00, numero: "999999999", ... }
```

### TopUps LATCOM — Caso vp_amount fijo

```
Producto: Recarga Bitel S/20 (LATCOM)
product_base_price  = 20.00 PEN
product_discount    = 1.00 PEN
product_fee         = 0.00 PEN
product_total_price = 19.00 PEN

vendor_product BITEL_20_PEN:
  vp_amount   = 18.50 PEN   ← monto fijo
  vp_currency = PEN

Cálculo:
  purchase_base_price   = 20.00
  purchase_discount     = 1.00
  purchase_fee          = 0.00
  purchase_total_amount = 19.00 PEN
  vendor_amount         = 18.50 PEN  ← = vp_amount
  purchase_exch_rate    = Decimal('1.0')

Margen de Latconecta = 19.00 - 18.50 = 0.50 PEN
```

### Bill Payment con Conversión (type = V)

```
Deuda del servicio: 8550.00 PEN (retornado por val_cuenta)
Usuario elige pagar: 3000.00 PEN
TC (exchange_rate) = 3.75 PEN/USD

vendor_product:
  vp_currency = USD   ← El vendor cobra en USD
  vp_amount_type = variable

Cálculo:
  purchase_base_price   = 3000.00
  purchase_discount     = 0.00
  purchase_fee          = 0.00
  purchase_total_amount = 3000.00 PEN
  purchase_vendor_amount = 3000.00 / 3.75 = 800.00 USD
  purchase_vendor_currency = USD
  purchase_exch_rate     = 3.75
```

> **⚠️ REGLA CRÍTICA — Bill Payment: monto exacto del validation**
>
> Cuando `val_cuenta` retorna el monto de la deuda (campo `monto_base`) y el usuario
> selecciona pagar el total (`payment_type = 'full'`) o el indicador es `'T'`,
> **se debe usar el monto exacto retornado por la validación para la API de provisión**,
> sin reconvertir. La reconversión introduce errores de redondeo.
>
> ```
> # ❌ MAL — doble conversión pierde decimales:
> monto_validacion = 1234.56 MXN
> monto_USD_mostrar = 1234.56 / 19.00 = 64.98 USD  (mostrar al usuario)
> monto_API = 64.98 × 19.00 = 1234.62 MXN ← ¡Error de 0.06!
>
> # ✅ BIEN — usar monto original del validation:
> monto_validacion = 1234.56 MXN
> monto_USD_mostrar = 1234.56 / 19.00 = 64.98 USD  (solo para mostrar)
> monto_API = 1234.56 MXN ← Exacto del validation
> descuento_balance_USD = 1234.56 / 21.00 = 58.79 USD
> ```
>
> El `monto_base` del validation es el monto canónico. Se convierte a USD solo para
> **visualización** en pantalla. Para la provisión y el descuento del balance,
> siempre se usa el valor original en la moneda del vendor.

### Producto Rango (type = R)

```
Producto: Transferencia S/50 a S/500
product_base_price     = 50.00 PEN  (mínimo)
product_base_price_max = 500.00 PEN (máximo)
product_discount       = 5%

Usuario elige: 200.00 PEN

Cálculo:
  base_amount          = 200.00
  purchase_discount    = 200.00 × 0.05 = 10.00
  purchase_fee         = 0.00
  purchase_total_amount = 190.00 PEN
```

---

## VERIFICACIÓN DE BALANCE <a name="balance"></a>

Antes de procesar el pago, el sistema verifica que el vendor tiene saldo suficiente.

### Lógica de Verificación

```python
async def check_vendor_balance(
    self,
    vendor: Vendor,
    vendor_product: VendorProduct,
    required_amount: Decimal
) -> dict:

    if vendor_product.vp_currency == 'USD':
        available = vendor.vendor_usd_balance
        balance_currency = 'USD'
    else:
        available = vendor.vendor_local_balance
        balance_currency = vendor_product.vp_currency

    if available is None:
        return {"sufficient": False, "reason": "balance_unknown"}

    # Verificar frescura (menos de 24 horas)
    if not vendor.usd_balance_is_fresh:
        return {"sufficient": False, "reason": "balance_stale"}

    if available < required_amount:
        return {"sufficient": False, "reason": "insufficient_funds",
                "available": float(available), "required": float(required_amount)}

    return {"sufficient": True, "available": float(available)}
```

### Respuesta al Usuario

Si el balance es insuficiente, el usuario ve:

```json
{
  "detail": "Lo sentimos, este producto no está disponible en este momento."
}
```

El mensaje es genérico — no revela el motivo técnico (saldo bajo del vendor).

---

## INTEGRACIÓN CON purchases.py <a name="integracion"></a>

```python
# En purchases.py — dentro del endpoint POST /create

# 1. Cargar entidades necesarias
product = await db.get(Product, request.product_id)
vendor_product = await db.execute(
    select(VendorProduct).where(
        VendorProduct.vendor_code == product.product_vendor_code,
        VendorProduct.vp_code == product.product_vendpro_code,
        VendorProduct.vp_skuid == product.product_vendpro_skuid
    )
)
vendor = await db.get(Vendor, vendor_product.vendor_code)

# 2. Calcular precios
calculation = await purchase_calculator_service.calculate(
    product=product,
    vendor_product=vendor_product,
    vendor=vendor,
    user_data={
        'product_type': request.product_type,
        'user_selected_amount': request.user_selected_amount,  # None para tipo F
        'bill_total_debt': request.bill_total_debt,
        'bill_currency': request.bill_currency,
        'payment_type': request.payment_type,
    },
    exchange_rate_override=Decimal(str(request.exchange_rate)) if request.exchange_rate else None,
    db=db
)

# 3. Crear objeto Purchase con los montos calculados
purchase = Purchase(
    purchase_base_price      = calculation.purchase_base_price,
    purchase_discount        = calculation.purchase_discount,
    purchase_fee             = calculation.purchase_fee,
    purchase_total_amount    = calculation.purchase_total_amount,
    purchase_currency        = calculation.purchase_currency,
    purchase_vendor_amount   = calculation.purchase_vendor_amount,
    purchase_vendor_currency = calculation.purchase_vendor_currency,
    purchase_exch_rate       = calculation.purchase_exch_rate,
    ...
)
```

### Normalización de user_selected_amount en ShopView.jsx

Para evitar enviar strings vacíos al backend (que causan `decimal.ConversionSyntax`), el frontend normaliza el campo antes de enviar:

```javascript
// ShopView.jsx — handlePaymentAndProvision()

// Para productos tipo F: variableAmount y transferAmount son '' (string vacío)
// Enviarlos sin normalizar causa Decimal('') → ConversionSyntax en Python
const rawVariableAmount = purchaseData.variableAmount
  ? parseFloat(purchaseData.variableAmount) : null

const rawTransferAmount = purchaseData.transferAmount
  ? parseFloat(purchaseData.transferAmount) : null

const rawBillAmount = (purchaseData.validationData?.indicador === 'R' && purchaseData.billPaymentAmount)
  ? parseFloat(purchaseData.billPaymentAmount) : null

// user_selected_amount es null para productos tipo F (precio fijo)
const userSelectedAmount = rawVariableAmount ?? rawTransferAmount ?? rawBillAmount ?? null
```

### Actualización del Balance Post-Compra

El descuento del balance **solo se ejecuta si la provisión fue exitosa**. El pago exitoso es condición necesaria pero no suficiente para descontar el balance.

```python
# Determinar qué balance usar según la moneda del vendor_product
if vendor_product.vp_currency == 'USD':
    # Caso A: vendor cobra en USD → descontar vendor_usd_balance directamente
    balance_to_use = 'usd'
    amount_to_deduct = calculation.purchase_vendor_amount  # Ya en USD

elif calculation.purchase_vendor_currency == 'USD':
    # Caso B: vendor cobra en local pero producto se vende en USD
    # → descontar vendor_usd_balance con conversión TC_conciliation
    balance_to_use = 'usd'
    TC_conciliation = await exchange_service.get_exchange_rate(
        vendor_product.vp_currency, 'USD', margin_type='conciliation'
    )
    amount_to_deduct = calculation.purchase_vendor_amount / TC_conciliation

else:
    # Caso C: vendor cobra en local, producto se vende en local
    # → descontar vendor_local_balance directamente
    balance_to_use = 'local'
    amount_to_deduct = calculation.purchase_vendor_amount  # Ya en moneda local

# Ejecutar descuento solo si provisión fue exitosa
if purchase_status == 'Success':
    if balance_to_use == 'usd':
        vendor.vendor_usd_balance -= amount_to_deduct
        vendor.vendor_usd_date_balance = datetime.now()
    else:
        vendor.vendor_local_balance -= amount_to_deduct
        vendor.vendor_local_date_balance = datetime.now()

purchase.purchase_final_balance = (
    vendor.vendor_usd_balance if balance_to_use == 'usd'
    else vendor.vendor_local_balance
)
await db.commit()
```

---

## MATRIZ COMPLETA DE CASOS MULTIMONEDA <a name="matriz"></a>

Esta matriz consolida todos los casos posibles de combinación de monedas entre el vendor y el producto de Latconecta.

| vp_currency (vendor) | product_currency (Latconecta) | vp_amount | vendor_amount enviado | Balance Descontado | TC Aplicado |
|---------------------|------------------------------|-----------|----------------------|--------------------|-------------|
| Local | Local | Fijo (ej: LATCOM) | `vp_amount` | `vendor_local_balance` directo | Ninguno |
| Local | Local | NULL (ej: MEGAPUNTO) | `product_base_price` | `vendor_local_balance` directo | Ninguno |
| USD | USD | Fijo | `vp_amount` en USD | `vendor_usd_balance` directo | Ninguno |
| Local | USD | NULL / variable | `product_base_price × TC_pricing` en local | `vendor_usd_balance` con TC_conciliation (+5%) | TC_pricing + TC_conciliation |

**Principio invariante:** La API de provisión **siempre recibe el monto en la moneda del vendor** (`vp_currency`), independientemente de en qué moneda paga el usuario.

---

## REGLAS CRÍTICAS DE CONVERSIÓN <a name="reglas-criticas"></a>

Estas reglas deben respetarse en toda modificación al calculador de precios.

**Regla 1 — vendor_amount cuando vp_amount es NULL:**
Cuando `vendor_product.vp_amount is None` y `vp_amount_type = 'range'`, el monto a enviar al vendor es `product.product_base_price`. Nunca hacer `Decimal(str(None))` — genera `ConversionSyntax`. Siempre verificar `if vendor_product.vp_amount is not None` antes de usarlo.

**Regla 2 — user_selected_amount nunca como string vacío:**
El frontend debe normalizar `user_selected_amount` a `null` (no a `''`) cuando el producto es tipo `F`. El backend hace `Decimal(str(user_selected_amount))` y `Decimal('')` genera `ConversionSyntax`.

**Regla 3 — TC_conciliation para descuentos de balance:**
El tipo de cambio usado para calcular cuánto se descuenta del balance en USD es siempre el TC_conciliation (X+5%). Nunca el TC_pricing.

**Regla 4 — TC_pricing solo para visualización:**
El TC_pricing (X-5%) se usa únicamente para mostrar rangos y montos al usuario en su moneda. Nunca para calcular montos que se graben en la purchase o se envíen al vendor.

**Regla 5 — Monto exacto en Bill Payment:**
Cuando `val_cuenta` retorna un monto, ese monto en moneda local es el canónico. Para la provisión y el descuento del balance se usa siempre el valor original sin reconvertir. Convertir y luego reconvertir introduce pérdida de decimales.

**Regla 6 — El balance se descuenta solo tras provisión exitosa:**
El descuento del balance del vendor ocurre después de confirmar que la provisión fue exitosa (`purchase_status = 'Success'`). Si la provisión falla, el balance no se modifica incluso si el pago ya se cobró.

**Regla 7 — Compras con barcode (Pending):**
Las compras con código de barras tienen `purchase_payment_status = 'Pending'` hasta que el usuario pague físicamente. El balance del vendor no se descuenta hasta la confirmación del pago.

---

**FIN DEL DOCUMENTO 12**

*Versión: 4.3 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 13 — Frontend Admin: Arquitectura Core*


---

<a name="13-frontend-admin-arquitectura-core"></a>

# DOCUMENTO 13
## FRONTEND ADMIN — ARQUITECTURA CORE

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Puerto desarrollo:** 5173 | **Servicio producción:** Nginx /latconecta_admin

---

## CONTENIDO

1. [Visión General](#vision)
2. [Stack Tecnológico](#stack)
3. [Estructura de Directorios](#estructura)
4. [Routing y Navegación](#routing)
5. [Sistema de Autenticación (Frontend)](#auth)
6. [Comunicación con Backend](#comunicacion)
7. [Gestión de Estado Global](#estado)
8. [Variables de Entorno](#variables)
9. [Build y Despliegue](#build)

---

## VISIÓN GENERAL <a name="vision"></a>

El Frontend Admin es la interfaz de control centralizada de todo el sistema Latconecta. Permite a administradores y superadministradores gestionar el catálogo multi-tenant, vendors, API Mappings, usuarios y ver reportes de ventas, todo sin necesidad de acceso directo a la base de datos.

### Usuarios del Sistema

| Rol | Perfil | Acceso |
|-----|--------|--------|
| superadmin | Director de TI / Gerente de Operaciones | Total — incluyendo gestión de usuarios |
| admin | Analista de Operaciones / Soporte Senior | CRUD catálogos, vendors, mappings, reportes |

### 11 Tabs Funcionales

| Tab | Función |
|-----|---------|
| Latconecta | Información corporativa y fotos de marketing |
| Countries | Gestión de países y tipos de cambio |
| Services | Gestión de servicios disponibles por país |
| Companies | Gestión de operadoras por país-servicio |
| Products | Gestión de productos comerciales |
| Sales | Reporte de ventas y detalle de compras |
| Users | Gestión de usuarios del sistema |
| Vendors | Gestión de vendors y balances |
| VendorProducts | Gestión de productos técnicos del vendor |
| APIMappings | Configuración del motor de integración sin código |
| Profile | Perfil del administrador |

---

## STACK TECNOLÓGICO <a name="stack"></a>

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18.3.1 | Framework de UI |
| Vite | 5.x | Build tool + dev server |
| Tailwind CSS | 3.x | Framework de estilos |
| React Router | v6 | Routing SPA |
| Axios | 1.x | HTTP client con interceptores |
| Lucide React | 0.383.0 | Iconografía |

### Variables de Entorno del Admin

```bash
# latconecta_admin/.env (desarrollo)
VITE_API_BASE_URL=http://localhost:8100/api/v1

# latconecta_admin/.env.production (producción en servidor)
VITE_API_BASE_URL=http://77.42.92.151:8100/api/v1
```

**Nota:** En el servidor, el backend corre en puerto 8100 sin SSL. Nginx no hace proxy del API — el frontend llama directamente al backend. Esto funciona porque el frontend se sirve en HTTPS y llama al backend en HTTP local (mismo servidor).

---

## ESTRUCTURA DE DIRECTORIOS <a name="estructura"></a>

```
latconecta_admin/src/
│
├── App.jsx               # Rutas principales: / (welcome) y /admin/*
├── main.jsx              # Entry point (monta React)
├── index.css             # Tailwind + estilos globales
│
├── pages/
│   ├── LatconectaAdmin.jsx   # Componente principal admin (layout + tabs)
│   └── WelcomeView.jsx       # Landing page pública del admin
│
├── components/
│   ├── admin/                # 11 tabs administrativos
│   │   ├── LatconectaTab.jsx
│   │   ├── CountriesTab.jsx
│   │   ├── ServicesTab.jsx
│   │   ├── CompaniesTab.jsx
│   │   ├── ProductsTab.jsx
│   │   ├── SalesTab.jsx
│   │   ├── UsersTab.jsx
│   │   ├── VendorsTab.jsx
│   │   ├── VendorProductsTab.jsx
│   │   ├── APIMappingsTab.jsx
│   │   └── ProfileView.jsx
│   │
│   ├── auth/
│   │   ├── LoginForm.jsx        # Formulario de login
│   │   └── ProtectedRoute.jsx   # Wrapper para rutas protegidas
│   │
│   └── common/
│       ├── Header.jsx           # Barra superior con usuario y logout
│       ├── Sidebar.jsx          # Menú lateral con 11 tabs
│       └── Notification.jsx     # Sistema de toasts (éxito / error / info)
│
├── services/                    # Capa de comunicación con backend
│   ├── authService.js
│   ├── countriesService.js
│   ├── servicesService.js
│   ├── companiesService.js
│   ├── vendorsService.js
│   ├── vendorProductsService.js
│   ├── productsService.js
│   ├── vendorApiMappingsService.js
│   ├── latconectaService.js
│   ├── usersService.js
│   ├── uploadService.js
│   ├── salesService.js
│   └── exchangeRateService.js
│
├── hooks/
│   ├── useApi.js           # Wrapper: loading + error + data para API calls
│   ├── useAuth.js          # Acceso al contexto de autenticación
│   ├── useNotification.js  # Mostrar notificaciones toast
│   ├── useDebounce.js      # Delay para búsquedas (evita requests por keystroke)
│   └── useLocalStorage.js  # Persistencia de datos en localStorage
│
├── context/
│   ├── AppContext.jsx       # Estado global: notificaciones, loading
│   └── AuthContext.jsx      # Estado global: user, token, isAuthenticated
│
├── config/
│   └── api.js              # Instancia Axios con interceptores
│
└── utils/
    ├── constants.js         # Constantes: roles, estados, etc.
    ├── formatters.js        # Formateadores: fecha, moneda, etc.
    ├── validators.js        # Validaciones de formularios
    ├── imageHelper.js       # URLs de imágenes con fallback
    └── helpers.js           # Helpers generales
```

---

## ROUTING Y NAVEGACIÓN <a name="routing"></a>

### App.jsx — Rutas Principales

```jsx
function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"       element={<WelcomeView />} />
            <Route path="/login"  element={<LoginForm />} />
            <Route path="/admin"  element={
              <ProtectedRoute>
                <LatconectaAdmin />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  )
}
```

### ProtectedRoute.jsx

```jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!['admin', 'superadmin'].includes(user?.user_role)) {
    return <Navigate to="/" replace />
  }

  return children
}
```

### LatconectaAdmin.jsx — Selección de Tab

El componente principal usa estado local para controlar qué tab está activo:

```jsx
const [activeTab, setActiveTab] = useState('latconecta')

const renderTab = () => {
  switch (activeTab) {
    case 'latconecta':    return <LatconectaTab />
    case 'countries':     return <CountriesTab />
    case 'services':      return <ServicesTab />
    case 'companies':     return <CompaniesTab />
    case 'products':      return <ProductsTab />
    case 'sales':         return <SalesTab />
    case 'users':         return <UsersTab />
    case 'vendors':       return <VendorsTab />
    case 'vendor-products': return <VendorProductsTab />
    case 'api-mappings':  return <APIMappingsTab />
    case 'profile':       return <ProfileView />
    default: return <LatconectaTab />
  }
}
```

La navegación es por tab (no por URL) — el estado del tab activo vive en memoria, no en la URL. Esto simplifica el routing pero significa que al refrescar siempre vuelve al tab default.

---

## SISTEMA DE AUTENTICACIÓN (FRONTEND) <a name="auth"></a>

### AuthContext.jsx

```jsx
const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Al montar: verificar si hay token en localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    const savedUser = localStorage.getItem('admin_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = (tokenData, userData) => {
    localStorage.setItem('admin_token', tokenData)
    localStorage.setItem('admin_user', JSON.stringify(userData))
    setToken(tokenData)
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Flujo de Login

```
1. Admin va a /login → LoginForm.jsx
2. Ingresa email + password
3. authService.login(email, password)
   POST /api/v1/auth/login
4. Backend retorna { access_token, user }
5. authContext.login(token, user)
   → Guarda en localStorage
   → Actualiza estado global
6. Navigate to /admin
7. ProtectedRoute verifica isAuthenticated → OK
8. LatconectaAdmin se renderiza
```

### Flujo de Recuperación de Contraseña

`LoginForm.jsx` implementa un flujo de 4 pasos internos sin cambiar de ruta:

```
step='login'   → Vista normal de login (estado inicial)
step='forgot'  → Paso 1: ingresa email → click "Enviar código"
                 POST /api/v1/auth/forgot-password
step='verify'  → Paso 2: ingresa código 6 dígitos + nueva contraseña
                 POST /api/v1/auth/reset-password
step='success' → Confirmación + botón "Ir a Iniciar Sesión"
```

El link "¿Olvidaste tu contraseña?" en la vista de login activa la transición a `step='forgot'`. El modal mantiene el mismo contenedor visual con el header amarillo/teal del admin en todos los pasos.

---

## COMUNICACIÓN CON BACKEND <a name="comunicacion"></a>

### config/api.js — Instancia Axios

```javascript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8100/api/v1'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor de request: agrega token JWT
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de response: maneja 401
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### authService.js — Admin

Métodos disponibles:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `login(email, password)` | POST /auth/login | Login con credenciales |
| `logout()` | — | Limpia localStorage |
| `getCurrentUser()` | — | Lee usuario de localStorage |
| `getToken()` | — | Lee token de localStorage |
| `isAuthenticated()` | — | Verifica si hay token |
| `changePassword(current, new, confirm)` | POST /auth/change-password | Cambio autenticado |
| `forgotPassword(email)` | POST /auth/forgot-password | Solicitar código de recuperación |
| `resetPassword(email, code, newPwd)` | POST /auth/reset-password | Restablecer con código |

Las claves de localStorage del admin son `latconecta_token` y `latconecta_user` (distintas a las del módulo users). El patrón es consistente:

```javascript
// services/countriesService.js
import apiClient from '../config/api'

const countriesService = {
  getAll: (params = {}) =>
    apiClient.get('/countries', { params }),

  getById: (id) =>
    apiClient.get(`/countries/${id}`),

  create: (data) =>
    apiClient.post('/countries', data),

  update: (id, data) =>
    apiClient.put(`/countries/${id}`, data),

  delete: (id) =>
    apiClient.delete(`/countries/${id}`),
}

export default countriesService
```

### Hook useApi

```javascript
// hooks/useApi.js
function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (apiCall, options = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall()
      if (options.onSuccess) options.onSuccess(response.data)
      return response.data
    } catch (err) {
      const message = err.response?.data?.detail || 'Error de conexión'
      setError(message)
      if (options.onError) options.onError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, execute }
}
```

### Uso en un Tab

```jsx
// Dentro de CountriesTab.jsx
const { loading, execute } = useApi()
const { showSuccess, showError } = useNotification()

const handleCreate = async (formData) => {
  await execute(
    () => countriesService.create(formData),
    {
      onSuccess: () => {
        showSuccess('País creado exitosamente')
        loadCountries()  // Recarga la lista
        setShowModal(false)
      },
      onError: (msg) => showError(msg)
    }
  )
}
```

---

## GESTIÓN DE ESTADO GLOBAL <a name="estado"></a>

### AppContext.jsx

```jsx
// Estado global de la aplicación
const AppContext = createContext()

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [globalLoading, setGlobalLoading] = useState(false)

  const showNotification = (type, message, duration = 3000) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, duration)
  }

  return (
    <AppContext.Provider value={{
      notifications, globalLoading, setGlobalLoading,
      showSuccess: (msg) => showNotification('success', msg),
      showError:   (msg) => showNotification('error', msg),
      showInfo:    (msg) => showNotification('info', msg),
    }}>
      {children}
      <NotificationContainer notifications={notifications} />
    </AppContext.Provider>
  )
}
```

### Datos que NO van al contexto global

La mayoría de los datos (listas de países, productos, vendors) son **locales a cada tab**. Cada tab los carga al montarse y los descarta al desmontarse. No se usa Redux ni Zustand — la gestión de estado es intencionalmente simple.

---

## VARIABLES DE ENTORNO <a name="variables"></a>

```bash
# latconecta_admin/.env
VITE_API_BASE_URL=http://localhost:8100/api/v1

# Para servidor (CalmetServer)
VITE_API_BASE_URL=http://77.42.92.151:8100/api/v1
```

Acceso en código:
```javascript
import.meta.env.VITE_API_BASE_URL
```

Solo variables con prefijo `VITE_` son accesibles en el código del frontend.

---

## BUILD Y DESPLIEGUE <a name="build"></a>

### Build de Producción

```bash
cd /var/www/latconecta/latconecta_admin
npm run build
# Genera: dist/
```

El directorio `dist/` contiene los archivos estáticos que Nginx sirve.

### Configuración Nginx

```nginx
location /latconecta_admin {
    alias /var/www/latconecta/latconecta_admin/dist;
    try_files $uri $uri/ /latconecta_admin/index.html;
    index index.html;
}
```

El `try_files` con `index.html` como fallback es crítico para que React Router funcione correctamente — sin esto, la recarga de página en cualquier ruta distinta a `/latconecta_admin` devuelve 404.

### Proceso de Actualización en Servidor

```bash
# 1. Si hay cambios en el código
git pull  # o subir archivos manualmente

# 2. Reconstruir
cd /var/www/latconecta/latconecta_admin
npm run build

# 3. No es necesario reiniciar servicios
# Nginx sirve los archivos estáticos directamente
```

---

**FIN DEL DOCUMENTO 13**

*Versión: 4.1 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Cambios v4.1: LoginForm.jsx ampliado con flujo de recuperación de contraseña (4 pasos: login → forgot → verify → success). authService.js admin con forgotPassword() y resetPassword().*
*Continúa en: DOC 14 — Frontend Admin: Componentes y Tabs*


---

<a name="14-frontend-admin-componentes-tabs"></a>

# DOCUMENTO 14
## FRONTEND ADMIN — COMPONENTES Y TABS

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Total:** 11 tabs + 3 comunes + auth = ~45 archivos JSX/JS · ~8,000 líneas

---

## CONTENIDO

1. [Componentes Comunes](#comunes)
2. [Patrón CRUD Estándar](#patron)
3. [Tab: Latconecta](#tab-latconecta)
4. [Tab: Countries](#tab-countries)
5. [Tab: Services](#tab-services)
6. [Tab: Companies](#tab-companies)
7. [Tab: Products](#tab-products)
8. [Tab: Sales](#tab-sales)
9. [Tab: Users](#tab-users)
10. [Tab: Vendors](#tab-vendors)
11. [Tab: VendorProducts](#tab-vendor-products)
12. [Tab: APIMappings](#tab-api-mappings)
13. [Tab: Profile](#tab-profile)
14. [Manejo de Imágenes](#imagenes)

---

## COMPONENTES COMUNES <a name="comunes"></a>

### Header.jsx

Barra superior persistente en todas las vistas del admin.

**Elementos:**
- Logo de Latconecta (cargado desde la tabla `latconecta`)
- Nombre e ícono del tab activo
- Nombre del usuario logueado + rol (badge visual)
- Botón de logout (limpia localStorage + context + redirect)
- Toggle para colapsar/expandir el Sidebar en móvil

### Sidebar.jsx

Menú lateral con los 11 tabs. Cada tab tiene:
- Ícono (Lucide React)
- Label del tab
- Indicador visual del tab activo (borde izquierdo coloreado)
- Responsive: colapsa a íconos en pantallas pequeñas

**Orden de tabs en el sidebar:**
1. Latconecta, 2. Countries, 3. Services, 4. Companies, 5. Products, 6. Sales, 7. Users, 8. Vendors, 9. VendorProducts, 10. APIMappings, 11. Profile

### Notification.jsx

Sistema de toasts que aparece en esquina superior derecha.

- Tipos: `success` (verde), `error` (rojo), `warning` (amarillo), `info` (azul)
- Auto-dismiss: 3 segundos por defecto
- Apilable: múltiples notificaciones simultáneas
- Animación de entrada/salida

---

## PATRÓN CRUD ESTÁNDAR <a name="patron"></a>

Todos los tabs siguen exactamente el mismo patrón. Conocer uno es conocer todos.

### Estado Local de cada Tab

```jsx
const [items, setItems] = useState([])          // Lista de registros
const [selectedItem, setSelectedItem] = useState(null) // Item en edición
const [showModal, setShowModal] = useState(false)      // Modal abierto/cerrado
const [formData, setFormData] = useState({})           // Datos del formulario
const [loading, setLoading] = useState(false)          // Estado de carga
const [searchTerm, setSearchTerm] = useState('')       // Búsqueda local
```

### Ciclo de Vida del Tab

```jsx
// Al montar el tab:
useEffect(() => {
  loadItems()
}, [])

const loadItems = async () => {
  setLoading(true)
  try {
    const data = await itemsService.getAll()
    setItems(data)
  } catch (err) {
    showError('Error al cargar datos')
  } finally {
    setLoading(false)
  }
}
```

### Estructura Visual Estándar

```
┌─────────────────────────────────────────────────────────────┐
│ [Título del Tab]              [Botón "+ Nuevo"]              │
├─────────────────────────────────────────────────────────────┤
│ [Búsqueda]                    [Filtros opcionales]           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TABLA/CARDS                                                 │
│  ┌─────┬────────┬──────────┬──────┬───────────┐            │
│  │ ID  │ Campo1 │  Campo2  │ Est. │  Acciones │            │
│  ├─────┼────────┼──────────┼──────┼───────────┤            │
│  │ ... │  ...   │   ...    │ ...  │ ✏️ 🗑️      │            │
│  └─────┴────────┴──────────┴──────┴───────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘

[MODAL al click en Nueva/Editar]
┌─────────────────────────────────────────────────────┐
│ Título: "Crear/Editar [Entidad]"              [✕]   │
│                                                     │
│ Campo1: [input]                                     │
│ Campo2: [input]                                     │
│ ...                                                 │
│                                                     │
│              [Cancelar]  [Guardar]                  │
└─────────────────────────────────────────────────────┘
```

---

## TAB: LATCONECTA <a name="tab-latconecta"></a>

**Propósito:** Gestionar la información corporativa de Latconecta (tabla `latconecta`, registro único id=1).

**Campos gestionados:**
- Nombre de la empresa, descripción, eslogan (2 líneas)
- Logo corporativo (upload)
- Foto principal + 4 fotos de marketing para el carrusel del Welcome
- Redes sociales: Facebook, Instagram, Twitter/X, LinkedIn, YouTube
- Información de contacto: teléfono, email soporte, email comercial, web, dirección

**Particularidad:** No tiene "crear" ni "eliminar" — solo "actualizar". El registro siempre existe.

---

## TAB: COUNTRIES <a name="tab-countries"></a>

**Propósito:** Gestionar los países/mercados del sistema.

**Campos del formulario:**
- Código del país (alpha-3: PER, MEX, VEN) — solo en creación
- Nombre del país
- Bandera (upload de imagen)
- Foto representativa (upload)
- Tipo de cambio USD (`country_er_usd`)
- Estado (active / inactive)

**Funciones especiales:**
- Muestra el tipo de cambio actual y su fecha de actualización
- Botón para forzar actualización del tipo de cambio (llama al scheduler)
- Alerta si el tipo de cambio tiene más de 24 horas de antigüedad

---

## TAB: SERVICES <a name="tab-services"></a>

**Propósito:** Gestionar los servicios disponibles por país.

**Campos del formulario:**
- Nombre del servicio (exactamente uno de: TopUps, Paquetes, Bill Payment, Transfers, Smartphones)
- Ícono SVG (upload)
- Foto marketing (upload)
- Descripción
- Estado

**Validación crítica:** El nombre del servicio debe ser exactamente uno de los 5 valores permitidos. El backend usa este campo para lógica de negocio (validación de teléfono vs cuenta, tipo de provisión).

---

## TAB: COMPANIES <a name="tab-companies"></a>

**Propósito:** Gestionar las operadoras por combinación país-servicio.

**Campos del formulario:**
- País (selector desde countries activos)
- Servicio (selector desde services)
- Nombre de la compañía
- Logo (upload)
- Foto principal + 4 fotos marketing (upload)
- 2 líneas de eslogan
- `company_barcode_available`: Si / No (controla si el pago con barcode está disponible)
- Emails de soporte (cliente y comercial)
- Estado

**Visualización en tabla:** Muestra el país y servicio asociados, logo, nombre y estado.

---

## TAB: PRODUCTS <a name="tab-products"></a>

**Propósito:** Gestionar los productos comerciales visibles al usuario final.

**Campos del formulario:**
- País → Servicio → Compañía (selectores en cascada)
- Código del producto (único)
- Nombre y descripción
- Foto (upload)
- Moneda de venta (PEN, MXN, etc.)
- **Tipo de monto:** F (Fijo), R (Rango), V (Variable)
  - Si F: precio base
  - Si R: precio mínimo + precio máximo
  - Si V: precio referencial
- Descuento porcentaje y/o monto fijo
- Fee adicional
- Precio total (calculado automáticamente)
- Vendor Code (selector desde vendors)
- Vendor Product Code + SKU ID (vinculación al vendor_product)
- Estado

**Funcionalidad especial:**
- El precio total se calcula automáticamente al cambiar base, descuento y fee
- Para tipo R, también se calculan los precios máximos

---

## TAB: SALES <a name="tab-sales"></a>

**Propósito:** Reporte de ventas — vista completa de la tabla `purchases` con Column Picker y exportación CSV.

**Versión actual:** 3.0 (Abril 2026)

### Column Picker

Botón "Columnas" en el header del tab. Abre un dropdown con checkbox por cada columna disponible. Persiste la selección en `localStorage` bajo la clave `latconecta_sales_columns`.

**Columnas fijas** (no se pueden ocultar):

| Columna | Campo |
|---------|-------|
| Referencia | `purchase_reference` |
| Fecha | `purchase_date` |
| Ver | Botón detalle |
| JSON | Botón request/response |

**Columnas opcionales** (17 disponibles — activables/desactivables):

| Columna | Campo |
|---------|-------|
| Teléfono | `purchase_phone_number` |
| País | `purchase_country` |
| Vendor | `purchase_vendor_code` |
| Operador | `purchase_vendpro_operator` |
| Servicio | `purchase_service_name` |
| Producto | `purchase_product_name` |
| Monto | `purchase_total_amount` |
| Monto USD | `purchase_amount_usd` |
| Monto Vendor | `purchase_vendor_amount` |
| Moneda | `purchase_currency` |
| Método Pago | `purchase_payment_method` |
| Est. Pago | `purchase_payment_status` |
| Est. Entrega | `purchase_delivery_status` |
| Trans. ID Vendor | `purchase_transaction_id` |
| User ID | `purchase_user_id` |
| IP | `purchase_ip_petition` |
| Bal. Inicial | `purchase_initial_balance` |
| Bal. Final | `purchase_final_balance` |
| IM | `requires_manual_intervention` |

Botón "Restablecer" vuelve a la vista por defecto (columnas originales de v2.0).

### Descarga CSV

Botón verde "CSV (N)" en el header. Exporta los registros filtrados actualmente visibles con las columnas activas en ese momento. El número entre paréntesis indica cuántos registros se exportarán.

- Formato: CSV con separador coma
- Encoding: UTF-8 con BOM (compatible con Excel sin configuración adicional)
- Nombre del archivo: `latconecta_ventas_YYYY-MM-DD.csv`
- Las columnas de acción (Ver, JSON) se excluyen automáticamente del export

### Filtros disponibles

- Rango de referencia (Ref Desde / Ref Hasta)
- Rango de fechas (Fecha Desde / Fecha Hasta)
- Teléfono (búsqueda parcial)
- Estado de pago: Todos / Pagado / Pendiente / Reversado / Fallido
- Estado de entrega: Todos / Exitoso / Pendiente / Fallido
- Requiere intervención: Todos / Sí / No

### Vista detalle (click en ícono Ver)

Modal con todos los campos de la purchase, incluyendo:
- JSON del request enviado al vendor (`vendor_request`)
- JSON del response recibido del vendor (`vendor_response`)
- IDs de transacción del vendor y del operador
- Balance inicial y final del vendor
- Información de reversión si aplica

### Vista JSON (click en ícono JSON)

Popup que muestra en paralelo el request enviado al vendor y el response recibido, en formato JSON coloreado (verde para request, azul para response).

**Compras con intervención manual:** Se muestran con un indicador visual ⚠️ destacado. El admin puede ver el detalle para gestionar la resolución.

---

## TAB: USERS <a name="tab-users"></a>

**Propósito:** Gestionar usuarios del sistema (solo superadmin puede crear/eliminar admins).

**Campos del formulario:**
- Nombre, email, password (en creación)
- Rol: user / admin / superadmin
- Teléfono (código de país + número)
- Foto de perfil (upload)
- Estado (active / inactive)

**Restricciones:**
- Solo superadmin puede cambiar el rol a `superadmin`
- El admin logueado no puede desactivarse a sí mismo

---

## TAB: VENDORS <a name="tab-vendors"></a>

**Propósito:** Gestionar los proveedores técnicos de integración.

**Campos del formulario:**
- Vendor Code (único, no editable después de crear)
- Nombre y nombre de display
- URLs: UAT y Producción
- Credenciales: Username, Password, API Key, User UID
- Timeout HTTP (segundos)
- `is_production`: toggle UAT vs Producción
- Estado

**Funcionalidades especiales:**

**Panel de Balance Dual:**
```
Balance USD: $4,994.12     Actualizado: hace 2 horas  [Sincronizar]
Balance PEN: S/18,727.95   Actualizado: hace 2 horas  [Sincronizar]
```
- Botón "Sincronizar" llama a `POST /vendors/{code}/sync-balance`
- Indicador de frescura: "fresh" (< 24h) o "stale" (> 24h)

**Toggle UAT/Producción:**
- Switch visual que cambia `is_production`
- Confirma con dialog antes de activar producción

**Test de Conexión:**
- Botón "Probar Conexión" llama a `POST /vendors/{code}/test-connection`
- Muestra resultado: ✅ Conectado / ❌ Error con detalle

**Token Actual:**
- Muestra si hay token activo y cuándo expira
- Botón para forzar renovación manual

---

## TAB: VENDORPRODUCTS <a name="tab-vendor-products"></a>

**Propósito:** Gestionar los productos técnicos de cada vendor.

**Campos del formulario:**
- Vendor (selector)
- **API Group Code** — campo crítico que vincula con vendor_api_mappings
- VP Code y VP SKU ID
- Nombre y descripción
- Operador (bitel, claro, movistar, entel, telcel, etc.)
- País (alpha-3: PER, MEX, VEN)
- Moneda (PEN, USD, MXN, VES)
- Monto, tipo de monto (fixed/range/variable), montos mínimo/máximo
- Tipo de producto (1 carácter)
- Fee en USD
- Estado

**Filtros:**
- Por vendor
- Por país y operador
- Por estado

---

## TAB: APIMAPPINGS <a name="tab-api-mappings"></a>

**Propósito:** Configurar el motor de integración sin código. El tab más técnico y más poderoso.

**Campos del formulario:**

*Identificación:*
- Mapping Code (5 chars, único — ej: LC01T)
- Vendor (selector)
- API Group Code
- Operation Type (provision / validation / query / reversal)

*HTTP:*
- Método HTTP (POST / GET / PUT / PATCH)
- Endpoint URL (ruta relativa — ej: /api/v1/topup)
- Timeout en segundos

*Autenticación:*
- Auth Type (apikey / bearer / basic / none)
- Auth Config (editor JSON)

*Mapeos:*
- Request Mapping (editor JSON con helper de campos disponibles)
- Value Transformations (editor JSON)
- Response Mapping (editor JSON)
- Success Indicators (editor JSON)

*Control:*
- Is Active (toggle)

**Funcionalidades especiales:**

**Helper de Campos Disponibles:**
Botón "Ver campos" muestra la lista de `source_fields` disponibles para usar en `request_mapping`. Carga desde `GET /vendor-api-mappings/available-fields`.

**Editor JSON con Validación:**
Los campos JSONB tienen editor con resaltado de sintaxis y validación en tiempo real. Error visual si el JSON es inválido antes de guardar.

**Botón de Prueba:**
"Probar Mapping" abre un modal con campos para ingresar datos de prueba y ejecuta `POST /vendor-api-mappings/{id}/test`. Muestra el request generado, la respuesta del vendor y si fue detectada como éxito.

**Agrupación por API Group:**
Los mappings se agrupan visualmente por `api_group_code` y se muestran las operaciones disponibles en cada grupo (provision, validation, query, reversal).

---

## TAB: PROFILE <a name="tab-profile"></a>

**Propósito:** Perfil del administrador logueado.

**Campos editables:**
- Nombre y apellido
- Foto de perfil (upload)
- Teléfono

**Cambio de contraseña:**
- Contraseña actual (validación antes de cambiar)
- Nueva contraseña + confirmación

**Información de cuenta (solo lectura):**
- Email (no editable)
- Rol actual
- Último login

---

## MANEJO DE IMÁGENES <a name="imagenes"></a>

### uploadService.js

```javascript
const uploadService = {
  upload: async (file, category) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post(`/upload/${category}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  delete: async (category, filename) =>
    apiClient.delete(`/upload/${category}/${filename}`)
}
```

### imageHelper.js

```javascript
// Construye la URL completa de una imagen
export const getImageUrl = (path, fallback = '/placeholder.png') => {
  if (!path) return fallback
  if (path.startsWith('http')) return path
  // En desarrollo: localhost:8100/uploads/...
  // En producción: 77.42.92.151:8100/uploads/...
  return `${API_BASE_URL_WITHOUT_API}${path}`
}
```

### Tamaños Recomendados de Imágenes

| Tipo | Dimensiones | Formato | Uso |
|------|------------|---------|-----|
| Bandera | 200×200 px | PNG transparente | countries.country_flag_photo |
| Logo compañía | 500×500 px | PNG transparente | companies.company_logo |
| Foto marketing | 1920×800 px | JPG/PNG | companies.company_photo_mkt* |
| Foto producto | 800×800 px | PNG transparente | products.product_photo |
| Logo vendor | 400×200 px | PNG transparente | — |
| Logo Latconecta | 400×200 px | PNG transparente | latconecta.latconecta_logo |

---


---

## MANEJO DE IMÁGENES EN TABS

### Criterio general (aplicado en Junio 2026)

Todas las imágenes de contenido (logos, fotos de productos, servicios, banderas, compañías) usan `object-contain` para mostrarse completas sin recorte. Solo los avatares circulares de usuarios mantienen `object-cover`.

| Componente | Imagen | Clase |
|------------|--------|-------|
| CompaniesTab | Foto marketing compañía | `object-contain bg-gray-50` |
| CountriesTab | Bandera en tabla | `object-contain` |
| CountriesTab | Foto país en formulario | `object-contain bg-gray-50` |
| LatconectaTab | Fotos marketing (×5) | `object-contain bg-gray-50` |
| ProductsTab | Foto producto en tabla | `object-contain` |
| ProductsTab | Foto producto en formulario | `object-contain bg-gray-50` |
| ServicesTab | Foto servicio en tabla | `object-contain` |
| ServicesTab | Foto servicio en formulario | `object-contain bg-gray-50` |
| UsersTab | Avatar usuario | `object-cover` (circular) ✅ |
| ProfileView | Avatar perfil | `object-cover` (circular) ✅ |
| LatconectaAdmin header | Avatar usuario | `object-cover` (circular) ✅ |
| WelcomeView carrusel | Foto marketing | `object-cover` (banner decorativo) ✅ |

**Regla:** `bg-gray-50` se agrega cuando la imagen está en un contenedor con altura fija y puede no llenar todo el espacio — el fondo gris suave cubre el espacio vacío sin verse mal.


---

**FIN DEL DOCUMENTO 14**

*Versión: 4.1 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Cambios v4.1: SalesTab v3.0 — Column Picker con 21 columnas (4 fijas + 17 opcionales) con persistencia localStorage. Descarga CSV de datos filtrados con BOM UTF-8 para compatibilidad Excel.*
*Continúa en: DOC 15 — Frontend Users: Arquitectura Core*


---

<a name="15-frontend-users-arquitectura-core"></a>

# DOCUMENTO 15
## FRONTEND USERS — ARQUITECTURA CORE

**Versión:** 6.0
**Fecha:** Junio 2026
**Sistema:** Latconecta v2.0.0
**Puerto desarrollo:** 5174 | **Servicio producción:** Nginx subdominio peruse.latconecta.com

---

## CONTENIDO

1. [Visión General](#vision)
2. [Stack Tecnológico](#stack)
3. [Estructura de Directorios](#estructura)
4. [Routing y Vistas](#routing)
5. [Navegación Multi-Tenant (SelectView)](#navegacion)
6. [Autenticación Opcional](#auth)
7. [Comunicación con Backend](#comunicacion)
8. [Variables de Entorno](#variables)
9. [Build y Despliegue](#build)

---

## VISIÓN GENERAL <a name="vision"></a>

El Frontend Users es la interfaz pública de Latconecta — la app que usan los usuarios finales para comprar recargas, paquetes, pagar servicios y smartphones. Está diseñada con mobile-first porque más del 60% del tráfico llega desde dispositivos móviles.

### 4 Vistas + 1 Popup Crítico

```
WelcomeView (Landing)
    ↓ click "Comenzar"
SelectView (Wizard multi-tenant: País → Servicio → Compañía)
    ↓ selección completa
ShopView (Catálogo de productos de la compañía)
    ↓ click "Comprar"
PurchasePopup ★ (Flujo de compra: 7 pasos)
    ↓ tras compra exitosa
ProfileView (Historial — requiere login)
```

### Compras Anónimas

Un principio de diseño clave: el usuario **no necesita registrarse** para comprar. La autenticación es completamente opcional. Esto maximiza la conversión eliminando fricción.

---

## STACK TECNOLÓGICO <a name="stack"></a>

| Tecnología | Versión | Propósito |
|-----------|---------|-----------|
| React | 18.3.1 | Framework de UI |
| Vite | 7.x | Build tool (mobile-optimized) |
| Tailwind CSS | 3.x | Mobile-first estilos |
| React Router | v6 | SPA routing con basename |
| Axios | 1.x | HTTP client |
| jsPDF | 2.x | Generación de comprobantes PDF |
| react-phone-input-2 | 2.x | Input de teléfono internacional |
| react-confetti | — | Animación celebración en compra exitosa |
| Culqi Checkout V4 | — | SDK de pagos (cargado vía `<script>` en index.html) |

### SDK de Pagos Culqi

El SDK de Culqi se carga en `index.html` como script externo — **sin `defer`**:

```html
<!-- Culqi Checkout V4 SDK — debe cargarse de forma síncrona -->
<script src="https://js.culqi.com/checkout-js"></script>
```

El `defer` causaría que el SDK no esté disponible cuando el componente React intente usarlo.

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base eliminado — app corre desde raíz del subdominio peruse.latconecta.com
  server: {
    port: 5174,
    open: true
  }
})
```

La configuración `base` es fundamental — sin ella, los assets generados por Vite tienen rutas absolutas desde `/` y dan 404 cuando la app vive bajo `/latconecta_users/`.

---

## ESTRUCTURA DE DIRECTORIOS <a name="estructura"></a>

```
latconecta_users/src/
│
├── App.jsx               # Rutas principales + basename del Router
├── main.jsx              # Entry point
├── index.css             # Tailwind + estilos globales
│
├── views/
│   ├── WelcomeView.jsx       # Landing page con carousel
│   ├── SelectView.jsx        # Wizard: País → Servicio → Compañía
│   ├── ShopView.jsx          # Catálogo de productos
│   └── ProfileView.jsx       # Perfil + historial de compras
│
├── components/
│   ├── PurchasePopup.jsx     ★ COMPONENTE CRÍTICO (flujo compra 7 pasos)
│   ├── OperationsPanel.jsx   ★ Panel control operaciones (fase1/fase2)
│   │
│   ├── payment/
│   │   └── CulqiCheckout.jsx   # Culqi Checkout V4 — tarjeta + Yape
│   │
│   ├── auth/
│   │   ├── LoginModal.jsx      # Login modal overlay
│   │   └── SignUpModal.jsx     # Registro modal overlay
│   │
│   └── common/
│       ├── Header.jsx          # Barra superior (logo + nav + auth)
│       ├── Footer.jsx          # Footer con links e info
│       └── Notification.jsx    # Toasts de feedback
│
├── services/                   # Comunicación con backend
│   ├── authService.js
│   ├── countriesService.js
│   ├── servicesService.js
│   ├── companiesService.js
│   ├── productsService.js
│   ├── purchasesService.js
│   ├── paymentService.js           # Culqi: getConfig, createCharge, createRefund, cancelPayment
│   ├── operationsConfigService.js  # Control operaciones fase1/fase2
│   ├── latconectaService.js
│   ├── uploadService.js
│   ├── exchangeRateService.js
│   ├── usersService.js
│   └── vendorApiMappingsService.js
│
├── context/
│   ├── AuthContext.jsx      # user, token, isAuthenticated
│   └── AppContext.jsx       # notifications, globalLoading
│
├── hooks/
│   ├── useAuth.js
│   ├── useNotification.js
│   └── useLocalStorage.js
│
├── config/
│   └── api.js               # Axios + interceptores
│
└── utils/
    ├── imageHelper.js       # Construye URLs de imágenes
    └── uploadHelper.js      # Helpers para uploads
```

---

## ROUTING Y VISTAS <a name="routing"></a>

### App.jsx

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    // Sin basename — app corre desde la raíz del subdominio peruse.latconecta.com
    <BrowserRouter>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();

  // navigate('/select') → genera /latconecta_users/select ✅
  // navigate('/shop')   → genera /latconecta_users/shop   ✅

  return (
    <Routes>
      <Route path="/"                          element={<WelcomeView />} />
      <Route path="/select"                    element={<SelectView />} />
      <Route path="/shop"                      element={<ShopView />} />
      <Route path="/profile"                   element={<ProfileView />} />
      <Route path="/login"                     element={<LoginPage />} />
      {/* Libro de Reclamaciones — público, sin auth */}
      <Route path="/reclamaciones"             element={<LibroReclamaciones />} />
      <Route path="/reclamaciones/oferta/:num" element={<RespuestaOferta />} />
      {/* Páginas legales — públicas, sin auth */}
      <Route path="/aviso-legal"               element={<AvisoLegalView />} />
      <Route path="/terminos"                  element={<TerminosView />} />
      <Route path="/privacidad"                element={<PrivacidadView />} />
    </Routes>
  )
}
```

### Reglas críticas de navegación

La app corre desde la raíz del subdominio, sin `basename`. Usar siempre `<Link to>` o `navigate()` para navegación interna — **nunca** `href` con rutas absolutas (causan 404 o pantalla en blanco):

| Método | Ejemplo correcto | Resultado |
|--------|-----------------|-----------|
| `navigate()` | `navigate('/select')` | `peruse.latconecta.com/select` ✅ |
| `<Link to>` | `<Link to="/select">` | `peruse.latconecta.com/select` ✅ |
| `href` absoluto | `href="/latconecta_users/select"` | ❌ 404 — pantalla en blanco |
| `href` relativo | `href="/select"` | ✅ Solo si coincide con ruta registrada |
| `href` (MAL) | `href="/select"` | `/select` ❌ → 404 |
| `window.location.href` | `window.location.href = '/latconecta_users/shop'` | `/latconecta_users/shop` ✅ |
| `window.location.href` (MAL) | `window.location.href = '/shop'` | `/shop` ❌ → 404 |

**Archivos donde se aplica esta regla:**
- `ShopView.jsx` — `href="/latconecta_users/select"` (botón "volver")
- `ProfileView.jsx` — `window.location.href = '/latconecta_users/shop'`

### Paso de Datos entre Vistas (URL Query Params)

SelectView pasa la selección a ShopView mediante query params:

```javascript
// SelectView.jsx — al completar selección:
navigate(`/shop?country_id=${country.country_id}&service_id=${service.service_id}&company_id=${company.company_id}`)

// ShopView.jsx — recibe los params:
const [searchParams] = useSearchParams()
const countryId  = searchParams.get('country_id')
const serviceId  = searchParams.get('service_id')
const companyId  = searchParams.get('company_id')
```

Este diseño permite que el usuario pueda copiar y compartir la URL de una compañía específica (deep linking).

---

## NAVEGACIÓN MULTI-TENANT (SELECTVIEW) <a name="navegacion"></a>

### SelectView — Wizard de 3 Pasos

SelectView implementa una navegación progresiva donde cada selección filtra dinámicamente el paso siguiente.

```jsx
// Estado del wizard
const [step, setStep] = useState(1)       // 1, 2, 3
const [countries, setCountries]   = useState([])
const [services, setServices]     = useState([])
const [companies, setCompanies]   = useState([])
const [selected, setSelected] = useState({
  country: null,
  service: null,
  company: null
})

// Paso 1: Cargar países al montar
useEffect(() => {
  countriesService.getAll({ status: 'active' })
    .then(data => setCountries(data))
}, [])

// Paso 2: Al seleccionar país → cargar servicios filtrados
useEffect(() => {
  if (selected.country) {
    servicesService.getAll({ country_id: selected.country.country_id })
      .then(data => setServices(data))
    setStep(2)
  }
}, [selected.country])

// Paso 3: Al seleccionar servicio → cargar compañías filtradas
useEffect(() => {
  if (selected.service) {
    companiesService.getAll({
      country_id: selected.country.country_id,
      service_id: selected.service.service_id
    }).then(data => setCompanies(data))
    setStep(3)
  }
}, [selected.service])

// Al seleccionar compañía → navegar al catálogo
useEffect(() => {
  if (selected.company) {
    navigate(`/shop?country_id=...&service_id=...&company_id=...`)
  }
}, [selected.company])
```

### Presentación Visual del Wizard

Cada paso muestra **cards visuales** con imágenes:

```
Paso 1 — Países:
  [🇵🇪 Perú]  [🇲🇽 México]  [🇻🇪 Venezuela]

Paso 2 — Servicios (filtrados para Perú):
  [📱 TopUps]  [📦 Paquetes]  [💡 Bill Payment]  [📲 Smartphones]

Paso 3 — Compañías (TopUps en Perú):
  [Claro]  [Movistar]  [Entel]  [Bitel]
```

Cada card muestra: logo/flag + nombre + descripción breve.

**Indicador de progreso:** Barra visual "Paso X de 3" en la parte superior.

**Navegación hacia atrás:** Botón "← Cambiar" en cada paso para volver al anterior y resetear la selección.

---

## AUTENTICACIÓN OPCIONAL <a name="auth"></a>

### AuthContext para Users

```jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Verifica si hay sesión guardada
    const savedToken = localStorage.getItem('user_token')
    const savedUser  = localStorage.getItem('user_data')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
  }, [])
}
```

### Diferencia con Admin

- En el **Admin**: la autenticación es **obligatoria** (ProtectedRoute redirige a /login)
- En **Users**: la autenticación es **opcional** — los usuarios no autenticados pueden comprar

### Modales de Login/Registro

```jsx
// Se abren como overlay sobre cualquier vista
// Sin cambiar la URL ni interrumpir el flujo
const [showLogin, setShowLogin]   = useState(false)
const [showSignUp, setShowSignUp] = useState(false)
```

### Flujo de Recuperación de Contraseña en LoginModal

`LoginModal.jsx` implementa un flujo de 4 pasos internos sin cambiar de ruta:

```
step='login'   → Vista normal de login
step='forgot'  → Paso 1: usuario ingresa email → POST /api/v1/auth/forgot-password
step='verify'  → Paso 2: código 6 dígitos + nueva contraseña → POST /api/v1/auth/reset-password
step='success' → Confirmación con ícono verde → "Ir a Iniciar Sesión"
```

---

## COMUNICACIÓN CON BACKEND <a name="comunicacion"></a>

### config/api.js

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor: agrega token si existe
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('user_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: 401 limpia sesión (no redirige — usuario puede seguir comprando)
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_data')
    }
    return Promise.reject(error)
  }
)
```

### paymentService.js — Culqi

Métodos disponibles:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getConfig()` | GET /payments/config | Obtiene public_key, card.mode, disponibilidad |
| `createCharge(data)` | POST /payments/charge | Crea cargo con token Culqi |
| `createRefund(data)` | POST /payments/refund | Devuelve un cargo |
| `cancelPayment(data)` | POST /payments/cancel | Cancela/revierte un cargo |

### authService.js — Users

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `login(email, password)` | POST /auth/login | Login con credenciales |
| `register(userData)` | POST /auth/register | Registro nuevo usuario |
| `getCurrentUser()` | GET /auth/me | Usuario autenticado |
| `updateProfile(userId, data)` | PUT /users/{id} | Actualizar perfil |
| `changePassword(passwords)` | POST /auth/change-password | Cambio autenticado |
| `logout()` | — | Limpia localStorage |
| `forgotPassword(email)` | POST /auth/forgot-password | Solicitar código de recuperación |
| `resetPassword(email, code, newPwd)` | POST /auth/reset-password | Restablecer con código |

---

## VARIABLES DE ENTORNO <a name="variables"></a>

```bash
# latconecta_users/.env (desarrollo local)
VITE_API_URL=http://localhost:8100/api/v1

# En servidor CalmetServer
VITE_API_URL=http://77.42.92.151:8100/api/v1
```

> **Nota:** La variable es `VITE_API_URL` (no `VITE_API_BASE_URL`).

---

## BUILD Y DESPLIEGUE <a name="build"></a>

### Build de Producción

```bash
cd /var/www/latconecta/latconecta_users

# Build limpio recomendado cuando hay cambios importantes
rm -rf dist && npm run build

# Build normal (reutiliza caché)
npm run build

# Genera: dist/ con assets bajo /latconecta_users/
```

### Configuración Nginx (extracto relevante)

```nginx
# SPA en subdominio — sin basename
# try_files sirve index.html para que React Router maneje todas las sub-rutas
location /latconecta_users {
    alias /var/www/latconecta/latconecta_users/dist;
    index index.html;
    try_files $uri $uri/ /latconecta_users/index.html;
}
```

**Notas importantes:**
- El `try_files` con `alias` no admite named locations (`@spa_users`). Usar la forma directa mostrada arriba.
- La redirección de raíz: `location = / { return 301 /latconecta_users; }` está en el bloque principal de Nginx.
- El CSP del bloque Nginx debe incluir los dominios de Culqi (ver DOC 28).

### Proceso de Actualización

```bash
# 1. Actualizar código desde GitHub
cd /var/www/latconecta && git pull origin main

# 2. Rebuild
cd latconecta_users && npm run build

# Nginx sirve automáticamente desde dist/ — no requiere reinicio
```

---

**FIN DEL DOCUMENTO 15**

*Versión: 5.0 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Cambios v6.0: Rutas nuevas: /aviso-legal, /terminos, /privacidad, /reclamaciones, /reclamaciones/oferta/:num. Eliminado basename y base de vite.config — app en subdominio desde raíz. Navegación: href absolutos causan 404, usar siempre Link to o navigate(). Cambios v5.0: CulqiCheckout, SDK Culqi, paymentService.js.*
*Continúa en: DOC 16 — Frontend Users: Vistas y Componentes*


---

<a name="16-frontend-users-vistas-componentes"></a>

# DOCUMENTO 16
## FRONTEND USERS — VISTAS Y COMPONENTES

**Versión:** 7.0
**Fecha:** Junio 2026
**Sistema:** Latconecta v2.0.0

---

## CONTENIDO

1. [WelcomeView — Landing Page](#welcome)
2. [SelectView — Selección Compañía](#select)
3. [ShopView — Catálogo](#shop)
4. [PurchasePopup — Flujo de Compra](#purchase)
5. [ProfileView — Panel Usuario](#profile)
6. [OperationsPanel — Control Operaciones](#panel)
7. [CulqiCheckout — Pago con Tarjeta y Yape](#culqi)
8. [Páginas Legales](#legal)
9. [Footer](#footer)

---

## WELCOMEVIEW — LANDING PAGE <a name="welcome"></a>

### Objetivo

Primera impresión del sistema. Genera confianza y motiva al usuario a iniciar el proceso de compra.

### Estructura Visual

```
┌──────────────────────────────────────────────────────┐
│  CAROUSEL DE MARKETING (fotos latconecta_photo_mkt*) │
│  Auto-rotación cada 5s · Overlay con eslogan         │
│  [← ] [• ○ ○ ○] [ →]                               │
├──────────────────────────────────────────────────────┤
│  GRID DE SERVICIOS DISPONIBLES                       │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐   │
│  │TopUps  │  │Paquetes│  │BillPay │  │Smartphones│  │
│  └────────┘  └────────┘  └────────┘  └────────┘   │
├──────────────────────────────────────────────────────┤
│  SECCIÓN BENEFICIOS                                  │
│  ⚡ Recarga en 2 minutos                             │
│  🌎 Múltiples países                                 │
│  💳 Paga con tarjeta o efectivo                      │
├──────────────────────────────────────────────────────┤
│  [COMENZAR AHORA →]                                  │
├──────────────────────────────────────────────────────┤
│  FOOTER: links legales, redes sociales, contacto     │
└──────────────────────────────────────────────────────┘
```

### Datos que carga

```javascript
// Al montar:
const latconecta = await latconectaService.get()
// → Nombre, eslogan, 4 fotos carrusel, redes sociales

const services = await servicesService.getAll({ status: 'active' })
// → Grid de servicios disponibles
```

### Carousel

- Auto-rotación cada 5 segundos con pausa al hover
- Fotos: `latconecta_photo_mkt1` a `latconecta_photo_mkt4`
- Overlay con `latconecta_lema_1` y `latconecta_lema_2`
- Navegación: flechas laterales + dots indicadores

---

## SELECTVIEW — WIZARD MULTI-TENANT <a name="select"></a>

### Flujo de Selección

```
[Banda superior — una sola línea en desktop, dos en móvil]
  [Selector País] [Bandera + Nombre] | [Selector Servicio] [Foto + Nombre]
        ↓ (selección de ambos)
[Grid de Compañías — 2 cols móvil / 3 cols tablet / 4 cols desktop]
  Cada card: Logo · Nombre · País · Servicio · Botón "Ver Productos"
        ↓ (click en compañía)
Navigate → /shop?country=PER&service=TopUps&company=Bitel
```

**Pestañas en ShopView:** Solo se muestran los servicios que la compañía seleccionada tiene activos (`company.service_id`). El sistema es monoservicio por compañía (1:1), por lo que en la práctica siempre se muestra una sola pestaña.

### Reset en Cascada

Al cambiar una selección, se resetean las selecciones posteriores:

```javascript
const handleCountrySelect = (country) => {
  setSelected({ country, service: null, company: null })
  setStep(1)
  setServices([])
  setCompanies([])
}
```

---

## SHOPVIEW — CATÁLOGO <a name="shop"></a>

### Datos que carga

```javascript
// Al montar — lee params de la URL:
const companyId = searchParams.get('company_id')
const serviceId = searchParams.get('service_id')

// Carga catálogo filtrado:
const products = await productsService.getAll({
  company_id: companyId,
  service_id: serviceId,
  status: 'active'
})
```

### Botón "volver" — Ruta absoluta crítica

```jsx
// CORRECTO — incluye el prefijo basename explícitamente
<a href="/latconecta_users/select">← Volver a selección</a>

// INCORRECTO — causa 404
<a href="/select">← Volver a selección</a>
```

---

## SHOPVIEW — handlePaymentAndProvision <a name="shop-payment"></a>

```javascript
const handlePaymentAndProvision = async (gatewayData = null) => {
  // Normalización de user_selected_amount
  const rawVariableAmount = purchaseData.variableAmount
    ? parseFloat(purchaseData.variableAmount) : null
  const rawTransferAmount = purchaseData.transferAmount
    ? parseFloat(purchaseData.transferAmount) : null
  const rawBillAmount = (purchaseData.validationData?.indicador === 'R'
    && purchaseData.billPaymentAmount)
    ? parseFloat(purchaseData.billPaymentAmount) : null
  const userSelectedAmount = rawVariableAmount ?? rawTransferAmount ?? rawBillAmount ?? null

  try {
    const response = await purchasesService.create({ ..., user_selected_amount: userSelectedAmount })
    setPurchaseResult({ ... })
    setPurchaseStep(6)
  } catch (error) {
    if (gatewayData) {
      // Pago Culqi cobrado pero backend falló → Step 6 con intervención manual
      setPurchaseResult({
        success: false,
        payment_status: 'Success',
        requires_manual_intervention: true,
        reference: gatewayData.orderNumber,
        ...
      })
      setPurchaseStep(6)
    } else {
      setError(error.message)
      setPurchaseStep(4)
    }
  }
}
```

---

## PURCHASEPOPUP — FLUJO DE COMPRA <a name="purchase"></a>

El componente más crítico del sistema. Maneja el flujo completo de compra en 7 pasos.

### Arquitectura de Steps

| Step | Nombre | Condición de aparición |
|------|--------|----------------------|
| 2 | Validación (teléfono/cuenta) | Siempre |
| 2.5 | Datos de entrega | Solo Smartphones |
| 2.6 | Monto de Bill Payment | Solo Bill Payment |
| 3 | Selección de monto | Solo productos tipo R (Rango) |
| 4 | Verificar balance + elegir pago | Siempre |
| 5 | Procesando compra | Siempre (spinner) |
| 6 | Resultado | Siempre |

### Estado Completo del Popup

```javascript
// Refs
const isSubmitting = useRef(false)      // Anti-doble submit

// Pasos
const [purchaseStep, setPurchaseStep]   = useState(2)

// Datos de compra
const [purchaseData, setPurchaseData]   = useState({
  phoneNumber: '',
  accountNumber: '',
  isValidated: false,
  validationData: null,
  productType: null,
  transferAmount: '',
  variableAmount: '',
  billPaymentAmount: 0,
  paymentMethod: null,       // 'card' | 'barcode'
  deliveryName: '',
  deliveryPhone: '',
  deliveryAddress: '',
  exchangeRate: 1.0,
  productCurrency: null,
  vendorCurrency: null,
  conversionApplies: false,
})

// Gateway de pagos (Culqi)
const [showGatewayCheckout, setShowGatewayCheckout] = useState(false)
const [gatewayResult, setGatewayResult]             = useState(null)
const [paymentConfig, setPaymentConfig]             = useState(null)

// Resultado final
const [purchaseResult, setPurchaseResult] = useState(null)
const [processing, setProcessing]         = useState(false)
const [error, setError]                   = useState(null)
```

### Carga de configuración de pagos

```javascript
useEffect(() => {
  if (purchaseStep === 4 || showPurchasePopup) {
    paymentService.getConfig().then(cfg => {
      setPaymentConfig(cfg)
    })
  }
}, [purchaseStep, showPurchasePopup])

// card_available / barcode_available — control por país (desde .env vía backend)
const cardEnabled    = paymentConfig?.card_available !== false
const barcodeEnabled = paymentConfig?.barcode_available !== false

// card.mode — control de fase (fase1=simulado / fase2=Culqi real)
const cardMode = paymentConfig?.card?.mode || 'fase1'
```

### Step 2 — Validación

**Para servicios de teléfono** (TopUps, Paquetes, Transfers, Smartphones):

```javascript
const validatePhone = async () => {
  const result = await purchasesService.validatePhone({
    product_id: product.product_id,
    phone_number: purchaseData.phoneNumber
  })
  if (result.data?.valid) {
    setPurchaseData(prev => ({ ...prev, isValidated: true }))
    setPurchaseStep(3)
  } else {
    setError(result.message || 'Número de teléfono no válido')
  }
}
```

**Para Bill Payment:**

```javascript
const validateAccount = async () => {
  const result = await purchasesService.validateAccount({
    product_id: product.product_id,
    account_number: purchaseData.accountNumber
  })
  if (result.data?.valid) {
    setPurchaseData(prev => ({
      ...prev,
      isValidated: true,
      validationData: {
        monto_base: result.data.monto_base,
        indicador: result.data.indicador,  // 'T' o 'R'
        account_holder: result.data.account_holder
      }
    }))
    setPurchaseStep(2.6)
  }
}
```

### Step 2.5 — Datos de Entrega (solo Smartphones)

Formulario con: nombre del destinatario, teléfono de contacto, dirección de entrega.

### Step 2.6 — Monto de Bill Payment

**Si `indicador = 'T'` (Total):**
```
Deuda total: S/8,550.00
Debes pagar el monto completo.
[Continuar →]
```

**Si `indicador = 'R'` (Rango):**
```
Deuda total: S/8,550.00
Elige cuánto pagar:
[slider: S/100.00 ────────────── S/8,550.00]
Monto seleccionado: S/3,000.00
[Continuar →]
```

### Step 3 — Selección de Monto (solo Rango)

Solo aparece para productos con `product_amount_type = 'R'`:

```
Monto mínimo: S/1.00
Monto máximo: S/500.00

[slider] S/200.00

Precio a pagar: S/190.00 (descuento 5% aplicado)
[Continuar →]
```

### Step 4 — Elegir Método de Pago

**Muestra métodos de pago según disponibilidad:**

```
┌──────────────────────────────────────────────────┐
│  Selecciona Método de Pago                       │
│                                                  │
│  [💳 Pago con tarjeta]      (si card_available)  │
│     Pago inmediato y seguro                      │
│                                                  │
│  [📊 Código de barras]                           │
│     (si barcode_available AND company_barcode    │
│      _available='Si')                            │
│     Paga en tienda autorizada                    │
│                                                  │
│  [Procesar Compra]  ← un solo botón             │
└──────────────────────────────────────────────────┘
```

La opción de tarjeta se controla por `paymentConfig.card_available` (nivel país).
La opción de barcode requiere dos condiciones simultáneas:
- `paymentConfig.barcode_available === true` (nivel país — `.env`)
- `company.company_barcode_available === 'Si'` (nivel operadora — BD)

**Al hacer click en "Procesar Compra" con tarjeta:**

```javascript
// Anti-doble submit
if (isSubmitting.current) return;
isSubmitting.current = true;

if (purchaseData.paymentMethod === 'card') {
  if (cardMode === 'fase2') {
    setShowGatewayCheckout(true)  // → monta CulqiCheckout con autoStart=true
  } else {
    // Fase 1: pago simulado internamente
    handlePaymentAndProvision()
  }
}

// Reset al finalizar (en el callback onResult de CulqiCheckout)
isSubmitting.current = false
```

### CulqiCheckout montado dentro de PurchasePopup

```jsx
{showGatewayCheckout && (
  <CulqiCheckout
    amount={totalAmountToPay}
    currency={purchaseData.productCurrency || 'PEN'}
    orderNumber={`LC${Date.now().toString().slice(-12)}`}
    user={user}
    autoStart={true}
    onResult={(result) => {
      setShowGatewayCheckout(false)
      if (result.success) {
        setGatewayResult(result)
        handlePaymentAndProvision(result)
      } else {
        isSubmitting.current = false
        setError(result.message || 'Pago no completado')
      }
    }}
    onCancel={() => {
      setShowGatewayCheckout(false)
      isSubmitting.current = false
    }}
  />
)}
```

### Step 5 — Procesando Compra

Spinner de carga mientras el backend procesa `POST /api/v1/purchases/create`. Sin interacción del usuario.

### Step 6 — Resultado

**Si éxito (`purchase_status = 'Success'`):**

```jsx
<Confetti numberOfPieces={500} recycle={false} />
<CheckCircle className="text-green-500 w-16 h-16 mx-auto" />
<h2>¡Recarga exitosa!</h2>
<p>Referencia: {purchase.purchase_reference}</p>
<p>Provisión: {purchase.purchase_delivery_status}</p>
<p>Vendor ID: {purchase.vendor_trans_id}</p>
<button onClick={downloadPDF}>📄 Descargar comprobante</button>
<button onClick={onClose}>Nueva compra</button>
```

**Si barcode generado (`payment_status = 'Pending'`):**
```jsx
<h2>Código de pago generado</h2>
<img src={purchase.purchase_barcode_image} alt="Código de barras" />
<p>Código: {purchase.purchase_barcode_code}</p>
<p>Monto a pagar: S/{purchase.purchase_total_amount}</p>
```

**Si error post-gateway (pago cobrado, backend falló):**
```jsx
<AlertCircle className="text-orange-500" />
<h2>Error al registrar la compra</h2>
<p>Tu pago fue procesado (orden: {purchase.reference})</p>
<p>Por favor contacta a soporte con este número de orden.</p>
```

**Si falla (`purchase_status = 'Failed'`, reversión exitosa en Culqi):**
```jsx
<XCircle className="text-red-500" />
<h2>No se pudo procesar la compra</h2>
<p>Tu pago fue revertido. No se realizó ningún cargo.</p>
<p>Referencia de devolución: {purchase.purchase_reversal_ref}</p>
```

**Descarga PDF con jsPDF:**
```javascript
const downloadPDF = () => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [105, 148] })
  doc.save(`recibo-${purchase.purchase_reference}.pdf`)
}
```

---

## PROFILEVIEW — PANEL USUARIO <a name="profile"></a>

### Secciones

**Información Personal (editable):**
- Nombre, email (no editable), teléfono
- Foto de perfil (upload)
- Botón "Cambiar contraseña"

**Historial de Compras:**

```javascript
useEffect(() => {
  purchasesService.getMyPurchases({
    user_id: currentUser.user_id,
    skip: 0, limit: 20
  }).then(setPurchases)
}, [])
```

Cards de compra con: referencia y fecha, nombre del producto, monto y moneda, estado visual (✅ / ⏳ / ❌), método de pago.

**Botón "ir a comprar" — Ruta absoluta crítica:**

```javascript
// CORRECTO
window.location.href = '/latconecta_users/shop'

// INCORRECTO — causa 404
window.location.href = '/shop'
```

---

## OPERATIONSPANEL — CONTROL OPERACIONES <a name="panel"></a>

Componente de control visible solo durante testing/desarrollo. Permite cambiar los modos de las 10 operaciones en tiempo real.

```javascript
useEffect(() => {
  operationsConfigService.getConfig()
    .then(setOpsConfig)
}, [])

const handleModeChange = async (operation, mode, fase1Response) => {
  await operationsConfigService.setOperationMode(operation, mode, fase1Response)
  const updated = await operationsConfigService.getConfig()
  setOpsConfig(updated)
}

const handlePreset = async (presetName) => {
  await operationsConfigService.applyPreset(presetName)
  const updated = await operationsConfigService.getConfig()
  setOpsConfig(updated)
}
```

**Presentación:**
- Panel flotante expandible/colapsable
- Una fila por operación: label + toggle Fase1/Fase2 + si Fase1: selector success/fail
- Botones de presets rápidos (Happy Path, Payment Fail, etc.)
- Color verde = Fase1 / Naranja = Fase2

---

## CULQICHECKOUT — PAGO CON TARJETA Y YAPE <a name="culqi"></a>

**Archivo:** `latconecta_users/src/components/payment/CulqiCheckout.jsx`

Componente que envuelve el SDK Culqi Checkout V4. Se monta automáticamente cuando el usuario hace click en "Procesar Compra" con método tarjeta en Fase 2.

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `amount` | number | Monto en la moneda del producto (ej: 15.00) |
| `currency` | string | Código de moneda ('PEN') |
| `orderNumber` | string | Número de orden único generado en PurchasePopup |
| `user` | object | Usuario autenticado (puede ser null) |
| `onResult` | function | Callback con resultado del pago |
| `onCancel` | function | Callback si el usuario cancela |
| `autoStart` | boolean | Si true, abre el checkout al montarse (siempre true en uso actual) |

### Métodos de pago habilitados

| Método | Token generado | Disponible |
|--------|---------------|-----------|
| Yape | `ype_live_XXX` / `ype_test_XXX` | ✅ Primero en la lista |
| Tarjeta (Visa, MC, Amex) | `tkn_live_XXX` / `tkn_test_XXX` | ✅ Segundo en la lista |
| Billeteras / PagoEfectivo | — | ❌ No habilitado — requiere Order + Webhook asíncrono |
| Cuotéalo | — | ❌ No habilitado — requiere Order |

### Flujo interno

```javascript
useEffect(() => {
  if (autoStart) loadCulqiCheckout()
}, [])

const loadCulqiCheckout = async () => {
  // Anti-doble ejecución (React StrictMode)
  if (hasStarted.current) return
  hasStarted.current = true

  // 1. Obtener configuración del backend
  const config = await paymentService.getConfig()
  const publicKey = config.public_key    // pk_test_XXX o pk_live_XXX

  // 2. Calcular monto en céntimos
  const amountCents = Math.round(parseFloat(amount) * 100)

  // 3. Configurar el Checkout V4
  const culqiSettings = {
    title:    "Latconecta",
    currency: currency,
    amount:   amountCents,
    // SIN "order" — solo tarjeta + Yape (flujo sincrónico sin Webhooks)
  }

  const paymentMethods = {
    yape:       true,    // Yape primero
    tarjeta:    true,
    billetera:  false,
    bancaMovil: false,
    agente:     false,
    cuotealo:   false,
  }

  // 4. RSA (opcional)
  const rsa = config.rsa_id ? {
    id:         config.rsa_id,
    publicKey:  config.rsa_public_key
  } : null

  // 5. Inicializar y abrir
  const culqiInstance = new window.CulqiCheckout(publicKey, culqiSettings)
  culqiInstance.culqi = handleCulqiAction  // callback de resultado
  culqiInstance.setPaymentMethods(paymentMethods)
  if (rsa) culqiInstance.setRSAPublicKey(rsa)
  culqiInstance.open()
}
```

### Handler de resultado

```javascript
const handleCulqiAction = async () => {
  if (culqiInstance.token) {
    // Token de tarjeta (tkn_) o Yape (ype_)
    const token = culqiInstance.token

    const amountCents = Math.round(parseFloat(amount) * 100)
    const orderNum = orderNumber || `LC${Date.now().toString().slice(-12)}`

    // Crear cargo en el backend
    const chargeResp = await paymentService.createCharge({
      token_id:      token.id,           // tkn_test_XXX o ype_test_XXX
      amount:        amountCents,
      currency_code: currency,
      email:         token.email,        // email del token (del checkout de Culqi)
      description:   `Latconecta ${orderNum}`,
      order_number:  orderNum,
    })

    if (chargeResp.success) {
      // Preparar cancelData para reversión automática si provisión falla
      const cancelData = {
        gateway:   "culqi",
        charge_id: chargeResp.charge_id,   // chr_live_XXX o chr_test_XXX
        amount:    amountCents,
        currency:  currency,
        reason:    "solicitud_comprador",
      }

      onResult?.({
        success:      true,
        provider:     "culqi",
        charge_id:    chargeResp.charge_id,
        outcome_type: chargeResp.outcome_type,   // "venta_exitosa"
        amount:       amountCents,
        currency:     currency,
        message:      chargeResp.message,
        orderNumber:  orderNum,
        cancelData,
      })
    } else {
      onResult?.({ success: false, message: chargeResp.message })
    }

  } else if (culqiInstance.order) {
    // Order (no usado actualmente — requeriría flujo asíncrono con Webhooks)
    onResult?.({ success: false, message: 'Orders no implementados' })

  } else {
    // Error o cancelación
    const err = culqiInstance.error
    onCancel?.()
  }
}
```

### Notas sobre antifraud_details

Los datos personales del usuario (dirección, nombre, teléfono) **no se envían** al crear el cargo. Culqi no los requiere y el uso de datos ficticios puede generar alertas en sistemas antifraude. El SDK de Culqi recopila internamente la información necesaria durante el checkout (email, IP, dispositivo).

### Warnings del SDK en consola — clasificación

| Warning | Origen | Afecta funcionamiento |
|---------|--------|----------------------|
| `Culqi3DS is not defined` | Dominio no registrado en Culqi para 3DS | No |
| `Rejected message from untrusted origin` | Dominio no registrado en Culqi | No |
| Errores CORS de `dynatrace.com` | Telemetría interna del SDK | No |

El warning `Culqi3DS is not defined` desaparecerá cuando se use un dominio real registrado en el panel de Culqi.

---


---

## PÁGINAS LEGALES <a name="legal"></a>

Tres vistas estáticas públicas sin autenticación requerida. Accesibles desde el Footer.

| Vista | Ruta | Descripción |
|-------|------|-------------|
| `AvisoLegalView.jsx` | `/aviso-legal` | Aviso legal, propiedad intelectual, jurisdicción peruana |
| `TerminosView.jsx` | `/terminos` | T&C completos: productos, precios, proceso de compra, política de reembolsos con OSIPTEL |
| `PrivacidadView.jsx` | `/privacidad` | Política de privacidad Ley N° 29733, campos de registro, uso de datos |

### Definición regulatoria en TerminosView

La sección "Productos y Servicios" incluye la definición del servicio de recarga conforme a la **Resolución de Consejo Directivo N° 172-2022-CD/OSIPTEL**:

> *"Una recarga de saldo prepago es un crédito de comunicaciones: un valor intangible en soles acreditado directamente en la línea móvil del destinatario. El saldo se valoriza según la Tarifa Única Prepago que cada operador tiene registrada ante OSIPTEL."*

Esta definición es consistente con el documento de sustento de imágenes enviado a Culqi.

### Política de Reembolsos (en TerminosView)

- La devolución es **automática** cuando la recarga no puede procesarse por razones técnicas imputables a la plataforma
- Solo si la devolución automática no se concreta, el usuario puede solicitar reembolso adjuntando el **recibo digital** generado por el sistema (con fecha, hora, referencia, operador, número y monto)
- Plazo de respuesta: hasta 30 días calendario
- No procede reembolso si la recarga fue acreditada exitosamente o el número fue incorrecto por error del usuario

---

## FOOTER <a name="footer"></a>

### Estructura (3 columnas)

| Columna | Contenido |
|---------|-----------|
| 1 — Marca | Logo Latconecta + lema corporativo |
| 2 — Contacto | Email comercial, email soporte, dirección fiscal |
| 3 — Legal | Links: Términos y Condiciones · Privacidad · Aviso Legal + imagen Libro de Reclamaciones |

### Datos fijos

- **Dirección:** Calle Los Recuerdos 387, Urb. Chacarilla del Estanque, San Borja, Lima, Perú
- **Copyright:** © {año} LATCOM HORIZONS PERU S.R.L. Todos los derechos reservados.
- **Libro de Reclamaciones:** imagen oficial con `<Link to="/reclamaciones">`

### Responsive

- Desktop: 3 columnas (`grid-cols-3`)
- Móvil: columna única (`grid-cols-1`)
- Padding reducido: `py-4` (antes `py-6`)


---

**FIN DEL DOCUMENTO 16**

*Versión: 5.0 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Cambios v7.0: Nuevas vistas AvisoLegalView, TerminosView, PrivacidadView. Footer: 3 columnas, dirección fiscal, copyright LATCOM HORIZONS PERU. SelectView: dropdowns en línea horizontal, grid compañías 4 cols. ShopView: grid 4 cols desktop/1 móvil, pestañas dinámicas por compañía, imágenes object-contain. Cambios v6.0: paymentPhase, hiddenByculqi, fusión detalle+Step2, onRetry/onAbort Culqi. Cambios v5.0: CulqiCheckout, isSubmitting ref.*
*Continúa en: DOC 17 — Vendor Simulator*


---

<a name="17-vendor-simulator"></a>

# DOCUMENTO 17
## VENDOR SIMULATOR — SERVIDOR DE SIMULACIÓN

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Archivo:** `vendor_simulator/vendor_simulator.py`
**Puerto:** 5001
**Servicio systemd:** `latconecta-vendor-simulator`

---

## CONTENIDO

1. [Visión General](#vision)
2. [Endpoints del Simulator](#endpoints)
3. [Comportamiento de Respuestas](#comportamiento)
4. [Autenticación Simulada](#auth)
5. [Configuración y Arranque](#configuracion)
6. [Diferencias con el Backend Mock](#diferencias)

---

## VISIÓN GENERAL <a name="vision"></a>

El Vendor Simulator es un servidor Flask independiente que simula la API de LATCOM/Relier. Su propósito es permitir el desarrollo y pruebas en PC local sin necesidad de conectarse al ambiente UAT del vendor real.

### Posición en la Arquitectura

```
Development (PC local):
Backend FastAPI (8100)
    ↓ httpx.post()
Vendor Simulator Flask (5001)   ← reemplaza al LATCOM real
    ↓ retorna respuesta simulada
Backend procesa la respuesta

UAT/Production (Ubuntu):
Backend FastAPI (8100)
    ↓ httpx.post()
LATCOM via Relier (internet)    ← proveedor real
    ↓ retorna respuesta real
Backend procesa la respuesta
```

El switch entre simulator y LATCOM real es automático:
- `VENDOR_SIMULATOR_ENABLED=True` + `VENDOR_SIMULATOR_URL=http://localhost:5001` → simulator
- `VENDOR_SIMULATOR_ENABLED=False` → URL del vendor en la tabla `vendors`

### Principio de Diseño

El Vendor Simulator **no necesita saber** si el backend está en Fase 1 o Fase 2 — eso lo controla el `OperationsConfigService` en el backend. El simulator simplemente responde a las llamadas HTTP que recibe.

---

## ENDPOINTS DEL SIMULATOR <a name="endpoints"></a>

El simulator implementa la misma API que LATCOM/Relier.

### POST /api/v1/topup

Simula la provisión de una recarga.

**Request esperado:**
```json
{
  "phone": "987654321",
  "amount": 20.0,
  "carrier": "bitel",
  "country": "PE",
  "product_type": "2"
}
```

**Response éxito (200):**
```json
{
  "success": true,
  "transaction_id": "SIM-LATCOM-20260325143022-001",
  "authorization_code": "SIM-BITEL-987654321-20260325",
  "new_balance": 4974.12,
  "status": "COMPLETED",
  "message": "TopUp successful (simulated)"
}
```

**Response fallo (200 con success=false):**
```json
{
  "success": false,
  "transaction_id": null,
  "status": "FAILED",
  "error_code": "INSUFFICIENT_BALANCE",
  "message": "Simulated failure: insufficient balance"
}
```

### GET /api/v1/balance

Simula la consulta de balance del vendor.

**Headers requeridos:** `x-api-key` y `x-customer-id` (cualquier valor, solo verifica que existan)

**Response (200):**
```json
{
  "usd_balance": 4994.12,
  "local_balance": 18727.95,
  "local_currency": "PEN",
  "timestamp": "2026-03-25T14:30:00",
  "simulated": true
}
```

### GET /api/v1/transaction/:transaction_id

Consulta el estado de una transacción previa.

**Response (si existe):**
```json
{
  "transaction_id": "SIM-LATCOM-20260325143022-001",
  "status": "COMPLETED",
  "amount": 20.0,
  "phone": "987654321",
  "timestamp": "2026-03-25T14:30:22",
  "simulated": true
}
```

**Response (si no existe, 404):**
```json
{
  "error": "Transaction not found",
  "transaction_id": "SIM-XXX"
}
```

### GET /health

Health check del simulator.

**Response (200):**
```json
{
  "status": "ok",
  "service": "Latconecta Vendor Simulator",
  "version": "1.0.0",
  "port": 5001
}
```

---

## COMPORTAMIENTO DE RESPUESTAS <a name="comportamiento"></a>

### Respuesta Exitosa por Defecto

Por defecto, todas las llamadas a `/api/v1/topup` retornan éxito. El simulator genera IDs únicos basados en timestamp para que cada transacción tenga un identificador diferente.

```python
# Generación de IDs en el simulator
timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
sequence = str(request_counter).zfill(3)
transaction_id = f"SIM-LATCOM-{timestamp}-{sequence}"
authorization_code = f"SIM-{carrier.upper()}-{phone[-4:]}-{timestamp}"
```

### Storage en Memoria

Las transacciones se guardan en un dict en memoria durante la sesión del proceso:

```python
# En vendor_simulator.py
transactions_store = {}

# Al procesar un topup exitoso:
transactions_store[transaction_id] = {
    "transaction_id": transaction_id,
    "status": "COMPLETED",
    "amount": request_data.get("amount"),
    "phone": request_data.get("phone"),
    "timestamp": datetime.now().isoformat()
}
```

Al reiniciar el simulator, el historial se pierde. Esto es intencional — el simulator es solo para testing, no para persistencia.

---

## AUTENTICACIÓN SIMULADA <a name="auth"></a>

El simulator verifica la **presencia** de los headers de autenticación pero no sus valores:

```python
@app.before_request
def check_auth():
    # Solo verifica que los headers existan
    if request.path != '/health':
        api_key = request.headers.get('x-api-key')
        customer_id = request.headers.get('x-customer-id')
        if not api_key or not customer_id:
            return jsonify({"error": "Missing authentication headers"}), 401
    # No verifica los valores — cualquier api_key y customer_id son válidos
```

Esto permite usar las credenciales de prueba configuradas en la tabla `vendors` sin necesidad de credenciales reales.

---

## CONFIGURACIÓN Y ARRANQUE <a name="configuracion"></a>

### Servicio systemd

```ini
# /etc/systemd/system/latconecta-vendor-simulator.service
[Unit]
Description=Latconecta Vendor Simulator
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/latconecta/vendor_simulator
ExecStart=/var/www/latconecta/vendor_simulator/.venv/bin/python vendor_simulator.py
Restart=always
RestartSec=5
Environment=FLASK_ENV=production
Environment=PORT=5001

[Install]
WantedBy=multi-user.target
```

### Comandos de Gestión

```bash
# Iniciar
sudo systemctl start latconecta-vendor-simulator

# Detener
sudo systemctl stop latconecta-vendor-simulator

# Ver estado
sudo systemctl status latconecta-vendor-simulator

# Ver logs
sudo journalctl -u latconecta-vendor-simulator -f

# Ver log del archivo
tail -f /var/www/latconecta/vendor_simulator/vendor_simulator.log
```

### Verificar que funciona

```bash
curl http://localhost:5001/health
# Respuesta esperada: {"status": "ok", ...}
```

### Archivo .env del Backend

```bash
# Para usar el simulator:
VENDOR_SIMULATOR_ENABLED=True
VENDOR_SIMULATOR_URL=http://localhost:5001

# Para usar LATCOM real:
VENDOR_SIMULATOR_ENABLED=False
# (usa la URL configurada en la tabla vendors)
```

---

## DIFERENCIAS CON EL BACKEND MOCK <a name="diferencias"></a>

El sistema tiene dos componentes de simulación con propósitos distintos:

| Aspecto | Vendor Simulator (este doc) | Backend Mock (mock_vendors router) |
|---------|---------------------------|----------------------------------|
| Tipo | Servidor HTTP Flask independiente | Endpoints FastAPI integrados |
| Puerto | 5001 | 8100 (dentro del backend) |
| Propósito | Simula la API HTTP de LATCOM | Responde a requests internos del backend |
| Cuándo se usa | Cuando `VENDOR_SIMULATOR_ENABLED=True` | Llamadas desde `mock_vendors.py` (legado) |
| Control | ON/OFF via `.env` | Por operación via `OperationsConfigService` |

En el flujo actual (Latconecta v2.0.0):

- El **OperationsConfigService** decide si la operación está en Fase 1 o Fase 2
- Si está en **Fase 2**, `UniversalVendorService` hace la llamada HTTP real
  - Si `VENDOR_SIMULATOR_ENABLED=True` → la llamada va al **Vendor Simulator** (puerto 5001)
  - Si `VENDOR_SIMULATOR_ENABLED=False` → la llamada va al **LATCOM real**
- Si está en **Fase 1**, la respuesta es generada internamente por `OperationsConfigService` — el Vendor Simulator no participa

---

**FIN DEL DOCUMENTO 17**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 18-22 — Integración LATCOM/Relier*


---

<a name="18-latcom-readme"></a>

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

<a name="19-latcom-autenticacion"></a>

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

<a name="20-latcom-paises-operadores"></a>

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

<a name="21-latcom-topups"></a>

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

<a name="22-latcom-error-codes"></a>

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

<a name="23-flujos-de-negocio-completos"></a>

# DOCUMENTO 23
## FLUJOS DE NEGOCIO COMPLETOS

**Versión:** 4.3
**Fecha:** Junio 2026
**Sistema:** Latconecta v2.0.0

---

## CONTENIDO

1. [Flujo 1: Consulta de Catálogo](#catalogo)
2. [Flujo 2: Compra TopUp / Paquete (Fijo)](#compra-fija)
3. [Flujo 3: Compra Bill Payment (Variable)](#bill-payment)
4. [Flujo 4: Compra Smartphone (Delivery)](#smartphone)
5. [Flujo 5: Pago con Código de Barras](#barcode)
6. [Flujo 6: Pago con Tarjeta Izipay](#tarjeta)
7. [Flujo 7: Provisión con LATCOM / MEGAPUNTO](#provision)
8. [Flujo 8: Manejo de Error — Reversión Exitosa](#reversion-ok)
9. [Flujo 9: Manejo de Error — Intervención Manual](#intervencion)
10. [Flujo 10: Administración del Catálogo](#admin)

---

## FLUJO 1: CONSULTA DE CATÁLOGO <a name="catalogo"></a>

Sin autenticación requerida.

```
Usuario abre la aplicación
    ↓
GET /api/v1/latconecta → logo, nombre, fotos carrusel
WelcomeView: carousel automático con fotos de marketing
    ↓
Click "Comenzar"
    ↓
GET /api/v1/countries → lista de países activos
SelectView Paso 1: cards con banderas
    ↓
Usuario selecciona "Perú"
    ↓
GET /api/v1/services?country_id=1 → servicios disponibles para Perú
SelectView Paso 2: cards TopUps, Paquetes, Bill Payment, etc.
    ↓
Usuario selecciona "TopUps"
    ↓
GET /api/v1/companies?country_id=1&service_id=1 → Claro, Bitel, Entel, Movistar
SelectView Paso 3: cards con logos de operadoras
    ↓
Usuario selecciona "Bitel"
    ↓
Navigate → /shop?country=PE&service=TopUps&company=BITEL
GET /api/v1/products → filtrado por service_id y company_id
ShopView: grid con Recarga S/5, S/10, S/15, S/20, S/30
```

**Tiempo total esperado:** ~1 segundo desde WelcomeView hasta ver el catálogo.

---

## FLUJO 2: COMPRA TOPUP / PAQUETE (PRECIO FIJO) <a name="compra-fija"></a>

El flujo más común del sistema. Se ejecuta para productos con `product_amount_type = 'F'`.

```
Usuario hace click en "Comprar" en un ProductCard
    ↓
ShopView.handleProductClick() [async]:
    GET /api/v1/vendor-products/by-keys?vendor_code=MEGAPUNTO&vp_code=MP_BITEL&vp_skuid=66
    → vendorProduct: { vp_amount: NULL, vp_amount_type: 'range',
                       vp_minimum: 3.00, vp_maximum: 100.00, vp_currency: 'PEN' }
    Si product_currency != vp_currency → obtener TC_pricing
    Inicializar purchaseData con productType, exchangeRate, etc.
    ↓
PurchasePopup se abre directamente en STEP 2
(detalle del producto visible dentro del popup — sin modal intermedio)

STEP 2: Validación de teléfono
    → Input teléfono: "999999999"
    → Click "Validar"
    POST /api/v1/purchases/validate-phone?product_id=149&phone_number=999999999
    Backend: ops_config.is_fase1("val_telefono")
        Fase 1: respuesta simulada {valid: true}
        Fase 2: UniversalVendorService → validate_phone
    → Si válido: setPurchaseStep(3)
    ↓
STEP 3 (tipo F se salta — no hay selección de monto)
    ↓
STEP 4: Pago (automático o con selección)
    paymentConfig determina qué mostrar (paymentPhase):
    → Solo tarjeta (Perú): salta selección → abre CulqiCheckout directo
    → Ambos métodos: muestra selección [💳 Tarjeta] [📊 Barcode]
    → Sin métodos: error

    Con Culqi (caso actual Perú):
    - Popup Latconecta invisible (hiddenByculqi) mientras Culqi está activo
    - Pago exitoso → onResult() → provisión automática sin salida
    - Rechazo 1ra/2da vez → onRetry(mensaje) → popup muestra error + [Reintentar][Cancelar]
    - Rechazo 3ra vez → onAbort('max_retries') → mensaje final → catálogo
    - Cierre con X → onAbort('user_cancel') → closePurchasePopup()
    ↓
[Ver Flujo 6 para el pago con tarjeta]
    ↓
STEP 5: Procesando compra (spinner)
    POST /api/v1/purchases/create
    Body:
        product_id: 149
        product_type: 'topup'
        phone_number: '999999999'
        payment_method: 'card'
        user_selected_amount: null   ← null (no string vacío '') para tipo F
        exchange_rate: 1.0
        payment_gateway, payment_amount, payment_order_number, ... (datos de Izipay)

    Backend:
        1. PurchaseCalculatorService.calculate() → amount_type='F'
           _calculate_fixed_price():
               base_price = product.product_base_price = 15.00
               vendor_amount = product_base_price = 15.00  ← vp_amount es NULL en MEGAPUNTO
        2. Crea registro purchase en BD
        3. Provisiona con MEGAPUNTO/TISI (ver Flujo 7)
        4. Actualiza balance del vendor
    ↓
STEP 6: Resultado
    Éxito: confetti + referencia + vendor_trans_id + botón PDF
    Fallo: mensaje + referencia para soporte
```

---

## FLUJO 3: COMPRA BILL PAYMENT (VARIABLE) <a name="bill-payment"></a>

Tiene pasos adicionales para validar la cuenta y elegir el monto a pagar.

```
Usuario selecciona producto Bill Payment (type = V)
PurchasePopup abre

STEP 2: Ingreso de número de cuenta (no teléfono)
    Input: número de cuenta del servicio (ej: 123456789)
    Click "Validar cuenta"
    POST /api/v1/purchases/validate-account?product_id=X&account_number=123456789
    Backend: ops_config.is_fase1("val_cuenta")
        Fase 1: retorna {valid: true, monto_base: 8550.00, indicador: "R", account_holder: "Juan Pérez"}
        Fase 2: UniversalVendorService → val_cuenta
    ↓
STEP 2.6: Selección de monto (según indicador)
    Si indicador = "T" (Total obligatorio):
        → Muestra: "Deuda total: S/8,550.00 — Monto a pagar: S/8,550.00"
        → Sin opción de cambiar
        → payment_type = 'full'
    Si indicador = "R" (Rango):
        → Muestra slider: S/[mínimo] ───── S/8,550.00
        → Usuario elige: S/3,000.00
        → payment_type = 'partial'
        → billPaymentAmount = 3000.00
    Click "Continuar"
    ↓
STEP 4: Elegir pago + pre-fetch token
    [igual que Flujo 2 desde aquí]
    ↓
STEP 5: Crear purchase con:
    user_selected_amount: 3000.00     ← monto parcial elegido por el usuario
    payment_type: 'partial'
    bill_total_debt: 8550.00
    bill_currency: 'PEN'
    exchange_rate: 3.75 (si el vendor cobra en USD)

    Backend:
        _calculate_bill_payment():
            vendor_amount = bill_total_debt = 8550.00 ← MONTO EXACTO del validation
            (No reconvertir — la reconversión introduce pérdida de decimales)
```

---

## FLUJO 4: COMPRA SMARTPHONE (DELIVERY) <a name="smartphone"></a>

Agrega un paso de datos de entrega.

```
STEP 2: Validación de teléfono (igual que TopUps)
    ↓
STEP 2.5: Datos de entrega
    Formulario:
        Nombre del destinatario: [input]
        Teléfono de contacto:    [input]
        Dirección de entrega:    [textarea]
    Click "Continuar"
    ↓
STEP 4 → 5 → 6: Igual que TopUps
    Purchase incluye: delivery_name, delivery_phone, delivery_address
    El PDF de recibo incluye sección "DATOS DE ENTREGA"
```

---

## FLUJO 5: PAGO CON CÓDIGO DE BARRAS <a name="barcode"></a>

Alternativa al pago con tarjeta. Solo disponible si `company.company_barcode_available === 'Si'`.

```
Usuario elige "Código de barras" en STEP 4
Click "Procesar Compra"
    ↓
POST /api/v1/purchases/create con payment_method='barcode'
    ↓
Backend (Fase 2):
    barcode_service.generate_barcode(amount=19.00, reference=purchase_reference)
    → Llama a https://barcodeapi.org/api/128/{codigo}
    → Guarda imagen en uploads/barcodes/
    ↓
Purchase creada con:
    purchase_status = 'Pending'
    purchase_payment_status = 'Pending'
    purchase_barcode_code = "LC20260402143022001900"
    purchase_barcode_image = "/uploads/barcodes/bc_REF-xxx.png"
    ↓
STEP 6: Resultado
    [imagen del código de barras]
    Código: LC20260402143022001900
    Monto a pagar: S/19.00
    Instrucciones: "Presenta este código en cualquier agente autorizado"
    ↓
El usuario va físicamente a un agente a pagar
(El flujo de provisión se completa cuando el pago es confirmado)
```

---

## FLUJO 6: PAGO CON TARJETA IZIPAY <a name="tarjeta"></a>

Flujo detallado del pago con tarjeta en Fase 2 (Izipay real). Incorpora el pre-fetch de token implementado en Abril 2026.

```
[Al entrar al STEP 4, automáticamente en background]:
    orderNumber = "LC775192203123"   ← generado UNA sola vez, no cambia entre renders
    Promise.all([
        GET /api/v1/payments/config
        → { merchantCode: "4004353", keyRSA: "-----BEGIN...", sdkUrl: "https://..." }

        POST /api/v1/payments/token
        → { token: "eyJ...", transaction_id: "1775192203975" }
    ])
    Token y config quedan almacenados en estado React de PurchasePopup
    ↓
Usuario selecciona "Tarjeta" + click "Procesar Compra"
    ↓
IzipayCheckout se monta con autoStart=true + datos pre-fetchados
    ↓
LoadForm() se ejecuta inmediatamente al montarse (no al click de un segundo botón)
    iziConfig = {
        transactionId: "1775192203975",
        action: "pay",
        merchantCode: "4004353",
        order: {
            orderNumber: "LC775192203123",
            currency: "PEN",
            amount: "15.00",    ← string con 2 decimales (no número 15)
            processType: "AT",
            merchantBuyerId: "BUYER_1775192210631",
            dateTimeTransaction: "20260403043801"
        },
        appearance: { customize: { elements: [YAPE_CODE, PAGO_PUSH, CARD] } },
        billing: { firstName, lastName, email, phoneNumber, ... },
        render: { typeForm: "pop-up" }
    }
    ↓
SDK abre popup seguro de Izipay
Usuario ingresa datos de tarjeta / escanea QR Yape / Plin
    ↓
Izipay procesa el pago
SDK llama callbackResponsePayment() con:
    response.code = "00"   (éxito)
    response.payloadHttp = "{...json...}"
    response.signature = "base64..."
    ↓
POST /api/v1/payments/validate
    { order_number, transaction_id, payload_http, signature }
    Backend: verifica HMAC-SHA256(HMAC_KEY, payload_http) == signature
    Si válida: extrae { unique_id, authorization_code, transaction_datetime, pay_method, amount }
    ↓
Frontend recibe:
    { success: true, valid_signature: true, payment_status: "Autorizado",
      amount: "15.00", authorization_code: "S28441", unique_id: "450181031",
      transaction_datetime: "2026-04-02 23:04:40.000", pay_method: "CARD" }
    ↓
Frontend prepara cancelData (para reversión si la provisión falla):
    cancelData = {
        gateway: "izipay",
        transaction_id: "1775192203975",
        order_number: "LC775192203123",
        amount: "15.00",
        currency: "PEN",
        unique_id: "450181031",
        authorization_code: "S28441",
        transaction_datetime: "2026-04-02 23:04:40.000",
        pay_method: "CARD",
        channel: "ecommerce"
    }
    ↓
Frontend llama ShopView.handlePaymentAndProvision(gatewayData)
    ↓
POST /api/v1/purchases/create (con datos completos de Izipay)
    ↓
Backend: registra purchase + provisiona servicio
```

### Caso code="01" (COMMUNICATION_ERROR)

```
SDK retorna response.code = "01"
    → Fallo de conectividad entre browser y servidores Izipay
    → El pago NO fue procesado — no hay cargo al usuario
    → Frontend muestra error genérico
    → Usuario puede reintentar la compra
    → NO se llama al backend (no hubo pago)
```

### Caso: error backend post-pago Izipay

```
Izipay aprueba el pago (code="00") ✅
    ↓
POST /api/v1/purchases/create → 500 Internal Server Error ❌
    ↓
ShopView.handlePaymentAndProvision detecta: gatewayData != null
    → El pago ya se procesó por Izipay
    → NO volver al Step 4 (el usuario podría pagar de nuevo creyendo que no pagó)
    → Ir al Step 6 con mensaje de error claro:
        "Tu pago fue procesado por Izipay (orden: LC775192203123).
         Por favor contacta a soporte@latconecta.com con este número de orden."
    → purchase_result.requires_manual_intervention = true
```

---

## FLUJO 7: PROVISIÓN CON LATCOM / MEGAPUNTO <a name="provision"></a>

Ejecutado dentro de `purchases.py` → `POST /create`. El vendor activo determina qué API se llama.

```
purchases.py determina la operación de provisión:
    service_name = "TopUps"     → provision_operation = "provision_topup"
    service_name = "Paquetes"   → provision_operation = "provision_package"
    etc.
    ↓
ops_config.is_fase1("provision_topup") ?
    ↓
[FASE 1]                          [FASE 2]
Retorna respuesta simulada        UniversalVendorService.execute_vendor_request(
{                                     db,
    "success": True,                  vendor_code = product.product_vendor_code,
    "vendor_trans_id": "SIM-...",     api_group_code = vendorProduct.api_group_code,
    "purchase_delivery_status":       operation_type = "provision",
        "completed"                   source_data = {...}
}                                 )
    ↓                                 ↓
                              Busca mapping en BD:
                              vendor_api_mappings WHERE
                                  vendor_code = 'MEGAPUNTO' AND
                                  api_group_code = 'MP01T' AND
                                  operation_type = 'provision'
                                  ↓
                              VendorAPIMapper.build_request(source_data):
                                  {
                                    "id_producto": 66,      ← vp_skuid de MEGAPUNTO
                                    "importe": 15.00,       ← vendor_amount (= product_base_price)
                                    "numero": "999999999",
                                    "referencia": "REF-..."
                                  }
                                  ↓
                              httpx.post(
                                  url_megapunto_tisi,
                                  json=request,
                                  headers={...credenciales MEGAPUNTO...}
                              )
                                  ↓
                              MEGAPUNTO/TISI → operadora Bitel/Entel/Claro
                                  ↓
                              Response: { success: true, transaction_id: "MP-...", ... }
                                  ↓
                              VendorAPIMapper.parse_response() → campos para purchase
                                  ↓
                              is_success_response() → True
    ↓
purchases.py actualiza el registro:
    purchase.vendor_trans_id = "MP-20260402-1234"
    purchase.purchase_delivery_status = "completed"
    purchase.purchase_status = "Success"
    purchase.purchase_payment_status = "Success"
    vendor.vendor_local_balance -= 15.0
```

### Nota sobre vendor_amount en MEGAPUNTO

MEGAPUNTO usa una única API de rango por operadora (no SKUs por monto). El campo `vp_amount` en el `vendor_product` es NULL. El monto a enviar a la API (`importe`) es igual a `product_base_price` del producto de Latconecta:

```
Bitel S/15 → vendor_product MP_BITEL (vp_amount=NULL) → API recibe importe=15.00
Bitel S/20 → vendor_product MP_BITEL (vp_amount=NULL) → API recibe importe=20.00
```

Esto reduce 15 vendor_products a 3 (uno por operadora), manteniendo el mismo vendor_product para múltiples productos comerciales.

---

## FLUJO 8: MANEJO DE ERROR — REVERSIÓN EXITOSA <a name="reversion-ok"></a>

Escenario: pago exitoso, provisión fallida, reversión exitosa.

```
Pago con tarjeta procesado exitosamente:
    payment_status = 'Success'
    authorization_code = "AUTH123"
    ↓
Provisión LATCOM/MEGAPUNTO falla:
    resultado = {"success": False, "error": "TRANSACTION_FAILED"}
    ↓
purchases.py detecta: pago OK + provisión FAIL
    → Intenta reversión del pago
    ↓
ops_config.is_fase1("anulacion_tarjeta") ?
    Fase 1: simula reversión exitosa
    Fase 2: POST /api/v1/payments/cancel {gateway, transaction_id, unique_id, ...}
    ↓
Reversión exitosa:
    cancel_result = {"success": True, "cancel_id": "CANCEL-001"}
    ↓
purchase se actualiza:
    purchase.purchase_payment_status = "Reversed"
    purchase.purchase_status = "Failed"
    purchase.purchase_reversal_ref = "CANCEL-001"
    purchase.requires_manual_intervention = False
    ↓
STEP 6: Usuario ve mensaje:
    "Tu pago fue revertido exitosamente.
     No se realizó ningún cargo a tu cuenta.
     Referencia: REF-20260325143022"
```

---

## FLUJO 9: MANEJO DE ERROR — INTERVENCIÓN MANUAL <a name="intervencion"></a>

Escenario crítico: pago exitoso, provisión fallida, reversión también fallida.

```
Pago con tarjeta procesado exitosamente
    ↓
Provisión falla
    ↓
Intento de reversión del pago → también falla
    cancel_result = {"success": False, "error": "TIMEOUT"}
    ↓
purchase se actualiza:
    purchase.purchase_payment_status = "Success"  ← cobrado pero sin servicio
    purchase.purchase_status = "Failed"
    purchase.requires_manual_intervention = TRUE  ← FLAG CRÍTICO
    ↓
STEP 6: Usuario ve mensaje:
    "Hubo un problema procesando tu compra.
     Nuestro equipo de soporte te contactará.
     Referencia: REF-20260325143022
     Conserva este número de referencia."
    ↓
Admin en SalesTab:
    Ve la compra marcada con ⚠️ "Requiere Intervención Manual"
    Puede ver:
        - vendor_request (qué se envió a LATCOM/MEGAPUNTO)
        - vendor_response (por qué falló)
        - payment details (cuánto se cobró y cuándo)
    Acciones manuales:
        - Contactar al vendor para resolver la provisión
        - O procesar reembolso manual al cliente
        - Marcar como resuelto cuando se complete
```

### Escenario especial — error backend post-pago sin registrar purchase

Si el backend falla con 500 antes de crear el registro de purchase (ej: error en el calculador de precios), el flujo en el frontend es:

```
Izipay aprueba el pago ✅
    ↓
POST /api/v1/purchases/create → 500 ❌ (ningún registro creado en BD)
    ↓
ShopView detecta gatewayData != null
    → Muestra en Step 6:
        "Tu pago fue procesado por Izipay (orden: LC775192203123).
         Por favor contacta a soporte@latconecta.com."
    → requires_manual_intervention = true
    → El admin debe:
        1. Verificar en el panel de Izipay que el pago fue cobrado
        2. Crear el registro de purchase manualmente o via SQL
        3. Ejecutar la provisión manualmente
        4. O iniciar la cancelación en Izipay directamente
```

---

## FLUJO 10: ADMINISTRACIÓN DEL CATÁLOGO <a name="admin"></a>

```
Admin abre Frontend Admin (https://77.42.92.151/latconecta_admin)
    ↓
Login: POST /api/v1/auth/login
    {email: "admin@bitel.com.pe", password: "admin123"}
    ← {access_token: "eyJ...", user: {role: "superadmin"}}
    ↓
ProtectedRoute verifica role → OK → LatconectaAdmin renderiza
    ↓
Ejemplo: Agregar nuevo producto TopUp MEGAPUNTO

    1. Click tab "Products"
       GET /api/v1/products → lista actual

    2. Click "+ Nuevo Producto"
       Formulario:
         País: Perú
         Servicio: TopUps
         Compañía: Bitel
         Código: BITEL_PE_30
         Nombre: Recarga Bitel S/30
         Moneda: PEN
         Tipo: F (Fijo)
         Precio base: 30.00
         Descuento: 0%
         Fee: 0.00
         Total: 30.00
         Vendor Code: MEGAPUNTO
         VP Code: MP_BITEL        ← mismo para todos los montos Bitel
         VP SKU ID: 66            ← mismo skuid de la API de rango MEGAPUNTO
         Foto: [upload]

    3. Click "Guardar"
       POST /api/v1/products {datos}
       Backend valida + inserta en BD
       Nota: vp_amount del vendor_product MP_BITEL es NULL —
             el calculador usará product_base_price (30.00) como vendor_amount

    4. El producto ya es visible en el Frontend Users
       para usuarios que navegan Perú → TopUps → Bitel
```

---

## TIEMPOS DE RESPUESTA ESPERADOS

| Operación | Tiempo backend | Tiempo total (con frontend) |
|-----------|---------------|----------------------------|
| GET /countries | < 50ms | < 200ms |
| GET /services | < 60ms | < 220ms |
| GET /products | < 100ms | < 350ms |
| POST validate-phone (Fase 1) | < 20ms | < 100ms |
| POST validate-phone (Fase 2, LATCOM/MEGAPUNTO) | 500–2000ms | 1–3s |
| POST payments/token (Izipay) | 500–1500ms | 1–2.5s |
| Pre-fetch token (background en Step 4) | 500–1500ms | Transparente al usuario |
| POST purchases/create (Fase 1) | < 100ms | < 300ms |
| POST purchases/create (Fase 2, LATCOM/MEGAPUNTO) | 1–5s | 2–7s |

---

**FIN DEL DOCUMENTO 23**

*Versión: 4.1 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 24 — Guía del Desarrollador*


*Cambios v4.3: Step 4 actualizado — paymentPhase con salto automático, hiddenByculqi, onRetry/onAbort Culqi. Flujo 2: eliminado ProductDetailModal, handleProductClick async directo a Step 2.*

---

<a name="24-guia-del-desarrollador"></a>

# DOCUMENTO 24
## GUÍA DEL DESARROLLADOR

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Audiencia:** Desarrolladores Full Stack

---

## CONTENIDO

1. [Entorno de Desarrollo](#entorno)
2. [Estructura del Proyecto](#estructura)
3. [Patrones de Código Backend](#patrones-backend)
4. [Patrones de Código Frontend](#patrones-frontend)
5. [Convenciones y Estándares](#convenciones)
6. [Flujo de Trabajo](#workflow)
7. [Tareas Comunes](#tareas-comunes)
8. [Debugging](#debugging)
9. [Reglas Críticas](#reglas)

---

## ENTORNO DE DESARROLLO <a name="entorno"></a>

### Prerrequisitos

```
Python 3.11.7
PostgreSQL 14+
Node.js 18+
Git
```

### Configuración Inicial (PC local)

```bash
# 1. Clonar/descargar el repositorio
git clone [repo-url] latconecta_full_entorno
cd latconecta_full_entorno

# 2. Backend
cd backend
python -m venv .venv
source .venv/bin/activate          # Linux/Mac
# .venv\Scripts\activate           # Windows
pip install -r requirements.txt
cp .env.example .env               # Editar con tus configuraciones
uvicorn app.main:app --reload --port 8100

# 3. Vendor Simulator (en otra terminal)
cd vendor_simulator
python -m venv .venv
source .venv/bin/activate
pip install flask
python vendor_simulator.py

# 4. Frontend Admin (en otra terminal)
cd latconecta_admin
npm install
npm run dev                        # http://localhost:5173

# 5. Frontend Users (en otra terminal)
cd latconecta_users
npm install
npm run dev                        # http://localhost:5174
```

### .env para Desarrollo

```bash
# backend/.env — configuración mínima para desarrollo local
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/latconecta_db
SECRET_KEY=mi_clave_secreta_desarrollo_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

ENVIRONMENT=development
DEPLOYMENT_COUNTRY=PE
PAYMENT_GATEWAY=izipay

VENDOR_SIMULATOR_ENABLED=True
VENDOR_SIMULATOR_URL=http://localhost:5001
ENABLE_VENDOR_LOGIN=False

IZIPAY_API_URL=https://sandbox-api-pw.izipay.pe
IZIPAY_MERCHANT_CODE=4004353
IZIPAY_API_KEY=VErethUtraQuxas57wuMuquprADrAHAb
IZIPAY_HMAC_SHA256=Xom5Hlt9eSWoylYuBrenIbOsTljEdefR
IZIPAY_TOKEN_ENDPOINT=/security/v1/Token/Generate
IZIPAY_CANCEL_PATH=/cancel/api/Transaction/Cancel
IZIPAY_RSA_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMIIB...

LOG_LEVEL=DEBUG
DEBUG=True
```

### Verificación del Entorno

```bash
# Backend corriendo:
curl http://localhost:8100/health
# → {"status": "ok", "environment": "development"}

# Vendor Simulator:
curl http://localhost:5001/health
# → {"status": "ok", "service": "Latconecta Vendor Simulator"}

# Swagger docs:
# Abrir: http://localhost:8100/docs
```

---

## ESTRUCTURA DEL PROYECTO <a name="estructura"></a>

```
latconecta_full_entorno/
├── backend/
│   ├── app/
│   │   ├── main.py           # Entry point FastAPI
│   │   ├── config.py         # Settings (pydantic-settings)
│   │   ├── database.py       # Conexión async PostgreSQL
│   │   ├── dependencies.py   # Auth dependencies
│   │   ├── events.py         # Startup/shutdown
│   │   ├── routers/          # 16 routers activos
│   │   ├── models/           # 11 SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # 14 servicios de negocio
│   │   ├── payments/         # Gateway Izipay
│   │   └── barcode/          # Generación barcodes
│   ├── .env                  # NO en git
│   ├── requirements.txt
│   └── .venv/
├── latconecta_admin/
│   ├── src/
│   ├── .env                  # NO en git
│   ├── package.json
│   └── vite.config.js
├── latconecta_users/
│   ├── src/
│   ├── .env                  # NO en git
│   ├── package.json
│   └── vite.config.js
└── vendor_simulator/
    ├── vendor_simulator.py
    └── .venv/
```

---

## PATRONES DE CÓDIGO BACKEND <a name="patrones-backend"></a>

### 1. Endpoint Async Estándar

```python
# routers/countries.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.dependencies import get_current_admin_user
from app.models.country import Country
from app.schemas.country import CountryCreate, CountryResponse
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=CountryResponse, status_code=201)
async def create_country(
    country_data: CountryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Verificar duplicados
    existing = await db.execute(
        select(Country).where(Country.country_code == country_data.country_code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Código de país ya existe")

    # Crear
    country = Country(**country_data.model_dump())
    country.created_by = current_user.user_email
    db.add(country)
    await db.commit()
    await db.refresh(country)
    return country
```

### 2. Consulta con Filtros

```python
@router.get("/", response_model=list[CountryResponse])
async def list_countries(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    query = select(Country)
    if status:
        query = query.where(Country.status == status)
    query = query.offset(skip).limit(limit).order_by(Country.country_id)

    result = await db.execute(query)
    return result.scalars().all()
```

### 3. Acceso a Configuración

```python
# SIEMPRE usar settings, NUNCA os.getenv()
from app.config import settings

url = settings.IZIPAY_TOKEN_ENDPOINT  # ✅
url = os.getenv("IZIPAY_TOKEN_ENDPOINT")  # ❌ — Pydantic lo oculta
```

### 4. Llamadas HTTP Async

```python
import httpx

async def call_external_api(url: str, data: dict, headers: dict) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        try:
            response = await client.post(url, json=data, headers=headers)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            return {"success": False, "error": "TIMEOUT"}
        except httpx.HTTPStatusError as e:
            return {"success": False, "error": str(e.response.status_code)}
```

---

## PATRONES DE CÓDIGO FRONTEND <a name="patrones-frontend"></a>

### 1. Servicio API

```javascript
// services/productsService.js
import apiClient from '../config/api'

const productsService = {
  getAll: (params = {}) =>
    apiClient.get('/products', { params }).then(r => r.data),

  getById: (id) =>
    apiClient.get(`/products/${id}`).then(r => r.data),

  create: (data) =>
    apiClient.post('/products', data).then(r => r.data),

  update: (id, data) =>
    apiClient.put(`/products/${id}`, data).then(r => r.data),

  delete: (id) =>
    apiClient.delete(`/products/${id}`).then(r => r.data),
}

export default productsService
```

### 2. Componente Tab CRUD

```jsx
function ProductsTab() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const { showSuccess, showError } = useNotification()

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await productsService.getAll()
      setProducts(data)
    } catch (err) {
      showError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    try {
      if (editing) {
        await productsService.update(editing.product_id, formData)
        showSuccess('Producto actualizado')
      } else {
        await productsService.create(formData)
        showSuccess('Producto creado')
      }
      setShowModal(false)
      loadProducts()
    } catch (err) {
      showError(err.response?.data?.detail || 'Error al guardar')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await productsService.delete(id)
      showSuccess('Producto eliminado')
      loadProducts()
    } catch (err) {
      showError('Error al eliminar')
    }
  }

  return (
    <div>
      {/* Tabla + botones */}
      {/* Modal de formulario */}
    </div>
  )
}
```

---

## CONVENCIONES Y ESTÁNDARES <a name="convenciones"></a>

### Backend (Python)

| Aspecto | Convención | Ejemplo |
|---------|-----------|---------|
| Nombres de archivos | snake_case | `purchase_calculator_service.py` |
| Nombres de clases | PascalCase | `PurchaseCalculatorService` |
| Nombres de funciones | snake_case | `get_exchange_rate()` |
| Constantes | UPPER_SNAKE_CASE | `ACCESS_TOKEN_EXPIRE_MINUTES` |
| Rutas de endpoints | kebab-case | `/vendor-api-mappings/` |
| Prefijos de router | Siempre incluir `/api/v1/` en el prefix del router |

### Frontend (JavaScript/JSX)

| Aspecto | Convención | Ejemplo |
|---------|-----------|---------|
| Nombres de archivos | PascalCase (componentes) | `ProductsTab.jsx` |
| Nombres de archivos | camelCase (services/hooks) | `productsService.js` |
| Componentes | PascalCase | `function ProductCard()` |
| Hooks | camelCase con prefijo use | `useNotification()` |
| Variables | camelCase | `const selectedProduct` |
| Handlers | handleVerb | `handleCreate`, `handleDelete` |
| Estado booleano | is/has/show | `isLoading`, `showModal` |

### Base de Datos

| Aspecto | Convención | Ejemplo |
|---------|-----------|---------|
| Nombres de tablas | snake_case, plural | `vendor_products` |
| Nombres de campos | tabla_campo | `purchase_status`, `vendor_code` |
| PKs autoincrement | tabla_id | `product_id`, `purchase_id` |
| PKs string | campo natural | `vendor_code`, `country_code` |
| Campos de auditoría | created_by, updated_by, last_update_date | (siempre presentes) |

---

## FLUJO DE TRABAJO <a name="workflow"></a>

### Desarrollo Normal

```
1. Desarrollar y probar en PC local
   → Backend en localhost:8100
   → Vendor Simulator en localhost:5001
   → Frontends en localhost:5173/5174
   → Todas las operaciones en Fase 1
   ↓
2. Hacer build de frontends que cambiaron
   cd latconecta_admin && npm run build
   cd latconecta_users && npm run build
   ↓
3. Subir al servidor (git push o scp)
   git add . && git commit -m "Descripción del cambio"
   git push origin main
   ↓
4. En el servidor, hacer pull y reiniciar
   cd /var/www/latconecta
   git pull
   sudo systemctl restart latconecta-backend
   ↓
5. Probar en servidor con LATCOM UAT
   → Cambiar operaciones a Fase 2 desde OperationsPanel
   → Verificar que las transacciones funcionan
```

### Al Agregar Nuevo Endpoint

```
1. Definir el schema Pydantic (request/response)
2. Agregar el endpoint al router existente (o crear nuevo)
3. Registrar el router en main.py si es nuevo
4. Probar con Swagger (/docs)
5. Agregar el service correspondiente en el frontend
6. Probar en el componente
```

### Al Agregar Nuevo Vendor

Seguir exactamente la guía del DOC 08 (API Mappings). Resumen:
1. INSERT en vendors
2. INSERT en vendor_products (con api_group_code)
3. INSERT en vendor_api_mappings (provision + validation)
4. UPDATE en products (product_vendor_code, product_vendpro_code, product_vendpro_skuid)
5. Probar con `POST /vendor-api-mappings/{id}/test`

---

## TAREAS COMUNES <a name="tareas-comunes"></a>

### Reiniciar Backend en Servidor

```bash
sudo systemctl restart latconecta-backend
sudo systemctl status latconecta-backend
sudo journalctl -u latconecta-backend -f  # Ver logs en tiempo real
```

### Reconstruir Frontend en Servidor

```bash
cd /var/www/latconecta/latconecta_admin
npm run build

cd /var/www/latconecta/latconecta_users
npm run build
# No requiere reiniciar nada — Nginx sirve los nuevos archivos inmediatamente
```

### Ver Logs del Backend

```bash
# Logs del sistema:
sudo journalctl -u latconecta-backend --since "1 hour ago"

# Logs en tiempo real:
sudo journalctl -u latconecta-backend -f
```

### Consultar BD Directamente

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql latconecta_db

# Consultas útiles:
\dt                    # Listar tablas
\d purchases           # Estructura de purchases
SELECT COUNT(*) FROM purchases;
SELECT * FROM purchases ORDER BY purchase_date DESC LIMIT 5;
SELECT * FROM purchases WHERE requires_manual_intervention = true;
```

### Backup de BD

```bash
pg_dump -U postgres latconecta_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## DEBUGGING <a name="debugging"></a>

### Problema: Backend no arranca

```bash
# Ver el error específico:
sudo journalctl -u latconecta-backend -n 50

# Causas comunes:
# 1. Error en .env → verificar DATABASE_URL y variables requeridas
# 2. Puerto 8100 ocupado → sudo lsof -i :8100 → matar proceso
# 3. Error de importación Python → activar venv y correr manualmente:
cd /var/www/latconecta/backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8100
```

### Problema: Frontend muestra error CORS

```bash
# El backend debe estar corriendo en el puerto correcto
# Verificar VITE_API_BASE_URL en el .env del frontend
# Reconstruir el frontend si se cambió el .env:
npm run build
```

### Problema: Transacción LATCOM falla

```sql
-- Ver los últimos purchases con su request y response:
SELECT
    purchase_id,
    purchase_reference,
    purchase_status,
    purchase_vendor_response_code,
    purchase_vendor_response_description,
    vendor_request,
    vendor_response
FROM purchases
ORDER BY purchase_date DESC
LIMIT 5;
```

### Problema: Token Izipay inválido

```bash
# Verificar que el .env tiene las credenciales correctas (sandbox vs prod):
grep IZIPAY backend/.env

# Verificar que IZIPAY_TOKEN_ENDPOINT es ruta, no URL completa:
# Correcto: /security/v1/Token/Generate
# Incorrecto: https://sandbox-api-pw.izipay.pe/security/v1/Token/Generate
```

---

## REGLAS CRÍTICAS <a name="reglas"></a>

Estas reglas nunca deben violarse. Cada una tiene historia detrás que costó tiempo resolver.

### 1. NUNCA código de credenciales en source

```python
# ❌ NUNCA
LATCOM_API_KEY = "latcom_peru_mli4fpwc_xx62baa0"

# ✅ SIEMPRE
api_key = settings.LATCOM_API_KEY  # o desde la BD
```

### 2. NUNCA os.getenv() en el backend

```python
# ❌ Pydantic Settings lo oculta
import os
key = os.getenv("IZIPAY_API_KEY")  # Retorna None

# ✅ Siempre
from app.config import settings
key = settings.IZIPAY_API_KEY
```

### 3. NUNCA endpoint URL completa en variables de ruta

```bash
# ❌ Double concatenation — resultado: "https://...https://..."
IZIPAY_TOKEN_ENDPOINT=https://sandbox-api-pw.izipay.pe/security/v1/Token/Generate

# ✅ Solo la ruta
IZIPAY_TOKEN_ENDPOINT=/security/v1/Token/Generate
```

### 4. NUNCA sinónimos en service_name

Los nombres de servicio deben ser exactamente los 5 valores definidos. Si cambian, rompen la lógica de validación y provisión:

```
# ✅ Valores válidos exactos:
"TopUps", "Paquetes", "Bill Payment", "Transfers", "Smartphones"

# ❌ No usar: "Recargas", "TopUp", "Bills", "top_ups", etc.
```

### 5. SIEMPRE usar HTTPS para el SDK de Izipay

La Web Crypto API (`crypto.subtle`) usada por el SDK de Izipay **no funciona en HTTP**. El servidor siempre debe servir el frontend con HTTPS.

### 6. country_code en BD siempre alpha-3

La BD usa PER, MEX, VEN. Si necesitas alpha-2 para un vendor, usa la transformación `country_alpha3_to_alpha2` en el mapping — no cambies los datos en BD.

---

**FIN DEL DOCUMENTO 24**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 25 — Guía de API Mappings para Desarrolladores*


---

<a name="25-guia-api-mappings-desarrolladores"></a>

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

<a name="26-guia-capacitacion-api-mappings"></a>

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

<a name="27-configuracion-sistema"></a>

# DOCUMENTO 27
## CONFIGURACIÓN DEL SISTEMA

**Versión:** 4.5
**Fecha:** Junio 2026
**Sistema:** Latconecta v2.0.0

---

## PRINCIPIO DE CONFIGURACIÓN

El sistema sigue el principio de **ambiente como configuración** — el mismo código funciona en los tres ambientes, solo cambia el `.env`:

```
❌ Credenciales en código
✅ Credenciales en variables de entorno

❌ if ambiente == "prod": hacer X
✅ if settings.ENABLE_VENDOR_LOGIN: hacer X

❌ .env en Git
✅ .gitignore incluye .env
```

---

## VARIABLES DE CONTROL DE VENDORS

Estas dos variables son las más importantes para el comportamiento del sistema con los vendors externos:

### ENABLE_VENDOR_LOGIN

| Valor | Comportamiento |
|-------|---------------|
| `False` | El backend arranca sin ejecutar login. No hay tokens de vendor en memoria. Usar con `VENDOR_SIMULATOR_ENABLED=True` en desarrollo. |
| `True` | Al arrancar, el backend ejecuta `initial_vendor_login()` para todos los vendors activos. MEGAPUNTO obtiene su JWT Bearer. El scheduler renueva tokens cada 5 min. Usar en UAT y Producción. |

### OPS_PANEL_PIN

PIN de acceso al OperationsPanel. Se envía en header `X-Ops-Pin` desde el frontend.

| Valor | Comportamiento |
|-------|---------------|
| `""` (vacío) | Panel deshabilitado — backend rechaza cualquier request (producción) |
| `"1234"` (cualquier string) | Panel habilitado — solo quien tenga el PIN puede cambiar F1/F2 |

**En producción:** dejar vacío o no definir.

---

### VENDOR_SIMULATOR_ENABLED

| Valor | Comportamiento |
|-------|---------------|
| `True` | Todas las llamadas de provisión van a `VENDOR_SIMULATOR_URL` (Flask local). Los vendors reales nunca reciben requests. Permite desarrollo y testing sin consumir saldo real. |
| `False` | Las llamadas van a las URLs reales de los vendors (`vendor_url_uat` o `vendor_url_prod` según `is_production` en BD). Usar en UAT y Producción. |

### Combinaciones Recomendadas

| Ambiente | ENABLE_VENDOR_LOGIN | VENDOR_SIMULATOR_ENABLED |
|----------|---------------------|--------------------------|
| Development (PC) | `False` | `True` |
| UAT (CalmetServer) | `True` | `False` |
| Production | `True` | `False` |

---

## VARIABLES DE MÉTODOS DE PAGO POR INSTALACIÓN

Estas variables determinan qué métodos de pago se ofrecen según el país de instalación. Son independientes del sistema de control de operaciones (fase1/fase2), que es exclusivo de desarrollo y UAT.

### CARD_AVAILABLE

| Valor | Comportamiento |
|-------|---------------|
| `True` | El país/instalación tiene gateway de tarjeta activo. El frontend muestra la opción de pago con tarjeta. |
| `False` | No se ofrece pago con tarjeta en este país/instalación. |

### BARCODE_AVAILABLE

Control de **primer nivel** (por país/instalación). Debe ser `True` para que el barcode sea posible. El control de **segundo nivel** es el campo `company_barcode_available` en la tabla `companies` de la BD, que define qué operadoras específicas aceptan barcode.

La condición completa para mostrar la opción barcode al usuario:
```
BARCODE_AVAILABLE=True  (nivel país — .env)
AND
company.company_barcode_available='Si'  (nivel operadora — BD)
```

| Valor | Comportamiento |
|-------|---------------|
| `True` | El país/instalación opera con pago por código de barras. El control granular queda en `company_barcode_available`. |
| `False` | No se ofrece barcode en este país/instalación, independientemente de lo que diga `company_barcode_available`. |

### Disponibilidad por País

| País | `CARD_AVAILABLE` | `BARCODE_AVAILABLE` | Gateway tarjeta |
|------|:---:|:---:|---|
| Perú (PE) | `True` | `True` | Izipay |
| México (MX) — futuro | `True` | `False` | Conekta |
| USA (US) — futuro | `True` | `False` | Stripe |

### Mecanismo de publicación al frontend

Estas variables se exponen al frontend a través del endpoint `GET /api/v1/payments/config`:

```json
{
  "gateway": "izipay",
  "card_available": true,
  "barcode_available": true,
  "merchantCode": "...",
  "keyRSA": "...",
  "environment": "sandbox",
  "sdkUrl": "https://sandbox-checkout.izipay.pe/payments/v1/js/index.js"
}
```

El frontend `PurchasePopup.jsx` lee `card_available` y `barcode_available` de esta respuesta para decidir qué métodos mostrar al usuario. No contiene lógica de país — toda la lógica de país vive en el backend.

---

## VARIABLES DE ENTORNO — BACKEND

### backend/.env (Development — PC local)

```bash
# ── APLICACIÓN ─────────────────────────────────────────
APP_NAME=Latconecta API
APP_VERSION=2.0.0
ENVIRONMENT=development
DEBUG=True
LOG_LEVEL=DEBUG

# ── BASE DE DATOS ───────────────────────────────────────
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/latconecta_db

# ── SEGURIDAD JWT ───────────────────────────────────────
SECRET_KEY=mi_clave_secreta_desarrollo_minimo_32_chars_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# ── CORS ────────────────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# ── AMBIENTE Y PAÍS DE INSTALACIÓN ──────────────────────
DEPLOYMENT_COUNTRY=PE
PAYMENT_GATEWAY=izipay

# ── MÉTODOS DE PAGO DISPONIBLES EN ESTA INSTALACIÓN ─────
# Controlan qué métodos se ofrecen según país de instalación.
# Independientes del sistema de operaciones (fase1/fase2).
CARD_AVAILABLE=True
BARCODE_AVAILABLE=True

# ── VENDOR SIMULATOR ────────────────────────────────────
# True en desarrollo: las llamadas van al simulador local Flask (localhost:5001)
VENDOR_SIMULATOR_ENABLED=True
VENDOR_SIMULATOR_URL=http://localhost:5001
OPS_PANEL_PIN=lc2026

# ── VENDOR LOGIN ────────────────────────────────────────
# False en desarrollo: no ejecuta login real al startup
ENABLE_VENDOR_LOGIN=False

# ── IZIPAY ──────────────────────────────────────────────
IZIPAY_API_URL=https://sandbox-api-pw.izipay.pe
IZIPAY_MERCHANT_CODE=4004353
IZIPAY_API_KEY=VErethUtraQuxas57wuMuquprADrAHAb
IZIPAY_HMAC_SHA256=Xom5Hlt9eSWoylYuBrenIbOsTljEdefR
IZIPAY_TOKEN_ENDPOINT=/security/v1/Token/Generate
IZIPAY_CANCEL_PATH=/cancel/api/Transaction/Cancel
IZIPAY_RSA_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9...\n-----END PUBLIC KEY-----

# ── SMTP — RECUPERACIÓN DE CONTRASEÑA ───────────────────
# Configurar con Gmail App Password (myaccount.google.com/apppasswords)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=latconecta.digital@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME=LatConecta

# ── UPLOADS ─────────────────────────────────────────────
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=5242880
```

### backend/.env (UAT — CalmetServer Ubuntu)

```bash
DATABASE_URL=postgresql+asyncpg://latconecta_user:pass@localhost:5432/latconecta_db
SECRET_KEY=clave_secreta_uat_diferente_a_dev_minimo_32_chars
ENVIRONMENT=uat
DEBUG=False
LOG_LEVEL=INFO

DEPLOYMENT_COUNTRY=PE
PAYMENT_GATEWAY=izipay

# Métodos de pago — Perú tiene tarjeta y barcode
CARD_AVAILABLE=True
BARCODE_AVAILABLE=True

# UAT: llamadas van al vendor real
VENDOR_SIMULATOR_ENABLED=False
VENDOR_SIMULATOR_URL=http://localhost:5001

# UAT: login automático Bearer con MEGAPUNTO al startup
ENABLE_VENDOR_LOGIN=True

# Izipay sandbox para UAT
IZIPAY_API_URL=https://sandbox-api-pw.izipay.pe
IZIPAY_MERCHANT_CODE=4004353
IZIPAY_API_KEY=VErethUtraQuxas57wuMuquprADrAHAb
IZIPAY_HMAC_SHA256=Xom5Hlt9eSWoylYuBrenIbOsTljEdefR
IZIPAY_TOKEN_ENDPOINT=/security/v1/Token/Generate
IZIPAY_CANCEL_PATH=/cancel/api/Transaction/Cancel
IZIPAY_RSA_PUBLIC_KEY=...

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=latconecta.digital@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME=LatConecta
```

### backend/.env (Production — CalmetServer Ubuntu)

```bash
DATABASE_URL=postgresql+asyncpg://latconecta_user:pass@localhost:5432/latconecta_db
SECRET_KEY=clave_secreta_PRODUCCION_diferente_a_todas_las_demas
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=WARNING

DEPLOYMENT_COUNTRY=PE
PAYMENT_GATEWAY=izipay

CARD_AVAILABLE=True
BARCODE_AVAILABLE=True

VENDOR_SIMULATOR_ENABLED=False
ENABLE_VENDOR_LOGIN=True

# Izipay PRODUCCIÓN — claves del Back Office Vendedor
IZIPAY_API_URL=https://api-pw.izipay.pe
IZIPAY_MERCHANT_CODE=CODIGO_PRODUCCION
IZIPAY_API_KEY=API_KEY_PRODUCCION
IZIPAY_HMAC_SHA256=HMAC_KEY_PRODUCCION
IZIPAY_TOKEN_ENDPOINT=/security/v1/Token/Generate
IZIPAY_CANCEL_PATH=/cancel/api/Transaction/Cancel
IZIPAY_RSA_PUBLIC_KEY=...

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=latconecta.digital@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM_NAME=LatConecta
```

### Nota sobre credenciales de vendors en .env vs BD

Las credenciales de LATCOM y MEGAPUNTO **no se configuran en `.env`** — se almacenan directamente en la tabla `vendors` de la BD. El `.env` solo controla el comportamiento del sistema.

| Vendor | Dónde están las credenciales |
|--------|------------------------------|
| LATCOM | BD: `vendors.vendor_api_key`, `vendors.vendor_user_uid`, `vendors.vendor_username` |
| MEGAPUNTO | BD: `vendors.vendor_username` (LA2410), `vendors.vendor_password`, `vendors.vendor_url_uat` |
| Izipay | `.env`: `IZIPAY_API_KEY`, `IZIPAY_HMAC_SHA256`, etc. |
| SMTP (email) | `.env`: `SMTP_USER`, `SMTP_PASSWORD`, etc. |

---

## VARIABLES DE ENTORNO — FRONTENDS

### latconecta_admin/.env

```bash
# Development
VITE_API_BASE_URL=http://localhost:8100/api/v1

# Servidor (crear .env.local o usar .env para build)
VITE_API_BASE_URL=https://77.42.92.151:8100/api/v1
```

### latconecta_users/.env

```bash
# Development
VITE_API_BASE_URL=http://localhost:8100/api/v1

# Servidor
VITE_API_BASE_URL=https://77.42.92.151:8100/api/v1
```

---

## CONFIGURACIÓN NGINX (Servidor)

### /etc/nginx/sites-available/latconecta

```nginx
server {
    listen 443 ssl;
    server_name 77.42.92.151;

    ssl_certificate     /etc/ssl/certs/latconecta-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/latconecta-selfsigned.key;

    # Frontend Admin
    location /latconecta_admin {
        alias /var/www/latconecta/latconecta_admin/dist;
        try_files $uri $uri/ /latconecta_admin/index.html;
        index index.html;
    }

    # Frontend Users
    location /latconecta_users {
        alias /var/www/latconecta/latconecta_users/dist;
        try_files $uri $uri/ /latconecta_users/index.html;
        index index.html;
    }

    # Uploads (imágenes)
    location /uploads {
        alias /var/www/latconecta/backend/uploads;
        add_header Access-Control-Allow-Origin *;
    }
}

# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name 77.42.92.151;
    return 301 https://$host$request_uri;
}
```

---

## CONFIGURACIÓN SYSTEMD

### latconecta-backend.service (CalmetServer actual)

```ini
[Unit]
Description=Latconecta Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=jcalmett
Group=jcalmett
WorkingDirectory=/var/www/latconecta/backend
Environment="PATH=/var/www/latconecta/backend/.venv/bin"
ExecStart=/var/www/latconecta/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8100
Restart=always
RestartSec=10
StandardOutput=append:/var/log/latconecta/backend.log
StandardError=append:/var/log/latconecta/backend-error.log

[Install]
WantedBy=multi-user.target
```

**Nota:** Los logs del backend se escriben en `/var/log/latconecta/backend.log`. Para consultarlos:
```bash
tail -f /var/log/latconecta/backend.log
grep "MEGAPUNTO\|LATCOM\|ERROR" /var/log/latconecta/backend.log | tail -50
```

---

## FIREWALL (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP (redirige a HTTPS)
sudo ufw allow 443/tcp   # HTTPS (Nginx + frontends)
sudo ufw allow 8100/tcp  # Backend API (acceso directo para debugging)
```

---

## VARIABLES DE CONTROL DE SINCRONIZACIÓN DE CATÁLOGO

### auto_sync_products (en tabla vendors)

| Valor | Comportamiento |
|-------|---------------|
| `false` (default) | El scheduler no ejecuta sync automático. El admin puede hacer sync manual desde el panel. Usar en desarrollo y UAT. |
| `true` | El scheduler ejecuta sync automático todos los días a la hora configurada en `sync_time`. Usar solo en Producción. |

### sync_time (en tabla vendors)

Hora del día en que se ejecuta el sync automático. Formato `HH:MM`. Default: `'06:00'`.

**Consideración de zona horaria:** Si el servidor está en UTC y se desea sync a las 6:00 AM Lima (UTC-5), configurar `sync_time = '11:00'`.

---

## CHECKLIST COMPLETO DE PASO A PRODUCCIÓN

### 1. Variables de entorno (.env)

```bash
ENVIRONMENT=production
ENABLE_VENDOR_LOGIN=true
VENDOR_SIMULATOR_ENABLED=false
CARD_AVAILABLE=True
BARCODE_AVAILABLE=True    # Ajustar según país
```

### 2. BD — Vendors (credenciales de producción)

```sql
-- MEGAPUNTO producción
UPDATE vendors SET
    vendor_url_prod  = 'https://api-hub-in.tisi.com.pe/',
    vendor_username  = 'USUARIO_PROD',
    vendor_password  = 'PASSWORD_PROD',
    is_production    = true
WHERE vendor_code = 'MEGAPUNTO';

-- LATCOM producción
UPDATE vendors SET
    vendor_url_prod  = 'https://api.latcom.co/',
    vendor_api_key   = 'API_KEY_PROD',
    vendor_user_uid  = 'CUSTOMER_ID_PROD',
    vendor_username  = 'CUSTOMER_ID_PROD',
    is_production    = true
WHERE vendor_code = 'LATCOM';
```

### 3. BD — Activar sync automático MEGAPUNTO

```sql
UPDATE vendors
SET auto_sync_products = true,
    sync_time          = '06:00'
WHERE vendor_code = 'MEGAPUNTO';
```

### 4. Verificaciones pre-launch

1. Ejecutar sync manual desde panel admin → verificar reporte
2. Confirmar en logs que el token de MEGAPUNTO se obtuvo en startup
3. Verificar que los 22 vendor_products Venezuela tienen `vp_metadata.precio_referencial` poblado
4. Confirmar que los `products` de Venezuela tienen `product_base_price` correcto
5. Probar una compra de Venezuela en ambiente producción (número real)
6. Confirmar URL producción TISI — distinta a QA (`api-hub-qa-in.tisi.com.pe`)
7. Verificar que `GET /api/v1/payments/config` retorna `card_available` y `barcode_available` correctos

**FIN DEL DOCUMENTO 27**

*Versión: 4.5 | Fecha: Junio 2026 | Cambios v4.5: Agregado OPS_PANEL_PIN — controla acceso al OperationsPanel sin requerir rol admin. Versión anterior: 4.4 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Cambios v4.4: Nuevas variables CARD_AVAILABLE y BARCODE_AVAILABLE — control de métodos de pago por país de instalación. Nuevas variables SMTP para recuperación de contraseña. Tabla de disponibilidad por país. Documentación del mecanismo de publicación al frontend vía GET /payments/config.*
*Continúa en: DOC 28 — Instalación y Despliegue*


---

<a name="28-instalacion-despliegue"></a>

# DOCUMENTO 28
## INSTALACIÓN Y DESPLIEGUE

**Versión:** 5.0
**Fecha:** Mayo 2026
**Sistema:** Latconecta v2.0.0
**Servidor:** CalmetServer — Ubuntu 24.04 — IP 77.42.92.151

---

## CONTENIDO

1. [Prerrequisitos del Servidor](#prerrequisitos)
2. [Estructura de Directorios](#directorios)
3. [Instalación del Backend](#backend)
4. [Instalación del Vendor Simulator](#simulator)
5. [Instalación de los Frontends](#frontends)
6. [Configuración de Nginx](#nginx)
7. [Configuración de SSL](#ssl)
8. [Configuración de Systemd](#systemd)
9. [Verificación Final](#verificacion)
10. [Actualización del Sistema](#actualizacion)

---

## PRERREQUISITOS DEL SERVIDOR <a name="prerrequisitos"></a>

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y python3.11 python3.11-venv python3-pip \
    postgresql postgresql-contrib \
    nginx git curl wget \
    nodejs npm \
    openssl

# Verificar versiones
python3.11 --version   # Python 3.11.x
node --version          # v18.x o superior
psql --version          # PostgreSQL 14.x
nginx -v                # nginx/1.24.x
```

---

## ESTRUCTURA DE DIRECTORIOS <a name="directorios"></a>

```bash
sudo mkdir -p /var/www/latconecta
sudo chown jcalmett:jcalmett /var/www/latconecta
sudo chmod 755 /var/www/latconecta

# Estructura resultante:
/var/www/latconecta/
├── backend/                    # FastAPI backend
├── latconecta_admin/           # Frontend administrador
├── latconecta_users/           # Frontend usuarios
├── vendor_simulator/           # Simulador de vendors (Flask)
├── culqi-sandbox/              # Simulador de pagos Culqi (solo pruebas)
│   └── index.html              # Módulo de prueba Culqi Checkout V4
└── _legacy/                    # Archivos archivados
    └── izipay_abril2026/       # Backup Izipay (revisar octubre 2026)
```

---

## INSTALACIÓN DEL BACKEND <a name="backend"></a>

```bash
# 1. Clonar repositorio
cd /var/www/latconecta
git clone https://github.com/jcalmett/Latconecta.git .

# 2. Crear entorno virtual
cd /var/www/latconecta/backend
python3.11 -m venv .venv
source .venv/bin/activate

# 3. Instalar dependencias (incluye Culqi SDK)
pip install -r requirements.txt
# El requirements.txt incluye: culqi-python-oficial, pycryptodome

# 4. Configurar variables de entorno
nano .env  # Ver sección Variables .env más abajo

# 5. Crear base de datos
sudo -u postgres psql
CREATE DATABASE latconecta_db;
\q

# 6. Crear directorio de uploads
mkdir -p /var/www/latconecta/backend/uploads/barcodes
chmod 755 /var/www/latconecta/backend/uploads

# 7. Probar arranque manual
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8100
# Ctrl+C para detener
```

### Variables .env del Backend

```bash
# ── BASE DE DATOS ──────────────────────────────────
DATABASE_URL=postgresql+asyncpg://postgres:admin@localhost:5432/latconecta_db

# ── SEGURIDAD JWT ──────────────────────────────────
SECRET_KEY=tu_clave_secreta_muy_larga_aqui_minimo_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ── APLICACIÓN ────────────────────────────────────
ENVIRONMENT=development    # development | uat | production
DEBUG=True
DEPLOYMENT_COUNTRY=PE      # PE=Perú, MX=México, US=USA

# ── GATEWAY DE PAGOS ──────────────────────────────
PAYMENT_GATEWAY=culqi

# ── CULQI — PERÚ ──────────────────────────────────
CULQI_PUBLIC_KEY=pk_test_7jTfx9nRR69ACCpu    # Pruebas Latconecta
CULQI_SECRET_KEY=sk_test_sG8xgqCq1r1xq7fc    # Pruebas Latconecta
CULQI_RSA_ID=                                 # Vacío = sin encriptación RSA
CULQI_RSA_PUBLIC_KEY=                         # Vacío = sin encriptación RSA

# ── MÉTODOS DE PAGO POR PAÍS ──────────────────────
CARD_AVAILABLE=True
BARCODE_AVAILABLE=False    # Perú: False. México: True (OXXO Pay)

# ── VENDOR SIMULATOR ──────────────────────────────
VENDOR_SIMULATOR_ENABLED=False    # True cuando se usa el simulador
VENDOR_SIMULATOR_URL=http://localhost:5001

# ── VENDOR LOGIN ──────────────────────────────────
ENABLE_VENDOR_LOGIN=true

# ── VENDORS LATCOM ────────────────────────────────
VENDOR_MODE=mock
LATCOM_URL=https://uatlat.mitopup.com
LATCOM_USERNAME=
LATCOM_PASSWORD=
LATCOM_API_KEY=
LATCOM_USER_UID=
LATCOM_TIMEOUT=45
MOCK_MODE=success
MOCK_DELAY=1.0
MOCK_SUCCESS_RATE=0.95

# ── SMTP — RECUPERACIÓN DE CONTRASEÑA ────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=latconecta.digital@gmail.com
SMTP_PASSWORD=cols dkia bvfu jfjl
SMTP_FROM_NAME=LatConecta

# ── UPLOADS ───────────────────────────────────────
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE=5242880
LOG_LEVEL=INFO
ALLOWED_ORIGINS=http://77.42.92.151:5173,http://77.42.92.151:5174,https://77.42.92.151:5176
```

---

## INSTALACIÓN DEL VENDOR SIMULATOR <a name="simulator"></a>

```bash
cd /var/www/latconecta/vendor_simulator
python3.11 -m venv .venv
source .venv/bin/activate
pip install flask

# Probar
python vendor_simulator.py
# → Corre en puerto 5001
# Ctrl+C para detener
```

---

## INSTALACIÓN DE LOS FRONTENDS <a name="frontends"></a>

### Frontend Admin

```bash
cd /var/www/latconecta/latconecta_admin
npm install

# Build
npm run build
# Genera: /var/www/latconecta/latconecta_admin/dist/
```

### Frontend Users

```bash
cd /var/www/latconecta/latconecta_users
npm install

npm run build
# Genera: /var/www/latconecta/latconecta_users/dist/
```

**Configuraciones importantes en el código fuente:**

`latconecta_users/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/latconecta_users/',   // Crítico para assets correctos bajo sub-path
  server: { port: 5174, open: true }
})
```

`latconecta_users/src/App.jsx`:
```jsx
function App() {
  return (
    <Router basename="/latconecta_users">  {/* Crítico para SPA routing */}
      <AppContent />
    </Router>
  );
}
```

**Nota sobre rutas absolutas:** Cualquier navegación en el código debe usar rutas prefijadas con `/latconecta_users/` (ej: `href="/latconecta_users/select"`) o usar `navigate()` de React Router (que respeta el `basename` automáticamente). Nunca usar `window.location.href` con rutas sin prefijo.

### Simulador Culqi Sandbox

```bash
# El archivo se sube directamente — no requiere build
mkdir -p /var/www/latconecta/culqi-sandbox
# Subir index.html al directorio
scp culqi_sandbox_index.html jcalmett@77.42.92.151:/var/www/latconecta/culqi-sandbox/index.html
```

---

## CONFIGURACIÓN DE NGINX <a name="nginx"></a>

Archivo principal: `/etc/nginx/sites-available/latconecta`

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name 77.42.92.151;
    return 301 https://$server_name$request_uri;
}

# HTTPS — Servidor principal
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 77.42.92.151;

    # SSL
    ssl_certificate     /etc/ssl/certs/latconecta-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/latconecta-selfsigned.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # CSP — incluye dominios de Culqi necesarios
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' https://checkout.culqi.com https://js.culqi.com https://3ds.culqi.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.culqi.com https://secure.culqi.com https://checkoutview.culqi.com;" always;

    access_log /var/log/nginx/latconecta-access.log;
    error_log  /var/log/nginx/latconecta-error.log;

    # ── BACKEND API ──────────────────────────────────────
    location /api/ {
        proxy_pass http://127.0.0.1:8100/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /health {
        proxy_pass http://127.0.0.1:8100/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        alias /var/www/latconecta/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /docs {
        proxy_pass http://127.0.0.1:8100/docs;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /redoc {
        proxy_pass http://127.0.0.1:8100/redoc;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /openapi.json {
        proxy_pass http://127.0.0.1:8100/openapi.json;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # ── FRONTEND USERS ───────────────────────────────────
    # SPA con basename "/latconecta_users" — el fallback sirve index.html
    # para que React Router maneje todas las sub-rutas
    location /latconecta_users {
        alias /var/www/latconecta/latconecta_users/dist;
        index index.html;
        try_files $uri $uri/ /latconecta_users/index.html;
    }

    # ── FRONTEND ADMIN ───────────────────────────────────
    location /latconecta_admin {
        alias /var/www/latconecta/latconecta_admin/dist;
        try_files $uri $uri/ /latconecta_admin/index.html;
        index index.html;
    }

    # ── REDIRECCIÓN DE RAÍZ ──────────────────────────────
    location = / {
        return 301 /latconecta_users;
    }
}

# ── CULQI SANDBOX — Solo para pruebas ────────────────────────
# Accesible en https://77.42.92.151:5176
# NO habilitar en producción
server {
    listen 5176 ssl;
    server_name 77.42.92.151;

    ssl_certificate     /etc/ssl/certs/latconecta-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/latconecta-selfsigned.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    root  /var/www/latconecta/culqi-sandbox;
    index index.html;

    access_log /var/log/nginx/latconecta-culqi-sandbox-access.log;
    error_log  /var/log/nginx/latconecta-culqi-sandbox-error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Activar sitio principal
sudo ln -s /etc/nginx/sites-available/latconecta /etc/nginx/sites-enabled/latconecta

# Activar sandbox Culqi (solo en desarrollo/UAT)
sudo ln -s /etc/nginx/sites-available/latconecta-culqi-sandbox /etc/nginx/sites-enabled/latconecta-culqi-sandbox

# Verificar sintaxis y recargar
sudo nginx -t
sudo systemctl reload nginx

# Abrir puertos en firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5176/tcp   # Solo para Culqi sandbox (dev/UAT)
```

### Notas importantes sobre Nginx

- El sitio `latconecta-users` (archivo separado) está **deshabilitado** — era redundante y causaba conflicto de `server_name` en el puerto 443. Toda la configuración está en el archivo `latconecta`.
- El `try_files` en `location /latconecta_users` usa `alias` — **no usar `root`** ya que el path base de alias y root funcionan diferente.
- El CSP debe incluir todos los dominios de Culqi: `js.culqi.com`, `checkout.culqi.com`, `3ds.culqi.com`, `secure.culqi.com`, `checkoutview.culqi.com`.

### CORS en config.py

Los orígenes CORS se configuran en `backend/app/config.py`:

```python
LOCAL_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

PRODUCTION_ORIGINS: List[str] = [
    "https://77.42.92.151",
    "https://77.42.92.151/latconecta_admin",
    "https://77.42.92.151/latconecta_users",
    "http://77.42.92.151:8100",    # Backend directo (debugging)
    "https://77.42.92.151:5176",   # Culqi sandbox simulator
]
```

En `development`, se usan `LOCAL_ORIGINS + PRODUCTION_ORIGINS`. En `production`/`uat`, solo `PRODUCTION_ORIGINS`.

---

## CONFIGURACIÓN DE SSL <a name="ssl"></a>

```bash
# Generar certificado auto-firmado (válido 365 días)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/latconecta-selfsigned.key \
    -out /etc/ssl/certs/latconecta-selfsigned.crt \
    -subj "/C=PE/ST=Lima/L=Lima/O=Latconecta/CN=77.42.92.151"

sudo chmod 600 /etc/ssl/private/latconecta-selfsigned.key
```

**Nota:** El certificado auto-firmado causa advertencia en los navegadores. Para producción con dominio, usar Let's Encrypt:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d app.latconecta.com
```

---

## CONFIGURACIÓN DE SYSTEMD <a name="systemd"></a>

### Backend

```bash
sudo nano /etc/systemd/system/latconecta-backend.service
```

```ini
[Unit]
Description=Latconecta Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=jcalmett
WorkingDirectory=/var/www/latconecta/backend
ExecStart=/var/www/latconecta/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8100
Restart=always
RestartSec=5
StandardOutput=append:/var/log/latconecta/backend.log
StandardError=append:/var/log/latconecta/backend-error.log

[Install]
WantedBy=multi-user.target
```

### Vendor Simulator

```bash
sudo nano /etc/systemd/system/latconecta-vendor-simulator.service
```

```ini
[Unit]
Description=Latconecta Vendor Simulator
After=network.target

[Service]
Type=simple
User=jcalmett
WorkingDirectory=/var/www/latconecta/vendor_simulator
ExecStart=/var/www/latconecta/vendor_simulator/.venv/bin/python vendor_simulator.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# Crear directorio de logs
sudo mkdir -p /var/log/latconecta
sudo chown jcalmett:jcalmett /var/log/latconecta

# Activar y arrancar servicios
sudo systemctl daemon-reload

sudo systemctl enable latconecta-backend
sudo systemctl start latconecta-backend

sudo systemctl enable latconecta-vendor-simulator
sudo systemctl start latconecta-vendor-simulator
```

---

## VERIFICACIÓN FINAL <a name="verificacion"></a>

```bash
# 1. Backend responde
curl -s http://localhost:8100/health
# → {"status":"ok","app":"Latconecta API","version":"2.0.0","environment":"development"}

# 2. Config de pagos correcta
curl -s http://localhost:8100/api/v1/payments/config | python3 -m json.tool
# → {"gateway":"culqi","public_key":"pk_test_...","card_available":true,"barcode_available":false,...}

# 3. Nginx en todos los puertos
ss -tlnp | grep -E "80|443|5176"

# 4. Frontends accesibles
curl -sk -o /dev/null -w "%{http_code}" https://77.42.92.151/latconecta_users
# → 200

curl -sk -o /dev/null -w "%{http_code}" https://77.42.92.151/latconecta_admin
# → 200

# 5. Sandbox Culqi accesible
curl -sk -o /dev/null -w "%{http_code}" https://77.42.92.151:5176
# → 200

# 6. Estado de servicios
sudo systemctl status latconecta-backend latconecta-vendor-simulator nginx postgresql
```

---

## ACTUALIZACIÓN DEL SISTEMA <a name="actualizacion"></a>

```bash
# Flujo estándar de actualización desde GitHub

# 1. En el servidor — pull y build
cd /var/www/latconecta
git pull origin main

# 2. Si hay cambios en backend — reiniciar
sudo systemctl restart latconecta-backend

# 3. Si hay cambios en frontend users — rebuild
cd /var/www/latconecta/latconecta_users
npm run build

# 4. Si hay cambios en frontend admin — rebuild
cd /var/www/latconecta/latconecta_admin
npm run build

# 5. Si hay cambios en Nginx — recargar
sudo nginx -t && sudo systemctl reload nginx

# 6. Si hay cambios en el simulador Culqi sandbox — subir directamente
# (no está en el build de Vite — es HTML estático)
scp culqi_sandbox_index.html jcalmett@77.42.92.151:/var/www/latconecta/culqi-sandbox/index.html
```

---

**FIN DEL DOCUMENTO 28**

*Versión: 5.0 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Cambios v5.0: Migración Izipay → Culqi. Variables .env actualizadas (CULQI_*, BARCODE_AVAILABLE=False). Nginx actualizado con CSP Culqi, sitio culqi-sandbox en puerto 5176, deshabilitado latconecta-users redundante. Notas críticas sobre SPA routing (basename + vite base + rutas absolutas). CORS actualizado con puerto 5176. Logs a /var/log/latconecta/.*
*Continúa en: DOC 29 — Configuración y Despliegue: Referencia Completa*


---

<a name="29-configuracion-despliegue-ref"></a>

# DOCUMENTO 29
## CONFIGURACIÓN Y DESPLIEGUE — REFERENCIA COMPLETA

**Versión:** 5.0
**Fecha:** Mayo 2026
**Sistema:** Latconecta v2.0.0

Este documento consolida la referencia rápida de todas las configuraciones del sistema para uso del equipo de infraestructura.

---

## SERVICIOS Y PUERTOS

| Servicio | Puerto | Protocolo | Descripción |
|----------|--------|-----------|-------------|
| PostgreSQL | 5432 | TCP | Base de datos |
| Backend FastAPI | 8100 | HTTP | API REST (interno) |
| Vendor Simulator | 5001 | HTTP | Simulador local de vendors |
| Nginx | 80 | HTTP | Redirige a HTTPS |
| Nginx | 443 | HTTPS | Frontends + API proxy + SSL |
| Nginx | 5176 | HTTPS | Culqi Sandbox (solo dev/UAT) |

---

## RUTAS DE ACCESO

| Recurso | URL |
|---------|-----|
| Frontend Users | https://77.42.92.151/latconecta_users |
| Frontend Admin | https://77.42.92.151/latconecta_admin |
| Backend API (vía proxy) | https://77.42.92.151/api/v1/ |
| Backend API (directo) | http://77.42.92.151:8100 |
| Swagger Docs | http://77.42.92.151:8100/docs |
| Health Check | https://77.42.92.151/health |
| Culqi Sandbox | https://77.42.92.151:5176 |

---

## COMANDOS DE GESTIÓN RÁPIDA

```bash
# Estado de todos los servicios
sudo systemctl status latconecta-backend latconecta-vendor-simulator nginx postgresql

# Reiniciar backend (más común)
sudo systemctl restart latconecta-backend

# Ver logs del backend en tiempo real
tail -f /var/log/latconecta/backend.log

# Ver últimos 100 logs del backend
tail -100 /var/log/latconecta/backend.log | grep -E "INFO|ERROR|WARNING"

# Ver logs de Nginx
sudo tail -f /var/log/nginx/latconecta-access.log
sudo tail -f /var/log/nginx/latconecta-error.log
sudo tail -f /var/log/nginx/latconecta-culqi-sandbox-access.log

# Rebuild frontend users
cd /var/www/latconecta/latconecta_users && npm run build

# Rebuild frontend admin
cd /var/www/latconecta/latconecta_admin && npm run build

# Actualizar desde GitHub
cd /var/www/latconecta && git pull origin main

# Conectar a BD
sudo -u postgres psql latconecta_db

# Backup de BD
pg_dump -U postgres latconecta_db > /tmp/backup_$(date +%Y%m%d).sql

# Recargar Nginx sin downtime
sudo nginx -t && sudo systemctl reload nginx

# Verificar config de pagos
curl -s http://localhost:8100/api/v1/payments/config | python3 -m json.tool

# Probar cargo Culqi directamente
cd /var/www/latconecta/backend && .venv/bin/python3 -c "
from culqi.client import Culqi
import json
culqi = Culqi('pk_test_7jTfx9nRR69ACCpu', 'sk_test_sG8xgqCq1r1xq7fc')
body = {'amount': 600, 'currency_code': 'PEN', 'email': 'test@test.com',
        'source_id': 'tkn_test_XXX', 'capture': True, 'installments': 0,
        'description': 'Latconecta test', 'metadata': {'order_number': 'TEST-001'}}
result = culqi.charge.create(data=body)
print(json.dumps(result, indent=2))
"
```

---

## UBICACIONES DE ARCHIVOS CLAVE

| Archivo | Ruta |
|---------|------|
| .env backend | /var/www/latconecta/backend/.env |
| Nginx config principal | /etc/nginx/sites-available/latconecta |
| Nginx config sandbox | /etc/nginx/sites-available/latconecta-culqi-sandbox |
| Nginx sites enabled | /etc/nginx/sites-enabled/ |
| SSL cert | /etc/ssl/certs/latconecta-selfsigned.crt |
| SSL key | /etc/ssl/private/latconecta-selfsigned.key |
| Systemd backend | /etc/systemd/system/latconecta-backend.service |
| Systemd simulator | /etc/systemd/system/latconecta-vendor-simulator.service |
| Logs backend | /var/log/latconecta/backend.log |
| Logs backend errors | /var/log/latconecta/backend-error.log |
| Uploads | /var/www/latconecta/backend/uploads/ |
| Admin dist | /var/www/latconecta/latconecta_admin/dist/ |
| Users dist | /var/www/latconecta/latconecta_users/dist/ |
| Culqi sandbox | /var/www/latconecta/culqi-sandbox/index.html |
| Legacy Izipay | /var/www/latconecta/_legacy/izipay_abril2026/ |

---

## VARIABLES .ENV CRÍTICAS

| Variable | Valor actual (UAT) | Descripción |
|----------|-------------------|-------------|
| PAYMENT_GATEWAY | culqi | Gateway activo |
| CULQI_PUBLIC_KEY | pk_test_7jTfx9nRR69ACCpu | Llave pública Culqi (pruebas) |
| CULQI_SECRET_KEY | sk_test_sG8xgqCq1r1xq7fc | Llave privada Culqi (pruebas) |
| DEPLOYMENT_COUNTRY | PE | País de instalación |
| CARD_AVAILABLE | True | Tarjeta disponible |
| BARCODE_AVAILABLE | False | Barcode no disponible en Perú |
| ENVIRONMENT | development | Ambiente actual |
| ENABLE_VENDOR_LOGIN | true | Login automático de vendors |
| VENDOR_SIMULATOR_ENABLED | False | Simulador deshabilitado |

---

## SITES NGINX — ESTADO ACTUAL

| Archivo | Habilitado | Descripción |
|---------|-----------|-------------|
| latconecta | ✅ | Config principal (443, 80, frontends, API) |
| latconecta-culqi-sandbox | ✅ | Sandbox Culqi en puerto 5176 |
| latconecta-api | ❌ deshabilitado | Redundante — incluido en latconecta |
| latconecta-users | ❌ deshabilitado | Redundante — conflicto con puerto 443 |
| latconecta-admin | ❌ deshabilitado | Redundante — incluido en latconecta |
| latconecta-izipay-sandbox | ❌ deshabilitado | Legacy — ya no se usa |
| default | ✅ | Default Nginx |

---

## PUERTOS FIREWALL (UFW)

```bash
sudo ufw status
# Debe mostrar:
# 22/tcp     ALLOW    (SSH)
# 80/tcp     ALLOW    (HTTP)
# 443/tcp    ALLOW    (HTTPS)
# 5174/tcp   ALLOW    (Users dev — puede estar o no)
# 5176/tcp   ALLOW    (Culqi sandbox)
```

---

## GIT — REFERENCIA

```bash
# Repositorio
https://github.com/jcalmett/Latconecta.git

# Tags importantes
git tag -l
# v-izipay-backup-abril2026  ← backup antes de migración a Culqi

# Workflow estándar servidor → GitHub → PC
# Servidor:
git add . && git commit -m "descripción" && git push origin main
# PC:
git pull origin main
```

---

## CULQI — REFERENCIA RÁPIDA

| Dato | Valor |
|------|-------|
| Panel | https://panel.culqi.com |
| Panel integración | https://integ-panel.culqi.com |
| API docs | https://apidocs.culqi.com |
| Empresa | LATCOM HORIZONS PERU SRL (ID: 127120) |
| Comercio | MITOPUPCOM (CulqiOnline) |
| Llave pública (pruebas) | pk_test_7jTfx9nRR69ACCpu |
| Llave privada (pruebas) | sk_test_sG8xgqCq1r1xq7fc |
| Monto mínimo cargo | S/1.00 (100 céntimos) |
| Monto mínimo Order | S/6.00 (600 céntimos) |
| Expiración token | 15 minutos |

### Tarjetas de prueba

| Tarjeta | Resultado |
|---------|-----------|
| 4111 1111 1111 1111 | ✅ Aprobada (Visa) |
| 5111 1111 1111 1118 | ✅ Aprobada (Mastercard) |
| 4000 0200 0000 0000 | ❌ Fondos insuficientes |

CVV: 123 · Vencimiento: cualquier fecha futura

---

**FIN DEL DOCUMENTO 29**

*Versión: 5.0 | Fecha: Mayo 2026 | Sistema: Latconecta v2.0.0*
*Cambios v5.0: Puertos actualizados (5176 Culqi sandbox). URLs actualizadas. Variables .env con Culqi. Sites Nginx — estado actual. Comandos Culqi. Referencia rápida Culqi. Logs a /var/log/latconecta/.*


---

<a name="30-guia-operacion-soporte"></a>

# DOCUMENTO 30
## GUÍA DE OPERACIÓN Y SOPORTE

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Audiencia:** Equipo de Operaciones y Soporte Técnico

---

## CONTENIDO

1. [Monitoreo del Sistema](#monitoreo)
2. [Gestión de Transacciones Fallidas](#transacciones)
3. [Troubleshooting Común](#troubleshooting)
4. [Procedimientos de Mantenimiento](#mantenimiento)
5. [Escalamiento](#escalamiento)
6. [Contactos](#contactos)

---

## MONITOREO DEL SISTEMA <a name="monitoreo"></a>

### Verificación de Salud del Sistema

```bash
# 1. Backend
curl http://localhost:8100/health
# → {"status": "ok", "environment": "uat"}

# 2. Servicios systemd
sudo systemctl status latconecta-backend
sudo systemctl status latconecta-vendor-simulator
sudo systemctl status nginx
sudo systemctl status postgresql

# 3. Conectividad a LATCOM
curl -s https://latcom-fix-production.up.railway.app/api/v1/balance \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY"
```

### Monitoreo de Transacciones (SQL)

```sql
-- Compras en las últimas 24 horas
SELECT
    COUNT(*) AS total,
    SUM(CASE WHEN purchase_status = 'Success' THEN 1 ELSE 0 END) AS exitosas,
    SUM(CASE WHEN purchase_status = 'Failed' THEN 1 ELSE 0 END) AS fallidas,
    SUM(CASE WHEN purchase_status = 'Pending' THEN 1 ELSE 0 END) AS pendientes,
    SUM(CASE WHEN requires_manual_intervention = true THEN 1 ELSE 0 END) AS intervencion
FROM purchases
WHERE purchase_date > NOW() - INTERVAL '24 hours';

-- Compras que requieren intervención manual
SELECT
    purchase_id,
    purchase_reference,
    purchase_date,
    purchase_total_amount,
    purchase_currency,
    purchase_payment_status,
    vendor_name,
    vendor_trans_id,
    purchase_vendor_response_code
FROM purchases
WHERE requires_manual_intervention = true
ORDER BY purchase_date DESC;

-- Balances de vendors
SELECT
    vendor_code,
    vendor_usd_balance,
    vendor_usd_date_balance,
    vendor_local_currency,
    vendor_local_balance,
    vendor_local_date_balance,
    is_production
FROM vendors
WHERE vendor_status = 'active';
```

---

## GESTIÓN DE TRANSACCIONES FALLIDAS <a name="transacciones"></a>

### Tipos de Estado y Acciones

| Estado | Descripción | Acción requerida |
|--------|-------------|-----------------|
| purchase_status=Pending + payment_status=Pending | Barcode generado, esperando pago | Ninguna — proceso normal |
| purchase_status=Failed + payment_status=Reversed | Provisión falló, pago revertido | Ninguna — proceso automático completado |
| purchase_status=Failed + requires_manual_intervention=TRUE | CRÍTICO | Intervención manual necesaria |
| purchase_status=Failed + payment_status=Success | Pago cobrado, provisión falló, reversión también falló | Mismo que anterior |

### Procedimiento: Intervención Manual

Cuando `requires_manual_intervention = TRUE`:

1. **Identificar la transacción** en el Sales Tab del admin
2. **Revisar los detalles:**
   ```sql
   SELECT
       purchase_reference,
       purchase_total_amount,
       purchase_currency,
       purchase_payment_method,
       purchase_payment_ref,
       vendor_name,
       vendor_request,
       vendor_response,
       purchase_vendor_response_code,
       purchase_vendor_response_description
   FROM purchases
   WHERE purchase_id = X;
   ```
3. **Opciones de resolución:**
   - Si el vendor procesó la recarga a pesar del error: confirmar con LATCOM y actualizar estado
   - Si el vendor NO procesó: contactar al gateway de pagos para reembolso manual
   - Si hay duda: contactar a Richard Mas en LATCOM con el `vendor_request` como evidencia

4. **Actualizar el estado** una vez resuelto:
   ```sql
   UPDATE purchases
   SET requires_manual_intervention = false,
       purchase_status = 'Success',  -- o 'Failed' según resolución
       updated_by = 'soporte@latconecta.com',
       last_update_date = NOW()
   WHERE purchase_id = X;
   ```

---

## TROUBLESHOOTING COMÚN <a name="troubleshooting"></a>

### Problema: Backend no responde

```bash
# Verificar si está corriendo
sudo systemctl status latconecta-backend

# Ver logs recientes
sudo journalctl -u latconecta-backend -n 50

# Si está caído, reiniciar
sudo systemctl restart latconecta-backend

# Si no arranca, correr manualmente para ver el error:
cd /var/www/latconecta/backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8100
```

**Causas comunes:**
- Error en el .env (variable mal formada)
- Puerto 8100 ocupado por otro proceso
- Error de importación de módulo Python
- BD no disponible

### Problema: Transacciones LATCOM fallan

```bash
# Probar directamente la API de LATCOM
curl -s -X POST https://latcom-fix-production.up.railway.app/api/v1/topup \
  -H "Content-Type: application/json" \
  -H "x-customer-id: LATCONECTA_001" \
  -H "x-api-key: TU_API_KEY" \
  -d '{"carrier":"BITEL","phone":"945678901","amount":5,"country":"PE","reference":"TEST-DEBUG-001"}'
```

**Si la llamada directa también falla:**
- Problema del lado de LATCOM → Contactar Richard Mas
- Si es 401: verificar credenciales en tabla vendors
- Si es 403: problema de permisos en la cuenta LATCOM

**Si la llamada directa funciona pero desde Latconecta falla:**
- Problema en el mapping → Revisar request_mapping y transformaciones
- Usar `POST /vendor-api-mappings/{id}/test` para debuggear

### Problema: Frontend no carga

```bash
# Verificar Nginx
sudo nginx -t
sudo systemctl status nginx
sudo tail -n 50 /var/log/nginx/error.log

# Verificar que el build existe
ls /var/www/latconecta/latconecta_users/dist/
ls /var/www/latconecta/latconecta_admin/dist/
```

**Si el dist/ no existe o está desactualizado:**
```bash
cd /var/www/latconecta/latconecta_users && npm run build
cd /var/www/latconecta/latconecta_admin && npm run build
```

### Problema: Imágenes no cargan

```bash
# Verificar permisos del directorio uploads
ls -la /var/www/latconecta/backend/uploads/
# El dueño debe ser www-data

# Reparar permisos si es necesario
sudo chown -R www-data:www-data /var/www/latconecta/backend/uploads/
sudo chmod 755 /var/www/latconecta/backend/uploads/
```

### Problema: SSL — Advertencia de certificado

El certificado auto-firmado causará advertencia en todos los navegadores. Es el comportamiento esperado en desarrollo/UAT. Para producción real, obtener un certificado de CA válido (Let's Encrypt).

Los usuarios pueden hacer clic en "Avanzado → Continuar" en Chrome/Firefox para aceptar el riesgo.

---

## PROCEDIMIENTOS DE MANTENIMIENTO <a name="mantenimiento"></a>

### Mantenimiento Diario (Revisar)

```bash
# 1. Estado de servicios
sudo systemctl status latconecta-backend latconecta-vendor-simulator nginx

# 2. Transacciones con intervención manual
psql latconecta_db -c "SELECT COUNT(*) FROM purchases WHERE requires_manual_intervention = true;"

# 3. Balance de vendors
psql latconecta_db -c "SELECT vendor_code, vendor_usd_balance, vendor_local_balance, vendor_local_currency FROM vendors WHERE vendor_status='active';"
```

### Mantenimiento Semanal

```bash
# 1. Backup de BD
pg_dump -U postgres latconecta_db > /tmp/backup_$(date +%Y%m%d).sql
gzip /tmp/backup_$(date +%Y%m%d).sql

# 2. Limpieza de logs antiguos (más de 30 días)
sudo journalctl --vacuum-time=30d

# 3. Verificar espacio en disco
df -h /var/www/latconecta/backend/uploads/
```

### Mantenimiento Mensual

```bash
# 1. Renovar certificado SSL si está próximo a vencer
# Verificar fecha de expiración:
openssl x509 -enddate -noout -in /etc/ssl/certs/latconecta-selfsigned.crt

# 2. Actualizar dependencias Python (en rama de desarrollo primero)
cd /var/www/latconecta/backend
source .venv/bin/activate
pip list --outdated

# 3. Actualizar dependencias Node.js (en rama de desarrollo primero)
cd /var/www/latconecta/latconecta_users
npm outdated
```

---

## ESCALAMIENTO <a name="escalamiento"></a>

### Niveles de Severidad

| Nivel | Tiempo de respuesta | Ejemplos |
|-------|---------------------|---------|
| P0 — Crítico | 15 minutos | Sistema completamente caído, ningún usuario puede comprar |
| P1 — Alto | 30 minutos | Pagos no funcionan, LATCOM no responde |
| P2 — Medio | 2 horas | Lentitud, errores intermitentes |
| P3 — Bajo | 1 día | Bug menor, mejora de UI |

### Árbol de Decisión para Escalamiento

```
¿El problema es de LATCOM/Relier?
    → Sí: Contactar Richard Mas (jcalmett@latcom.co)
    → No: ¿Es de Izipay/gateway de pagos?
        → Sí: Contactar soporte Izipay
        → No: ¿Es un bug del sistema Latconecta?
            → Sí: Escalar al equipo de desarrollo
            → No: Diagnosticar más
```

---

## CONTACTOS <a name="contactos"></a>

| Contacto | Rol | Canal | Cuando contactar |
|----------|-----|-------|-----------------|
| Richard Mas | LATCOM — Responsable técnico | jcalmett@latcom.co | Errores 401/403, Venezuela auth fail, Claro Perú errors |
| Soporte Izipay | Gateway de pagos | Back Office Vendedor | Problemas con tokens, pagos rechazados, SDK issues |
| Equipo Dev Latconecta | Desarrollo | Interno | Bugs del sistema, cambios de configuración |

---

**FIN DEL DOCUMENTO 30**

*Versión: 4.1 | Fecha: Abril 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 31 — Troubleshooting y Mantenimiento*

---

## OPERACIONES DE SINCRONIZACIÓN DE CATÁLOGO <a name="sync-catalogo"></a>

### Sync Manual desde Panel Admin

El administrador puede ejecutar una sincronización inmediata desde el tab Vendors del panel admin:

1. Ir a **Admin → tab Vendors**
2. Localizar el vendor **MEGAPUNTO**
3. Hacer click en el botón **🔃** en la columna de acciones
4. En el modal que se abre, hacer click en **"Ejecutar Sincronización"**
5. Esperar el resultado (tarda aproximadamente 2-3 segundos)
6. Revisar el reporte con los 5 contadores y la tabla de productos

### Interpretación del Reporte

| Contador | Qué significa | Acción recomendada |
|----------|--------------|-------------------|
| Actualizados | Precios que cambiaron dentro del rango normal | Ninguna — automático |
| Alertas +10% | Precios con variación mayor al 10% | Revisar si el TC del Bolívar cambió significativamente |
| Sin Cambio | Precios sin variación | Ninguna |
| Nuevos | Denominaciones en TISI que no tenemos en BD | Evaluar si agregar al catálogo |
| No Recibidos | En BD pero TISI no los retornó | Evaluar si desactivar |

### Sync Manual desde Servidor (emergencia)

Si el panel admin no está disponible:

```bash
TOKEN=$(curl -s -X POST http://localhost:8100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@latconecta.com","password":"PASSWORD"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -s -X POST http://localhost:8100/api/v1/vendors/MEGAPUNTO/sync-catalog \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

### Verificar Último Sync

```bash
sudo -u postgres psql latconecta_db -c "
SELECT sync_id, sync_date, triggered_by, status,
       products_reviewed, products_updated
FROM vendor_sync_logs
WHERE vendor_code = 'MEGAPUNTO'
ORDER BY sync_date DESC
LIMIT 5;"
```

### Verificar Precios Venezuela en BD

```bash
sudo -u postgres psql latconecta_db -c "
SELECT vp_code, vp_amount,
       vp_metadata->>'precio_referencial' as bs,
       vp_metadata->>'tipo_cambio' as tc,
       vp_metadata->>'last_sync_date' as ultimo_sync
FROM vendor_products
WHERE vendor_code = 'MEGAPUNTO'
  AND vp_skuid IN ('5580','5581','5582','5583')
ORDER BY vp_skuid, vp_code;"
```

### Contacto Soporte MEGAPUNTO/TISI

| Contacto | Rol | Canal | Cuando contactar |
|----------|-----|-------|-----------------|
| Soporte MEGAPUNTO | Plataforma TISI | — | Errores código 99 en recargas, cambios en API, credenciales producción |



---

<a name="31-troubleshooting-mantenimiento"></a>

# DOCUMENTO 31
## TROUBLESHOOTING Y MANTENIMIENTO — REFERENCIA TÉCNICA

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0

---

## DIAGNÓSTICO RÁPIDO — ÁRBOL DE DECISIÓN

```
¿El sistema responde?
│
├── NO → Backend caído
│        sudo systemctl restart latconecta-backend
│        sudo journalctl -u latconecta-backend -n 50
│
└── SÍ → ¿Las transacciones funcionan?
         │
         ├── NO → ¿Cuál es el error?
         │        │
         │        ├── 401 de LATCOM → Verificar credenciales en vendors BD
         │        ├── 403 de LATCOM → Contactar Richard Mas
         │        ├── TIMEOUT → Problema de red o LATCOM lento
         │        └── Error del sistema → Ver logs del backend
         │
         └── SÍ → ¿Hay transacciones con requires_manual_intervention?
                  │
                  ├── SÍ → Seguir procedimiento de intervención manual (DOC 30)
                  └── NO → Sistema operando normalmente
```

---

## COMANDOS DE DIAGNÓSTICO COMPLETOS

```bash
# ─── Estado general del sistema ───────────────────────────────
sudo systemctl status latconecta-backend latconecta-vendor-simulator nginx postgresql

# ─── Logs en tiempo real ───────────────────────────────────────
sudo journalctl -u latconecta-backend -f
sudo journalctl -u latconecta-vendor-simulator -f
sudo tail -f /var/log/nginx/error.log

# ─── Uso de recursos ───────────────────────────────────────────
htop
df -h
free -h

# ─── Conectividad de red ───────────────────────────────────────
curl -s http://localhost:8100/health
curl -s http://localhost:5001/health
curl -s https://latcom-fix-production.up.railway.app/api/v1/balance \
  -H "x-customer-id: LATCONECTA_001" -H "x-api-key: TU_KEY"

# ─── Base de datos ─────────────────────────────────────────────
sudo -u postgres psql latconecta_db -c "SELECT count(*) FROM purchases WHERE purchase_date > NOW() - INTERVAL '1 hour';"
sudo -u postgres psql latconecta_db -c "SELECT count(*) FROM purchases WHERE requires_manual_intervention = true;"

# ─── Verificar puertos en uso ──────────────────────────────────
sudo lsof -i :8100
sudo lsof -i :5001
sudo lsof -i :443
sudo lsof -i :80
```

---

## ERRORES Y SOLUCIONES CONOCIDOS

### Error: "duplicate key value violates unique constraint purchase_reference"

**Causa:** Dos compras se crearon en el mismo segundo — el `purchase_reference` (REF-YYYYMMDDHHMMSS) colisiona.

**Impacto:** La segunda compra falla con error 500.

**Solución temporal:** Reintentar la compra. El usuario generalmente intenta nuevamente.

**Solución permanente:** Agregar microsegundos o un contador al `purchase_reference`.

### Error: "Authentication failed: Credenciales invalidas" en Venezuela

**Causa:** Problema del lado de LATCOM/Servipagos VZ con las credenciales para Venezuela.

**Acción:** Contactar Richard Mas (jcalmett@latcom.co) con el request enviado como evidencia.

### Error: "NXDOMAIN" al cargar SDK de Izipay

**Causa:** La URL del SDK en index.html es `sandboxcheckout.izipay.pe` (sin guion) en lugar de `sandbox-checkout.izipay.pe`.

**Solución:**
```html
<!-- Incorrecto -->
<script src="https://sandboxcheckout.izipay.pe/payments/v1/js/index.js">

<!-- Correcto -->
<script src="https://sandbox-checkout.izipay.pe/payments/v1/js/index.js">
```

### Error: Frontend muestra "Network Error" o CORS

**Causa 1:** El .env del frontend tiene la URL incorrecta.
**Causa 2:** El backend no está corriendo.
**Causa 3:** Cors mal configurado.

```bash
# Verificar .env
cat /var/www/latconecta/latconecta_users/.env
# VITE_API_BASE_URL debe apuntar al backend correcto

# Verificar que el backend responde
curl http://localhost:8100/health

# Reconstruir si se cambió el .env
cd /var/www/latconecta/latconecta_users && npm run build
```

### Error: Imágenes no cargan (404)

**Causa 1:** La imagen no fue subida correctamente.
**Causa 2:** Permisos incorrectos en el directorio uploads.

```bash
sudo chown -R www-data:www-data /var/www/latconecta/backend/uploads/
sudo chmod -R 755 /var/www/latconecta/backend/uploads/
```

---

**FIN DEL DOCUMENTO 31**

*Versión: 4.0 | Fecha: Marzo 2026*


---

<a name="32-35-capacitacion-testing-glosario"></a>

# DOCUMENTO 32
## GUÍA DE CAPACITACIÓN — ADMINISTRADORES

**Versión:** 4.0
**Fecha:** Marzo 2026
**Audiencia:** Administradores del sistema (roles admin y superadmin)

---

## BIENVENIDA

Esta guía te enseñará a gestionar la plataforma Latconecta desde el panel administrativo. No necesitas conocimientos técnicos de programación — el sistema está diseñado para que todo sea visual e intuitivo.

## ACCESO AL PANEL

1. Abrir: `https://77.42.92.151/latconecta_admin`
2. Ingresar email y contraseña
3. Si olvidaste tu contraseña: contactar al superadministrador

## LOS 11 TABS — PARA QUÉ SIRVE CADA UNO

| Tab | Para qué usarlo |
|-----|----------------|
| Latconecta | Cambiar el logo, nombre, fotos del carousel y datos de contacto |
| Countries | Agregar/editar países y actualizar tipos de cambio |
| Services | Gestionar los tipos de servicio (TopUps, Paquetes, etc.) |
| Companies | Gestionar las operadoras (Claro, Bitel, Movistar, etc.) |
| Products | Gestionar los productos visibles al usuario final con precios |
| Sales | Ver todas las ventas, filtrar y revisar detalle de transacciones |
| Users | Gestionar cuentas de usuarios y administradores |
| Vendors | Gestionar los proveedores técnicos (LATCOM, etc.) y sus balances |
| VendorProducts | Gestionar los productos técnicos de cada vendor |
| APIMappings | Configurar integraciones con vendors sin código |
| Profile | Actualizar tu propio perfil y contraseña |

## TAREAS MÁS FRECUENTES

### Agregar un nuevo producto al catálogo

1. Tab **Products** → "+ Nuevo"
2. Seleccionar: País → Servicio → Compañía
3. Ingresar nombre, precio, foto
4. Vincular con el producto técnico del vendor (VP Code + SKU ID)
5. Guardar → El producto aparece inmediatamente en la tienda

### Ver ventas del día

1. Tab **Sales**
2. Filtrar por fecha: hoy
3. Ver resumen: total vendido, transacciones exitosas/fallidas
4. Click en cualquier venta para ver el detalle completo

### Verificar balance del vendor

1. Tab **Vendors**
2. Ver la columna "Balance USD" y "Balance Local"
3. Si el balance es bajo → Click "Sincronizar" para actualizar
4. Si es muy bajo → Coordinar recarga con LATCOM

### Actualizar tipo de cambio

1. Tab **Countries**
2. Editar el país (ej: Perú)
3. Actualizar el campo "Tipo de Cambio USD"
4. Guardar → El sistema usa el nuevo tipo en todas las conversiones

## ALERTA CRÍTICA: INTERVENCIÓN MANUAL

Si en el tab **Sales** ves una compra marcada con ⚠️ "Requiere Intervención Manual":

- Significa que el usuario pagó pero no recibió el servicio
- Y el sistema no pudo revertir automáticamente el pago
- **Acción inmediata:** Contactar al equipo técnico o a LATCOM

---

**FIN DEL DOCUMENTO 32**

*Versión: 4.0 | Fecha: Marzo 2026*


---


# DOCUMENTO 33
## GUÍA DE CAPACITACIÓN — SOPORTE TÉCNICO

**Versión:** 4.0
**Fecha:** Marzo 2026
**Audiencia:** Personal de soporte técnico de primer y segundo nivel

---

## PRIMER NIVEL — SOPORTE A USUARIOS FINALES

### Información que necesitas del usuario

Cuando un usuario reporta un problema:
1. Número de referencia de la compra (REF-YYYYMMDDHHMMSS)
2. Nombre del producto que intentó comprar
3. Método de pago (tarjeta o código de barras)
4. Número de teléfono que intentó recargar
5. Mensaje de error que vio (si hay)

### Consultar el estado de una compra

Con el número de referencia, buscar en el Sales tab del admin o ejecutar:

```sql
SELECT
    purchase_id,
    purchase_reference,
    purchase_status,
    purchase_payment_status,
    purchase_delivery_status,
    requires_manual_intervention,
    vendor_trans_id,
    purchase_vendor_response_description,
    purchase_total_amount,
    purchase_currency
FROM purchases
WHERE purchase_reference = 'REF-XXXXXXXXXX';
```

### Respuestas por tipo de estado

| purchase_status | purchase_payment_status | Respuesta al usuario |
|----------------|------------------------|---------------------|
| Success | Success | "Tu recarga fue procesada exitosamente. ID de transacción: {vendor_trans_id}" |
| Pending | Pending | "Tu código de barras fue generado. Por favor págalo en un agente autorizado." |
| Failed | Reversed | "No se pudo procesar la recarga. Tu pago fue revertido automáticamente. No se realizó ningún cargo." |
| Failed | Success | "⚠️ ESCALAMIENTO NECESARIO — el usuario fue cobrado sin recibir el servicio" |

## SEGUNDO NIVEL — SOPORTE TÉCNICO

### Acceso al servidor

```bash
ssh usuario@77.42.92.151
```

### Revisar detalle técnico de una compra fallida

```sql
SELECT
    purchase_reference,
    purchase_status,
    purchase_payment_status,
    requires_manual_intervention,
    vendor_request,     -- JSON enviado a LATCOM
    vendor_response,    -- JSON recibido de LATCOM
    purchase_vendor_response_code,
    purchase_vendor_response_description,
    vendor_trans_id,
    vendor_provider_trans_id
FROM purchases
WHERE purchase_reference = 'REF-XXXXXXXXXX';
```

### Escalar a LATCOM

Cuando el error es del lado del vendor, enviar a Richard Mas (jcalmett@latcom.co):
- El campo `vendor_request` (lo que enviamos)
- El campo `vendor_response` (lo que respondieron)
- La referencia de la compra
- El timestamp

---

**FIN DEL DOCUMENTO 33**

*Versión: 4.0 | Fecha: Marzo 2026*


---


# DOCUMENTO 34
## TESTING Y QUALITY ASSURANCE

**Versión:** 4.0
**Fecha:** Marzo 2026

---

## ESTRATEGIA DE TESTING

Latconecta usa tres capas de testing:

| Capa | Herramienta | Qué cubre |
|------|-------------|-----------|
| Backend — Unitario | pytest | Services, utils, transformaciones |
| Backend — Integración | pytest + TestClient | Endpoints con BD de prueba |
| Frontend — E2E | Manual + Selenium (futuro) | Flujos completos de usuario |

## TESTING CON EL SISTEMA DE CONTROL DE OPERACIONES

El sistema más usado para QA es el panel de control de operaciones (DOC 09). Permite probar todos los escenarios sin costos reales.

### Escenarios de Prueba Recomendados (Pre-Release)

| # | Escenario | Preset | Resultado esperado |
|---|-----------|--------|-------------------|
| 1 | Compra TopUp exitosa | happy-path | Status=Success, confetti |
| 2 | Compra Paquetes exitosa | happy-path | Status=Success |
| 3 | Bill Payment Total | bill-payment-total | Step 2.6 con monto fijo |
| 4 | Bill Payment Rango | bill-payment-partial | Step 2.6 con slider |
| 5 | Pago rechazado | payment-fail | Error en step 4, sin provisión |
| 6 | Provisión falla + reversión OK | provision-fail-reversal-ok | Status=Failed, pago=Reversed |
| 7 | Provisión falla + reversión falla | provision-fail-reversal-fail | requires_manual_intervention=TRUE |
| 8 | Compra anónima (sin login) | happy-path | Igual que #1 pero user_id=NULL |
| 9 | Smartphone con delivery | happy-path | Paso 2.5 con datos de entrega |
| 10 | Producto Rango | happy-path | Step 3 con slider de monto |

### Comandos pytest Backend

```bash
cd /var/www/latconecta/backend
source .venv/bin/activate
pytest tests/ -v                           # Todos los tests
pytest tests/test_purchases.py -v         # Solo purchases
pytest tests/ -v --tb=short               # Con traceback corto
```

### Verificación Post-Deploy (Smoke Tests)

```bash
# 1. Health check
curl http://localhost:8100/health

# 2. Listar países (endpoint público)
curl http://localhost:8100/api/v1/countries

# 3. Verificar acceso al admin (debe retornar 401)
curl http://localhost:8100/api/v1/vendors

# 4. Login
curl -X POST http://localhost:8100/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@bitel.com.pe&password=admin123"
```

---

**FIN DEL DOCUMENTO 34**

*Versión: 4.0 | Fecha: Marzo 2026*


---


# DOCUMENTO 35
## GLOSARIO Y REFERENCIAS

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0

---

## GLOSARIO TÉCNICO

| Término | Definición |
|---------|------------|
| **API Group Code** | Identificador de 5 caracteres que agrupa las operaciones de un vendor para un tipo de producto específico. Ej: `LC01T` = LATCOM TopUps Perú. Vincula `vendor_products` con `vendor_api_mappings`. |
| **API Mappings** | Sistema de configuración en BD que permite integrar vendors sin escribir código Python. |
| **Barcode / Código de barras** | Método de pago en efectivo. El sistema genera un código único que el usuario paga en agentes autorizados. |
| **Bill Payment** | Servicio de pago de facturas (luz, agua, telefonía fija). Requiere validación de número de cuenta. |
| **CalmetServer** | Servidor de producción de Latconecta. Ubuntu 24.04, IP 77.42.92.151. |
| **cardMode** | Estado en PurchasePopup que determina si el pago con tarjeta es real (fase2) o simulado (fase1). |
| **country_alpha3_to_alpha2** | Transformación en API Mappings que convierte códigos de país de 3 a 2 caracteres (PER→PE, MEX→MX, VEN→VE). |
| **DEPLOYMENT_COUNTRY** | Variable de entorno que indica el país de instalación del sistema (PE, MX, US). Determina el gateway de pagos activo. |
| **Fase 1** | Modo simulado de una operación. Sin efectos externos, sin costos reales. |
| **Fase 2** | Modo real de una operación. Llama al vendor real o gateway real. |
| **HMAC-SHA256** | Algoritmo de firma usado por Izipay para verificar la autenticidad de las respuestas del SDK. |
| **is_production** | Campo en la tabla vendors. Si `true`, el sistema usa `vendor_url_prod`; si `false`, usa `vendor_url_uat`. |
| **LATCOM** | Vendor principal de Latconecta. Empresa que provee la plataforma Relier para procesar recargas en Latinoamérica. |
| **Relier** | Plataforma tecnológica de LATCOM para distribución de recargas. La documentación técnica de la API es de Relier. |
| **requires_manual_intervention** | Campo booleano en purchases. TRUE cuando: pago exitoso + provisión fallida + reversión fallida. |
| **Richard Mas** | Contacto técnico de LATCOM. Email: jcalmett@latcom.co |
| **source_field** | Campo de la tabla purchases o vendor_products usado como fuente de datos en el request_mapping. |
| **TISI Hub** | Plataforma de LATCOM para procesar recargas de operadoras peruanas (Claro, Bitel, Entel, Movistar). |
| **Transformación** | Función configurada en `value_transformations` que modifica un valor antes de enviarlo al vendor. |
| **UniversalVendorService** | Servicio Python que ejecuta requests HTTP a vendors usando la configuración de API Mappings. |
| **VendorAPIMapper** | Clase Python que transforma datos de Purchase → request del vendor, y response del vendor → campos de Purchase. |

## ESTADOS DE COMPRA

| Campo | Valores | Significado |
|-------|---------|-------------|
| `purchase_status` | Pending | Iniciada, esperando pago (barcode) |
| `purchase_status` | Success | Completada exitosamente |
| `purchase_status` | Failed | Falló (provisión o pago) |
| `purchase_payment_status` | Pending | Pago pendiente (barcode generado) |
| `purchase_payment_status` | Success | Pago procesado exitosamente |
| `purchase_payment_status` | Reversed | Pago revertido/anulado |
| `purchase_payment_status` | Refunded | Pago reembolsado |
| `purchase_delivery_status` | completed | Provisión exitosa |
| `purchase_delivery_status` | Ordered | Smartphone registrado (esperando envío) |
| `purchase_delivery_status` | In Transit | Smartphone en camino |
| `purchase_delivery_status` | Delivered | Smartphone entregado |

## REFERENCIAS EXTERNAS

| Recurso | URL |
|---------|-----|
| LATCOM API (UAT) | https://latcom-fix-production.up.railway.app |
| Izipay Sandbox | https://sandbox-api-pw.izipay.pe |
| Izipay SDK Sandbox | https://sandbox-checkout.izipay.pe/payments/v1/js/index.js |
| Izipay Producción | https://api-pw.izipay.pe |
| Izipay SDK Prod | https://checkout.izipay.pe/payments/v1/js/index.js |
| BarcodeAPI | https://barcodeapi.org/api/128/ |
| FastAPI Docs | https://fastapi.tiangolo.com |
| SQLAlchemy 2.0 Async | https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html |
| Pydantic v2 | https://docs.pydantic.dev/latest/ |
| React Router v6 | https://reactrouter.com/en/main |
| Tailwind CSS | https://tailwindcss.com/docs |

---

**FIN DEL DOCUMENTO 35**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*
*Continúa en: DOC 36 — Documento Maestro*


---

<a name="36-documento-maestro"></a>

# DOCUMENTO 36
## DOCUMENTO MAESTRO — GUÍA COMPLETA DEL SISTEMA LATCONECTA

**Versión:** 4.0
**Fecha:** Marzo 2026
**Sistema:** Latconecta v2.0.0
**Propósito:** Documento de referencia central que consolida el estado actual del sistema, el índice completo de documentación y las guías de navegación para cada perfil de usuario

---

## CONTENIDO

1. [Estado del Sistema](#estado)
2. [Índice Completo de Documentos](#indice)
3. [Guía de Navegación por Perfil](#navegacion)
4. [Resumen Técnico del Sistema](#tecnico)
5. [Principios de Diseño Fundamentales](#principios)
6. [Decisiones de Arquitectura Clave](#decisiones)
7. [Tabla de Referencia Rápida](#referencia)

---

## ESTADO DEL SISTEMA <a name="estado"></a>

**Latconecta v2.0.0** — Marzo 2026

| Componente | Estado | Completitud |
|------------|--------|-------------|
| Base de Datos (11 tablas, 60+ campos en purchases) | ✅ Operativo | 100% |
| Backend FastAPI (16 routers, ~85 endpoints) | ✅ Operativo | 100% |
| Sistema API Mappings (JSONPath + fields, transformaciones) | ✅ Operativo | 100% |
| Sistema Control Operaciones (10 ops, 9 presets) | ✅ Operativo | 100% |
| Sistema Pagos Izipay (token, HMAC, cancel) | ✅ Operativo | 100% |
| Pago Barcode (barcodeapi.org) | ✅ Operativo | 100% |
| Sistema Tipo de Cambio (multi-moneda, scheduler) | ✅ Operativo | 100% |
| Vendor LATCOM (Perú: Bitel ✅ Entel ✅ Claro ⚠️) | ✅ Operativo | 95% |
| Vendor Simulator (Flask, Puerto 5001) | ✅ Operativo | 100% |
| Frontend Admin (11 tabs) | ✅ Operativo | 100% |
| Frontend Users (4 vistas + PurchasePopup 7 pasos) | ✅ Operativo | 100% |
| SSL/HTTPS (certificado auto-firmado) | ✅ Activo | 100% |

### Issues Conocidos (Pendientes de Resolución)

| Issue | Causa | Acción pendiente |
|-------|-------|-----------------|
| Claro Perú — Error 401 | Problema del lado LATCOM/TISI Hub | Coordinar con Richard Mas |
| Venezuela — "Credenciales invalidas" | Problema LATCOM/Servipagos VZ | Coordinar con Richard Mas |

---

## ÍNDICE COMPLETO DE DOCUMENTOS <a name="indice"></a>

### PARTE 0 — RESUMEN Y VISIÓN

| Doc | Título | Contenido |
|-----|--------|-----------|
| **00** | Resumen Ejecutivo | Índice, estado del sistema, métricas, acceso |
| **01** | Visión y Arquitectura | Diagrama completo, ambientes, estructura de directorios |

### PARTE I — CAPA DE DATOS

| Doc | Título | Contenido |
|-----|--------|-----------|
| **02** | Base de Datos Completa | Todas las tablas, relaciones, diagrama ER, queries útiles |
| **03** | Diccionario de Datos | Todos los campos con tipo, descripción, valores y reglas de negocio |

### PARTE II — BACKEND

| Doc | Título | Contenido |
|-----|--------|-----------|
| **04** | Backend — Configuración Core | main.py, config.py, database.py, .env |
| **05** | Backend — Routers y Endpoints | Los 16 routers, ~85 endpoints con ejemplos |
| **06** | Backend — Models y Schemas | 11 SQLAlchemy models, Pydantic schemas |
| **07** | Backend — Autenticación | JWT, bcrypt, 4 dependencies, flujos de auth |
| **08** | Backend — Sistema API Mappings | VendorAPIMapper, UniversalVendorService, transformaciones |
| **09** | Backend — Control de Operaciones | OperationsConfigService, 10 operaciones, 9 presets |
| **10** | Backend — Sistema de Pagos | Izipay SDK nuevo, token, HMAC, cancel, barcode |
| **11** | Backend — Tipo de Cambio | ExchangeRateService, scheduler, márgenes comerciales |
| **12** | Backend — Cálculo de Precios | PurchaseCalculatorService, fórmulas, por tipo de producto |

### PARTE III — FRONTEND

| Doc | Título | Contenido |
|-----|--------|-----------|
| **13** | Frontend Admin — Arquitectura | Stack, estructura, routing, auth, Axios |
| **14** | Frontend Admin — Tabs | Los 11 tabs con detalle de funcionalidad |
| **15** | Frontend Users — Arquitectura | Stack, estructura, routing, auth opcional |
| **16** | Frontend Users — Vistas | WelcomeView, SelectView, ShopView, PurchasePopup, ProfileView |

### PARTE IV — VENDOR SIMULATOR

| Doc | Título | Contenido |
|-----|--------|-----------|
| **17** | Vendor Simulator | Flask, endpoints, auth simulada, systemd |

### PARTE V — INTEGRACIÓN LATCOM

| Doc | Título | Contenido |
|-----|--------|-----------|
| **18** | LATCOM — README | Visión general, países, endpoints, credenciales |
| **19** | LATCOM — Autenticación | Headers x-api-key, x-customer-id, errores |
| **20** | LATCOM — Países y Operadores | MX, PE, VE — formatos, operadoras, mapeo BD↔API |
| **21** | LATCOM — API de TopUps | Request/response, ejemplos por país, transaction lookup |
| **22** | LATCOM — Códigos de Error | Todos los errores con causas y acciones |

### PARTE VI — FLUJOS Y DESARROLLO

| Doc | Título | Contenido |
|-----|--------|-----------|
| **23** | Flujos de Negocio | 10 flujos completos incluyendo errores y reversiones |
| **24** | Guía del Desarrollador | Entorno, patrones, convenciones, tareas comunes, reglas críticas |
| **25** | Guía API Mappings — Dev | Campos disponibles, formatos, checklist, ejemplos, errores comunes |
| **26** | Guía Capacitación API Mappings | Pasos en panel admin para configurar integración |

### PARTE VII — DESPLIEGUE Y OPERACIÓN

| Doc | Título | Contenido |
|-----|--------|-----------|
| **27** | Configuración del Sistema | .env por ambiente, Nginx, systemd, UFW |
| **28** | Instalación y Despliegue | Proceso completo desde cero en Ubuntu |
| **29** | Configuración — Referencia Rápida | Tabla de comandos, rutas, servicios |
| **30** | Guía de Operación | Monitoreo, intervención manual, troubleshooting, mantenimiento |
| **31** | Troubleshooting Técnico | Árbol de decisión, comandos diagnóstico, errores conocidos |

### PARTE VIII — CAPACITACIÓN

| Doc | Título | Contenido |
|-----|--------|-----------|
| **32** | Capacitación — Administradores | Los 11 tabs, tareas frecuentes, alertas críticas |
| **33** | Capacitación — Soporte Técnico | Primer y segundo nivel, consultas SQL, escalamiento |
| **34** | Testing y QA | Estrategia, escenarios de prueba, smoke tests |
| **35** | Glosario y Referencias | Términos técnicos, estados de compra, URLs externas |
| **36** | Documento Maestro | Este documento |

---

## GUÍA DE NAVEGACIÓN POR PERFIL <a name="navegacion"></a>

### Para un nuevo desarrollador que se une al equipo

```
1. Leer DOC 00 — Entender qué es el sistema (15 min)
2. Leer DOC 01 — Entender la arquitectura (30 min)
3. Leer DOC 04 — Configurar el entorno local (1 hora)
4. Leer DOC 24 — Guía del desarrollador (1 hora)
5. Leer DOC 08 — Entender API Mappings (30 min)
6. Opcional: DOC 02-03 para conocer la BD en profundidad
7. Opcional: DOC 05-12 para profundizar en el backend
```

### Para integrar un nuevo vendor

```
1. DOC 08 — Entender el motor de API Mappings
2. DOC 25 — Guía técnica de API Mappings para desarrolladores
3. DOC 26 — Paso a paso en el panel admin
4. DOC 20-22 — Referencia LATCOM como ejemplo de integración existente
```

### Para resolver un problema en producción

```
1. DOC 31 — Árbol de diagnóstico y comandos
2. DOC 30 — Procedimientos de operación y mantenimiento
3. DOC 22 — Códigos de error de LATCOM (si es vendor-related)
4. DOC 23 — Flujos de negocio (para entender qué debería pasar)
```

### Para capacitar a un administrador

```
1. DOC 32 — Guía específica para administradores
2. DOC 14 — Detalle de cada tab del panel admin
3. DOC 23 — Flujos de negocio para entender el contexto
```

### Para capacitar a soporte técnico

```
1. DOC 33 — Guía de soporte técnico
2. DOC 30 — Operación y monitoreo
3. DOC 35 — Glosario de términos
4. DOC 22 — Códigos de error de LATCOM
```

---

## RESUMEN TÉCNICO DEL SISTEMA <a name="tecnico"></a>

### Stack Completo

```
INFRAESTRUCTURA:
  Servidor: Ubuntu 24.04 LTS (CalmetServer, IP 77.42.92.151)
  Proxy: Nginx 1.24 con SSL auto-firmado
  Procesos: systemd (3 servicios)
  Firewall: UFW (puertos 22, 80, 443, 8100)

BACKEND:
  Framework: FastAPI 0.120.4
  Runtime: Python 3.11.7 (virtualenv)
  ORM: SQLAlchemy 2.0.44 (async)
  Validación: Pydantic 2.12.3
  BD Driver: asyncpg 0.30.0
  HTTP Client: httpx 0.25.2
  Auth: JWT (python-jose) + bcrypt (passlib)
  Puerto: 8100

BASE DE DATOS:
  Motor: PostgreSQL 14.19
  BD: latconecta_db
  Tablas: 11
  Puerto: 5432

FRONTENDS:
  Framework: React 18 + Vite 5 + Tailwind CSS 3
  Admin: Puerto dev 5173 / Nginx /latconecta_admin
  Users: Puerto dev 5174 / Nginx /latconecta_users
  HTTP Client: Axios

VENDOR SIMULATOR:
  Framework: Flask (Python)
  Puerto: 5001

VENDOR PRINCIPAL:
  LATCOM Internacional (plataforma Relier)
  URL UAT: https://latcom-fix-production.up.railway.app
  Auth: x-api-key + x-customer-id
  Contacto: Richard Mas (jcalmett@latcom.co)

GATEWAY DE PAGOS:
  Izipay (SDK nuevo, no KRGlue)
  URL Sandbox: https://sandbox-api-pw.izipay.pe
  URL SDK: https://sandbox-checkout.izipay.pe/payments/v1/js/index.js
```

### Datos de Acceso Rápido

```
Servidor: ssh usuario@77.42.92.151
BD: sudo -u postgres psql latconecta_db
Admin: https://77.42.92.151/latconecta_admin
Users: https://77.42.92.151/latconecta_users
API: http://77.42.92.151:8100/docs
Health: http://77.42.92.151:8100/health

Superadmin: admin@bitel.com.pe / admin123
Usuario prueba: juan@email.com / admin123
```

---

## PRINCIPIOS DE DISEÑO FUNDAMENTALES <a name="principios"></a>

Estos principios guían todas las decisiones de diseño del sistema. Antes de hacer cualquier cambio significativo, verificar que se alinea con ellos.

### 1. Configuración en BD, no en código

Las integraciones con vendors (API Mappings), los catálogos (países, servicios, compañías, productos) y las credenciales (vendors) se configuran en la BD — nunca en el código fuente. Esto permite agregar un nuevo vendor en 15 minutos sin hacer deploy.

### 2. Sin código específico por vendor

El código de `purchases.py` y `universal_vendor_service.py` es completamente genérico. Nunca debe aparecer `if vendor_code == 'LATCOM':` en el código. Toda la especificidad del vendor vive en la tabla `vendor_api_mappings`.

### 3. Sin código específico por gateway

El código de `purchases.py` nunca referencia "Izipay" directamente. Siempre usa `payment_gateway.process()`. El gateway activo se determina por `DEPLOYMENT_COUNTRY` en `.env`.

### 4. Evidencia completa de transacciones

Cada compra en la tabla `purchases` debe guardar el JSON completo enviado al vendor (`vendor_request`) y el JSON completo recibido (`vendor_response`). Esto es no negociable para auditoría y soporte.

### 5. El .env controla el ambiente — nunca el código

El mismo código funciona en development, UAT y production. Solo cambia el `.env`. No debe existir lógica como `if environment == "dev":` en el código de negocio.

### 6. HTTPS siempre en servidor

El SDK de Izipay requiere `crypto.subtle` que solo funciona en HTTPS. El servidor siempre debe servir los frontends con HTTPS, incluso en desarrollo/UAT.

### 7. Compras anónimas son ciudadanos de primera clase

Un usuario no registrado puede completar el flujo completo de compra. `purchase_user_id = NULL` es un estado válido y esperado, no un error.

---

## DECISIONES DE ARQUITECTURA CLAVE <a name="decisiones"></a>

Estas son decisiones que ya se tomaron y no deben revertirse sin consideración cuidadosa.

| Decisión | Alternativa descartada | Razón |
|----------|----------------------|-------|
| API Mappings en BD | Código Python por vendor | Permite agregar vendors sin deploy |
| country_code alpha-3 en BD | alpha-2 directamente | Más explícito, transformación al enviar |
| Izipay SDK nuevo (no KRGlue) | Sistema KRGlue/Lyra antiguo | Soporta Yape, Plin, más métodos |
| Control de operaciones en memoria | En BD | Más rápido, sin queries adicionales |
| Vendor Simulator separado (Flask) | Integrado en backend | Independiente del backend, más realista |
| SQLAlchemy async | Sync | Mejor performance con FastAPI async |
| Pydantic v2 | Pydantic v1 | Mejor performance, mejor error messages |
| JWT stateless | Sessions en BD | Sin estado en backend, más escalable |
| Snapshots en purchases | FK a vendor_products | Historial inmutable aunque cambien los precios |
| Balance dual en vendors | Solo USD | Permite balances en moneda local para Peru |
| `DEPLOYMENT_COUNTRY` para gateway | Config hardcoded | Reutilizable en múltiples países |

---

## TABLA DE REFERENCIA RÁPIDA <a name="referencia"></a>

### Comandos del Servidor (más usados)

```bash
sudo systemctl restart latconecta-backend           # Reiniciar backend
sudo systemctl status latconecta-backend             # Ver estado
sudo journalctl -u latconecta-backend -f             # Logs en tiempo real
cd /var/www/latconecta/latconecta_admin && npm run build  # Rebuild admin
cd /var/www/latconecta/latconecta_users && npm run build  # Rebuild users
sudo -u postgres psql latconecta_db                  # Conectar a BD
```

### Queries SQL Frecuentes

```sql
-- Ver últimas 10 compras
SELECT purchase_id, purchase_reference, purchase_status,
       purchase_payment_status, purchase_total_amount
FROM purchases ORDER BY purchase_date DESC LIMIT 10;

-- Compras con intervención manual
SELECT purchase_id, purchase_reference, purchase_date,
       purchase_total_amount
FROM purchases WHERE requires_manual_intervention = true;

-- Balance de vendors
SELECT vendor_code, vendor_usd_balance, vendor_local_balance,
       vendor_local_currency, is_production
FROM vendors WHERE vendor_status = 'active';

-- Ver API Mappings activos
SELECT mapping_code, vendor_code, api_group_code, operation_type, is_active
FROM vendor_api_mappings ORDER BY vendor_code, api_group_code;
```

### Transformaciones de API Mappings (referencia)

| Transformación | Ejemplo |
|----------------|---------|
| `country_alpha3_to_alpha2` | PER → PE |
| `to_upper` | bitel → BITEL |
| `to_lower` | BITEL → bitel |
| `trim` | " 987 " → "987" |
| `to_integer` | 20.0 → 20 |
| `to_float` | "20" → 20.0 |
| `add_prefix` | "987" → "51987" |
| `remove_prefix` | "51987" → "987" |
| `map_value` | {"bitel": "BIT"} |

### Estados de Compra (combinaciones válidas)

| purchase_status | purchase_payment_status | Escenario |
|----------------|------------------------|-----------|
| Pending | Pending | Barcode generado, esperando pago en agente |
| Success | Success | Transacción completada |
| Failed | Reversed | Provisión falló, pago revertido |
| Failed | Success | CRÍTICO — requires_manual_intervention=TRUE |

---

**FIN DEL DOCUMENTO 36 — DOCUMENTO MAESTRO**

*Versión: 4.0 | Fecha: Marzo 2026 | Sistema: Latconecta v2.0.0*

---

**Este es el último documento de la serie. Los 36 documentos cubren el sistema completo.**


---

<a name="37-estado-actual"></a>

# DOCUMENTO 37
## ESTADO ACTUAL DEL SISTEMA — CIERRE DE SESIÓN

**Versión:** 11.0
**Fecha:** 20 de Junio de 2026
**Sistema:** Latconecta v2.0.0
**Sesión:** Responsive admin · Fix vendor-api-mappings · Fix payments/config F1/F2

---

## CONTENIDO

1. [Estado Git](#git)
2. [Trabajo Realizado](#trabajo)
3. [Estado de Pruebas por Vendor](#pruebas)
4. [Configuración BD — Estado Actual](#bd)
5. [Pendientes](#pendientes)
6. [Transacciones de Referencia](#transacciones)
7. [Números de Prueba por Vendor](#numeros)
8. [Tarjetas de Prueba Culqi](#tarjetas)
9. [Checklist de Go-Live a Producción](#golive)

---

## ESTADO GIT <a name="git"></a>

**Rama activa:** `main`
**Repositorio:** `git@github.com:jcalmett/Latconecta.git`

### Commits recientes (cronológico)

| Fecha | Hash | Descripción |
|-------|------|-------------|
| 17/05/2026 | 6b51098 | fix: Culqi fase2 — basename router, isSubmitting ref, vite base, card mode |
| 17/05/2026 | ebd6c07 | fix: navegación SPA — rutas absolutas corregidas, setShowGatewayCheckout activado |
| 04/06/2026 | 2bc0792 | feat: LR-001 Libro de Reclamaciones Virtual — 21 archivos, 2693 líneas |
| 08/06/2026 | 3c1744e | fix: LR-001 registro complaints router, modelos, upload order, apscheduler |
| 09/06/2026 | 2174406 | fix: email siempre requerido en LR-001, eliminar forzado canal CARTA, recalculo fecha límite rechazo oferta |
| 09/06/2026 | 851f04b | fix: exception handler 404 preserva detail del service |
| 11/06/2026 | — | feat: IGV/IVA configurable por país, desglose en recibo, PDF descarga directa, TXT ASCII |
| 16/06/2026 | c466902 ebaa52d 3a27a9c | UX: fusión detalle+validación, paymentPhase, salto Step4, reintentos Culqi, pestañas dinámicas, object-contain |
| 19/06/2026 | 90497ad | Legal: AvisoLegal+Terminos+Privacidad, Footer actualizado, responsive completo, productos TopUps BD estandarizados |
| 19/06/2026 | d4c28f0 | security: OperationsPanel solo en dev, operations endpoints con auth admin, rate limit validate, receip-url ownership |
| 19/06/2026 | da47e66 | security: OperationsPanel con PIN de acceso, ops endpoints protegidos por PIN, fix payments/config hardcoded fase2 |
| 20/06/2026 | — | UX admin: responsive header/footer/tabs, object-contain imágenes, WelcomeView sin alturas fijas, fix vendor-api-mappings schema |

**Estado:** Todos pusheados a `main`. CalmetServer sincronizado.

---

## TRABAJO REALIZADO <a name="trabajo"></a>

### Sesiones anteriores (hasta 17/05/2026)
Ver versión 5.0 del Documento 37.

### Sesión 04/06/2026: LR-001 Deploy inicial
- Commit `2bc0792` — 21 archivos, 2693 líneas
- Migraciones SQL aplicadas: `complaint_records`, `complaint_offers`, `calendar_holidays`
- Upload dir creado: `/var/www/latconecta/backend/uploads/reclamaciones/`

### Sesión 08-09/06/2026: LR-001 Correcciones post-deploy

#### Bugs corregidos

| Bug | Fix |
|-----|-----|
| Complaints router no registrado en `main.py` — 404 en todos los endpoints LR-001 | Registrado con `app.include_router(complaints_router, prefix="/api/v1")` |
| `ComplaintRecord`/`ComplaintOffer` no importados en `models/__init__.py` | Agregados los imports |
| Orden routers upload — `upload.router` (con auth) registrado antes que `upload_reclamaciones_router` (sin auth) — 401 en upload de documentos | Invertido el orden: reclamaciones primero |
| `apscheduler` no instalado — scheduler alertas vencimiento fallaba al arrancar | Instalado + agregado a `requirements.txt` |
| Nginx: 413 en upload documentos en `peruse.latconecta.com` | `client_max_body_size 10M` en server block peruse |
| Exception handler 404 genérico sobreescribía detail específicos del service | Reemplazado con `StarletteHTTPException` handler que preserva detail |
| `consultarEstado` en `complaintsService.js` usaba `GET` con path param | Corregido a `POST /reclamaciones/consultar` con body |
| Email inválido forzaba canal CARTA silenciosamente | Email siempre requerido — error claro al usuario. Canal elegido libremente por el consumidor |
| Recálculo fecha límite al rechazar oferta sumaba días incorrectamente | Reanudar desde hoy con días hábiles restantes antes de la suspensión (Art. 6-A DS 101-2022) |

#### QA LR-001 — 19/19 pruebas pasadas

| ID | Caso | Estado |
|---|---|---|
| QA-01 | Registro sin autenticación | ✅ |
| QA-02 | Acuse al email del formulario | ✅ |
| QA-03 | Canal CARTA — dirección requerida | ✅ |
| QA-04 | Leyenda Art. 13 en formulario | ✅ |
| QA-05 | Aclaración Art. 3 en selector | ✅ |
| QA-06 | Menor de edad — representante | ✅ |
| QA-07 | PurchasePopup — solo aviso | ✅ |
| QA-08 | Acceso desde inicio | ✅ |
| QA-09 | Consulta número sin guión | ✅ |
| QA-10 | Consulta DNI incorrecto | ✅ |
| QA-11 | Upload documentos JPG/PDF | ✅ |
| QA-12 | Upload formato inválido | ✅ |
| QA-13 | Flujo oferta — acepta | ✅ |
| QA-14 | Flujo oferta — rechaza + notificación admin | ✅ |
| QA-15 | Historial de ofertas | ✅ |
| QA-16 | Cálculo fecha límite con feriado | ✅ |
| QA-17 | Semáforo admin | ✅ |
| QA-18 | Exportación CSV INDECOPI | ✅ |
| QA-19 | Email inválido con domicilio | ✅ |

**Estado LR-001:** ✅ COMPLETAMENTE OPERATIVO

### Sesión 20/06/2026: Responsive Admin + Fixes Backend

#### Responsive design latconecta_admin
- `LatconectaAdmin.jsx` — Header: logo `h-12 lg:h-16`, padding `px-4 py-3`, botones con labels ocultos en móvil; Footer: 2 columnas (eliminada columna Historia y Legal), dirección fiscal correcta, copyright dinámico LATCOM HORIZONS PERU S.R.L.
- `WelcomeView.jsx` admin — eliminadas alturas fijas `height:vh` y márgenes negativos; layout con `py` responsivo; lema 1 `text-xl md:text-3xl`; footer `py-3 mt-2`; carrusel altura fija 180px
- Tabs: padding `px-3 md:px-5 py-2 md:py-3`, contenido `p-3 md:p-6`

#### Imágenes object-contain en admin
- `CompaniesTab.jsx` — foto marketing: `object-cover` → `object-contain bg-gray-50`
- `CountriesTab.jsx` — bandera en tabla y fotos en formulario: `object-cover` → `object-contain`
- `LatconectaTab.jsx` — 5 fotos marketing: `object-cover` → `object-contain bg-gray-50`
- `ProductsTab.jsx` — foto producto en tabla y formulario: `object-cover` → `object-contain`
- `ServicesTab.jsx` — fotos servicio en tabla y formulario: `object-cover` → `object-contain`
- Avatares (Users, Profile, Header) mantienen `object-cover` — recorte circular intencional

#### Fix vendor-api-mappings — 500 Internal Server Error
**Causa 1:** `catalog_sync` no estaba en la lista de `operation_type` válidos en el schema del servidor
**Fix:** `sed -i` en `/var/www/latconecta/backend/app/schemas/vendor_api_mapping.py` — agregado `catalog_sync`

**Causa 2:** `response_mapping: Optional[Dict[str, str]]` — no acepta `null` como valor dentro del dict
**Fix:** Cambiado a `Optional[Dict[str, Any]]` en líneas 93 y 170 del schema

#### Fix payments/router — card.mode hardcodeado fase2
`GET /payments/config` tenía `card.mode` y `barcode.mode` hardcodeados en `"fase2"`.
El frontend siempre abría Culqi independientemente del OperationsPanel.
**Fix:** Conectado con `ops_config.get_mode("pago_tarjeta")` y `ops_config.get_mode("pago_barcode")`.

---

### Sesión 19/06/2026 (tarde): Auditoría de Seguridad + Fix F1/F2

#### Fix crítico — payments/router.py
`GET /payments/config` tenía `card.mode` y `barcode.mode` hardcodeados en `fase2`.
El frontend siempre abría Culqi independientemente del OperationsPanel.
**Fix:** conectar con `ops_config.get_mode()` — ahora respeta F1/F2 configurado en el panel.

#### Correcciones de seguridad aplicadas

| # | Hallazgo | Corrección | Archivo |
|---|----------|-----------|---------|
| 1 | OperationsPanel visible en producción | Controlado por `VITE_SHOW_OPS_PANEL` | App.jsx, ShopView.jsx |
| 2 | Operations endpoints sin auth | Protegidos por PIN (`X-Ops-Pin` header) | operations_config.py |
| 3 | PATCH receip-url sin ownership | Valida que la compra pertenece al usuario | purchases.py |
| 4 | console.warn exponía estado del token | Eliminado | api.js (admin) |
| 5 | validate-phone/account sin rate limit | Agregado `20/minute` | purchases.py |
| 6 | Validación URL en receip-url | Solo acepta URLs del propio dominio | purchases.py |

#### Sistema de PIN para OperationsPanel
- `OPS_PANEL_PIN` en `.env` del backend — PIN requerido para cambiar F1/F2
- Frontend envía PIN en header `X-Ops-Pin` en cada request al panel
- PIN guardado en `sessionStorage` — dura mientras la pestaña esté abierta
- En producción: `OPS_PANEL_PIN` vacío → panel deshabilitado en backend
- `VITE_SHOW_OPS_PANEL=false` en `.env.production` → botón oculto en frontend

#### Estado de ambientes F1/F2

| Nivel | ops_config | VENDOR_SIMULATOR | Pago | Provisión |
|-------|-----------|-----------------|------|-----------|
| F1 puro | fase1 (default) | irrelevante | Simulado | Simulada |
| F2 + simulator | fase2 (panel) | True + restart | Culqi sandbox | Flask local |
| F2 + vendor QA | fase2 (panel) | False + restart | Culqi sandbox | TISI/MEGAPUNTO QA |

**Estado actual:** `VENDOR_SIMULATOR_ENABLED=False` (vendor real TISI sandbox)

---

### Sesión 16/06/2026: Simplificación flujo compra + Pago directo Culqi

#### Limpieza de código
- `latconecta_admin/src/config/api.js` — eliminados `console.log` que exponían token JWT
- `latconecta_users/src/services/purchasesService.js` — eliminada variable `API_URL` no usada
- `backend/requirements.txt` — encoding UTF-16 → UTF-8 sin BOM, eliminado `redis==5.0.1` duplicado

#### Flujo de compra simplificado (ShopView.jsx + PurchasePopup.jsx + CulqiCheckout.jsx)
- Eliminado `ProductDetailModal` — click en producto abre directamente Step 2 con detalle + validación
- `handleProductClick()` ahora async — absorbe lógica de `handleBuyClick()` eliminado
- Botón "Ver Detalles" → "Comprar"
- Rutas `href="/latconecta_users/select"` corregidas a `<Link to="/select">` — fix pantalla en blanco
- Nuevo estado `paymentPhase` reemplaza múltiples booleanos de gateway
- Salto automático Step 4 con un solo método de pago disponible
- `hiddenByculqi` evita flash del header "Método de Pago" durante Culqi
- `CulqiCheckout`: `onRetry`/`onAbort` con reintentos hasta 3, mensaje de error específico
- Pestañas del catálogo dinámicas — solo muestra el servicio de la compañía seleccionada
- Imágenes: `object-cover` → `object-contain` en productos, banderas y logos

**Commits:** `c466902`, `ebaa52d`, `3a27a9c`

---

### Sesión 19/06/2026: Responsive · Legal · Productos BD · Culqi

#### Responsive design (latconecta_users)
- `Header.jsx` — logo `h-14 lg:h-16`, padding `px-4 py-3`
- `Footer.jsx` — reducido a 3 columnas, `py-4`, Libro de Reclamaciones en línea con enlaces
- `WelcomeView.jsx` — eliminadas alturas fijas `height:vh` y `margin` negativos, layout flex sin superposición
- `SelectView.jsx` — dropdowns País + Servicio en una sola línea horizontal en desktop; móvil dos líneas; grid compañías `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- `ShopView.jsx` — encabezado compacto, grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- `index.css` — CSS global para limitar modal Culqi en pantallas `≤1024px`

#### Páginas legales (nuevas vistas)
- `AvisoLegalView.jsx` — `/aviso-legal`
- `TerminosView.jsx` — `/terminos` (incluye definición OSIPTEL, política de reembolsos, proceso de compra)
- `PrivacidadView.jsx` — `/privacidad` (Ley N° 29733, campos reales del registro)
- `App.jsx` — 3 rutas nuevas registradas sin auth
- `Footer.jsx` — columna "Legal" con enlaces a las 3 páginas + Libro de Reclamaciones; dirección fiscal correcta; copyright LATCOM HORIZONS PERU S.R.L.

#### Estandarización productos TopUps en BD
- 20 productos Perú renombrados: formato `Recarga [Operadora] S/[monto]`
- 22 productos Venezuela renombrados: formato `Recarga [Operadora] [monto] Bs`
- Descripciones estandarizadas con referencia a OSIPTEL (Perú) y descripción clara (Venezuela)
- 3 productos TEST desactivados (Claro/Entel/Movistar S/3 TEST) — luego reactivados para pruebas

#### Observaciones Culqi — estado
- Ficha RUC: disponible para envío
- Sustento TopUps: documento preparado
- Términos, Privacidad, Aviso Legal: publicados en el sitio
- Libro de Reclamaciones: ya implementado
- Imágenes y descripciones de productos: corregidas

**Pendiente Culqi:** Enviar correo con ficha RUC + sustento + URLs de páginas legales

**Commit:** `90497ad`

---

### Sesión 11/06/2026: IGV configurable + Recibo completo

#### IGV/IVA por país de instalación

- Nuevos parámetros en `config.py` y `.env`: `TAX_LABEL=IGV`, `TAX_RATE=0.18`
- `purchase_calculator_service.py` — función `_calculate_tax()`: `igv = ROUND(total/1.18 * 0.18, 2)`, `base_imponible = total - igv`
- Regla de redondeo: total fijo → IGV redondeado → base absorbe residuo (protección cliente + SUNAT)
- Campos nuevos en `PurchaseCalculation`: `purchase_tax_label`, `purchase_tax_rate`, `purchase_tax_amount`, `purchase_base_imponible`
- Campos nuevos en `PurchaseResponse`: mismos 4 campos

#### Recibo de compra — formato SUNAT

El recibo (pantalla, PDF, TXT) ahora muestra:
```
Valor de venta:    PEN XX.XX
Descuento (X%):   -PEN XX.XX  [si aplica]
Comisión:         +PEN XX.XX  [si aplica]
Op. Gravada:       PEN XX.XX
IGV (18%):        +PEN XX.XX
──────────────────────────────
IMPORTE TOTAL:     PEN XX.XX  ← siempre igual al monto cobrado
```

#### Renombrado `purchase_receip_image` → `purchase_receip_url`

- Migración aplicada: `ALTER TABLE purchases RENAME COLUMN purchase_receip_image TO purchase_receip_url`
- Campo actualizado en: `models/purchase.py`, `schemas/purchase.py`, `schemas/vendor_api_mapping.py`, `routers/purchases.py`, `PurchaseDetailModal.jsx`
- Nuevo endpoint: `PATCH /purchases/{id}/receip-url` para guardar URL del PDF generado

#### PDF descarga directa

- El PDF se genera con jsPDF y se descarga directamente al dispositivo (`doc.save()`)
- TXT: separadores reemplazados por ASCII `===` (compatible con todos los dispositivos)

#### Documento generado

- `IGV_Tratamiento_Latconecta.docx` — base legal, criterio de redondeo, formato SUNAT

---

## ESTADO DE PRUEBAS POR VENDOR <a name="pruebas"></a>

### Culqi — Gateway de Pagos (Perú)

| Prueba | Estado | Notas |
|--------|--------|-------|
| Cargo con tarjeta (simulador) | ✅ Funcional | `chr_test_t05WaQ7GE3g84CMn` |
| Refund con tarjeta (simulador) | ✅ Funcional | `ref_test_LsJJ6U7hiPxJrlYK` |
| Cargo con Yape (simulador) | ✅ Funcional | `chr_test_bBByv5q9X7Ne109g` |
| Cargo en Latconecta Users (F1) | ✅ Funcional | Probado sesión 11/06/2026 |
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
| Movistar Fijo | ⏳ Pendiente | Número no disponible |
| Movilnet | ⏳ Pendiente | Número disponible — prueba sin ejecutar |

### LATCOM / VIAONE — México

| Operadora | Estado | Notas |
|-----------|--------|-------|
| Movistar | ✅ Funcional | Purchase ID 15 — 300 MXN exitosa |
| Telcel | ✅ Funcional | Validado |
| ATT | ✅ Funcional | Validado |

### Pruebas TISI — Sesión 08/06/2026

| Operadora | skuid | Número | Resultado |
|---|---|---|---|
| Movistar Perú | 907 | 990388408 | ✅ Código 00 — nro_transaccion: 8224 |
| Bitel Perú | 66 | 998877543 | ⚠️ Código 99 — limitación QA |
| Entel Perú | 67 | 919499716 | ⚠️ Código 99 — limitación QA |
| Claro Perú | 70 | 999888777 | ⚠️ Código 99 — limitación QA |
| Movistar Celular VEN | 5580 | 04241403958 | ⚠️ Código 99 — limitación QA |
| Movilnet VEN | 5582 | 04129000001 | ⚠️ Código 99 — limitación QA |

**Estado informe TISI:** Enviado `Informe_Pruebas_TISI_20260604.docx`. Esperando respuesta con números oficiales. NO repetir pruebas hasta recibir respuesta.

---

## CONFIGURACIÓN BD — ESTADO ACTUAL <a name="bd"></a>

### Migraciones aplicadas en producción

| Fecha | Migración |
|-------|-----------|
| 04/06/2026 | LR-001: `complaint_records`, `complaint_offers`, `calendar_holidays`, secuencia correlativo |
| 04/06/2026 | LR-002: `complaint_offers` tabla |
| 04/06/2026 | LR-003: campos `doc1_url`, `doc1_nombre`, `doc2_url`, `doc2_nombre` en `complaint_records` |
| 11/06/2026 | `ALTER TABLE purchases RENAME COLUMN purchase_receip_image TO purchase_receip_url` |

### Variables .env activas en servidor

```bash
PAYMENT_GATEWAY=culqi
DEPLOYMENT_COUNTRY=PE
CULQI_PUBLIC_KEY=pk_test_7jTfx9nRR69ACCpu
CULQI_SECRET_KEY=sk_test_sG8xgqCq1r1xq7fc
BARCODE_AVAILABLE=False
SUPPORT_EMAIL=latconecta.digital@gmail.com
TAX_LABEL=IGV
TAX_RATE=0.18
```

---

## PENDIENTES <a name="pendientes"></a>

### Culqi — Pendientes de Prueba

| # | Ítem | Prioridad |
|---|------|-----------|
| 1 | Cargo real con tarjeta habilitada (mínimo S/6.00) | Alta |
| 2 | Verificar refund con tarjeta real desde simulador | Alta |
| 3 | Prueba flujo completo Fase 2 provision + Culqi real | Alta |
| 4 | Crear comercio LATCONECTA en CulqiPanel | Media |

### UX — Mejoras completadas

| # | Ítem | Estado |
|---|------|--------|
| UX-01 | Flash modal "Método de Pago" durante Culqi | ✅ Resuelto — `paymentPhase` + `hiddenByculqi` |
| UX-02 | Modal detalle producto innecesario | ✅ Resuelto — fusión en Step 2 |
| UX-03 | Step 4 con un solo método de pago | ✅ Resuelto — salto automático |
| UX-04 | Sin feedback al rechazar tarjeta | ✅ Resuelto — modal reintento con mensaje específico |
| UX-05 | Responsive laptop 14" y móvil 6" | ✅ Resuelto — grids adaptativos, alturas flexibles |

### Técnicos — Desarrollo pendiente

| # | Ítem | Descripción |
|---|------|-------------|
| 1 | Verificación de correo en registro | Al registrarse, crear usuario con `user_status='pending'`, enviar código 6 dígitos por SMTP, confirmar en frontend antes de activar. APScheduler limpia pendientes expirados. Cero cambios de esquema en BD — reutiliza `user_session_token` y `user_session_expiry`. |
| 2 | Console.logs producción (ShopView y services) | `console.log` activos en ShopView (21 ocurrencias), companiesService, servicesService, countriesService — exponen datos en DevTools |
| 3 | productsService inconsistencia | `response.data` vs `response` directo — el fallback funciona pero es frágil |
| 4 | setTimeout en render PurchasePopup | Step 3 con amount_type='V' usa setTimeout dentro del render — caso teórico pero problemático |

### Culqi — Pendientes

| # | Ítem | Prioridad |
|---|------|-----------|
| 1 | Prueba Movilnet Venezuela | Bloqueado — sin número oficial de TISI |
| 2 | Renombrar `izipay_order_code` en BD | Baja |
| 3 | MEGAPUNTO Bill Payment | Bloqueado externo |
| 4 | PDF recibo — guardar URL en BD tras upload (endpoint PATCH ya existe) | Media |

---

## TRANSACCIONES DE REFERENCIA <a name="transacciones"></a>

### Culqi — Cargo + Refund exitosos (simulador)

| Campo | Cargo | Refund |
|-------|-------|--------|
| ID | chr_test_t05WaQ7GE3g84CMn | ref_test_LsJJ6U7hiPxJrlYK |
| Monto | 1500 céntimos (S/15.00) | 1500 céntimos |
| Outcome | venta_exitosa | completa |

### MEGAPUNTO Perú — Bitel exitosa

| Campo | Valor |
|-------|-------|
| Purchase ID | 26 |
| Referencia | REF-20260413210754 |
| Producto | Bitel Prepago S/5 |
| nro_transaccion TISI | 8091 |

### LATCOM México — MOVISTAR exitosa

| Campo | Valor |
|-------|-------|
| Purchase ID | 15 |
| Referencia | REF-20260415153553 |
| Producto | Recarga de saldo 300 — 300 MXN |
| transaction_id | VIA-20260415-6437 |

---

## NÚMEROS DE PRUEBA POR VENDOR <a name="numeros"></a>

### MEGAPUNTO / TISI — Perú

| Operadora | Número prueba | Importe | Estado |
|-----------|--------------|---------|--------|
| Bitel | 998877543 | S/5.00 | ✅ Validado |
| Movistar | 990388408 | S/3.00 | ✅ Validado (número oficial) |
| Entel | 919499716 | S/3.00 | ⚠️ código 99 QA |
| Claro | 999888777 | S/3.00 | ⚠️ código 99 QA |

### MEGAPUNTO / TISI — Venezuela

| Operadora | Número prueba | Estado |
|-----------|--------------|--------|
| Movistar Celular | 04241403958 | ✅ Validado |
| Digitel | 04122928915 | ✅ Validado |
| Movistar Fijo | Pendiente | ⏳ Sin número oficial |
| Movilnet | Pendiente | ⏳ Sin número oficial |

### LATCOM / VIAONE — México

| Operadora | Número prueba | Montos válidos |
|-----------|--------------|----------------|
| MOVISTAR | 5511921174 | 80, 250, 300, 400, 500 MXN |
| TELCEL | 9991653533 | 80, 300, 500 MXN |
| ATT | 5657936767 | 100, 150, 200 MXN |

---

## TARJETAS DE PRUEBA CULQI <a name="tarjetas"></a>

| Red | Número | Vencimiento | CVV | Resultado |
|-----|--------|-------------|-----|-----------|
| Visa | 4111 1111 1111 1111 | Cualquier futura | 123 | Aprobada |
| Visa | 4000 0200 0000 0000 | Cualquier futura | 123 | Fondos insuficientes |
| Visa | 4000 0300 0000 0004 | Cualquier futura | 123 | Tarjeta robada |
| Mastercard | 5111 1111 1111 1118 | Cualquier futura | 123 | Aprobada |

### Limitaciones del ambiente de pruebas
- Monto mínimo: S/6.00 para Orders
- Límite diario por correo/tarjeta/dispositivo — se resetea al día siguiente
- Token expira 15 minutos tras la generación

---

## CHECKLIST DE GO-LIVE A PRODUCCIÓN <a name="golive"></a>

### Culqi — Configuración Producción

```bash
CULQI_PUBLIC_KEY=pk_live_NUEVA_LATCONECTA
CULQI_SECRET_KEY=sk_live_NUEVA_LATCONECTA
```

### BD — Cambios de Configuración

```sql
UPDATE vendors SET auto_sync_products = true, sync_time = '06:00' WHERE vendor_code = 'MEGAPUNTO';
UPDATE vendors SET is_production = true WHERE vendor_code = 'LATCOM';
UPDATE vendors SET is_production = true WHERE vendor_code = 'MEGAPUNTO';
```

### .env — Variables de Entorno Producción

```bash
ENVIRONMENT=production
VENDOR_SIMULATOR_ENABLED=false
CARD_AVAILABLE=True
BARCODE_AVAILABLE=False
PAYMENT_GATEWAY=culqi
TAX_LABEL=IGV
TAX_RATE=0.18
CULQI_PUBLIC_KEY=pk_live_NUEVA_LATCONECTA
CULQI_SECRET_KEY=sk_live_NUEVA_LATCONECTA
```

### Verificaciones Pre-Launch

1. Crear comercio LATCONECTA en CulqiPanel y obtener llaves `pk_live_` / `sk_live_`
2. Actualizar llaves en `.env` y reiniciar backend
3. Probar cargo real con tarjeta real (S/6.00 mínimo)
4. Ejecutar sync manual antes del primer día de operación
5. Verificar token MEGAPUNTO en startup
6. Confirmar TC del día — el sync lo actualiza automáticamente
7. Probar recuperación de contraseña desde `latconecta.digital@gmail.com`
8. Confirmar que `BARCODE_AVAILABLE=False` en Perú

---

**FIN DEL DOCUMENTO 37**

*Versión: 11.0 | Fecha: 20 de Junio de 2026 | Sistema: Latconecta v2.0.0*
*Cambios v11.0: Responsive admin (LatconectaAdmin, WelcomeView, tabs). Object-contain en 15 imágenes del admin. Fix vendor-api-mappings 500: catalog_sync en schema + Dict[str,Any] para array_path. Fix payments/config hardcoded fase2 → ops_config dinámico. Cambios v10.0: Auditoría seguridad — 6 correcciones. Fix payments/config hardcoded fase2. PIN OperationsPanel. Documentación ambientes F1/F2/Simulator. Cambios v9.0: Responsive UI completo (Header/Footer/Welcome/Select/Shop). Páginas legales: AvisoLegal, Términos, Privacidad. Footer: dirección fiscal, copyright LATCOM. Productos TopUps estandarizados en BD (42 productos). Observaciones Culqi resueltas. Pendiente: verificación de correo en registro, console.logs producción. Cambios v8.0: paymentPhase, hiddenByculqi, fusión detalle+Step2, pestañas dinámicas, object-contain imágenes. Cambios v7.0: IGV/IVA, recibo SUNAT, PDF descarga directa.*


---

<a name="38-libro-reclamaciones"></a>

# DOCUMENTO 38
## MÓDULO LR-001 — LIBRO DE RECLAMACIONES VIRTUAL

**Versión:** 1.1
**Fecha:** Junio 2026
**Sistema:** Latconecta v2.0.0
**Normas:** DS 011-2011-PCM · DS 006-2014-PCM · DS 101-2022-PCM · Res. 0272-2024/SPC-INDECOPI

---

## CONTENIDO

1. [Visión General](#vision)
2. [Marco Normativo](#normativo)
3. [Decisiones de Diseño — Alineamiento Legal](#decisiones)
4. [Arquitectura e Integración](#arquitectura)
5. [Base de Datos](#bd)
6. [Backend — FastAPI](#backend)
7. [Integración Frontend Users](#users)
8. [Integración Frontend Admin](#admin)
9. [Sistema de Email](#email)
10. [Documentos Adjuntos](#docs)
11. [Ciclo de Vida de una Reclamación](#ciclo)
12. [Inventario de Archivos](#inventario)
13. [Despliegue y Configuración](#despliegue)
14. [Plan de Pruebas QA](#qa)
15. [Obligaciones Operativas](#operativas)

---

## VISIÓN GENERAL <a name="vision"></a>

El módulo Libro de Reclamaciones Virtual (LR-001) es una extensión nativa de LatConecta v2.0.0 que cumple con la normativa peruana de protección al consumidor. Se integra completamente en el stack existente sin dependencias externas, respetando todos los patrones arquitectónicos del sistema.

El módulo cubre el ciclo de vida completo de una reclamación: registro por el consumidor sin autenticación requerida, acuse automático por email, gestión interna por el operador, mecanismo de oferta de solución con aceptación por el consumidor, y respuesta formal dentro del plazo legal de 15 días hábiles.

> **ACCESO PÚBLICO:** El formulario de reclamaciones no requiere autenticación. El caso de diseño principal es el consumidor NO autenticado. Exigir login constituiría una barrera no prevista en la norma (precedente Res. 0187-2025/CC2 — Caso Wong, 2.5 UIT de multa).

### Componentes del Módulo

| Componente | Archivo/Ubicación | Propósito |
|---|---|---|
| Backend | `backend/app/complaints/` | Router, service, schemas, model — módulo FastAPI nativo |
| Upload público | `backend/app/routers/upload_reclamaciones.py` | Endpoint sin auth para documentos adjuntos |
| BD Principal | `complaint_records` | Almacena todas las hojas de reclamación (Anexo I completo) |
| BD Historial | `complaint_offers` | Historial de ofertas de solución (múltiples ciclos) |
| BD Feriados | `calendar_holidays` | Feriados peruanos para cálculo de días hábiles |
| Frontend Users | `components/complaints/` | 5 componentes React — flujo completo del consumidor |
| Frontend Admin | `components/admin/ReclamacionesTab.jsx` | Tab 12 del panel admin — gestión y seguimiento |
| Email | `services/email_service.py` | 6 funciones nuevas — acuse, oferta, rechazo, alertas |

---

## MARCO NORMATIVO <a name="normativo"></a>

| Norma | Tipo | Relevancia para LR-001 |
|---|---|---|
| DS 011-2011-PCM | Texto refundido base | Estructura del Anexo I, plazos, obligaciones del proveedor, leyendas legales obligatorias |
| DS 006-2014-PCM | Modifica DS 011-2011 | Proveedores virtuales: acuse automático por email (Art. 4-B), libro físico de Respaldo (Art. 4-A), acceso desde página de inicio (Art. 9) |
| DS 101-2022-PCM | Modifica DS 011-2011 | Plazo de 15 días HÁBILES (Art. 6). Mecanismo de oferta de solución con suspensión del plazo (Art. 6-A) |
| Res. 0272-2024/SPC-INDECOPI | INDECOPI | Aviso del Libro de Reclamaciones en checkout — solo aviso textual, sin enlace funcional |
| Res. 0187-2025/CC2 | INDECOPI — Caso Wong | Precedente: INDECOPI sancionó (2.5 UIT) a proveedor por exigir pasos adicionales no previstos en la norma como condición para registrar un reclamo |

---

## DECISIONES DE DISEÑO — ALINEAMIENTO LEGAL <a name="decisiones"></a>

Cada decisión técnica del módulo tiene motivación normativa directa.

### 3.1 Validación del Correo Electrónico

**Decisión adoptada:** Validación de formato RFC 5322 + verificación DNS de registro MX del dominio. Sin OTP ni pasos adicionales.

**Opciones evaluadas:**
- **Opción A — OTP bloqueante:** Descartado. Riesgo normativo directo por precedente Caso Wong (Res. 0187-2025/CC2).
- **Opción B — Solo formato:** Descartado. Permite dominios inexistentes, dejando al proveedor expuesto ante INDECOPI.
- **Opción C — Formato + DNS MX:** ADOPTADA. Equilibrio entre validez y no-barrera. No es requisito adicional — es la verificación mínima para que el campo cumpla su función.
- **Opción D — Sin validación:** Descartado. El proveedor queda expuesto con `acuse_enviado=false` por email inválido.

**Tabla de decisión:**

| Email | Domicilio | Permite registro | Canal acuse |
|---|---|---|---|
| Válido (formato + MX) | Opcional | Sí | Email al correo indicado |
| No ingresado | Ingresado | Sí | Carta — admin gestiona envío físico |
| Inválido (falla MX) | Ingresado | Sí — canal forzado a CARTA | Carta — `acuse_enviado=false`, admin notificado |
| Inválido (falla MX) | No ingresado | NO — error al usuario | — |
| No ingresado | No ingresado | NO — campo mínimo faltante | — |

**Responsabilidad por datos incorrectos:** La veracidad de los datos de contacto es responsabilidad del consumidor, quien la declara mediante el checkbox de confirmación (sustituto de firma, Art. 5 DS 006-2014). El sistema no puede validar técnicamente que el domicilio sea real sin crear una barrera ilegítima.

### 3.2 Correo Destino del Acuse

**Decisión:** El acuse siempre va a `data.consumidor_email` del formulario (Sección B). **NUNCA** al email de la sesión autenticada.

**Base normativa:** Art. 4-B DS 006-2014-PCM: *"al correo electrónico indicado por el consumidor"*. La norma es explícita: el correo es el que el consumidor indica en el formulario, no el que consta en ningún otro sistema.

Si el usuario está autenticado, su email se sugiere como valor inicial editable del campo. El valor confirmado al enviar es el que la norma define como "indicado por el consumidor". El service implementa esto sin excepción: `send_complaint_ack(to_email=data.consumidor_email)`.

**Caso menor de edad:** El acuse va al `representante_email` (quien presenta la reclamación), con el nombre del menor en el cuerpo (quien es el consumidor).

### 3.3 Acceso al Formulario — Página de Inicio

**Decisión:** El enlace funcional obligatorio está únicamente en `WelcomeView`. El `PurchasePopup` solo muestra el aviso textual normalizado, sin enlace funcional.

| Ubicación | Implementación | Norma |
|---|---|---|
| WelcomeView (home) | Enlace funcional + aviso textual | Art. 4-B + Art. 9 DS 006-2014 — OBLIGATORIO |
| PurchasePopup (checkout) | Solo aviso textual sin enlace | Res. 0272-2024/SPC-INDECOPI — solo aviso |
| Footer | Imagen oficial del Libro con enlace | Acceso adicional de UX — no normativo |

### 3.4 Plazo de Respuesta — Días Hábiles

**Decisión:** El plazo de 15 días se calcula excluyendo sábados, domingos y feriados oficiales peruanos de la tabla `calendar_holidays`.

**Base normativa:** Art. 6 DS 101-2022-PCM: *"quince (15) días HÁBILES"*. La tabla `calendar_holidays` debe actualizarse cada enero con el DS de feriados del Poder Ejecutivo peruano.

### 3.5 Textos Legales — Redacción Exacta Sin Paráfrasis

Los textos legales obligatorios se reproducen literalmente:

| Texto | Redacción exacta | Norma | Ubicación |
|---|---|---|---|
| Leyenda INDECOPI | "La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI." | Art. 13 DS 011-2011 | Pie del formulario + email de acuse + confirmación |
| Aclaración reclamo | "La reclamación no constituye una denuncia y en consecuencia no inicia un procedimiento administrativo sancionador." | Art. 3.3 DS 011-2011 | Selector de tipo en formulario |
| Aclaración queja | "La queja no constituye una denuncia." | Art. 3.4 DS 011-2011 | Selector de tipo en formulario |
| Aceptación de oferta | "ACUERDO ACEPTADO PARA SOLUCIONAR EL RECLAMO" | Art. 6-A DS 011-2011 | Pantalla RespuestaOferta — confirmada con checkbox |
| Aviso normalizado | "Conforme a la Ley N° 29571, Código de Protección y Defensa del Consumidor, esta empresa cuenta con un Libro de Reclamaciones Virtual a su disposición. Tiene derecho a presentar su queja o reclamo." | Anexo III DS 006-2014 | WelcomeView + PurchasePopup |

---

## ARQUITECTURA E INTEGRACIÓN <a name="arquitectura"></a>

### 4.1 Diagrama de Integración

```
latconecta_users (React/Vite — PÚBLICO)       latconecta_admin (React/Vite)
┌──────────────────────────────────────┐      ┌────────────────────────────────┐
│  WelcomeView                          │      │  LatconectaAdmin.jsx           │
│    ├─ Aviso + Enlace LR (Art.4-B/9)  │      │    └─ ReclamacionesTab.jsx     │
│    └─ Imagen Libro en Footer         │      │         (tab 12 — nuevo)       │
│                                       │      │  complaintsAdminService.js     │
│  PurchasePopup                        │      └────────────┬───────────────────┘
│    └─ Aviso textual solo (Res.0272)  │                   │ Axios /api/v1
│                                       │                   ▼
│  LibroReclamaciones.jsx (menú)        │      ┌────────────────────────────────┐
│    ├─ FormularioReclamo.jsx           │      │  Backend FastAPI :8100          │
│    │    └─ Upload 2 documentos       │      │  backend/app/complaints/        │
│    ├─ ConfirmacionReclamo.jsx         │      │    ├─ router.py  (10 endpoints) │
│    ├─ ConsultaReclamo.jsx            │      │    ├─ service.py                │
│    └─ RespuestaOferta.jsx            │      │    ├─ schemas.py                │
│                                       │◄────►│    └─ model.py                 │
│  complaintsService.js (apiClient)    │      │                                 │
└──────────────────────────────────────┘      │  routers/upload_reclamaciones.py│
                                              │  services/email_service.py      │
                                              └────────────┬────────────────────┘
                                                           │ SQLAlchemy async
                                                           ▼
                                              ┌────────────────────────────────┐
                                              │  PostgreSQL 14 — latconecta_db  │
                                              │  ├─ complaint_records (nuevo)   │
                                              │  ├─ complaint_offers  (nuevo)   │
                                              │  └─ calendar_holidays (nuevo)   │
                                              └────────────────────────────────┘
```

### 4.2 Registro en main.py

```python
# backend/app/main.py
from app.complaints.router import router as complaints_router
from app.routers.upload_reclamaciones import router as upload_reclamaciones_router

app.include_router(complaints_router, prefix="/api/v1")
app.include_router(upload_reclamaciones_router, prefix="/api/v1")
```

### 4.3 Scheduler — Alertas de Vencimiento

El scheduler existente (APScheduler, CronTrigger) fue extendido en `events.py`:

```python
# backend/app/events.py — agregado al startup
scheduler.add_job(
    _lr_deadline_job,
    trigger=CronTrigger(hour=8, minute=0, timezone=pytz.timezone("America/Lima")),
    id="lr_deadline_check",
    replace_existing=True,
)
```

Ejecuta `check_complaint_deadlines()` diariamente a las 08:00 Lima. Envía alerta a `SUPPORT_EMAIL` para cada reclamación con ≤3 días hábiles para vencer.

---

## BASE DE DATOS <a name="bd"></a>

### 5.1 Tabla: complaint_records

Tabla principal. Contiene todos los campos del Anexo I (DS 101-2022-PCM) más los de gestión interna. Creada por migración LR-001.

| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PRIMARY KEY | Identificador interno |
| numero_correlativo | VARCHAR(20) UNIQUE | Formato 00000001-2026 — generado por secuencia |
| fecha_registro | TIMESTAMPTZ | Timestamp del registro |
| proveedor_razon_social | VARCHAR(200) | Snapshot de datos del proveedor al momento del registro |
| consumidor_nombre | VARCHAR(200) NOT NULL | Sección B — campo mínimo indispensable |
| consumidor_domicilio | TEXT NULL | Alternativo al email como campo mínimo (Art. 5) |
| consumidor_tipo_doc | VARCHAR(5) NOT NULL | DNI o CE |
| consumidor_nro_doc | VARCHAR(20) NOT NULL | Requerido para consulta de estado |
| consumidor_email | VARCHAR(200) NOT NULL | Destino del acuse — Art. 4-B DS 006-2014 |
| consumidor_menor_edad | BOOLEAN | Activa validación de representante |
| representante_nombre/email/telefono | VARCHAR | Requeridos si menor_edad=TRUE |
| bien_tipo | VARCHAR(10) | PRODUCTO o SERVICIO — CHECK constraint |
| bien_descripcion | TEXT NOT NULL | Sección C |
| bien_monto | NUMERIC(10,2) | Monto reclamado en S/ |
| tipo_reclamacion | VARCHAR(10) | RECLAMO o QUEJA — CHECK constraint |
| detalle | TEXT NOT NULL | Sección D — campo mínimo indispensable |
| pedido_concreto | TEXT NOT NULL | Lo que el consumidor solicita |
| canal_respuesta | VARCHAR(20) | CORREO_ELECTRONICO o CARTA — Art. 6 DS 101-2022 |
| direccion_correspondencia | TEXT NULL | Requerido si canal=CARTA |
| estado | VARCHAR(20) | PENDIENTE / EN_PROCESO / OFERTA_ENVIADA / RESPONDIDO / CERRADO |
| fecha_limite_respuesta | DATE NOT NULL | 15 días hábiles desde fecha_registro |
| oferta_texto | TEXT NULL | Última oferta activa del proveedor |
| oferta_respuesta | VARCHAR(10) NULL | ACEPTADA o RECHAZADA |
| fecha_suspension_plazo | DATE NULL | Día de suspensión por oferta — Art. 6-A |
| dias_suspension | INTEGER | Días de suspensión (máx. 10 calendario) |
| doc1_url / doc1_nombre | VARCHAR(500/200) | Documento adjunto 1 (migración LR-003) |
| doc2_url / doc2_nombre | VARCHAR(500/200) | Documento adjunto 2 (migración LR-003) |
| acuse_enviado | BOOLEAN NOT NULL | Flag de cumplimiento del Art. 4-B |
| acuse_enviado_at | TIMESTAMPTZ NULL | Timestamp del acuse enviado |
| user_id | INTEGER NULL | Referencia opcional al usuario autenticado |
| purchase_id | INTEGER NULL | Referencia opcional a la compra relacionada |

**Constraints:**
```sql
CHECK (tipo_reclamacion IN ('RECLAMO','QUEJA'))
CHECK (bien_tipo IN ('PRODUCTO','SERVICIO'))
CHECK (canal_respuesta IN ('CORREO_ELECTRONICO','CARTA'))
CHECK (oferta_respuesta IN ('ACEPTADA','RECHAZADA') OR oferta_respuesta IS NULL)
CHECK (estado IN ('PENDIENTE','EN_PROCESO','OFERTA_ENVIADA','RESPONDIDO','CERRADO'))
```

### 5.2 Tabla: complaint_offers

Historial completo de ofertas de solución. Permite múltiples ciclos sin sobreescribir. Creada por migración LR-002.

| Campo | Tipo | Descripción |
|---|---|---|
| id | SERIAL PRIMARY KEY | Identificador interno |
| complaint_id | INTEGER FK complaint_records | Relación con la reclamación |
| numero_correlativo | VARCHAR(20) | Referencia al número de reclamación |
| oferta_texto | TEXT NOT NULL | Texto de la propuesta del proveedor |
| enviada_at | TIMESTAMPTZ | Momento del envío |
| enviada_por | VARCHAR(100) | Email del admin que envió |
| respuesta | VARCHAR(10) NULL | ACEPTADA, RECHAZADA o NULL (pendiente) |
| respuesta_at | TIMESTAMPTZ NULL | Momento en que el consumidor respondió |
| observacion | TEXT NULL | Comentario del consumidor al rechazar |

### 5.3 Tabla: calendar_holidays

Feriados peruanos para cálculo de días hábiles. Precargada con feriados 2026 (13 feriados nacionales según DS vigente). Requiere actualización anual cada enero. Creada por migración LR-001.

### 5.4 Secuencia y Función del Número Correlativo

```sql
CREATE SEQUENCE seq_complaint_correlativo START 1 INCREMENT 1 NO CYCLE;

CREATE OR REPLACE FUNCTION generate_complaint_number(p_year INTEGER)
RETURNS VARCHAR AS $$
BEGIN
  RETURN LPAD(nextval('seq_complaint_correlativo')::TEXT, 8, '0') || '-' || p_year::TEXT;
END;
$$ LANGUAGE plpgsql;
-- Resultado: '00000001-2026'
```

### 5.5 Migraciones Aplicadas

| # | Archivo | Contenido | Estado |
|---|---|---|---|
| LR-001 | migration_lr_001.sql | `complaint_records`, `calendar_holidays`, secuencia, función correlativo, trigger | ✅ Aplicada |
| LR-002 | migration_lr_002.sql | `complaint_offers`, índices, trigger | ✅ Aplicada |
| LR-003 | migration_lr_003.sql | ALTER TABLE: `doc1_url`, `doc1_nombre`, `doc2_url`, `doc2_nombre` en `complaint_records` | ✅ Aplicada |

---

## BACKEND — FASTAPI <a name="backend"></a>

### 6.1 Estructura del Módulo

```
backend/app/
├── complaints/
│   ├── __init__.py
│   ├── model.py      # SQLAlchemy: ComplaintRecord, ComplaintOffer
│   ├── schemas.py    # Pydantic: ComplaintCreate, ComplaintResponse,
│   │                 #   ComplaintConsultaRequest, OfertaRespuesta,
│   │                 #   ComplaintAdminUpdate, ComplaintOfferSchema
│   ├── service.py    # Lógica de negocio completa
│   └── router.py     # 10 endpoints FastAPI
├── routers/
│   └── upload_reclamaciones.py  # Upload público sin auth
└── services/
    └── email_service.py  # Extendido con 6 funciones LR
```

### 6.2 Endpoints

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/reclamaciones` | Público | Registra reclamo/queja. Valida email (formato+MX). Genera correlativo. Acuse automático. |
| POST | `/api/v1/reclamaciones/consultar` | Público | Consulta estado por número correlativo + DNI. Acepta formato con y sin guión. |
| GET | `/api/v1/reclamaciones/oferta/{numero}` | Público | Consulta para link del email de oferta — solo número correlativo. |
| POST | `/api/v1/reclamaciones/oferta/respuesta` | Público | Consumidor acepta o rechaza oferta. Registra en complaint_offers. Notifica admin y consumidor. |
| GET | `/api/v1/reclamaciones/mis-reclamaciones` | Autenticado | Historial del usuario autenticado. |
| GET | `/api/v1/admin/reclamaciones` | Admin | Lista paginada con filtros: estado, tipo, canal, vencimiento. |
| GET | `/api/v1/admin/reclamaciones/export` | Admin | Exporta CSV para INDECOPI — Art. 11 DS 011-2011. |
| GET | `/api/v1/admin/reclamaciones/{id}` | Admin | Detalle completo con historial de ofertas. |
| PUT | `/api/v1/admin/reclamaciones/{id}` | Admin | Actualiza estado, responde formalmente o envía oferta. |
| POST | `/api/v1/upload/reclamaciones-public` | Público | Upload de documentos adjuntos. Máx 5MB. Formatos: jpg, jpeg, png, pdf. |

**Nota sobre dependencias:** El router usa `get_current_user_required as get_current_user`, `get_current_admin_user` y `get_current_user_optional as get_optional_user` desde `app.dependencies` — nombres reales del sistema existente.

### 6.3 Lógica Principal del Service

#### registrar_reclamacion()
- Valida email (formato RFC5322 + DNS MX). Si inválido sin domicilio: HTTP 422. Si inválido con domicilio: fuerza `canal=CARTA`.
- Obtiene datos del proveedor desde tabla `latconecta` (snapshot, no hardcoded). **Nota:** la tabla `latconecta` no tiene campo `latconecta_ruc` — se usa el valor fijo `"00000000000"`.
- Genera número correlativo via `generate_complaint_number()`.
- Calcula `fecha_limite_respuesta`: +15 días hábiles excluyendo feriados.
- Envía acuse a `data.consumidor_email` (o `representante_email` si menor de edad).

#### consultar_estado()
- Normaliza el número correlativo: acepta `000000012026` y `00000001-2026`.
- Valida que el DNI coincida con el de la reclamación.

#### responder_oferta()
- Si ACEPTADA: `estado=CERRADO`, registra frase `"ACUERDO ACEPTADO PARA SOLUCIONAR EL RECLAMO"` (Art. 6-A).
- Si RECHAZADA: `estado=EN_PROCESO`. Recalcula `fecha_limite_respuesta` restituyendo días de suspensión no usados. Notifica al admin (`SUPPORT_EMAIL`) y al consumidor.
- Registra en tabla `complaint_offers` para trazabilidad completa.

#### actualizar_admin()
- Si hay `oferta_texto`: crea registro en `complaint_offers`, `estado=OFERTA_ENVIADA`, suspende plazo 10 días (Art. 6-A), envía email al consumidor con link a `RespuestaOferta.jsx`.

---

## INTEGRACIÓN FRONTEND USERS <a name="users"></a>

### 7.1 Archivos Modificados

| Archivo | Cambio | Observación |
|---|---|---|
| `App.jsx` | 2 rutas nuevas: `/reclamaciones` y `/reclamaciones/oferta/:numero` | Sin auth requerida en ambas |
| `views/WelcomeView.jsx` | Aviso obligatorio + enlace funcional visible en página de inicio | Art. 4-B + Art. 9 DS 006-2014 |
| `components/PurchasePopup.jsx` | Aviso textual en el checkout — sin enlace funcional | Res. 0272-2024/SPC-INDECOPI |
| `components/common/Footer.jsx` | Imagen oficial del Libro de Reclamaciones con enlace | Acceso adicional de UX |
| `services/complaintsService.js` | Nuevo — 4 funciones usando `apiClient` (fetch nativo) | Mismo patrón que `purchasesService.js` del sistema |

**Nota importante:** `latconecta_users` usa `apiClient` (fetch nativo en `src/services/apiClient.js`), **no Axios**. El service retorna directamente el JSON sin envoltura `.data`. Esto difiere del admin que usa Axios.

### 7.2 Componentes Nuevos en components/complaints/

| Componente | Descripción | Detalle |
|---|---|---|
| `LibroReclamaciones.jsx` | Contenedor con menú Crear / Consultar | Punto de entrada principal del módulo |
| `FormularioReclamo.jsx` | Formulario completo Anexo I (Secciones A-E) | Header amarillo corporativo (#F5C518). Sin componente Field anidado (fix pérdida de cursor). Upload 2 docs. useCallback en función set(). |
| `ConfirmacionReclamo.jsx` | Pantalla post-registro con número correlativo | Muestra acuse enviado, fecha límite, opción impresión |
| `ConsultaReclamo.jsx` | Consulta de estado por número + DNI | Acepta ambos formatos de número. Muestra semáforo de estado. |
| `RespuestaOferta.jsx` | Aceptación/rechazo de oferta del proveedor | Accesible desde link del email. Muestra frase legal exacta Art. 6-A. |

### 7.3 Rutas Registradas en App.jsx

```jsx
import LibroReclamaciones from './components/complaints/LibroReclamaciones';
import RespuestaOferta    from './components/complaints/RespuestaOferta';

// Sin autenticación requerida — formulario público
<Route path="/reclamaciones"                element={<LibroReclamaciones showNotification={showNotification} />} />
<Route path="/reclamaciones/oferta/:numero" element={<RespuestaOferta showNotification={showNotification} />} />
```

### 7.4 Flujo del Consumidor

```
WelcomeView (aviso + enlace visible)
    ↓ click "Libro de Reclamaciones"
LibroReclamaciones (menú: Crear / Consultar)
    ↓ Crear
FormularioReclamo
    ├─ Sección A: Proveedor (solo lectura, desde BD)
    ├─ Sección B: Consumidor (validación email formato+MX)
    ├─ Sección C: Bien contratado
    ├─ Sección D: Tipo + Detalle + Pedido
    ├─ Canal de respuesta: Correo / Carta
    ├─ Documentos adjuntos: hasta 2 archivos (jpg/png/pdf, 5MB)
    └─ Sección E: Checkbox confirmación + Leyenda Art.13
    ↓ POST /api/v1/reclamaciones
ConfirmacionReclamo (número correlativo + acuse)

    ↓ Consultar (desde menú)
ConsultaReclamo (número + DNI → estado actual)

    ↓ Email con link de oferta
RespuestaOferta → acepta o rechaza (POST /api/v1/reclamaciones/oferta/respuesta)
```

---

## INTEGRACIÓN FRONTEND ADMIN <a name="admin"></a>

### 8.1 Archivos Modificados

| Archivo | Cambio | Descripción |
|---|---|---|
| `pages/LatconectaAdmin.jsx` | Tab 12 `reclamaciones` + import `ReclamacionesTab` | Tab registrado en array de tabs y en `renderTabContent()` |
| `services/complaintsAdminService.js` | Nuevo — 4 funciones usando Axios (apiClient del admin) | **Patrón Axios con `res.data`** — diferente al apiClient fetch del users. Import desde `'../config/api'`. |

### 8.2 ReclamacionesTab.jsx — Tab 12

El tab sigue el mismo patrón de todos los tabs del admin: tabla paginada con filtros y modal de gestión. El modal tiene 4 sub-tabs para organizar la información completa.

| Elemento | Descripción | Detalle |
|---|---|---|
| Filtros | Estado, Tipo, Canal de respuesta, Vencimiento próximo (≤3d) | Combinables entre sí |
| Tabla | N° correlativo, Fecha, Tipo, Consumidor, Canal, Estado, Semáforo plazo, Docs (📎) | Semáforo: verde≥8d, amarillo4-7d, naranja1-3d, rojo≤0d |
| Modal — Tab Reclamo | Detalle completo Secciones A-D del Anexo I | Solo lectura — toda la información del expediente |
| Modal — Tab Gestión | Estado, Responsable, Respuesta formal, Oferta de solución | Al guardar con oferta: `estado=OFERTA_ENVIADA` + email al consumidor |
| Modal — Tab Documentos | Visualización inline de imágenes; link para PDFs | Muestra doc1 y doc2 si existen |
| Modal — Tab Ofertas | Historial cronológico de todas las ofertas y respuestas | Con estado ACEPTADA/RECHAZADA/PENDIENTE por oferta |
| Exportar CSV | Descarga con todos los campos del Anexo I | Art. 11 DS 011-2011 — para INDECOPI |

### 8.3 Registro en LatconectaAdmin.jsx

```jsx
// Import agregado:
import ReclamacionesTab from '../components/admin/ReclamacionesTab';

// En el array de tabs:
{ id: 'reclamaciones', label: '📋 Reclamaciones' }

// En renderTabContent():
case 'reclamaciones':
  return <ReclamacionesTab showNotification={showNotification} />;
```

---

## SISTEMA DE EMAIL <a name="email"></a>

Se agregaron 6 funciones nuevas a `backend/app/services/email_service.py`, siguiendo el mismo patrón de `aiosmtplib` + `MIMEMultipart` existente. Los emails usan el color amarillo corporativo (#F5C518) de LatConecta.

| Función | Cuándo se envía | Destinatario | Contenido |
|---|---|---|---|
| `send_complaint_ack()` | Al registrar una reclamación | `data.consumidor_email` (o `representante_email` si menor) | Acuse con detalle completo del Anexo I: número, fecha/hora, tipo, bien, detalle, pedido, canal, fecha límite, leyenda Art.13 |
| `send_complaint_offer()` | Al admin enviar oferta | `consumidor_email` | Texto de la oferta + enlace a `RespuestaOferta.jsx` para aceptar/rechazar |
| `send_complaint_rechazo_consumidor()` | Al consumidor rechazar oferta | `consumidor_email` | Confirmación de rechazo + fecha límite de respuesta formal |
| `send_complaint_rechazo_admin()` | Al consumidor rechazar oferta | `SUPPORT_EMAIL` | Días hábiles restantes + fecha límite para emitir respuesta formal |
| `send_complaint_alert()` | Scheduler 08:00 Lima diario | `SUPPORT_EMAIL` | Alerta sobre reclamaciones con ≤3 días hábiles para vencer |
| `send_complaint_admin_alert()` | Caso email inválido con domicilio | `SUPPORT_EMAIL` | Indica que el acuse físico debe gestionarse manualmente |

> **Variable .env requerida:** `SUPPORT_EMAIL=soporte@latconecta.com`

---

## DOCUMENTOS ADJUNTOS <a name="docs"></a>

### 10.1 Endpoint de Upload Público

Archivo: `backend/app/routers/upload_reclamaciones.py`

| Parámetro | Valor |
|---|---|
| Endpoint | `POST /api/v1/upload/reclamaciones-public` |
| Autenticación | Ninguna — público |
| Tamaño máximo | 5MB por archivo |
| Formatos permitidos | jpg, jpeg, png, pdf |
| Validación | Formato + magic bytes (firma binaria del archivo) |
| Almacenamiento | `uploads/reclamaciones/` en el servidor |
| Respuesta | `{ success, url, filename, original_filename, size }` |

Separado del `upload.py` general que requiere autenticación, porque el formulario de reclamaciones es público.

### 10.2 Flujo en el Formulario

1. El consumidor selecciona hasta 2 archivos. Cada archivo se sube inmediatamente al seleccionarlo.
2. La URL devuelta se guarda en el estado del formulario (`doc1_url`, `doc2_url`).
3. Al registrar la reclamación, las URLs se incluyen en el payload del POST.
4. En el admin, los documentos se visualizan en el Tab Documentos del modal: imágenes inline, PDFs con enlace.

---

## CICLO DE VIDA DE UNA RECLAMACIÓN <a name="ciclo"></a>

| Estado | Significado | Acción siguiente |
|---|---|---|
| PENDIENTE | Estado inicial al registrar | Admin toma el caso y lo asigna |
| EN_PROCESO | Proveedor investigando activamente | Admin puede enviar oferta o respuesta formal |
| OFERTA_ENVIADA | Proveedor envió propuesta — consumidor tiene ≤10 días | Consumidor acepta o rechaza vía link del email |
| RESPONDIDO | Respuesta formal emitida por el canal elegido | Cierre del caso |
| CERRADO | Caso finalizado | Solo consulta |

### Flujo de Oferta — Suspensión del Plazo (Art. 6-A DS 101-2022)

```
Plazo normal: 15 días hábiles desde fecha_registro

Admin envía oferta:
  → estado = OFERTA_ENVIADA
  → fecha_suspension_plazo = hoy
  → dias_suspension = 10 (máx. calendario)
  → Plazo suspendido

Si consumidor ACEPTA:
  → estado = CERRADO
  → respuesta_proveedor = 'ACUERDO ACEPTADO PARA SOLUCIONAR EL RECLAMO'

Si consumidor RECHAZA:
  → estado = EN_PROCESO
  → dias_suspendidos = hoy - fecha_suspension_plazo
  → dias_no_usados = dias_suspension - dias_suspendidos (si > 0)
  → nueva fecha_limite = fecha_limite_anterior + dias_no_usados
  → Plazo reanudado con los días restantes
```

---

## INVENTARIO DE ARCHIVOS <a name="inventario"></a>

### Archivos Nuevos

| Archivo | Tipo | Propósito |
|---|---|---|
| `backend/app/complaints/__init__.py` | Python | Módulo Python |
| `backend/app/complaints/model.py` | Python | SQLAlchemy: ComplaintRecord, ComplaintOffer |
| `backend/app/complaints/schemas.py` | Python | Pydantic schemas (6 clases) |
| `backend/app/complaints/service.py` | Python | Lógica completa del módulo |
| `backend/app/complaints/router.py` | Python | 10 endpoints FastAPI |
| `backend/app/routers/upload_reclamaciones.py` | Python | Upload público sin auth |
| `latconecta_users/src/components/complaints/LibroReclamaciones.jsx` | React | Menú Crear/Consultar |
| `latconecta_users/src/components/complaints/FormularioReclamo.jsx` | React | Formulario Anexo I completo |
| `latconecta_users/src/components/complaints/ConfirmacionReclamo.jsx` | React | Post-registro |
| `latconecta_users/src/components/complaints/ConsultaReclamo.jsx` | React | Consulta estado |
| `latconecta_users/src/components/complaints/RespuestaOferta.jsx` | React | Aceptación/rechazo oferta |
| `latconecta_users/src/services/complaintsService.js` | JS | 4 funciones (apiClient fetch nativo) |
| `latconecta_admin/src/components/admin/ReclamacionesTab.jsx` | React | Tab 12 — gestión completa con 4 sub-tabs |
| `latconecta_admin/src/services/complaintsAdminService.js` | JS | 4 funciones (Axios con res.data) |

### Archivos Modificados

| Archivo | Cambio | Descripción |
|---|---|---|
| `backend/app/main.py` | 2 imports + 2 include_router | Registro del módulo complaints y upload_reclamaciones |
| `backend/app/events.py` | Job scheduler `lr_deadline_check` | Alertas diarias 08:00 Lima |
| `backend/app/services/email_service.py` | 6 funciones nuevas | send_complaint_ack, offer, rechazo (×2), alert, admin_alert |
| `latconecta_users/src/App.jsx` | 2 rutas nuevas | `/reclamaciones` y `/reclamaciones/oferta/:numero` |
| `latconecta_users/src/views/WelcomeView.jsx` | Aviso + enlace LR | Cumplimiento Art. 4-B + Art. 9 DS 006-2014 |
| `latconecta_users/src/components/PurchasePopup.jsx` | Aviso textual | Cumplimiento Res. 0272-2024 — solo texto, sin enlace |
| `latconecta_users/src/components/common/Footer.jsx` | Imagen oficial LR | Enlace adicional al formulario |
| `latconecta_admin/src/pages/LatconectaAdmin.jsx` | Tab 12 + import | Registro de ReclamacionesTab |

---

## DESPLIEGUE Y CONFIGURACIÓN <a name="despliegue"></a>

### Variable de Entorno Requerida

```bash
# backend/.env
SUPPORT_EMAIL=soporte@latconecta.com
```

### Dependencia Python Requerida

```bash
pip install dnspython --break-system-packages
# Agregar a requirements.txt: dnspython
```

### Directorio de Uploads

```bash
mkdir -p /var/www/latconecta/backend/uploads/reclamaciones
```

### Migraciones SQL

```bash
sudo -u postgres psql -d latconecta_db -f /tmp/migration_lr_001.sql
sudo -u postgres psql -d latconecta_db -f /tmp/migration_lr_002.sql
sudo -u postgres psql -d latconecta_db -f /tmp/migration_lr_003.sql
```

### Reset de Secuencia (solo ambiente de pruebas)

```bash
sudo -u postgres psql -d latconecta_db -c "ALTER SEQUENCE seq_complaint_correlativo RESTART WITH 1;"
sudo -u postgres psql -d latconecta_db -c "TRUNCATE complaint_offers, complaint_records RESTART IDENTITY CASCADE;"
```

### Build del Frontend

```bash
cd /var/www/latconecta/latconecta_users && npm run build
cd /var/www/latconecta/latconecta_admin && npm run build
sudo systemctl restart latconecta-backend
```

---

## PLAN DE PRUEBAS QA <a name="qa"></a>

| ID | Caso | Procedimiento | Norma/Base |
|---|---|---|---|
| QA-01 | Registro usuario NO autenticado | Completa el formulario sin login. Verifica número correlativo y acuse por email. | Art. 4-B DS 006-2014 |
| QA-02 | Acuse al email del formulario | Usuario autenticado con email A registra con email B. Verificar acuse llega a B. | Art. 4-B DS 006-2014 |
| QA-03 | Canal CARTA — dirección requerida | Seleccionar canal=Carta sin dirección → error. Con dirección → registro OK. | Art. 6 DS 101-2022 |
| QA-04 | Leyenda Art. 13 en formulario | Verificar texto exacto visible al pie antes de enviar. | Art. 13 DS 011-2011 |
| QA-05 | Aclaración Art. 3 en selector | Al cambiar Reclamo/Queja aparece la aclaración "no constituye denuncia". | Art. 3 DS 011-2011 |
| QA-06 | Menor de edad — representante | Activar checkbox menor → campos de representante obligatorios. | Art. 5 DS 011-2011 |
| QA-07 | PurchasePopup — solo aviso | Verificar que no hay enlace funcional al formulario en el checkout. | Res. 0272-2024 |
| QA-08 | Acceso en 1 clic desde inicio | Desde WelcomeView → clic en enlace → formulario. Sin pasos intermedios. | Art. 4-B DS 006-2014 |
| QA-09 | Consulta con número sin guión | Ingresar 000000012026 → debe encontrar 00000001-2026. | Funcional |
| QA-10 | Consulta con DNI incorrecto | Número correcto + DNI incorrecto → error descriptivo. | Seguridad |
| QA-11 | Upload de documentos | Subir imagen JPG y PDF. Verificar aparecen en Tab Documentos del admin. | Funcional |
| QA-12 | Upload formato inválido | Intentar subir .docx → error de formato. | Seguridad |
| QA-13 | Flujo oferta — consumidor acepta | Admin envía oferta → consumidor recibe email → acepta → estado CERRADO. | Art. 6-A DS 101-2022 |
| QA-14 | Flujo oferta — consumidor rechaza | Consumidor rechaza → admin recibe notificación → plazo reanudado correctamente. | Art. 6-A DS 101-2022 |
| QA-15 | Historial de ofertas en admin | Dos ciclos de oferta/rechazo → Tab Ofertas muestra ambos con estado correcto. | Funcional |
| QA-16 | Cálculo de fecha límite con feriado | Registrar en viernes pre-feriado → verificar que el feriado se excluye. | Art. 6 DS 101-2022 |
| QA-17 | Semáforo del admin | Caso con 2 días restantes → naranja. Vencido → rojo. | Funcional |
| QA-18 | Exportación CSV para INDECOPI | Descargar CSV → verificar todos los campos del Anexo I presentes. | Art. 11 DS 011-2011 |
| QA-19 | Email inválido con domicilio | Email con dominio inexistente + domicilio → registro OK con canal=CARTA. | Sección 3.1 |

---

## OBLIGACIONES OPERATIVAS <a name="operativas"></a>

Las siguientes obligaciones derivan de la norma pero no tienen componente de software. Son responsabilidad de la administración de LATCOM Horizons II LLC.

| Obligación | Norma | Descripción | Responsable |
|---|---|---|---|
| Libro físico de Respaldo | Art. 4-A DS 006-2014 | Adquirir y mantener un Libro de Reclamaciones físico en el domicilio fiscal. Usar cuando el sistema virtual no esté disponible. Ingresar al sistema digital en máximo 1 día calendario. | Administración LATCOM |
| Actualización anual de feriados | Art. 6 DS 101-2022 | Actualizar tabla `calendar_holidays` cada enero con los feriados oficiales del nuevo año (DS del Poder Ejecutivo peruano). Sin esto el cálculo del plazo de 15 días será incorrecto. | TI — Enero c/año |
| Procedimiento ante pérdida de datos | Art. 12 DS 011-2011 | Si se produce pérdida de registros digitales, comunicarlo a la autoridad policial en máximo 48 horas. | TI + Administración |
| Respuesta formal al consumidor | Art. 6 DS 101-2022 | Emitir respuesta formal dentro del plazo de 15 días hábiles por el canal elegido. El sistema registra el plazo y alerta, pero la respuesta es responsabilidad del equipo de operaciones. | Operaciones LATCOM |
| Conservación 2 años | Art. 12 DS 011-2011 | Los registros en BD deben conservarse 2 años desde la fecha de registro. La política de backup debe garantizarlo. | TI — política backup |
| Remisión a INDECOPI | Art. 11 DS 011-2011 | Ante requerimiento de INDECOPI: exportar CSV desde el panel admin y enviar dentro del plazo requerido. | Administración LATCOM |

---

## BUGS CORREGIDOS POST-DEPLOY <a name="bugs"></a>

### Sesión 08-09/06/2026

| Bug | Causa | Fix |
|-----|-------|-----|
| 404 en todos los endpoints LR-001 | `complaints_router` no registrado en `main.py` | Registrado con prefijo `/api/v1` |
| SQLAlchemy no conocía los modelos LR-001 | `ComplaintRecord`/`ComplaintOffer` no importados en `models/__init__.py` | Agregados imports |
| 401 en upload de documentos | `upload.router` (con auth) registrado antes que `upload_reclamaciones_router` (sin auth) — FastAPI resuelve el primero | Invertido orden de registro |
| 413 en upload `peruse.latconecta.com` | `client_max_body_size` no definido en server block de peruse | Agregado `client_max_body_size 10M` |
| Consulta muestra "Endpoint no encontrado" cuando número no existe | Exception handler 404 genérico sobreescribía detail del service | Reemplazado con `StarletteHTTPException` handler |
| Email inválido forzaba canal CARTA sin avisar | Lógica `if not email_valido: canal = "CARTA"` | Eliminado forzado — email siempre requerido, canal lo elige el consumidor |
| Recálculo fecha límite al rechazar oferta incorrecto | Sumaba `dias_suspension` restantes en lugar de reanudar días hábiles | Calcula días hábiles entre `fecha_suspension_plazo` y `fecha_limite_respuesta`, reanuda desde hoy |


---

**FIN DEL DOCUMENTO 38**

*Versión: 1.0 | Fecha: Junio 2026 | Sistema: Latconecta v2.0.0*
*Módulo: LR-001 — Libro de Reclamaciones Virtual*


---

