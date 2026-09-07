# Sprint 1 — Refactor Core Admin
> **Período:** 07/09/2026 → 04/10/2026 (4 semanas)  
> **Rama:** `feat/offline-pwa` → merge a `main` al cierre  
> **Origen:** Bugs y mejoras detectadas en QA Manual Sesión 01 (05/09/2026)  
> **Estado:** 🔵 En curso

---

## 🎯 Objetivo del sprint

Dejar la **Capa Admin completamente operativa y sin bugs críticos**, con mensajes de error descriptivos, UX usable con 159+ clientes, diseño 100% light/white y los módulos de pagos, asistencias y productos funcionando end-to-end.

Este sprint cierra la **Capa 1 (Admin)** del sistema. No se avanza a Capa 2 (Entrenador) hasta que este sprint pase el QA Sesión 02 sin bugs críticos.

---

## ⏱️ Capacidad real — leer antes de estimar nada

Este es un **proyecto de pasatiempo, no full-time**. La capacidad declarada por el dev (06/09/2026) es:

| Día | Horas |
|:---|:---:|
| Lunes a viernes | ~2 hs (techo) |
| Sábado y domingo | ~4 hs (techo) |

Eso da un **techo teórico de 18 hs/semana**, pero el techo no es el plan: se planifica sobre **~12,5 hs/semana efectivas** para dejar margen a días que se saltean. Con ~50 hs de trabajo estimado → **4 semanas**.

> ⚠️ La versión anterior de este documento asumía 5 hs/día y cerraba el sprint en 2 semanas. Era una estimación irreal para este proyecto. Si en el futuro alguien vuelve a planificar acá, **usar esta tabla, no días hábiles completos.**

---

## 📅 Fechas

Los hitos caen siempre en día que efectivamente se trabaja (los checkpoints van en domingo, que es el día de más horas).

| Hito | Fecha | Día |
|:---|:---:|:---|
| Kick-off | 07/09/2026 | lunes |
| Checkpoint 1 — bugs críticos BE cerrados | 13/09/2026 | domingo |
| Checkpoint 2 — bugs críticos FE cerrados (app sin bugs críticos) | 20/09/2026 | domingo |
| Checkpoint 3 — componentes UX listos | 27/09/2026 | domingo |
| Feature freeze | 02/10/2026 | viernes |
| QA Sesión 02 | 03/10/2026 | sábado |
| Merge a main | 04/10/2026 | domingo |

---

## 📋 Tareas — Semana 1 (07/09 → 13/09) — Bugs críticos Backend

> Las tareas BE deben completarse **antes** que las FE que dependen de ellas.

### 🔴 Bugs críticos — Backend (Spring Boot)

> **Auditoría del 06/09/2026:** antes de arrancar se contrastó el backlog contra el código real. Tres tareas ya estaban hechas o a medias — ver columna Estado. No reimplementar lo que ya funciona.

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-01 | Traducir al español los mensajes de validación de `ClientRequestDTO` | `ClientRequestDTO.java` | 15 min | — | 🔵 |
| T-02 | `GlobalExceptionHandler`: mapear todos los errores 4xx con mensajes en español | `GlobalExceptionHandler.java` | 4 hs | — | ⬜ |
| T-03 | Fix venta de producto — `Professor not found` — resolver profesor desde JWT | `PaymentService.java`, `PaymentController.java` | 3 hs | T-02 | ⬜ |
| T-04 | ~~Dashboard: `totalProfessors` y `lowStockCount` en DTO y service~~ | `DashboardService.java`, `DashboardStatsDTO.java` | — | — | ✅ |
| T-05 | Asistencias: error descriptivo si cliente no tiene cuota activa (detectar y lanzar excepción semántica) | `AssistanceService.java` | 1 hs | T-02 | ⬜ |
| T-06 | Pagos: error descriptivo si cliente ya tiene suscripción activa | `PaymentService.java` | 1 hs | T-02 | ⬜ |
| T-08 | PATCH `/api/clients/{id}/toggle-status` — activar/desactivar cliente | `ClientController.java`, `ClientService.java` | 1 hs | — | ⬜ |

