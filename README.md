<p align="center">
  <img src="logo.svg" alt="Tribunator" width="128" height="128">
</p>

<h1 align="center">Tribunator <sub>v0.1.0</sub></h1>

<p align="center">
  Herramienta para la gestion de tribunales, aulas y horarios en centros educativos.
  <br>
  <em>Zero-install. Abre el HTML y listo.</em>
</p>

<p align="center">
  <a href="https://github.com/JLMirallesB/tribunator/releases/latest">Descargar ultima version</a>
</p>

---

## Que es Tribunator

Tribunator es una aplicacion web que funciona directamente en el navegador, sin necesidad de instalacion, servidores ni bases de datos. Esta pensada para coordinadores de oposiciones y examenes que necesitan:

- Disenar planos de sedes con aulas
- Crear tribunales y asignar miembros con roles
- Planificar dias y franjas horarias
- Asignar aulas a tribunales detectando conflictos
- Generar PDFs para publicar
- Comparar diferentes soluciones de asignacion

## Como usarla

### Opcion 1: GitHub Pages

Abre directamente: `https://JLMirallesB.github.io/tribunator/`

### Opcion 2: Descarga local

1. Descarga el ZIP desde [Releases](https://github.com/JLMirallesB/tribunator/releases/latest) o clona el repositorio
2. Descomprime
3. Abre `index.html` en tu navegador
4. Listo. No necesitas instalar nada

> **Nota:** La carga de archivos Excel y la generacion de PDF requieren conexion a internet (la primera vez) para cargar las librerias SheetJS y jsPDF desde CDN. El resto funciona offline.

## Manual de uso

### Fase 1: Espacio

Aqui defines la estructura fisica del centro.

**Sedes y plantas:**
- Crea una o mas sedes (edificios/campus)
- Dentro de cada sede, crea plantas con nombres libres
- Las plantas se pueden reordenar con las flechas del sidebar
- Puedes duplicar una planta para usarla como base

**Rejilla y aulas:**
- Cada planta tiene una rejilla donde dibujas las aulas
- Haz click en celdas vacias para seleccionarlas (puedes arrastrar)
- Con celdas seleccionadas, pulsa "Crear aula" y dale un nombre
- Las aulas pueden tener formas irregulares (celdas contiguas)
- Para ampliar un aula existente: clicka el aula, luego "Ampliar aula", selecciona celdas y "Aplicar"
- Usa los botones `+` / `-` en los bordes de la rejilla para anadir o quitar filas/columnas
- Zoom: controles `+` / `-` en la barra de herramientas (50% a 300%)

**Campos personalizados:**
- En el sidebar, crea campos como "Capacidad" (numero), "Proyector" (si/no), "Tipo" (desplegable)
- Los campos se aplican a todas las aulas

**Agrupaciones:**
- Agrupa aulas bajo un nombre (ej. "Bloque A")
- Si la agrupacion cruza sedes o plantas, se muestra un aviso

**Vistas:**
- **Plano**: ve las aulas coloreadas en la rejilla con bordes delimitados. Hover para ver detalles
- **Lista**: tabla filtrable por sede, planta, estado (libre/asignada) y busqueda

**Vista de ocupacion:**
- Selecciona un dia en el desplegable del header para ver que aulas estan ocupadas (borde rojo) o libres (borde verde) segun los tribunales asignados

### Fase 2: Tiempo

Define los dias de las pruebas.

- Pulsa "Anadir dia" y selecciona fecha, hora de inicio y hora de fin
- Cada dia tiene su propio rango horario configurable
- Las franjas dentro de cada dia se definen con granularidad de 30 minutos al asignar tribunales
- Puedes exportar/importar los dias de forma independiente

### Fase 3: Tribunales

Aqui gestionas todo lo relacionado con los tribunales.

**Soluciones:**
- Crea multiples soluciones para comparar diferentes asignaciones sobre el mismo plano
- Solo una solucion esta "activa" (marcada con `●`)
- Cada solucion tiene sus propios tribunales independientes

**Candidatos:**
- Anade candidatos manualmente (nombre, apellidos, especialidad)
- O sube un Excel/CSV con 3 columnas: Nombre, Apellidos, Especialidad
- Los candidatos son compartidos entre soluciones

**Roles:**
- Roles predefinidos: Presidente/a, Vocal, Secretario/a (computan), Suplente (no computa, requerido), Asesor/a, Ayudante (no computan)
- Los roles que computan cuentan para el numero de miembros del tribunal
- El Suplente tiene el flag "al menos uno requerido": si un tribunal no tiene suplente, se muestra aviso
- Puedes crear, editar o eliminar roles
- Los nuevos roles escritos al asignar miembros se guardan automaticamente

**Tribunales:**
- Al crear un tribunal, selecciona especialidad y curso/nivel para generar el nombre automaticamente
- Anade miembros seleccionando candidatos y asignando roles
- Al anadir un miembro, se comprueba si ya esta en otro tribunal en los mismos dias

**Horarios (tab Horario del tribunal):**
- Asigna el tribunal a un dia configurado
- Anade franjas horarias con los 3 campos obligatorios: hora, aula, actividad
- Al elegir aula, se abre un selector visual donde puedes navegar por los planos o usar la lista
- Las aulas ocupadas se muestran semi-transparentes con aviso de conflicto
- Se detectan auto-solapamientos (misma aula en franjas que se cruzan)

**Variaciones (tab Variaciones):**
- Crea composiciones alternativas del tribunal (misma estructura, diferentes miembros)
- Util para gestionar suplencias o turnos

### Fase 4: Verificacion

Auditoria automatica de toda la solucion activa. Detecta:

- **Errores** (rojo): tribunales sin miembros, sin horario, franjas sin aula, conflictos de aula o miembro
- **Avisos** (naranja): miembros de mas/menos, roles requeridos que faltan, miembros sin rol, franjas sin actividad
- Agrupados por categoria: Tiempo, Tribunales, Miembros, Horarios, Conflictos

### Exportacion e importacion

- **Exportar todo**: un JSON con todos los datos
- **Exportar espacios**: solo sedes, plantas, aulas, agrupaciones
- **Exportar tiempo**: solo los dias configurados
- **Exportar solucion**: la solucion con sus tribunales + dias + candidatos + roles
- **Importar**: si ya hay datos, elige entre reemplazar o combinar

Al borrar un dia, aula o candidato que tenga referencias en tribunales, se muestra aviso con los tribunales afectados.

### Generacion de PDF

Desde el sidebar de Tribunales, pulsa "Generar PDF":
- Escribe titulo, subtitulo y texto adicional
- Sube un logo (imagen)
- Selecciona que tribunales incluir
- El PDF incluye miembros con roles, horarios por dia, aulas y actividades

### Idiomas

Selector en la esquina superior derecha: Espanol, Valenciano, Ingles.

### Persistencia

Los datos se guardan automaticamente en el LocalStorage del navegador. Para compartir datos entre equipos, usa la exportacion/importacion de JSON.

---

## Creditos

**Tribunator** esta disenada por [Jose Luis Miralles](https://www.jlmirall.es) con ayuda de Claude.

Si te resulta util, puedes invitarme a una horchata: [ko-fi.com/miralles](https://ko-fi.com/miralles)

## Licencia

Uso libre para centros educativos.
