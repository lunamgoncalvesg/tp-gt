# Tareas

Estados: ✅ completada en este espacio de trabajo · ⏳ requiere servicio/cuenta externa.

| ID | Título | Perfil | Qué hacer | RN/HU | Depende de | Terminado cuando | Estado |
|---|---|---|---|---|---|---|---|
| T01 | Reconstruir alcance y fuentes | Analista | Revisar consigna, síntesis y repo anterior | Todas | — | Idea y límites trazables | ✅ |
| T02 | Definir reglas y criterios | Analista | Completar decisiones, glosario y spec | RN01-RN12, HU01-HU06 | T01 | Sin dudas funcionales locales | ✅ |
| T03 | Diseñar esquema seguro | Backend | Normalizar relaciones, constraints y datos ficticios | RN03-RN09, RN12 | T02 | SQL no destructivo y sin PII real | ✅ |
| T04 | Implementar reglas de dominio | Backend | Horario, requisitos, edad, duplicados y cancelación | RN02-RN10 | T02 | Reglas unitarias y API validan | ✅ |
| T05 | Implementar API y sesión | Backend | Endpoints, identidad autenticada y transacciones | RN01, RN05, RN11 | T03, T04 | Acceso privado por titular y errores previsibles | ✅ |
| T06 | Completar interfaz ciudadana | Frontend | Registro/login, solicitud, disponibilidad e historial | HU01-HU06 | T05 | Flujos conectados a URL configurable | ✅ |
| T07 | Probar y revisar | Tester/Revisor | Ejecutar suites disponibles y revisar cambios | RN01-RN12 | T04-T06 | Pruebas pasan; límites externos informados | ✅ |
| T08 | Documentar uso y pruebas | Analista | README, informe, instalación y evidencia | Todas | T07 | Repositorio explicable y reproducible | ✅ |
| T09 | Crear servicios y configurar secretos | Propietaria | Desplegar API, base y frontend con sus cuentas | RN12 | T08 | URLs públicas responden | ⏳ |
| T10 | Verificar URL pública e informe final | Tester | Probar desde internet y agregar evidencia | HU01-HU06 | T09 | Demo pública completa y accesible | ⏳ |
| T11 | Publicar cambios finales en GitHub | Propietaria | Revisar diff y hacer push a repo propio | Todas | T08 | Rama remota actualizada | ⏳ |

