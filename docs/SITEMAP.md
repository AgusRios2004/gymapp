# 🗺️ SITEMAP — Índice General de Documentación GymApp

> Punto de entrada único para toda la documentación del proyecto.
> **Última actualización:** 13/09/2026 (Sprint 1 partido, Sprint 2 creado — ADR-0006)

---

## 📌 Estado actual del proyecto

| Capa | Estado | Descripción |
|:---|:---:|:---|
| **Capa 1 — Admin** | 🟡 En refactor | Funcional con bugs y deuda UX. Sprint 1 en curso (07/09 → 04/10), Sprint 2 (05/10 → 18/10) cierra la capa. |
| **Capa 2 — Entrenador** | ⬜ Pendiente | Arranca cuando Capa 1 pase QA sin bugs críticos. Incluirá LLM. |
| **Capa 3 — Alumno** | ⬜ Pendiente | Después de Capa 2. |

**Stack:** Java 21 · Spring Boot 3.5.0 · JPA/Hibernate · MySQL 8 · JWT · React 19 · TypeScript 5.9 · Vite · TailwindCSS · TanStack Query

**Tema visual vigente:** 100% light/white, marca emerald ("Vitality Green") — ver [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).

**Para dónde va cada tipo de información:**

| Pregunta | Documento |
|:---|:---|
| ¿Qué viene en los próximos meses? | [`ROADMAP.md`](./ROADMAP.md) |
| ¿Por qué se decidió X? | [`adr/`](./adr/) |
| ¿Qué hay que construir en esta capa? | [`prd/`](./prd/) |
| ¿Qué toca en las próximas semanas? | [`sprints/`](./sprints/) |
| ¿Qué se probó y qué bugs salieron? | [`notes/`](./notes/) |
| ¿Cómo se ve la UI? | [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) |

---

## 📂 Estructura de `docs/`

```
docs/
├── SITEMAP.md              ← este archivo — índice de todo
├── ROADMAP.md               ← vista de meses/capas, para planificar próximas semanas
├── DESIGN_SYSTEM.md         ← tokens de diseño vigentes (light mode, marca emerald)
├── adr/                     ← decisiones de arquitectura, una por archivo, no se editan
│   ├── README.md            ← formato y convención de numeración
│   ├── 0001-color-de-marca-emerald.md
│   ├── 0002-tema-visual-light-mode.md
│   ├── 0003-clases-multidia-elementcollection.md
│   ├── 0004-capacidad-de-planificacion.md
│   ├── 0005-harness-commons-y-sandcastle-spec-driven.md
│   └── 0006-partir-sprint-1-diseno-a-sprint-2.md
├── notes/                  ← notas internas, bitácoras, QA logs
│   └── BITACORA_QA.md
├── prd/                    ← product requirements documents (uno por capa)
│   └── PRD_REFACTOR.md
├── sprints/                ← planificación de sprints
│   ├── README.md           ← convención de nomenclatura
│   ├── 06-09-2026-sprint-1-refactor-core-admin.md
│   └── 05-10-2026-sprint-2-diseno-light-mode.md
└── archive/                ← docs históricos, ya no reflejan el estado actual
    ├── GEMINI.md
    ├── INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md
    ├── 2026-29-07-be-perfil-objetivo-entrenamiento.md
    ├── 2026-29-07-fe-perfil-objetivo-entrenamiento.md
    └── 2026-29-07-be-fe-testing-e2e-suite.md
```

---

## 📓 notes/ — Notas internas

> Todo lo que no es un diseño de solución ni un PRD: registros de QA, decisiones del día, observaciones.

| Archivo | Descripción |
|:---|:---|
| [`notes/BITACORA_QA.md`](./notes/BITACORA_QA.md) | Sesiones de QA manual. Bugs encontrados, estados y decisiones tomadas. Sesión 01 (05/09/2026): 7 bugs críticos · 7 bugs de experiencia · 13 issues de diseño. |

---

## 📋 prd/ — Product Requirements

> Definición de qué se construye, por qué, y los criterios de aceptación.

