# Sprint 1 — Refactor Core Admin
> **Período:** 07/09/2026 → 04/10/2026 (4 semanas)  
> **Ramas:** una rama corta por bloque de trabajo → merge a `main`. Sandcastle trabaja en `sandcastle/spec-NNNN`.  
> **Origen:** Bugs y mejoras detectadas en QA Manual Sesión 01 (05/09/2026)  
> **Estado:** 🔵 En curso — **recalendarizado el 13/09/2026** (ver [ADR-0006](../adr/0006-partir-sprint-1-diseno-a-sprint-2.md))

---

## 🎯 Objetivo del sprint

Dejar la **Capa Admin sin bugs críticos**, con mensajes de error descriptivos, los módulos de pagos, asistencias y clases funcionando end-to-end, y los componentes UX base (`SearchableSelect`). Además, dejar **habilitado el pipeline de agentes** (harness + Sandcastle `spec-driven`, [ADR-0005](../adr/0005-harness-commons-y-sandcastle-spec-driven.md)) y probado con una spec real.

El **diseño global light mode** (antes Semana 4) pasó al [Sprint 2](./05-10-2026-sprint-2-diseno-light-mode.md). La Capa 1 cierra al final del Sprint 2, no de este.

---

## ⏱️ Capacidad real — leer antes de estimar nada

Este es un **proyecto de pasatiempo, no full-time**. La capacidad declarada por el dev (06/09/2026) es:

| Día | Horas |
|:---|:---:|
| Lunes a viernes | ~2 hs (techo) |
| Sábado y domingo | ~4 hs (techo) |

Techo teórico de 18 hs/semana; se planifica sobre **~12,5 hs/semana efectivas**. Detalle y porqué en [ADR-0004](../adr/0004-capacidad-de-planificacion.md).

**Sandcastle no suma capacidad en este plan.** Las horas de las tareas que corra un agente se siguen contando como si fueran manuales hasta que haya velocidad real medida. Si el agente las resuelve, lo que sobra se usa para adelantar tareas del Sprint 2.

---

## 🔁 Recalendarización del 13/09/2026

La Semana 1 (07/09 → 13/09) no cerró ninguna tarea del backlog: se invirtió en sanear docs e instalar el harness de commons (fuera del plan original). Con 3 semanas restantes (~37,5 hs) contra ~49,5 hs de trabajo, el plan no cerraba.

Se eligió **partir el sprint** en vez de estirar la fecha ([ADR-0006](../adr/0006-partir-sprint-1-diseno-a-sprint-2.md)):

- Sale del Sprint 1 → Sprint 2: todo el diseño (T-21..T-24, T-26..T-30) y los componentes UX que no son bugs (T-17, T-18, T-19, T-20).
- Entra al Sprint 1: la **Fase 0** (T-31..T-35), que habilita el pipeline de agentes.
- Checkpoint 1 (13/09) **no se cumplió**. Los checkpoints se reescribieron abajo.

---

## 📅 Fechas

| Hito | Fecha | Día |
|:---|:---:|:---|
| Kick-off | 07/09/2026 | lunes |
| ~~Checkpoint 1 — bugs críticos BE cerrados~~ | ~~13/09/2026~~ | ❌ no cumplido, reemplazado |
| Checkpoint 1 — pipeline habilitado + spec 0001 corrida | 20/09/2026 | domingo |
| Checkpoint 2 — bugs críticos BE cerrados + clases multi-día | 27/09/2026 | domingo |
| Feature freeze | 02/10/2026 | viernes |
| QA Sesión 02 | 03/10/2026 | sábado |
| Merge a main / cierre | 04/10/2026 | domingo |

---

## 📋 Semana 1 (07/09 → 13/09) — Docs + harness (fuera de plan)

Sin tareas del backlog cerradas. Lo que se hizo: saneamiento de docs y recalendarización (06/09), ESLint del front en cero errores, instalación del harness y reemplazo de Sandcastle (12/09). Ver [`BITACORA_QA.md`](../notes/BITACORA_QA.md) y [ADR-0005](../adr/0005-harness-commons-y-sandcastle-spec-driven.md).

---

## 📋 Semana 2 (14/09 → 20/09) — Fase 0 + primera spec

### ⚙️ Fase 0 — Habilitar el pipeline de agentes

| ID | Tarea | Archivos | Est. | Depende de | Estado |
|:---:|:---|:---|:---:|:---:|:---:|
| T-31 | Mergear el harness + Sandcastle `spec-driven` a `main` | — | — | — | ✅ |
| T-32 | Perfil de test del backend con H2: `./mvnw test` no usa la MySQL local ni corre los `DataLoader` | `pom.xml`, `src/test/resources/`, `config/*DataLoader.java` | 2 hs | — | ⬜ |
| T-33 | Vitest mínimo en el frontend + sumarlo a `commands.test` | `gym-frontend/package.json`, `vite.config.ts`, `harness.config.yml` | 1,5 hs | — | ⬜ |
| T-34 | Credenciales de Claude en `.sandcastle/.env` (**lo hace el dev**) | `.sandcastle/.env` | 15 min | — | ⬜ |
| T-35 | Spec 0001 aprobada + primera corrida de Sandcastle, anotando tiempo, costo y fricción | `specs/0001-*.md` | 2,25 hs | T-32, T-34 | ⬜ |

