# Integración Culqi — Latconecta v2.0.0

**Documento técnico interno | Latcom Horizons II, LLC | Junio 2026**

---

## Tabla de Contenidos

1. [Alcance y Referencias](#1-alcance-y-referencias)
2. [Arquitectura de la Integración](#2-arquitectura-de-la-integracion)
3. [Integración del SDK — Frontend](#3-integracion-del-sdk--frontend)
4. [Backend — Módulo de Pagos](#4-backend--modulo-de-pagos)
5. [Flujo Completo de Pago](#5-flujo-completo-de-pago)
6. [Devoluciones (Refund)](#6-devoluciones-refund)
7. [Email del Cliente — Tarjeta vs Yape](#7-email-del-cliente--tarjeta-vs-yape)
8. [Visibilidad de Requests y Responses](#8-visibilidad-de-requests-y-responses)
9. [Configuración de Ambiente](#9-configuracion-de-ambiente)
10. [Pendientes Identificados](#10-pendientes-identificados)
11. [Referencia Oficial — Custom Culqi Checkout multipago v1.0](#11-referencia-oficial--custom-culqi-checkout-multipago-v10)

---

## 1. Alcance y Referencias

Este documento describe la implementación técnica completa de Culqi como pasarela de pagos en Latconecta v2.0.0, cubriendo: integración del Custom Checkout multipago v1.0, tokenización, creación de cargos, devoluciones y el manejo del email del cliente en pagos con Yape.

| Documento | URL |
|-----------|-----|
| Checkout Custom — Documentación oficial | https://docs.culqi.com/es/documentacion/checkout/checkout-custom |
| API de Cargos — Documentación oficial | https://apidocs.culqi.com/#tag/Cargos |
| API de Devoluciones — Documentación oficial | https://apidocs.culqi.com/#tag/Devoluciones |
| API de Órdenes — Documentación oficial | https://apidocs.culqi.com/#tag/Ordenes |
| SDK Python oficial | https://github.com/culqi/culqi-python |

---

## 2. Arquitectura de la Integración

La integración sigue el patrón recomendado por Culqi: el SDK opera en el frontend para tokenizar datos de pago; el backend usa la `secret_key` para crear cargos y devoluciones. La `secret_key` nunca se expone al frontend.

| Capa | Responsabilidad |
|------|----------------|
| `CulqiCheckout.jsx` | Carga el SDK, abre el modal, recibe token/order en callback, llama al backend |
| `paymentService.js` | Comunicación HTTP con el backend (`/payments/*`) |
| `payments/router.py` | Endpoints REST: `/charge`, `/order`, `/refund`, `/cancel`, `/config` |
| `culqi_adapter.py` | Wrapper del SDK Python oficial. Crea cargos, órdenes y devoluciones |
| `purchases.py` | Orquesta el flujo: precio → pago → provisión → registro en BD |

> El único intercambio no visible para el equipo es la tokenización entre el SDK de Culqi y los servidores de Culqi. Todo lo demás (charge, refund, order) pasa por `culqi_adapter.py` y queda en los logs del backend.

---

## 3. Integración del SDK — Frontend

### 3.1 Carga del SDK

El SDK se carga en `index.html` antes del cierre del tag body, según la documentación oficial (Paso 1):

```html
<body>
  <script src="https://js.culqi.com/checkout-js"></script>
</body>
```

### 3.2 Configuración del Checkout

La instancia del checkout se crea en `CulqiCheckout.jsx` con los parámetros que establece la documentación oficial (Pasos 2, 3 y 4):

```javascript
const culqiSettings = {
  title:    'Latconecta',
  currency: currency,    // 'PEN' — REQUERIDO para Yape
  amount:   amountCents, // céntimos — REQUERIDO para Yape
  // SIN 'order' — no se usa PagoEfectivo/billeteras (decisión de diseño)
};

const culqiConfig = {
  settings: culqiSettings,
  client: {
    email: user?.user_email || 'cliente@latconecta.com', // pre-llena el campo
  },
  options: {
    lang:               'auto',
    installments:       false,
    modal:              true,
    paymentMethods:     { yape: true, tarjeta: true,
                          billetera: false, bancaMovil: false,
                          agente: false, cuotealo: false },
    paymentMethodsSort: ['yape', 'tarjeta'],
  },
  appearance: {
    theme:             'default',
    menuType:          'sidebar',
    buttonCardPayText: 'Pagar',
    defaultStyle: {
      bannerColor:      '#1e3a5f',
      buttonBackground: '#2563eb',
      menuColor:        '#2563eb',
      buttonTextColor:  '#ffffff',
      priceColor:       '#1e3a5f',
    },
  },
};

culqiRef.current = new window.CulqiCheckout(publicKey, culqiConfig);
culqiRef.current.open();
```

### 3.3 Medios de pago habilitados

| Medio de pago | Estado y motivo |
|---------------|----------------|
| Tarjeta débito/crédito | ✅ Habilitado — medio de pago principal |
| Yape | ✅ Habilitado — medio de pago local Perú |
| Billeteras móviles | ❌ Deshabilitado — requiere Order + contrato PagoEfectivo |
| Banca móvil / Agentes / Bodegas | ❌ Deshabilitado — requiere Order + contrato PagoEfectivo |
| Cuotéalo BCP | ❌ Deshabilitado — requiere Order + contrato BCP |

> La omisión del parámetro `order` en settings es intencional: sin order, solo se muestran tarjeta y Yape. Latconecta no está afiliada a PagoEfectivo (Medios de Pago S.A.C.).

### 3.4 Callback y resultado del checkout

El resultado llega en el callback `culqiRef.current.culqi` (Ref: Paso 5). Hay tres casos:

```javascript
culqiRef.current.culqi = async () => {
  if (culqi.token) {
    // TARJETA: token (tkn_live_XXX) → llamar createCharge() en backend
  } else if (culqi.order) {
    // YAPE: order confirmado — cargo YA procesado por Culqi
    // NO se llama createCharge() — usar order.id como referencia
  } else {
    // ERROR o cierre manual → culqi.error contiene el detalle
  }
};
```

### 3.5 Manejo de reintentos

Latconecta implementa hasta 3 reintentos ante rechazo de tarjeta:

```javascript
const MAX_RETRIES = 3;

// Cargo rechazado:
retryCount.current += 1;
if (retryCount.current >= MAX_RETRIES) {
  culqi.close();
  onAbort?.('max_retries');
} else {
  culqi.close();
  onRetry?.(errorMessage, openCulqi); // notifica con mensaje + función para reabrir
}
```

---

## 4. Backend — Módulo de Pagos

### 4.1 Endpoints disponibles (`payments/router.py`)

| Endpoint | Descripción |
|----------|-------------|
| `GET /payments/config` | Retorna `public_key`, gateway, métodos disponibles, modos F1/F2. NUNCA expone `secret_key` |
| `POST /payments/charge` | Crea cargo con token del Checkout. Params: `token_id`, `amount` (céntimos), `currency_code`, `email` |
| `POST /payments/order` | Crea Order ID para Yape/billeteras. Retorna `order_id` (`ord_live_XXX`). Actualmente no usado |
| `POST /payments/refund` | Devuelve cargo (parcial o total). Params: `charge_id`, `amount`, `reason` |
| `POST /payments/cancel` | Alias de refund total. Usado por `purchases.py` para reversión automática |

### 4.2 Creación de cargo — `culqi_adapter.create_charge()`

```python
# Body enviado a POST https://api.culqi.com/v2/charges
body = {
    'amount':        charge_data['amount'],    # céntimos — REQUERIDO
    'currency_code': 'PEN',                   # REQUERIDO
    'email':         charge_data['email'],     # REQUERIDO (ver sección 7)
    'source_id':     charge_data['token_id'], # tkn_live_XXX — REQUERIDO
    'capture':       True,
    'installments':  0,
    'description':   'Latconecta',
    'metadata':      { 'order_number': order_number }
}
# Respuesta exitosa: HTTP 201, data.object == 'charge', data.id == chr_live_XXX
```

### 4.3 Creación de orden — `culqi_adapter.create_order()`

Implementado para uso futuro (si se habilitan billeteras). Actualmente no se usa en el flujo normal:

```python
# Body enviado a POST https://api.culqi.com/v2/orders
body = {
    'amount':          order_data['amount'],        # REQUERIDO
    'currency_code':   'PEN',                       # REQUERIDO
    'description':     'Latconecta',                # REQUERIDO
    'order_number':    order_data['order_number'],   # REQUERIDO — único
    'client_details':  { 'first_name', 'last_name', 'email', 'phone_number' },
    'expiration_date': expiration,                  # Unix timestamp — default: +1h
}
# Respuesta exitosa: HTTP 201, data.id == ord_live_XXX
```

---

## 5. Flujo Completo de Pago

### 5.1 Pago con tarjeta

```
1.  Usuario clic 'Pagar' → ShopView monta CulqiCheckout
2.  CulqiCheckout → GET /payments/config → obtiene public_key
3.  new window.CulqiCheckout(publicKey, config) → Culqi abre modal
4.  Usuario ingresa datos de tarjeta → SDK tokeniza (opaco para nosotros)
5.  Callback → culqi.token disponible (tkn_live_XXX)
6.  paymentService.createCharge() → POST /payments/charge
7.  culqi_adapter → POST https://api.culqi.com/v2/charges
8.  Culqi retorna HTTP 201 → charge_id (chr_live_XXX)
9.  Frontend llama handlePaymentAndProvision() → POST /purchases/create
10. purchases.py registra compra + provisiona el servicio (TISI/MEGAPUNTO)
11. Si provisión falla → cancel_transaction() → refund total automático
12. Response → PurchasePopup muestra resultado final
```

### 5.2 Pago con Yape

```
1-3. Igual que tarjeta
4.   Usuario ingresa código Yape de 6 dígitos → SDK procesa Yape internamente
5.   Callback → culqi.ORDER disponible (ord_live_XXX)
     ⚠️ Con Yape el cargo YA fue ejecutado por Culqi — NO se llama createCharge()
6.   Frontend llama handlePaymentAndProvision() → POST /purchases/create
     con payment_transaction_id = order.id
7.   purchases.py registra compra + provisiona el servicio
8.   Response → PurchasePopup muestra resultado final
```

> **Diferencia crítica:** con tarjeta nuestro backend crea el cargo (paso 7). Con Yape el cargo ya existe cuando recibimos el callback — `order.id` es la referencia del cargo ya ejecutado por Culqi.

### 5.3 Reversión automática

Si el pago fue exitoso pero la provisión del servicio falla, `purchases.py` ejecuta reversión automática:

```python
cancel_result = await payment_gateway_service.cancel_transaction({
    'gateway':   'culqi',
    'charge_id': payment_ref,  # chr_live_XXX
    'amount':    amount_cents,
    'currency':  'PEN',
    'reason':    'solicitud_comprador'
})
# → culqi_adapter.cancel_transaction()
# → culqi_adapter.create_refund()
# → POST https://api.culqi.com/v2/refunds
# Respuesta exitosa: HTTP 201, data.id == ref_live_XXX
```

---

## 6. Devoluciones (Refund)

Referencia: https://apidocs.culqi.com/#tag/Devoluciones

| Parámetro | Descripción |
|-----------|-------------|
| `charge_id` (requerido) | ID del cargo a devolver (`chr_live_XXX`) |
| `amount` (requerido) | Monto en céntimos — puede ser parcial o total |
| `reason` (requerido) | `solicitud_comprador` \| `duplicado` \| `fraude` |

Latconecta implementa tres casos de uso:

- **Reversión automática:** provisión falla después de pago exitoso — ejecutada automáticamente por `purchases.py`
- **Devolución manual:** via `POST /payments/refund` para operaciones administrativas
- **Refund parcial:** el adapter soporta `amount` menor al cargo original — disponible para uso futuro

---

## 7. Email del Cliente — Tarjeta vs Yape

### 7.1 Contexto

Durante pruebas se observó que el Checkout no solicita visualmente el email al usuario cuando paga con Yape, a diferencia del pago con tarjeta. Esto generó la pregunta: ¿el email es obligatorio para Culqi?

### 7.2 Lo que dice la documentación de Culqi

La API de Cargos establece los mismos campos requeridos para tarjeta y para Yape:

```python
# Para tarjeta (source_id: tkn_live_XXX) Y para Yape (source_id: ype_live_XXX):
{
    'amount':        '10000',               # REQUERIDO
    'currency_code': 'PEN',                # REQUERIDO
    'email':         'cliente@ejemplo.com', # REQUERIDO en ambos casos
    'source_id':     'tkn_live_XXX'         # REQUERIDO
}
```

**El email es requerido por la API de Culqi tanto para tarjeta como para Yape.** Culqi lo usa para enviar al cliente el comprobante de la transacción.

### 7.3 Por qué el Checkout no pide email en Yape

- El email se pre-llena desde el frontend via `client.email` — el Checkout lo tiene sin necesidad de pedírselo al usuario
- El flujo de Yape muestra directamente el campo de código de aprobación de 6 dígitos; el formulario de datos personales (donde aparece el email) es propio del flujo de tarjeta
- Culqi asume el email del `client.email` para el cobro Yape aunque no lo muestre al usuario

> Ref: Checkout Custom — Paso 2: *"Evita que el cliente vuelva a ingresar su email, para esto debes enviarlo como parámetro"* (`client.email`)

### 7.4 Cómo lo manejamos en Latconecta

```javascript
// En client.email (pre-llenado del Checkout):
email: user?.user_email || 'cliente@latconecta.com'

// En createCharge (pago con tarjeta):
email: user?.user_email || token.email || 'cliente@latconecta.com'
//     ^^ usuario auth   ^^ del token   ^^ fallback
```

> ⚠️ **Pendiente:** cuando el usuario no está autenticado (guest) y paga con Yape, el email enviado a Culqi es el fallback `'cliente@latconecta.com'`. En producción se recomienda capturar el email del usuario guest antes de abrir el checkout. **Este punto es tema de la reunión con Culqi.**

### 7.5 Por qué las pruebas de sandbox sin email no dieron problemas

En las pruebas de sandbox el pago con Yape funcionó aunque aparentemente 'sin email'. La razón es que el email sí se enviaba — era el fallback `'cliente@latconecta.com'` configurado en `client.email`. Culqi en sandbox acepta cualquier email con formato válido sin verificar que sea el correo real del cliente.

---

## 8. Visibilidad de Requests y Responses

| Intercambio | Visible | Ubicación |
|-------------|---------|-----------|
| SDK Culqi → Servidores Culqi (tokenización) | ❌ NO — opaco | Manejado por `window.CulqiCheckout` |
| Frontend → `GET /payments/config` | ✅ SI | Logs FastAPI + `paymentService.js` |
| Frontend → `POST /payments/charge` | ✅ SI | Logs FastAPI + `paymentService.js` |
| `culqi_adapter` → `api.culqi.com/v2/charges` | ✅ SI | `logger.info/debug` en `culqi_adapter.py` |
| `culqi_adapter` → `api.culqi.com/v2/refunds` | ✅ SI | `logger.info/debug` en `culqi_adapter.py` |
| `culqi_adapter` → `api.culqi.com/v2/orders` | ✅ SI | `logger.info/debug` en `culqi_adapter.py` |
| Callback resultado (token/order/error) | ✅ SI — parcial | `culqiRef.current.culqi()` en `CulqiCheckout.jsx` |

> Para depurar la tokenización (el segmento opaco), usar las herramientas de desarrollo del browser (Network tab) filtrando por `culqi.com`.

---

## 9. Configuración de Ambiente

| Variable `.env` | Descripción |
|----------------|-------------|
| `CULQI_PUBLIC_KEY` | Llave pública — expuesta al frontend via `/payments/config`. Prefijo `pk_test_` o `pk_live_` |
| `CULQI_SECRET_KEY` | Llave secreta — **NUNCA sale del backend**. Prefijo `sk_test_` o `sk_live_` |
| `CULQI_RSA_ID` | ID de llave RSA para encriptación adicional (opcional en sandbox, recomendado en producción) |
| `CULQI_RSA_PUBLIC_KEY` | Llave pública RSA para encriptación del payload |
| `PAYMENT_GATEWAY` | Valor: `'culqi'`. Controla qué adaptador usa el sistema |
| `CARD_AVAILABLE` | `True`/`False` — habilita pago con tarjeta en el frontend |

### Llaves sandbox actuales

```
CULQI_PUBLIC_KEY=pk_test_7jTfx9nRR69ACCpu
CULQI_SECRET_KEY=sk_test_sG8xgqCq1r1xq7fc
```

---

## 10. Pendientes Identificados

| # | Pendiente | Detalle |
|---|-----------|---------|
| 1 | **Email del usuario guest** | Cuando no está autenticado, el email enviado a Culqi es el fallback. Agregar captura de email en el flujo guest antes de abrir el checkout. **Tema reunión con Culqi.** |
| 2 | **Pruebas en producción** | Validar flujo completo con llaves `pk_live_` / `sk_live_` y RSA habilitado. |
| 3 | **Merchant account Latconecta** | Crear cuenta de comercio separada en CulqiPanel para Latconecta (actualmente comparte cuenta con MITOPUPCOM). |

---

## 11. Referencia Oficial — Custom Culqi Checkout multipago v1.0

Fuente: https://docs.culqi.com/es/documentacion/checkout/checkout-custom

### Descripción general

Culqi Custom Checkout multipago es la manera más simple de empezar la integración con Culqi. Es un formulario embebido que facilita la integración en web y móvil (tablets y smartphones), con opción de personalizar tipografía, colores y CSS según la marca del comercio.

### Paso 1 — Incluir el SDK

```html
<body>
  <script src="https://js.culqi.com/checkout-js"></script>
</body>
```

### Paso 2 — Configurar settings y client

```javascript
const settings = {
  title:    "Nombre del comercio",
  currency: "PEN",          // REQUERIDO para Yape
  amount:   8000,           // REQUERIDO para Yape (céntimos)
  order:    "ord_live_XXX", // Solo si se usan billeteras/PagoEfectivo
  xculqirsaid:  "id_rsa",   // Para encriptación RSA (recomendado producción)
  rsapublickey: "llave_rsa",
};

const client = {
  email: "cliente@ejemplo.com", // Pre-llena el campo — evita que el usuario lo ingrese
};
```

> **Nota:** `currency` y `amount` son requeridos para realizar pagos con Yape. Si `order` está vacío, solo se muestra pago con tarjeta.

### Paso 3 — Configurar options (medios de pago)

```javascript
const paymentMethods = {
  tarjeta:    true,
  yape:       true,
  billetera:  true,  // Requiere order + contrato PagoEfectivo
  bancaMovil: true,  // Requiere order + contrato PagoEfectivo
  agente:     true,  // Requiere order + contrato PagoEfectivo
  cuotealo:   true,  // Requiere order + contrato BCP
};

const options = {
  lang:               "auto",   // "auto" | "en" | "es"
  installments:       false,    // cuotas
  modal:              true,     // true = popup | false = embebido
  paymentMethods:     paymentMethods,
  paymentMethodsSort: ["yape", "tarjeta"], // orden de display
};
```

### Paso 3 — Configurar appearance (UI)

```javascript
const appearance = {
  theme:               "default",
  hiddenCulqiLogo:     false,
  hiddenBanner:        false,
  hiddenToolBarAmount: false,
  hiddenEmail:         false,   // true = oculta campo email
  menuType:            "sidebar", // "sidebar" | "sliderTop" | "select"
  buttonCardPayText:   "Pagar",
  defaultStyle: {
    bannerColor:      "#1e3a5f",
    buttonBackground: "#2563eb",
    menuColor:        "#2563eb",
    linksColor:       "#2563eb",
    buttonTextColor:  "#ffffff",
    priceColor:       "#1e3a5f",
  },
};
```

### Paso 4 — Crear instancia y abrir

```javascript
const config    = { settings, client, options, appearance };
const publicKey = "pk_test_XXX";
const Culqi     = new CulqiCheckout(publicKey, config);

Culqi.open(); // Abre el modal
```

### Paso 5 — Callback con resultado

```javascript
Culqi.culqi = () => {
  if (Culqi.token) {
    // Tarjeta tokenizada — Culqi.token.id = tkn_live_XXX
    // Enviar token.id al backend para crear el cargo
  } else if (Culqi.order) {
    // Yape/billetera confirmado — cargo YA ejecutado
    // Usar Culqi.order.id como referencia
  } else {
    // Error o cierre manual — Culqi.error contiene el detalle
  }
};
```

### Campos adicionales opcionales (customFields)

El SDK permite agregar hasta 3 campos adicionales antes o dentro del formulario:

```javascript
const customFields = {
  customInput: [ // antes del checkout (modal)
    { id: "dni", label: "DNI", typeValidate: "DNI",
      placeholder: "Ingrese su DNI", minLength: 7, maxLength: 20 }
  ],
  card: [ // dentro del formulario de tarjeta
    { id: "confirmar", type: "checkbox", label: "Acepto términos y condiciones" }
  ]
};
```

### Parámetros de appearance — referencia rápida

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `theme` | string | Tema del checkout. Valor: `"default"` |
| `hiddenCulqiLogo` | boolean | Oculta el logo de Culqi |
| `hiddenBanner` | boolean | Oculta el banner/cabecera |
| `hiddenToolBarAmount` | boolean | Oculta el monto en la barra superior |
| `hiddenEmail` | boolean | Oculta el campo de email |
| `menuType` | string | `"sidebar"` \| `"sliderTop"` \| `"select"` |
| `buttonCardPayText` | string | Texto del botón de pago |
| `logo` | string | URL del logo del comercio |

---

*Documento técnico interno — Latcom Horizons Horizons II, LLC — Latconecta v2.0.0 — Junio 2026*
