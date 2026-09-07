---
name: equipo-implementar
description: >
  Implementa una tarea o un plan de gymapp orquestando el equipo de agentes — backend-spring o
  frontend-react para escribir el código, y revisor, verificador y verificador-migraciones para
  controlarlo. Disparar cuando el usuario diga "/equipo-implementar", "implementá esto con el
  equipo", "implementá el plan de <ruta>", "mandá los agentes" o pase la ruta de un archivo de
  `docs/plans/`. Para una tarea de un solo archivo no hace falta: implementala directo.
---

# Implementar con el equipo de agentes

Sos el orquestador. Los subagentes **no se comunican entre sí**: vos sos el canal. Invocás en orden,
transportás los contratos de salida textuales, y decidís cuándo está terminado.

**Vos no implementás.** Solo las trivialidades que no justifican un agente (un typo, un import).

## Cuándo usar el equipo y cuándo no

| Tamaño del trabajo | Qué hacer |
|---|---|
| Un archivo, un fix puntual | Implementalo directo. El equipo es overhead. |
| Una feature que toca una punta | `backend-spring` **o** `frontend-react` + revisión |
| Una feature punta a punta | Backend primero, después frontend con el contrato **real** |

## Fase 0 — Entender el trabajo y el contexto

Si te pasaron un plan (`docs/plans/...`), leelo **completo**: es la fuente de verdad por encima de
cualquier resumen del mensaje. Si te pasaron una tarea en lenguaje natural, escribí en dos o tres
líneas qué vas a construir y **mostráselo al usuario antes de lanzar agentes**: si el objetivo está
mal entendido, todo lo que sigue se hace al pedo.

De cualquiera de los dos tenés que sacar, y si falta lo preguntás:
**objetivo · alcance y fuera de alcance · criterio de aceptación · archivos que se esperan tocar.**

```bash
date +%F
git branch --show-current
git status --porcelain          # ¿hay trabajo previo sin commitear?
git rev-list --count main..origin/main   # ¿la base local está atrás? (main es la integración)
```

Leé el `CLAUDE.md` de la raíz y el de la punta que se va a tocar. Si el trabajo toca esquema
(entidad o migración), avisá desde el arranque que va a intervenir `verificador-migraciones`.

## Fase 1 — Implementar

**Un agente por punta.** Elegí por dónde vive el cambio:

| Dónde cae el trabajo | Agente |
|---|---|
| `gymapp-back/` | **backend-spring** |
| `gym-frontend/` | **frontend-react** |
| Las dos | Backend **primero**, en serie. Nunca en paralelo. |

Pasale al agente, **textual**: objetivo, criterio de aceptación, contrato de API esperado, archivos
a crear/modificar y reglas de negocio. **Copiá las secciones tal cual**: resumirlas es el teléfono
descompuesto — la precisión de los nombres reales de archivos, endpoints y campos es justamente lo
que evita que el implementador alucine una firma.

### Punta a punta: el frontend programa contra el contrato REAL

Cuando el backend termina, tomá el `### Contrato de API implementado` que devolvió `backend-spring`
—el copiado del código— y ponelo en el prompt de `frontend-react` **por encima** de lo que dijera el
plan. El backend pudo divergir; si divergió, marcáselo explícito. Este es el punto de fuga clásico
del pipeline.

Si el backend terminó en `PARCIAL` o `BLOQUEADO`, **no arranques el frontend**: avisá y frená.

### Paralelización

- Tareas de la misma punta que no comparten archivos se pueden paralelizar.
- **Nunca** dos agentes haciendo operaciones de git a la vez sobre el repo: dos escritores del mismo
  índice dejan `index.lock` huérfanos.

### 🙋 Lo que no ejecuta nadie del equipo

Aplicar migraciones, levantar docker-compose, correr seeds, pushear. Eso es del usuario, siempre.
Si un paso así **desbloquea** a los siguientes (típico: aplicar la migración antes de probar el
endpoint nuevo), ejecutá hasta ahí, **frená**, y decile al usuario el comando exacto y qué debería
ver. No sigas de largo asumiendo que ya lo corrió.

### Dudas y desvíos: preguntás vos, no los agentes

Los subagentes **no tienen canal con el usuario**. Por eso devuelven la duda en
`### Pendientes / bloqueos` con las opciones. **Vos sos el único que puede preguntar**, y tenés que
hacerlo:

- **Duda de diseño** (dos enfoques con trade-off real, un campo sin definir, una regla ambigua) →
  **preguntale al usuario ahora**, con las opciones y una recomendación. No la resuelvas por default
  ni la escondas en el reporte final.
