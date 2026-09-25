---
id: 0008
titulo: Fechas en hora local — "hoy" y fechas mostradas sin corrimiento de un día
estado: propuesta             # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 24/09/2026
adrs_relacionados: [ADR-0009]
---

## Objetivo

El frontend trata las fechas sin hora (`LocalDate` del backend, formato `AAAA-MM-DD`) como si fueran UTC. En Argentina (UTC−3) eso corre las fechas un día en dos sentidos:

- **Al cargar:** "hoy" se calcula con `new Date().toISOString().split('T')[0]`, que es la fecha UTC. Entre las 21:00 y las 24:00 se carga **el día siguiente**. Pasa en pagos, asistencias, ventas, registros físicos y en la asignación de rutinas. Se detectó en la revisión a mano de la spec 0007 el 24/09/2026 a las 22:40: el modal proponía 25/09 como fecha de inicio.
- **Al mostrar:** `new Date('2026-09-24')` se interpreta como la medianoche UTC. En Argentina es el 23/09 a las 21:00, así que `toLocaleDateString()` muestra **el día anterior**, a cualquier hora. Además, sin locale explícito sale en el formato del navegador (`9/23/2026`) y no en español.

Esto lo sufre el admin, que hoy carga y consulta todos esos datos. Además, los pagos y las asistencias quedan guardados con una fecha equivocada.

## Restricciones

- El backend no cambia: todas las fechas de negocio son `LocalDate` (`Payment`, `Assistance`, `PhysicalRecord`, `ProductsPurchased`, etc.) y se siguen mandando como `AAAA-MM-DD`.
- La UI va en español (regla del proyecto). Las fechas se muestran como `DD/MM/AAAA`.
- No se agrega una librería de fechas (date-fns, dayjs): alcanzan tres funciones propias.
- Sigue valiendo la regla de ADR-0009 (sin scroll horizontal): el cambio de formato no puede ensanchar las tablas.

## Comportamiento esperado

### A. "Hoy" es el día del calendario local

1. Existe un único helper, `todayLocalISO()` en `src/utils/date.ts`, que devuelve la fecha local del navegador como `AAAA-MM-DD`, armada con `getFullYear/getMonth/getDate`. En ningún lado se usa `toISOString()` para esto.
2. Todos los lugares que hoy calculan "hoy" con `toISOString` pasan a usar ese helper:
   - `AssignRoutineModal`: fecha de inicio por defecto, al abrir y al resetear.
   - `PaymentsPage`: fecha de pago por defecto y al limpiar el formulario después de cobrar.
   - `AttendancePage`: la fecha con la que se consultan las asistencias del día y con la que se registra una nueva.
   - `ClassesPage`: la fecha de la asistencia registrada desde una clase.
   - `ProductsPage`: la fecha de la venta.
   - `ClientDetailPage`: la fecha del registro físico nuevo.
   - `DashboardPage`: la fecha del nombre del PDF de cierre de mes.
3. Una regla de ESLint impide volver a escribir `toISOString().split(...)` y `toISOString().slice(...)` en `src/`. El mensaje apunta a `todayLocalISO()`.

### B. Una fecha `AAAA-MM-DD` se muestra como ese mismo día

4. `src/utils/date.ts` también expone:
   - `parseLocalDate(iso)`: devuelve un `Date` a la medianoche **local** de ese día (no UTC).
   - `formatDate(iso)`: devuelve `DD/MM/AAAA`.
5. Todas las fechas de negocio que hoy se muestran con `new Date(x.date)` pasan a usar esos helpers:
   - `PaymentsPage`: la columna de fecha de la lista de pagos.
   - `ProductsPage`: el historial de ventas.
   - `ClientDetailPage`: la tabla de la pestaña Pagos, la tabla de la pestaña Compras, la lista de registros de la pestaña Progreso, las etiquetas del eje del gráfico de Progreso y la tarjeta de cada asistencia (mes, número de día y día de la semana).

## Casos de borde

