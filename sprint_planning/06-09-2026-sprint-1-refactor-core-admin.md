# Sprint 1 — Refactor Core Admin
> **Período:** 06/09/2026 → 19/09/2026 (2 semanas)  
> **Rama:** `feat/offline-pwa` → merge a `main` al cierre  
> **Origen:** Bugs y mejoras detectadas en QA Manual Sesión 01 (05/09/2026)  
> **Estado:** ⬜ Pendiente

---

## 🎯 Objetivo del sprint

Dejar la **Capa Admin completamente operativa y sin bugs críticos**, con mensajes de error descriptivos, UX usable con 159+ clientes, diseño 100% light/white y los módulos de pagos, asistencias y productos funcionando end-to-end.

Este sprint cierra la **Capa 1 (Admin)** del sistema. No se avanza a Capa 2 (Entrenador) hasta que este sprint pase el QA Sesión 02 sin bugs críticos.

---

## 📅 Fechas

| Hito | Fecha |
|:---|:---:|
| Kick-off | 06/09/2026 |
| Mid-sprint review | 12/09/2026 |
| Feature freeze | 18/09/2026 |
| QA Sesión 02 | 19/09/2026 |
| Merge a main | 19/09/2026 |

---

## 📋 Tareas — Semana 1 (06/09 → 12/09) — Bugs críticos Backend

> Las tareas BE deben completarse **antes** que las FE que dependen de ellas.

### 🔴 Bugs críticos — Backend (Spring Boot)

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-01 | `@NotBlank` en DNI + mensaje descriptivo en `ClientRequestDTO` | `ClientRequestDTO.java` | 30 min | — | ⬜ |
| T-02 | `GlobalExceptionHandler`: mapear todos los errores 4xx con mensajes en español | `GlobalExceptionHandler.java` | 2 hs | — | ⬜ |
| T-03 | Fix venta de producto — `Professor not found` — resolver profesor desde JWT | `PaymentService.java`, `PaymentController.java` | 3 hs | T-02 | ⬜ |
| T-04 | Dashboard: agregar `totalProfessors` y `lowStockCount` al DTO y service | `DashboardService.java`, `DashboardStatsDTO.java` | 1.5 hs | — | ⬜ |
| T-05 | Asistencias: error descriptivo si cliente no tiene cuota activa (detectar y lanzar excepción semántica) | `AssistanceService.java` | 1 hs | T-02 | ⬜ |
| T-06 | Pagos: error descriptivo si cliente ya tiene suscripción activa | `PaymentService.java` | 1 hs | T-02 | ⬜ |
| T-07 | Clases: migrar `dayOfWeek: String` → `daysOfWeek: List<String>` (relacional o JSON) | `GroupClass.java`, `GroupClassService.java`, `GroupClassController.java` | 3 hs | — | ⬜ |
| T-08 | PATCH `/api/clients/{id}/toggle-status` — activar/desactivar cliente | `ClientController.java`, `ClientService.java` | 1 hs | — | ⬜ |

**Estimación Semana 1 Backend: ~13 horas**

---

### 🔴 Bugs críticos — Frontend (React TSX)

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-09 | Validación DNI obligatorio en formulario de cliente (deshabilitar submit) | `ClientsPage.tsx` o modal de cliente | 30 min | T-01 | ⬜ |
| T-10 | Mostrar mensaje de error del backend en toast (no genérico) — leer `error.response.data.message` | `clientService.ts`, `paymentService.ts`, `assistanceService.ts` | 1.5 hs | T-02 | ⬜ |
| T-11 | Fix bug venta de producto — cliente seleccionado no se muestra | `PaymentsPage.tsx` o `ProductsPage.tsx` | 2 hs | T-03 | ⬜ |
| T-12 | Profesor auto-asignado desde sesión en pagos y asistencias (solo ADMIN puede cambiar) | `PaymentsPage.tsx`, `AttendancePage.tsx`, `AuthContext.tsx` | 2 hs | T-03 | ⬜ |
| T-13 | Dashboard: renderizar KPIs `totalProfessors` y `lowStockCount` | `DashboardPage.tsx` | 1 hs | T-04 | ⬜ |
| T-14 | Clases: UI para seleccionar múltiples días | `ClassesPage.tsx` | 2 hs | T-07 | ⬜ |

**Estimación Semana 1 Frontend: ~9 horas**

---

## 📋 Tareas — Semana 2 (13/09 → 19/09) — UX + Diseño

### 🟠 UX — Componentes reutilizables

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-15 | Crear `SearchableSelect.tsx` — combobox con buscador, genérico y tipado | `components/ui/SearchableSelect.tsx` | 3 hs | — | ⬜ |
| T-16 | Reemplazar select de cliente en pagos con `SearchableSelect` (búsqueda por DNI + nombre) | `PaymentsPage.tsx` | 1 hs | T-15 | ⬜ |
| T-17 | Reemplazar selects de profesores, rutinas y clases con `SearchableSelect` | varios | 1.5 hs | T-15 | ⬜ |
| T-18 | Crear `ConfirmModal.tsx` — modal genérico de confirmación/cancelación con variantes | `components/ui/ConfirmModal.tsx` | 2 hs | — | ⬜ |
| T-19 | Crear hook `useEscapeKey(onClose)` y aplicarlo a todos los modales | `hooks/useEscapeKey.ts` + modales | 1.5 hs | — | ⬜ |
| T-20 | Agregar `SearchableSelect` y `ConfirmModal` al `DesignSystemShowcasePage` | `DesignSystemShowcasePage.tsx` | 1 hs | T-15, T-18 | ⬜ |

