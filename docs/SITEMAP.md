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

---

## 📂 Estructura de `docs/`

```
docs/
├── SITEMAP.md              ← este archivo — índice de todo
├── notes/                  ← notas internas, bitácoras, QA logs
│   └── BITACORA_QA.md
├── prd/                    ← product requirements documents
│   └── PRD_REFACTOR.md
└── sprints/                ← planificación de sprints
    ├── README.md           ← convención de nomenclatura
    └── 06-09-2026-sprint-1-refactor-core-admin.md
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
| [`prd/PRD_REFACTOR.md`](./prd/PRD_REFACTOR.md) | Backlog priorizado del refactor core admin. Reglas de arquitectura, decisiones técnicas y criterios de aceptación por capa. |

---

## 📅 sprints/ — Sprint Planning

> **Nomenclatura:** `DD-MM-YYYY-sprint-N-descripcion-corta.md`  
> Convenciones completas en [`sprints/README.md`](./sprints/README.md)

| Sprint | Período | Objetivo | Estado |
|:---:|:---|:---|:---:|
| [Sprint 1](./sprints/06-09-2026-sprint-1-refactor-core-admin.md) | 06/09 → 19/09/2026 | Refactor core admin — bugs críticos + UX + light mode | ⬜ Pendiente |

---

## ⚙️ Reglas de desarrollo

| Documento | Descripción |
|:---|:---|
| [`../gymapp-back/GEMINI.md`](../gymapp-back/GEMINI.md) | Backend: Java 21, Spring Boot, JPA, JWT, DTOs, GlobalExceptionHandler. |
| [`../gym-frontend/GEMINI.md`](../gym-frontend/GEMINI.md) | Frontend: React 19, TypeScript, TailwindCSS, TanStack Query, Zod. |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Tokens de color, componentes UI. Modo: 100% light/white. |

---

## 📚 Documentación histórica

| Archivo | Descripción |
|:---|:---|
| [`GEMINI.md`](./GEMINI.md) | Visión general y stack global |
| [`../GEMINI.md`](../GEMINI.md) | Acceso rápido desde raíz del proyecto |
| [`INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md`](./INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md) | Auditoría inicial de cumplimiento (Jul 2026) — 35% cumplimiento global |
| [`2026-29-07-be-perfil-objetivo-entrenamiento.md`](./2026-29-07-be-perfil-objetivo-entrenamiento.md) | Plan BE Fase 1 — completado ✅ |
| [`2026-29-07-fe-perfil-objetivo-entrenamiento.md`](./2026-29-07-fe-perfil-objetivo-entrenamiento.md) | Plan FE Fase 1 — completado ✅ |
| [`2026-29-07-be-fe-testing-e2e-suite.md`](./2026-29-07-be-fe-testing-e2e-suite.md) | Suite E2E — 100% PASS ✅ |

---

## 📂 Estructura completa del repositorio

```
gymapp/
├── GEMINI.md
├── docker-compose.yml
├── docs/
│   ├── SITEMAP.md                     ← índice
│   ├── DESIGN_SYSTEM.md
│   ├── GEMINI.md
│   ├── INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md
│   ├── 2026-29-07-*.md                ← docs históricos
│   ├── notes/
│   │   └── BITACORA_QA.md
│   ├── prd/
│   │   └── PRD_REFACTOR.md
│   └── sprints/
│       ├── README.md
│       └── 06-09-2026-sprint-1-refactor-core-admin.md
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
        ├── components/   # ui/, auth/, clients/, routines/, physical/
        ├── context/      # AuthContext
        ├── hooks/
        ├── layouts/      # MainLayout
        ├── pages/        # 14 páginas
        ├── services/     # 17 servicios Axios
        └── types/        # TypeScript interfaces
```
