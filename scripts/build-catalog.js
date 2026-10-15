/*
 * Genera web/data/catalogo.js a partir de las carpetas global/ y semestres/.
 *
 *   node scripts/build-catalog.js
 *
 * Cloudflare Pages lo ejecuta en cada push a main. No necesita dependencias.
 * Títulos, descripciones y ejes se pueden corregir en config/archivos.json;
 * los videos de YouTube se agregan en config/videos.json.
 *
 * Basado en el generador de la planta XK-335B
 * (github.com/miguelangel2107/maqueta-manufactura-xk335b), adaptado al brazo de 6 GL.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'web', 'data');
const REPO = 'nina8296809-ai/brazo-robotico-6gl';
const RAMA = 'main';
const LIMITE_CLOUDFLARE = 25 * 1024 * 1024;

const CARPETAS = ['global', 'semestres'];

// Articulaciones del brazo. "claves": palabras que, si aparecen en la ruta del
// archivo (sin tildes y en minúsculas), lo asignan a ese eje.
const ESTACIONES = [
  { id: 1, nombre: 'Base', detalle: 'NEMA 23 · 2M542-N', claves: ['eje1', 'eje_1', 'eje-1'] },
  { id: 2, nombre: 'Hombro', detalle: 'NEMA 23 · 2M542-N', claves: ['eje2', 'eje_2', 'eje-2', 'hombro'] },
  { id: 3, nombre: 'Codo', detalle: 'NEMA 23 · 2M542-N', claves: ['eje3', 'eje_3', 'eje-3', 'codo'] },
  { id: 4, nombre: 'Muñeca', detalle: 'NEMA 17 · 2MA320', claves: ['eje4', 'eje_4', 'eje-4'] },
  { id: 5, nombre: 'Giro de muñeca', detalle: 'NEMA 17 · 2MA320', claves: ['eje5', 'eje_5', 'eje-5', 'giro_muneca', 'giro-muneca'] },
  { id: 6, nombre: 'Pinza', detalle: 'NEMA 16 · husillo', claves: ['eje6', 'eje_6', 'eje-6', 'pinza', 'husillo'] }
];

const CATEGORIAS = {
  guia: 'Guías',
  informe: 'Informes',
  mapeo: 'Mapeo de E/S',
  estados: 'Diagramas de estados',
  flujo: 'Diagramas de flujo',
  bloques: 'Diagramas de bloques',
  diagrama: 'Otros diagramas',
  electrico: 'Planos eléctricos',
  pid: 'P&ID',
  plano: 'Otros planos CAD',
  cinematica: 'Cinemática',
  modelo3d: 'Modelos 3D',
  datasheet: 'Datasheets',
  manual: 'Manuales',
  presentacion: 'Presentaciones',
  datos: 'Datos y ensayos',
  enlace: 'Software y enlaces',
  otro: 'Otros',
  programa: 'Programas',
  imagen: 'Imágenes',
  video: 'Videos'
};

// Tipo de programa, para el filtro de la pestaña Programas
const LENGUAJES = {
  c: 'C (PIC / XC8)', h: 'C (PIC / XC8)',
  asm: 'Ensamblador PIC', hex: 'Firmware compilado (.hex)',
  cpp: 'C/C++', hpp: 'C/C++', ino: 'Arduino',
  py: 'Python',
  m: 'MATLAB', mlx: 'MATLAB', slx: 'Simulink',
  pdsprj: 'Proteus', dsn: 'Proteus',
  js: 'Web', html: 'Web', css: 'Web',
  bat: 'Script'
};

// Carpetas que solo contienen recursos de otro archivo (imágenes de un .md,
// archivos internos del proyecto MPLAB X, etc.). Se ven en el explorador pero no en las listas.
const CARPETAS_RECURSO = new Set([
  'imagenes', 'images', 'img', 'static', 'nbproject', 'build', 'dist', 'debug'
]);

const IGNORAR = new Set(['.git', 'node_modules', '.DS_Store', 'Thumbs.db', 'desktop.ini', '.gitignore', '.gitkeep']);

const EXT = {
  imagen: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg'],
  modelo3d: ['sldprt', 'sldasm', 'slddrw', 'step', 'stp', 'stl', 'igs', 'iges', 'f3d', 'ipt', 'iam', 'obj', 'glb', 'gltf', '3mf'],
  plano: ['dwg', 'dxf', 'aepx', 'wdp'],
  presentacion: ['pptx', 'ppt'],
  datos: ['csv', 'xlsx', 'xlsm', 'xls'],
  video: ['mp4', 'mov', 'avi', 'webm']
};

const VISTAS = {
  pdf: 'pdf',
  md: 'md',
  csv: 'csv',
  drawio: 'drawio',
  docx: 'docx',
  png: 'imagen', jpg: 'imagen', jpeg: 'imagen', gif: 'imagen', bmp: 'imagen', webp: 'imagen', svg: 'imagen',
  mp4: 'video', webm: 'video',
  c: 'texto', h: 'texto', asm: 'texto', hex: 'texto',
  py: 'texto', m: 'texto', txt: 'texto', json: 'texto',
  js: 'texto', css: 'texto', cpp: 'texto', hpp: 'texto', ino: 'texto', xml: 'texto', bat: 'texto'
};

function normalizar(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function leerJson(rel, porDefecto) {
  const archivo = path.join(ROOT, rel);
  if (!fs.existsSync(archivo)) return porDefecto;
  try {
    return JSON.parse(fs.readFileSync(archivo, 'utf8'));
  } catch (err) {
    console.error(`\nERROR: ${rel} no es un JSON válido.\n${err.message}\n` +
      'Revise comas y comillas. Puede validarlo en https://jsonlint.com\n');
    process.exit(1);
  }
}

function recorrer(dirRel, lista) {
  const dirAbs = path.join(ROOT, dirRel);
  if (!fs.existsSync(dirAbs)) return;
  for (const entrada of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    if (IGNORAR.has(entrada.name) || entrada.name.startsWith('~$')) continue;
    const rel = dirRel ? `${dirRel}/${entrada.name}` : entrada.name;
    if (entrada.isDirectory()) recorrer(rel, lista);
    else if (entrada.isFile()) lista.push({ rel, tam: fs.statSync(path.join(ROOT, rel)).size });
  }
}

function etiquetaSemestre(id) {
  const m = /^(\d{4})_(I{1,2})$/.exec(id);
  return m ? `${m[2]}-${m[1]}` : id.replace(/_/g, ' ');
}

function tituloDesdeNombre(nombre) {
  return nombre
    .replace(/\.[^.]+$/, '')
    .replace(/[_]+/g, ' ')
    .replace(/\s+-\s+/g, ' - ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function detectarEstaciones(rel) {
  const texto = normalizar(rel);
  return ESTACIONES.filter(e => e.claves.some(c => texto.includes(c))).map(e => e.id);
}

// Placeholder .html que solo redirige a Google Drive u otro sitio
function enlaceExterno(abs, tam) {
  if (tam > 20000) return null;
  const html = fs.readFileSync(abs, 'utf8');
  if (!/Archivo Excluido|drive\.google|window\.location/i.test(html)) return null;
  const m = html.match(/href="(https?:\/\/[^"]+)"/i) || html.match(/location(?:\.href)?\s*=\s*["'](https?:\/\/[^"']+)/i);
  return m ? m[1] : null;
}

function clasificar(rel, ext, partes, externo) {
  const p = normalizar(rel);
  const nombre = normalizar(partes[partes.length - 1]);

  if (externo) {
    return /\.(mp4|mov|avi|webm)\.html$/i.test(rel) ? 'video' : 'enlace';
  }
  if (partes[0] === 'global' && partes[1] === 'datasheets') return 'datasheet';
  if (partes[0] === 'global' && partes[1] === 'manuales') return 'manual';
  if (EXT.modelo3d.includes(ext) || (ext === 'dwg' && /(^|[\/_ -])3d|modelos-3d|cad_3d/.test(p))) return 'modelo3d';
  if (EXT.imagen.includes(ext)) return 'imagen';
  if (EXT.video.includes(ext)) return 'video';

  const diagrama = () => {
    if (/estado/.test(nombre) || /\/estados\//.test(p)) return 'estados';
    if (/bloque/.test(nombre) || /bloques/.test(p)) return 'bloques';
    if (/flujo/.test(p)) return 'flujo';
    return null;
  };
  if (ext === 'drawio') return diagrama() || 'diagrama';

  const esCad = EXT.plano.includes(ext);
  if (esCad || ['pdf', 'docx', 'doc', 'md'].includes(ext)) {
    if (/electric/.test(nombre) || /\/electrico\//.test(p)) return 'electrico';
    if (/p&id|p_id/.test(nombre) || /p&id|\/pid\//.test(p) ||
      (/(^|[_\-. ])pid([_\-. ]|\d|$)/.test(nombre) && !/informe|bitacora|control/.test(nombre))) return 'pid';
    if (esCad) return 'plano';
    if (/guia/.test(nombre)) return 'guia';
    if (/cinematica|denavit|(^|[_\-. ])dh([_\-. ]|$)/.test(nombre) || /\/cinematica\//.test(p)) return 'cinematica';
    const d = diagrama();
    if (d) return d;
    if (/diagrama/.test(nombre)) return 'diagrama';
    if (/mapeo|pines/.test(nombre) || /\/mapeo-hardware\//.test(p)) return 'mapeo';
    if (/manual|datasheet/.test(nombre)) return 'manual';
    return 'informe';
  }
  if (LENGUAJES[ext]) return 'programa';
  if (EXT.presentacion.includes(ext)) return 'presentacion';
  if (EXT.datos.includes(ext)) return 'datos';
  return 'otro';
}

function construir() {
  const semConfig = leerJson('config/semestres.json', { semestres: {} });
  const archConfig = leerJson('config/archivos.json', {});
  const vidConfig = leerJson('config/videos.json', { videos: [] });
  const carpetas = leerJson('config/carpetas.json', {});

  const lista = [];
  for (const c of CARPETAS) recorrer(c, lista);
  if (fs.existsSync(path.join(ROOT, 'README.md'))) {
    lista.push({ rel: 'README.md', tam: fs.statSync(path.join(ROOT, 'README.md')).size });
  }

  // Configuración por carpeta: claves que terminan en "/"
  const porCarpeta = Object.entries(archConfig)
    .filter(([k]) => k.endsWith('/'))
    .sort((a, b) => a[0].length - b[0].length);

  const grandes = [];
  const archivos = lista.map(({ rel, tam }) => {
    const partes = rel.split('/');
    const nombre = partes[partes.length - 1];
    const ext = nombre.includes('.') ? nombre.split('.').pop().toLowerCase() : '';
    const abs = path.join(ROOT, rel);
    const semestre = partes[0] === 'semestres' && partes.length > 2 ? partes[1] : 'global';
    const externo = ext === 'html' ? enlaceExterno(abs, tam) : null;

    const extra = {};
    for (const [k, v] of porCarpeta) if (rel.startsWith(k)) Object.assign(extra, v);
    Object.assign(extra, archConfig[rel] || {});

    const auto = clasificar(rel, ext, partes, externo);
    // Una categoría puesta para toda una carpeta no saca a las imágenes de la galería
    const categoria = extra.categoria && auto !== 'imagen' ? extra.categoria : auto;
    const dirs = partes.slice(0, -1).map(d => d.toLowerCase());
    let recurso = dirs.some(d => CARPETAS_RECURSO.has(d)) || nombre.toLowerCase() === 'readme.md';
    if (typeof extra.oculto === 'boolean') recurso = extra.oculto;

    const item = {
      ruta: rel,
      nombre,
      ext,
      titulo: extra.titulo || tituloDesdeNombre(externo ? nombre.replace(/\.html$/i, '') : nombre),
      semestre,
      categoria,
      estaciones: extra.estaciones || detectarEstaciones(rel),
      tam
    };
    if (extra.descripcion) item.descripcion = extra.descripcion;
    if (extra.orden != null) item.orden = extra.orden;
    if (recurso) item.recurso = true;
    if (categoria === 'programa') item.lenguaje = LENGUAJES[ext] || ext.toUpperCase();
    if (externo) item.externo = externo;
    else if (ext === 'html') item.vista = 'web';
    else if (VISTAS[ext]) item.vista = VISTAS[ext];
    if (tam > LIMITE_CLOUDFLARE) {
      item.github = `https://github.com/${REPO}/raw/${RAMA}/${rel.split('/').map(encodeURIComponent).join('/')}`;
      delete item.vista;
      grandes.push(rel);
    }
    return item;
  });

  const idsSemestre = fs.existsSync(path.join(ROOT, 'semestres'))
    ? fs.readdirSync(path.join(ROOT, 'semestres'), { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
    : [];
  const semestres = idsSemestre.sort().reverse().map(id => ({
    id,
    etiqueta: etiquetaSemestre(id),
    resumen: (semConfig.semestres[id] || {}).resumen || '',
    archivos: archivos.filter(a => a.semestre === id && !a.recurso).length
  }));

  const videos = (vidConfig.videos || []).filter(v => v && v.url).map(v => ({
    titulo: v.titulo || 'Video',
    url: v.url,
    semestre: v.semestre || semConfig.actual || 'global',
    estaciones: v.estaciones || [],
    descripcion: v.descripcion || ''
  }));

  const catalogo = {
    generado: new Date().toISOString(),
    repo: REPO,
    rama: RAMA,
    actual: semConfig.actual || (semestres[0] && semestres[0].id),
    estaciones: ESTACIONES.map(({ claves, ...e }) => e),
    categorias: CATEGORIAS,
    carpetas,
    semestres,
    videos,
    archivos
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'catalogo.js'),
    `// Archivo generado por scripts/build-catalog.js. No editar a mano.\nwindow.CATALOGO = ${JSON.stringify(catalogo)};\n`);

  console.log(`Catálogo: ${archivos.length} archivos, ${semestres.length} semestres, ${videos.length} videos.`);

  // En Cloudflare Pages los archivos de más de 25 MB hacen fallar el despliegue.
  // Se quitan de la copia que se publica; la página los descarga desde GitHub.
  if (grandes.length) {
    console.log(`Archivos de más de 25 MB (se descargan desde GitHub):\n  ${grandes.join('\n  ')}`);
    if (process.env.CF_PAGES) {
      for (const rel of grandes) fs.unlinkSync(path.join(ROOT, rel));
      console.log('Quitados de la copia de Cloudflare.');
    }
  }
}

construir();
