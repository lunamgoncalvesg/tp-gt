# Informe de trabajo

## Resumen

Se transforma el proyecto anterior de gestión de trámites en un portal ciudadano con reglas verificables: turnos en intervalos de media hora, exclusividad por oficina, requisitos exactos, protección por titularidad y cancelación limitada por plazo. La consigna del curso no define una temática ni estas políticas: son decisiones simuladas documentadas en `decisiones.md`.

## Orden de construcción

1. Se inspeccionaron la consigna reconstruida, la síntesis de clases/TPs y el repositorio previo para identificar la base reutilizable y los vacíos.
2. Se definieron alcance, supuestos y vocabulario antes de codificar, para reducir reglas inventadas por la implementación.
3. Se priorizó dominio y persistencia de turnos porque la concurrencia y la integridad de la solicitud son el núcleo difícil; una reserva duplicada invalida el flujo aunque la pantalla funcione.
4. La autenticación y la propiedad se resolvieron antes del historial para evitar exponer trámites ajenos.
5. Se completó el flujo web sobre contratos de API estables.
6. Se dejaron publicación y verificación remota al final porque requieren cuentas y secretos de la propietaria.

## Pruebas realizadas

Verificación local realizada el 12/11/2026:

- `cd server; npm test`: 5 pruebas aprobadas (correo normalizado, edad y fecha válida, horario hábil con límites 09:00/16:30, requisitos y propiedad/plazo de cancelación).
- `cd client; npm run build`: compilación de producción de Next.js aprobada y páginas estáticas generadas.
- `git diff --check`: sin errores de whitespace.
- Las pruebas de integración requieren MySQL configurado y quedan pendientes. No se hizo una prueba manual de navegador ni se verificó una URL pública.

## Evidencia y limitaciones

- El repositorio original tenía un prototipo de alta y formulario, una base MySQL y consultas de práctica. La capa de aplicación no comprobaba horario en el servidor ni hacía atómico el alta del trámite y respuestas.
- Los registros personales y contraseñas de muestra del SQL antiguo no deben reutilizarse.
- El curso requiere código y documentación en GitHub, pruebas que pasen, commits por tarea y una app pública. En este entorno no están configuradas las cuentas de despliegue ni la base remota, por lo que aún no se puede acreditar disponibilidad pública.
- El curso no fija formato/extensión del informe, cantidades mínimas de HU/RN ni escala de evaluación.

## Lista de verificación

- [x] Idea, decisiones, glosario y preguntas abiertas.
- [x] Spec con RN numeradas, HU, aceptación y casos borde.
- [x] AGENTS.md y perfiles de trabajo.
- [x] Plan técnico y tareas.
- [ ] Cada tarea registrada en un commit independiente en la historia remota.
- [ ] Pruebas con base de datos y exploración manual desde navegador.
- [ ] Despliegue público de frontend, API y base.
- [ ] URL pública comprobada y agregada al README.
- [ ] Entrega del enlace en el aula del Módulo 5.
