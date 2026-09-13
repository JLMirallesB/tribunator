<p align="center">
  <img src="logo.svg" alt="Tribunator" width="128" height="128">
</p>

<h1 align="center">Tribunator <sub>v1.2.12</sub></h1>

<p align="center">
  Herramienta para la gestion de tribunales, aulas y horarios en centros educativos.
  <br>
  <em>Zero-install. Descarga, abre el HTML y listo.</em>
</p>

<p align="center">
  <a href="https://github.com/JLMirallesB/tribunator/releases/latest">Descargar ultima version</a>
</p>

---

## Que es Tribunator

Tribunator es una aplicacion web que funciona directamente en el navegador, sin necesidad de instalacion, servidores ni bases de datos. Esta pensada para coordinadores de oposiciones y examenes que necesitan:

- Disenar planos de sedes con aulas
- Gestionar plantillas de estructura de pruebas por curso y especialidad
- Crear tribunales y asignar miembros con roles (incluyendo sustitutos/titulares)
- Planificar dias y franjas horarias con deteccion de conflictos
- Asignar aulas a tribunales con selector visual de planos
- Verificar la solucion completa con auditoria automatica
- Generar 5 tipos de PDF: tribunales, planning diario, planos, carteleria y directorio
- Preparar varias soluciones de asignacion alternativas

## Como usarla

### Opcion 1: Descarga local (recomendada)

