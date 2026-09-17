# Sprint 2 — Diseño light mode + UX restante
> **Período:** 05/10/2026 → 18/10/2026 (2 semanas)  
> **Ramas:** una rama corta por bloque de trabajo → merge a `main`.  
> **Origen:** Tareas de diseño y UX que salieron del [Sprint 1](./06-09-2026-sprint-1-refactor-core-admin.md) al partirlo el 13/09/2026 ([ADR-0006](../adr/0006-partir-sprint-1-diseno-a-sprint-2.md)).  
> **Estado:** 🔵 En curso — T-19, T-22 y T-23 adelantadas el 15/09/2026 (sobró capacidad del Sprint 1)

---

## 🎯 Objetivo del sprint

Terminar la **Capa 1 (Admin)**: diseño 100% light/white en toda la app, layout a pantalla completa, componentes UX reutilizables que faltan y QA Sesión 03 sin bugs críticos ni de experiencia. Recién después de este sprint se habilita la Capa 2.

Capacidad: ~12,5 hs/semana efectivas ([ADR-0004](../adr/0004-capacidad-de-planificacion.md)).

---

## 📅 Fechas

| Hito | Fecha | Día |
|:---|:---:|:---|
| Kick-off | 05/10/2026 | lunes |
| Checkpoint — light mode global (T-21, T-22) cerrado | 11/10/2026 | domingo |
| Feature freeze | 16/10/2026 | viernes |
| QA Sesión 03 | 17/10/2026 | sábado |
| Merge a main / cierre de Capa 1 | 18/10/2026 | domingo |

> Las tareas tienen el mismo ID que en el Sprint 1 a propósito: se citan desde commits y bitácora.

---

## 📋 Tareas

### 🧩 UX — componentes reutilizables

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-17 | Reemplazar selects de profesores, rutinas y clases con `SearchableSelect` | varios | 1,5 hs | T-15 (Sprint 1) | ✅ |
| T-18 | Crear `ConfirmModal.tsx` — modal genérico de confirmación con variantes | `components/ui/ConfirmModal.tsx` | 2 hs | — | ✅ |
| T-19 | Crear hook `useEscapeKey(onClose)` y aplicarlo a todos los modales | `hooks/useEscapeKey.ts` + modales | 1,5 hs | — | ✅ |
| T-20 | Agregar `SearchableSelect` y `ConfirmModal` al `DesignSystemShowcasePage` | `DesignSystemShowcasePage.tsx` | 1 h | T-18 | ✅ |

### 🎨 Diseño global — light mode + layout

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-21 | Grep masivo + fix de fondos oscuros y amber → `bg-white text-slate-900 border-slate-200` | 15 `.tsx` con fondos oscuros + 15 con amber | 4 hs | — | ✅ |
| T-22 | Layout 100% pantalla — `MainLayout.tsx` sin max-width restrictivo | `MainLayout.tsx` | 1 h | — | ✅ |
| T-23 | Toast centrado — `ToastContainer position="top-center"` | `main.tsx` | 15 min | — | ✅ |
| T-24 | Botón "Nuevo Alumno" — layout inline con `flex items-center gap-2` | `ClientsPage.tsx` | 15 min | — | ⬜ |
| T-26 | Card "GRASA CORPORAL" — rose para grasa, emerald para músculo, fondo blanco | `ClientDetailPage.tsx` | 30 min | — | ⬜ |
| T-27 | Ejercicios agrupados por grupo muscular con header de sección | `ExercisesPage.tsx` | 1,5 hs | — | ⬜ |
| T-28 | Clases — cards con color por día, info resumida | `ClassesPage.tsx` | 2 hs | T-14 (Sprint 1) | ⬜ |
| T-29 | Rutinas — cards con formato consistente | `RoutinesPage.tsx` | 1 h | — | ⬜ |
| T-30 | Fix "Marcar sesión hecha" — overflow de texto en botón | `RoutinesPage.tsx` o `ClientDetailPage.tsx` | 30 min | — | ⬜ |

> **T-21:** `layouts/MainLayout.tsx` ya se arregló de paso al adelantar T-22 (15/09/2026) — quedaba `bg-slate-950`/botón hamburguesa `zinc`+`amber` en el shell general, se pasó a light/emerald. Empezar T-21 por `ui/Modal.tsx` y el resto del grep. Detalle del grep original en el Sprint 1 (historial de git) y en [`BITACORA_QA.md`](../notes/BITACORA_QA.md).
>
> **T-21 cerrada (16/09/2026):** los overlays de modales con fondo oscuro semi-transparente (`Modal.tsx`, `*RoutineModal.tsx`, `ClientModal.tsx`, `MainLayout.tsx` mobile) **no se tocaron** — son scrims intencionales, no "dark mode". `TrainingSchemeWidget.tsx` y la sección de historial de `ClientDetailPage.tsx` se rediseñaron por completo (mockup aprobado en Artifact) con una paleta categórica por tipo de entrenamiento en vez de por día — ver [ADR-0008](../adr/0008-paleta-categorica-tipo-entrenamiento.md). Resto de archivos: swap mecánico de clases, con algunos amber reclasificados (`ClientNutritionTab.tsx` calorías → rose, iconos decorativos en `AttendancePage.tsx`/`RoutinesPage.tsx`/`MonthlyTypesPage.tsx` → emerald/violet/slate) porque no eran warnings reales. `pages/DesignSystemShowcasePage.tsx` tenía toda la narrativa vieja "Industrial Dark / Amber primary" — reescrita para reflejar los tokens actuales.

Lo del diseño va **sin spec**: es cosmético y se valida en la QA. T-18 y T-19 pueden llevar spec si se quieren delegar.

---

## 📊 Resumen de estimación

| Bloque | Estimación |
|:---|:---:|
| UX componentes | ~6 hs |
| Diseño global | ~11 hs |
| QA Sesión 03 | ~2 hs |
| Buffer | ~6 hs |
| **TOTAL** | **~25 hs (2 semanas)** |

> Si sobra capacidad en el Sprint 1, se adelantan tareas de acá (primero T-23, T-22, T-19). Si el Sprint 2 se atrasa, los recortes son T-27, T-29 y T-30.

---

## ✅ Criterios de aceptación del sprint

- [ ] Todos los inputs con fondo blanco y texto legible
- [ ] Ningún fondo oscuro ni amber como marca en la app (grep limpio)
- [ ] Layout ocupa 100% de pantalla
- [ ] ESC cierra todos los modales
- [ ] Toast visible centrado
- [ ] Todos los selects con más de 10 items tienen buscador
- [ ] `verify.sh` en verde en `main`
- [ ] QA Sesión 03 (17/10) pasa sin bugs críticos ni de experiencia

---

## 🔄 Retrospectiva (completar al cerrar — 18/10/2026)

```
¿Qué salió bien?

¿Qué salió mal?

¿Qué se quedó fuera del sprint y por qué?

Velocidad real vs estimada:
```