- **Desvío del plan** (el agente hizo algo distinto, o descubrió que un paso no se puede hacer como
  estaba escrito) → **frená y decilo**. No lo absorbas "porque total funciona".
- **Cambio de alcance** (aparece trabajo que estaba fuera de alcance) → **no lo hagas.** Reportalo y
  que el usuario decida.

La regla corta: si el agente dudó, el usuario se entera.

## Fase 2 — Revisión y verificación (en paralelo)

Cuando el implementador reporta COMPLETO, lanzá a la vez —solo leen, no se pisan:

- **revisor** (obligatorio, sin excepción de tamaño) con: los archivos modificados, el contrato de
  API implementado y el criterio de aceptación.
- **verificador** (obligatorio) con: qué se implementó, el criterio de aceptación y los endpoints o
  pantallas a probar. Va a detectar solo si hay servicios levantados; si no, verifica estático y
  marca el resto como ⬜ no verificable.
- **verificador-migraciones** — **solo si el cambio toca `db/migration/` o una entidad JPA**. No es
  opcional cuando aplica: con `ddl-auto=validate`, un desajuste entidad↔tabla no rompe el build,
  rompe el arranque.

**El `revisor` no es opcional, nunca, por chico que sea el cambio.** Un verificador contesta si
funciona; un revisor contesta si lo que funciona es lo que se pidió. No son sustituibles: un build
verde y unos tests en verde conviven perfectamente con un endpoint que devuelve el dato equivocado,
un test cuyo nombre promete un caso que no ejercita, o un frontend consumiendo un campo que el
backend renombró.

## Fase 3 — Ciclo de corrección

Por cada hallazgo bloqueante (ALTA del revisor, `FALLA` del verificador, `NO APTO` de migraciones):

1. **Retomá con `SendMessage` al agente implementador que ya trabajó** — conserva su contexto, no
   lances uno nuevo. Pasale el hallazgo **textual**, con archivo:línea y escenario de fallo.
2. Cuando responda con el fix, revalidá ese punto con el verificador que corresponda.
3. **Máximo 3 ciclos.** Si no converge en 3, frená y reportá el problema completo con el error
   textual en vez de seguir iterando.

**Escalado de modelo**: si el implementador falla el mismo punto dos ciclos seguidos, o la tarea es
inusualmente compleja, lanzá un agente **nuevo** con `model` override al modelo de la sesión y
pasale el contrato de salida del anterior más los hallazgos. El modelo se fija al crear el agente:
no se cambia por `SendMessage`. Para tareas mecánicas masivas, `model: haiku`.

## Fase 4 — Cierre

1. **Documentación**: si el cambio altera cómo funciona una punta, actualizá `docs/back.md` o
   `docs/front.md`. Si hubo una decisión técnica que alguien va a querer entender en dos meses, va
   como nota en `docs/notes/YYYY-MM-DD-decision-<tema>.md`. `.md` nunca en la raíz.
2. **Hallazgos MEDIA/BAJA** que no se arreglaron: anotalos donde el usuario los vaya a ver
   (la nota del cambio o el issue), con impacto y ubicación. No los dejes solo en el chat.
3. **No commitees ni abras el PR.** Ofrecé el commit y que decida el usuario (skill `git` para
   ejecutarlo, `pr-description` para el texto del PR).

## Fase 5 — Reportar

En este orden:

1. **Resultado primero**: qué quedó implementado, contra el objetivo.
2. **Criterio de aceptación** ítem por ítem con su estado verificado.
3. **Modo de verificación** (completo o degradado) y qué quedó ⬜ no verificable y por qué.
4. **🙋 Lo que tiene que hacer el usuario**, explícito y en orden: migraciones que aplicar, servicios
   que levantar, con el comando exacto y qué debería ver.
5. **Hallazgos MEDIA/BAJA** pendientes y dónde quedaron anotados.

## Reglas del orquestador

- **Transportá secciones textuales**, no tu resumen de ellas.
- **No implementes vos.**
- **No declares éxito sin el veredicto del verificador.** Un implementador diciendo COMPLETO no es
  evidencia de que funciona.
- **Nadie del equipo escribe en la base.** Los pasos 🙋 son del usuario.
- **Rama base**: es `main`. `develop` quedó abandonada en abril de 2026; no la uses sin pedido explícito.
- Reportes honestos siempre: si no convergió, el usuario tiene que saberlo con el error textual.