| Archivo | Descripción |
|:---|:---|
| [`prd/PRD_REFACTOR.md`](./prd/PRD_REFACTOR.md) | Backlog priorizado del refactor core admin. Reglas de arquitectura, decisiones técnicas y criterios de aceptación por capa. Fuente de verdad de las reglas globales (light mode, errores descriptivos, etc). |

---

## 📅 sprints/ — Sprint Planning

> **Nomenclatura:** `DD-MM-YYYY-sprint-N-descripcion-corta.md`
> Convenciones completas en [`sprints/README.md`](./sprints/README.md)

| Sprint | Período | Objetivo | Estado |
|:---:|:---|:---|:---:|
| [Sprint 1](./sprints/06-09-2026-sprint-1-refactor-core-admin.md) | 07/09 → 04/10/2026 | Refactor core admin — Fase 0 (pipeline de agentes) + bugs críticos + UX base | 🔵 En curso |
| [Sprint 2](./sprints/05-10-2026-sprint-2-diseno-light-mode.md) | 05/10 → 18/10/2026 | Diseño light mode + UX restante — cierra Capa 1 | ⬜ Pendiente |

> El nombre del archivo conserva la fecha `06-09-2026` (día en que se escribió el sprint). El período real arranca el 07/09 — ver la tabla de fechas dentro del documento.
>
> **Capacidad del proyecto:** ~2 hs/día entre semana, ~4 hs los findes. Toda fecha de sprint se calcula sobre ~12,5 hs/semana efectivas — detalle en [`ROADMAP.md`](./ROADMAP.md), el porqué en [ADR-0004](./adr/0004-capacidad-de-planificacion.md).

---

## ⚙️ Reglas de desarrollo (vigentes)

| Documento | Descripción |
|:---|:---|
| [`../CLAUDE.md`](../CLAUDE.md) | Entry point para agentes de Claude — stack, capa actual, reglas activas. |
| [`../GEMINI.md`](../GEMINI.md) | Mismo contenido que `CLAUDE.md`, para Gemini CLI / Antigravity. |
| [`../gymapp-back/GEMINI.md`](../gymapp-back/GEMINI.md) | Backend: Java 21, Spring Boot, JPA, JWT, DTOs, GlobalExceptionHandler. |
| [`../gym-frontend/GEMINI.md`](../gym-frontend/GEMINI.md) | Frontend: React 19, TypeScript, TailwindCSS, TanStack Query, Zod. |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Tokens de color, componentes UI. Modo: 100% light/white. |
| [`../AGENTS.md`](../AGENTS.md) | Contexto del harness: cómo correr la compuerta, límites duros, dónde buscar. Lo leen los agentes de Sandcastle. |
| [`../harness.config.yml`](../harness.config.yml) | Comandos de install/lint/typecheck/test que usan hooks, CI y Sandcastle. |
| [`../specs/README.md`](../specs/README.md) | Convención de specs, estados y AC-IDs. |
| [`../.agents/skills/gym-theme-guardian/SKILL.md`](../.agents/skills/gym-theme-guardian/SKILL.md) | Skill que carga un agente de IDE/Antigravity automáticamente al maquetar UI — debe decir lo mismo que `DESIGN_SYSTEM.md`. |

---

## 📚 archive/ — Documentación histórica

> Ya no refleja el estado actual del proyecto. Se conserva como referencia de decisiones pasadas, no como fuente de verdad. **No seguir estas reglas si contradicen los documentos vigentes de arriba.**
>
> **Estos 5 archivos viven únicamente en `archive/`.** Hasta el 06/09/2026 existía una copia idéntica de cada uno en `docs/` raíz (el commit `894de10` los copió en vez de moverlos), y `docs/GEMINI.md` — que describe el tema "Industrial Dark" con amber — parecía vigente. Si volvés a ver alguno fuera de `archive/`, es un duplicado: borralo.

