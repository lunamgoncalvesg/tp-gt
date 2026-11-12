import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import pool from "../db/db.js";
import { ageAtLeast, normalizeEmail } from "../domain/tramiteRules.js";

const scrypt = promisify(scryptCallback);
const secret = () => {
  if (!process.env.TOKEN_SECRET || process.env.TOKEN_SECRET.length < 32) throw new Error("TOKEN_SECRET must contain at least 32 characters");
  return process.env.TOKEN_SECRET;
};

async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const key = await scrypt(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(":");
  if (!salt || !hash) return false;
  const candidate = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

function issueToken(user) {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, name: user.name, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyToken(token) {
  try {
    const [payload, signature] = String(token).split(".");
    if (!payload || !signature) return null;
    const expected = createHmac("sha256", secret()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!Number.isInteger(data.sub) || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return { id: data.sub, name: data.name };
  } catch {
    return null;
  }
}

export async function register(req, res, next) {
  try {
    const data = req.body ?? {};
    const email = normalizeEmail(data.email);
    const dni = String(data.dni ?? "").trim();
    const name = String(data.name ?? "").trim();
    const birthDate = String(data.birthDate ?? "");
    const password = String(data.password ?? "");
    if (!email.includes("@") || email.length > 254 || !dni || !/^\d{7,10}$/.test(dni) || !name || name.length > 120 || password.length < 10 || password.length > 128 || !ageAtLeast(birthDate, 18)) {
      return res.status(400).json({ message: "Completá los datos: correo válido, DNI numérico, nombre, 18 años o más y contraseña de 10 caracteres como mínimo." });
    }
    const passwordHash = await hashPassword(password);
    const [result] = await pool.execute("INSERT INTO clientes (dni, nombre, email, fecha_nacimiento, password_hash) VALUES (?, ?, ?, ?, ?)", [dni, name, email, birthDate, passwordHash]);
    const user = { id: result.insertId, name };
    return res.status(201).json({ token: issueToken(user), user });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Ya existe una cuenta con ese correo o DNI." });
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password ?? "");
    const [rows] = await pool.execute("SELECT id, nombre, password_hash FROM clientes WHERE email = ? LIMIT 1", [email]);
    if (!rows.length || !(await verifyPassword(password, rows[0].password_hash))) return res.status(401).json({ message: "Correo o contraseña incorrectos." });
    const user = { id: rows[0].id, name: rows[0].nombre };
    return res.json({ token: issueToken(user), user });
  } catch (error) {
    return next(error);
  }
}