**Estimación Semana 1: ~10 horas**

#### Notas de la auditoría

- **T-01 — casi hecho.** `ClientRequestDTO.java:29` ya tiene `@NotBlank(message = "DNI cannot be blank")` + `@Size(min=8, max=8)`. Sólo falta traducir los mensajes al español (la regla global dice que el back devuelve el `message` y el front lo muestra literal — un usuario no puede ver "DNI cannot be blank"). Ojo: el mensaje de `phone` dice "between 7 and 15" pero el `@Size` es `min = 10` — corregir de paso.
- **T-02 — subestimada.** Estaba en 2 hs; hoy `GlobalExceptionHandler` tiene sólo 2 `@ExceptionHandler` (`IllegalArgumentException`, `ResourceNotFoundException`). Cubrir "todos los 4xx" implica sumar al menos `MethodArgumentNotValidException` (validaciones de DTO), `HttpMessageNotReadableException`, `AccessDeniedException` y `DataIntegrityViolationException`. Re-estimada en 4 hs.
- **T-04 — ya está hecha.** `DashboardStatsDTO` ya declara `totalProfessors` y `lowStockCount`, y `DashboardService.java:37` ya los setea. Lo que falta es puramente de frontend → ver T-13.

---

### 🔴 Bugs críticos — Frontend (React TSX)

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-07 | Clases: migrar `dayOfWeek: String` → `daysOfWeek: List<String>` (BE) | `GroupClass.java`, `GroupClassService.java`, `GroupClassController.java`, `GroupClassRepository.java` | 3 hs | — | ⬜ |
| T-09 | Validación DNI obligatorio en formulario de cliente (deshabilitar submit) | `ClientsPage.tsx` o modal de cliente | 30 min | T-01 | ⬜ |
| T-10 | Mostrar mensaje de error del backend en toast (no genérico) — leer `error.response.data.message` | `clientService.ts`, `paymentService.ts`, `assistanceService.ts` | 1.5 hs | T-02 | ⬜ |
| T-11 | Fix bug venta de producto — cliente seleccionado no se muestra | `PaymentsPage.tsx` o `ProductsPage.tsx` | 2 hs | T-03 | ⬜ |
| T-12 | Profesor auto-asignado desde sesión en pagos y asistencias (solo ADMIN puede cambiar) | `PaymentsPage.tsx`, `AttendancePage.tsx`, `AuthContext.tsx` | 2 hs | T-03 | ⬜ |
| T-13 | Dashboard: subir `totalProfessors` y `lowStockCount` a `MetricCard` (llegar a 7 KPIs) | `DashboardPage.tsx` | 30 min | — | 🔵 |
| T-14 | Clases: UI para seleccionar múltiples días | `ClassesPage.tsx` | 2 hs | T-07 | ⬜ |

**Estimación Semana 2: ~11,5 horas**

#### Notas de la auditoría

- **T-07 se movió a Semana 2.** Es backend, pero no bloquea nada de Semana 1 y T-14 (su dependiente) vive acá — juntarlas evita cambiar de contexto dos veces.
- **T-13 — parcialmente hecha.** `DashboardPage.tsx` ya renderiza 5 `MetricCard` (Total Alumnos, Alumnos Activos, Rutinas, Ingresos del Mes, Deudores). `totalProfessors` se muestra suelto en la línea 160 y `lowStockCount` sólo como banner de alerta condicional (línea 117). El criterio de aceptación pide **7 KPIs**: falta subir esos dos a `MetricCard`. Ya no depende de T-04 (que está hecha) → se puede hacer en cualquier momento.

---

## 📋 Tareas — Semanas 3 y 4 (21/09 → 04/10) — UX + Diseño

