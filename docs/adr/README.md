# ADR — Architecture Decision Records

Acá se guarda **por qué** se tomó una decisión que podría volver a discutirse — no el backlog (eso va en `prd/`), no el día a día (eso va en `sprints/` o `notes/`).

## Regla de oro

Un ADR se escribe una vez y **no se edita** cuando la decisión queda obsoleta — se agrega uno nuevo que la reemplaza y se linkean entre sí. Esto es intencional: queremos poder reconstruir la historia de por qué se hizo algo, no solo el estado actual (para eso ya está el código y `DESIGN_SYSTEM.md`).

## Cuándo escribir uno

Cuando alguien podría preguntar "¿por qué está hecho así?" dentro de 3 meses y la respuesta no sea obvia mirando el código. Ejemplos: elegir una librería, una estructura de datos no trivial, un color de marca, una convención que afecta a todo el equipo.

No hace falta un ADR para: un bug fix, una tarea de sprint, un ajuste visual menor.

## Nomenclatura

```
NNNN-titulo-corto-en-minusculas.md
```

Numeración secuencial, nunca se reutiliza ni se reordena.

## Formato

```markdown
# NNNN — Título

**Fecha:** DD/MM/YYYY
**Estado:** Activa | Reemplazada por ADR-NNNN

## Contexto
¿Qué problema o pregunta motivó esto?

## Decisión
Qué se decidió, en una o dos frases.

## Alternativas consideradas
Qué otras opciones había y por qué no se eligieron (si las hubo).

## Consecuencias
Qué implica esta decisión hacia adelante.
```

## Índice

| ADR | Título | Estado |
|:---:|:---|:---|
| [0001](./0001-color-de-marca-emerald.md) | Color de marca: emerald, no amber | Activa |
| [0002](./0002-tema-visual-light-mode.md) | Tema visual único: light mode | Activa |
| [0003](./0003-clases-multidia-elementcollection.md) | Clases con múltiples días: `@ElementCollection` | Activa |
| [0004](./0004-capacidad-de-planificacion.md) | Capacidad de planificación: ~12,5 hs/semana, no días hábiles | Activa |
| [0005](./0005-harness-commons-y-sandcastle-spec-driven.md) | Harness de commons y Sandcastle `spec-driven` en vez del loop propio | Activa |
| [0006](./0006-partir-sprint-1-diseno-a-sprint-2.md) | Partir el Sprint 1: el diseño pasa a un Sprint 2 | Activa |
