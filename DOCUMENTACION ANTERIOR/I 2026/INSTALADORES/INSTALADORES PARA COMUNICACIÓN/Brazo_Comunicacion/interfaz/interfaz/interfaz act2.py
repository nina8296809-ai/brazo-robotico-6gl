import tkinter as tk
from tkinter import ttk
import serial
from PIL import Image, ImageTk 

# --- CONFIGURACION ---
PUERTO = "COM4"
BAUDIOS = 9600
ser = None

# --- FUNCIONES ---
def conectar():
    global ser
    try:
        if ser and ser.is_open: ser.close()
        ser = serial.Serial(PUERTO, BAUDIOS, timeout=1)
        lbl_estado.config(text=f"SISTEMA ONLINE: {PUERTO}", fg="#00FF00")
    except Exception as e:
        lbl_estado.config(text="ERROR DE CONEXIÓN", fg="#FF4444")

def enviar(cmd):
    if ser and ser.is_open:
        ser.write(cmd.encode())

def cerrar_app():
    if ser and ser.is_open: ser.close()
    root.destroy()

# --- VENTANA PRINCIPAL ---
root = tk.Tk()
root.title("Robotic Link - Control System")
root.geometry("1000x700")
root.configure(bg="#1a1a1a")
root.protocol("WM_DELETE_WINDOW", cerrar_app)

# --- ENCABEZADO ---
header = tk.Frame(root, bg="#333333", height=80)
header.pack(fill="x")

try:
    ruta_logo = r"C:\Users\USUARIO\Desktop\Brazo_Comunicacion\interfaz\logo1.png"
    img_logo = Image.open(ruta_logo).resize((100, 100), Image.Resampling.LANCZOS)
    logo_tk = ImageTk.PhotoImage(img_logo)
    lbl_logo = tk.Label(header, image=logo_tk, bg="#333333")
    lbl_logo.image = logo_tk
    lbl_logo.pack(side="left", padx=20)
except Exception as e:
    print(f"Logo no encontrado: {e}")

tk.Label(header, text="CONTROL DE BRAZO  DE 6 GRADOS DE LIBERTAD V2.0", 
         fg="white", bg="#333333", font=("Orbitron", 18, "bold")).pack(side="left")

# --- PANEL LATERAL ---
sidebar = tk.Frame(root, bg="#252525", width=250)
sidebar.pack(side="right", fill="y", padx=10, pady=10)

tk.Label(sidebar, text="EQUIPO DE DESARROLLO", fg="#deff9a", 
         bg="#252525", font=("Arial", 12, "bold")).pack(pady=10)

integrantes = ["BISMARK CHOQUE CHOQUE", "LUCAS CONDARCO CALLE", "RODRIGO IPORRE COCA"]
for nombre in integrantes:
    tk.Label(sidebar, text=f"• {nombre}", fg="white", 
             bg="#252525", font=("Arial", 11)).pack(anchor="w", padx=20, pady=2)

# --- AREA DE CONTROL ---
main_frame = tk.Frame(root, bg="#1a1a1a")
main_frame.pack(side="left", expand=True, fill="both", padx=20)

lbl_estado = tk.Label(main_frame, text="SISTEMA DESCONECTADO", 
                      fg="grey", bg="#1a1a1a", font=("Consolas", 12))
lbl_estado.pack(pady=10)

tk.Button(main_frame, text="INICIALIZAR SERIAL", command=conectar,
          bg="#deff9a", fg="black", font=("Arial", 10, "bold"), padx=20).pack(pady=5)

# --- CONTENEDOR LADO A LADO ---
container_area = tk.Frame(main_frame, bg="#1a1a1a")
container_area.pack(pady=20)

# Columna Imagen
col_img = tk.Frame(container_area, bg="#1a1a1a")
col_img.grid(row=0, column=0, padx=20)

try:
    img_robot = Image.open(r"C:\Users\IPORRE\Desktop\Prueba_Brazo_Comunicacion\brazo.png").resize((250, 300), Image.Resampling.LANCZOS)
    robot_tk = ImageTk.PhotoImage(img_robot)
    lbl_robot = tk.Label(col_img, image=robot_tk, bg="#1a1a1a")
    lbl_robot.image = robot_tk
    lbl_robot.pack()
except:
    tk.Label(col_img, text="Imagen [robot.png]", fg="white", bg="#333333", width=30, height=15).pack()

# Columna Botones
col_btns = tk.Frame(container_area, bg="#1a1a1a")
col_btns.grid(row=0, column=1)

def crear_boton_estilizado(f, texto, on, off, r, c):
    btn = tk.Button(f, text=texto, width=15, height=2, 
                    bg="#333333", fg="white", activebackground="#deff9a",
                    font=("Arial", 10), relief="flat")
    btn.grid(row=r, column=c, padx=5, pady=5)
    btn.bind("<ButtonPress-1>", lambda e: enviar(on))
    btn.bind("<ButtonRelease-1>", lambda e: enviar(off))

controles = [
    ("Base IZQ", 'A', 'a', 0, 0), ("Base DER", 'B', 'b', 0, 1),
    ("Hombro SUB", 'C', 'c', 1, 0), ("Hombro BAJ", 'D', 'd', 1, 1),
    ("Codo SUB", 'E', 'e', 2, 0), ("Codo BAJ", 'F', 'f', 2, 1),
    ("Muñeca SUB", 'G', 'g', 3, 0), ("Muñeca BAJ", 'H', 'h', 3, 1),
    ("Giro IZQ", 'I', 'i', 4, 0), ("Giro DER", 'J', 'j', 4, 1),
    ("Cerrar Pinza", 'K', 'k', 5, 0), ("Abrir Pinza", 'L', 'l', 5, 1)
]

for ctrl in controles:
    crear_boton_estilizado(col_btns, *ctrl)
# BOTONES DE SISTEMA (HOME, AUTO, STOP)
system_frame = tk.Frame(main_frame, bg="#1a1a1a")
system_frame.pack(pady=20) # Espacio debajo de la cuadrícula

tk.Button(system_frame, text="HOME", width=12, bg="#444444", fg="white", 
          command=lambda: enviar('R')).pack(side="left", padx=5)

tk.Button(system_frame, text="AUTO", width=12, bg="#444444", fg="white", 
          command=lambda: enviar('T')).pack(side="left", padx=5)

tk.Button(system_frame, text="STOP", width=12, bg="#FF4444", fg="white", font=("Arial", 10, "bold"),
          command=lambda: enviar('S')).pack(side="left", padx=5)
root.mainloop()

