# Integración Culqi — Latconecta v2.0.0

*Documentación técnica detallada de la integración con Culqi como pasarela de pagos*  
*Latcom Horizons II, LLC — Junio 2026*

---

## Tabla de Contenidos

- [1. Arquitectura General](#1-arquitectura-general)
- [2. Integración del Plugin SDK](#2-integración-del-plugin-sdk)
- [3. Sincronización de Llaves](#3-sincronización-de-llaves)
- [4. Validación de Medios de Pago](#4-validación-de-medios-de-pago)
- [5. Flujo Pago con Tarjeta](#5-flujo-pago-con-tarjeta)
- [6. Flujo Pago con Yape](#6-flujo-pago-con-yape)
- [7. Integración de Devoluciones](#7-integración-de-devoluciones)
- [8. Manejo de Errores y Reintentos](#8-manejo-de-errores-y-reintentos)
- [9. Email del Cliente — Tarjeta vs Yape](#9-email-del-cliente--tarjeta-vs-yape)
- [10. Visibilidad de Requests y Responses](#10-visibilidad-de-requests-y-responses)
- [11. Configuración de Ambiente](#11-configuración-de-ambiente)
- [12. Tarjetas de Prueba](#12-tarjetas-de-prueba)
- [13. Pendientes](#13-pendientes)

---

## 1. Arquitectura General

La integración sigue el patrón recomendado por Culqi: el SDK opera en el **frontend** para tokenizar datos de pago de forma segura (PCI DSS 3.2), y el **backend** usa la `secret_key` para crear cargos y devoluciones contra la API REST de Culqi. La `secret_key` nunca se expone al frontend.

### Capas del sistema

```
Frontend (React)                    Backend (FastAPI)                  Culqi
─────────────────                   ─────────────────                  ──────
CulqiCheckout.jsx                   payments/router.py
  │                                   │
  │  GET /payments/config             │  payments/service.py
  │◄──────────────────────────────────│
  │                                   │  payments/gateway.py
  │  Abre SDK modal                   │    └── PaymentGatewayService
  │  (tokenización opaca)             │         └── CulqiAdapter
  │                                   │
  │  POST /payments/charge            │  culqi_adapter.py
  │──────────────────────────────────►│    └── culqi.client.charge.create()
  │                                   │                                ──────►
  │                                   │                                api.culqi.com
  │◄──────────────────────────────────│◄──────────────────────────────────────
  │  { charge_id, success }           │
  │                                   │
  │  POST /purchases/create           │  purchases.py
  │──────────────────────────────────►│    └── provision + registro BD
```

### Archivos involucrados

| Archivo | Capa | Responsabilidad |
|---------|------|-----------------|
| `CulqiCheckout.jsx` | Frontend | Carga SDK, abre modal, recibe token/order en callback |
| `paymentService.js` | Frontend | Comunicación HTTP con backend `/payments/*` |
| `payments/router.py` | Backend | Endpoints REST: /charge, /order, /refund, /cancel, /config |
| `payments/schemas.py` | Backend | Modelos Pydantic de request/response |
| `payments/service.py` | Backend | Capa de orquestación — delega al gateway |
| `payments/gateway.py` | Backend | `PaymentGatewayService` — registry multi-gateway |
| `payments/culqi_adapter.py` | Backend | Wrapper del SDK Python oficial de Culqi |
| `purchases.py` | Backend | Orquesta flujo completo: precio → pago → provisión → BD |

---

## 2. Integración del Plugin SDK

### 2.1 Carga del SDK en el Frontend

El SDK del Custom Checkout v1.0 se incluye en `latconecta_users/index.html`:

```html
<body>
  <!-- Culqi Custom Checkout SDK v1.0 -->
  <script src="https://js.culqi.com/checkout-js"></script>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
```

> **Nota:** Esta URL corresponde al **Custom Checkout v1.0** — NO al Checkout V4 obsoleto (`checkout.culqi.com/js/v4`). El Custom Checkout es el SDK vigente según la documentación oficial de Culqi.

### 2.2 Inicialización del Checkout

El componente `CulqiCheckout.jsx` maneja todo el ciclo de vida del SDK:

```javascript
// CulqiCheckout.jsx — openCulqi()
const openCulqi = useCallback(async () => {

  // 1. Obtener configuración pública del backend
  const config = await paymentService.getConfig();
  const publicKey = config.public_key;

  // 2. Verificar que el SDK está disponible
  if (typeof window.CulqiCheckout === "undefined") {
    throw new Error("SDK de Culqi no disponible");
  }

  // 3. Configurar el checkout
  const amountCents = Math.round(parseFloat(amount) * 100);

  const culqiSettings = {
    title:    "Latconecta",
    currency: currency,      // 'PEN' — requerido para Yape
    amount:   amountCents,   // en céntimos — requerido para Yape
    // SIN 'order': solo tarjeta y Yape (sin PagoEfectivo/billeteras)
  };

  // RSA encryption (si está configurado)
  if (config.rsa_id && config.rsa_public_key) {
    culqiSettings.xculqirsaid  = config.rsa_id;
    culqiSettings.rsapublickey = config.rsa_public_key;
  }

  const culqiConfig = {
    settings:   culqiSettings,
    client:     { email: user?.user_email || "cliente@latconecta.com" },
    options:    { /* ver sección 4 */ },
    appearance: { /* ver sección 4 */ },
  };

  // 4. Crear instancia y abrir el modal
  culqiRef.current = new window.CulqiCheckout(publicKey, culqiConfig);
  culqiRef.current.culqi = async () => { /* callback — ver secciones 5 y 6 */ };
  culqiRef.current.open();

}, [amount, currency, orderNumber, user, onResult, onRetry, onAbort]);
```

### 2.3 Registro del SDK en el Backend (Python)

El backend usa el SDK oficial de Python `culqi` para interactuar con la API REST de Culqi:

```python
# culqi_adapter.py — __init__
from culqi.client import Culqi

self.client = Culqi(self.public_key, self.secret_key)
```

El SDK Python actúa como cliente HTTP autenticado hacia `api.culqi.com`.

---

## 3. Sincronización de Llaves

### 3.1 Llaves de Culqi

Culqi provee dos pares de llaves — sandbox y producción:

| Tipo | Prefijo | Uso |
|------|---------|-----|
| Public Key (sandbox) | `pk_test_` | Frontend + inicialización SDK |
| Secret Key (sandbox) | `sk_test_` | Backend — crear cargos/refunds |
| Public Key (producción) | `pk_live_` | Frontend + inicialización SDK |
| Secret Key (producción) | `sk_live_` | Backend — crear cargos/refunds |

### 3.2 Almacenamiento de Llaves

Las llaves se almacenan en `.env` del backend y **nunca** se exponen al frontend directamente:

```bash
# backend/.env
CULQI_PUBLIC_KEY=pk_test_7jTfx9nRR69ACCpu
CULQI_SECRET_KEY=sk_test_sG8xgqCq1r1xq7fc
CULQI_RSA_ID=                    # opcional — encriptación RSA
CULQI_RSA_PUBLIC_KEY=            # opcional — encriptación RSA
```

Se cargan en `config.py` via Pydantic Settings:

```python
# config.py
class Settings(BaseSettings):
    CULQI_PUBLIC_KEY: str = ""
    CULQI_SECRET_KEY: str = ""
    CULQI_RSA_ID: Optional[str] = None
    CULQI_RSA_PUBLIC_KEY: Optional[str] = None
```

### 3.3 Distribución Segura de la Public Key al Frontend

El frontend NUNCA lee la `public_key` del `.env` directamente. La obtiene via el endpoint `GET /payments/config`:

```python
# payments/router.py
@router.get("/config")
async def get_payment_config():
    return {
        "deployment_country": settings.DEPLOYMENT_COUNTRY,
        "gateway":            settings.PAYMENT_GATEWAY,
        "public_key":         settings.CULQI_PUBLIC_KEY,  # ← solo la public key
        "rsa_id":             settings.CULQI_RSA_ID or None,
        "rsa_public_key":     settings.CULQI_RSA_PUBLIC_KEY or None,
        "yape_available":     settings.PAYMENT_GATEWAY == "culqi",
        "card_available":     settings.CARD_AVAILABLE,
        # ... modos F1/F2
    }
    # NUNCA incluye CULQI_SECRET_KEY
```

```javascript
// paymentService.js — frontend
async getConfig() {
  const response = await fetch(`${API_URL}/payments/config`);
  return await response.json();
  // Recibe: { public_key, rsa_id, rsa_public_key, yape_available, ... }
}
```

### 3.4 Uso de la Secret Key en el Backend

La `secret_key` solo se usa en `culqi_adapter.py` para inicializar el cliente Python:

```python
# culqi_adapter.py
self.client = Culqi(self.public_key, self.secret_key)
# A partir de aquí, self.client.charge.create() autentica con secret_key automáticamente
```

---

## 4. Validación de Medios de Pago

### 4.1 Medios Disponibles

Latconecta habilita solo **Tarjeta** y **Yape**. Los demás medios se deshabilitan explícitamente:

```javascript
// CulqiCheckout.jsx — options
options: {
  lang:           "auto",
  installments:   false,   // sin cuotas
  modal:          true,    // presentación popup
  paymentMethods: {
    yape:       true,   // ✅ habilitado
    tarjeta:    true,   // ✅ habilitado
    billetera:  false,  // ❌ sin contrato PagoEfectivo
    bancaMovil: false,  // ❌ sin contrato PagoEfectivo
    agente:     false,  // ❌ sin contrato PagoEfectivo
    cuotealo:   false,  // ❌ sin contrato BCP
  },
  paymentMethodsSort: ["yape", "tarjeta"],  // Yape primero
},
```

### 4.2 Por qué NO se usa el parámetro `order`

La documentación de Culqi indica que si el parámetro `order` está vacío en `settings`, solo se muestran tarjeta y Yape. Latconecta **omite deliberadamente** `order` porque:

1. No tiene contrato con **Medios de Pago S.A.C.** (PagoEfectivo)
2. No tiene contrato con **Cuotéalo BCP**
3. Incluir `order` generaría códigos CIP de PagoEfectivo sin posibilidad de conciliación

```javascript
const culqiSettings = {
  title:    "Latconecta",
  currency: "PEN",
  amount:   amountCents,
  // order: OMITIDO DELIBERADAMENTE — evita PagoEfectivo/billeteras
};
```

### 4.3 Apariencia del Checkout

```javascript
// CulqiCheckout.jsx — appearance
appearance: {
  theme:               "default",
  hiddenCulqiLogo:     false,
  hiddenBanner:        false,
  hiddenToolBarAmount: false,
  menuType:            "sidebar",      // sidebar / sliderTop / select
  buttonCardPayText:   "Pagar",
  defaultStyle: {
    bannerColor:      "#1e3a5f",
    buttonBackground: "#2563eb",
    menuColor:        "#2563eb",
    linksColor:       "#2563eb",
    buttonTextColor:  "#ffffff",
    priceColor:       "#1e3a5f",
  },
},
```

### 4.4 Control F1/F2 (Simulación vs Real)

El modo de pago (simulado F1 vs real F2) se controla desde el **OperationsPanel** del frontend via el endpoint `/operations/config`. El backend lo verifica en `purchases.py` antes de procesar el pago:

```python
# purchases.py — verificación de modo
from app.services.operations_config_service import ops_config

is_simulated = ops_config.is_fase1('pago_tarjeta')  # True = F1, False = F2

if is_simulated:
    # Simular pago exitoso internamente sin llamar a Culqi
    payment_result = ops_config.simulate_response('pago_tarjeta', {...})
else:
    # F2: llamar a Culqi real
    charge_result = await payment_gateway_service.get_adapter().create_charge(...)
```

**PIN de acceso al OperationsPanel:** `lc2026`

---

## 5. Flujo Pago con Tarjeta

### 5.1 Diagrama de Secuencia

```
Usuario          Frontend              Backend              Culqi API
  │                │                      │                    │
  │  Clic "Pagar"  │                      │                    │
  │───────────────►│                      │                    │
  │                │ GET /payments/config │                    │
  │                │─────────────────────►│                    │
  │                │◄─────────────────────│                    │
  │                │  { public_key, ... } │                    │
  │                │                      │                    │
  │                │ new CulqiCheckout()  │                    │
  │                │ .open()              │                    │
  │◄───────────────│                      │                    │
  │  Modal Culqi   │                      │                    │
  │  (tarjeta)     │                      │                    │
  │                │                      │                    │
  │  Ingresa datos │                      │                    │
  │───────────────►│                      │                    │
  │                │                      │  (tokenización)    │
  │                │                      │◄──────────────────►│
  │                │  callback: token     │                    │
  │                │  (tkn_live_XXX)      │                    │
  │                │                      │                    │
  │                │ POST /payments/charge│                    │
  │                │─────────────────────►│                    │
  │                │                      │ POST /v2/charges   │
  │                │                      │───────────────────►│
  │                │                      │◄───────────────────│
  │                │                      │  HTTP 201          │
  │                │                      │  chr_live_XXX      │
  │                │◄─────────────────────│                    │
  │                │ { charge_id, success}│                    │
  │                │                      │                    │
  │                │ POST /purchases/create                    │
  │                │─────────────────────►│                    │
  │                │                      │  (provisión TISI)  │
  │                │◄─────────────────────│                    │
  │  Resultado     │                      │                    │
```

### 5.2 Implementación del Callback (Tarjeta)

```javascript
// CulqiCheckout.jsx
culqiRef.current.culqi = async () => {
  const culqi = culqiRef.current;

  if (culqi.token) {
    const token = culqi.token;  // { id: "tkn_live_XXX", email: "...", ... }

    try {
      // Crear cargo en el backend
      const chargeResp = await paymentService.createCharge({
        token_id:      token.id,
        amount:        amountCentsRef.current,
        currency_code: currency,
        email:         user?.user_email || token.email || "cliente@latconecta.com",
        description:   `Latconecta — ${orderNumber}`,
        order_number:  orderNumber,
      });

      if (chargeResp.success) {
        culqi.close();
        onResult?.({
          success:      true,
          provider:     "culqi",
          charge_id:    chargeResp.charge_id,    // chr_live_XXX
          outcome_type: chargeResp.outcome_type, // 'venta_exitosa'
          amount:       chargeResp.amount,
          currency:     chargeResp.currency_code,
          orderNumber:  orderNumber,
          cancelData: {
            gateway:   "culqi",
            charge_id: chargeResp.charge_id,
            amount:    amountCentsRef.current,
            currency:  currency,
            reason:    "solicitud_comprador",
          },
        });
      } else {
        // Cargo rechazado — lógica de reintentos (ver sección 8)
        retryCount.current += 1;
        if (retryCount.current >= MAX_RETRIES) {
          culqi.close();
          onAbort?.("max_retries");
        } else {
          culqi.close();
          onRetry?.(chargeResp.message, openCulqi);
        }
      }
    } catch {
      culqi.close();
      onAbort?.("technical_error");
    }
  }
};
```

### 5.3 Creación del Cargo en el Backend

```python
# culqi_adapter.py — create_charge()
body = {
    "amount":        charge_data['amount'],         # REQUERIDO — céntimos
    "currency_code": charge_data.get('currency_code', 'PEN'),  # REQUERIDO
    "email":         charge_data['email'],           # REQUERIDO
    "source_id":     charge_data['token_id'],        # REQUERIDO — tkn_live_XXX
    "capture":       charge_data.get('capture', True),
    "installments":  charge_data.get('installments', 0),
    "description":   charge_data.get('description', 'Latconecta'),
    "metadata": {
        "order_number": charge_data.get('order_number', ''),
    },
}

# Opciones RSA si están configuradas
options = self._get_rsa_options()
if options:
    result = self.client.charge.create(data=body, **options)
else:
    result = self.client.charge.create(data=body)

# Respuesta exitosa: HTTP 201
# result['data']['object'] == 'charge'
# result['data']['id'] == 'chr_live_XXX'
# result['data']['outcome']['type'] == 'venta_exitosa'
```

### 5.4 Schema del Request de Cargo

```python
# payments/schemas.py
class PaymentChargeRequest(BaseModel):
    token_id:      str              # tkn_live_XXX — del Checkout
    amount:        int              # en céntimos: S/15.00 = 1500
    currency_code: str = "PEN"
    email:         str              # REQUERIDO por Culqi
    description:   str = "Latconecta"
    order_number:  str = ""
    installments:  int = 0         # 0 = sin cuotas
    capture:       bool = True     # cobro inmediato

class PaymentChargeResponse(BaseModel):
    success:      bool
    charge_id:    Optional[str]    # chr_live_XXX
    outcome_type: Optional[str]    # 'venta_exitosa' = aprobado
    amount:       Optional[int]
    currency_code: Optional[str]
    message:      Optional[str]
    raw_response: Optional[Dict[str, Any]]
```

---

## 6. Flujo Pago con Yape

### 6.1 Diferencia Crítica con Tarjeta

Con Yape, el cargo es procesado **internamente por Culqi** cuando el usuario ingresa su código de 6 dígitos. Cuando el callback llega al frontend, el pago **ya fue ejecutado** — el `order.id` es la referencia del cargo existente, no se llama a `createCharge()`.

### 6.2 Implementación del Callback (Yape)

```javascript
// CulqiCheckout.jsx
} else if (culqi.order) {
  // YAPE: orden confirmada — cargo ya procesado por Culqi
  culqi.close();
  const order = culqi.order;

  onResult?.({
    success:      true,
    provider:     "culqi",
    charge_id:    order.id,           // ord_live_XXX — referencia del cargo Yape
    outcome_type: "order",
    amount:       amountCentsRef.current,
    currency:     currency,
    orderNumber:  orderNumber,
    message:      "Pago confirmado",
    cancelData: {
      gateway:   "culqi",
      charge_id: order.id,            // usar order.id para refund si es necesario
      amount:    amountCentsRef.current,
      currency:  currency,
      reason:    "solicitud_comprador",
    },
  });
}
```

### 6.3 Procesamiento en el Backend (purchases.py)

El backend recibe el `order.id` como `payment_transaction_id` y lo registra directamente como referencia del pago, sin llamar a `create_charge`:

```python
# purchases.py — cuando el frontend envía el resultado de Yape
# El charge_id es en realidad el order.id de Culqi
purchase_record.purchase_payment_ref = payment_data.get('payment_transaction_id')
# → guarda "ord_live_XXX" como referencia del pago Yape
```

---

## 7. Integración de Devoluciones

> **Referencia:** `apidocs.culqi.com/#tag/Devoluciones`  
> La documentación de devoluciones está en la **API REST de Culqi**, NO en el documento del Checkout Custom.

### 7.1 Casos de Uso

| Caso | Cuándo | Quién lo ejecuta |
|------|--------|-----------------|
| Reversión automática | Provisión falla después de pago exitoso | `purchases.py` automáticamente |
| Devolución manual | Solicitud administrativa | Admin via `POST /payments/refund` |
| Refund parcial | Devolución parcial del monto | Admin — soportado por el adapter |

### 7.2 Reversión Automática en purchases.py

```python
# purchases.py — cuando provisión falla después de pago exitoso
if payment_successful and provision_failed:

    cancel_result = await payment_gateway_service.cancel_transaction({
        'gateway':   'culqi',
        'charge_id': payment_ref,    # chr_live_XXX o ord_live_XXX (Yape)
        'amount':    amount_cents,   # monto en céntimos
        'currency':  'PEN',
        'reason':    'solicitud_comprador'
    })

    if cancel_result['success']:
        purchase.purchase_payment_status = 'Reversed'
        purchase.purchase_reversal_ref   = cancel_result['cancel_id']
    else:
        purchase.requires_manual_intervention = True
```

### 7.3 Flujo en el Gateway Service

```python
# payments/gateway.py — PaymentGatewayService.cancel_transaction()
async def cancel_transaction(self, cancel_data, gateway_name=None):
    name = gateway_name or self._active_gateway  # 'culqi'
    adapter = self.get_adapter(name)             # CulqiAdapter
    result = await adapter.cancel_transaction(cancel_data)
    return {
        "success":  result.get("success", False),
        "gateway":  name,
        "cancel_id": result.get("cancel_id"),    # ref_live_XXX
        ...
    }
```

### 7.4 Implementación del Refund en el Adapter

```python
# culqi_adapter.py — create_refund()
body = {
    "amount":    refund_data['amount'],              # REQUERIDO — céntimos
    "charge_id": refund_data['charge_id'],           # REQUERIDO — chr_live_XXX
    "reason":    refund_data.get('reason',
                   'solicitud_comprador'),           # REQUERIDO
    # Valores válidos: solicitud_comprador | duplicado | fraude
}

result = self.client.refund.create(data=body)

# Respuesta exitosa: HTTP 201
# result['data']['object'] == 'refund'
# result['data']['id'] == 'ref_live_XXX'
```

### 7.5 cancel_transaction como Alias de Refund Total

En Culqi, cancelar un cargo equivale a un refund total. El adapter implementa este alias para compatibilidad:

```python
# culqi_adapter.py — cancel_transaction()
async def cancel_transaction(self, cancel_data):
    refund_data = {
        "charge_id": cancel_data.get('charge_id'),
        "amount":    cancel_data.get('amount'),
        "reason":    cancel_data.get('reason', 'solicitud_comprador'),
    }
    result = await self.create_refund(refund_data)
    return {
        "success":                    result["success"],
        "cancel_id":                  result.get("refund_id"),  # ref_live_XXX
        "authorization_code_cancel":  result.get("refund_id"),
        "message":                    result["message"],
        "raw_response":               result.get("raw_response", {})
    }
```

### 7.6 Schema del Refund

```python
# payments/schemas.py
class PaymentRefundRequest(BaseModel):
    charge_id: str              # chr_live_XXX
    amount:    int              # céntimos — puede ser parcial
    reason:    str = "solicitud_comprador"

class PaymentCancelRequest(BaseModel):
    gateway:   str = "culqi"
    charge_id: str
    amount:    int
    currency:  str = "PEN"
    reason:    str = "solicitud_comprador"
```

---

## 8. Manejo de Errores y Reintentos

### 8.1 Reintentos en el Frontend

El componente `CulqiCheckout.jsx` implementa hasta `MAX_RETRIES = 3` intentos antes de abortar:

```javascript
const MAX_RETRIES = 3;

// En el callback de tarjeta, si el cargo es rechazado:
retryCount.current += 1;

if (retryCount.current >= MAX_RETRIES) {
  culqi.close();
  onAbort?.("max_retries");      // → PurchasePopup muestra error definitivo
} else {
  culqi.close();
  onRetry?.(errorMessage, openCulqi);  // → PurchasePopup ofrece reintentar
}
```

### 8.2 Manejo en PurchasePopup

```javascript
// PurchasePopup.jsx — onResult callback
onResult={(result) => {
  if (result.success) {
    handlePaymentAndProvision();      // → provisionar servicio
  } else {
    // Pago rechazado por Culqi
    isSubmitting.current = false;
    setError(result.message || 'El pago no fue procesado. Intenta nuevamente.');
    setPurchaseStep(4);               // → volver al step de pago para reintentar
  }
}}
```

### 8.3 Clasificación de Errores en ShopView

```javascript
// ShopView.jsx — en el catch de handlePaymentAndProvision
const isTechnicalError = errorMsg.includes('Error interno') ||
                         errorMsg.includes('Error de conexión') ||
                         errorMsg.includes('500') ||
                         errorMsg.includes('Network') ||
                         errorMsg.includes('Failed to fetch');

if (isTechnicalError) {
  // Error técnico → ir al Step 6 sin posibilidad de reintentar
  setPurchaseStep(6);
} else {
  // Error de pago (Culqi rechazó) → volver al Step 4 para reintentar
  setError(errorMsg);
  setPurchaseStep(4);
}
```

---

## 9. Email del Cliente — Tarjeta vs Yape

### 9.1 ¿Es obligatorio el email?

Sí. La API de Culqi requiere `email` en el body del cargo tanto para tarjeta como para Yape (`apidocs.culqi.com/#tag/Cargos`).

### 9.2 ¿Por qué el Checkout no pide email en Yape?

- El email se **pre-llena** en `client.email` — el Checkout lo tiene sin mostrárselo al usuario
- El flujo de Yape muestra directamente el campo de código de 6 dígitos
- Culqi usa el `client.email` internamente para el cargo Yape

### 9.3 Prioridad del Email

```javascript
// CulqiCheckout.jsx
client: {
  email: user?.user_email || "cliente@latconecta.com"
}

// En createCharge (tarjeta):
email: user?.user_email || token.email || "cliente@latconecta.com"
//     ^usuario auth     ^del token Culqi  ^fallback guest
```

> ⚠️ **Pendiente:** cuando el usuario compra como guest con Yape, el email enviado a Culqi es el fallback `cliente@latconecta.com`. Se recomienda capturar el email del usuario guest antes de abrir el checkout.

---

## 10. Visibilidad de Requests y Responses

| Intercambio | Visible | Dónde |
|-------------|---------|-------|
| SDK Culqi → Servidores Culqi (tokenización) | ❌ Opaco | Interno al SDK |
| Frontend → `GET /payments/config` | ✅ | Logs FastAPI + Network tab browser |
| Frontend → `POST /payments/charge` | ✅ | Logs FastAPI + paymentService.js |
| `culqi_adapter` → `api.culqi.com/v2/charges` | ✅ | `logger.info/debug` en culqi_adapter.py |
| `culqi_adapter` → `api.culqi.com/v2/refunds` | ✅ | `logger.info/debug` en culqi_adapter.py |
| Callback resultado (token/order/error) | ✅ parcial | `culqiRef.current.culqi()` |

Para depurar la tokenización (segmento opaco): usar **Network tab** del browser filtrando por `culqi.com`.

---

## 11. Configuración de Ambiente

### 11.1 Variables .env

```bash
PAYMENT_GATEWAY=culqi          # activa el CulqiAdapter
DEPLOYMENT_COUNTRY=PE          # determina config de gateway por país
CULQI_PUBLIC_KEY=pk_test_...   # expuesta al frontend via /payments/config
CULQI_SECRET_KEY=sk_test_...   # solo en backend — NUNCA al frontend
CULQI_RSA_ID=                  # opcional — encriptación adicional
CULQI_RSA_PUBLIC_KEY=          # opcional — encriptación adicional
CARD_AVAILABLE=True            # habilita pago con tarjeta
BARCODE_AVAILABLE=False        # barcode no disponible en PE con Culqi
```

### 11.2 Arquitectura Multi-Gateway (payments/gateway.py)

El sistema está preparado para múltiples gateways por país:

```python
# payments/gateway.py
COUNTRY_PAYMENT_CONFIG = {
    "PE": { "card_gateway": "culqi",  "barcode_gateway": "barcodeapi" },
    "MX": { "card_gateway": "stripe", "barcode_gateway": "latamgroup" },  # futuro
    "US": { "card_gateway": "stripe", "barcode_gateway": None },           # futuro
}

PAYMENT_ADAPTER_REGISTRY = {
    "culqi": {
        "module":  "app.payments.culqi_adapter",
        "class":   "CulqiAdapter",
        "countries": ["PE"],
    },
    # "stripe": { ... }  # pendiente
}
```

Para agregar un nuevo gateway: agregar entrada en `COUNTRY_PAYMENT_CONFIG` y `PAYMENT_ADAPTER_REGISTRY`, e implementar el adaptador.

---

## 12. Tarjetas de Prueba (Sandbox)

| Red | Número | Vencimiento | CVV | Resultado |
|-----|--------|-------------|-----|-----------|
| Visa | 4111 1111 1111 1111 | Cualquier futura | 123 | ✅ Aprobada |
| Mastercard | 5111 1111 1111 1118 | Cualquier futura | 123 | ✅ Aprobada |
| Visa | 4000 0200 0000 0000 | Cualquier futura | 123 | ❌ Fondos insuficientes |
| Visa | 4000 0300 0000 0004 | Cualquier futura | 123 | ❌ Tarjeta robada |

**Llaves sandbox actuales:**
```
CULQI_PUBLIC_KEY=pk_test_7jTfx9nRR69ACCpu
CULQI_SECRET_KEY=sk_test_sG8xgqCq1r1xq7fc
```

**Monto mínimo para Orders:** S/6.00 (600 céntimos)

---

## 13. Pendientes

- **Email guest:** capturar email del usuario no autenticado antes de abrir el checkout para evitar el fallback `cliente@latconecta.com`
- **Pruebas producción:** validar flujo completo con llaves `pk_live_` / `sk_live_` y RSA habilitado
- **UX-01:** eliminar ventanas intermedias antes y después del modal de Culqi
- **Custom Checkout v1.0:** documentar formalmente la migración desde Checkout V4

---

## Referencias

| Documento | URL |
|-----------|-----|
| Checkout Custom | `docs.culqi.com/es/documentacion/checkout/checkout-custom` |
| API Cargos | `apidocs.culqi.com/#tag/Cargos` |
| API Devoluciones | `apidocs.culqi.com/#tag/Devoluciones` |
| API Órdenes | `apidocs.culqi.com/#tag/Ordenes` |
| SDK Python | `github.com/culqi/culqi-python` |

---
*Latcom Horizons II, LLC — Latconecta v2.0.0 — Junio 2026*
