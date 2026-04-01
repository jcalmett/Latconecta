"""
VENDOR SIMULATOR - Fase 3
Simula el API real de LATCOM según especificación actualizada
✅ Endpoints: /api/v1/topup, /api/v1/balance, /api/v1/transaction/:id
✅ Autenticación: x-customer-id + x-api-key (headers) - solo presencia, no valores
✅ Validaciones: país, carrier, teléfono, montos
✅ Respuestas: formato idéntico al API real de LATCOM
"""
from flask import Flask, request, jsonify
from datetime import datetime, timezone
import json
import os
import time
import random
import string

app = Flask(__name__)

# Configuración
LOG_FILE = 'vendor_simulator.log'
PORT = 5001

# ================================================================
# CREDENCIALES SIMULADAS
# ================================================================
VALID_CUSTOMER_ID = "LATCONECTA_001"
# ✅ NOTA: El simulator solo verifica presencia de headers, no valores específicos.
# Las credenciales reales se gestionan en la tabla vendors de la BD.

# ================================================================
# CONFIGURACIÓN DE PAÍSES (según especificación LATCOM)
# ================================================================
COUNTRY_CONFIG = {
    "MX": {
        "currency": "MXN",
        "phone_digits": 10,
        "amount_type": "fixed",
        "valid_amounts": [10, 20, 30, 50, 80, 100, 150, 200, 300, 500],
        "carriers": ["TELCEL", "ATT", "MOVISTAR"]
    },
    "PE": {
        "currency": "PEN",
        "phone_digits": 9,
        "amount_type": "flexible",
        "amount_min": 1,
        "amount_max": 500,
        "carriers": ["CLARO", "BITEL", "ENTEL", "MOVISTAR"]
    },
    "VE": {
        "currency": "VES",
        "phone_digits": 11,
        "amount_type": "flexible",
        "amount_min": 1,
        "amount_max": 999999,
        "carriers": ["MOVISTAR", "DIGITEL", "MOVILNET"]
    }
}

# Almacén de transacciones en memoria (para consultas)
transactions_store = {}

# Balance simulado
simulated_balance = 5000.00


# ================================================================
# FUNCIONES AUXILIARES
# ================================================================

def log_to_file(message):
    """Escribir en archivo de log"""
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(message + '\n')


def log_request_response(endpoint, method, request_data, response_data, status_code, headers_info=None):
    """Registrar request y response en log"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    log_entry = f"""
[{timestamp}] ════════════════════════════════════════
{method} {endpoint}
Auth Headers: {json.dumps(headers_info, indent=2) if headers_info else 'N/A'}
Request: {json.dumps(request_data, indent=2) if request_data else 'N/A'}
Response ({status_code}): {json.dumps(response_data, indent=2)}
════════════════════════════════════════
"""
    log_to_file(log_entry)
    print(log_entry)


def get_timestamp():
    """Generar timestamp en formato ISO UTC como LATCOM real"""
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.') + \
           f"{random.randint(0, 999):03d}Z"


def generate_transaction_id():
    """Generar transaction_id en formato LATCOM: VIA-YYYYMMDD-NNNN"""
    date_str = datetime.now().strftime('%Y%m%d')
    seq = random.randint(1000, 9999)
    return f"VIA-{date_str}-{seq}"


def generate_authorization_code():
    """Generar código de autorización aleatorio"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def error_response(error_code, error_message, status_code, transaction_id=None):
    """Generar respuesta de error en formato LATCOM"""
    resp = {
        "success": False,
        "error_code": error_code,
        "error_message": error_message,
        "timestamp": get_timestamp()
    }
    if transaction_id:
        resp["transaction_id"] = transaction_id
    return resp, status_code


