# Brazo robótico de 6 grados de libertad

Brazo robótico del Laboratorio de Control de la Carrera de Ingeniería Electrónica, UMSA. Lo controla un microcontrolador **PIC16F1946** que envía señales a seis drivers de motores paso a paso, uno por articulación. Es un equipo independiente de la planta XK-335B.

Este repositorio reúne la documentación del brazo y el trabajo de cada semestre: mapeo de pines, firmware, diagramas, planos, informes y datasheets. La página del proyecto se genera automáticamente a partir de estas carpetas.

## Ejes

| Eje | Articulación   | Movimiento                  | Motor                  | Driver   | Pines PIC   |
|-----|----------------|-----------------------------|------------------------|----------|-------------|
| 1   | Base           | Gira a izquierda / derecha  | NEMA 23 (57J1854-828)  | 2M542-N  | RE0 / RE1   |
| 2   | Hombro         | Baja / sube                 | NEMA 23 (57J1854-828)  | 2M542-N  | RE2 / RE3   |
| 3   | Codo           | Sube / baja                 | NEMA 23 (57J1854-828)  | 2M542-N  | RE4 / RE5   |
| 4   | Muñeca         | Sube / baja                 | NEMA 17 (42J1848-604)  | 2MA320   | RE6 / RF0   |
| 5   | Giro de muñeca | Rota la mano a izq. / der.  | NEMA 17 (42J1848-604)  | 2MA320   | RF1 / RF2   |
| 6   | Pinza          | Abre / cierra con husillo   | NEMA 16                | —        | RF3 / RF4   |

> Los modelos de motor y driver de los ejes 5 y 6 están por verificar en el equipo físico.

## Control

- **Microcontrolador:** PIC16F1946 (14 KB de Flash, 54 pines de E/S), cristal HS de 8 MHz.
- **Firmware:** C con MPLAB X IDE y compilador XC8. Máquina de estados sobre un super-loop con modo manual (botonera) y modo automático (homing y secuencias).
- **Sensores:** sensores de efecto Hall NJK-5002C (NPN, normalmente abiertos) para el cero de los ejes 1 a 5 y los límites de giro; finales de carrera M102-011 en la pinza.
- **Lazo abierto:** los sensores no retroalimentan la posición; solo se usan para el homing y como protección contra sobrecarrera. Una pérdida de pasos no se detecta.

El detalle de cada pin está en [`semestres/2026_II/mapeo-hardware`](semestres/2026_II/mapeo-hardware/mapeo_pines_pic16f1946.md).

## Contenido

| Carpeta                  | Contenido |
|--------------------------|-----------|
| `global/datasheets`      | Hojas de datos del PIC, drivers, motores y sensores. |
| `global/manuales`        | Manual original del brazo. |
| `global/modelos-3d`      | Modelos 3D del brazo. |
| `global/software`        | Enlaces a MPLAB X, XC8 y otras herramientas. |
| `semestres/2022_II`      | Diagnóstico inicial, bitácoras y primer programa del PIC (en Google Drive). |
| `semestres/2023_I`       | Programas, documentación y videos (en Google Drive). |
| `semestres/2023_II`      | Trabajo de los equipos E1 y E2 (en Google Drive). |
| `semestres/2026_I`       | Laboratorios 1 a 7, simulador, mantenimiento (en Google Drive). |
| `semestres/2026_II`      | Semestre en curso: ingeniería inversa, mapeo de pines, diagramas, firmware y pruebas. |

Cómo subir archivos y mantener la página: [`config/README.md`](config/README.md).

Asignatura: ETN-902 Sistemas de Control II.

El sitio web y el generador del catálogo están basados en los de la [planta XK-335B](https://github.com/miguelangel2107/maqueta-manufactura-xk335b).