**Estimación UX componentes: ~10 horas**

---

### 🎨 Diseño global — Light mode + Layout

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-21 | Grep masivo + fix de inputs oscuros — todos a `bg-white text-slate-900 border-slate-200` | Todos los `.tsx` con inputs | 2 hs | — | ⬜ |
| T-22 | Layout 100% pantalla — `MainLayout.tsx` sin max-width restrictivo, `flex-1` en contenido | `MainLayout.tsx` | 1 hs | — | ⬜ |
| T-23 | Toast centrado — `ToastContainer position="top-center"` | `main.tsx` | 15 min | — | ⬜ |
| T-24 | Botón "Nuevo Alumno" — layout inline con `flex items-center gap-2` | `ClientsPage.tsx` | 15 min | — | ⬜ |
| T-25 | Toggle activo/inactivo inline en fila de tabla de clientes | `ClientsPage.tsx` | 1 hs | T-08 | ⬜ |
| T-26 | Card "GRASA CORPORAL" — colores legibles (rose para grasa, emerald para músculo, blanco fondo) | `ClientDetailPage.tsx` | 30 min | — | ⬜ |
| T-27 | Ejercicios agrupados por grupo muscular con header de sección | `ExercisesPage.tsx` | 1.5 hs | — | ⬜ |
| T-28 | Clases — rediseño a cards con color por día, info resumida (nombre, profesor, días, cupos) | `ClassesPage.tsx` | 2 hs | T-14 | ⬜ |
| T-29 | Rutinas — cards con formato consistente (nombre, objetivo, N días, badge activa) | `RoutinesPage.tsx` | 1 hs | — | ⬜ |
| T-30 | Fix "Marcar sesión hecha" — texto overflow en botón (truncate o font-size menor) | `RoutinesPage.tsx` o `ClientDetailPage.tsx` | 30 min | — | ⬜ |

**Estimación diseño: ~10 horas**

---

## ⛓️ Mapa de dependencias críticas

```
T-01 ──► T-09
T-02 ──► T-03 ──► T-11
     └──► T-05
     └──► T-06 ──► T-12
T-03 ──► T-12
T-04 ──► T-13
T-07 ──► T-14 ──► T-28
T-08 ──► T-25
T-15 ──► T-16
     └──► T-17
     └──► T-20
T-18 ──► T-20
```

**Orden recomendado de ejecución:**
1. T-02 (desbloquea T-03, T-05, T-06, T-10)
2. T-01, T-04, T-07, T-08 (independientes, en paralelo si hay 2 devs)
3. T-03, T-05, T-06, T-09, T-13, T-14 (después de sus dependencias)
4. T-10, T-11, T-12, T-25 (frontend que depende de BE)
5. T-15 → T-16, T-17, T-20 (bloque SearchableSelect)
6. T-18, T-19, T-21..T-30 (diseño — independientes entre sí)

---

## 📊 Resumen de estimación

| Bloque | Tareas | Estimación |
|:---|:---:|:---:|
| Backend bugs críticos | T-01 a T-08 | ~13 hs |
| Frontend bugs críticos | T-09 a T-14 | ~9 hs |
| UX componentes reutilizables | T-15 a T-20 | ~10 hs |
| Diseño global light mode | T-21 a T-30 | ~10 hs |
| Buffer (imprevistos, QA interno) | — | ~8 hs |
| **TOTAL** | **30 tareas** | **~50 hs** |

> A razón de 5 hs/día efectivas de desarrollo → **10 días hábiles = 2 semanas**. ✅

---

## ✅ Criterios de aceptación del sprint

- [ ] Ningún error del back se muestra en crudo al usuario
- [ ] DNI obligatorio y validado en FE + BE
- [ ] Venta de productos funciona end-to-end sin errores
- [ ] Todos los selects con más de 10 items tienen buscador
- [ ] Profesor logueado se auto-asigna en pagos y asistencias
- [ ] Todos los inputs con fondo blanco y texto legible
- [ ] Layout ocupa 100% de pantalla
- [ ] ESC cierra todos los modales
- [ ] Toast visible centrado
- [ ] Dashboard muestra 7 KPIs incluyendo profesores y stock bajo
- [ ] Clases permiten múltiples días
- [ ] Toggle activo/inactivo funciona en tabla de clientes
- [ ] QA Sesión 02 (19/09) pasa sin bugs críticos ni de experiencia

---

## 📝 Decisiones técnicas del sprint

1. **`SearchableSelect`**: componente genérico tipado con `<T>`, no acoplado a ninguna entidad.
2. **Errores del backend**: leer siempre `error.response?.data?.message`. Si no existe, mostrar "Error inesperado, intentá de nuevo."
3. **Clases multi-día**: implementar como `@ElementCollection List<String>` en JPA (más simple que tabla relacional para este caso).
4. **Toggle activo**: usar `PATCH` en vez de `PUT` para no mandar todo el objeto cliente.
5. **No wizard esta semana**: el wizard de rutinas queda para Sprint 2. Esta semana solo el fix visual de las cards.

---

## 🔄 Retrospectiva (completar al cerrar — 19/09/2026)

```
¿Qué salió bien?

¿Qué salió mal?

¿Qué se quedó fuera del sprint y por qué?

Velocidad real vs estimada:
```
