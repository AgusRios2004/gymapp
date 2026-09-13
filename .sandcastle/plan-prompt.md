# SPECS

Specs del repo con su estado:

<specs>

!`for f in specs/*.md; do case "$f" in *.tasks.md|*README.md) continue;; esac; echo "--- $f"; sed -n '1,/^---$/p' "$f" | head -20; done`

</specs>

Specs que ya tienen rama abierta (no las vuelvas a planificar):

<ramas-existentes>

!`git branch -a --list 'sandcastle/spec-*' | sed 's/^..//'`

</ramas-existentes>

# TAREA

Elegí las specs en estado **`aprobada`** que todavía no están implementadas y que
se pueden trabajar **en paralelo sin pisarse**.

Una spec B está bloqueada por A si:

- B necesita código o estructura que introduce A
- B y A tocan los mismos archivos o módulos, y trabajarlas a la vez va a generar conflictos
- B depende de una decisión de API que A establece

Ignorá las specs en `draft`, `propuesta`, `implementada` o `archivada`. Una spec
en `propuesta` **no está aprobada**: no se toca aunque parezca lista.

Si una spec aprobada no tiene su archivo `.tasks.md`, incluila igual y anotalo en
el título — el implementer va a tener que trabajar contra los criterios de
aceptación directamente.

Nombre de rama, exacto y determinista: `sandcastle/spec-NNNN`, donde NNNN es el
id de la spec. Determinista para que replanificar la misma spec reuse la rama y
no se pierda lo avanzado.

# SALIDA

Un objeto JSON dentro de etiquetas `<plan>`:

<plan>
{"specs": [{"id": "0002", "titulo": "Tarjeta de confirmación", "rama": "sandcastle/spec-0002"}]}
</plan>

Incluí solo las specs desbloqueadas. Si están todas bloqueadas, incluí únicamente
la de menos dependencias.

Emití siempre las etiquetas de plan, incluso si no hay nada para hacer —
un objeto con `specs` vacío— para que la corrida termine limpia.

**La etiqueta de apertura tiene que aparecer una sola vez en toda tu respuesta,
y el bloque va último.** No la escribas en prosa, ni entre backticks, ni para
explicar lo que vas a emitir, ni al citar este prompt. El extractor busca texto
entre la primera apertura y el cierre: si la nombrás antes, se come tu prosa
como si fuera JSON y la corrida se cae con `StructuredOutputError`. Pasó el
09/09/2026.

Si algo te bloquea y no podés cerrar, igual terminá con el bloque. Un plan
válido más una explicación **arriba** del bloque se procesa bien; una
explicación que menciona la etiqueta, no.
