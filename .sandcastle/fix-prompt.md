# TAREA

Corregir los hallazgos de la revisión de la spec {{SPEC_ID}}: {{SPEC_TITULO}}.

Rama `{{BRANCH}}`, vuelta {{RONDA}}. La implementación ya existe y pasó por un
reviewer que no puede editar: encontró lo que está abajo. Tu trabajo es
demostrar cada hallazgo con un test y después arreglarlo.

# LOS HALLAZGOS

<hallazgos>

{{HALLAZGOS}}

</hallazgos>

Cada uno trae un `id`, el `archivo` y la `linea` donde el reviewer lo vio, un
`ac_violado` y/o un `escenario_de_falla`, y la `afirmacion`.

# LA SPEC

<spec>

!`cat specs/{{SPEC_ID}}-*.md 2>/dev/null | head -200`

</spec>

# CONTEXTO

<agents-md>

!`cat AGENTS.md 2>/dev/null`

</agents-md>

Estado de la compuerta al empezar esta vuelta:

<verificacion>

{{VERIFY_RESULT}}

</verificacion>

Si la compuerta está en rojo, una vuelta anterior dejó algo roto: arreglá eso
primero, antes de cualquier hallazgo.

Commits de la rama:

<commits>

!`git log -n 20 --format="%h %s"`

</commits>

# CÓMO

Un hallazgo por vez, en este orden:

1. **RED** — escribí un test que reproduzca el `escenario_de_falla` (o que
   verifique el `ac_violado`) y **confirmá que falla por esa razón**. El test cita
   el id del hallazgo literalmente, en el nombre, un docstring o un comentario,
   y el AC si lo hay:

   ```
   H-{{SPEC_ID}}-1-01 / AC-{{SPEC_ID}}-03: editar sin email no borra el email guardado.
   ```

2. **GREEN** — el arreglo mínimo que lo pone en verde, sin romper los demás.
3. **COMMIT** — un commit por hallazgo, con el test y el arreglo juntos.

Antes de cada commit corré la compuerta completa:

```
{{VERIFY_COMMAND}}
```

**Si no podés escribir un test que falle, no toques el código.** Un hallazgo
que no se reproduce puede estar mal; arreglar a ciegas algo que no fallaba es
cambiar comportamiento sin razón. Dejalo asentado con un commit vacío:

```
git commit --allow-empty -m "spec-{{SPEC_ID}}: fix H-... no reproducible — <qué probaste y qué pasó>"
```

El reviewer lo va a leer en la próxima vuelta.

# REGLAS DURAS

- **No editás `specs/`.** Si un hallazgo muestra que la spec está mal o se
  contradice, no es un arreglo: dejalo en un commit vacío como el de arriba.
- **Solo tocás tests de los AC de los hallazgos.** Podés agregar tests nuevos, y
  corregir el test de un `ac_violado` que verificaba lo que no tenía que
  verificar. Los tests de cualquier otro AC no se tocan.
- **No cambiás un test para que pase.** El test del hallazgo tiene que fallar
  antes del arreglo y pasar después, sin editarlo en el medio.
- **No ampliás el alcance.** Solo los hallazgos de la lista. Si ves otro bug, lo
  anotás en el mensaje de un commit; no lo arreglás.
- No tocás `.env`, secretos, ni migraciones ya aplicadas.

# COMMIT

Un commit por hallazgo:

```
spec-{{SPEC_ID}}: fix H-{{SPEC_ID}}-1-01 — <qué estaba mal, en una línea>
```

Cuando todos los hallazgos tengan su commit (arreglo o no reproducible) y
`{{VERIFY_COMMAND}}` pase, emití <promise>COMPLETE</promise>.
