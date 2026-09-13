# 📓 Bitácora QA — GymApp

> Registro cronológico de sesiones de prueba, bugs y decisiones.
>
> **Entradas:** [Sesión 01 (05/09)](#-sesión-01--05-sep-2026) · [Auditoría de Documentación y Código (06/09)](#-auditoría-de-documentación-y-código--06-sep-2026)

---

## 📅 Sesión 01 — 05 Sep 2026
**Tester:** Agustín | **Branch:** `feat/offline-pwa` | **Ambiente:** Dev local

> ⚠️ **Leer junto con la auditoría del 06/09/2026** (más abajo). Esta sesión fue QA de caja negra: se reportó lo que se veía en pantalla, sin mirar el código. La auditoría posterior encontró que **BUG-01, BUG-02 y BUG-03 estaban mal atribuidos** — el backend ya los tenía resueltos y el problema era sólo de frontend. Las descripciones de abajo se dejan **sin editar** (es un registro cronológico), pero están corregidas en la entrada del 06/09.

---

### 🔴 BUGS CRÍTICOS — rompen funcionalidad

| ID | Módulo | Descripción |
|:---:|:---|:---|
| BUG-01 | Dashboard | KPI "Total Profesores" no existe → *ver corrección 06/09* |
| BUG-02 | Dashboard | KPI "Stock Bajo" no existe → *ver corrección 06/09* |
| BUG-03 | Clientes | Se puede crear cliente sin DNI — sin validación FE ni BE → *ver corrección 06/09* |
| BUG-04 | Pagos | No se puede registrar venta de producto — cliente seleccionado no se muestra |
| BUG-05 | Pagos | Error crudo expuesto: `"Professor not found with id: 1"` |
| BUG-06 | Pagos | Lista no diferencia cuota mensual de venta de producto |
| BUG-07 | Clases | Clase solo permite un día — debería permitir múltiples días |

---

### 🟠 BUGS DE EXPERIENCIA — flujo confuso

| ID | Módulo | Descripción |
|:---:|:---|:---|
| BUG-08 | Clientes | Toast "Error al crear cliente" genérico — sin info (DNI dup, campos faltantes) |
| BUG-09 | Pagos | Error al pagar si cliente ya tiene suscripción activa — mensaje críptico |
| BUG-10 | Asistencias | Error al registrar sin descripción clara (¿cuota vencida?) |
| BUG-11 | Pagos | Selector de profesor visible para todos los roles — debería auto-asignarse |
| BUG-12 | Pagos/Clientes | Selects sin buscador — 159+ clientes, inoperable |
| BUG-13 | Ejercicios | Sin agrupación por grupo muscular — lista plana |
| BUG-14 | Rutinas | "Marcar sesión hecha" — texto overflow, no entra en el botón |

---

### 🎨 ISSUES DE DISEÑO / UX

| ID | Área | Descripción |
|:---:|:---|:---|
| DES-01 | Global | Inputs con fondo oscuro/negro — ilegibles. Solo modo white |
| DES-02 | Global | Layout no ocupa 100% del ancho de pantalla |
| DES-03 | Global | Toast en esquina — debería estar centrado |
| DES-04 | Global | Colores de texto sin contraste suficiente |
| DES-05 | DesignSystem | Modales de confirmación/cancelación no existen |
| DES-06 | DesignSystem | Componente de error no está en el DesignSystem |
| DES-07 | Clientes | Botón "Nuevo Alumno" — "+" arriba, texto abajo, mal formateado |
| DES-08 | Clientes | Card "GRASA CORPORAL" — colores grises, datos ilegibles |
| DES-09 | Clientes | Sin toggle activo/inactivo inline en la fila de la tabla |
| DES-10 | Rutinas | Creación en modal con scroll — debe ser wizard multi-paso |
| DES-11 | Rutinas | Cards de rutinas sin formato consistente |
| DES-12 | Clases | Mucha info en poco espacio, difícil diferenciar clases |
| DES-13 | Global | ESC no cierra modales |

---

### 📝 Decisiones tomadas

1. **Alcance**: Primero Capa Admin completa → luego Entrenador → luego Alumno.
2. **Un solo modo visual**: 100% light/white. Se elimina dark mode.
3. **Selects buscables**: Todo combobox con +10 items tiene buscador. Componente único reutilizable.
4. **Mensajes de error**: Back retorna mensajes descriptivos en todos los 4xx. Front los muestra tal cual.
5. **Sesión de profesor**: PROFESSOR logueado → campo profesor se auto-completa. Solo ADMIN puede cambiarlo.
6. **Rutinas como Wizard**: Flujo multi-paso, no modal scrollable.

---
---

## 📅 Auditoría de Documentación y Código — 06 Sep 2026
**Ejecutó:** Agustín + Claude Code | **Branch:** `feat/offline-pwa` → merge a `main` | **Tipo:** revisión de docs y lectura de código (no se ejecutó la app)

> No es una sesión de QA funcional. Es la pasada previa al arranque del Sprint 1: verificar que la documentación sea consistente y que el backlog refleje el código real antes de codear.
>
> **Ojo con la numeración:** esta entrada **no** es la "QA Sesión 02". Esa es la QA funcional de cierre de sprint, agendada para el **03/10/2026**.

---

### 🗂️ Hallazgos de documentación

| ID | Severidad | Hallazgo | Estado |
|:---:|:---:|:---|:---:|
| DOC-01 | 🔴 | 5 docs duplicados byte a byte entre `docs/` y `docs/archive/`. El commit `894de10` los copió en vez de moverlos. El más peligroso: `docs/GEMINI.md`, que describe el tema "Industrial Dark" con amber como color de marca y, al estar fuera de `archive/`, parecía vigente — justo la regla #1 que `CLAUDE.md` advierte que no hay que seguir. | ✅ |
| DOC-02 | 🟠 | `CLAUDE.md` (63 líneas) y `GEMINI.md` (38 líneas) declaraban estar sincronizados pero no lo estaban. A `GEMINI.md` le faltaban las reglas globales de arquitectura y las secciones "Antes de escribir código" y "Al terminar" — un agente de Gemini no veía la regla de `SearchableSelect`, la de DNI obligatorio ni la de auto-asignación de profesor. | ✅ |
| DOC-03 | 🟠 | El Sprint 1 estaba planificado sobre **5 hs/día** (10 días hábiles = 2 semanas). La capacidad real del proyecto es ~2 hs/día entre semana y ~4 hs los findes. El sprint era irrealizable como estaba escrito. | ✅ |
| DOC-04 | 🟡 | Los hitos del sprint caían en días no laborables: kick-off domingo 06/09, mid-sprint review sábado 12/09, QA de cierre sábado 19/09. | ✅ |

---

### 🔍 Correcciones a los bugs de la Sesión 01

La Sesión 01 fue QA de pantalla. Al contrastar contra el código, tres bugs estaban mal atribuidos:

| ID | Lo que decía la Sesión 01 | Lo que dice el código | Impacto en el backlog |
|:---:|:---|:---|:---|
| BUG-01 | KPI "Total Profesores" **no existe** | Existe en backend: `DashboardStatsDTO` lo declara y `DashboardService.java:37` lo setea. El frontend lo renderiza suelto en `DashboardPage.tsx:160`, pero **no como `MetricCard`** — por eso no se "veía" como KPI. | **T-04 cerrada sin trabajo.** Sólo queda el trabajo de FE (T-13). |
| BUG-02 | KPI "Stock Bajo" **no existe** | Ídem: el backend lo expone. El frontend lo usa sólo como banner de alerta condicional (`DashboardPage.tsx:117`), no como KPI permanente. | Ídem BUG-01. |
| BUG-03 | Sin validación de DNI **ni FE ni BE** | El BE **sí valida**: `ClientRequestDTO.java:29` tiene `@NotBlank` + `@Size(min=8, max=8)`. Lo que falla es que el mensaje nunca llega legible al usuario, porque `GlobalExceptionHandler` no maneja `MethodArgumentNotValidException`. | El bug real no era "falta validar", era **"falta manejar el error de validación"** → es T-02, no T-01. |

**Conclusión transversal:** varios bugs reportados como "el backend no lo tiene" eran en realidad **"el backend lo tiene pero el error/dato no llega al front"**. Refuerza que T-02 (`GlobalExceptionHandler`) es la tarea que más desbloquea del sprint.

---

### 🐛 Bug nuevo encontrado leyendo código

| ID | Módulo | Descripción |
|:---:|:---|:---|
| BUG-15 | Clientes (BE) | En `ClientRequestDTO`, el campo `phone` tiene `@Size(min = 10, max = 15)` pero el mensaje dice *"Phone must be between 7 and 15 characters"*. El mensaje miente sobre el mínimo real. Se arregla junto con T-01. |

---

### 📏 Estimaciones corregidas

| Tarea | Antes | Ahora | Por qué |
|:---:|:---:|:---:|:---|
| T-02 | 2 hs | **4 hs** | `GlobalExceptionHandler` tiene hoy sólo 2 `@ExceptionHandler` (`IllegalArgumentException`, `ResourceNotFoundException`). Cubrir "todos los 4xx" implica sumar al menos `MethodArgumentNotValidException`, `HttpMessageNotReadableException`, `AccessDeniedException` y `DataIntegrityViolationException`, más traducir todo al español. |
| T-21 | 2 hs | **4 hs** | El grep encontró **15 archivos** con fondos oscuros (`bg-slate\|zinc\|gray-700..950`) y **15** con `amber-*`. Incluye componentes base que arrastran estilo a toda la app: `ui/Modal.tsx`, `layouts/MainLayout.tsx`, los 4 modales de `routines/`, `clients/ClientModal.tsx`. |
| T-01 | 30 min | **15 min** | Ya estaba casi hecha, sólo falta traducir mensajes. |
| T-13 | 1 hs | **30 min** | Ya estaba parcial. |
| T-04 | 1,5 hs | **0** | Ya estaba hecha. |

---

### 📝 Decisiones tomadas

1. **Capacidad de planificación fijada**: ~2 hs/día L-V, ~4 hs/día findes. Techo 18 hs/semana, se planifica sobre **~12,5 hs/semana efectivas**. Queda documentado en `ROADMAP.md` para que ningún sprint futuro se estime sobre días hábiles completos. Ver [ADR-0004](../adr/0004-capacidad-de-planificacion.md).
2. **Sprint 1 pasa de 2 a 4 semanas**: 07/09 → 04/10/2026. Se mantiene **un solo sprint** en vez de partirlo en dos de 2 semanas, para no romper la decisión ya documentada en `ROADMAP.md` de agrupar las tres fases del PRD en un sprint calendario. Los checkpoints semanales cumplen la función de corte.
3. **Hitos siempre en día trabajado**: checkpoints en domingo (día de 4 hs), feature freeze viernes 02/10, QA sábado 03/10, merge domingo 04/10.
4. **`archive/` es la única ubicación de docs históricos**: si un doc de `archive/` aparece también fuera, es un duplicado y se borra. Anotado en `SITEMAP.md`.
5. **El backlog se audita contra el código antes de cada sprint**: la Sesión 01 generó 3 tareas fantasma sobre 30. Vale la media hora de verificación.
6. **Plan de recorte si el sprint se atrasa**: si dos semanas seguidas se caen, recortar alcance antes que estirar la fecha. Candidatos a sacar: T-27, T-29, T-30 (cosméticos, no bloquean el QA).

---

### ▶️ Próximo paso

**T-02** (`GlobalExceptionHandler`) es la primera tarea de código del sprint: desbloquea T-03, T-05, T-06 y T-10 — cuatro tareas, la mitad de los bugs críticos. No se escribió código en esta pasada.