def validate_auth_headers():
    """
    Validar headers de autenticación x-customer-id y x-api-key
    ✅ ACTUALIZADO: Solo verifica presencia de headers, no valores específicos.
    La validación real de credenciales ocurre contra el vendor real (LATCOM).
    Las credenciales se gestionan en la tabla vendors de la BD.
    """
    customer_id = request.headers.get('x-customer-id', '')
    api_key = request.headers.get('x-api-key', '')

    if not customer_id or not api_key:
        return False, "Missing x-api-key or x-customer-id header"

    return True, None


# ================================================================
# ENDPOINT: POST /api/v1/topup
# Procesar recarga — formato idéntico al API real de LATCOM
# ================================================================

@app.route('/api/v1/topup', methods=['POST', 'OPTIONS'])
def latcom_topup():
    """
    Procesar topup/recarga
    Mapping: LC01T (grupo 001, provision)

    Request: {carrier, phone, amount, country, reference}
    Response: {success, transaction_id, carrier, phone, amount, currency,
               country, status, authorization_code, timestamp, reference}
    """
    if request.method == 'OPTIONS':
        return '', 200

    global simulated_balance

    # Capturar headers de auth para logging
    auth_headers = {
        "x-customer-id": request.headers.get('x-customer-id', ''),
        "x-api-key": request.headers.get('x-api-key', '')[:10] + '...' if request.headers.get('x-api-key') else ''
    }

    try:
        # 1. Validar autenticación
        auth_valid, auth_error = validate_auth_headers()
        if not auth_valid:
            resp, code = error_response("INVALID_CREDENTIALS", auth_error, 401)
            log_request_response('/api/v1/topup', 'POST', None, resp, code, auth_headers)
            return jsonify(resp), code

        # 2. Obtener body
        data = request.get_json()
        if not data:
            resp, code = error_response("INVALID_REQUEST", "Request body is required", 400)
            log_request_response('/api/v1/topup', 'POST', None, resp, code, auth_headers)
            return jsonify(resp), code

        carrier = data.get('carrier')
        phone = data.get('phone')
        amount = data.get('amount')
        country = data.get('country', 'MX')  # Default MX según spec
        reference = data.get('reference')

        print(f"[TOPUP] carrier={carrier}, phone={phone}, amount={amount}, country={country}, ref={reference}")

        # 3. Validar campos requeridos
        missing = []
        if not carrier:
            missing.append('carrier')
        if not phone:
            missing.append('phone')
        if amount is None:
            missing.append('amount')
        if not reference:
            missing.append('reference')

        if missing:
            resp, code = error_response(
                "INVALID_REQUEST",
                f"Missing required fields: {', '.join(missing)}",
                400
            )
            log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
            return jsonify(resp), code

        # 4. Validar país
        if country not in COUNTRY_CONFIG:
            resp, code = error_response(
                "INVALID_COUNTRY",
                f"Unsupported country code: {country}. Must be MX, PE, or VE",
                400
            )
            log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
            return jsonify(resp), code

        config = COUNTRY_CONFIG[country]

        # 5. Validar carrier para el país
        if carrier not in config['carriers']:
            resp, code = error_response(
                "INVALID_CARRIER",
                f"Carrier '{carrier}' not supported for country '{country}'. Valid: {', '.join(config['carriers'])}",
                400
            )
            log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
            return jsonify(resp), code

        # 6. Validar teléfono (solo dígitos, longitud correcta)
        phone_str = str(phone).strip()
        if not phone_str.isdigit():
            resp, code = error_response(
                "INVALID_PHONE",
                f"Phone number must contain only digits",
                400
            )
            log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
            return jsonify(resp), code

        if len(phone_str) != config['phone_digits']:
            resp, code = error_response(
                "INVALID_PHONE",
                f"Phone number for {country} must be {config['phone_digits']} digits, got {len(phone_str)}",
                400
            )
            log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
            return jsonify(resp), code

        # 7. Validar monto
        try:
            amount_int = int(amount)
        except (ValueError, TypeError):
            resp, code = error_response(
                "INVALID_AMOUNT",
                "Amount must be an integer",
                400
            )
            log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
            return jsonify(resp), code

        if config['amount_type'] == 'fixed':
            if amount_int not in config['valid_amounts']:
                resp, code = error_response(
                    "INVALID_AMOUNT",
                    f"Invalid amount for {country}. Valid: {config['valid_amounts']}",
                    400
                )
                log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
                return jsonify(resp), code
        else:
            if amount_int < config['amount_min'] or amount_int > config['amount_max']:
                resp, code = error_response(
                    "INVALID_AMOUNT",
                    f"Amount for {country} must be between {config['amount_min']} and {config['amount_max']}",
                    400
                )
                log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
                return jsonify(resp), code

        # 8. Validar reference (max 50 chars)
        if len(str(reference)) > 50:
            resp, code = error_response(
                "INVALID_REQUEST",
                "Reference must be max 50 characters",
                400
            )
            log_request_response('/api/v1/topup', 'POST', data, resp, code, auth_headers)
            return jsonify(resp), code

        # 9. Generar respuesta exitosa (formato exacto LATCOM)
        transaction_id = generate_transaction_id()
        authorization_code = generate_authorization_code()
        timestamp = get_timestamp()

        # Descontar del balance simulado
        simulated_balance -= amount_int

        response_data = {
            "success": True,
            "transaction_id": transaction_id,
            "carrier": carrier,
            "phone": phone_str,
            "amount": amount_int,
            "currency": config['currency'],
            "country": country,
            "status": "completed",
            "authorization_code": authorization_code,
            "timestamp": timestamp,
            "reference": str(reference)
        }

        # Guardar transacción para consulta posterior
        transactions_store[transaction_id] = response_data.copy()

        print(f"[TOPUP] ✅ SUCCESS | TXN: {transaction_id} | {carrier} | {phone_str} | {amount_int} {config['currency']} | Balance: {simulated_balance:.2f}")

        log_request_response('/api/v1/topup', 'POST', data, response_data, 200, auth_headers)
        return jsonify(response_data), 200

    except Exception as e:
        print(f"[TOPUP] ❌ Error: {str(e)}")
        resp, code = error_response("INTERNAL_ERROR", f"Unexpected error: {str(e)}", 500)
        log_request_response('/api/v1/topup', 'POST', data if 'data' in dir() else None, resp, code, auth_headers)
        return jsonify(resp), code


