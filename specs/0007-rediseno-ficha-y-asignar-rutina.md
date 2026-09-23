---
id: 0007
titulo: Rediseño del encabezado de la ficha del alumno y del modal "Asignar rutina"
estado: aprobada              # draft | propuesta | aprobada | implementada | archivada
autor_humano: Agustín
fecha: 22/09/2026
adrs_relacionados: [ADR-0001, ADR-0002, ADR-0009]
---

## Objetivo

Llevar al código el rediseño aprobado por el usuario el 22/09/2026 para dos pantallas que se rompen en mobile:

- **Ficha del alumno** (`ClientDetailPage`): el botón "volver" ocupa media fila y aprieta el nombre (en mayúsculas, partido en dos renglones) y los datos al costado. Tiene que quedar el nombre arriba y los datos abajo.
- **Modal "Asignar rutina"** (`AssignRoutineModal`, se abre desde la lista de alumnos y desde la ficha): en mobile, el botón "Confirmar y cerrar" queda fuera del modal. En desktop, "Guardar y agregar otra" se parte en tres renglones.

**Mockup aprobado** (fuente de verdad visual): [canvas "GymApp — Ficha de alumno y asignar rutina"](https://claude.ai/artifact/HXvma78PG1ePfWCgQL1FRz). Tiene 4 artboards: la ficha en mobile y en desktop, y el modal en mobile y en desktop. Es privado: el agente que implemente no puede abrirlo, así que **esta spec describe todo lo necesario sin depender del link**.

Es trabajo de Capa 1 y se registra como D-01/D-02 del [Sprint 3](../docs/sprints/16-09-2026-sprint-3-mobile-frontend.md).

## Restricciones

- **Solo frontend.** No cambia ningún endpoint, DTO ni dato del backend.
- Light mode y marca emerald ([ADR-0001](../docs/adr/0001-color-de-marca-emerald.md), [ADR-0002](../docs/adr/0002-tema-visual-light-mode.md)); estándar mobile de [ADR-0009](../docs/adr/0009-estandar-mobile.md): targets ≥44px y sin scroll horizontal de página.
- **Los botones usan el `Button` compartido tal como está**, con su verde actual (`emerald-600`). El mockup muestra un verde un tono más oscuro (`emerald-700`) por contraste. Ese cambio queda **fuera de esta spec** (ver "Fuera de alcance").
- Todo texto visible en español.
- `AssignRoutineModal` se usa en `ClientsPage` y en `ClientDetailPage`. El cambio tiene que funcionar igual en los dos lugares, sin cambiar sus props.
- Tipografías: `font-display` (Outfit) para títulos, `font-sans` (Inter) para el resto, las mismas del proyecto.

## Comportamiento esperado

### A. Encabezado de la ficha (`ClientDetailPage`)

1. **Arriba de todo, un link "‹ Alumnos"** chico (texto + chevron, alto ≥44px) que lleva a `/clients`. Reemplaza al botón cuadrado de flecha. En desktop va como breadcrumb: `‹ Alumnos / {Nombre Apellido}`.
2. **Bloque de identidad:** avatar circular con las iniciales (nombre y apellido; `emerald-100` de fondo, `emerald-700` de texto) y, a su derecha, el **nombre completo en `h1`**, en *Title Case* tal como está cargado (sin `uppercase`), `font-display`, extrabold. Debajo del nombre, dos etiquetas:
   - Estado: **"Activo"** (verde, con un punto) si `client.active`, **"Inactivo"** (rose) si no.
   - Cuota: **"Cuota al día"** (con tilde verde) si `!client.isDebtor`, **"Cuota vencida"** (rose) si `client.isDebtor`.
3. **Datos debajo, nunca al costado del nombre:** una lista de definición (`dl`) con **DNI**, **Teléfono** (`-` si no tiene) y **Rutina actual** (nombre de la rutina activa del alumno, o "Sin rutina asignada"). En desktop suma **Último pago** (`$` + monto del pago más reciente, o `-`), que ya se consulta para la pestaña General. En mobile es una grilla de 2 columnas, con "Rutina actual" a lo ancho. En desktop es una fila horizontal.
4. **Botón "Asignar rutina"** (primario, con el ícono de pesa): en mobile va a lo ancho, debajo de los datos; en desktop, a la derecha del bloque de identidad. Abre el mismo modal que hoy.
5. **Pestañas:** una fila de pestañas subrayadas (la activa en `emerald-700`, con un borde inferior de 2px; las otras en `slate-500`), sin la caja con fondo de hoy. En desktop quedan pegadas debajo del encabezado, dentro de la misma card. En mobile hacen scroll horizontal **dentro de la fila** (no de la página), con un difuminado a la derecha que avisa que hay más. Son las mismas 7 pestañas de hoy, con el mismo comportamiento. Mantienen los íconos en desktop y los pierden en mobile.
6. **Métricas del widget de objetivo** (`RecompositionWidget`): el valor principal ("1.78 m", "80 kg", "20%", "30%") nunca se parte en dos renglones. La meta va en una línea aparte, debajo ("Meta 80 kg"). En mobile, grilla de 2×2.

### B. Modal "Asignar rutina" (`AssignRoutineModal`)

7. **Encabezado:** título "Asignar rutina" y la línea "Para **{Nombre Apellido}**". En desktop suma "· rutina actual: {nombre}" cuando el alumno tiene una. Botón de cerrar de 44×44 con `aria-label="Cerrar"`.
8. **Plantillas como lista seleccionable** en vez del desplegable:
   - Un buscador arriba ("Buscar plantilla") que filtra por nombre **u** objetivo, sin distinguir mayúsculas.
   - Debajo, una tarjeta por plantilla con el nombre (bold) y el objetivo debajo. La seleccionada lleva borde de 2px `emerald-700`, fondo `emerald-50` y un círculo con tilde. Las demás llevan borde `slate-200` y círculo vacío.
   - La rutina activa del alumno lleva una etiqueta gris **"Actual"**.
   - Accesible como grupo de opción única: `role="radiogroup"` en la lista y `role="radio"` + `aria-checked` en cada tarjeta, operable con teclado.
   - Si hay más plantillas de las que entran, la lista hace scroll dentro del modal. Sin resultados: "No hay plantillas que coincidan".
9. **Fecha de inicio** (hoy por defecto, igual que ahora) y **Notas (opcional)** con el placeholder "Indicaciones para el alumno". En desktop, la fecha va con el texto de ayuda "Pasa a ser la rutina actual del alumno." al lado. Es lo que hace hoy el backend: `assignComplexRoutine` cambia `routineActive` en el momento, sin importar la fecha.
10. **Botones con los nombres nuevos:**
    - **"Asignar rutina"** (primario) = el "Confirmar y cerrar" de hoy: asigna y cierra.
    - **"Asignar y cargar otra"** = el "Guardar y agregar otra" de hoy: asigna, deja el modal abierto y limpia plantilla y notas.
    - **"Cancelar"**, solo en desktop (en mobile se cierra con la X o con ESC).
    - Los dos de asignar quedan deshabilitados hasta que haya una plantilla elegida. Mientras se guarda, el primario dice "Asignando…" y los dos se deshabilitan.
11. **Mobile (<640px) — hoja inferior:** el modal sale desde abajo, ocupa el ancho completo, tiene esquinas superiores redondeadas y una manija decorativa arriba, y ocupa como máximo `100dvh − 64px`. El cuerpo hace scroll y **el pie queda fijo**: "Asignar rutina" a lo ancho (48px de alto) y debajo "Asignar y cargar otra" a lo ancho (44px, estilo texto).
12. **Desktop (≥640px):** modal centrado de 560px de ancho. En el pie, "Cancelar" a la izquierda y, a la derecha, "Asignar y cargar otra" (con borde) y "Asignar rutina" (primario), **en una sola línea** (`whitespace-nowrap`).
13. Se mantiene lo que ya funciona: ESC cierra (`useEscapeKey`), el scrim cierra al tocarlo, el `toast.success` al asignar, la invalidación de queries y el mensaje de error del backend en un toast. Si hay error, el modal no se cierra.

## Casos de borde

- **Alumno sin teléfono:** "Teléfono" muestra `-`.
- **Alumno sin rutina activa:** la ficha dice "Sin rutina asignada", el modal no muestra "· rutina actual…" y ninguna tarjeta lleva "Actual".
- **Nombre de una sola palabra o apellido vacío:** el avatar muestra una sola inicial y no rompe.
- **Nombre muy largo** ("Prueba Actualizada Automatizada"): el `h1` pasa a otra línea dentro de su columna y no empuja al avatar ni saca nada de pantalla.
- **Sin plantillas cargadas:** la lista muestra el `EmptyState` con "Todavía no hay plantillas de rutina" y los botones de asignar quedan deshabilitados.
- **Buscar y después borrar la búsqueda:** si la plantilla elegida se oculta al filtrar, sigue elegida y vuelve a verse al limpiar.
- **"Asignar y cargar otra" dos veces seguidas:** cada vez asigna y limpia, sin duplicar el toast ni cerrar el modal.
- **Error del backend al asignar:** toast con el `message` del backend, el modal abierto y lo cargado sin tocar.

## Criterios de aceptación

| ID | Criterio | Test |
|:---|:---|:---|
| AC-0007-01 | En `ClientDetailPage` con un alumno "Carlos Perez", el único `h1` de la página tiene el texto "Carlos Perez", y la lista de datos (DNI, Teléfono, Rutina actual) aparece después del `h1` en el orden del documento. |  |
| AC-0007-02 | El avatar del encabezado muestra "CP" para "Carlos Perez" y "A" para un alumno con nombre "Ana" y apellido vacío. |  |
| AC-0007-03 | Con `active: true` e `isDebtor: false`, el encabezado muestra "Activo" y "Cuota al día". Con `active: false` e `isDebtor: true`, muestra "Inactivo" y "Cuota vencida". |  |
| AC-0007-04 | "Rutina actual" muestra el nombre de la rutina activa del alumno, o "Sin rutina asignada" si no tiene. "Teléfono" muestra `-` si el alumno no tiene teléfono. |  |
| AC-0007-05 | Hacer clic en el link "Alumnos" del encabezado navega a `/clients`. |  |
| AC-0007-06 | Las 7 pestañas siguen presentes con sus etiquetas, y hacer clic en "Pagos" muestra el contenido de pagos y marca esa pestaña con `aria-selected="true"` (o `aria-current`). |  |
| AC-0007-07 | En `RecompositionWidget`, el elemento que muestra cada valor principal (estatura, peso, grasa y masa muscular) tiene `whitespace-nowrap`, y la meta se renderiza en un elemento separado. |  |
| AC-0007-08 | `AssignRoutineModal` abierto con 3 plantillas renderiza un `radiogroup` con 3 `radio`, cada uno con el nombre y el objetivo de su plantilla, y ninguno con `aria-checked="true"` al abrir. |  |
| AC-0007-09 | La plantilla que coincide con la rutina activa del alumno muestra la etiqueta "Actual", y las demás no. |  |
| AC-0007-10 | Escribir "grasa" en "Buscar plantilla" deja visibles solo las plantillas cuyo nombre u objetivo contiene "grasa" (sin distinguir mayúsculas). Una búsqueda sin coincidencias muestra "No hay plantillas que coincidan". |  |
| AC-0007-11 | Sin plantilla elegida, "Asignar rutina" y "Asignar y cargar otra" están deshabilitados y `assignRoutineToClient` no se llama. |  |
| AC-0007-12 | Elegir una plantilla y hacer clic en "Asignar rutina" llama a `assignRoutineToClient` una vez, con el id del alumno, el id de la plantilla, la fecha y las notas, y después llama a `onClose`. |  |
| AC-0007-13 | Elegir una plantilla, cargar notas y hacer clic en "Asignar y cargar otra" llama a `assignRoutineToClient` una vez, **no** llama a `onClose`, y deja todos los `radio` con `aria-checked="false"` y las notas vacías. |  |
| AC-0007-14 | Si `assignRoutineToClient` rechaza con un error cuyo `message` es X, se llama a `toast.error` con X, no se llama a `onClose` y la plantilla elegida sigue elegida. |  |
| AC-0007-15 | Presionar ESC o el botón con `aria-label="Cerrar"` llama a `onClose`. |  |

## Verificación visual (no es AC: la hace quien revisa, con navegador o Playwright)

Los tests de Vitest corren en jsdom, que no calcula layout. Esto se verifica mirando la app corriendo a **375px** y a **1440px** de ancho, contra el mockup:

- [ ] Ficha a 375px: nombre arriba, datos abajo, "Asignar rutina" a lo ancho, sin nada cortado ni scroll horizontal de página.
- [ ] Ficha a 1440px: nombre y datos a la izquierda, "Asignar rutina" a la derecha, pestañas subrayadas dentro de la card.
- [ ] Métricas a 375px: "1.78 m" y "80 kg" en un solo renglón.
- [ ] Modal a 375px: sale desde abajo, los dos botones se ven enteros dentro de la hoja, y el pie queda fijo al hacer scroll en la lista.
- [ ] Modal a 1440px: los tres botones del pie en una sola línea.
- [ ] Lo mismo abriendo el modal desde la lista de alumnos (`/clients`, botón "Rutina").

## Fuera de alcance

- **Oscurecer el verde de los botones a `emerald-700`** (contraste de texto blanco sobre `emerald-600`: 3,8:1, por debajo de 4,5:1). Es un cambio global del `Button` que toca la regla de marca de ADR-0001, así que va en un ADR y un cambio propios, no mezclado acá.
- **Rediseñar el resto de la ficha** (Datos personales, Resumen reciente, las otras pestañas) y el resto de las pantallas: el usuario aprobó solo estas dos piezas.
- **Mover `AssignRoutineModal` al `Modal` compartido:** hoy tiene su propio overlay. Unificarlo es un refactor sin criterio propio. Si el implementador lo hace porque le simplifica la hoja inferior, puede, pero no es requisito.
- **Mostrar días por semana o ejercicios de cada plantilla en la tarjeta:** el mockup solo muestra nombre y objetivo. Agregar más datos es otra decisión de diseño.
- **Editar los datos del alumno desde el encabezado:** hoy no existe y el mockup no lo agrega.
- **Comportamiento del backend al asignar**, observado al escribir esta spec: la fecha de inicio no demora la activación, y el `ClientRoutine` anterior queda con `active=true`. Si hace falta que la fecha programe el cambio, o que se desactive la asignación anterior, es una spec de backend aparte.

## Notas de handoff

**Qué se asumió:**
- **"Cuota al día" / "Cuota vencida" sale de `client.isDebtor`** (el mismo dato que la etiqueta "Deuda" de la lista de alumnos). Hoy el bloque "Estado cuenta" usa `client.active` para decir "Al día", que mezcla dos cosas. El mockup separa estado y cuota.
- La **rutina activa** del alumno sale de la query `['client-routines', clientId]` que la página ya hace. En el modal, se obtiene como hoy o se recibe del padre; no se agrega un endpoint.
- **Iniciales:** primera letra del nombre y primera del apellido, en mayúscula.
- Los textos nuevos ("Cuota vencida", "Sin rutina asignada", "No hay plantillas que coincidan", "Todavía no hay plantillas de rutina", "Pasa a ser la rutina actual del alumno.") los propone esta spec; el usuario los puede cambiar al aprobarla.

**Preguntas abiertas:** ninguna. La del texto de ayuda se resolvió leyendo `RoutineService.assignComplexRoutine`: la rutina asignada pasa a ser la activa en el momento, así que el texto no promete nada "desde esa fecha".

**Qué es lo más probable que salga mal:**
- **`AssignRoutineModal` tiene lógica de reseteo delicada** (compara `prevReset` con `isOpen`/`client` durante el render). Pasar del `SearchableSelect` a la lista de tarjetas es la oportunidad más probable de romper "Asignar y cargar otra" o de que quede elegida la plantilla del alumno anterior al abrir el modal para otro. AC-0007-13 cubre lo primero. Revisar a mano lo segundo desde `/clients`, abriendo el modal para dos alumnos seguidos.
- **La hoja inferior y el teclado en mobile:** con el teclado abierto (al escribir en el buscador o en notas), una hoja con alto fijo puede tapar el pie. Por eso se pide `max-height` con `dvh` y cuerpo scrolleable, no un alto fijo en px.
- **`ClientDetailPage.tsx` tiene 528 líneas** y mezcla todas las pestañas. Tocar el encabezado sin romper el `activeTab` ni las queries que dependen de él (`enabled: activeTab === …`) requiere cuidado. AC-0007-06 lo cubre en parte.
- **No hay tests previos de `ClientDetailPage` ni de `AssignRoutineModal`.** El primer test va a tener que mockear varias queries (cliente, pagos, rutinas). Es trabajo de armado que no se ve en el diff final.
