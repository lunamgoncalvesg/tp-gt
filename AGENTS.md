# Instrucciones del proyecto

## Fuente de verdad

Seguir `spec.md` para el comportamiento, `decisiones.md` para opciones resueltas y `preguntas-abiertas.md` para dependencias externas. `idea.md` describe alcance; `plan.md` describe arquitectura. No inventar requisitos municipales reales.

## Stack y estructura

- Frontend: Next.js y React en `client/`.
- API: Node.js, Express y mysql2 en `server/`.
- Base: MySQL; esquema/migraciones y datos sintéticos bajo `server/db/`.
- Configuración: secretos únicamente en variables de entorno. Nunca incluir `.env` ni datos reales.

## Reglas generales

- Aplicar las RN en backend además de validar formularios en el navegador.
- Usar transacciones para operaciones que escriben varias tablas.
- Nunca confiar en el DNI o ID de cliente enviados por el navegador; obtener la identidad del token verificado.
- No guardar contraseñas en claro, respuestas sensibles de producción, tokens ni cadenas de conexión en Git.
- Errores HTTP deben distinguir validación (400), no autenticado (401), no encontrado (404) y conflicto de negocio (409), sin incluir trazas o secretos.
- Mantener `README.md`, `plan.md`, `tasks.md` e `informe.md` actualizados.

## Perfiles de trabajo

Las guías de responsabilidad se encuentran en `.agents/`. En un trabajo individual, Luna puede alternar los perfiles; son una guía metodológica, no procesos autónomos.

## Ciclo por tarea

1. Consultar las RN/HU referidas por la tarea.
2. Escribir o actualizar la prueba del comportamiento.
3. Ejecutar la prueba y confirmar el fallo esperado cuando aplique.
4. Implementar el cambio mínimo.
5. Ejecutar las pruebas y revisión de seguridad/privacidad.
6. Actualizar documentación y registrar un commit por tarea.
