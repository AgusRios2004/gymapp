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
- **sprint-N**: número secuencial, nunca se reutiliza
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
| [`docs/BITACORA_QA.md`](../docs/BITACORA_QA.md) | Registro de sesiones de QA y bugs encontrados |
| [`docs/PRD_REFACTOR.md`](../docs/PRD_REFACTOR.md) | Product Requirements Document — backlog priorizado |
| [`docs/SITEMAP.md`](../docs/SITEMAP.md) | Índice general de toda la documentación |
| [`docs/GEMINI.md`](../docs/GEMINI.md) | Stack tecnológico y visión del proyecto |
