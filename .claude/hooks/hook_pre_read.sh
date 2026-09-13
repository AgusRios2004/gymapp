#!/usr/bin/env bash
# hook_pre_read.sh — la barrera de I/O. Se dispara ANTES de cada Read y Bash.
#
# Bloquea las dos formas de meter un archivo entero en el contexto del modelo
# caro, y redirige a la vía barata:
#
#   Read sin offset/limit sobre un archivo grande  -> bloqueado
#   cat/head/tail/less/more sobre un archivo grande -> bloqueado
#   Read con offset/limit                           -> permitido siempre
#   pipes con grep / rg                             -> permitidos siempre
#
# Por qué un hook y no una línea en AGENTS.md: una instrucción en lenguaje
# natural es consultiva. A medida que la sesión avanza y el contexto se
# satura, el agente la desestima y vuelve a leer archivos enteros. Una
# instrucción que se puede ignorar no es una compuerta.
#
# El mensaje de bloqueo nombra el script de delegación. Eso es degradación
# elegante: aunque el agente nunca haya leído la skill `delegar`, el bloqueo
# le impide gastar y lo reorienta en el acto.

set -uo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CONFIG="${HARNESS_CONFIG:-harness.config.yml}"

# Sin harness instalado, el hook no opina.
[ -f "$RAIZ/$CONFIG" ] || exit 0

cfg() {
  python3 "$AQUI/harness_config.py" "$1" --root "$RAIZ" --config "$CONFIG" \
    --default "${2-}" 2>/dev/null
}

HABILITADO="$(cfg delegacion.enabled true)"
case "$HABILITADO" in
  true|True|1|yes) ;;
  *) exit 0 ;;
esac

MAX_LINEAS="$(cfg delegacion.max_read_lines 350)"
ENTRADA="$(cat)"

campo() {
  printf '%s' "$ENTRADA" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
nodo = d
for paso in '$1'.split('.'):
    if not isinstance(nodo, dict):
        sys.exit(0)
    nodo = nodo.get(paso)
    if nodo is None:
        sys.exit(0)
print(nodo if not isinstance(nodo, (dict, list)) else '')
" 2>/dev/null
}

lineas_de() {
  [ -f "$1" ] || { echo 0; return; }
  wc -l < "$1" 2>/dev/null | tr -d ' ' || echo 0
}

denegar() {
  # PreToolUse: el JSON define la decisión, el exit 2 bloquea.
  local motivo="$1"
  python3 -c "
import json, sys
print(json.dumps({
  'hookSpecificOutput': {
    'hookEventName': 'PreToolUse',
    'permissionDecision': 'deny',
    'permissionDecisionReason': sys.argv[1],
  }
}))" "$motivo"
  printf '%s\n' "$motivo" >&2
  exit 2
}

MENSAJE_COMUN="Opciones, de más barata a más cara:

1. Si buscás algo puntual:  grep -n 'patron' ARCHIVO
2. Si ya sabés dónde mirar: Read con offset y limit sobre ese bloque
3. Si necesitás entender varios archivos a la vez:
     python3 .harness/scripts/worker.py read \\
       --question 'tu pregunta concreta' --paths ARCHIVO [ARCHIVO...]

Si vas a EDITAR este archivo, usá la opción 2 sobre el bloque que vas a tocar.
No delegues: el resumen del worker no conserva los números de línea y el
parche termina en el lugar equivocado."

TOOL="$(campo tool_name)"

# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

if [ "$TOOL" = "Read" ]; then
  ARCHIVO="$(campo tool_input.file_path)"
  [ -n "$ARCHIVO" ] || exit 0
  [ -f "$ARCHIVO" ] || exit 0

  # Lectura focalizada: siempre pasa. Es la vía correcta y hay que premiarla.
  OFFSET="$(campo tool_input.offset)"
  LIMIT="$(campo tool_input.limit)"
  if [ -n "$OFFSET" ] || [ -n "$LIMIT" ]; then
    exit 0
  fi

  N="$(lineas_de "$ARCHIVO")"
  if [ "$N" -gt "$MAX_LINEAS" ] 2>/dev/null; then
    denegar "Bloqueado: $ARCHIVO tiene $N líneas (el límite es $MAX_LINEAS).

Leerlo entero mete ~$((N * 12)) tokens en el contexto y se te cobran de nuevo
en cada turno posterior de esta sesión.

$MENSAJE_COMUN"
  fi
  exit 0
fi

# ---------------------------------------------------------------------------
# Bash — la vía de escape hacia la consola
# ---------------------------------------------------------------------------

if [ "$TOOL" = "Bash" ]; then
  COMANDO="$(campo tool_input.command)"
  [ -n "$COMANDO" ] || exit 0

  # Un pipe analítico es lo que queremos que haga: filtra en vez de volcar.
  case "$COMANDO" in
    *\|*grep*|*\|*rg*|grep\ *|rg\ *|*\|*awk*|*\|*sed*|*\|*wc*) exit 0 ;;
  esac

  # ¿Es un volcado de archivo?
  case "$COMANDO" in
    cat\ *|head\ *|tail\ *|less\ *|more\ *|bat\ *) ;;
    *) exit 0 ;;
  esac

  # head/tail con -n acotado ya son lecturas focalizadas.
  case "$COMANDO" in
    head\ -n\ *|tail\ -n\ *|head\ -[0-9]*|tail\ -[0-9]*) exit 0 ;;
  esac

  # Buscar el archivo más grande entre los argumentos que existen.
  PEOR=""
  PEOR_N=0
  for token in $COMANDO; do
    case "$token" in
      -*|cat|head|tail|less|more|bat) continue ;;
    esac
    ruta="$token"
    [ -f "$ruta" ] || ruta="$RAIZ/$token"
    [ -f "$ruta" ] || continue
    n="$(lineas_de "$ruta")"
    if [ "$n" -gt "$PEOR_N" ] 2>/dev/null; then
      PEOR_N="$n"
      PEOR="$token"
    fi
  done

  if [ -n "$PEOR" ] && [ "$PEOR_N" -gt "$MAX_LINEAS" ] 2>/dev/null; then
    denegar "Bloqueado: '$COMANDO' vuelca $PEOR entero ($PEOR_N líneas, el límite es $MAX_LINEAS).

Sacar el archivo por la consola cuesta lo mismo que leerlo con Read: termina
igual en el contexto.

$MENSAJE_COMUN"
  fi
fi

exit 0
