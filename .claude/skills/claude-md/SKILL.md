---
name: claude-md
description: >
  Recordatorio a demanda de las pautas de conducta al escribir código en gymapp: pensar antes de
  codear, simplicidad primero, cambios quirúrgicos y ejecución dirigida por objetivos. Disparar
  cuando el usuario diga "/claude-md", "seguí las guidelines", "aplicá CLAUDE.md" o pida revisar si
  un cambio respeta esas pautas.
---

# CLAUDE.md Guidelines

Estas pautas reducen los errores típicos de un LLM escribiendo código. Seguilas en cada tarea.

> **Fuente de verdad:** `CLAUDE.md` en la raíz del repo, secciones 1-4. Este documento es la versión
> a demanda de esas mismas reglas. Si divergen, gana `CLAUDE.md`.
> Las convenciones de cada punta están en `gymapp-back/CLAUDE.md` y `gym-frontend/CLAUDE.md`.

## 1. Think Before Coding

**No asumas. No escondas la confusión. Explicitá los tradeoffs.**

Antes de implementar:
- Declará tus supuestos. Si hay incertidumbre, preguntá.
- Si hay varias interpretaciones, presentalas — no elijas en silencio.
- Si existe un enfoque más simple, decilo. Discutí cuando corresponda.
- Si algo no está claro, pará. Nombrá qué te confunde. Preguntá.

## 2. Simplicity First

**El mínimo código que resuelve el problema. Nada especulativo.**
- Ninguna funcionalidad más allá de lo pedido.
- Ninguna abstracción para código de un solo uso.
- Ninguna "flexibilidad" ni "configurabilidad" que no se pidió.
- Ningún manejo de errores para escenarios imposibles.
- Si escribís 200 líneas y podían ser 50, reescribilo.

Preguntate: "¿un senior diría que esto está sobrecomplicado?" Si sí, simplificá.

## 3. Surgical Changes

**Tocá solo lo que tenés que tocar. Limpiá solo tu propio desorden.**

Al editar código existente:
- No "mejores" código, comentarios ni formato adyacente.
- No refactorices lo que no está roto.
- Respetá el estilo existente, aunque vos lo harías distinto.
- Si ves código muerto no relacionado, mencionalo — no lo borres.

Cuando tus cambios dejan huérfanos:
- Sacá los imports/variables/métodos que **tus** cambios dejaron sin uso.
- No borres código muerto preexistente salvo que te lo pidan.

La prueba: cada línea cambiada tiene que trazarse al pedido del usuario.

En gymapp esto tiene dos trampas concretas: el typo `succes` del envelope `WebApiResponse` y el
`GlobalExceptionHandler` que no usa ese envelope. Los dos **se ven mal y se arreglan solos en la
cabeza** — y los dos son cambios de contrato entre backend y frontend. No los toques de paso.

## 4. Goal-Driven Execution

**Definí criterios de éxito. Iterá hasta verificarlos.**

Convertí las tareas en objetivos verificables:
- "Agregar validación" → "Escribir tests de inputs inválidos y hacerlos pasar"
- "Arreglar el bug" → "Escribir un test que lo reproduzca y hacerlo pasar"
- "Refactorizar X" → "Asegurar que los tests pasan antes y después"

Para tareas de varios pasos, declará un plan breve:
```
1. [Paso] → verifica: [chequeo]
2. [Paso] → verifica: [chequeo]
3. [Paso] → verifica: [chequeo]
```

En gymapp el chequeo casi siempre es uno de estos, y va con su output pegado:
`./mvnw -q compile` · `./mvnw test` · `npm run build` · `npm run lint`.
