# Decisiones del proyecto

| ID | Tema | Pregunta | Decisión |
|---|---|---|---|
| D01 | Temática | ¿Qué sistema se rehace? | Portal de trámites y turnos, basado en el proyecto previo de Luna. |
| D02 | Alcance | ¿Qué flujo se entrega? | Registro, consulta de catálogo, solicitud, historial y cancelación ciudadana. |
| D03 | Identidad | ¿Qué identifica a una cuenta? | Correo electrónico único; DNI también único para evitar cuentas duplicadas. |
| D04 | Acceso | ¿Cómo se protegen los datos? | Sesión firmada por token; el servidor deriva la identidad del token y filtra todas las consultas por usuario. Las contraseñas se almacenan con hash y salt. |
| D05 | Requisitos | ¿Cómo se representan los requisitos? | Cada tipo define campos obligatorios; la API contrasta el conjunto enviado con el catálogo vigente y rechaza faltantes o campos ajenos. |
| D06 | Turnos | ¿Cuándo se atiende? | Lunes a viernes de 09:00 a 17:00, hora local de Buenos Aires, en intervalos exactos de 30 minutos. |
| D07 | Disponibilidad | ¿Cómo se evita una doble reserva? | Una transacción y una restricción única por oficina, fecha y hora. Si dos solicitudes compiten, solo una se confirma. |
| D08 | Duplicados | ¿Puede haber solicitudes repetidas? | Una persona no puede tener más de una solicitud activa del mismo tipo. Activa significa Pendiente o En revisión. |
| D09 | Cancelación | ¿Cuándo se cancela? | Solo la persona propietaria puede cancelar una solicitud Pendiente con al menos 24 horas completas antes del turno. |
| D10 | Datos de demo | ¿Se usan personas reales? | No. Se excluyen los registros personales de ejemplo del SQL histórico; la demostración usa identidades ficticias. |
| D11 | Tecnología | ¿Qué stack se conserva? | Next.js/React, Express y MySQL para aprovechar el trabajo previo. |
| D12 | Despliegue | ¿Dónde se publica? | Preparado para frontend Next.js, API Node y MySQL gestionado. La cuenta y las credenciales de Luna son necesarias para publicarlo. |
| D13 | Informe | ¿En qué formato? | Informe en Markdown dentro del repositorio; el curso no fija formato ni extensión. |

