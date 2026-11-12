# Especificación funcional

## Objetivo

Permitir que una persona solicite y gestione turnos para trámites simulados, con validaciones de negocio aplicadas en el servidor.

## Roles

- **Ciudadana/o autenticado:** administra su cuenta, crea solicitudes, consulta solo sus solicitudes y cancela si cumple RN10.
- **Operador técnico:** carga catálogos en la base de datos. La gestión de empleados queda fuera del MVP.

## Alcance

Catálogo y flujo ciudadano de solicitud, seguimiento y cancelación. No incluye aprobación de trámites, pagos, archivos ni notificaciones. La app es demostrativa y no debe recibir datos personales reales.

## Reglas de negocio

- **RN01 - Cuenta única.** El correo se normaliza quitando espacios externos y pasando a minúsculas; correo y DNI deben ser únicos. La contraseña no se guarda en texto plano.
- **RN02 - Edad mínima.** La persona debe tener 18 años o más al registrarse.
- **RN03 - Catálogo vigente.** Solo se puede solicitar un tipo habilitado y una oficina habilitada que pertenezca a la sección de ese tipo.
- **RN04 - Requisitos exactos.** Cada requisito publicado por el tipo debe tener una respuesta no vacía de hasta 250 caracteres. No se aceptan respuestas para requisitos inexistentes o de otro tipo.
- **RN05 - Creación atómica.** Una solicitud y todas sus respuestas se confirman juntas. Si cualquier inserción falla, no queda ninguna parte guardada.
- **RN06 - Horario.** Los turnos son de lunes a viernes entre 09:00 y 17:00, hora de Buenos Aires; el inicio debe caer en un múltiplo de 30 minutos y terminar no más tarde de las 17:00.
- **RN07 - Futuro.** Solo se aceptan turnos posteriores a la hora actual del servidor. La disponibilidad se vuelve a comprobar al confirmar la solicitud.
- **RN08 - Exclusividad del turno.** Una oficina, fecha y hora pueden corresponder a una sola solicitud no cancelada. En concurrencia, una sola operación puede ganar.
- **RN09 - Sin duplicado activo.** Una persona no puede tener dos solicitudes del mismo tipo en estado Pendiente o En revisión. Una solicitud Cancelada o Finalizada no bloquea otra.
- **RN10 - Cancelación con plazo.** Solo la titular puede cancelar si el estado es Pendiente y faltan 24 horas o más para el turno. La cancelación libera el turno. El resto de los estados no se modifica por la API ciudadana.
- **RN11 - Privacidad por titularidad.** Lectura, detalle y cancelación de solicitudes siempre se limitan a la identidad autenticada; una solicitud ajena responde como no encontrada.
- **RN12 - Información de demostración.** El conjunto de datos público es sintético; no contiene ni reutiliza datos personales reales.

## Historias de usuario

### HU01 - Crear una cuenta (RN01, RN02)

Como persona quiero registrarme para solicitar trámites.

- Dado un correo/DNI libres y una fecha de nacimiento que cumple 18 años, cuando envío datos válidos, entonces se crea mi cuenta y mi contraseña queda protegida mediante hash.
- Dado un correo o DNI ya registrado, cuando envío el alta, entonces recibo un error de validación y no se crea otra cuenta.
- Dado que tengo menos de 18 años, cuando intento registrarme, entonces el servidor rechaza el alta.

### HU02 - Iniciar sesión (RN01, RN11)

Como persona registrada quiero iniciar sesión para acceder a mis trámites.

- Dadas credenciales válidas, cuando inicio sesión, entonces recibo una sesión autenticada.
- Dadas credenciales inválidas, cuando inicio sesión, entonces recibo un error genérico sin revelar si existe el correo.

### HU03 - Explorar opciones (RN03, RN04)

Como persona quiero elegir una sección, un tipo, una oficina y ver los requisitos para completar la gestión.

- Dado un tipo, cuando consulto su catálogo, entonces veo solo oficinas de la sección correspondiente y los requisitos del tipo.

### HU04 - Solicitar un turno (RN03-RN09, RN12)

Como persona quiero enviar mis respuestas y reservar un turno adecuado.

- Dado un catálogo vigente, todos sus requisitos respondidos y un turno hábil futuro libre, cuando confirmo, entonces se crea una solicitud Pendiente con sus respuestas.
- Dado un turno ocupado, una fecha fuera del horario, requisitos faltantes, datos extraños al tipo o una solicitud activa duplicada, cuando confirmo, entonces no se guarda ninguna parte y se informa la causa.
- Dadas dos confirmaciones simultáneas para el mismo turno, cuando ambas llegan al servidor, entonces solo una queda confirmada.

### HU05 - Consultar mis trámites (RN11)

Como persona quiero ver mi historial para conocer fecha, oficina, tipo y estado de cada solicitud.

- Dada una sesión válida, cuando consulto mi historial, entonces veo únicamente mis solicitudes ordenadas de la más reciente a la más antigua.
- Dada la referencia de una solicitud ajena, cuando intento leerla, entonces el servidor responde como no encontrada.

### HU06 - Cancelar una solicitud (RN08, RN10, RN11)

Como persona quiero cancelar un turno pendiente si mis planes cambian.

- Dada una solicitud propia Pendiente con al menos 24 horas de anticipación, cuando la cancelo, entonces cambia a Cancelado y el horario vuelve a estar disponible.
- Dada una solicitud en otro estado, ajena o a menos de 24 horas del turno, cuando intento cancelarla, entonces el servidor la rechaza sin alterar los datos.

## Casos borde

- Cambio de horario de verano: se almacena el turno en UTC y se valida según zona `America/Argentina/Buenos_Aires`.
- Dos transacciones que compiten por un turno: la restricción única de la base es el árbitro final.
- Requisito eliminado/cambiado luego de abrir el formulario: el servidor vuelve a validar el catálogo al confirmar.
- Cancelación repetida: devuelve conflicto y no altera la fecha ni el estado.
- Fecha límite exacta de cancelación: se permite si el turno está exactamente a 24 horas.
- Acceso sin token o token inválido: la operación privada responde 401.
- Desconexión al guardar respuestas: la transacción se revierte completa.

## Pendientes

Sin pendientes funcionales dentro del alcance local. El despliegue público y la verificación de su URL dependen de cuentas/secretos de hosting de la propietaria; no son suplidos por supuestos de negocio.
