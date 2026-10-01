# QA Sesión 02 — checklist (sábado 03/10/2026)

> **Objetivo:** cerrar el [Sprint 1](../sprints/06-09-2026-sprint-1-refactor-core-admin.md) **sin bugs críticos**. Es la condición para que el sprint cierre el 04/10 (ver [`ROADMAP.md`](../ROADMAP.md)).
> **Alcance:** volver a probar los bugs de la [Sesión 01](./BITACORA_QA.md) y lo que entregaron las specs 0001 a 0013, salvo la 0006 (espacios y choques de horario), que sigue en `propuesta`. Los ítems de diseño del Sprint 2 están al final: se prueban si sobra tiempo y **no bloquean** esta sesión, porque son el objetivo de la QA Sesión 03 (17/10).
> **Duración estimada:** 2 hs. Armado el 28/09/2026.

---

## Pasada previa (29/09/2026)

Una recorrida rápida antes de la sesión encontró tres críticos. Cada uno pasó a una spec, aprobada e implementada el 30/09/2026 (compuerta completa en verde, 137/137 criterios con test). En la sesión se vuelven a probar en los pasos indicados.

| Crítico | Spec | Se vuelve a probar en | Estado |
|:---|:---|:---:|:---:|
| La página de Clases queda vacía ("Sin clases programadas") si una clase tiene la rutina activa de un alumno (JSON inválido), y la respuesta expone el hash de la contraseña, el email, el DNI y el teléfono del profesor | [0011](../../specs/0011-clases-sin-ciclos-ni-datos-del-profesor.md) | sección 7 | ✅ |
| Ninguna pantalla marca a los deudores: el backend mandaba `debtor` y el frontend lee `isDebtor` | [0012](../../specs/0012-deudor-visible-en-la-ui.md) | 7.6 | ✅ |
| Todo pago figura como "Producto" y el historial de ventas de Tienda está vacío (reabre BUG-06) | [0013](../../specs/0013-tipo-de-pago-y-productos-en-la-respuesta.md) | 4.8 | ✅ |

Anotado, sin bloquear: en la respuesta de `POST`/`PUT /api/classes`, `professor.name` y `lastName` salen `null` porque `GroupClassService` guarda la referencia que llega en el body (solo el id). La UI no se ve afectada porque vuelve a pedir la lista después de guardar.

---

## Preparación

- [ ] `main` actualizado (`git pull`) y compuerta en verde: `bash .harness/scripts/verify.sh`.
- [ ] Backend con los seeders activos (`app.seed.enabled` sin tocar): `cd gymapp-back && ./mvnw spring-boot:run`. `HeavyDataLoader` carga +150 alumnos, que hacen falta para probar los buscadores.
- [ ] Frontend: `cd gym-frontend && npm run dev`.
- [ ] Dos sesiones abiertas a la vez: una ventana normal como **ADMIN** y una ventana de incógnito como **PROFESSOR**.
- [ ] Para mobile: DevTools en modo dispositivo a **375px**.

**Usuarios del `DataLoader`:**

| Rol | Email | Contraseña |
|:---|:---|:---|
| ADMIN | `admin@gymapp.com` | `admin123` |
| PROFESSOR | `marcos@gymapp.com` | `marcos123` |
| PROFESSOR | `sofia@gymapp.com` | `sofia123` |

Alumnos útiles: Carlos Perez (DNI 12345678, activo, en Crossfit), Ana Gomez (23456789, activa, en Yoga), Roberto Sanchez (34567890, **inactivo**).

**Cómo anotar un hallazgo:** en la columna *Resultado* poné ✅, o el ID nuevo del hallazgo. Los IDs siguen la numeración de la bitácora: el próximo bug es **BUG-22** y el próximo de diseño **DES-15**. Severidad:

- 🔴 **Crítico:** rompe la funcionalidad o deja datos mal. **Bloquea el cierre del sprint.**
- 🟠 **Experiencia:** el flujo funciona pero confunde (mensaje críptico, paso de más).
- 🎨 **Diseño:** se ve mal, pero no cambia lo que pasa.

Al terminar, volcar los hallazgos a [`BITACORA_QA.md`](./BITACORA_QA.md) como "Sesión 02", con el mismo formato de tablas que la Sesión 01.

---

## 1. Acceso

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 1.1 | Login con contraseña incorrecta | Mensaje en español que dice que las credenciales no son válidas | spec 0001 | |
| 1.2 | Login como ADMIN y como PROFESSOR (en incógnito) | Los dos entran al dashboard | — | |
| 1.3 | Cualquier error de la sesión | El toast muestra un mensaje en español, nunca un texto técnico como `Professor not found with id: 1` | BUG-05, spec 0001 | |

