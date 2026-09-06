# 🚀 GEMINI.md - GymApp (Raíz del Proyecto)

Este archivo proporciona la visión general del repositorio **GymApp**. Existe también un [`CLAUDE.md`](./CLAUDE.md) con el mismo contenido, para agentes de Claude Code / Cowork — mantené ambos sincronizados.

Para acceder al mapa completo de documentación e indexación de archivos, consulta:
👉 [**`docs/SITEMAP.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/SITEMAP.md)

---

## 💻 Stack Tecnológico Rápido

* **Backend (`gymapp-back`):** Java 21, Spring Boot 3.5.0, Spring Data JPA, Spring Security JWT, MySQL.
* **Frontend (`gym-frontend`):** React 19, TypeScript 5.9, Vite 7, TailwindCSS 3, React Hook Form + Zod, TanStack Query, Recharts.

---

## ⚠️ Regla vigente: la app es 100% light mode

Decisión del 05/09/2026 (QA Sesión 01), confirmada en el PRD de refactor. Sin dark mode. Color de marca ("Vitality Green"): `emerald-600`, no amber. Ver [`docs/DESIGN_SYSTEM.md`](file:///home/agustin_dev/WorkSpace/gymapp/docs/DESIGN_SYSTEM.md).

---

## 📌 Estado actual

Capa 1 (Admin) en refactor — Sprint 1 en curso (06/09 → 19/09/2026). Ver [`docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md`](file:///home/agustin_dev/WorkSpace/gymapp/docs/sprints/06-09-2026-sprint-1-refactor-core-admin.md) y la vista de meses en [`docs/ROADMAP.md`](file:///home/agustin_dev/WorkSpace/gymapp/docs/ROADMAP.md).

Decisiones de arquitectura relevantes (por qué está hecho así): [`docs/adr/`](file:///home/agustin_dev/WorkSpace/gymapp/docs/adr).

---

## 📚 Documentación Relevante

- ⚙️ [Reglas y Patrones Backend (`gymapp-back/GEMINI.md`)](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/GEMINI.md)
- 🎨 [Reglas y Patrones Frontend (`gym-frontend/GEMINI.md`)](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/GEMINI.md)
- 📋 [PRD del Refactor (`docs/prd/PRD_REFACTOR.md`)](file:///home/agustin_dev/WorkSpace/gymapp/docs/prd/PRD_REFACTOR.md)
- 📓 [Bitácora QA (`docs/notes/BITACORA_QA.md`)](file:///home/agustin_dev/WorkSpace/gymapp/docs/notes/BITACORA_QA.md)

Documentación histórica (julio 2026, ya no vigente): ver [`docs/archive/`](file:///home/agustin_dev/WorkSpace/gymapp/docs/archive).
