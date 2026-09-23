# TAREA

Resolver el conflicto del merge de `{{BRANCH}}` (spec {{SPEC_ID}}: {{SPEC_TITULO}})
sobre la rama de integración.

El orquestador ya corrió `git merge` y quedó a mitad: hay archivos en conflicto.
Todo lo demás del merge —la compuerta, revertir si rompe, marcar la spec como
implementada, avanzar la rama base— lo hace el orquestador. Vos solo resolvés
el conflicto.

<conflicto>

{{CONFLICTO}}

</conflicto>

<archivos-en-conflicto>

!`git diff --name-only --diff-filter=U || true`

</archivos-en-conflicto>

# LA SPEC QUE ENTRA

<spec>

!`cat specs/{{SPEC_ID}}-*.md 2>/dev/null | head -200`

</spec>

# CÓMO

1. Resolvé cada conflicto **conservando el comportamiento de las dos partes**:
   lo que ya está en la integración (otras specs mergeadas en esta vuelta) y lo
   que trae `{{BRANCH}}`.
2. Si las dos partes se contradicen de verdad —cumplir una spec rompe la
   otra— **no lo resuelvas**: no commitees nada y explicá la contradicción.
   El orquestador aborta el merge y la spec queda para un humano. Elegir cuál
   de las dos specs gana no es tu decisión.
3. Corré `{{VERIFY_COMMAND}}` antes de cerrar.
4. Cerrá el merge con `git add` de los archivos resueltos y `git commit
   --no-edit`.

# REGLAS DURAS

- No tocás `specs/`.
- No borrás ni debilitás tests de ninguna de las dos partes para destrabar el
  conflicto.
- No hacés `git merge --abort`, `git reset` ni `git rebase`: si no podés
  resolver, dejá el merge como está y explicalo.

Cuando el merge esté commiteado y la compuerta pase, emití
<promise>COMPLETE</promise>.
