# 📁 Sprint Planning — Convenciones y Guía

Este directorio contiene la planificación y seguimiento de todos los sprints del proyecto **GymApp**.

---

## 📝 Nomenclatura de archivos

```
DD-MM-YYYY-sprint-N-descripcion-corta.md
```

### Ejemplos
```
06-09-2026-sprint-1-refactor-core-admin.md
20-09-2026-sprint-2-wizard-rutinas-clases.md
04-10-2026-sprint-3-capa-entrenador-llm.md
```

### Reglas
- **DD-MM-YYYY**: fecha de **inicio** del sprint (no de creación del doc)
- **sprint-N**: número secuencial de sprint calendario, nunca se reutiliza. No confundir con los "SPRINT 0/1/2" internos que pueda usar un PRD para nombrar fases de su backlog — son numeraciones distintas (ver [`../ROADMAP.md`](../ROADMAP.md)).
- **descripcion-corta**: kebab-case, máximo 4 palabras, describe el objetivo principal
- Siempre en **minúsculas**

---

## 🗂️ Estructura de cada sprint doc

Cada archivo de sprint debe tener:

```
# Sprint N — Título
## Objetivo del sprint
## Fechas (inicio / fin)
## Estado de tareas (tabla con ID, descripción, estimación, dependencias, responsable, estado)
## Criterios de aceptación
## Decisiones tomadas
## Retrospectiva (se completa al cerrar el sprint)
```

Si una "decisión tomada" durante el sprint es del tipo que alguien podría volver a preguntar dentro de unos meses (elegir una librería, una estructura de datos, una convención de equipo), no alcanza con dejarla en la sección de decisiones del sprint — hay que escribir un ADR en [`../adr/`](../adr/) para que no se pierda cuando el doc de sprint quede archivado.

---

## ⚙️ Estados de tarea

| Símbolo | Estado |
|:---:|:---|
| ⬜ | Pendiente |
| 🔵 | En progreso |
| ✅ | Completada |
| ❌ | Cancelada |
| 🔴 | Bloqueada |

---

## 🔗 Relación con otros docs

| Documento | Propósito |
|:---|:---|
| [`../ROADMAP.md`](../ROADMAP.md) | Vista de meses/capas — dónde encaja este sprint en el plan general |
| [`../adr/`](../adr/) | Decisiones de arquitectura que salieron de este sprint y deben perdurar |
| [`../notes/BITACORA_QA.md`](../notes/BITACORA_QA.md) | Registro de sesiones de QA y bugs encontrados |
| [`../prd/PRD_REFACTOR.md`](../prd/PRD_REFACTOR.md) | Product Requirements Document — backlog priorizado |
| [`../SITEMAP.md`](../SITEMAP.md) | Índice general de toda la documentación |
| [`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md) | Tokens y componentes vigentes |
