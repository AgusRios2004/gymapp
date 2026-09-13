# TAREA

Escribir los **tests rojos** de la spec {{SPEC_ID}}: {{SPEC_TITULO}}.

Trabajás en la rama `{{BRANCH}}`. **No escribís código de implementación.** Si al
terminar hay algo nuevo en el código de producción, fallaste.

# LA SPEC

<spec>

!`cat specs/{{SPEC_ID}}-*.md 2>/dev/null | head -200`

</spec>

<tareas>

!`cat specs/{{SPEC_ID}}-*.tasks.md 2>/dev/null | head -200`

</tareas>

# CONTEXTO

Convenciones del proyecto:

<agents-md>

!`cat AGENTS.md 2>/dev/null`

</agents-md>

Mirá los tests que ya existen y seguí su estilo: nombres, fixtures, helpers. Un
test que no se parece a los de al lado cuesta más de mantener aunque sea correcto.

# CÓMO

Un test por cada criterio de aceptación de la tabla de la spec.

**Cada test tiene que citar su `AC-ID` literalmente**, en el nombre, en un
docstring o en un comentario. No es decorativo: `spec_coverage.py` los busca como
texto plano, y un AC sin test rompe el CI.

```
AC-0002-04: con la API caída el draft queda en pending.
```

Después de escribirlos, corré `{{TEST_COMMAND}}` y **confirmá que fallan por la
razón correcta**. Un test que falla por un import roto o un nombre mal escrito no
probó nada — arreglá eso hasta que falle por la funcionalidad que todavía no
existe.

Si un criterio de la spec no se puede convertir en test, **no lo inventes**:
paralo, no escribas ese test, y dejalo anotado. Un criterio que no es verificable
es un problema de la spec, y se arregla en la spec.

# COMMIT

Un commit con los tests rojos. El mensaje arranca con `spec-{{SPEC_ID}}:` y dice
qué AC-IDs quedan cubiertos.

Cuando termines, emití <promise>COMPLETE</promise>.

# REGLAS

- No tocás `specs/`.
- No escribís implementación, ni siquiera un stub que haga pasar el test.
- No cambiás tests existentes que no son de esta spec.