## 2. Dashboard

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 2.1 | Contar las métricas | 7 KPIs, incluidos "Total profesores" y "Stock bajo" | BUG-01, BUG-02, T-13 | |
| 2.2 | Comparar "Ingresos del mes" con la suma de los pagos de septiembre en la página Pagos | Coinciden, sin pagos de otro mes ni de otro año | BUG-21 | |
| 2.3 | Revisar el formato de los montos | `$22.000`, con punto de miles y sin decimales sueltos | BUG-19 | |
| 2.4 | Descargar el PDF de cierre de mes | Se llama `Reporte_Cierre_Mes_2026-10-03.pdf`, "Emitido el" muestra la hora actual de Argentina y los montos salen como `$150.000` (o `$1.234,50` si tienen centavos) | BUG-20, AC-0008-11 | |

## 3. Alumnos

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 3.1 | Nuevo alumno sin DNI | El botón de guardar queda deshabilitado | BUG-03, T-09 | |
| 3.2 | Nuevo alumno con el DNI de Carlos (12345678) | El toast dice que el DNI ya existe; el modal no se cierra | BUG-08 | |
| 3.3 | Nuevo alumno con todos los datos | Se crea y aparece en la lista | — | |
| 3.4 | Botón "Nuevo alumno" | El "+" y el texto van en una sola línea | DES-07 | |
| 3.5 | Interruptor activo/inactivo de un alumno activo → **cancelar** | No cambia nada | AC-0004-13 | |
| 3.6 | Mismo interruptor → **aceptar** | La fila pasa a "Inactivo"; el interruptor queda deshabilitado mientras se guarda | DES-09, T-25, AC-0004-08/10 | |
| 3.7 | Desactivar a un alumno que estaba en una clase y volver a activarlo | Queda activo y **sin** clase asignada | AC-0004-02/03 | |
| 3.8 | Repetir 3.6 como PROFESSOR | También puede desactivar | AC-0004-12 | |

### Ficha del alumno (Carlos Perez)

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 3.9 | Abrir la ficha | Link "‹ Alumnos", avatar con iniciales, nombre, etiquetas de estado y de cuota, DNI, teléfono, rutina actual y último pago | spec 0007 | |
| 3.10 | Comparar el encabezado con "Resumen Reciente" | Muestran el mismo último pago y la misma rutina | H-0007-2-05 | |
| 3.11 | Recorrer las 7 pestañas con el mouse | Cada una muestra su contenido; la activa queda subrayada en verde | AC-0007-06 | |
| 3.12 | Hacer clic en una pestaña y usar ← → Inicio Fin | El foco y la selección se mueven entre pestañas; Tab sale de la fila de pestañas en vez de recorrerlas una por una | QA-0007 | |
| 3.13 | Pestaña Pagos y Compras | Fechas en `dd/mm/aaaa`, sin un día de atraso; montos en `$15.000` | spec 0008, spec 0009 | |
| 3.14 | Card de grasa corporal / recomposición | Los valores se leen bien y no se cortan; la meta va en su propia línea | DES-08, AC-0007-07 | |
| 3.15 | Ficha a 375px | Sin scroll horizontal de la página; las pestañas se deslizan dentro de su fila | spec 0007 | |

## 4. Pagos (cuotas)

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 4.1 | Como PROFESSOR, abrir "Nuevo pago" | **No** hay selector de profesor | BUG-11, AC-0002-12 | |
| 4.2 | Como ADMIN, abrir "Nuevo pago" | Hay selector de profesor, sin valor elegido | AC-0002-12 | |
| 4.3 | Como ADMIN, intentar guardar sin profesor | No se puede guardar, o el mensaje pide elegir el profesor | AC-0002-07 | |
| 4.4 | Buscar alumno por DNI y después por apellido | El buscador filtra entre los +150 alumnos en los dos casos | BUG-12, T-16 | |
| 4.5 | Cobrar una cuota a un alumno que ya tiene una vigente del mismo plan | Mensaje claro que dice que ya existe un pago vigente de ese plan | BUG-09, T-06 | |
| 4.6 | Cobrar una cuota a Roberto (inactivo) | Mensaje que dice que el alumno está inactivo; no se guarda | AC-0004-07 | |
| 4.7 | Cobrar una cuota válida como PROFESSOR | Se guarda a nombre del profesor logueado; la fecha es la de hoy | T-12, spec 0010 | |
| 4.8 | Mirar la lista de pagos | Se distingue la cuota mensual de la venta de producto | BUG-06 | |

## 5. Productos (ventas)

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 5.1 | Como PROFESSOR, vender un producto a un alumno | El alumno elegido queda en el campo; la venta se guarda sin pedir profesor; baja el stock | BUG-04, BUG-05, AC-0002-09 | |
| 5.2 | Como ADMIN, abrir una venta | "Confirmar venta" queda deshabilitado hasta elegir alumno, profesor y producto | AC-0002-10 | |
| 5.3 | Vender a Roberto (inactivo) | Mensaje en español; el stock no cambia | AC-0004-11 | |
| 5.4 | Vender hasta dejar un producto bajo el mínimo | El KPI "Stock bajo" del dashboard sube | BUG-02 | |

