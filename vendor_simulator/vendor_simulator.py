"""
VENDOR SIMULATOR - Fase 2
Simula un vendor real para validar requests de Latconecta
✅ Incluye: Bill Payment, TopUps y Paquetes
"""
from flask import Flask, request, jsonify
from datetime import datetime
import json
import os
import hashlib
import time
import random

app = Flask(__name__)

# Configuración
LOG_FILE = 'vendor_simulator.log'
PORT = 5001

def log_to_file(message):
    """Escribir en archivo de log"""
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(message + '\n')

def log_request_response(endpoint, request_data, response_data, mapping_code='UNKNOWN'):
    """Registrar request y response en log"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    log_entry = f"""
[{timestamp}] ════════════════════════════════════════
REQUEST RECIBIDO
Endpoint: {endpoint}
Mapping Code: {mapping_code}
Data: {json.dumps(request_data, indent=2)}

RESPONSE ENVIADO
Data: {json.dumps(response_data, indent=2)}
════════════════════════════════════════
"""

    log_to_file(log_entry)

    # También imprimir en consola
    print(log_entry)


# ================================================================
# BILL PAYMENT - VALIDATION
# ================================================================

@app.route('/api/latcom/billpay/validate', methods=['POST', 'OPTIONS'])
def latcom_billpay_validate():
    """
    Validar cuenta para pago de servicios
    Mapping Code: LC04V
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        mapping_code = request.headers.get('X-Mapping-Code', 'LC04V')
        
        print(f"[BILLPAY VALIDATE] Received request")
        print(f"Mapping Code: {mapping_code}")
        print(f"Request data: {json.dumps(data, indent=2)}")
        
        # Extraer datos
        account_number = data.get('account_number', 'UNKNOWN')
        service_type = data.get('service_type', 'electricity')
        company_id = data.get('company_id', 0)
        
        # Validar que tenga account_number
        if not account_number or account_number == 'UNKNOWN':
            response = {
                "status": "error",
                "message": "Account number is required",
                "code": "MISSING_ACCOUNT"
            }
            print(f"[BILLPAY VALIDATE] ❌ Missing account number")
            log_request_response('api/latcom/billpay/validate', data, response, mapping_code)
            return jsonify(response), 400
        
        # Simular validación exitosa
        # Generar monto aleatorio basado en el número de cuenta
        account_hash = int(hashlib.md5(account_number.encode()).hexdigest()[:8], 16)
        monto_base = round(50 + (account_hash % 200), 2)  # Entre 50 y 250
        
        # Determinar indicador basado en service_type
        indicadores = {
            'electricity': 'T',  # Total
            'water': 'T',        # Total
            'gas': 'A',          # Adelanto
            'phone': 'P',        # Parcial
            'internet': 'T'      # Total
        }
        indicador = indicadores.get(service_type, 'T')
        
        response = {
            "status": "success",
            "amount_due": monto_base,
            "payment_type": indicador,
            "account_holder_name": f"Cliente {account_number[-4:]}",
            "due_date": "2026-01-31",
            "service_description": f"{service_type.title()} - Enero 2026",
            "account_number": account_number,
            "company_id": company_id,
            "currency": "PEN"
        }
        
        print(f"[BILLPAY VALIDATE] ✅ Account validated successfully")
        print(f"Account: {account_number}, Amount Due: {monto_base}, Indicator: {indicador}")
        
        log_request_response('api/latcom/billpay/validate', data, response, mapping_code)
        return jsonify(response), 200
        
    except Exception as e:
        print(f"[BILLPAY VALIDATE] ❌ Error: {str(e)}")
        error_response = {
            "status": "error",
            "message": str(e),
            "code": "VALIDATION_ERROR"
        }
        log_request_response('api/latcom/billpay/validate', data, error_response, mapping_code)
        return jsonify(error_response), 500


# ================================================================
# BILL PAYMENT - PROVISION
# ================================================================

