# 🗺️ SITEMAP — Índice General de Documentación GymApp

Índice centralizado de toda la documentación del proyecto. Punto de entrada para entender el estado actual, las reglas de desarrollo y el plan de trabajo.

> **Última actualización:** 06/09/2026

---

## 📌 1. Estado actual del proyecto

| Capa | Estado | Descripción |
|:---|:---:|:---|
| **Capa 1 — Admin** | 🟡 En refactor | Funcional pero con bugs y deuda de UX. Sprint 1 en curso. |
| **Capa 2 — Entrenador** | ⬜ Pendiente | Arranca después de que Capa 1 pase QA sin bugs críticos. |
| **Capa 3 — Alumno** | ⬜ Pendiente | Después de Capa 2. |

### Stack tecnológico
- **Backend:** Java 21 · Spring Boot 3.5.0 · JPA/Hibernate · MySQL 8 · JWT
- **Frontend:** React 19 · TypeScript 5.9 · Vite · TailwindCSS · TanStack Query · Axios
- **Infra:** Docker (MySQL local) · GitHub (`AgusRios2004/gymapp`)

---

## 🐛 2. Seguimiento de calidad

* 📓 [**`BITACORA_QA.md`**](./BITACORA_QA.md)
  *Registro cronológico de sesiones de QA. Bugs encontrados, estados y decisiones tomadas.*
  > Sesión 01 (05/09/2026): 7 bugs críticos · 7 bugs de experiencia · 13 issues de diseño

* 📋 [**`PRD_REFACTOR.md`**](./PRD_REFACTOR.md)
  *Product Requirements Document. Backlog priorizado con criterios de aceptación por capa.*

---

## 📅 3. Sprint Planning

> Carpeta: [`/sprint_planning/`](../sprint_planning/)  
> **Nomenclatura:** `DD-MM-YYYY-sprint-N-descripcion-corta.md`  
> **Convenciones:** [`sprint_planning/README.md`](../sprint_planning/README.md)

| Sprint | Período | Objetivo | Estado |
|:---:|:---|:---|:---:|
| [Sprint 1](../sprint_planning/06-09-2026-sprint-1-refactor-core-admin.md) | 06/09 → 19/09/2026 | Refactor core admin — bugs críticos + UX + light mode | ⬜ Pendiente |

---

## ⚙️ 4. Reglas de desarrollo por capa

* 🛠️ [**Backend — `gymapp-back/GEMINI.md`**](../gymapp-back/GEMINI.md)
  *Java 21, Spring Boot 3.5.0, JPA/Hibernate, Spring Security JWT, DTOs, GlobalExceptionHandler.*

* 🎨 [**Frontend — `gym-frontend/GEMINI.md`**](../gym-frontend/GEMINI.md)
  *React 19, TypeScript 5.9, Vite, TailwindCSS, React Hook Form + Zod, TanStack Query, Axios.*

* 🎨 [**Design System — `DESIGN_SYSTEM.md`**](./DESIGN_SYSTEM.md)
  *Tokens de color, componentes reutilizables. Modo: 100% light/white (dark mode eliminado).*

---

## 📚 5. Documentación histórica

* 📄 [**`GEMINI.md` (docs)**](./GEMINI.md) — Visión general y stack global
* 📄 [**`GEMINI.md` (raíz)**](../GEMINI.md) — Acceso rápido desde la raíz del proyecto
* 📋 [**`INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md`**](./INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md) — Auditoría inicial de cumplimiento (Jul 2026)
* ⚙️ [**`2026-29-07-be-perfil-objetivo-entrenamiento.md`**](./2026-29-07-be-perfil-objetivo-entrenamiento.md) — Plan BE Fase 1 (completado)
* 🎨 [**`2026-29-07-fe-perfil-objetivo-entrenamiento.md`**](./2026-29-07-fe-perfil-objetivo-entrenamiento.md) — Plan FE Fase 1 (completado)
* 🧪 [**`2026-29-07-be-fe-testing-e2e-suite.md`**](./2026-29-07-be-fe-testing-e2e-suite.md) — Suite E2E (100% PASS)

---

## 📂 6. Estructura de directorios del proyecto

```
gymapp/
├── GEMINI.md                          # Guía rápida del proyecto
├── docker-compose.yml                 # MySQL local (puerto 3380)
├── docs/
│   ├── SITEMAP.md                     # ← Este archivo
│   ├── BITACORA_QA.md                 # Registro de QA sessions
│   ├── PRD_REFACTOR.md                # Backlog priorizado
│   ├── DESIGN_SYSTEM.md               # Sistema de diseño
│   ├── GEMINI.md                      # Visión y stack
│   └── INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md
├── sprint_planning/
│   ├── README.md                      # Nomenclatura y convenciones
│   └── 06-09-2026-sprint-1-refactor-core-admin.md
├── gymapp-back/                       # Backend Java Spring Boot
│   ├── GEMINI.md                      # Reglas de backend
│   └── src/main/java/com/aplicacionGym/gymapp/
│       ├── config/         # SecurityConfig, DataLoader, HeavyDataLoader
│       ├── controller/     # 12 controllers REST
│       ├── dto/            # request/ y response/ DTOs
│       ├── entity/         # 18 entidades JPA + enums/
│       ├── exception/      # GlobalExceptionHandler + excepciones custom
│       ├── mapper/         # Mappers Entity ↔ DTO
│       ├── repository/     # Interfaces Spring Data JPA
│       ├── security/       # JWT + CustomUserDetailsService
│       └── service/        # 14 services con @Transactional
└── gym-frontend/                      # Frontend React TypeScript
    ├── GEMINI.md                      # Reglas de frontend
    └── src/
        ├── components/     # UI components (ui/, auth/, clients/, routines...)
        ├── context/        # AuthContext
        ├── hooks/          # hooks custom
        ├── layouts/        # MainLayout
        ├── pages/          # 14 páginas
        ├── services/       # 17 servicios API (axios)
        └── types/          # TypeScript interfaces
```