## 6. Asistencias

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 6.1 | Registrar la asistencia de un alumno al día | Se guarda con el profesor logueado como staff | T-12, AC-0002-08 | |
| 6.2 | Registrar la de un alumno con la cuota vencida | Mensaje claro de cuota vencida | BUG-10, T-05 | |
| 6.3 | Registrar la de Roberto (inactivo) | Mensaje que dice que el alumno está inactivo | AC-0004-06 | |
| 6.4 | Registrar la de un alumno cuya cuota vence **hoy** | Se guarda: la cuota sigue vigente todo el día | spec 0010 | |

## 7. Clases

> Los espacios y los choques de horario (spec 0006) **no entran**: la spec sigue en `propuesta` y no está implementada.

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 7.1 | Nueva clase sin elegir ningún día | No se puede guardar | AC-0003-10 | |
| 7.2 | Crear "Funcional QA": lunes y viernes, 19:00–20:00, Marcos | Aparece en las columnas Lunes y Viernes, y no en Martes | BUG-07, T-14, AC-0003-09/10 | |
| 7.3 | Editar "Funcional QA" | Lunes y Viernes aparecen marcados y el resto no | AC-0003-11 | |
| 7.4 | Cambiarle los días a solo martes y guardar | Queda solo en la columna Martes | AC-0003-05 | |
| 7.5 | Asignar un alumno a una clase desde el formulario del alumno | El selector de clase muestra los días de cada clase | AC-0003-12 | |
| 7.6 | Ver los alumnos de una clase | Marca como deudor solo a quien tiene la cuota vencida, no a quien vence hoy | spec 0010 | |
| 7.7 | Mirar las cards de las clases | Se distinguen bien entre sí | DES-12 | |

## 8. Rutinas

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 8.1 | Desde la ficha, "Asignar rutina" | Buscador y lista de plantillas como tarjetas; la vigente dice "Actual" | AC-0007-08/09 | |
| 8.2 | Buscar un nombre que no existe | Mensaje de "sin coincidencias" | spec 0007 §B.8 | |
| 8.3 | Asignar una plantilla de varios días | Pide la agenda semanal; sin agenda completa, el motivo se ve | H-0007-1-01, H-0007-2-04 | |
| 8.4 | "Asignar y cargar otra" | Asigna, limpia la elección y el modal sigue abierto | AC-0007-12 | |
| 8.5 | Asignar y cerrar | El encabezado de la ficha muestra la rutina nueva sin recargar | H-0007-2-02 | |
| 8.6 | Modal a 375px | Hoja inferior con el pie fijo; "Asignar y cargar otra" como botón de texto | DES-14 | |
| 8.7 | ESC con el modal abierto | Se cierra | DES-13 | |
| 8.8 | Crear una rutina nueva | Es un wizard por pasos, no un modal con scroll | DES-10 | |
| 8.9 | "Marcar sesión hecha" | El texto entra en el botón | BUG-14 | |
| 8.10 | Ejercicios al armar la rutina | Agrupados por grupo muscular | BUG-13 | |

## 9. Fechas y hora (specs 0008 y 0010)

Los tests cubren el caso de las 21:00 a las 24:00 con un reloj fijo. En la app solo se puede ver a esa hora real.

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 9.1 | Cualquier formulario con fecha por defecto (pago, registro físico, agua) | Muestra la fecha de hoy | spec 0008, spec 0010 | |
| 9.2 | **Solo si la sesión pasa de las 21:00:** repetir 6.4, 2.2 y 4.7 | Mismo resultado que antes de las 21 | spec 0010 | |

---

## 10. Diseño del Sprint 2 (no bloquea esta sesión)

| # | Paso | Esperado | Origen | Resultado |
|:---:|:---|:---|:---:|:---:|
| 10.1 | Inputs de todos los formularios | Fondo blanco y texto legible | DES-01 | |
| 10.2 | Layout en desktop ancho | Ocupa todo el ancho | DES-02 | |
| 10.3 | Toasts | Centrados | DES-03 | |
| 10.4 | Contraste de textos grises | Se leen bien | DES-04 | |
| 10.5 | Borrar algo (un registro físico) | Pide confirmación con un modal | DES-05 | |
| 10.6 | Una vista que falla o no tiene datos | Muestra un estado vacío o de error, no una pantalla en blanco | DES-06 | |
| 10.7 | Todas las páginas a 375px | Sin scroll horizontal de la página | — | |

---

## Cierre

| Severidad | Cantidad | IDs |
|:---|:---:|:---|
| 🔴 Crítico | | |
| 🟠 Experiencia | | |
| 🎨 Diseño | | |

- [ ] **Cero críticos:** marcar la tarea "QA Sesión 02" como ✅ en el [doc del Sprint 1](../sprints/06-09-2026-sprint-1-refactor-core-admin.md) y tildar el hito en [`ROADMAP.md`](../ROADMAP.md).
- [ ] **Hay críticos:** cada uno pasa a una spec nueva en `specs/` antes del cierre del 04/10.
- [ ] Los de experiencia y diseño quedan anotados para la QA Sesión 03 (17/10).
