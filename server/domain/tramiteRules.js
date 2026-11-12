export class BusinessRuleError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "BusinessRuleError";
    this.status = status;
  }
}

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function ageAtLeast(birthDate, years, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(birthDate))) return false;
  const [year, month, day] = birthDate.split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (candidate.getUTCFullYear() !== year || candidate.getUTCMonth() !== month - 1 || candidate.getUTCDate() !== day) return false;
  let age = today.getUTCFullYear() - year;
  if (today.getUTCMonth() + 1 < month || (today.getUTCMonth() + 1 === month && today.getUTCDate() < day)) age--;
  return age >= years;
}

export function assertValidSlot(value, now = new Date()) {
  const slot = new Date(value);
  if (!value || Number.isNaN(slot.getTime()) || slot <= now) throw new BusinessRuleError("El turno debe estar en el futuro.");
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Argentina/Buenos_Aires", weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(slot);
  const p = Object.fromEntries(parts.map(({ type, value: part }) => [type, part]));
  const minute = Number(p.minute), hour = Number(p.hour);
  if (["Sat", "Sun"].includes(p.weekday) || ![0, 30].includes(minute) || p.second !== "00" || hour < 9 || hour > 16) {
    throw new BusinessRuleError("Elegí un turno de lunes a viernes, entre las 09:00 y las 16:30, cada 30 minutos (hora de Buenos Aires).");
  }
  return slot;
}

export function assertRequirements(catalog, answers) {
  if (!Array.isArray(catalog) || !answers || typeof answers !== "object" || Array.isArray(answers)) {
    throw new BusinessRuleError("No se pudieron validar los requisitos.");
  }
  const required = new Set(catalog.map((item) => String(item.idReq)));
  const provided = Object.keys(answers);
  if (required.size !== provided.length || provided.some((key) => !required.has(String(key)))) {
    throw new BusinessRuleError("Completá únicamente los requisitos vigentes de este trámite.");
  }
  for (const id of required) {
    const answer = answers[id];
    if (typeof answer !== "string" || !answer.trim() || answer.trim().length > 250) {
      throw new BusinessRuleError("Cada requisito debe tener una respuesta de hasta 250 caracteres.");
    }
  }
  return Object.fromEntries(Object.entries(answers).map(([id, value]) => [id, value.trim()]));
}

export function assertCanCancel({ ownerId, requestOwnerId, status, appointmentAt, now = new Date() }) {
  if (String(ownerId) !== String(requestOwnerId)) throw new BusinessRuleError("Trámite no encontrado.", 404);
  if (status !== "Pendiente") throw new BusinessRuleError("Solo se pueden cancelar trámites pendientes.", 409);
  const appointment = new Date(appointmentAt);
  if (Number.isNaN(appointment.getTime()) || appointment.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    throw new BusinessRuleError("La cancelación debe realizarse con al menos 24 horas de anticipación.", 409);
  }
}