| Archivo | Por qué quedó obsoleto |
|:---|:---|
| [`archive/GEMINI.md`](./archive/GEMINI.md) | Visión general y stack de julio 2026. Describía tema "Industrial Dark" (reemplazado por light mode el 05/09) y un roadmap de nutrición/hidratación que no es el sprint actual. |
| [`archive/INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md`](./archive/INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md) | Auditoría de cumplimiento de julio 2026 (35% global) sobre una hoja de ruta de nutrición/hidratación que no es la prioridad actual (ahora es el refactor de Capa 1 Admin). |
| [`archive/2026-29-07-be-perfil-objetivo-entrenamiento.md`](./archive/2026-29-07-be-perfil-objetivo-entrenamiento.md) | Plan BE Fase 1 — completado ✅, ya ejecutado. |
| [`archive/2026-29-07-fe-perfil-objetivo-entrenamiento.md`](./archive/2026-29-07-fe-perfil-objetivo-entrenamiento.md) | Plan FE Fase 1 — completado ✅, ya ejecutado. |
| [`archive/2026-29-07-be-fe-testing-e2e-suite.md`](./archive/2026-29-07-be-fe-testing-e2e-suite.md) | Suite E2E de julio — 100% PASS ✅, snapshot de un momento anterior del código. |

---

## 📂 Estructura completa del repositorio

```
gymapp/
├── CLAUDE.md                          ← entry point para agentes Claude
├── GEMINI.md                          ← entry point para Gemini/Antigravity (mismo contenido)
├── docker-compose.yml
├── docs/
│   ├── SITEMAP.md                     ← índice
│   ├── ROADMAP.md                     ← vista de meses/capas
│   ├── DESIGN_SYSTEM.md
│   ├── adr/
│   │   ├── README.md
│   │   ├── 0001-color-de-marca-emerald.md
│   │   ├── 0002-tema-visual-light-mode.md
│   │   ├── 0003-clases-multidia-elementcollection.md
│   │   ├── 0004-capacidad-de-planificacion.md
│   │   ├── 0005-harness-commons-y-sandcastle-spec-driven.md
│   │   └── 0006-partir-sprint-1-diseno-a-sprint-2.md
│   ├── notes/
│   │   └── BITACORA_QA.md
│   ├── prd/
│   │   └── PRD_REFACTOR.md
│   ├── sprints/
│   │   ├── README.md
│   │   ├── 06-09-2026-sprint-1-refactor-core-admin.md
│   │   └── 05-10-2026-sprint-2-diseno-light-mode.md
│   └── archive/                       ← docs históricos, no vigentes
│       ├── GEMINI.md
│       ├── INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md
│       ├── 2026-29-07-be-perfil-objetivo-entrenamiento.md
│       ├── 2026-29-07-fe-perfil-objetivo-entrenamiento.md
│       └── 2026-29-07-be-fe-testing-e2e-suite.md
├── AGENTS.md                          ← contexto para agentes del harness (comandos, límites, router)
├── harness.config.yml                 ← único archivo propio del harness de commons (ADR-0005)
├── specs/                             ← specs con AC-IDs que consume Sandcastle
├── .harness/scripts/                  ← compuerta vendoreada desde commons (verify.sh)
├── .sandcastle/                       ← rol spec-driven de commons + Dockerfile Java/Node
├── .claude/                           ← hooks del harness; skills linkeadas a commons
├── .agents/
│   └── skills/gym-theme-guardian/SKILL.md   ← reglas de tema para agentes de IDE
├── gymapp-back/                       ← Spring Boot (Java 21)
│   ├── GEMINI.md
│   └── src/main/java/com/aplicacionGym/gymapp/
│       ├── config/       # SecurityConfig, DataLoader, HeavyDataLoader
│       ├── controller/   # 12 controllers REST
│       ├── dto/          # request/ y response/ DTOs
│       ├── entity/       # 18 entidades JPA + enums/
│       ├── exception/    # GlobalExceptionHandler + excepciones custom
│       ├── mapper/       # Mappers Entity ↔ DTO
│       ├── repository/   # Interfaces Spring Data JPA
│       ├── security/     # JWT + CustomUserDetailsService
│       └── service/      # 14 services con @Transactional
└── gym-frontend/                      ← React 19 + TypeScript
    ├── GEMINI.md
    └── src/
        ├── components/   # ui/ (Button, Card, Input, EmptyState, Skeleton...), auth/, clients/, routines/, physical/
        ├── context/      # AuthContext
        ├── hooks/
        ├── layouts/      # MainLayout
        ├── pages/        # 14 páginas
        ├── services/     # 17 servicios Axios
        └── types/        # TypeScript interfaces
```
