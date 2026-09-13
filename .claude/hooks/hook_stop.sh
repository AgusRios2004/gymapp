#!/usr/bin/env bash
# hook_stop.sh — la compuerta G2, se dispara cuando el agente quiere terminar.
#
# Lo invoca el hook Stop de .claude/settings.json. Corre el gate completo:
# lint, typecheck, tests y spec_coverage. Si algo falla, exit 2 devuelve el
# error al agente y la tarea NO se cierra.
#
# Este es el archivo que hace verdadera la regla "una tarea no se cierra con el
# suite en rojo". Sin esto, esa regla es una frase en un markdown.

set -uo pipefail
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="${CLAUDE_PROJECT_DIR:-$(pwd)}"

ENTRADA="$(cat)"

# Guarda anti-bucle: si este mismo hook ya bloqueó una vez en este turno, no
# volver a bloquear. Sin esto, un test que no se puede arreglar deja al agente
# girando para siempre.
YA_ACTIVO="$(
  printf '%s' "$ENTRADA" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    print("false"); sys.exit(0)
print("true" if d.get("stop_hook_active") else "false")
' 2>/dev/null
)"
[ "$YA_ACTIVO" = "true" ] && exit 0

# Si el harness no está instalado en este repo, el hook no opina.
[ -f "$RAIZ/${HARNESS_CONFIG:-harness.config.yml}" ] || exit 0

# Alcance del gate, vía HARNESS_GATE_SCOPE.
#
# Un agente que no escribe no puede ser bloqueado por lo que no está escrito.
# El planner y el reviewer de sandcastle corren con `no-specs` porque
# spec_coverage les exige tests que, por su rol, todavía no existen (el planner
# recién está eligiendo qué specs trabajar) o no les corresponde escribir (el
# reviewer es read-only por permissionMode).
#
# Sin esto, aprobar una spec nueva deja la fase de planificación en rojo
# permanente: sus AC no tienen test por definición, el hook devuelve exit 2, y
# el planner queda sin poder cerrar. Una compuerta inalcanzable no es exigente,
# es un bug — y encima empuja al agente a seguir escribiendo prosa, que fue lo
# que rompió la extracción del <plan> el 09/09/2026.
#
# El default sigue siendo el gate completo: esto habilita una excepción
# explícita por rol, no la vuelve la norma. Ver .sandcastle/main.mts.
ARGS=()
case "${HARNESS_GATE_SCOPE:-completo}" in
  completo) ;;
  no-specs) ARGS+=(--no-specs) ;;
  *)
    echo "hook_stop: HARNESS_GATE_SCOPE='${HARNESS_GATE_SCOPE}' no se reconoce;" \
         "corriendo el gate completo." >&2
    ;;
esac

SALIDA="$(HARNESS_ROOT="$RAIZ" "$AQUI/verify.sh" ${ARGS[@]+"${ARGS[@]}"} 2>&1)"
CODIGO=$?

if [ "$CODIGO" -ne 0 ]; then
  {
    echo "La verificación del harness falló. La tarea no está terminada."
    echo
    echo "$SALIDA"
    echo
    echo "Arreglá lo que falla y volvé a intentar. Si el problema está en la"
    echo "spec y no en el código, pará y reportalo: no edites la spec para que"
    echo "el código pase."
  } >&2
  exit 2
fi

exit 0
