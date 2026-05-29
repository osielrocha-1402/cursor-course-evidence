# Revisión Técnica — `ticket-service.js`

# Descripción General

El archivo implementa un sistema simple de tickets en memoria utilizando JavaScript y Node.js.

Las funcionalidades principales son:

* Crear tickets.
* Obtener tickets.
* Actualizar estados.

El código está dividido en helpers, validaciones y funciones públicas, lo cual mejora bastante la organización y legibilidad.

---

# Validaciones

## ¿Qué pasa si el título viene vacío?

El sistema sí lo controla correctamente.

La función:

```js id="p4i73q"
validateRequiredText(value, fieldName)
```

valida que:

* El valor sea string.
* Después de aplicar `trim()`, no quede vacío.

Ejemplo inválido:

```js id="ovz0v4"
title: ""
title: "   "
```

Resultado:

```js id="jlwmpt"
{
  success: false,
  message: "Ticket title is required"
}
```

---

## ¿Qué pasa si viene `undefined`?

También está controlado.

Si `title`, `description` o `status` vienen como `undefined`, la validación falla porque:

```js id="trw3fs"
typeof value !== "string"
```

retorna `true`.

---

## ¿Hay `trim()`?

Sí.

La función:

```js id="dujlwm"
normalizeText(value)
```

usa:

```js id="94n6a5"
value.trim()
```

Esto evita problemas con espacios extras al inicio o final.

También se utiliza para:

* títulos,
* descripciones,
* estados.

---

## ¿Las prioridades inválidas se controlan?

Sí.

La validación ocurre en:

```js id="twjq38"
validateTicketPriority(priority)
```

y únicamente permite:

```js id="u4vyoj"
["baja", "media", "alta"]
```

Ejemplo inválido:

```js id="7m4y63"
priority: "urgente"
```

Resultado:

```js id="y9vg7w"
"Ticket priority must be one of: baja, media, alta"
```

---

# Duplicados

## ¿Se comparan mayúsculas y minúsculas?

Sí.

La función:

```js id="xk6o8m"
normalizeTitle(title)
```

usa:

```js id="1pvfcs"
toLowerCase()
```

Por lo tanto:

```txt id="0hmx4u"
"Error Login"
"error login"
```

se consideran iguales.

---

## ¿Hay control de espacios extras?

Sí.

También se aplica `trim()` antes de comparar títulos.

Ejemplo:

```txt id="okh4h7"
" Error Login "
"error login"
```

se consideran duplicados.

---

## ¿La validación de duplicados puede fallar?

En general funciona bien, pero existen posibles problemas:

### IDs generados con `tickets.length + 1`

Si en el futuro se eliminan tickets, podrían repetirse IDs.

Ejemplo:

```txt id="b2md05"
Ticket 1 eliminado
Nuevo ticket obtiene id 1 nuevamente
```

---

### No existe persistencia

Como todo está en memoria:

* al reiniciar Node.js,
* todos los tickets desaparecen,
* incluyendo la validación de duplicados previa.

---

# Estados

## ¿Se valida el nuevo estado?

Sí, parcialmente.

La función:

```js id="k4q95j"
validateTicketStatus(status)
```

solo verifica que:

* sea string,
* no esté vacío.

---

## ¿Acepta cualquier string?

Sí.

Ejemplos válidos actualmente:

```js id="8s6xl7"
"cerrado"
"en proceso"
"finalizado"
"abc"
```

Esto puede ser flexible, pero también riesgoso.

---

## ¿Puede quedar inconsistente?

Sí.

Como no existe una lista oficial de estados válidos, podrían aparecer estados distintos para el mismo concepto:

```txt id="x4eq7o"
"cerrado"
"Cerrado"
"close"
"finalizado"
```

Esto puede generar inconsistencias en reportes o filtros.

---

# Estructura

## ¿Las funciones hacen demasiadas cosas?

En general no.

El código está bastante modularizado:

* validaciones separadas,
* helpers reutilizables,
* funciones pequeñas.

Eso es positivo.

---

## ¿Hay lógica repetida?

Muy poca.

El uso de:

```js id="5ws8hm"
validateRequiredText()
```

evita repetir validaciones similares.

También:

```js id="6cz7r5"
createSuccessResponse()
createErrorResponse()
```

mantienen consistencia.

---

## ¿Los nombres son claros?

Sí.

Los nombres describen correctamente su responsabilidad:

```js id="1bj3gb"
findTicketById
validateTicketPriority
normalizeTicketData
createTicketRecord
```

La legibilidad general es buena.

---

# Manejo De Errores

## ¿Los mensajes son útiles?

Sí.

Los mensajes son claros y específicos.

Ejemplos:

```txt id="1y6r9f"
"Ticket not found"
"Ticket title already exists"
"Ticket title is required"
```

Eso facilita debugging y uso del API.

---

## ¿Se manejan edge cases?

Se manejan varios correctamente:

* valores vacíos,
* strings inválidos,
* prioridades incorrectas,
* objetos inválidos,
* duplicados.

---

## ¿Hay validaciones faltantes?

Sí, algunas posibles mejoras serían:

### Limitar longitud de textos

Actualmente podría enviarse:

```js id="k0px5l"
title: "a".repeat(100000)
```

---

### Validar tipos estrictamente

`priority` requiere coincidencia exacta:

```js id="v9azok"
"Alta"
```

es inválido aunque conceptualmente sea correcto.

Podría normalizarse automáticamente.

