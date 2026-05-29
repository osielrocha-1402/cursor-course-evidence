# Ticket Service (`ticket-service.js`)

## Descripción General

El servicio ubicado en `labs/day-03/initial-version/ticket-service.js` administra tickets en memoria utilizando el arreglo `tickets`.

Expone tres funciones principales:

* `createTicket`
* `getTickets`
* `updateTicketStatus`

---

# Estructura General

El archivo está organizado en funciones pequeñas y reutilizables:

## Constantes

Define valores reutilizables para prioridades y estado inicial:

```js
VALID_PRIORITIES = ["baja", "media", "alta"]
DEFAULT_STATUS = "abierto"
```

## Helpers

Funciones auxiliares encargadas de:

* Crear respuestas consistentes.
* Normalizar texto.
* Clonar tickets.
* Buscar tickets.

## Validaciones

Se encargan de verificar:

* La estructura de los datos.
* Campos obligatorios.
* Prioridades válidas.
* Tickets duplicados.

## API Pública

Las funciones exportadas permiten:

* Crear tickets.
* Obtener tickets.
* Actualizar estados.

---

# Validaciones

Al crear un ticket, `validateTicketData` verifica que:

* Los datos sean un objeto.
* `title` sea texto no vacío.
* `description` sea texto no vacío.
* `priority` sea válida.

Si alguna validación falla, el servicio devuelve:

```js
{
  success: false,
  message: "..."
}
```

---

# Prioridades

Las prioridades permitidas están centralizadas en:

```js
VALID_PRIORITIES = ["baja", "media", "alta"]
```

La función `validateTicketPriority` rechaza cualquier prioridad fuera de esa lista.

---

# Manejo De Duplicados

Para evitar tickets duplicados, `findTicketByTitle` normaliza el título utilizando:

```js
trim()
toLowerCase()
```

Gracias a esto:

```txt
"Error login"
" error login "
```

se consideran el mismo título.

---

# Actualización De Estados

La función:

```js
updateTicketStatus(ticketId, status)
```

realiza las siguientes acciones:

1. Busca el ticket por `id`.
2. Verifica que el nuevo estado sea texto no vacío.
3. Actualiza `ticket.status`.

Cada ticket nuevo inicia con el estado:

```txt
abierto
```

El servicio no restringe los estados posibles; únicamente exige que no estén vacíos.

---

# Manejo De Errores

El servicio no lanza excepciones para errores esperados.

En su lugar, devuelve respuestas consistentes con:

```js
{
  success: false,
  message: "..."
}
```

Ejemplos de mensajes:

```txt
"Ticket data must be an object"
"Ticket title is required"
"Ticket priority must be one of: baja, media, alta"
"Ticket title already exists"
"Ticket not found"
```

---

# Limitación Importante

Los tickets se almacenan únicamente en memoria.

Esto significa que toda la información se pierde cuando el proceso de Node.js finaliza o se reinicia.