### 🟠 Semana 3 (21/09 → 27/09) — UX, componentes reutilizables

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-15 | Crear `SearchableSelect.tsx` — combobox con buscador, genérico y tipado | `components/ui/SearchableSelect.tsx` | 3 hs | — | ⬜ |
| T-16 | Reemplazar select de cliente en pagos con `SearchableSelect` (búsqueda por DNI + nombre) | `PaymentsPage.tsx` | 1 hs | T-15 | ⬜ |
| T-17 | Reemplazar selects de profesores, rutinas y clases con `SearchableSelect` | varios | 1.5 hs | T-15 | ⬜ |
| T-18 | Crear `ConfirmModal.tsx` — modal genérico de confirmación/cancelación con variantes | `components/ui/ConfirmModal.tsx` | 2 hs | — | ⬜ |
| T-19 | Crear hook `useEscapeKey(onClose)` y aplicarlo a todos los modales | `hooks/useEscapeKey.ts` + modales | 1.5 hs | — | ⬜ |
| T-20 | Agregar `SearchableSelect` y `ConfirmModal` al `DesignSystemShowcasePage` | `DesignSystemShowcasePage.tsx` | 1 hs | T-15, T-18 | ⬜ |
| T-25 | Toggle activo/inactivo inline en fila de tabla de clientes | `ClientsPage.tsx` | 1 hs | T-08 | ⬜ |

**Estimación Semana 3: ~11 horas**

> `src/hooks/` todavía no existe en el repo — T-19 la crea. `DesignSystemShowcasePage.tsx` sí existe, T-20 sólo agrega secciones.

---

### 🎨 Semana 4 (28/09 → 04/10) — Diseño global, light mode + layout

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-21 | Grep masivo + fix de fondos oscuros y amber — todos a `bg-white text-slate-900 border-slate-200` | 15 `.tsx` con fondos oscuros + 15 con amber | 4 hs | — | ⬜ |
| T-22 | Layout 100% pantalla — `MainLayout.tsx` sin max-width restrictivo, `flex-1` en contenido | `MainLayout.tsx` | 1 hs | — | ⬜ |
| T-23 | Toast centrado — `ToastContainer position="top-center"` | `main.tsx` | 15 min | — | ⬜ |
| T-24 | Botón "Nuevo Alumno" — layout inline con `flex items-center gap-2` | `ClientsPage.tsx` | 15 min | — | ⬜ |
| T-26 | Card "GRASA CORPORAL" — colores legibles (rose para grasa, emerald para músculo, blanco fondo) | `ClientDetailPage.tsx` | 30 min | — | ⬜ |
| T-27 | Ejercicios agrupados por grupo muscular con header de sección | `ExercisesPage.tsx` | 1.5 hs | — | ⬜ |
| T-28 | Clases — rediseño a cards con color por día, info resumida (nombre, profesor, días, cupos) | `ClassesPage.tsx` | 2 hs | T-14 | ⬜ |
| T-29 | Rutinas — cards con formato consistente (nombre, objetivo, N días, badge activa) | `RoutinesPage.tsx` | 1 hs | — | ⬜ |
| T-30 | Fix "Marcar sesión hecha" — texto overflow en botón (truncate o font-size menor) | `RoutinesPage.tsx` o `ClientDetailPage.tsx` | 30 min | — | ⬜ |

**Estimación Semana 4: ~11 horas**

> **T-21 re-estimada de 2 hs a 4 hs.** El grep del 06/09 encontró **15 archivos** con fondos oscuros (`bg-slate|zinc|gray-700..950`) y **15 archivos** con `amber-*` (marca vieja). Entre los oscuros hay componentes base que arrastran el estilo a toda la app: `ui/Modal.tsx`, `layouts/MainLayout.tsx`, los 4 modales de `routines/`, `clients/ClientModal.tsx`. Empezar por `Modal.tsx` y `MainLayout.tsx` — arreglan varias pantallas de una.

---

## ⛓️ Mapa de dependencias críticas

