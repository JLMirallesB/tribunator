<p align="center">
  <img src="logo.svg" alt="Tribunator" width="128" height="128">
</p>

<h1 align="center">Tribunator <sub>v0.3.0</sub></h1>

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
- Generar PDFs para publicar
- Comparar diferentes soluciones de asignacion

## Como usarla

### Opcion 1: Descarga local (recomendada)

1. Ve a [Releases](https://github.com/JLMirallesB/tribunator/releases/latest) y descarga el ZIP de la ultima version
2. Descomprime en cualquier carpeta
3. Abre `index.html` en tu navegador
4. Listo. Tus datos se guardan en el navegador (LocalStorage)

> **Recomendado**: usar la version descargada en local garantiza que tus datos no se pierdan por una actualizacion. Exporta tus datos regularmente como JSON por seguridad.

### Opcion 2: GitHub Pages

Puedes usar la version online en: `https://JLMirallesB.github.io/tribunator/`

> **Aviso**: esta version se actualiza automaticamente. Tras una actualizacion, los datos guardados en LocalStorage podrian no ser compatibles. Exporta tus datos antes de actualizar.

> **Nota**: La carga de archivos Excel y la generacion de PDF requieren conexion a internet para las librerias SheetJS y jsPDF via CDN. El resto funciona offline.

## Fases de uso

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

- Plantillas precargadas para EEM y EPM de Musica (8 plantillas)
- Activar/desactivar plantillas segun las necesidades del centro
- Reglas por especialidad: subapartados que aplican o se excluyen segun instrumento
  - Canto: anade "Idiomas Aplicados al Canto"
  - Canto valenciano: anade "Fundamentos del Cant Valencia"
  - Dulzaina: anade "Tabalet"
  - Piano/Clavecin/Organo/Arpa: excluye "Piano Complementario"
  - EPM 1r Canto/Guitarra electrica/Bajo electrico: sin lectura a primera vista
- Preview filtrada por especialidad
- Crear, editar o eliminar plantillas. Resetear a valores por defecto

### 4. Tribunales

Gestiona soluciones, candidatos, roles y tribunales.

**Soluciones**: multiples soluciones para comparar asignaciones sobre el mismo plano.

**Candidatos**:
- Subir Excel/CSV con 5 columnas: Apellidos, Nombre, Especialidad, Apellidos Titular, Nombre Titular
- Las columnas 4 y 5 son opcionales: solo para sustitutos con titular de plaza
- Plantilla CSV descargable con las cabeceras correctas
- Mutacion sustituto/titular con un click (azul = sustituto, amarillo = mostrando titular)

**Roles predefinidos**: Presidente/a, Vocal, Secretario/a (computan), Suplente (no computa, al menos 1 requerido), Asesor/a, Ayudante (no computan). Editables.

**Tribunales**:
- Generador de nombre por especialidad + curso/nivel
- Al crear un tribunal, la plantilla de prueba se asocia automaticamente
- Filtro por especialidad al anadir miembros
- Tab Horario (primero): franjas con aula + actividad obligatorias
  - Selector visual de aulas: navega por planos o lista, con indicador de conflictos
  - Selector de actividad: muestra la plantilla del tribunal filtrada por especialidad
  - Aviso si se elige actividad fuera de la plantilla
  - Deteccion de conflictos de aula y miembros en tiempo real
- Tab Miembros: con aviso si faltan o sobran
- Tab Variaciones: composiciones alternativas

### 5. Verificacion

Auditoria automatica de la solucion activa. Detecta:

- **Errores**: tribunales sin miembros/horario, franjas sin aula, conflictos de aula/miembro, partes de prueba faltantes
- **Avisos**: miembros de mas/menos, roles requeridos faltantes, subapartados incompletos, subapartados de especialidad faltantes
- Proteccion al borrar dias, aulas o candidatos con referencias en tribunales

### Exportacion e importacion

- Exportar todo / espacios / tiempo / solucion individual
- Importar con opcion de reemplazar o combinar
- Los datos se guardan en LocalStorage automaticamente

### PDF

PDF profesional con tablas reales (jsPDF-AutoTable):
- Franja negra con nombre del tribunal en blanco
- Tablas de miembros con cabeceras coloreadas y filas alternas
- Sustitutos marcados con asterisco y nota al pie sobre titulares
- Color principal configurable (escala de grises por defecto)
- Seleccion de roles a imprimir (por defecto los obligatorios)
- Opcion de mostrar titular entre parentesis para sustitutos
- Dos modos: PDF completo (con horarios) y solo miembros
- Variaciones de tribunal incluidas
- Horario ordenado cronologicamente

### Interfaz

- Sidebars con cabeceras oscuras para distinguir secciones
- Secciones colapsables (Agrupaciones, Campos, Roles, Exportar/Importar)
- Tribunales ordenables manualmente (arriba/abajo) y alfabeticamente
- Demo cargable con datos de ejemplo
- Enlace de contacto para errores y sugerencias

### Idiomas

Espanol, Valenciano, Ingles.

### Comprobar actualizaciones

Pulsa el boton "Versiones" en la esquina superior derecha para ver tu version actual y comprobar si hay una mas reciente.

---

## Creditos

**Tribunator** esta disenada por [Jose Luis Miralles](https://www.jlmirall.es) con ayuda de Claude.

Si te resulta util, puedes invitarme a una horchata: [ko-fi.com/miralles](https://ko-fi.com/miralles)

## Licencia

Uso libre para centros educativos.
