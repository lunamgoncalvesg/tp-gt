# Idea del proyecto

## Cliente y problema

El cliente simulado es la Mesa de Atención de una red municipal de oficinas de trámites. Hoy las personas deben averiguar qué oficina realiza cada gestión, qué documentación necesitan y si hay turnos disponibles. La solución evita solicitudes incompletas y choques de turnos, y permite consultar el estado de cada solicitud.

## Solución

Portal web adaptable a celular para que una persona cree una cuenta, elija una sección y un tipo de trámite, complete sus requisitos, elija una oficina y un turno de 30 minutos, envíe la solicitud y consulte su historial. Puede cancelar una solicitud pendiente si faltan al menos 24 horas para el turno. La aplicación muestra estados y mensajes claros; no envía correos ni procesa documentos adjuntos.

## Alcance

- Catálogo de secciones, tipos, oficinas y requisitos.
- Registro e inicio de sesión de personas.
- Alta transaccional de solicitud y respuestas.
- Disponibilidad de turnos y prevención de turnos duplicados.
- Historial privado y cancelación bajo reglas.
- Datos de muestra ficticios para demostración.

Quedan fuera: autenticación de empleados, revisión administrativa, carga de archivos, pagos, notificaciones, integración con sistemas gubernamentales y uso con datos personales reales.

## Usuarios y objetivo

- Ciudadana/o: encontrar una gestión, solicitar un turno y seguir/cancelar sus propios trámites.
- Operador del sistema: mantiene los catálogos directamente en la base durante la demostración; no hay una pantalla administrativa en esta versión.

## Éxito esperado

Una persona puede completar el flujo de solicitud desde el navegador. El servidor rechaza datos incompletos, relaciones inválidas, duplicados activos y turnos pasados, fuera de horario o ya ocupados. Ninguna persona puede ver o cancelar solicitudes de otra.

## Fuentes y límites

La temática, el esquema inicial y el prototipo provienen del repositorio previo de Luna: https://github.com/lunamgoncalvesg/proyecto-bd. Las decisiones de alcance y operación de este documento son supuestos explícitos del proyecto para esta entrega; no representan políticas de una municipalidad real. Las consignas del curso exigen un proyecto propio con reglas de negocio, documentación, tests, código y publicación; no prescriben estas reglas particulares.
