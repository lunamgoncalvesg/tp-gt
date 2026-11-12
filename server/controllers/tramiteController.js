import pool from "../db/db.js";
import { assertCanCancel, assertRequirements, assertValidSlot, BusinessRuleError } from "../domain/tramiteRules.js";

export async function getSecciones(req, res, next) {
  try { const [rows] = await pool.execute("SELECT id, nombre, descripcion FROM secciones WHERE habilitada = 1 ORDER BY nombre"); res.json(rows); }
  catch (error) { next(error); }
}

export async function getTipos(req, res, next) {
  try { const [rows] = await pool.execute("SELECT id, nombre, seccion_id AS seccionId, descripcion FROM tipos_tramite WHERE seccion_id = ? AND habilitado = 1 ORDER BY nombre", [req.params.seccionId]); res.json(rows); }
  catch (error) { next(error); }
}

export async function getOficinas(req, res, next) {
  try { const [rows] = await pool.execute("SELECT id, nombre, direccion, seccion_id AS seccionId FROM oficinas WHERE seccion_id = ? AND habilitada = 1 ORDER BY nombre", [req.params.seccionId]); res.json(rows); }
  catch (error) { next(error); }
}

export async function getRequisitos(req, res, next) {
  try { const [rows] = await pool.execute("SELECT id AS idReq, etiqueta AS campo FROM requisitos WHERE tipo_id = ? AND obligatorio = 1 ORDER BY orden, id", [req.params.tipoId]); res.json(rows); }
  catch (error) { next(error); }
}

export async function getDisponibilidad(req, res, next) {
  try {
    const { oficinaId, fecha } = req.query;
    if (!/^\d+$/.test(String(oficinaId)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) throw new BusinessRuleError("Indicá una oficina y fecha válidas.");
    const start = new Date(`${fecha}T00:00:00-03:00`);
    if (Number.isNaN(start.getTime()) || start.toISOString().slice(0, 10) !== fecha) throw new BusinessRuleError("Indicá una fecha válida.");
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const [rows] = await pool.execute("SELECT turno_at AS turno FROM tramites WHERE oficina_id = ? AND estado <> 'Cancelado' AND turno_at >= ? AND turno_at < ?", [oficinaId, start, end]);
    res.json({ ocupados: rows.map((row) => new Date(row.turno).toISOString()) });
  } catch (error) { next(error); }
}

export async function crearTramite(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { tipoId, oficinaId, turno, respuestas } = req.body ?? {};
    if (!Number.isInteger(Number(tipoId)) || !Number.isInteger(Number(oficinaId))) throw new BusinessRuleError("Elegí un tipo de trámite y una oficina.");
    const appointment = assertValidSlot(turno);
    await connection.beginTransaction();
    const [[catalog]] = await connection.execute("SELECT id, seccion_id FROM tipos_tramite WHERE id = ? AND habilitado = 1 FOR UPDATE", [tipoId]);
    const [[office]] = await connection.execute("SELECT id, seccion_id FROM oficinas WHERE id = ? AND habilitada = 1 FOR UPDATE", [oficinaId]);
    if (!catalog || !office || Number(catalog.seccion_id) !== Number(office.seccion_id)) throw new BusinessRuleError("El tipo y la oficina no están disponibles para la misma sección.", 409);
    const [requirements] = await connection.execute("SELECT id AS idReq FROM requisitos WHERE tipo_id = ? AND obligatorio = 1 ORDER BY id", [tipoId]);
    const cleanAnswers = assertRequirements(requirements, respuestas);
    const [active] = await connection.execute("SELECT id FROM tramites WHERE cliente_id = ? AND tipo_id = ? AND estado IN ('Pendiente', 'En revisión') LIMIT 1 FOR UPDATE", [req.user.id, tipoId]);
    if (active.length) throw new BusinessRuleError("Ya tenés una solicitud activa de este tipo.", 409);
    const [result] = await connection.execute("INSERT INTO tramites (cliente_id, tipo_id, oficina_id, turno_at, estado) VALUES (?, ?, ?, ?, 'Pendiente')", [req.user.id, tipoId, oficinaId, appointment]);
    const values = Object.entries(cleanAnswers).map(([requisitoId, respuesta]) => [result.insertId, Number(requisitoId), respuesta]);
    if (values.length) await connection.query("INSERT INTO respuestas (tramite_id, requisito_id, respuesta) VALUES ?", [values]);
    await connection.commit();
    return res.status(201).json({ id: result.insertId, estado: "Pendiente", turno: appointment.toISOString() });
  } catch (error) {
    await connection.rollback();
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Ese turno acaba de ocuparse o ya existe una solicitud activa de este tipo." });
    return next(error);
  } finally { connection.release(); }
}

export async function getMisTramites(req, res, next) {
  try {
    const [rows] = await pool.execute(`SELECT t.id, tt.nombre AS tipo, o.nombre AS oficina, o.direccion, t.turno_at AS turno, t.estado
      FROM tramites t JOIN tipos_tramite tt ON tt.id = t.tipo_id JOIN oficinas o ON o.id = t.oficina_id
      WHERE t.cliente_id = ? ORDER BY t.turno_at DESC`, [req.user.id]);
    res.json(rows.map((row) => ({ ...row, turno: new Date(row.turno).toISOString() })));
  } catch (error) { next(error); }
}

export async function cancelarTramite(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute("SELECT id, cliente_id, estado, turno_at AS turno FROM tramites WHERE id = ? FOR UPDATE", [req.params.id]);
    if (!rows.length) throw new BusinessRuleError("Trámite no encontrado.", 404);
    const row = rows[0];
    assertCanCancel({ ownerId: req.user.id, requestOwnerId: row.cliente_id, status: row.estado, appointmentAt: row.turno });
    await connection.execute("UPDATE tramites SET estado = 'Cancelado' WHERE id = ?", [row.id]);
    await connection.commit();
    return res.json({ id: row.id, estado: "Cancelado" });
  } catch (error) {
    await connection.rollback();
    return next(error);
  } finally { connection.release(); }
}
