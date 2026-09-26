# 📓 Bitácora QA — GymApp

> Registro cronológico de sesiones de prueba, bugs y decisiones.
>
> **Entradas:** [Sesión 01 (05/09)](#-sesión-01--05-sep-2026) · [Auditoría de Documentación y Código (06/09)](#-auditoría-de-documentación-y-código--06-sep-2026) · [Fase 0 del pipeline + corrección de BUG-03 (13/09)](#-fase-0-del-pipeline--corrección-de-bug-03--13-sep-2026)

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

---
---

## 📅 Fase 0 del pipeline + corrección de BUG-03 — 13 Sep 2026
**Ejecutó:** Agustín + Claude Code | **Branch:** `chore/fase-0-pipeline` | **Tipo:** lectura de código y pruebas del harness (no se ejecutó la app)

> ⚠️ **Esta entrada corrige a la del 06/09.** La corrección de BUG-03 de esa auditoría estaba equivocada.

---

### 🔍 BUG-03 era real en el backend

| Lo que dijo la auditoría del 06/09 | Lo que dice el código |
|:---|:---|
| "El BE **sí valida**: `ClientRequestDTO.java:29` tiene `@NotBlank` + `@Size`. Lo que falla es que el mensaje no llega." | `ClientRequestDTO` **no lo usa ningún controller**. `ClientController` recibe la entidad `Client` directo en `POST` y `PUT`, y no hay un solo `@Valid` en todo `controller/`. El backend acepta un cliente sin DNI. |

**Por qué se escapó:** la auditoría leyó el DTO y asumió que estaba cableado, sin seguir el `@RequestBody` del controller. Es el mismo error que venía a corregir: dar por hecho algo leyendo en vez de verificar el camino completo.

**Impacto en el backlog:**
- T-01 deja de ser "traducir mensajes" (15 min): hay que pasar el controller a `@Valid ClientRequestDTO` sin romper el contrato con el frontend. Re-estimada en **1,5 hs**. Queda en la [spec 0001](../../specs/0001-errores-del-backend-legibles.md), tarea T2.
- **Riesgo nuevo:** el DTO exige `name` y `lastName` de 4+ caracteres y el frontend acepta desde 1. Al activar la validación, altas como "Ana Gil" pasarían a fallar. Pregunta abierta 3 de la spec 0001.
- **Deuda documentada, fuera del sprint:** otros 7 controllers reciben entidades en vez de `RequestDTO` (`Exercise`, `GroupClass`, `Product`, `Professor`, `MonthlyType`, `ExerciseLog`, nutrición/suplementos), contra `gymapp-back/GEMINI.md` §3.1.

---

### 🐛 Bugs nuevos encontrados leyendo código

| ID | Módulo | Descripción |
|:---:|:---|:---|
| BUG-16 | Pagos (BE) | `createProductPayment` descuenta stock producto por producto y `PaymentService` no es `@Transactional`: si falla el tercer ítem por stock, los dos primeros ya quedaron descontados. Cubierto por AC-0001-10. |
| BUG-17 | Asistencias / Pagos (BE) | "Sin membresía", "membresía vencida" y "stock insuficiente" se lanzan como `RuntimeException` y hoy salen como 500 genérico. Cubierto por AC-0001-07, 08 y 10. |

---

### ⚙️ Fase 0 — resultados

- **Tests del backend sin MySQL (T-32):** perfil de test con H2 + `app.seed.enabled=false`. Verificado con `DB_URL` apuntando a un puerto muerto: el contexto levanta contra H2 y los seeders no corren.
- **Vitest en el frontend (T-33):** vitest + Testing Library, test de humo sobre `EmptyState`, sumado a `commands.test`.
- **Compuerta dentro del sandbox:** `verify.sh` pasa en la imagen `sandcastle:gymapp` sin MySQL (79 s). **Pero el install en frío tardó 609 s**, contra el timeout de 300 s de `onSandboxReady` en `main.mts`: Sandcastle se habría caído en la primera fase. Se precachean `~/.m2` y `~/.npm` en la imagen (`npm run sandcastle:image`).
- **Con la caché en la imagen:** install **9 s** (antes 609 s) y `verify.sh` completo en 49 s dentro del sandbox. El build de la imagen falló tres veces antes de eso: no era la red (primer diagnóstico, equivocado) sino un `rm` sobre un directorio que `COPY` había creado como root.

---

### 🤖 Piloto de Sandcastle sobre la spec 0001 (T-35)

**Resultado:** el pipeline corrió de punta a punta en el intento 5 y **la revisión bloqueó el merge** con 2 hallazgos de severidad alta. La compuerta humana (decidir qué hacer con los hallazgos) queda pendiente.

| Fase (intento 5) | Duración | Resultado |
|:---|:---:|:---|
| Planner | ~2 min | Eligió la 0001, rama `sandcastle/spec-0001` |
| Test-author | ~12 min | 13 tests rojos, los 13 AC citados, fallan por la razón correcta |
| Implementer | ~13 min | +761/−68 en 13 archivos; `verify.sh` verde en el sandbox |
| Reviewer | ~6 min | 5 hallazgos: 2 alta, 2 media, 1 baja → no se mergea |

**Hallazgos del reviewer** (todos con escenario de falla concreto):
- 🔴 `ClientService.updateClient` hace `setEmail` incondicional: editar un cliente desde el modal (que no manda `email`) **borra el email en base**. Rompe AC-0001-03.
- 🔴 `@Size(min=8,max=8)` sobre el DNI se evalúa antes del `trim`: `" 12345678 "` da 400 aunque la spec lo acepta. Caso de borde sin test.
- 🟠 El `@ExceptionHandler(Exception.class)` convierte 400/404/405 estándar de Spring (id no numérico, ruta inexistente, método no soportado) en 500.
- 🟠 La validación de stock es por línea: dos ítems del mismo producto que juntos superan el stock pasan y dejan **stock negativo**.
- 🟡 El test de AC-0001-13 solo verifica que el mensaje no esté vacío, no que esté en español.

**Fricción encontrada (5 intentos, 4 fallidos por el pipeline, no por el código):**
1. `commands.test` compuesto sin agrupar + `| tail` en el prompt → `PromptError`. Arreglado en `harness.config.yml`.
2. Respaldo de rama dentro de `sandcastle/spec-*` → el planner la tomó como planificada. Los respaldos van en `respaldo/`.
3. `verify.sh` (~50 s) dentro de una expansión de shell del prompt → timeout fijo de 30 s de sandcastle 0.12.0. Arreglado en commons `5fca80c` (salida por `sandbox.exec`).
4. Límite de uso del plan de Claude a mitad de corrida (`session limit`). Cinco corridas completas en una noche lo agotaron.

**Deudas para commons:** no hay forma de reanudar una spec desde la revisión (una corrida cortada después de implementar obliga a repetir todo), y el pipeline no tiene vuelta de corrección: los hallazgos de la revisión vuelven al humano, no al implementer.

Ramas conservadas: `respaldo/spec-0001-intento-{1,3,4}` y `sandcastle/spec-0001` (intento 5, la revisada).

**Cierre (13/09/2026):** los 5 hallazgos se corrigieron a mano sobre `sandcastle/spec-0001`, con un test rojo por hallazgo antes de cada arreglo (6 tests nuevos). `verify.sh` completo en verde: 13/13 AC con test, 21 tests de backend. Spec 0001 → `implementada`, mergeada a `main`. Cierra T-01, T-02, T-05, T-06 y T-35.

---

### 🤖 Sandcastle sobre la spec 0002 (13/09/2026)

**Resultado:** primera spec que corre **de punta a punta y mergea sola**, en un solo intento (21:08 → 21:58, ~50 min). Planner ~2 min, test-author ~23 min, implementer ~14 min, reviewer ~8 min y merger. 27/27 AC con test en `main`, 34 tests de backend y 7 de front.

**Hallazgos de la revisión** (3, severidad media, no bloquearon; pendientes de decisión):
- 🟠 `AttendancePage` sigue con `c.dni.includes` sin guarda: con un cliente de DNI null, escribir en el buscador rompe la vista y no se puede marcar asistencia. El arreglo se aplicó solo en `ProductsPage`.
- 🟠 Token válido de una persona borrada responde 500, no el 401 de la spec: `UsernameNotFoundException` nace en `JwtAuthenticationFilter`, antes del `@RestControllerAdvice`. Falta además el `AuthenticatedStaffServiceTest` de T1.
- 🟠 El test de AC-0002-12 no verifica que el ADMIN vea el selector de profesor: si se borra, el ADMIN no puede cobrar cuotas y el test sigue verde.

**Fricción nueva (para commons):**
1. **Planner y merger corren sobre el repo del host, no en un worktree.** `commands.install` (`npm ci`, `mvnw`) reescribe `node_modules` y `target/` del host mientras corre: el hook local encontró ESLint 6.4 del sistema y, en la spec 0001, un `NoClassDefFoundError` por compilación a medias.
2. **El merger editó `.claude/settings.local.json` del host** (cambió `JAVA_HOME` a la ruta del contenedor) para que su hook pasara. Un agente con acceso al repo del host puede tocar configuración local gitignoreada. Restaurado a mano.

**Cierre de hallazgos (13/09/2026):** los 3 hallazgos de la revisión de la spec 0002 se corrigieron a mano, con test rojo primero. La búsqueda por DNI de `AttendancePage` ya no rompe con DNI null. Un token de una persona borrada responde 401 en español: el filtro JWT ya no propaga la excepción y hay un entry point en `SecurityConfig`. Se agregaron `AuthenticatedStaffServiceTest` y el test del selector ADMIN, verificado por mutación. `verify.sh` en verde: 27/27 AC, 38 tests de backend y 10 de front.

⚠️ **Cambio de comportamiento a tener en cuenta en la QA Sesión 02:** toda petición sin sesión válida (sin token o con token vencido) pasa de **403 a 401**. El interceptor de `lib/axios.ts` ya trataba el 401 como sesión expirada, así que ahora ese aviso aparece donde antes no aparecía nada.


---

## 📅 Specs 0007 y 0008 + revisión a mano — 24 Sep 2026
**Ejecutó:** Agustín + Claude Code | **Branch:** `main` | **Tipo:** cierre a mano de una corrida de Sandcastle, revisión en la app (dev server, 375px y desktop) y spec nueva

### 🤖 Sandcastle sobre la spec 0007 (23/09/2026)

Se cortó en la vuelta 2 de 2 del fixer por **límite de uso del plan** (`session limit`). Había corregido H-0007-2-01 y 2-02; H-0007-2-03, 2-04 y 2-05 se terminaron a mano sobre `sandcastle/spec-0007`, con test rojo primero. Spec 0007 → `implementada`, mergeada a `main`.

La revisión a mano encontró que el pie del modal "Asignar rutina" se desbordaba en desktop (el primario quedaba cortado, contra §B.12). Corregido en `fd34060`. Lo demás cumplía: plantilla que no se arrastra entre alumnos, hoja inferior a 375px, ficha sin scroll horizontal.

También apareció que el frontend trataba las fechas `LocalDate` como UTC: "hoy" daba el día siguiente entre las 21 y las 24, y las fechas se mostraban un día antes. Se escribió, aprobó e implementó la [spec 0008](../../specs/0008-fechas-en-hora-local.md) en la misma sesión (merge `f8a550f`).

### 📌 Pendientes anotados — tener en cuenta antes de la QA Sesión 03

| ID | Módulo | Descripción | Estado |
|:---:|:---|:---|:---:|
| BUG-18 | Backend (fechas) | `LocalDate.now()` usa la zona de la JVM (**verificado 26/09: la imagen `gymapp-backend` corre en UTC**; lo cubre la spec 0010). Si el contenedor corre en UTC, tiene el mismo corrimiento que la spec 0008 corrigió en el frontend (ej.: `RoutineService.assignComplexRoutine` cuando no llega `startDate`). Hoy el frontend siempre manda la fecha, así que no se dispara en el flujo normal. Se arregla fijando la zona (`TZ` / `-Duser.timezone`), no con código. Fuera de alcance de la spec 0008. | ⬜ |
| BUG-19 | Global (formato) | Los montos se muestran con `toLocaleString()` sin locale: `$22,000` en vez de `$22.000`. Es el mismo problema de locale implícito que la spec 0008 corrigió para las fechas. Pide una spec de formato de números. **Cerrado 26/09/2026** por la [spec 0009](../../specs/0009-formato-de-montos.md): `formatMoney` en 12 lugares y regla de lint contra `toLocaleString()` sin locale. | ✅ |
| BUG-20 | Backend (PDF) | `ReportService` arma los montos del PDF de cierre de mes con `String.format("%.2f")`, que depende del locale de la JVM (`$150000.00`, sin separador de miles). Es el mismo problema que la spec 0009 resolvió en el frontend. Quedó fuera de alcance de esa spec. | ⬜ |
| BUG-21 | Dashboard (BE) | `PaymentRepository.sumAmountByMonth` filtra con `MONTH(p.date) = :month`, sin el año: los ingresos de septiembre de 2027 sumarían también los de septiembre de 2026. Encontrado el 26/09/2026 al escribir la spec 0010, y sumado a esa spec. | ⬜ |
| DES-14 | Rutinas (modal) | La spec 0007 §B.11 pide "Asignar y cargar otra" con **estilo texto** en mobile y quedó como botón con borde (`variant="outline"`). **Cerrado 26/09/2026:** en mobile queda sin borde ni fondo (`max-sm:`), en desktop conserva el borde (§B.12). Verificado con Playwright a 375px y 1280px. | ✅ |
| QA-0007 | Rutinas / ficha | La revisión 1 de Sandcastle sobre la 0007 devolvió 6 hallazgos. El fixer corrigió los 4 de severidad alta/media; **los 2 de severidad baja no quedaron registrados** (el log del reviewer se pisó con la revisión 2). Para recuperarlos hay que correr una revisión nueva de la ficha y del modal. | ⬜ |

### 🔧 Fricción nueva

- **Sandcastle se corta sin reanudarse limpio:** la corrida terminó en la última vuelta del fixer, con un cambio de test sin commitear en el worktree. Al terminarlo a mano hubo que reconstruir qué hallazgos quedaban leyendo el log del fixer.
- **Los hallazgos de la revisión 1 se pierden** cuando corre la revisión 2, porque escriben el mismo archivo de log. Deuda para commons: guardar cada revisión por separado.