1. Ve a [Releases](https://github.com/JLMirallesB/tribunator/releases/latest) y descarga `tribunator.html` de la ultima version
2. Abre el archivo con doble clic en tu navegador
3. Listo. Es un unico archivo con todo incluido y funciona sin conexion. Tus datos se guardan en el navegador (LocalStorage)

Alternativa: si prefieres el codigo fuente, descarga el ZIP de la misma release, descomprime en cualquier carpeta y abre `index.html`.

> **Recomendado**: usar la version descargada en local garantiza que tus datos no se pierdan por una actualizacion. Exporta tus datos regularmente como JSON por seguridad.

### Opcion 2: GitHub Pages

Puedes usar la version online en: `https://JLMirallesB.github.io/tribunator/`

> **Aviso**: esta version se actualiza automaticamente. Tras una actualizacion, los datos guardados en LocalStorage podrian no ser compatibles. Exporta tus datos antes de actualizar.

> **Nota**: En `index.html` y GitHub Pages, la carga de archivos Excel y la generacion de PDF requieren conexion a internet para las librerias SheetJS y jsPDF via CDN. El resto funciona offline. `tribunator.html` ya lleva estas librerias incluidas.

### Generar el HTML unico (desarrollo)

Para crear `dist/tribunator.html` (CSS, scripts, librerias, demo y logo incrustados en un solo archivo):

```
node build/build-single.mjs
```

No necesita dependencias npm. Las librerias se guardan en `build/vendor/` y solo se descargan si faltan.

## Fases de uso

### Inicio (Dashboard)

Pantalla principal al abrir la app. Muestra de un vistazo:

- Tarjetas resumen: aulas, dias, tribunales, errores (clicables para navegar)
- Solucion activa con dias de pruebas y estadisticas
- Aulas mas usadas y miembros con mas carga
- Esquema diario de pruebas y candidatos sin tribunal
- Buscador de candidatos: en que tribunales y variaciones esta cada persona, con rol, dias y actividades
- Errores pendientes con acceso directo a Verificacion
- Panel de exportar/importar (completo, espacios, tiempo, para Listados)
- Pantalla de bienvenida si no hay datos

### 1. Espacio

Define la estructura fisica del centro: sedes, plantas y aulas.

- Crea sedes y plantas con nombres libres (reordenables)
- Dibuja aulas en la rejilla seleccionando celdas contiguas
- Amplia aulas existentes con "Ampliar aula"
- Zoom del plano (50%-300%) y redimensionado de rejilla en cualquier direccion
- Campos personalizados para aulas (texto, numero, si/no, desplegable)
- Agrupaciones de aulas con avisos de cruce entre sedes/plantas
- Vista plano (con bordes y colores de ocupacion) y vista lista (filtrable)
- Selector de dia para ver ocupacion en tiempo real

### 2. Tiempo

Configura los dias de las pruebas.

- Cada dia tiene fecha, hora de inicio y hora de fin configurables
- Las franjas horarias (30 min) se definen al asignar tribunales
- Exportacion/importacion independiente de dias

### 3. Plantillas

Gestiona las estructuras de prueba por curso y nivel.

- 8 plantillas precargadas basadas en la [Orden 8/2026](https://jlmirallesb.github.io/legis_cpmdem/es/ley/orden-8-2026/) de la Comunitat Valenciana
- Activar/desactivar plantillas segun las necesidades del centro
- Reglas por especialidad: subapartados que aplican o se excluyen segun instrumento
- Preview filtrada por especialidad
- Crear, editar, eliminar plantillas. Exportar/importar colecciones JSON
- Resetear a valores por defecto (Orden 8/2026)

### 4. Tribunales

Gestiona soluciones, candidatos, roles y tribunales.

**Soluciones**: multiples soluciones para comparar asignaciones sobre el mismo plano.

**Candidatos**:
- Subir Excel/CSV con 5 columnas: Apellidos, Nombre, Especialidad, Apellidos Titular, Nombre Titular
- Plantilla CSV descargable con las cabeceras correctas
- Gestion sustituto/titular: mutacion con un click, indicadores visuales (azul/amarillo)

**Roles predefinidos**: Presidente/a, Vocal, Secretario/a (computan y requeridos), Suplente (no computa, requerido), Asesor/a, Ayudante (no computan). Editables.

**Tribunales**:
- Generador de nombre por especialidad + curso/nivel
- Plantilla de prueba asociada automaticamente
- Ordenacion manual y alfabetica, duplicar tribunal
- Textos para publicar: uno por solucion y otro por tribunal, que salen en el PDF
- Tab Horario: franjas con aula + actividad, selector visual de aulas y actividades, buscar aulas libres, mover todas las franjas a otro dia. Conflictos en una fila bajo cada franja
- Actividades generales no bloqueantes: Constitucion del Tribunal y Llamamiento de Aspirantes (su coincidencia se marca como informacion, no como error)
- Tab Miembros: filtro por especialidad, deteccion de conflictos
- Tab Variaciones: composiciones alternativas para conflicto de alumnos, incluidas en la deteccion de conflictos

### 5. Verificacion

Auditoria automatica de la solucion activa:

- Errores: tribunales sin miembros/horario, conflictos de aula/miembro, partes de prueba faltantes
- Avisos: roles requeridos faltantes, subapartados incompletos, miembros sin rol
- Validacion en 3 niveles: partes, subapartados, especialidad
- Proteccion al borrar dias, aulas o candidatos con referencias

### Exportacion e importacion

- Exportar todo / espacios / tiempo / plantillas
- Exportar para Listados: JSON reducido con tribunales, miembros y dias
- Importar con opcion de reemplazar o combinar
- Persistencia automatica en LocalStorage

### PDF (5 tipos)

Dialogo unificado con pestanas:

- **Tribunales**: miembros con roles en tabla, variaciones, horarios ordenados, un tribunal por pagina. Modo "solo miembros" disponible. Sustitutos con asterisco y nota al pie sobre titulares
- **Planning diario**: agenda por dia con todos los tribunales, ordenada cronologicamente
- **Planos**: rejilla por planta con aulas coloreadas (libre/ocupada), bordes y leyenda. Varios dias a la vez
- **Carteleria**: un cartel por aula y dia para colgar en la puerta, con tribunal, miembros (tambien los de las variaciones) y horario. Opcion de media pagina
- **Directorio**: todas las personas por orden alfabetico con sus tribunales y variaciones, rol y dias. Nota al pie con los titulares

Opciones comunes: nombre de archivo, cabecera con logo, color principal configurable, seleccion de roles a imprimir.

### Interfaz

- Dashboard con estadisticas al abrir la app
- Undo/Redo con Ctrl+Z / Ctrl+Shift+Z y botones en el header
- Sidebars con cabeceras oscuras y secciones colapsables
- Demo cargable con datos de ejemplo: 10 tribunales con errores intencionados, variaciones, sustitutos con titular, actividades generales, campos personalizados de aula y dos soluciones
- Idiomas: Espanol, Valenciano, Ingles
- Boton "Versiones" para comprobar actualizaciones

---

## Creditos

**Tribunator** esta disenada por [Jose Luis Miralles](https://www.jlmirall.es) con ayuda de Claude.

Si te resulta util, puedes invitarme a una horchata: [ko-fi.com/miralles](https://ko-fi.com/miralles)

Errores y sugerencias: [joseluismirallesbono@gmail.com](mailto:joseluismirallesbono@gmail.com)

## Licencia

Uso libre para centros educativos.