# ================================================================
# ENDPOINT: GET /api/v1/balance
# Consultar saldo de la cuenta
# ================================================================

@app.route('/api/v1/balance', methods=['GET', 'OPTIONS'])
def latcom_balance():
    """
    Consultar balance de la cuenta del distribuidor
    """
    if request.method == 'OPTIONS':
        return '', 200

    auth_headers = {
        "x-customer-id": request.headers.get('x-customer-id', ''),
        "x-api-key": request.headers.get('x-api-key', '')[:10] + '...' if request.headers.get('x-api-key') else ''
    }

    # Validar autenticación
    auth_valid, auth_error = validate_auth_headers()
    if not auth_valid:
        resp, code = error_response("INVALID_CREDENTIALS", auth_error, 401)
        log_request_response('/api/v1/balance', 'GET', None, resp, code, auth_headers)
        return jsonify(resp), code

    response_data = {
        "success": True,
        "balance": round(simulated_balance, 2),
        "currency": "USD",
        "customer_id": VALID_CUSTOMER_ID,
        "timestamp": get_timestamp()
    }

    print(f"[BALANCE] ✅ Balance: {simulated_balance:.2f} USD")

    log_request_response('/api/v1/balance', 'GET', None, response_data, 200, auth_headers)
    return jsonify(response_data), 200


# ================================================================
# ENDPOINT: GET /api/v1/transaction/<transaction_id>
# Consultar estado de una transacción
# ================================================================

