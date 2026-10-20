import tkinter as tk
import serial

# -----------------------------
# CONFIGURACION
# -----------------------------
PUERTO = "COM4"      # Cambiar por tu puerto
BAUDIOS = 9600

ser = None

# -----------------------------
# CONECTAR
# -----------------------------
def conectar():
    global ser

    try:
        ser = serial.Serial(PUERTO, BAUDIOS, timeout=1)

        estado.config(
            text=f"Conectado a {PUERTO}"
        )

    except Exception as e:
        estado.config(text=str(e))

# -----------------------------
# ENVIAR
# -----------------------------
def enviar(cmd):

    global ser

    if ser is not None and ser.is_open:
        ser.write(cmd.encode())

# -----------------------------
# BOTON MOMENTANEO
# -----------------------------
def crear_boton(frame,texto,on_cmd,off_cmd,row,col):

    boton = tk.Button(
        frame,
        text=texto,
        width=18,
        height=2
    )

    boton.grid(
        row=row,
        column=col,
        padx=5,
        pady=5
    )

    boton.bind(
        "<ButtonPress-1>",
        lambda e: enviar(on_cmd)
    )

    boton.bind(
        "<ButtonRelease-1>",
        lambda e: enviar(off_cmd)
    )

# -----------------------------
# VENTANA
# -----------------------------
root = tk.Tk()

root.title("Brazo Robotico")

estado = tk.Label(
    root,
    text="Desconectado"
)

estado.pack(pady=5)

tk.Button(
    root,
    text="Conectar",
    command=conectar
).pack(pady=5)

frame = tk.Frame(root)
frame.pack()

crear_boton(frame,"Base Izquierda",'A','a',0,0)
crear_boton(frame,"Base Derecha",'B','b',0,1)

crear_boton(frame,"Hombro Arriba",'C','c',1,0)
crear_boton(frame,"Hombro Abajo",'D','d',1,1)

crear_boton(frame,"Codo Arriba",'E','e',2,0)
crear_boton(frame,"Codo Abajo",'F','f',2,1)

crear_boton(frame,"Muñeca Arriba",'G','g',3,0)
crear_boton(frame,"Muñeca Abajo",'H','h',3,1)

crear_boton(frame,"Giro Izquierda",'I','i',4,0)
crear_boton(frame,"Giro Derecha",'J','j',4,1)

crear_boton(frame,"Cerrar Pinza",'K','k',5,0)
crear_boton(frame,"Abrir Pinza",'L','l',5,1)

tk.Button(
    root,
    text="HOME",
    width=15,
    command=lambda: enviar('R')
).pack(pady=5)

tk.Button(
    root,
    text="AUTO",
    width=15,
    command=lambda: enviar('T')
).pack(pady=5)

tk.Button(
    root,
    text="STOP",
    width=15,
    command=lambda: enviar('S')
).pack(pady=5)

root.mainloop()