---

### Definir estados válidos

Sería recomendable tener algo como:

```js id="ql7v5s"
VALID_STATUSES = ["abierto", "en progreso", "cerrado"]
```

---

### Evitar IDs duplicados

Actualmente:

```js id="f23xk0"
id: tickets.length + 1
```

no es completamente seguro.

Podría usarse:

* UUID,
* timestamp,
* contador incremental independiente.

---

# Conclusión

El código está bien estructurado para un ejercicio o proyecto pequeño.

Puntos fuertes:

* buena modularidad,
* funciones pequeñas,
* validaciones claras,
* manejo consistente de errores,
* normalización de datos.

Principales debilidades:

* almacenamiento solo en memoria,
* IDs potencialmente duplicados,
* estados demasiado flexibles,
* falta de persistencia,
* ausencia de límites y validaciones más estrictas.

En general, el código demuestra buenas prácticas básicas y una organización superior al promedio para un servicio simple en Node.js.

# Validaciones Faltantes En `findTicketById`

La función:

```js id="r1n4xj"
function findTicketById(ticketId) {
  return tickets.find((ticket) => ticket.id === ticketId);
}
```

no valida el tipo ni el contenido de `ticketId`.

Actualmente, cualquier valor puede llegar al método:

```js id="e9yb8n"
findTicketById(undefined)
findTicketById(null)
findTicketById({})
findTicketById([])
findTicketById("1")
```

---

# ¿Qué ocurre actualmente?

La mayoría de los casos no lanzan error porque:

```js id="a0v4u1"
Array.prototype.find()
```

simplemente retorna:

```js id="d1s7pl"
undefined
```

cuando no encuentra coincidencias.

Entonces el flujo termina devolviendo:

```js id="m2n0g6"
{
  success: false,
  message: "Ticket not found"
}
```

---

# ¿Por qué sigue siendo una debilidad?

Aunque no rompa el sistema, existe un problema de validación y diseño:

* El método acepta datos inválidos silenciosamente.
* No diferencia entre:

  * ticket inexistente,
  * ID inválido,
  * tipo incorrecto.

Ejemplo:

```js id="n5q4to"
updateTicketStatus({}, "cerrado")
```

termina respondiendo:

```txt id="v4m9cw"
"Ticket not found"
```

cuando el verdadero problema es que el ID es inválido.

---

# Mejora Recomendada

Sería mejor validar explícitamente el ID antes de buscar:

```js id="g7t2kl"
function validateTicketId(ticketId) {
  if (!Number.isInteger(ticketId) || ticketId <= 0) {
    return "Ticket id must be a positive integer";
  }

  return null;
}
```

Y usarlo en:

```js id="b4k8yf"
updateTicketStatus()
```

---

# Otros Métodos Que Podrían Mejorarse

# `normalizeText`

Actualmente:

```js id="x3d7jr"
function normalizeText(value) {
  return value.trim();
}
```

asume que `value` siempre es string.

Si alguien llama directamente:

```js id="u7p2nc"
normalizeText(undefined)
```

ocurrirá:

```txt id="c9h5zw"
TypeError: Cannot read properties of undefined (reading 'trim')
```

Aunque hoy está protegido indirectamente por validaciones previas, el helper no es completamente seguro.

---

# Mejora Recomendada

```js id="q6m1fo"
function normalizeText(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}
```

---

# `createTicketRecord`

Actualmente:

```js id="j8v3lx"
id: tickets.length + 1
```

puede generar IDs repetidos si en el futuro se implementa eliminación de tickets.

---

# Mejora Recomendada

Usar:

* UUID,
* contador incremental separado,
* timestamps,
* `crypto.randomUUID()`.

---

# `validateTicketPriority`

Actualmente exige coincidencia exacta:

```js id="t1r6vw"
"alta"
```

pero rechaza:

```js id="o2f9mu"
"Alta"
"ALTA"
```

Esto puede afectar experiencia de usuario.

---

# Mejora Recomendada

Normalizar automáticamente:

```js id="s5k4yr"
priority.toLowerCase().trim()
```

antes de validar.

---

# `updateTicketStatus`

Actualmente acepta cualquier string:

```js id="i9c8ea"
"abc"
"terminado123"
"hola"
```

Esto puede generar inconsistencias.

---

# Mejora Recomendada

Definir estados válidos:

```js id="w0q3nm"
const VALID_STATUSES = [
  "abierto",
  "en progreso",
  "cerrado"
];
```

y validar contra esa lista.

---

# `getTickets`

Actualmente devuelve una copia superficial:

```js id="h7n2xp"
tickets.map(cloneTicket)
```

Eso funciona bien ahora porque los tickets contienen solo primitivas.

Pero si en el futuro hubiera objetos anidados:

```js id="z6b4ku"
{
  metadata: {}
}
```

la clonación superficial podría permitir modificaciones accidentales.

---

# Mejora Recomendada

Usar:

```js id="l3v9dt"
structuredClone(ticket)
```

o librerías de deep clone si el modelo crece.

---

# Conclusión Adicional

El código está bien protegido para los flujos normales de uso, pero varios helpers dependen demasiado de que otros métodos validen antes.

Eso funciona en proyectos pequeños, pero en sistemas más grandes puede provocar:

* errores silenciosos,
* mensajes incorrectos,
* debugging más difícil,
* comportamiento inconsistente.

Una mejora importante sería hacer que cada función crítica sea más defensiva y valide sus propios parámetros.
