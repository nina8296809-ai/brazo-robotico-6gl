import os
import time
import serial
import socket
import queue
import threading
import webview
from flask import Flask, jsonify, request, Response, send_from_directory

# ============================================================
# CONFIGURACIÓN DEL HARDWARE (PIC / SERIAL)
# ============================================================
PUERTO = "COM4"
BAUDIOS = 9600
ser = None

try:
    ser = serial.Serial(PUERTO, BAUDIOS, timeout=0.1)
    print(f"Conectado exitosamente al hardware en {PUERTO}")
except Exception as e:
    print("⚠️ Modo Emulado: No se detectó hardware. Corriendo simulación virtual libre.")

# ============================================================
# SERVIDOR FLASK (ACCESIBLE DESDE TABLETS EN LA MISMA RED)
# ============================================================
app = Flask(__name__, static_folder='.', static_url_path='')

# Clientes conectados para recibir telemetría (SSE)
clients = set()
clients_lock = threading.Lock()

def obtener_ip_local():
    """ Obtiene la dirección IP local de la computadora para que la tablet se conecte """
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/conectar')
def api_conectar():
    global ser
    try:
        if ser and ser.is_open:
            ser.close()
        ser = serial.Serial(PUERTO, BAUDIOS, timeout=0.1)
        status_msg = f"SISTEMA ONLINE: {PUERTO}"
        print(status_msg)
        return jsonify({"status": status_msg})
    except Exception as e:
        status_msg = "ERROR DE CONEXIÓN"
        print(f"Error al conectar: {e}")
        return jsonify({"status": status_msg})

@app.route('/api/enviar')
def api_enviar():
    global ser
    cmd = request.args.get('cmd', '')
    if not cmd:
        return jsonify({"error": "No cmd specified"}), 400
    
    if ser and ser.is_open:
        try:
            ser.write(cmd.encode())
            print(f"PIC Serial Out -> {cmd}")
            return jsonify({"status": "sent", "cmd": cmd})
        except Exception as e:
            print(f"Error de envío: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        print(f"Emulación Out -> {cmd}")
        return jsonify({"status": "emulated", "cmd": cmd})

@app.route('/api/estado')
def api_estado():
    global ser
    if ser and ser.is_open:
        return jsonify({"status": f"SISTEMA ONLINE: {PUERTO}"})
    else:
        return jsonify({"status": "MODO EMULADO (HARDWARE OFFLINE)"})

@app.route('/api/info')
def api_info():
    return jsonify({
        "ip": obtener_ip_local(),
        "port": 5000
    })

@app.route('/telemetria')
def telemetria():
    def event_stream():
        q = queue.Queue()
        with clients_lock:
            clients.add(q)
        try:
            while True:
                try:
                    # Enviar datos en tiempo real si existen en la cola
                    data = q.get(timeout=1.0)
                    yield f"data: {data}\n\n"
                except queue.Empty:
                    # Ping keep-alive
                    yield "data: ping\n\n"
        except GeneratorExit:
            pass
        finally:
            with clients_lock:
                clients.discard(q)

    return Response(event_stream(), mimetype="text/event-stream")

# ============================================================
# HILO DE ESCUCHA DE TELEMETRÍA SERIAL
# ============================================================
def escuchar_telemetria_pic():
    """ Hilo de fondo que lee las respuestas posicionales reales del PIC y las envía a los clientes """
    global ser
    while True:
        if ser and ser.is_open:
            try:
                if ser.in_waiting > 0:
                    linea = ser.readline().decode('utf-8', errors='ignore').strip()
                    if linea.startswith("DAT:"):
                        print(f"PIC Telemetría -> {linea}")
                        with clients_lock:
                            for q in clients:
                                q.put(linea)
            except Exception as e:
                pass
        time.sleep(0.01)

# ============================================================
# INICIO DE LA APLICACIÓN
# ============================================================
def run_flask():
    # El servidor corre en host '0.0.0.0' para ser accesible desde la tablet
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)

if __name__ == '__main__':
    # 1. Iniciar servidor Flask en hilo secundario
    hilo_flask = threading.Thread(target=run_flask, daemon=True)
    hilo_flask.start()
    
    # 2. Iniciar lector de telemetría serial en hilo secundario
    hilo_serial = threading.Thread(target=escuchar_telemetria_pic, daemon=True)
    hilo_serial.start()
    
    # Imprimir instrucciones para la tablet en consola
    ip_local = obtener_ip_local()
    print("\n" + "="*60)
    print(" SERVIDOR SCADA INICIADO ")
    print(f" Computadora local: http://localhost:5000")
    print(f" Para la tablet:    http://{ip_local}:5000")
    print("="*60 + "\n")
    
    # Esperar un momento a que Flask inicie antes de abrir la interfaz nativa
    time.sleep(0.5)
    
    # 3. Abrir la interfaz nativa apuntando al servidor local
    webview.create_window(
        title='SCADA Supervisor V2.0 - Brazo Robótico XK-LS5B',
        url='http://localhost:5000',
        width=1280,
        height=750,
        resizable=True,
        background_color='#111112'
    )
    
    # Iniciar la interfaz gráfica de webview
    webview.start()
    
    # Al cerrar la aplicación, liberar el puerto COM limpiamente
    if ser and ser.is_open:
        ser.close()
        print("Puerto serial cerrado correctamente.")