# Mantenimiento del repositorio y de la página

## Subir archivos

Desde GitHub: entrar a la carpeta, **Add file → Upload files**, arrastrar los archivos y hacer commit en `main`. La página se actualiza uno o dos minutos después.

- Lo de cada semestre va en `semestres/<semestre>/`; lo que es del brazo y no de un semestre (datasheets, manuales, modelos 3D) va en `global/`.
- Nombres sin tildes, sin `ñ` y sin espacios: `eje5_giro_muneca_prueba.csv`.
- Si el nombre o la carpeta incluye `eje1` … `eje6` (también `hombro`, `codo`, `pinza`, `husillo`, `giro_muneca`), la página asigna el archivo a ese eje.
- La página clasifica por el nombre y la carpeta: `guia` → guías, `mapeo` o `pines` → mapeo de E/S, `estado` → diagrama de estados, `flujo` → diagrama de flujo, `bloques` → diagrama de bloques, `electrico` → plano eléctrico, `cinematica` o `dh` → cinemática. Un PDF, Word o Markdown sin ninguna de esas palabras se clasifica como informe.
- Código: `.c`, `.h`, `.asm` y `.hex` aparecen en Programas. PDF, imágenes, Markdown, Word, draw.io, CSV y código se abren en la página. Lo demás (`.dwg`, `.pptx`, Proteus, SolidWorks…) se descarga.
- GitHub no acepta archivos de más de 100 MB. Los de más de 25 MB se aceptan, pero la página los descarga desde GitHub porque Cloudflare Pages no publica archivos de ese tamaño.
- GitHub no guarda carpetas vacías. Para crear una carpeta nueva, se sube con un `README.md` que explique su contenido.

## Archivos de esta carpeta

### `archivos.json`

Título, descripción, ejes y categoría de un archivo, con su ruta completa como clave:

```json
"global/datasheets/2M542.pdf": {
  "titulo": "Driver 2M542-N",
  "descripcion": "Driver de los ejes 1, 2 y 3.",
  "estaciones": [1, 2, 3]
}
```

- `estaciones` son los números de eje (1 a 6).
- Una clave que termina en `/` se aplica a todos los archivos de esa carpeta.
- `"categoria"` fuerza la categoría: `guia`, `informe`, `mapeo`, `estados`, `flujo`, `bloques`, `diagrama`, `electrico`, `pid`, `plano`, `cinematica`, `modelo3d`, `datasheet`, `manual`, `presentacion`, `datos`, `programa`, `enlace`.
- `"oculto": true` lo saca de las listas (sigue visible en el explorador de carpetas).
- `"orden"`: número menor aparece primero.
- La ruta debe coincidir exactamente, mayúsculas incluidas. Si se renombra o mueve un archivo, hay que actualizar su clave.

### `videos.json`

Videos de YouTube que aparecen en la galería (pueden ser "no listados"):

```json
"videos": [
  {
    "titulo": "Prueba del hombro en modo manual",
    "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
    "semestre": "2026_II",
    "estaciones": [2]
  }
]
```

### `semestres.json`

Resumen de cada semestre y cuál es el actual (`"actual"`). Al empezar un semestre se crea su carpeta en `semestres/` (por ejemplo `2027_I`, con un `README.md`) y se cambia `"actual"`.

### `carpetas.json`

Nombre con el que se muestra cada carpeta en la galería y el orden de las secciones.

Si un JSON queda mal escrito (una coma de más o una comilla que falta), Cloudflare no publica el cambio y la página sigue con la versión anterior. El error aparece en el registro del despliegue. Se puede revisar antes en https://jsonlint.com

## Semestres anteriores y archivos en Google Drive

Los semestres 2022_II a 2026_I siguen en Google Drive. En el repositorio, cada uno tiene un `README.md` y un `.html` que enlaza a su carpeta de Drive. Para hacer uno nuevo se copia `global/software/plantilla_enlace_drive.html`, se le cambia el nombre y se reemplaza el enlace (dos veces).

## Página web

- `index.html`: estructura de la página. Cloudflare Pages exige que esté en la raíz.
- `web/css`, `web/js`, `web/img`: estilos, lógica e imágenes.
- `scripts/build-catalog.js`: recorre `global/` y `semestres/` y genera `web/data/catalogo.js`, que no se sube a GitHub. Al inicio del script están la lista de ejes (`ESTACIONES`) y las categorías.

Configuración en Cloudflare Pages:

- Comando de build: `node scripts/build-catalog.js`
- Directorio de salida: vacío (raíz)
- Rama de producción: `main`

Para verla en la computadora (con Node.js y Python instalados):

```bash
node scripts/build-catalog.js
python -m http.server 8335
```

y abrir http://localhost:8335
