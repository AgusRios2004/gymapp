# 0003 — Clases con múltiples días: `@ElementCollection`

**Fecha:** 06/09/2026
**Estado:** Activa

## Contexto

`GroupClass` tenía un solo campo `dayOfWeek: String`, pero BUG-07 (Bitácora QA Sesión 01) reportó que una clase real puede dictarse varios días por semana. Había que decidir cómo modelarlo: una tabla relacional nueva (`ClassDay`) o una colección simple embebida.

## Decisión

Migrar `dayOfWeek: String` → `daysOfWeek: List<String>` usando `@ElementCollection` de JPA, no una entidad/tabla relacional separada.

## Alternativas consideradas

- Entidad relacional `ClassDay` con FK a `GroupClass` — descartada para este caso: los días de la semana no necesitan metadata propia (hora distinta por día, profesor distinto por día, etc.) hoy. Si en el futuro un día de clase necesita tener sus propios atributos, esta decisión se revisa.

## Consecuencias

- Archivos afectados: `GroupClass.java`, `GroupClassService.java`, `GroupClassController.java`, `ClassesPage.tsx` (selector de múltiples días en el FE).
- Si más adelante una clase necesita horarios distintos por día, esta decisión queda obsoleta y hay que migrar a una tabla relacional — documentarlo acá con un ADR nuevo que reemplace a este.
