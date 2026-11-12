# Plan técnico

## Arquitectura

Aplicación web de tres capas. Next.js sirve las pantallas; Express expone una API JSON; MySQL conserva cuentas, catálogo, turnos, solicitudes y respuestas. El navegador nunca se conecta directamente a la base. Todas las reglas que protegen datos o consistencia se ejecutan en la API y/o se refuerzan con restricciones de la base.

## Modelo de datos

- `clientes`: identidad ciudadana y hash de contraseña.
- `secciones`: agrupación de tipos.
- `tipos_tramite`: catálogo de gestiones habilitadas.
- `oficinas`: sedes ligadas a sección.
- `requisitos`: campos obligatorios por tipo.
- `tramites`: titular, tipo, oficina, turno UTC y estado.
- `respuestas`: valores enviados por solicitud y requisito.

Índices únicos: correo/DNI, y oficina + turno entre trámites activos mediante tabla/estrategia que permita liberar la clave al cancelar. Claves foráneas impiden referencias huérfanas. Los tiempos se guardan en UTC.

## API prevista

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/tramites/secciones`
- `GET /api/tramites/tipos/:seccionId`
- `GET /api/tramites/oficinas/:seccionId`
- `GET /api/tramites/requisitos/:tipoId`
- `GET /api/tramites/disponibilidad?oficinaId=&fecha=`
- `POST /api/tramites` (autenticado)
- `GET /api/tramites/mis` (autenticado)
- `POST /api/tramites/:id/cancelar` (autenticado)

## Dónde vive cada regla

Las comprobaciones legibles y testeables (edad, horario, requisito, estados, anticipación) viven en servicios puros de `server/domain/`. Controladores coordinan identidad, consultas y transacciones. Restricciones e índices en MySQL cierran carreras y referencias inválidas. La interfaz duplica solo validación de usabilidad.

## Seguridad y privacidad

Hash de contraseñas con `scrypt` y salt aleatorio; token HMAC con expiración; consultas preparadas; CORS desde `FRONTEND_URL`; variables de entorno en despliegue; `.env` ignorado. No usar los registros de personas ni contraseñas embebidas en el SQL original. La demo debe llevar datos ficticios y no presentarse como servicio estatal.

## Pruebas

Pruebas unitarias Node para límites de calendario, edades, requisitos, propiedad y cancelación. Pruebas de integración con MySQL para rollback, restricción de turno y endpoints protegidos. Revisión manual de los flujos web y colección HTTP exportable. La base MySQL local no está disponible en este entorno, así que esa parte y las pruebas manuales se registran como pendiente hasta configurar la base.

## Despliegue

Frontend en Vercel (proyecto `client/`), API Node en Render (`server/`) y MySQL gestionado compatible. Variables: `DATABASE_URL` o `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`, `TOKEN_SECRET`, `FRONTEND_URL`, `PORT`, y `NEXT_PUBLIC_API_URL` en frontend. Los servicios, credenciales y dominio pertenecen a Luna; no se consignan en Git.

## Priorización

Primero contratos y reglas de dominio, después persistencia atómica y autenticación (riesgos de integridad/privacidad), luego interfaz de los flujos, y al final publicación y pruebas remotas. Así la UI no consolida reglas que luego deban cambiarse y la regla de turno concurrente se valida desde el diseño de datos.