```
T-01 ──► T-09
T-02 ──► T-03 ──► T-11
     └──► T-05          T-03 ──► T-12
     └──► T-06
     └──► T-10
T-07 ──► T-14 ──► T-28
T-08 ──► T-25
T-15 ──► T-16
     └──► T-17
     └──► T-20
T-18 ──► T-20
```

> T-04 ya está hecha, así que **T-13 quedó sin dependencias** — se puede hacer en cualquier hueco de 30 min.

**Orden recomendado de ejecución:**
1. **T-02 primero, siempre.** Desbloquea T-03, T-05, T-06 y T-10 — cuatro tareas, la mitad de los bugs críticos.
2. T-01, T-08, T-13 (independientes y cortos — buenos para un día de 2 hs)
3. T-03, T-05, T-06 (después de T-02)
4. T-07 → T-14 (bloque clases multi-día, BE+FE junto)
5. T-09, T-10, T-11, T-12 (frontend que depende de BE)
6. T-15 → T-16, T-17, T-20 · T-18, T-19, T-25 (bloque componentes)
7. T-21..T-24, T-26..T-30 (diseño — independientes entre sí, cualquier orden)

---

## 📊 Resumen de estimación

| Semana | Bloque | Tareas | Estimación |
|:---:|:---|:---:|:---:|
| 1 | Backend bugs críticos | T-01, T-02, T-03, T-05, T-06, T-08 | ~10 hs |
| 2 | Clases multi-día + Frontend bugs críticos | T-07, T-09 a T-14 | ~11,5 hs |
| 3 | UX componentes reutilizables | T-15 a T-20, T-25 | ~11 hs |
| 4 | Diseño global light mode | T-21 a T-24, T-26 a T-30 | ~11 hs |
| — | Buffer (imprevistos, QA interno) | — | ~6 hs |
| | **TOTAL** | **29 tareas** (T-04 ya hecha) | **~49,5 hs** |

> A razón de **~12,5 hs/semana efectivas** (ver "Capacidad real" arriba) → **4 semanas**. ✅
>
> Cada semana queda por debajo del techo teórico de 18 hs, así que hay margen si una semana se cae. Si dos semanas seguidas se caen, **recortar alcance antes que estirar la fecha**: los candidatos a sacar son T-27, T-29 y T-30 (cosméticos, no bloquean el QA).

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
- [ ] Mensajes de validación del backend en español (no "DNI cannot be blank")
- [ ] QA Sesión 02 (03/10) pasa sin bugs críticos ni de experiencia

---

## 📝 Decisiones técnicas del sprint

1. **`SearchableSelect`**: componente genérico tipado con `<T>`, no acoplado a ninguna entidad.
2. **Errores del backend**: leer siempre `error.response?.data?.message`. Si no existe, mostrar "Error inesperado, intentá de nuevo."
3. **Clases multi-día**: implementar como `@ElementCollection List<String>` en JPA (más simple que tabla relacional para este caso).
4. **Toggle activo**: usar `PATCH` en vez de `PUT` para no mandar todo el objeto cliente.
5. **No wizard en este sprint**: el wizard de rutinas (DES-05 del PRD) queda para el próximo sprint. Acá va sólo el fix visual de las cards (T-29).
6. **Sprint de 4 semanas, no de 2** (decidido 06/09/2026): la duración original asumía 5 hs/día. La capacidad real del proyecto es ~2 hs/día entre semana y ~4 hs los findes. Se mantuvo **un solo sprint** en vez de partirlo en dos, para no romper la decisión ya documentada en `ROADMAP.md` de agrupar las tres fases del PRD en un sprint calendario. Los checkpoints semanales cumplen la función de corte.

---

## 🔄 Retrospectiva (completar al cerrar — 04/10/2026)

```
¿Qué salió bien?

¿Qué salió mal?

¿Qué se quedó fuera del sprint y por qué?

Velocidad real vs estimada:
```
