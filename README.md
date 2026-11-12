# Trámites en Línea

Portal web académico para pedir un turno de trámite, adjuntar los datos requeridos, consultar el historial y cancelar solicitudes que cumplan la regla de anticipación. Se rehace y amplía el prototipo personal de gestión de trámites que ya estaba en este repositorio.

> **Demostración con datos ficticios.** No es un sistema oficial y no debe usarse con datos personales reales.

## Funcionalidad

- Registro e inicio de sesión con contraseña derivada mediante `scrypt` y sesión firmada.
- Catálogo de secciones, tipos, oficinas y requisitos dinámicos.
- Solicitud transaccional: o se guardan el trámite y todas sus respuestas o no se guarda nada.
- Turnos hábiles de lunes a viernes, 09:00–17:00 de Buenos Aires, cada 30 minutos.
- Prevención de turnos duplicados y solicitudes activas repetidas.
- Historial privado y cancelación por la titularidad con al menos 24 horas.

## Stack

- `client/`: Next.js y React.
- `server/`: Express, Node.js y mysql2.
- Base de datos: MySQL.

## Requisitos y ejecución local

Requiere Node.js 20 o superior y MySQL 8.

1. Crear una base vacía llamada `ministerio_demo`.
2. Ejecutar `server/db/schema.sql` en esa base. El script configura únicamente catálogos de demostración ficticios.
3. Crear `server/.env` a partir de `server/.env.example`; establecer `TOKEN_SECRET` con al menos 32 caracteres aleatorios. No subir `.env` a Git.
4. En una terminal:

   ```powershell
   cd server
   npm install
   npm start
   ```

5. En otra terminal:

   ```powershell
   cd client
   npm install
   $env:NEXT_PUBLIC_API_URL = "http://localhost:3001"
   npm run dev
   ```

6. Abrir `http://localhost:3000`. La API tiene una comprobación de salud en `http://localhost:3001/api/health`.

## Pruebas

```powershell
cd server
npm test
```

La suite unitaria cubre edad mínima, días/horarios, requisitos y cancelación. Para probar integración y concurrencia hace falta ejecutar la base MySQL y completar solicitudes desde la interfaz.

## Configuración de despliegue

El proyecto está preparado para publicar `client/` en Vercel y `server/` en un servicio Node como Render, junto con una base MySQL gestionada. Configurar `NEXT_PUBLIC_API_URL` en el frontend, y `DATABASE_URL` (o las variables `DB_*`), `TOKEN_SECRET` y `FRONTEND_URL` en la API. CORS permite el origen configurado en `FRONTEND_URL`.

**Aplicación pública:** pendiente de despliegue con las cuentas de Luna. Se agregará aquí la URL y se verificará cuando estén creados los servicios.

## Documentación del final

- [idea.md](idea.md): cliente simulado, necesidad y alcance.
- [decisiones.md](decisiones.md): respuestas y supuestos adoptados.
- [glosario.md](glosario.md): términos del negocio.
- [preguntas-abiertas.md](preguntas-abiertas.md): preguntas resueltas y dependencia de publicación.
- [spec.md](spec.md): reglas, historias y casos borde.
- [plan.md](plan.md): arquitectura y plan técnico.
- [tasks.md](tasks.md): tareas y estado.
- [informe.md](informe.md): orden de trabajo, pruebas y checklist.
- [AGENTS.md](AGENTS.md) y `.agents/`: instrucciones y perfiles.

## Repositorio

Repositorio base: https://github.com/lunamgoncalvesg/proyecto-bd
