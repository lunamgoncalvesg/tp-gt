import test from "node:test";
import assert from "node:assert/strict";
import { ageAtLeast, assertCanCancel, assertRequirements, assertValidSlot, BusinessRuleError, normalizeEmail } from "./tramiteRules.js";

test("normaliza correo", () => assert.equal(normalizeEmail("  Luna@Example.COM "), "luna@example.com"));

test("valida mayoría de edad y fecha real", () => {
  const today = new Date("2026-11-12T12:00:00Z");
  assert.equal(ageAtLeast("2008-11-12", 18, today), true);
  assert.equal(ageAtLeast("2008-11-13", 18, today), false);
  assert.equal(ageAtLeast("2008-02-30", 18, today), false);
});

test("acepta solo turno futuro de media hora en horario hábil de Buenos Aires", () => {
  const now = new Date("2026-11-12T12:00:00Z");
  assert.doesNotThrow(() => assertValidSlot("2026-11-13T12:00:00Z", now)); // 09:00 ART
  assert.doesNotThrow(() => assertValidSlot("2026-11-13T19:30:00Z", now)); // 16:30 ART, termina 17:00
  for (const invalid of ["2026-11-14T12:00:00Z", "2026-11-13T11:15:00Z", "2026-11-13T20:00:00Z", "2026-11-12T11:00:00Z"]) {
    assert.throws(() => assertValidSlot(invalid, now), BusinessRuleError);
  }
});

test("exige exactamente los requisitos vigentes, con valor acotado", () => {
  const catalog = [{ idReq: 1 }, { idReq: 2 }];
  assert.deepEqual(assertRequirements(catalog, { 1: " A ", 2: "B" }), { 1: "A", 2: "B" });
  assert.throws(() => assertRequirements(catalog, { 1: "A" }), BusinessRuleError);
  assert.throws(() => assertRequirements(catalog, { 1: "A", 2: "B", 3: "C" }), BusinessRuleError);
  assert.throws(() => assertRequirements(catalog, { 1: "A", 2: " ".repeat(1) }), BusinessRuleError);
});

test("cancelación requiere titularidad, estado Pendiente y al menos 24 horas", () => {
  const context = { ownerId: 7, requestOwnerId: 7, status: "Pendiente", appointmentAt: "2026-11-14T12:00:00Z", now: new Date("2026-11-12T12:00:00Z") };
  assert.doesNotThrow(() => assertCanCancel(context));
  assert.throws(() => assertCanCancel({ ...context, requestOwnerId: 8 }), { status: 404 });
  assert.throws(() => assertCanCancel({ ...context, status: "En revisión" }), { status: 409 });
  assert.throws(() => assertCanCancel({ ...context, appointmentAt: "2026-11-13T11:59:59Z" }), { status: 409 });
});