@app.route('/api/latcom/billpay/pay', methods=['POST', 'OPTIONS'])
def latcom_billpay_pay():
    """
    Ejecutar pago de servicio
    Mapping Code: LC04P
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json()
        mapping_code = request.headers.get('X-Mapping-Code', 'LC04P')
        
        print(f"[BILLPAY PAY] Received payment request")
        print(f"Mapping Code: {mapping_code}")
        print(f"Request data: {json.dumps(data, indent=2)}")
        
        # Extraer datos
        account_number = data.get('account_number', 'UNKNOWN')
        payment_amount = data.get('payment_amount', 0)
        reference_id = data.get('reference_id', 'NO-REF')
        service_type = data.get('service_type', 'electricity')
        
        # Validar campos obligatorios
        if not account_number or account_number == 'UNKNOWN':
            response = {
                "status": "error",
                "message": "Account number is required",
                "code": "MISSING_ACCOUNT"
            }
            print(f"[BILLPAY PAY] ❌ Missing account number")
            log_request_response('api/latcom/billpay/pay', data, response, mapping_code)
            return jsonify(response), 400
        
        if not payment_amount or payment_amount <= 0:
            response = {
                "status": "error",
                "message": "Invalid payment amount",
                "code": "INVALID_AMOUNT"
            }
            print(f"[BILLPAY PAY] ❌ Invalid amount: {payment_amount}")
            log_request_response('api/latcom/billpay/pay', data, response, mapping_code)
            return jsonify(response), 400
        
        # Generar IDs únicos
        payment_id = f"PAY-{int(time.time())}"
        confirmation_code = f"CONF-{account_number[-4:]}{int(time.time()) % 10000}"
        receipt_number = f"REC-{int(time.time()) % 100000}"
        
        # Simular pago exitoso
        response = {
            "payment_id": payment_id,
            "confirmation_code": confirmation_code,
            "status": "success",
            "payment_date": datetime.now().isoformat(),
            "receipt_number": receipt_number,
            "message": "Payment processed successfully",
            "account_number": account_number,
            "payment_amount": payment_amount,
            "reference_id": reference_id,
            "service_type": service_type
        }
        
        print(f"[BILLPAY PAY] ✅ Payment successful")
        print(f"Account: {account_number}, Amount: {payment_amount}, Payment ID: {payment_id}")
        
        log_request_response('api/latcom/billpay/pay', data, response, mapping_code)
        return jsonify(response), 200
        
    except Exception as e:
        print(f"[BILLPAY PAY] ❌ Error: {str(e)}")
        error_response = {
            "status": "error",
            "message": str(e),
            "code": "PAYMENT_ERROR"
        }
        log_request_response('api/latcom/billpay/pay', data, error_response, mapping_code)
        return jsonify(error_response), 500


# ================================================================
# TOPUPS Y PAQUETES - VALIDATION
# ================================================================

@app.route('/api/latcom/validate', methods=['POST', 'OPTIONS'])
def latcom_topup_validate():
    """
    Validar número de teléfono para TopUps y Paquetes
    Mapping Code: LC02V
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json() or {}
        mapping_code = request.headers.get('X-Mapping-Code', 'LC02V')
        
        print(f"[TOPUP VALIDATE] Received request")
        print(f"Mapping Code: {mapping_code}")
        print(f"Request data: {json.dumps(data, indent=2)}")
        
        # Extraer phone_number (puede venir como msisdn del mapping)
        phone_number = data.get('msisdn') or data.get('phone_number')
        operator_code = data.get('operator_code', 'Unknown')
        country = data.get('country', 'MEX')
        
        if not phone_number:
            print("[TOPUP VALIDATE] ❌ Missing phone number")
            response = {
                "status": "error",
                "valid": False,
                "message": "Phone number is required",
                "code": "MISSING_PHONE"
            }
            log_request_response('api/latcom/validate', data, response, mapping_code)
            return jsonify(response), 400
        
        # Simular validación exitosa
        # Detectar carrier basado en prefijo (simulado)
        carrier = "Telcel"
        if str(phone_number).startswith("521"):
            carrier = "Telcel"
        elif "155" in str(phone_number):
            carrier = "Movistar"
        elif "181" in str(phone_number):
            carrier = "AT&T"
        
        response = {
            "status": "success",
            "valid": True,  # ← CRÍTICO: Campo requerido por success_indicators
            "phone_number": phone_number,
            "carrier": carrier,
            "country": country,
            "phone_type": "mobile",
            "operator_code": operator_code,
            "message": "Phone number is valid"
        }
        
        print(f"[TOPUP VALIDATE] ✅ Phone validated successfully")
        print(f"Phone: {phone_number}, Carrier: {carrier}")
        
        log_request_response('api/latcom/validate', data, response, mapping_code)
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"[TOPUP VALIDATE] ❌ Error: {str(e)}")
        error_response = {
            "status": "error",
            "valid": False,
            "message": f"Validation error: {str(e)}",
            "code": "VALIDATION_ERROR"
        }
        log_request_response('api/latcom/validate', data, error_response, mapping_code)
        return jsonify(error_response), 500


# ================================================================
# TOPUPS Y PAQUETES - PROVISION
# ================================================================

