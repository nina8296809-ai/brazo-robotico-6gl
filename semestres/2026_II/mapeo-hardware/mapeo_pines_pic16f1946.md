# Mapeo de pines del PIC16F1946

Asignación de entradas y salidas del microcontrolador que controla el brazo. Las etiquetas son los nombres de las variables en el firmware; parecen abreviaturas en pinyin del programa original (por ejemplo `ss` = subir, `xj` = bajar).

> Pendiente de verificar en el equipo: estado de cada conexión y que las etiquetas coincidan con el código actual.

## Salidas a los drivers

| Eje | Articulación   | Pin PIC | Etiqueta | Acción    |
|-----|----------------|---------|----------|-----------|
| 1   | Base           | RE0     | `zx`     | Izquierda |
| 1   | Base           | RE1     | `yx`     | Derecha   |
| 2   | Hombro         | RE2     | `xj1`    | Baja      |
| 2   | Hombro         | RE3     | `ss1`    | Sube      |
| 3   | Codo           | RE4     | `ss2`    | Sube      |
| 3   | Codo           | RE5     | `xj2`    | Baja      |
| 4   | Muñeca         | RE6     | `ss3`    | Sube      |
| 4   | Muñeca         | RF0     | `xj3`    | Baja      |
| 5   | Giro de muñeca | RF1     | `szzx`   | Gira a la izquierda |
| 5   | Giro de muñeca | RF2     | `szyx`   | Gira a la derecha   |
| 6   | Pinza          | RF3     | `fs`     | Abre (suelta)  |
| 6   | Pinza          | RF4     | `zj`     | Cierra (agarra) |

## Sensores

| Señal | Pines | Tipo | Uso |
|-------|-------|------|-----|
| Sensores de efecto Hall NJK-5002C | RD0 – RD4 | NPN, normalmente abierto, activo en 0 V | Cero (homing) de los ejes 1 a 5 |
| Sensores de efecto Hall NJK-5002C | RD5, RD6 | NPN, normalmente abierto | Límites de giro |
| Finales de carrera M102-011 | — | SPDT mecánico | Tope de apertura y cierre de la pinza |

## Tablero del operador

| Pin | Etiqueta | Función |
|-----|----------|---------|
| RA0 – RA5, RB1 – RB5, RC0 | — | Botones de movimiento manual |
| RC1 | `kaut`   | Selector manual / automático |
| RC3 | `krest`  | Reset y homing |
| RC4 | `kstart` | Inicio de secuencia |
| RC5 | `kstop`  | Parada de emergencia |

## Clasificación de variables (ETN-902)

| Tipo | Símbolo | Señal | Descripción |
|------|---------|-------|-------------|
| Referencia | $r(t)$ | Firmware / tablero | Posiciones angulares objetivo $[\theta_{1d}, \dots, \theta_{6d}]^T$ |
| Manipulada | $u(t)$ | PIC → drivers | Pulsos y dirección de 0 a 5 V |
| Controlada | $y(t)$ | Ejes mecánicos | Ángulo real de cada articulación $[\theta_1, \dots, \theta_6]^T$ |
| Protección | $b(t)$ | NJK-5002C / M102-011 | Estado binario de fin de carrera |
| Perturbación | $d(t)$ | Carga, fricción | Cambios de inercia, rozamiento, juego mecánico, variaciones de la fuente |

Como el lazo es abierto, $y(t)$ no se mide: si un motor pierde pasos por exceso de carga, el PIC no se entera hasta el siguiente homing.