@app.route('/api/v1/transaction/<transaction_id>', methods=['GET', 'OPTIONS'])
def latcom_transaction(transaction_id):
    """
    Consultar estado de una transacción por su ID
    """
    if request.method == 'OPTIONS':
        return '', 200

    auth_headers = {
        "x-customer-id": request.headers.get('x-customer-id', ''),
        "x-api-key": request.headers.get('x-api-key', '')[:10] + '...' if request.headers.get('x-api-key') else ''
    }

    # Validar autenticación
    auth_valid, auth_error = validate_auth_headers()
    if not auth_valid:
        resp, code = error_response("INVALID_CREDENTIALS", auth_error, 401)
        log_request_response(f'/api/v1/transaction/{transaction_id}', 'GET', None, resp, code, auth_headers)
        return jsonify(resp), code

    # Buscar transacción
    txn = transactions_store.get(transaction_id)
    if not txn:
        resp, code = error_response(
            "TRANSACTION_NOT_FOUND",
            f"Transaction ID not found: {transaction_id}",
            404
        )
        log_request_response(f'/api/v1/transaction/{transaction_id}', 'GET', None, resp, code, auth_headers)
        return jsonify(resp), code

    print(f"[TRANSACTION] ✅ Found: {transaction_id}")

    log_request_response(f'/api/v1/transaction/{transaction_id}', 'GET', None, txn, 200, auth_headers)
    return jsonify(txn), 200


# ================================================================
# HEALTH CHECK
# ================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de health check"""
    return jsonify({
        "status": "ok",
        "service": "Vendor Simulator - LATCOM API v1",
        "version": "3.0",
        "endpoints": [
            "POST /api/v1/topup",
            "GET  /api/v1/balance",
            "GET  /api/v1/transaction/<id>"
        ],
        "countries": list(COUNTRY_CONFIG.keys()),
        "timestamp": datetime.now().isoformat()
    }), 200




# ================================================================
# CONFIGURACIÓN TISI (MEGAPUNTO)
# ================================================================
TISI_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tisi_simulator_token"
TISI_VALID_USERS = {"latconecta_test": "password_test"}

TISI_PRODUCTS = {
    # Peru
    "66": {"operadora": "Bitel",   "pais": "PER", "min": 3.0,  "max": 100.0},
    "67": {"operadora": "Entel",   "pais": "PER", "min": 3.0,  "max": 100.0},
    "70": {"operadora": "Claro",   "pais": "PER", "min": 3.0,  "max": 100.0},
    # Venezuela
    "5580": {"operadora": "Movistar Celular", "pais": "VEN", "min": 1.38, "max": 92.15},
    "5581": {"operadora": "Movistar Fijo",    "pais": "VEN", "min": 1.38, "max": 92.15},
    "5582": {"operadora": "Movilnet",         "pais": "VEN", "min": 1.47, "max": 49.88},
    "5583": {"operadora": "Digitel",          "pais": "VEN", "min": 2.75, "max": 82.52},
}

tisi_transactions_store = {}
tisi_balance = 50000.00


def generate_tisi_transaction_id():
    """Generar nro_transaccion en formato TISI"""
    return str(random.randint(10000, 99999))


