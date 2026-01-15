"""
VENDOR SIMULATOR - Fase 2
Simula un vendor real para validar requests de Latconecta
"""
from flask import Flask, request, jsonify
from datetime import datetime
import json
import os

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
[{timestamp}] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REQUEST RECIBIDO
Endpoint: {endpoint}
Mapping Code: {mapping_code}
Data: {json.dumps(request_data, indent=2)}

RESPONSE ENVIADO
Data: {json.dumps(response_data, indent=2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""
    
    log_to_file(log_entry)
    
    # También imprimir en consola
    print(log_entry)

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

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de health check"""
    return jsonify({
        "status": "ok",
        "service": "Vendor Simulator",
        "timestamp": datetime.now().isoformat()
    }), 200

if __name__ == '__main__':
    print("=" * 60)
    print("🎭 VENDOR SIMULATOR - INICIADO")
    print("=" * 60)
    print(f"Puerto: {PORT}")
    print(f"Log file: {LOG_FILE}")
    print(f"Directorio: {os.getcwd()}")
    print("=" * 60)
    print("Esperando requests de Latconecta...")
    print("")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)
