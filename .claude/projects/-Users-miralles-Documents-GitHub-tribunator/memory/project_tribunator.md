---
name: project-tribunator
description: Tribunator - HTML app for managing educational center exam tribunals, room assignments, and scheduling
metadata:
  type: project
---

Tribunator is a zero-install HTML app (runs from file:// in browser) for managing oposiciones/exam tribunal logistics.

**Three phases:** Espacio (campuses/floors/rooms/grid), Tiempo (days/time slots), Tribunales (tribunal composition, room+time assignments).

**Key features:**
- Grid-based floor plan editor for defining rooms (contiguous cells)
- Custom fields for rooms (text, number, boolean, select) - propagate across all rooms
- Room groupings (can cross campuses/floors, with warnings)
- Tribunal member management with Excel upload (name, surnames, specialty)
- Tribunal variations (shared + different members)
- Multiple "Solutions" for tribunal assignments on same floor plan
- Conflict detection (member overlap in time, room overlap)
- Day-specific room assignments with 30-min granularity time slots
- PDF export with customizable header/logo
- i18n: Spanish, Valencian, English
- LocalStorage persistence + JSON import/export (full or partial)
- Versioned with tags starting at 0.0.1

**Why:** Streamline the complex logistics of organizing oposiciones exams across multiple venues, rooms, days, and tribunal compositions.

**How to apply:** All features serve the workflow of a coordinator organizing public exam tribunals. Prioritize usability and clarity over feature depth.
