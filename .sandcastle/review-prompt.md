# TAREA

Revisar los cambios de la rama `{{BRANCH}}` contra la spec {{SPEC_ID}}.

**No modificás nada.** No editás archivos, no commiteás, no arreglás lo que
encuentres. Tu única salida es el JSON del final.

Un agente que edita no puede ser el que verifica: si arreglás lo que ves, nadie
revisa tu arreglo.

# QUÉ SE PROMETIÓ

<spec>

!`cat specs/{{SPEC_ID}}-*.md 2>/dev/null | head -200`

</spec>

# QUÉ SE HIZO

<diff>

!`git diff {{TARGET_BRANCH}}...{{BRANCH}}`

</diff>

<commits>

!`git log {{TARGET_BRANCH}}..{{BRANCH}} --format="%h %s"`

</commits>

<verificacion>

{{VERIFY_RESULT}}

</verificacion>

# QUÉ BUSCAR, EN ESTE ORDEN

1. **Criterios incumplidos.** Para cada AC-ID de la spec: ¿el código realmente
   hace lo que promete, o solo pasa el test? Un test que verifica lo que el
   código hace en vez de lo que la spec pide es el hallazgo más valioso que podés
   encontrar acá.
2. **Casos de borde de la spec que nadie cubrió.** La sección de casos de borde
   está escrita: chequeá uno por uno.
3. **Bugs con escenario concreto.** Input puntual → salida incorrecta. Si no
   podés escribir el input, no es un hallazgo.
4. **Seguridad.** Secretos en el código, inyección, datos sin validar cruzando
   una frontera.
5. **Alcance.** ¿El diff hace algo que la spec no pedía? Eso es un hallazgo.

# QUÉ NO ES UN HALLAZGO

Preferencias de estilo, nombres que te gustan menos, "esto se podría abstraer",
"faltaría un comentario". Nada de eso entra. Si el lint pasa, el estilo está bien.

**Regla dura: todo hallazgo tiene que citar un `ac_violado` o describir un
`escenario_de_falla` concreto.** Los que no cumplen se descartan automáticamente
antes de que un humano los vea, así que escribirlos es tiempo perdido.

Severidad:

- `alta` — bloquea el merge: incumple un AC, rompe algo que andaba, o es un agujero de seguridad
- `media` — hay que arreglarlo, no bloquea
- `baja` — vale la pena mencionarlo

Si el código cumple la spec, devolvé la lista vacía. **Una revisión sin hallazgos
es un resultado válido y frecuente.** No inventes observaciones para justificar la
corrida.

# SALIDA

Un objeto JSON dentro de etiquetas `<revision>`:

<revision>
{
  "spec": "{{SPEC_ID}}",
  "hallazgos": [
    {
      "archivo": "src/modulo/archivo.py",
      "linea": 42,
      "severidad": "alta",
      "ac_violado": "AC-{{SPEC_ID}}-03",
      "escenario_de_falla": "con la API caída, el draft se guarda como confirmed en vez de pending",
      "afirmacion": "El manejo del error no distingue timeout de respuesta inválida."
    }
  ]
}
</revision>

`ac_violado` y `escenario_de_falla` aceptan `null`, pero **no los dos a la vez**.
Emití siempre las etiquetas, aunque `hallazgos` esté vacío.
