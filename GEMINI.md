# GEMINI.md — GymApp (raíz del proyecto)

Este archivo es el punto de entrada para Gemini CLI / Antigravity. Para el índice completo de documentación, ver siempre primero:

👉 [`docs/SITEMAP.md`](docs/SITEMAP.md)

Este archivo convive con `CLAUDE.md` (usado por Claude Code / Cowork) y debe decir lo mismo que él. Si editás uno, editá el otro.

---

## Stack

- **Backend** (`gymapp-back`): Java 21, Spring Boot 3.5.0, Spring Data JPA/Hibernate, MySQL 8, Spring Security + JWT, OpenPDF, Lombok, Maven.
- **Frontend** (`gym-frontend`): React 19, TypeScript 5.9, Vite 7, TailwindCSS 3, React Router 7, React Hook Form + Zod, TanStack Query 5, Axios, Recharts, React Toastify.

Reglas de arquitectura y código detalladas:
- Backend: [`gymapp-back/GEMINI.md`](gymapp-back/GEMINI.md)
- Frontend: [`gym-frontend/GEMINI.md`](gym-frontend/GEMINI.md)

---

## ⚠️ Regla vigente #1: la app es 100% light mode

Decisión tomada el 05/09/2026 (QA Sesión 01) y confirmada en el PRD de refactor. **No hay dark mode.** Fondo blanco, texto `slate-900`, bordes `slate-200`. Color de marca ("Vitality Green"): **`emerald-600`** — no amber (amber quedó solo como color de warning). Acento secundario `orange-600`, semánticos en `rose-500` (grasa/calorías) y `emerald-600` (progreso/éxito).

Fuente de verdad del diseño: [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).

**Cuidado:** documentos y un skill local quedaron desactualizados con la decisión anterior (dark mode "Industrial"). Ya fueron corregidos en esta pasada (06/09/2026), pero si en el futuro alguno vuelve a mencionar `bg-slate-950`, `bg-zinc-900`, `bg-gray-900` o "prohibido bg-white" como regla activa, es un documento viejo — ignoralo y avisá para corregirlo. Ver detalle en `docs/SITEMAP.md` → sección "Documentación histórica".

---

## En qué capa estamos

Vista completa de meses/capas en [`docs/ROADMAP.md`](docs/ROADMAP.md). Resumen — 3 capas (ver [`docs/prd/PRD_REFACTOR.md`](docs/prd/PRD_REFACTOR.md)):

1. **Capa 1 — Admin** (ACTUAL): gestión operativa completa. En refactor — Sprint 1 en curso (07/09 → 04/10/2026). No se avanza a Capa 2 hasta pasar QA sin bugs críticos.
2. **Capa 2 — Entrenador**: rutinas inteligentes + LLM. Pendiente.
3. **Capa 3 — Alumno**: consumo de su plan. Pendiente.

Sprint activo: [`docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md`](docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md)

Reglas globales de arquitectura del refactor (repetidas de `PRD_REFACTOR.md`, no dupliques lógica — leé el original si hay dudas):
- Errores: el backend siempre devuelve `message` descriptivo; el frontend lo muestra literal en un toast.
- Selects con +10 opciones → usar el componente `SearchableSelect` reutilizable.
- El profesor logueado se auto-asigna en pagos/asistencias; sólo ADMIN puede sobreescribirlo.
- DNI obligatorio en cliente, validado en FE y BE.

---

## Antes de escribir código

1. Leé `docs/SITEMAP.md` para saber si ya existe un doc sobre lo que vas a tocar.
2. Si es un bug o tarea del sprint activo, buscá su ID en `docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md` — puede tener dependencias con otras tareas (ver mapa de dependencias del sprint).
3. Si tocás UI, respetá `docs/DESIGN_SYSTEM.md` (light mode, marca emerald) — usá `EmptyState`/`Skeleton` para loading/empty/error, no dejes una vista en blanco.
4. Backend: seguí `gymapp-back/GEMINI.md` (capas, DTOs, `WebApiResponse`, `GlobalExceptionHandler`).
5. Frontend: seguí `gym-frontend/GEMINI.md` (estructura de carpetas, TypeScript estricto, RHF+Zod, servicios centralizados en `src/services/`).
6. Si dudás por qué algo se decidió así (color, estructura de datos, convención), revisá `docs/adr/` antes de asumir que es un error.

## Al terminar

- Actualizá el estado de la tarea (⬜/🔵/✅/🔴) en el doc de sprint correspondiente.
- Si agregaste un doc nuevo, sumalo a `docs/SITEMAP.md` (es el índice único — no dejar docs huérfanos).
- Si tomaste una decisión de arquitectura que alguien podría volver a preguntar en unos meses, escribila como ADR en `docs/adr/` (ver `docs/adr/README.md` para el formato) — no alcanza con dejarla mencionada en el sprint.
