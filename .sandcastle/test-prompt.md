# TAREA

Escribir los **tests rojos** de la spec {{SPEC_ID}}: {{SPEC_TITULO}}.

Trabajás en la rama `{{BRANCH}}`. **No escribís código de implementación.** Si al
terminar hay algo nuevo en el código de producción, fallaste — y no es una
forma de decir: el orquestador mira el diff de la rama, y si tocaste un archivo
que no es de test, la spec no pasa al implementer.

Tu entregable es una suite **en rojo**. La compuerta que corre al cerrar solo
chequea lint: que los tests fallen es lo esperado, no algo a arreglar. El
orquestador corre la suite después y exige que falle; si tus tests pasan sin
implementación, no prueban lo que falta.

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

**Cada test lleva su `AC-ID` en el nombre**, con `_` donde el lenguaje no acepta
`-`. No es decorativo: `spec_coverage.py` lo busca, y un AC sin test rompe el CI.
Un comentario o un docstring no alcanzan: no aparecen en el reporte JUnit, que
es la evidencia de que el test corrió y pasó.

```
test_ac_0002_04_draft_queda_pending_si_la_api_cae      (Python)
void ac_0002_04_draftQuedaPendingSiLaApiCae()          (Java)
it('AC-0002-04: con la API caída el draft queda en pending')   (TS)
```

Un test por AC. Un comentario de sección arriba de varios tests no dice cuál
cubre el criterio.

Después de escribirlos, corré `{{TEST_COMMAND}}` y **confirmá que fallan por la
razón correcta**. Un test que falla por un import roto o un nombre mal escrito no
probó nada — arreglá eso hasta que falle por la funcionalidad que todavía no
existe.

Si un criterio de la spec no se puede convertir en test, **no lo inventes**:
paralo, no escribas ese test, y dejalo anotado. Un criterio que no es verificable
es un problema de la spec, y se arregla en la spec.

# COMMIT

Un commit con los tests rojos. El mensaje arranca con `spec-{{SPEC_ID}}: tests` y
dice qué AC-IDs quedan cubiertos.

El prefijo es exacto: el planner lo usa para saber, si la corrida se corta, que
esta rama tiene tests pero todavía no implementación.

Cuando termines, emití <promise>COMPLETE</promise>.

# REGLAS

- No tocás `specs/`.
- No escribís implementación, ni siquiera un stub que haga pasar el test.
- No cambiás tests existentes que no son de esta spec.
