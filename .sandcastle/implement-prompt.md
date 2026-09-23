# TAREA

Poner en verde los tests de la spec {{SPEC_ID}}: {{SPEC_TITULO}}.

Rama `{{BRANCH}}`. Los tests ya están escritos y fallando; tu trabajo es la
implementación mínima que los haga pasar.

# LA SPEC

<spec>

!`cat specs/{{SPEC_ID}}-*.md 2>/dev/null | head -200`

</spec>

<tareas>

!`cat specs/{{SPEC_ID}}-*.tasks.md 2>/dev/null | head -200`

</tareas>

# CONTEXTO

<agents-md>

!`cat AGENTS.md 2>/dev/null`

</agents-md>

Estado actual de los tests:

<tests>

{{TEST_RESULT}}

</tests>

Últimos commits:

<commits>

!`git log -n 10 --format="%h %ad %s" --date=short`

</commits>

# CÓMO

Un `AC-ID` por vez, en ciclo RGR:

1. **GREEN** — la implementación mínima que pone en verde ese test. Mínima de verdad.
2. **REPEAT** — pasás al siguiente AC-ID.
3. **REFACTOR** — recién al final, y solo dentro de lo que tocaste.

Antes de cada commit corré la compuerta completa:

```
{{VERIFY_COMMAND}}
```

Corre lint, typecheck, tests y cobertura de specs — lo mismo que va a correr el
CI. Si falla, la tarea no está terminada.

# REGLAS DURAS

- **No editás `specs/`.** Si la spec está mal, es ambigua o se contradice con el
  código, **pará y reportalo en el commit**. Cambiar el contrato para que el
  código pase es la peor falla posible acá — y ya no es silenciosa: una rama que
  toca `specs/` no llega a revisión.
- **No cambiás un test para que pase.** Si el test está mal, es un hallazgo, no
  un obstáculo. Dejalo anotado y seguí con los demás. El orquestador compara los
  tests del test-author antes y después de tu turno: si modificaste o borraste
  uno, la rama no llega a revisión. Agregar tests propios sí podés.
- **No ampliás el alcance.** Si ves un bug de paso, lo anotás; no lo arreglás.
- No tocás `.env`, secretos, ni migraciones ya aplicadas.

# COMMIT

Mensaje empezando con `spec-{{SPEC_ID}}:`, corto, con:

1. Qué quedó implementado y qué AC-IDs cubre
2. Decisiones que tomaste, si hubo alguna no obvia
3. Lo que anotaste y no tocaste
4. Bloqueantes para la próxima iteración

Cuando la spec esté completa y `{{VERIFY_COMMAND}}` pase, emití
<promise>COMPLETE</promise>.
