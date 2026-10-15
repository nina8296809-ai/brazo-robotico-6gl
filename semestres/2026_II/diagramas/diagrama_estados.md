# Diagrama de estados del firmware

> **Borrador.** Está armado a partir de la estructura del `main()` descrita en la documentación anterior (super-loop con modo manual y automático). Hay que verificarlo contra el código real del PIC y corregir nombres de estados y transiciones.

El diagrama está escrito en Mermaid: es texto, se edita aquí mismo y la página lo dibuja sola. Para probar cambios rápido se puede usar https://mermaid.live

```mermaid
stateDiagram-v2
    [*] --> Inicializacion
    Inicializacion: Inicialización (IO_init, PWM_init)
    Inicializacion --> Manual: kaut = 0
    Inicializacion --> Automatico: kaut = 1

    state Manual {
        [*] --> LeerBotonera
        LeerBotonera: Lectura de botonera (hand)
        LeerBotonera --> MoverEje: botón presionado
        MoverEje: Mover el eje seleccionado
        MoverEje --> Verificar
        Verificar: Revisar finales de carrera (check)
        Verificar --> LeerBotonera: retardo antirrebote 20 ms
    }

    state Automatico {
        [*] --> Esperar
        Esperar: Escaneo de teclas (keycan)
        Esperar --> Homing: krest
        Homing: Homing, cero de los ejes (rest)
        Homing --> Secuencias: kstart
        Secuencias: Secuencias 1 a 5 (aut)
        Secuencias --> Esperar: fin de secuencia
    }

    Manual --> Automatico: kaut = 1
    Automatico --> Manual: kaut = 0
    Manual --> Paro: kstop
    Automatico --> Paro: kstop
    Paro: Parada de emergencia
    Paro --> Inicializacion: reset
```

## Preguntas a resolver con el código

- ¿El homing se ejecuta solo al pulsar `krest` o también al encender?
- ¿`kstop` detiene los motores en cualquier punto de la secuencia o solo entre pasos?
- ¿Qué hace cada una de las 5 secuencias automáticas?