@app.route('/api/latcom/recharge', methods=['POST', 'OPTIONS'])
def latcom_topup_recharge():
    """
    Procesar recarga de TopUp o Paquete
    API Real LATCOM: /tn endpoint
    Mapping Codes: LC01P, LC02P
    
    Campos esperados (API Real LATCOM):
    - msisdn: Número telefónico (M)
    - opr: Operador (M)
    - cuy: País (M)
    - crn: Moneda (M)
    - amt: Monto (C - solo para top-up)
    - pid: Product ID (M)
    - sid: SKU ID (C - solo para plan/bundle)
    - st: Service Type (M) - 1=plan/bundle, 2=top-up
    """
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        data = request.get_json() or {}
        mapping_code = request.headers.get('X-Mapping-Code', 'LC02P')
        
        print(f"[TOPUP RECHARGE] Received request")
        print(f"Mapping Code: {mapping_code}")
        print(f"Request data: {json.dumps(data, indent=2)}")
        
        # ✅ ACTUALIZADO: Usar campos del API real de LATCOM
        msisdn = data.get('msisdn')
        opr = data.get('opr')
        cuy = data.get('cuy')
        crn = data.get('crn')
        amt = data.get('amt')
        pid = data.get('pid')
        sid = data.get('sid')
        st = data.get('st')  # 1=plan/bundle, 2=top-up
        
        # Validar campos obligatorios
        if not msisdn:
            print("[TOPUP RECHARGE] ❌ Missing msisdn")
            response = {
                "status": "error",
                "message": "msisdn is required",
                "code": "MISSING_MSISDN"
            }
            log_request_response('api/latcom/recharge', data, response, mapping_code)
            return jsonify(response), 400
        
        if not pid:
            print("[TOPUP RECHARGE] ❌ Missing pid (Product ID)")
            response = {
                "status": "error",
                "message": "pid (Product ID) is required",
                "code": "MISSING_PID"
            }
            log_request_response('api/latcom/recharge', data, response, mapping_code)
            return jsonify(response), 400
        
        # Validar según service type
        if st == 2:  # Top-up
            if not amt:
                print("[TOPUP RECHARGE] ❌ Missing amt for top-up")
                response = {
                    "status": "error",
                    "message": "amt (Amount) is required for top-up (st=2)",
                    "code": "MISSING_AMT"
                }
                log_request_response('api/latcom/recharge', data, response, mapping_code)
                return jsonify(response), 400
        
        # Generar respuesta exitosa (formato API real LATCOM - ver página 12)
        trans_id = f"LT{int(time.time() * 1000) % 1000000}"
        ven_transid = f"VEN-{random.randint(1000000000, 9999999999)}"
        
        response = {
            "Amount": float(amt) if amt else 0.0,
            "productId": pid,
            "currency": crn or "USD",
            "service": int(st) if st else 2,
            "trans_id": trans_id,
            "status": "success",
            "created_at": datetime.now().isoformat() + "Z",
            "ven_transid": ven_transid,
            "response_code": "1",
            "response_message": "Success"
        }
        
        print(f"[TOPUP RECHARGE] ✅ Recharge successful")
        print(f"MSISDN: {msisdn}, Amount: {amt}, Operator: {opr}, TXN: {trans_id}")
        
        log_request_response('api/latcom/recharge', data, response, mapping_code)
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"[TOPUP RECHARGE] ❌ Error: {str(e)}")
        error_response = {
            "status": "error",
            "message": f"Recharge error: {str(e)}",
            "code": "RECHARGE_ERROR",
            "response_code": "-140001"
        }
        log_request_response('api/latcom/recharge', data, error_response, mapping_code)
        return jsonify(error_response), 500


# ================================================================
# HEALTH CHECK
# ================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de health check"""
    return jsonify({
        "status": "ok",
        "service": "Vendor Simulator",
        "timestamp": datetime.now().isoformat()
    }), 200


# ================================================================
# CATCH-ALL ROUTE (DEBE IR AL FINAL)
# ================================================================

@app.route('/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def handle_request(endpoint):
    """
    Maneja cualquier request que llegue al simulador
    Retorna respuesta de éxito simulada
    """
    
    # Obtener datos del request
    if request.method == 'GET':
        request_data = dict(request.args)
    else:
        request_data = request.get_json() or {}
    
    # Obtener mapping code de headers (si existe)
    mapping_code = request.headers.get('X-Mapping-Code', 'UNKNOWN')
    
    # Simular respuesta exitosa
    response_data = {
        "status": "SUCCESS",
        "transaction_id": f"SIM-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.now().isoformat(),
        "message": "Transaction processed successfully (SIMULATED)"
    }
    
    # Registrar en log
    log_request_response(endpoint, request_data, response_data, mapping_code)
    
    return jsonify(response_data), 200


# ================================================================
# INICIO DEL SERVIDOR
# ================================================================

if __name__ == '__main__':
    print("=" * 60)
    print("🎭 VENDOR SIMULATOR - INICIADO")
    print("=" * 60)
    print(f"Puerto: {PORT}")
    print(f"Log file: {LOG_FILE}")
    print(f"Directorio: {os.getcwd()}")
    print("=" * 60)
    print("Rutas disponibles:")
    print("  BILL PAYMENT:")
    print("    - POST /api/latcom/billpay/validate")
    print("    - POST /api/latcom/billpay/pay")
    print("  TOPUPS Y PAQUETES:")
    print("    - POST /api/latcom/validate")
    print("    - POST /api/latcom/recharge")
    print("  OTROS:")
    print("    - GET  /health")
    print("    - *    /<cualquier-ruta> (Catch-all)")
    print("=" * 60)
    print("Esperando requests de Latconecta...")
    print("")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)