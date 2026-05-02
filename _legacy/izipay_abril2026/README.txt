LEGACY IZIPAY — Backup Abril 2026
===================================
Fecha de backup: Abril 2026
Motivo: Migración gateway de pago Izipay → Culqi

Archivos incluidos:
  - izipay_adapter.py     Backend: adaptador Izipay (cancel_transaction)
  - izipay.py             Backend: código legacy (create_form_token — nunca usado)
  - gateway.py            Backend: orquestador multi-gateway con Izipay como activo
  - router.py             Backend: endpoints /token, /validate, /cancel, /config, /gateways
  - service.py            Backend: generate_session_token, extract_cancel_data_from_payload
  - schemas.py            Backend: PaymentCreate/Validate/Cancel Request/Response
  - models.py             Backend: tabla payment_orders (provider="IZIPAY")
  - IzipayCheckout.jsx    Frontend: componente checkout con autoStart y pre-fetch de token
  - paymentService.js     Frontend: getToken, validatePayment, getConfig, reverseTransaction

REVISIÓN PROGRAMADA: Octubre 2026
  → Evaluar si se puede eliminar definitivamente este directorio.
  → Criterio: Culqi estable en producción por 6 meses sin incidentes.

Tag Git: v-izipay-backup-abril2026
