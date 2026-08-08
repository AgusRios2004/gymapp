# 🗺️ SITEMAP - Índice General de Documentación GymApp

Bienvenido al mapa del sitio de documentación del proyecto **GymApp**. Este documento actúa como el índice centralizado para acceder a las especificaciones, reglas de arquitectura, estados de avance y planes de desarrollo del sistema.

---

## 📌 1. Documentos Centrales de Visión y Arquitectura

* 📄 [**`GEMINI.md` (Raíz de Documentación)**](file:///home/agustin_dev/WorkSpace/gymapp/docs/GEMINI.md)  
  *Stack tecnológico global, visión general de la aplicación, estado actual de avance y hoja de ruta general.*

* 📄 [**`GEMINI.md` (Raíz del Proyecto)**](file:///home/agustin_dev/WorkSpace/gymapp/GEMINI.md)  
  *Acceso rápido al stack y estado del proyecto desde la raíz de `gymapp`.*

* 📋 [**`INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md)  
  *Auditoría detallada de lo que cumple y no cumple el sistema actualmente respecto a la Hoja de Ruta de entrenamiento, nutrición, suplementación y perfil.*

---

## ⚙️ 2. Guías y Reglas de Desarrollo por Capa

* 🛠️ [**`GEMINI` Backend (Reglas y Stack Backend)**](file:///home/agustin_dev/WorkSpace/gymapp/gymapp-back/GEMINI.md)  
  *Reglas de codificación Java 21, Spring Boot 3.5.0, JPA/Hibernate, Spring Security JWT, DTOs y manejo global de excepciones.*

* 🎨 [**`GEMINI` Frontend (Reglas y Stack Frontend)**](file:///home/agustin_dev/WorkSpace/gymapp/gym-frontend/GEMINI.md)  
  *Reglas de desarrollo en React 19, TypeScript 5.9, Vite, TailwindCSS, React Hook Form + Zod, TanStack Query y Axios.*

* 🎨 [**`DESIGN_SYSTEM.md` (Sistema de Diseño Industrial Dark)**](file:///home/agustin_dev/WorkSpace/gymapp/docs/DESIGN_SYSTEM.md)  
  *Especificación visual, tokens de color (Amber 500, Orange 600, Rose 500, Emerald 500), componentes reutilizables y restricciones del guardián del tema.*

---

## 📅 3. Planes de Trabajo y Ejecución (Nomenclatura: `YYYY-DD-MM-be/fe-nombre-plan.md`)

### 📜 Documentos de Ejecución y Planes de Trabajo (Año 2026)

* ⚙️ **Backend:** [**`2026-29-07-be-perfil-objetivo-entrenamiento.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/2026-29-07-be-perfil-objetivo-entrenamiento.md)  
  *Plan de trabajo Backend para extender la entidad `Client` y `PhysicalRecord` (altura, metas de grasa/musculo), tipado de ejercicios (Pesas vs. Cardio LISS) y endpoints de métricas.*

* 🎨 **Frontend & Testing:** 
  - [**`2026-29-07-fe-perfil-objetivo-entrenamiento.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/2026-29-07-fe-perfil-objetivo-entrenamiento.md) - Plan de implementación Frontend para Perfil/Objetivo & Cardio LISS.
  - [**`2026-29-07-be-fe-testing-e2e-suite.md`**](file:///home/agustin_dev/WorkSpace/gymapp/docs/2026-29-07-be-fe-testing-e2e-suite.md) - Plan y reporte de Pruebas Integrales E2E Back-to-Front (**100% PASS RATE**).

  *Plan de trabajo Frontend para implementar el Dashboard de Recomposición Corporal, widgets de comparación peso/grasa vs meta, bloque de Cardio LISS en la rutina y vista de días de descanso.*

---

## 📂 4. Estructura de Directorios del Proyecto

```
gymapp/
├── GEMINI.md                               # Guía principal del proyecto
├── docs/
│   ├── SITEMAP.md                          # Este índice general
│   ├── GEMINI.md                           # Visión general y stack global
│   ├── INFORME_CUMPLIMIENTO_HOJA_DE_RUTA.md# Auditoría de cumplimiento inicial
│   ├── 2026-29-07-be-perfil-objetivo-entrenamiento.md # Plan de desarrollo Backend Fase 1
│   └── 2026-29-07-fe-perfil-objetivo-entrenamiento.md # Plan de desarrollo Frontend Fase 1
├── gymapp-back/                            # Backend Java Spring Boot
│   └── GEMINI.md                           # Reglas y patrones de Backend
└── gym-frontend/                           # Frontend React TypeScript
    └── GEMINI.md                           # Reglas y patrones de Frontend
```
