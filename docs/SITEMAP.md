# 🗺️ SITEMAP — Índice General de Documentación GymApp

> Punto de entrada único para toda la documentación del proyecto.
> **Última actualización:** 06/09/2026

---

## 📌 Estado actual del proyecto

| Capa | Estado | Descripción |
|:---|:---:|:---|
| **Capa 1 — Admin** | 🟡 En refactor | Funcional con bugs y deuda UX. Sprint 1 en curso (06/09 → 19/09). |
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
| ¿Qué toca en las próximas 2 semanas? | [`sprints/`](./sprints/) |
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
│   └── 0003-clases-multidia-elementcollection.md
├── notes/                  ← notas internas, bitácoras, QA logs
│   └── BITACORA_QA.md
├── prd/                    ← product requirements documents (uno por capa)
│   └── PRD_REFACTOR.md
├── sprints/                ← planificación de sprints
│   ├── README.md           ← convención de nomenclatura
│   └── 06-09-2026-sprint-1-refactor-core-admin.md
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
| [Sprint 1](./sprints/06-09-2026-sprint-1-refactor-core-admin.md) | 06/09 → 19/09/2026 | Refactor core admin — bugs críticos + UX + light mode | ⬜ Pendiente |

---

## ⚙️ Reglas de desarrollo (vigentes)

| Documento | Descripción |
|:---|:---|
| [`../CLAUDE.md`](../CLAUDE.md) | Entry point para agentes de Claude — stack, capa actual, reglas activas. |
| [`../GEMINI.md`](../GEMINI.md) | Mismo contenido que `CLAUDE.md`, para Gemini CLI / Antigravity. |
| [`../gymapp-back/GEMINI.md`](../gymapp-back/GEMINI.md) | Backend: Java 21, Spring Boot, JPA, JWT, DTOs, GlobalExceptionHandler. |
| [`../gym-frontend/GEMINI.md`](../gym-frontend/GEMINI.md) | Frontend: React 19, TypeScript, TailwindCSS, TanStack Query, Zod. |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Tokens de color, componentes UI. Modo: 100% light/white. |
| [`../.agents/skills/gym-theme-guardian/SKILL.md`](../.agents/skills/gym-theme-guardian/SKILL.md) | Skill que carga un agente de IDE/Antigravity automáticamente al maquetar UI — debe decir lo mismo que `DESIGN_SYSTEM.md`. |

---

## 📚 archive/ — Documentación histórica

> Ya no refleja el estado actual del proyecto. Se conserva como referencia de decisiones pasadas, no como fuente de verdad. **No seguir estas reglas si contradicen los documentos vigentes de arriba.**

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
│   │   └── 0003-clases-multidia-elementcollection.md
│   ├── notes/
│   │   └── BITACORA_QA.md
│   ├── prd/
│   │   └── PRD_REFACTOR.md
│   ├── sprints/
│   │   ├── README.md
│   │   └── 06-09-2026-sprint-1-refactor-core-admin.md
│   └── archive/                       ← docs históricos, no vigentes
│       ├── GEMINI.md
│       ├── INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md
│       ├── 2026-29-07-be-perfil-objetivo-entrenamiento.md
│       ├── 2026-29-07-fe-perfil-objetivo-entrenamiento.md
│       └── 2026-29-07-be-fe-testing-e2e-suite.md
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