### 🔴 Backlog

| ID | Tarea | Archivos | Est. | Depende de | Spec | Estado |
|:---:|:---|:---|:---:|:---:|:---:|:---:|
| T-01 | Traducir al español los mensajes de validación de `ClientRequestDTO` (+ BUG-15) | `ClientRequestDTO.java` | 15 min | — | 0001 | ⬜ |
| T-02 | `GlobalExceptionHandler`: mapear todos los errores 4xx con mensajes en español | `GlobalExceptionHandler.java` | 4 hs | — | 0001 | ⬜ |
| T-08 | PATCH `/api/clients/{id}/toggle-status` — activar/desactivar cliente | `ClientController.java`, `ClientService.java` | 1 h | — | 0004 | ⬜ |
| T-13 | Dashboard: subir `totalProfessors` y `lowStockCount` a `MetricCard` (7 KPIs) | `DashboardPage.tsx` | 30 min | — | — | ⬜ |

**Estimación Semana 2: ~11,75 hs**

---

## 📋 Semana 3 (21/09 → 27/09) — Bugs críticos BE + clases multi-día

| ID | Tarea | Archivos | Est. | Depende de | Spec | Estado |
|:---:|:---|:---|:---:|:---:|:---:|:---:|
| T-03 | Fix venta de producto — `Professor not found` — resolver profesor desde JWT | `PaymentService.java`, `PaymentController.java` | 3 hs | T-02 | 0002 | ⬜ |
| T-05 | Asistencias: error descriptivo si cliente no tiene cuota activa | `AssistanceService.java` | 1 h | T-02 | 0001 | ⬜ |
| T-06 | Pagos: error descriptivo si cliente ya tiene suscripción activa | `PaymentService.java` | 1 h | T-02 | 0001 | ⬜ |
| T-07 | Clases: migrar `dayOfWeek: String` → `daysOfWeek: List<String>` (BE) | `GroupClass.java`, `GroupClassService.java`, `GroupClassController.java`, `GroupClassRepository.java` | 3 hs | — | 0003 | ⬜ |
| T-09 | Validación DNI obligatorio en formulario de cliente (deshabilitar submit) | `ClientModal.tsx` | 30 min | T-01 | — | ⬜ |
| T-10 | Mostrar mensaje de error del backend en toast — leer `error.response.data.message` | `clientService.ts`, `paymentService.ts`, `assistanceService.ts` | 1,5 hs | T-02 | — | ⬜ |
| T-14 | Clases: UI para seleccionar múltiples días | `ClassesPage.tsx` | 2 hs | T-07 | 0003 | ⬜ |

**Estimación Semana 3: ~12 hs**

---

## 📋 Semana 4 (28/09 → 04/10) — Bugs críticos FE + UX base + QA

| ID | Tarea | Archivos | Est. | Depende de | Spec | Estado |
|:---:|:---|:---|:---:|:---:|:---:|:---:|
| T-11 | Fix bug venta de producto — cliente seleccionado no se muestra | `PaymentsPage.tsx` o `ProductsPage.tsx` | 2 hs | T-03 | 0002 | ⬜ |
| T-12 | Profesor auto-asignado desde sesión en pagos y asistencias (solo ADMIN puede cambiar) | `PaymentsPage.tsx`, `AttendancePage.tsx`, `AuthContext.tsx` | 2 hs | T-03 | 0002 | ⬜ |
| T-15 | Crear `SearchableSelect.tsx` — combobox con buscador, genérico y tipado | `components/ui/SearchableSelect.tsx` | 3 hs | — | 0005 | ⬜ |
| T-16 | Reemplazar select de cliente en pagos con `SearchableSelect` (DNI + nombre) | `PaymentsPage.tsx` | 1 h | T-15 | 0005 | ⬜ |
| T-25 | Toggle activo/inactivo inline en fila de tabla de clientes | `ClientsPage.tsx` | 1 h | T-08 | 0004 | ⬜ |
| — | QA Sesión 02 (sábado 03/10) | — | 2 hs | todo lo anterior | — | ⬜ |

**Estimación Semana 4: ~11 hs**

---

## 🧩 Specs del sprint

Las specs agrupan tareas que se verifican juntas. Las tareas sin spec (T-09, T-10, T-13) son chicas y se hacen directo, en sesión interactiva.

