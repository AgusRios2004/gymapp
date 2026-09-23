# SPECS

Specs del repo con su estado:

<specs>

!`for f in specs/*.md; do case "$f" in *.tasks.md|*README.md) continue;; esac; echo "--- $f"; sed -n '1,/^---$/p' "$f" | head -20; done`

</specs>

Ramas de specs ya empezadas, con sus commits por delante de la rama base (del
más nuevo al más viejo):

<ramas-existentes>

!`for b in $(git for-each-ref --format='%(refname:short)' 'refs/heads/sandcastle/spec-*'); do echo "--- $b"; git log --format='%s' HEAD.."$b"; done`

</ramas-existentes>

Specs que esperan a un humano (no las planifiques, aunque estén aprobadas):

<pendientes>

!`ls .sandcastle/pendientes/ 2>/dev/null | grep '^spec-' || true`

</pendientes>

# TAREA

Elegí las specs en estado **`aprobada`** que todavía no están implementadas y que
se pueden trabajar **en paralelo sin pisarse**.

Una spec B está bloqueada por A si:

- B necesita código o estructura que introduce A
- B y A tocan los mismos archivos o módulos, y trabajarlas a la vez va a generar conflictos
- B depende de una decisión de API que A establece

Ignorá las specs en `draft`, `propuesta`, `implementada` o `archivada`. Una spec
en `propuesta` **no está aprobada**: no se toca aunque parezca lista.

Ignorá también las que aparecen en `<pendientes>`: una vuelta anterior no pudo
resolverlas sola y un humano las tiene que mirar.

**Una rama ya empezada no es motivo para excluir una spec**: es trabajo a
retomar. Para cada spec que elijas, poné en `fase` desde dónde sigue:

- `tests` — no tiene rama, o la rama no tiene commits
- `implement` — todos los commits de la rama empiezan con `spec-NNNN: tests`
  (el test-author terminó, el implementer no llegó a commitear)
- `review` — hay algún commit más: de implementación o de `fix`

No hace falta que aciertes siempre: el orquestador contrasta la fase con la rama
real antes de usarla. Pero una fase de más atrasada repite trabajo pago.

Si una spec aprobada no tiene su archivo `.tasks.md`, incluila igual y anotalo en
el título — el implementer va a tener que trabajar contra los criterios de
aceptación directamente.

Nombre de rama, exacto y determinista: `sandcastle/spec-NNNN`, donde NNNN es el
id de la spec. Determinista para que replanificar la misma spec reuse la rama y
no se pierda lo avanzado.

# SALIDA

Un objeto JSON dentro de etiquetas `<plan>`:

<plan>
{"specs": [{"id": "0002", "titulo": "Tarjeta de confirmación", "rama": "sandcastle/spec-0002", "fase": "tests"}]}
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
