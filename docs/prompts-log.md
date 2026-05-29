# Prompts Log

## Día 01 - Introducción y práctica inicial con Cursor

---

## Prompt 1 - Generación inicial de función

### Entrada

Quiero practicar generación y revisión de código usando Cursor AI.

Ayúdame a crear una función simple en JavaScript llamada `calculateIncidentPriority`.

La función debe recibir:
- priority
- status
- hoursOpen

Y devolver un nivel de prioridad:
- LOW
- MEDIUM
- HIGH
- CRITICAL

Mantén la lógica simple.
No uses clases ni arquitectura compleja.
Prioriza legibilidad y facilidad de explicación.
Explica brevemente la solución antes de generar el código.

### Resultado

Cursor generó correctamente una función utilizando condicionales simples para determinar la prioridad de un incidente según:
- prioridad recibida
- estado del incidente
- horas transcurridas

La solución fue legible y fácil de entender.

### Observaciones

- La generación inicial fue clara.
- Cursor priorizó simplicidad correctamente.
- No agregó complejidad innecesaria.

---

## Prompt 2 - Explicación del código

### Entrada

Explica esta función paso a paso.

Quiero entender:
- qué hace
- cómo funciona la lógica
- posibles problemas
- posibles mejoras de legibilidad

### Resultado

Cursor explicó:
- el flujo de evaluación de condiciones
- cómo se determina cada prioridad
- posibles problemas con valores inválidos
- oportunidades de mejorar validaciones

### Observaciones

La explicación ayudó a entender mejor la lógica generada y facilitó la revisión manual del código.

---

## Prompt 3 - Agregar validaciones

### Entrada

Agrega validaciones para evitar valores inválidos en:
- priority
- status
- hoursOpen

Mantén el código simple y legible.

### Resultado

Cursor agregó validaciones para:
- verificar prioridades válidas
- validar estados permitidos
- comprobar que `hoursOpen` sea numérico

También sugirió retornar errores descriptivos.

### Observaciones

Las validaciones mejoraron la confiabilidad de la función sin volverla compleja.

---

## Prompt 4 - Refactor y mantenibilidad

### Entrada

Refactoriza la función para mejorar claridad y mantenibilidad.

Evita complejidad innecesaria.
Explica qué mejoró respecto a la versión anterior.

### Resultado

Cursor reorganizó las condiciones para:
- mejorar legibilidad
- reducir validaciones repetidas
- hacer más clara la intención del código

### Observaciones

La versión refactorizada quedó más limpia y fácil de mantener.

---

## Prompt 5 - Pensamiento crítico y escalabilidad

### Entrada

¿Qué limitaciones tendría esta función si el sistema creciera más?

Sugiere posibles mejoras futuras sin implementarlas todavía.

### Resultado

Cursor identificó:
- crecimiento de reglas condicionales
- dificultad de mantenimiento
- necesidad futura de configuración dinámica
- posibilidad de mover reglas a servicios especializados

### Observaciones

Este prompt ayudó a evaluar límites de la solución actual y pensar en mejoras futuras sin sobreingeniería.

# Día 02 Prompts

## Prompt 1 - Before Rules

Indicación:
Crea un servicio de usuario JavaScript sencillo que:
- almacene usuarios en memoria
- permita añadir usuarios
- valide el formato del correo electrónico
- evite correos electrónicos duplicados
- devuelva mensajes de éxito o error

Resultado:
Cursor generó una solución funcional, pero la estructura y la mantenibilidad pueden variar sin reglas explícitas.

Observaciones:
- Se proporcionó una guía mínima.

- Resulta útil para comparar con la generación basada en reglas.

---

## Prompt 2 - After Rules

Prompt:
Genera un servicio simple en JavaScript para gestión de usuarios.

Requisitos:
- almacenar usuarios en memoria
- permitir agregar usuarios
- validar formato de email
- evitar correos duplicados
- retornar mensajes claros de éxito y error

Instrucciones importantes:
- usa nombres descriptivos
- evita duplicar lógica
- divide responsabilidades en funciones pequeñas
- prioriza legibilidad y mantenimiento
- agrega comentarios solo donde sea necesario
- maneja posibles edge cases
- mantén una estructura consistente y fácil de revisar

Resultado:
La solución generada fue más limpia, más fácil de entender y más fácil de mantener.

Observaciones:
- Mejor estructura en comparación con la versión sin reglas.

- El flujo de validación mejoró significativamente.

- Las convenciones de nomenclatura se volvieron más consistentes.

---

## Prompt 3 - Validation Improvement

Prompt:
Mejora la validación de correos electrónicos del servicio actual.

Requisitos:
- evitar valores vacíos
- validar espacios innecesarios
- manejar entradas inválidas
- mantener el código legible
- no romper la estructura actual

Resultado:
El cursor mejoró la validación de entrada y gestionó casos límite adicionales.

Observaciones:
- La validación se volvió más robusta.
- Se consideraron con mayor detenimiento los casos límite.

---

## Prompt 4 - Refactor Request

Prompt:
Refactoriza el servicio para que las responsabilidades estén mejor separadas.

Objetivos:
- evitar lógica repetida
- mejorar legibilidad
- mantener funcionalidad actual
- usar funciones reutilizables

Resultado:
Cursor reorganizó partes del código en funciones reutilizables más pequeñas.

Observaciones:
- Mejoró la legibilidad del código.
- La lógica se volvió más fácil de mantener.

---

## Prompt 5 - Technical Explanation

Prompt:
Explica cómo funciona el flujo principal del servicio de usuarios.

Incluye:
- validaciones
- prevención de duplicados
- manejo de errores
- estructura general

Resultado:
Cursor generó una explicación técnica del flujo del servicio y las validaciones.

Observaciones:
- Útil para fines de documentación.
- Ayuda a comprender el código generado antes de aceptar los cambios.