| Spec | Tareas | Cómo se ejecuta | Estado |
|:---:|:---|:---|:---:|
| 0001 — Errores del backend legibles | T-01, T-02, T-05, T-06 | Sandcastle (piloto, T-35) | ⬜ |
| 0002 — Venta de producto con profesor desde JWT | T-03, T-11, T-12 | Sandcastle BE + interactivo FE | ⬜ |
| 0003 — Clases multi-día | T-07, T-14 | Sandcastle BE + interactivo FE | ⬜ |
| 0004 — Activar/desactivar cliente | T-08, T-25 | A decidir tras el piloto | ⬜ |
| 0005 — `SearchableSelect` | T-15, T-16 | Interactivo | ⬜ |

---

## ⛓️ Mapa de dependencias críticas

```
T-32 ──► T-35 ◄── T-34
T-02 ──► T-03 ──► T-11
     │        └──► T-12
     ├──► T-05
     ├──► T-06
     └──► T-10
T-01 ──► T-09
T-07 ──► T-14
T-08 ──► T-25
T-15 ──► T-16
```

**Orden recomendado de ejecución:**
1. **T-32 primero.** Sin tests del back independientes de la MySQL local, Sandcastle y CI no pueden verificar nada.
2. T-34 (dev) y T-33 en paralelo.
3. T-35: escribir spec 0001 → aprobar → correr Sandcastle. Resuelve T-01, T-02, T-05, T-06 si la corrida sale bien.
4. T-13, T-08 en huecos de 30 min – 1 h.
5. T-03 → T-07 → T-14 → T-09, T-10.
6. T-11, T-12, T-15 → T-16, T-25.

---

## 📊 Resumen de estimación

| Semana | Bloque | Estimación |
|:---:|:---|:---:|
| 1 | Docs + harness (fuera de plan) | — |
| 2 | Fase 0 + T-01, T-02, T-08, T-13 | ~11,75 hs |
| 3 | Bugs críticos BE + clases multi-día + T-09, T-10 | ~12 hs |
| 4 | Bugs críticos FE + `SearchableSelect` + toggle + QA | ~11 hs |
| — | Buffer | ~2,75 hs |
| | **TOTAL (semanas 2–4)** | **~37,5 hs** |

> El buffer es chico a propósito: es lo que entra en 3 semanas. **Si el Checkpoint 2 (27/09) llega con atraso**, el recorte pre-acordado es, en orden: T-25 → T-16 → T-15 (pasan al Sprint 2). No se mueve la fecha de QA.

---

## ✅ Criterios de aceptación del sprint

- [ ] `bash .harness/scripts/verify.sh` en verde en `main`, sin depender de la MySQL local
- [ ] Spec 0001 corrida de punta a punta por Sandcastle, con tiempo, costo y fricción anotados en la bitácora
- [ ] Ningún error del back se muestra en crudo al usuario
- [ ] Mensajes de validación del backend en español (no "DNI cannot be blank")
- [ ] DNI obligatorio y validado en FE + BE
- [ ] Venta de productos funciona end-to-end sin errores
- [ ] Profesor logueado se auto-asigna en pagos y asistencias
- [ ] Select de cliente en pagos con buscador por DNI y nombre
- [ ] Dashboard muestra 7 KPIs incluyendo profesores y stock bajo
- [ ] Clases permiten múltiples días
- [ ] Toggle activo/inactivo funciona en tabla de clientes
- [ ] QA Sesión 02 (03/10) pasa sin bugs críticos

> Pasaron al Sprint 2: inputs con fondo blanco, layout 100%, ESC en todos los modales, toast centrado, buscador en *todos* los selects de +10 ítems.

---

## 📝 Decisiones técnicas del sprint

1. **`SearchableSelect`**: componente genérico tipado con `<T>`, no acoplado a ninguna entidad.
2. **Errores del backend**: leer siempre `error.response?.data?.message`. Si no existe, mostrar "Error inesperado, intentá de nuevo."
3. **Clases multi-día**: `@ElementCollection List<String>` en JPA ([ADR-0003](../adr/0003-clases-multidia-elementcollection.md)).
4. **Toggle activo**: `PATCH` en vez de `PUT` para no mandar todo el objeto cliente.
5. **No wizard en este sprint**: el wizard de rutinas (DES-05 del PRD) queda para después del Sprint 2.
6. **Sprint de 4 semanas** (06/09/2026): la duración original asumía 5 hs/día ([ADR-0004](../adr/0004-capacidad-de-planificacion.md)).
7. **Sprint partido** (13/09/2026): diseño y UX no críticos pasan al Sprint 2; entra la Fase 0 ([ADR-0006](../adr/0006-partir-sprint-1-diseno-a-sprint-2.md)).
8. **Specs para agrupar tareas verificables** (13/09/2026): el trabajo que va a Sandcastle se escribe como spec con AC-IDs; lo cosmético y lo trivial no lleva spec ([ADR-0005](../adr/0005-harness-commons-y-sandcastle-spec-driven.md)).

---

## 🔄 Retrospectiva (completar al cerrar — 04/10/2026)

```
¿Qué salió bien?

¿Qué salió mal?

¿Qué se quedó fuera del sprint y por qué?

Velocidad real vs estimada:

Sandcastle — tiempo, costo y retrabajo por spec:
```
