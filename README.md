# Trámites en Línea

Portal web académico para pedir un turno de trámite, adjuntar los datos requeridos, consultar el historial y cancelar solicitudes que cumplan la regla de anticipación.

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

### Documentación de entrega en PDF

- [01. Cronograma](documentacion/01_Cronograma.pdf)
- [02. Formulación del proyecto](documentacion/02_Formulacion_del_proyecto.pdf)
- [03. Requerimientos del sistema](documentacion/03_Requerimientos_del_sistema.pdf)
- [04. Análisis del sistema](documentacion/04_Analisis_del_sistema.pdf)
- [05. Diseño detallado](documentacion/05_Diseno_detallado.pdf)
- [06. Estudio de factibilidad](documentacion/06_Estudio_de_factibilidad.pdf)
- [07. Manual de usuario](documentacion/07_Manual_de_usuario.pdf)
- [08. Manual de administrador](documentacion/08_Manual_administrador.pdf)
- [09. Manual de instalación](documentacion/09_Manual_de_instalacion.pdf)
- [10. Manual técnico](documentacion/10_Manual_tecnico.pdf)
- [11. Plan y resultados de pruebas](documentacion/11_Plan_y_resultados_de_pruebas.pdf)

## Repositorios

- Repositorio de entrega: https://github.com/lunamgoncalvesg/tp-gt