def validate_tisi_bearer():
    """Validar Bearer token TISI"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return False
    token = auth.replace("Bearer ", "").strip()
    return token == TISI_TOKEN


# ================================================================
# ENDPOINT TISI: POST /Auth/token
# Login — retorna Bearer token
# ================================================================

@app.route('/Auth/token', methods=['POST', 'OPTIONS'])
def tisi_auth_token():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    username = data.get("userName", "")
    password = data.get("password", "")

    log_request_response('/Auth/token', 'POST', {"userName": username, "password": "***"}, {}, 0)

    if TISI_VALID_USERS.get(username) == password:
        response_data = {"token": TISI_TOKEN}
        print(f"[TISI /Auth/token] ✅ Login OK para {username}")
        log_request_response('/Auth/token', 'POST', {"userName": username}, response_data, 200)
        return jsonify(response_data), 200
    else:
        response_data = {"codigo": "98", "mensaje": "La clave de seguridad es incorrecta."}
        print(f"[TISI /Auth/token] ❌ Login FAIL para {username}")
        log_request_response('/Auth/token', 'POST', {"userName": username}, response_data, 401)
        return jsonify(response_data), 401


# ================================================================
# ENDPOINT TISI: POST /Recarga/procesar
# Realizar recarga — formato exacto TISI
# ================================================================

@app.route('/Recarga/procesar', methods=['POST', 'OPTIONS'])
def tisi_recarga_procesar():
    if request.method == 'OPTIONS':
        return '', 200

    global tisi_balance

    # Validar token
    if not validate_tisi_bearer():
        response_data = {"codigo": "98", "mensaje": "La clave de seguridad es incorrecta."}
        print("[TISI /Recarga/procesar] ❌ Token inválido")
        log_request_response('/Recarga/procesar', 'POST', None, response_data, 401)
        return jsonify(response_data), 401

    data = request.get_json() or {}
    id_producto  = str(data.get("id_producto", ""))
    numero       = str(data.get("numero", "")).strip()
    importe      = data.get("importe", "")
    nro_ref      = str(data.get("nro_transaccion_referencia", ""))
    codigo_dist  = data.get("codigo_distribuidor", "")
    ubigeo       = data.get("ubigeo", "")

    print(f"[TISI /Recarga/procesar] id_producto={id_producto} numero={numero} importe={importe} ref={nro_ref}")

    # Validar campos requeridos
    missing = []
    if not id_producto: missing.append("id_producto")
    if not numero:      missing.append("numero")
    if not importe:     missing.append("importe")
    if not nro_ref:     missing.append("nro_transaccion_referencia")
    if not ubigeo:      missing.append("ubigeo")

    if missing:
        response_data = {
            "codigo": "97",
            "mensaje": f"Datos incorrectos. Faltan: {', '.join(missing)}"
        }
        log_request_response('/Recarga/procesar', 'POST', data, response_data, 200)
        return jsonify(response_data), 200

    # Validar ubigeo obligatorio
    if not ubigeo:
        response_data = {"codigo": "87", "mensaje": "El campo ubigeo es obligatorio."}
        log_request_response('/Recarga/procesar', 'POST', data, response_data, 200)
        return jsonify(response_data), 200

    # Validar id_producto
    if id_producto not in TISI_PRODUCTS:
        response_data = {"codigo": "04", "mensaje": "El producto no existe."}
        print(f"[TISI /Recarga/procesar] ❌ Producto no existe: {id_producto}")
        log_request_response('/Recarga/procesar', 'POST', data, response_data, 200)
        return jsonify(response_data), 200

    producto = TISI_PRODUCTS[id_producto]

    # Validar número (solo dígitos)
    if not numero.isdigit():
        response_data = {"codigo": "30", "mensaje": "El número del cliente debe ser numérico."}
        log_request_response('/Recarga/procesar', 'POST', data, response_data, 200)
        return jsonify(response_data), 200

    # Validar importe numérico y en rango
    try:
        importe_float = float(importe)
    except (ValueError, TypeError):
        response_data = {"codigo": "31", "mensaje": "El importe de recarga debe ser numérico."}
        log_request_response('/Recarga/procesar', 'POST', data, response_data, 200)
        return jsonify(response_data), 200

    if importe_float < producto["min"] or importe_float > producto["max"]:
        response_data = {
            "codigo": "82",
            "mensaje": f"El monto de la recarga no es válido. Rango permitido: {producto['min']} - {producto['max']}"
        }
        print(f"[TISI /Recarga/procesar] ❌ Monto fuera de rango: {importe_float}")
        log_request_response('/Recarga/procesar', 'POST', data, response_data, 200)
        return jsonify(response_data), 200

    # Validar saldo
    if importe_float > tisi_balance:
        response_data = {"codigo": "95", "mensaje": "No cuenta con saldo suficiente."}
        log_request_response('/Recarga/procesar', 'POST', data, response_data, 200)
        return jsonify(response_data), 200

    # Procesar recarga exitosa
    tisi_balance -= importe_float
    nro_transaccion = generate_tisi_transaction_id()

    tisi_transactions_store[nro_ref] = {
        "nro_transaccion": nro_transaccion,
        "id_producto": id_producto,
        "operadora": producto["operadora"],
        "numero": numero,
        "importe": importe,
        "nro_transaccion_referencia": nro_ref
    }

    response_data = {
        "codigo": "00",
        "mensaje": "Operación exitosa, la recarga se hará efectiva en unos segundos.",
        "nro_transaccion": nro_transaccion
    }

    print(f"[TISI /Recarga/procesar] ✅ OK | TXN={nro_transaccion} | {producto['operadora']} | {numero} | S/{importe_float} | Saldo={tisi_balance:.2f}")
    log_request_response('/Recarga/procesar', 'POST', data, response_data, 200)
    return jsonify(response_data), 200


# ================================================================
# ENDPOINT TISI: POST /Consulta/saldo
# Consultar saldo TISI
# ================================================================

@app.route('/Consulta/saldo', methods=['POST', 'OPTIONS'])
def tisi_consulta_saldo():
    if request.method == 'OPTIONS':
        return '', 200

    if not validate_tisi_bearer():
        response_data = {"codigo": "98", "mensaje": "La clave de seguridad es incorrecta."}
        return jsonify(response_data), 401

    response_data = {"saldo_disponible": f"{tisi_balance:.3f}"}
    print(f"[TISI /Consulta/saldo] ✅ Saldo: {tisi_balance:.3f}")
    log_request_response('/Consulta/saldo', 'POST', {}, response_data, 200)
    return jsonify(response_data), 200


# ================================================================
# CATCH-ALL ROUTE (DEBE IR AL FINAL)
# ================================================================

@app.route('/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_request(endpoint):
    """
    Maneja cualquier request no reconocido
    Retorna error 404 como lo haría LATCOM real
    """
    if request.method in ['POST', 'PUT', 'DELETE']:
        request_data = request.get_json() or {}
    else:
        request_data = dict(request.args)

    response_data = {
        "success": False,
        "error_code": "INVALID_REQUEST",
        "error_message": f"Endpoint not found: /{endpoint}",
        "timestamp": get_timestamp()
    }

    log_request_response(f'/{endpoint}', request.method, request_data, response_data, 404)
    return jsonify(response_data), 404


# ================================================================
# INICIO DEL SERVIDOR
# ================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("🎭 VENDOR SIMULATOR - LATCOM API v1")
    print("=" * 60)
    print(f"Puerto: {PORT}")
    print(f"Log file: {LOG_FILE}")
    print(f"Directorio: {os.getcwd()}")
    print(f"Balance inicial: {simulated_balance:.2f} USD")
    print("=" * 60)
    print("Rutas disponibles:")
    print("  TOPUP:")
    print("    - POST /api/v1/topup")
    print("  BALANCE:")
    print("    - GET  /api/v1/balance")
    print("  TRANSACCIÓN:")
    print("    - GET  /api/v1/transaction/<id>")
    print("  OTROS:")
    print("    - GET  /health")
    print("    - *    /<cualquier-ruta> (404)")
    print("=" * 60)
    print(f"Auth: x-customer-id={VALID_CUSTOMER_ID}")
    print("Auth: x-api-key=<valor desde tabla vendors en BD>")
    print("=" * 60)
    print("Esperando requests de Latconecta...")
    print("")

    app.run(host='0.0.0.0', port=PORT, debug=True)