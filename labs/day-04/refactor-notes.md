# Refactor Notes - Day 04

## Objetivo

Evaluar posibles mejoras de mantenibilidad, legibilidad y escalabilidad para el servicio de tickets sin modificar su comportamiento funcional.

---

## Refactor 1: Separación por Responsabilidades

### Situación Actual

El archivo `ticket-service.js` contiene:

* constantes
* funciones auxiliares
* validaciones
* repositorio en memoria
* lógica de negocio
* generación de respuestas

Todo dentro de un único archivo.

### Propuesta

Separar el código en módulos:

```txt
ticket-constants.js
ticket-validation.js
ticket-normalization.js
ticket-repository.js
ticket-service.js
response-utils.js
```

### Beneficios

* Reduce complejidad del archivo principal.
* Facilita pruebas unitarias específicas.
* Mejora mantenibilidad.
* Permite reemplazar el repositorio en memoria por una base de datos sin afectar la lógica de negocio.

### Decisión

Aceptado para una futura evolución del proyecto.

---

## Refactor 2: Validadores Genéricos para Valores Permitidos

### Situación Actual

Las funciones:

* validateTicketPriority()
* validateTicketStatus()

comparten una estructura muy similar.

### Propuesta

Crear un helper genérico:

```js
validateAllowedTextValue(value, fieldName, allowedValues)
```

### Beneficios

* Reduce duplicación.
* Disminuye riesgo de inconsistencias.
* Facilita agregar nuevos campos controlados.

### Decisión

Aceptado. Es uno de los refactors con mejor relación beneficio-riesgo.

---

## Refactor 3: Centralizar Reglas de Validación

### Situación Actual

Las validaciones aparecen en múltiples capas:

* validateTicketData()
* createTicketRecord()
* ticketRepository.add()

### Propuesta

Centralizar reglas comunes de:

* title
* description
* priority
* status

en una única fuente de verdad.

### Beneficios

* Evita inconsistencias.
* Reduce mantenimiento.
* Facilita evolución futura.

### Decisión

Aceptado.

---

## Refactor 4: Crear una Fábrica de Servicios

### Situación Actual

El estado se mantiene mediante variables globales:

```js
const tickets = [];
let nextTicketId = 1;
```

### Propuesta

Crear una función:

```js
createTicketService()
```

que genere instancias independientes.

### Beneficios

* Facilita pruebas unitarias.
* Elimina dependencia de require.cache.
* Permite múltiples instancias.
* Prepara el servicio para persistencia futura.

### Decisión

Aceptado para futuras iteraciones.

---

## Refactor 5: Evitar Doble Búsqueda al Actualizar Estado

### Situación Actual

updateTicketStatus realiza dos búsquedas:

1. Verificación de existencia.
2. Actualización posterior.

### Propuesta

Modificar updateStatus para retornar un resultado más completo.

Ejemplo:

```js
{
  error,
  ticket
}
```

### Beneficios

* Reduce operaciones duplicadas.
* Mejora claridad del flujo.
* Facilita manejo de errores.

### Decisión

Aceptado.

---

## Refactor 6: Clonado Explícito del Modelo Ticket

### Situación Actual

El sistema utiliza:

* cloneValue()
* clonePlainValue()
* cloneTicket()
* freezeTicket()

### Propuesta

Implementar:

```js
cloneTicketRecord(ticket)
```

copiando únicamente campos conocidos.

### Beneficios

* Mayor legibilidad.
* Menor complejidad.
* Evita copiar propiedades inesperadas.

### Decisión

Aceptado.

---

## Refactor 7: Centralizar Mensajes de Error

### Situación Actual

Los códigos están centralizados, pero los mensajes se encuentran distribuidos.

### Propuesta

Crear constantes o helpers reutilizables.

Ejemplo:

```js
createAllowedValuesMessage(field, values)
```

### Beneficios

* Consistencia.
* Menor duplicación.
* Facilita internacionalización futura.

### Decisión

Aceptado.

---

## Priorización Recomendada

### Bajo Riesgo

1. Centralizar validadores de valores permitidos.
2. Centralizar mensajes de error.
3. Reducir doble búsqueda en actualización.

### Riesgo Medio

4. Extraer validaciones y repositorio a módulos independientes.

### Riesgo Alto

5. Introducir fábrica de servicios.
6. Reestructurar completamente la gestión de estado.

---

## Conclusión

El servicio actual es funcional y estable después de la corrección aplicada durante el ejercicio de debugging.

Los principales beneficios de refactor se encuentran en:

* reducción de duplicación
* centralización de validaciones
* aislamiento del estado interno
* mejora de mantenibilidad

No se considera necesario aplicar estos cambios inmediatamente para cumplir los objetivos del laboratorio, pero representan una evolución natural si el servicio creciera o requiriera persistencia real.
