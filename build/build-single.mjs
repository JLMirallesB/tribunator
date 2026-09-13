// Genera dist/tribunator.html: un unico HTML autocontenido (CSS, JS, librerias,
// demo y logo incrustados) que funciona con doble clic y sin conexion.
// Uso: node build/build-single.mjs   (sin dependencias npm)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VENDOR = join(ROOT, 'build', 'vendor');
const OUT_DIR = join(ROOT, 'dist');
const OUT = join(OUT_DIR, 'tribunator.html');

// CDN URL -> fichero local en build/vendor (mismas versiones que index.html)
const LIBS = {
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js': 'xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js': 'jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js': 'jspdf.plugin.autotable.min.js'
};

const read = p => readFileSync(join(ROOT, p), 'utf8');

async function vendor(url) {
  const file = join(VENDOR, LIBS[url]);
  if (!existsSync(file)) {
    console.log('Descargando', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo descargar ' + url + ' (' + res.status + ')');
    mkdirSync(VENDOR, { recursive: true });
    writeFileSync(file, await res.text());
  }
  return readFileSync(file, 'utf8');
}

// Evita que el contenido cierre la etiqueta antes de tiempo
const safeScript = s => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const safeStyle = s => s.replace(/<\/style/gi, '<\\/style');
const scriptTag = code => '<script>\n' + safeScript(code) + '\n</script>';

const logoUri = 'data:image/svg+xml;base64,' + readFileSync(join(ROOT, 'logo.svg')).toString('base64');
const withLogo = s => s.split('logo.svg').join(logoUri);

const html = read('index.html');
const parts = html.split(/(<link[^>]*>|<script[^>]*><\/script>)/);
let demoInjected = false;
const out = [];

for (const part of parts) {
  let m;
  if ((m = part.match(/^<link[^>]*rel="stylesheet"[^>]*href="([^"?]+)(\?[^"]*)?"[^>]*>$/))) {
    out.push('<style>\n' + safeStyle(withLogo(read(m[1]))) + '\n</style>');
  } else if ((m = part.match(/^<link[^>]*rel="icon"[^>]*>$/))) {
    out.push(withLogo(part));
  } else if ((m = part.match(/^<script[^>]*src="([^"?]+)(\?[^"]*)?"[^>]*><\/script>$/))) {
    const src = m[1];
    if (LIBS[src]) {
      out.push(scriptTag(await vendor(src)));
    } else if (/^https?:/.test(src)) {
      throw new Error('Script externo sin copia local: ' + src);
    } else {
      if (src === 'js/app.js') {
        const demo = JSON.parse(read('demo.json'));
        out.push(scriptTag('window.TRIBUNATOR_DEMO = ' + JSON.stringify(demo) + ';'));
        demoInjected = true;
      }
      out.push(scriptTag(withLogo(read(src))));
    }
  } else {
    out.push(part);
  }
}

if (!demoInjected) throw new Error('No se encontro js/app.js en index.html');
const result = out.join('');
if (/\bsrc="(?!data:)[^"]+"|href="(?!data:)[^"]+"/.test(result.replace(/<script>[\s\S]*?<\/script>|<style>[\s\S]*?<\/style>/g, ''))) {
  throw new Error('Quedan referencias externas en el HTML');
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, result);
console.log('Generado', OUT, '(' + (Buffer.byteLength(result) / 1024 / 1024).toFixed(2) + ' MB)');
