#!/usr/bin/env python3
"""spec_coverage.py — verifica que cada AC-ID de una spec aprobada tenga un test.

Es la compuerta que convierte una spec en contrato ejecutable: un criterio de
aceptacion que ningun test menciona no existe.

Deliberadamente tonto: busca los AC-ID como texto plano dentro de los archivos
de test. No parsea el lenguaje. Asi funciona igual en Python, Java, TypeScript
o Go, y no se puede burlar sin querer.

Uso:
    python3 spec_coverage.py                     # usa ./harness.config.yml
    python3 spec_coverage.py --config otro.yml
    python3 spec_coverage.py --root /ruta/al/repo
    python3 spec_coverage.py --json              # salida para CI

Salida:
    0  todos los AC de specs aprobadas/implementadas tienen test
    1  hay AC huerfanos, o la config esta rota

Sin dependencias externas: corre con el Python del sistema.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

DEFAULT_AC_PATTERN = r"AC-[0-9]{4}-[0-9]{2}"
DEFAULT_SPECS_DIR = "specs/"
ESTADOS_AUDITADOS = {"aprobada", "implementada"}


# El parser de config vive en harness_config.py: un solo lector para todo el
# harness, importado desde aca y consultado por verify.sh desde la CLI.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from harness_config import buscar, leer_config  # noqa: E402, I001


# ---------------------------------------------------------------------------
# Specs
# ---------------------------------------------------------------------------


def estado_de(texto: str) -> str:
    """Estado declarado en el frontmatter, en minusculas. Vacio si no hay."""
    if not texto.lstrip().startswith("---"):
        return ""
    cierre = texto.find("\n---", 3)
    frontmatter = texto[3:cierre] if cierre != -1 else texto[3:]
    match = re.search(r"^\s*estado\s*:\s*(\S+)", frontmatter, re.MULTILINE)
    return match.group(1).strip().lower() if match else ""


def recolectar_specs(dir_specs: Path, patron_ac: re.Pattern) -> tuple[dict, dict]:
    """(auditados, todos) — AC-ID -> nombre de archivo de la spec.

    auditados: solo specs en estado aprobada o implementada.
    todos: cualquier spec, en cualquier estado.
    """
    auditados: dict[str, str] = {}
    todos: dict[str, str] = {}

    if not dir_specs.is_dir():
        return auditados, todos

    for archivo in sorted(dir_specs.rglob("*.md")):
        if archivo.name.endswith(".tasks.md") or archivo.name == "README.md":
            continue
        texto = archivo.read_text(encoding="utf-8", errors="ignore")
        estado = estado_de(texto)
        # Los AC de la plantilla (spec 0000) no son criterios reales.
        ids = {i for i in patron_ac.findall(texto) if not i.startswith("AC-0000")}
        for ac in ids:
            todos.setdefault(ac, archivo.name)
            if estado in ESTADOS_AUDITADOS:
                auditados.setdefault(ac, archivo.name)

    return auditados, todos


def recolectar_tests(raiz: Path, patrones: list[str], patron_ac: re.Pattern) -> dict:
    """AC-ID -> lista de archivos de test que lo mencionan."""
    encontrados: dict[str, list[str]] = {}
    vistos: set[Path] = set()

    for patron in patrones:
        for archivo in raiz.glob(patron):
            if not archivo.is_file() or archivo in vistos:
                continue
            vistos.add(archivo)
            try:
                texto = archivo.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for ac in set(patron_ac.findall(texto)):
                encontrados.setdefault(ac, []).append(str(archivo.relative_to(raiz)))

    return encontrados


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Verifica que cada AC-ID de una spec aprobada tenga test."
    )
    parser.add_argument("--config", default="harness.config.yml")
    parser.add_argument("--root", default=".")
    parser.add_argument("--json", action="store_true", help="salida JSON para CI")
    args = parser.parse_args()

    raiz = Path(args.root).resolve()
    config = leer_config(raiz / args.config)

    dir_specs = raiz / buscar(config, "paths", "specs", default=DEFAULT_SPECS_DIR)
    patron_ac = re.compile(
        buscar(config, "spec_coverage", "ac_pattern", default=DEFAULT_AC_PATTERN)
    )
    glob_tests = buscar(config, "spec_coverage", "test_glob")

    if not glob_tests:
        # Sin glob no se puede auditar nada. Es un error de configuracion, no
        # un "todo bien": fallar fuerte es lo correcto.
        print("✗ Falta spec_coverage.test_glob en la config.", file=sys.stderr)
        print(f"  Config leída: {raiz / args.config}", file=sys.stderr)
        return 1

    patrones = [glob_tests] if isinstance(glob_tests, str) else list(glob_tests)

    auditados, todos = recolectar_specs(dir_specs, patron_ac)
    en_tests = recolectar_tests(raiz, patrones, patron_ac)

    huerfanos = sorted(ac for ac in auditados if ac not in en_tests)
    colgados = sorted(ac for ac in en_tests if ac not in todos)
    cubiertos = sorted(ac for ac in auditados if ac in en_tests)

    if args.json:
        print(
            json.dumps(
                {
                    "auditados": len(auditados),
                    "cubiertos": cubiertos,
                    "huerfanos": [{"ac": a, "spec": auditados[a]} for a in huerfanos],
                    "colgados": [{"ac": a, "tests": en_tests[a]} for a in colgados],
                    "ok": not huerfanos,
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return 1 if huerfanos else 0

    if not auditados:
        print("· No hay specs aprobadas ni implementadas. Nada que auditar.")
    else:
        print(f"· {len(cubiertos)}/{len(auditados)} criterios con test.")

    for ac in colgados:
        print(
            f"⚠ {ac} aparece en tests pero no está en ninguna spec "
            f"({', '.join(en_tests[ac])}). ¿Cambió la spec y quedó el test colgado?"
        )

    if huerfanos:
        print()
        print(f"✗ {len(huerfanos)} criterio(s) sin test:")
        for ac in huerfanos:
            print(f"    {ac}  (spec: {auditados[ac]})")
        print()
        print("  Escribí el test citando el AC-ID, o sacá el criterio de la spec.")
        return 1

    if auditados:
        print("✓ Todos los criterios de specs aprobadas tienen test.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
