# TAREA

Fusionar en `{{TARGET_BRANCH}}` las ramas que pasaron la revisión.

# RAMAS

{{RAMAS}}

# SPECS QUE CUBREN

{{SPECS}}

# CÓMO

0. **No asumas que "las ramas que llegaron acá ya pasaron la revisión" es
   cierto.** El 08/09/2026 pasó una rama con 2 hallazgos `alta` reales sin que
   nada la frenara antes de esta tarea. Antes de mergear cada rama, leé su log
   (`.sandcastle/logs/*-reviewer-*.log`, la última etiqueta `<revision>`) vos
   mismo. Si hay algún hallazgo con `"severidad": "alta"`, **no la mergees**:
   dejala afuera y decí cuál es el hallazgo en tu commit final, igual que ya
   hacés cuando una rama rompe el suite.
1. Mergeá las ramas en `{{TARGET_BRANCH}}`, una por vez.
2. Si hay conflicto, resolvelo **conservando el comportamiento de las dos specs**.
   Si las dos specs se contradicen de verdad, eso no se resuelve acá: pará, dejá
   esa rama sin mergear y anotá cuál es la contradicción.
3. Después de cada merge corré la compuerta completa:

   ```
   {{VERIFY_COMMAND}}
   ```

   Si falla, revertí ese merge y seguí con las demás ramas. Una rama que rompe el
   suite no entra, aunque su revisión haya salido limpia.

4. Con todo mergeado y en verde, actualizá el frontmatter de cada spec fusionada:
   `estado: aprobada` pasa a `estado: implementada`.

   **Es el único momento del pipeline en que se toca un archivo de `specs/`**, y
   solo esa línea. Nada más del contenido de la spec se modifica.

# COMMIT

Un commit final que liste qué specs quedaron implementadas y qué ramas se
mergearon. Si alguna quedó afuera, decí cuál y por qué.

Cuando termines, emití <promise>COMPLETE</promise>.