- **Justo después de medianoche (00:10 local):** "hoy" es el día nuevo. En UTC ya lo era desde las 21:00, así que el helper no puede depender de UTC en ningún sentido.
- **21:00 en punto:** es el primer minuto en que el cálculo viejo falla. Tiene que dar el mismo día.
- **Último día del mes o del año** (31/12 a las 23:30): "hoy" es el 31/12, no el 01/01. Es el caso en que un error de un día cambia de mes o de año, que es lo que más duele en la facturación mensual.
- **Mes y día de un dígito:** `todayLocalISO()` rellena con cero (`2026-09-05`, no `2026-9-5`), porque el backend parsea `LocalDate` estricto.
- **Fecha nula o vacía en una fila:** `formatDate` devuelve `-` en vez de `Invalid Date` o de romper el render.
- **Página abierta mientras pasa la medianoche:** "hoy" se recalcula en cada render. No hay un temporizador que fuerce ese render (ver Fuera de alcance).
- **Navegador con otra zona horaria:** "hoy" es el día local de **ese** navegador. Asumimos que el admin carga desde el gimnasio (ver Notas de handoff).

## Criterios de aceptación

Todos los tests corren con `TZ=America/Argentina/Buenos_Aires` fijado en la configuración de Vitest. Así fallan contra el código actual aunque la máquina o la CI estén en UTC. En los criterios de "hoy", el reloj se fija con `vi.setSystemTime`.

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0008-01 | Con el reloj en `2026-09-24T22:40:00-03:00`, `todayLocalISO()` devuelve `'2026-09-24'`. Con `2026-12-31T23:30:00-03:00` devuelve `'2026-12-31'`. |  |
| AC-0008-02 | Con el reloj en `2026-09-25T00:10:00-03:00`, `todayLocalISO()` devuelve `'2026-09-25'`. Con `2026-09-05T10:00:00-03:00` devuelve `'2026-09-05'`, con el cero. |  |
| AC-0008-03 | `formatDate('2026-09-24')` devuelve `'24/09/2026'`. `formatDate('')` y `formatDate(null)` devuelven `'-'`. |  |
| AC-0008-04 | `parseLocalDate('2026-09-24')` devuelve un `Date` con `getDate() === 24`, `getMonth() === 8` y `getDay() === 4` (jueves). |  |
| AC-0008-05 | `AssignRoutineModal` abierto con el reloj en `2026-09-24T22:40:00-03:00`: el campo "Fecha de inicio" tiene `2026-09-24`, y al asignar, `assignRoutineToClient` recibe `startDate: '2026-09-24'`. |  |
| AC-0008-06 | `PaymentsPage` con el reloj en `2026-09-24T22:40:00-03:00`: la fecha de pago del formulario arranca en `2026-09-24`, y después de registrar un pago vuelve a `2026-09-24`. |  |
| AC-0008-07 | `AttendancePage` con el reloj en `2026-09-24T22:40:00-03:00`: `getAssistanceByDate` se llama con `'2026-09-24'`, y registrar una asistencia llama a `registerAssistance` con `date: '2026-09-24'`. |  |
| AC-0008-08 | `ClassesPage` con el reloj en `2026-09-24T22:40:00-03:00`: registrar la asistencia de un alumno desde una clase llama a `registerAssistance` con `date: '2026-09-24'`. |  |
| AC-0008-09 | `ProductsPage` con el reloj en `2026-09-24T22:40:00-03:00`: confirmar una venta envía `date: '2026-09-24'`. |  |
| AC-0008-10 | `ClientDetailPage` con el reloj en `2026-09-24T22:40:00-03:00`: guardar un registro físico nuevo lo envía con `date: '2026-09-24'`. |  |
| AC-0008-11 | `DashboardPage` con el reloj en `2026-09-24T22:40:00-03:00`: descargar el cierre de mes genera un archivo llamado `Reporte_Cierre_Mes_2026-09-24.pdf`. |  |
| AC-0008-12 | `PaymentsPage` con un pago de `date: '2026-09-24'`: la fila muestra `24/09/2026` y no contiene `23/09`. |  |
| AC-0008-13 | `ProductsPage` con una venta de `date: '2026-09-24'`: el historial muestra `24/09/2026`. |  |
| AC-0008-14 | `ClientDetailPage`, pestañas Pagos y Compras, con un pago y una compra de `date: '2026-09-24'`: cada fila muestra `24/09/2026`. |  |
| AC-0008-15 | `ClientDetailPage`, pestaña Progreso, con un registro de `date: '2026-09-24'`: la lista muestra `24/09/2026`. |  |
| AC-0008-16 | `ClientDetailPage`, pestaña Asistencias, con una asistencia de `date: '2026-09-24'`: la tarjeta muestra el número `24` y el día `jueves`. |  |
| AC-0008-17 | Correr ESLint sobre un archivo de `src/` que contiene `new Date().toISOString().split('T')[0]` da un error cuyo mensaje menciona `todayLocalISO`. Correr `eslint .` sobre `gym-frontend` da 0 errores. |  |

## Fuera de alcance

- **`LocalDate.now()` del backend en la zona del servidor.** Por ejemplo, `RoutineService.assignComplexRoutine` usa `LocalDate.now()` cuando no llega `startDate`. Si el contenedor corre en UTC, tiene el mismo bug. Queda afuera porque es otra capa y se arregla configurando la zona de la JVM (`-Duser.timezone` / `TZ`), no con código. Además, con esta spec el frontend siempre manda la fecha. Si hace falta, va en una spec de backend aparte.
- **Corregir los registros ya guardados con la fecha del día siguiente.** No hay forma confiable de distinguir un pago cargado el 25 a las 22:00 (mal) de uno cargado el 25 a las 10:00 (bien), porque no se guarda la hora de carga. Si hace falta, se revisa a mano con el admin.
- **Refrescar "hoy" solo si la página queda abierta después de medianoche** (con un temporizador que re-renderice). Es un caso raro dentro del horario del gimnasio, y cualquier interacción ya re-renderiza.
- **Fijar la zona `America/Argentina/Buenos_Aires` en el código** en vez de usar la del navegador. Hoy nadie carga desde otra zona, y fijarla rompería el caso (hipotético) de un gimnasio en otro país.
- **Las horas (`inputHour`) de las asistencias.** Ya usan `getHours()` y `getMinutes()` locales y están bien.
- **El encabezado de `AttendancePage` con la fecha de hoy** (`new Date().toLocaleDateString('es-ES', …)`). Formatea el instante actual, no una fecha `AAAA-MM-DD`, así que no se corre de día.
- **Los trackers de nutrición, hidratación y suplementos.** No calculan "hoy" en el frontend.
- **Mostrar los montos con separador argentino** (`$22.000` en vez de `$22,000`). Es el mismo tipo de problema (locale implícito), pero toca otros componentes. Se anota para una spec de formato de números.

## Notas de handoff

**Qué se asumió:**
- "Hoy" es el día del calendario **del navegador** del admin, que está en el gimnasio. No se hardcodea la zona horaria.
- El formato de fecha mostrado es `DD/MM/AAAA`. Lo más natural para Argentina es `es-AR` numérico. No se discutió otra variante (por ejemplo, "24 sep 2026").
- Las etiquetas del eje del gráfico de Progreso usan `parseLocalDate` y mantienen su formato corto actual (día y mes abreviado). Solo cambia que el día sea el correcto. No se agrega un AC propio porque Recharts no renderiza los ticks en jsdom de forma confiable.

**Preguntas abiertas:**
1. ¿`DD/MM/AAAA` está bien, o preferís un formato con el mes en letras en las listas?
2. La parte B (fechas mostradas un día antes) es un bug distinto con la misma causa. La incluí porque toca las mismas pantallas y el mismo helper, pero se puede partir en una spec 0009 si querés cerrar la A primero.

**Lo más probable que salga mal:**
- **Que los tests pasen sin probar nada.** Si Vitest no corre con `TZ=America/Argentina/Buenos_Aires`, en una máquina o CI en UTC el código viejo y el nuevo dan lo mismo, y todos los AC quedan en verde contra el bug. T1 tiene que dejar el TZ fijo **y** demostrar que el test de AC-0008-01 falla contra `toISOString().split('T')[0]` antes de escribir el helper.
- `vi.setSystemTime` junto con los temporizadores falsos de Vitest puede colgar a Testing Library y a TanStack Query (`waitFor` y `findBy*` esperan temporizadores que nunca avanzan). Hay que usar `vi.useFakeTimers({ toFake: ['Date'] })` para falsear solo `Date`, o `shouldAdvanceTime: true`.
- `PaymentsPage` y `ProductsPage` las tocan dos tareas (T3 para "hoy" y T5 para mostrar). Si se hacen en paralelo, chocan. Por eso el plan las ordena.
