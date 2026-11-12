"use client";

import { useEffect, useMemo, useState } from "react";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");
const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

async function request(path, options = {}) {
  const response = await fetch(`${API}/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "No se pudo completar la operación.");
  return data;
}

function localDateString(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState("login");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [secciones, setSecciones] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [oficinas, setOficinas] = useState([]);
  const [requisitos, setRequisitos] = useState([]);
  const [ocupados, setOcupados] = useState([]);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", dni: "", birthDate: "", password: "" });
  const [booking, setBooking] = useState({ seccionId: "", tipoId: "", oficinaId: "", fecha: "", turno: "" });
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const saved = window.localStorage.getItem("tramites-session");
    if (saved) {
      try { setSession(JSON.parse(saved)); } catch { window.localStorage.removeItem("tramites-session"); }
    }
    request("/tramites/secciones").then(setSecciones).catch(() => {});
  }, []);

  const availableSlots = useMemo(() => {
    if (!booking.fecha) return [];
    const [year, month, day] = booking.fecha.split("-").map(Number);
    const weekday = new Date(year, month - 1, day).getDay();
    if (weekday === 0 || weekday === 6) return [];
    const candidates = [];
    for (let mins = 9 * 60; mins <= 16 * 60 + 30; mins += 30) {
      const date = new Date(year, month - 1, day, Math.floor(mins / 60), mins % 60);
      if (date.getTime() > Date.now() && !ocupados.includes(date.toISOString())) candidates.push({ value: date.toISOString(), label: date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) });
    }
    return candidates;
  }, [booking.fecha, ocupados]);

  useEffect(() => {
    if (!booking.seccionId) { setTipos([]); setOficinas([]); return; }
    Promise.all([request(`/tramites/tipos/${booking.seccionId}`), request(`/tramites/oficinas/${booking.seccionId}`)])
      .then(([nextTipos, nextOficinas]) => { setTipos(nextTipos); setOficinas(nextOficinas); })
      .catch((error) => setNotice(error.message));
  }, [booking.seccionId]);

  useEffect(() => {
    if (!booking.tipoId) { setRequisitos([]); setAnswers({}); return; }
    request(`/tramites/requisitos/${booking.tipoId}`).then((rows) => { setRequisitos(rows); setAnswers({}); }).catch((error) => setNotice(error.message));
  }, [booking.tipoId]);

  useEffect(() => {
    if (!booking.oficinaId || !booking.fecha) { setOcupados([]); setBooking((current) => ({ ...current, turno: "" })); return; }
    request(`/tramites/disponibilidad?oficinaId=${booking.oficinaId}&fecha=${booking.fecha}`)
      .then((data) => { setOcupados(data.ocupados); setBooking((current) => ({ ...current, turno: "" })); })
      .catch((error) => setNotice(error.message));
  }, [booking.oficinaId, booking.fecha]);

  useEffect(() => {
    if (!session?.token) return;
    request("/tramites/mis", { headers: authHeaders(session.token) }).then(setHistory).catch((error) => setNotice(error.message));
  }, [session]);

  function setField(name, value) { setForm((current) => ({ ...current, [name]: value })); }
  function setBookingField(name, value) { setBooking((current) => ({ ...current, [name]: value, ...(name === "seccionId" ? { tipoId: "", oficinaId: "", fecha: "", turno: "" } : {}), ...(name === "tipoId" ? { fecha: "", turno: "" } : {}), ...(name === "oficinaId" ? { turno: "" } : {}) })); }

  async function submitAuth(event) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      const result = await request(`/auth/${mode}`, { method: "POST", body: JSON.stringify(form) });
      setSession(result); window.localStorage.setItem("tramites-session", JSON.stringify(result));
      setNotice(`Hola, ${result.user.name}. Ya podés gestionar tus trámites.`);
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  async function submitBooking(event) {
    event.preventDefault(); if (!session) return;
    setBusy(true); setNotice("");
    try {
      await request("/tramites", { method: "POST", headers: authHeaders(session.token), body: JSON.stringify({ tipoId: Number(booking.tipoId), oficinaId: Number(booking.oficinaId), turno: booking.turno, respuestas: answers }) });
      setNotice("El turno quedó reservado. Podés ver la solicitud en tu historial.");
      setBooking({ seccionId: "", tipoId: "", oficinaId: "", fecha: "", turno: "" });
      setAnswers({}); setHistory(await request("/tramites/mis", { headers: authHeaders(session.token) }));
    } catch (error) { setNotice(error.message); }
    finally { setBusy(false); }
  }

  async function cancel(id) {
    setNotice("");
    try { await request(`/tramites/${id}/cancelar`, { method: "POST", headers: authHeaders(session.token) }); setHistory(await request("/tramites/mis", { headers: authHeaders(session.token) })); setNotice("Solicitud cancelada. El turno quedó disponible."); }
    catch (error) { setNotice(error.message); }
  }

  function logout() { setSession(null); setHistory([]); window.localStorage.removeItem("tramites-session"); setNotice("Sesión cerrada."); }

  if (!session) return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">PORTAL CIUDADANO · DEMOSTRACIÓN</p>
        <h1>Trámites en Línea</h1>
        <p className="intro">Solicitá un turno para una gestión y consultá su estado desde un solo lugar.</p>
        <div className="tabs" role="tablist">
          <button className={mode === "login" ? "tab active" : "tab"} onClick={() => { setMode("login"); setNotice(""); }}>Ingresar</button>
          <button className={mode === "register" ? "tab active" : "tab"} onClick={() => { setMode("register"); setNotice(""); }}>Crear cuenta</button>
        </div>
        <form onSubmit={submitAuth} className="stack">
          {mode === "register" && <>
            <label>Nombre completo<input required maxLength="120" value={form.name} onChange={(e) => setField("name", e.target.value)} /></label>
            <label>DNI<input required inputMode="numeric" pattern="[0-9]{7,10}" value={form.dni} onChange={(e) => setField("dni", e.target.value)} /></label>
            <label>Fecha de nacimiento<input required type="date" max={localDateString()} value={form.birthDate} onChange={(e) => setField("birthDate", e.target.value)} /></label>
          </>}
          <label>Correo electrónico<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setField("email", e.target.value)} /></label>
          <label>Contraseña<input required type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 10 : 1} value={form.password} onChange={(e) => setField("password", e.target.value)} /></label>
          <button className="primary" disabled={busy}>{busy ? "Procesando…" : mode === "login" ? "Ingresar" : "Crear cuenta"}</button>
        </form>
        <p className="demo-note">Demo académica con datos ficticios. No ingreses información personal real.</p>
        {notice && <p className="notice" role="status">{notice}</p>}
      </section>
    </main>
  );

  return (
    <main className="page-shell">
      <header className="topbar"><div><p className="eyebrow">PORTAL CIUDADANO · DEMOSTRACIÓN</p><h1>Trámites en Línea</h1></div><div className="account"><span>Hola, {session.user.name}</span><button className="quiet" onClick={logout}>Cerrar sesión</button></div></header>
      <p className="privacy-banner">Entorno académico. Usá datos ficticios, no datos personales reales.</p>
      {notice && <p className="notice" role="status">{notice}</p>}
      <div className="columns">
        <section className="panel">
          <p className="eyebrow">NUEVA SOLICITUD</p><h2>Elegí tu trámite y turno</h2>
          <form className="stack" onSubmit={submitBooking}>
            <label>Sección<select required value={booking.seccionId} onChange={(e) => setBookingField("seccionId", e.target.value)}><option value="">Seleccioná una sección</option>{secciones.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
            <label>Tipo de trámite<select required disabled={!booking.seccionId} value={booking.tipoId} onChange={(e) => setBookingField("tipoId", e.target.value)}><option value="">Seleccioná una gestión</option>{tipos.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select></label>
            <label>Oficina<select required disabled={!booking.seccionId} value={booking.oficinaId} onChange={(e) => setBookingField("oficinaId", e.target.value)}><option value="">Seleccioná una oficina</option>{oficinas.map((item) => <option key={item.id} value={item.id}>{item.nombre} · {item.direccion}</option>)}</select></label>
            <div className="field-pair"><label>Fecha<input required type="date" min={localDateString()} value={booking.fecha} onChange={(e) => setBookingField("fecha", e.target.value)} /></label><label>Horario<select required disabled={!booking.fecha || !booking.oficinaId} value={booking.turno} onChange={(e) => setBookingField("turno", e.target.value)}><option value="">Elegí un horario</option>{availableSlots.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}</select></label></div>
            {requisitos.length > 0 && <div className="requirements"><h3>Datos requeridos</h3>{requisitos.map((item) => <label key={item.idReq}>{item.campo}<input required maxLength={250} value={answers[item.idReq] || ""} onChange={(e) => setAnswers((current) => ({ ...current, [item.idReq]: e.target.value }))} /></label>)}</div>}
            <p className="hint">Atención de lunes a viernes, de 09:00 a 17:00. Los turnos se asignan cada 30 minutos.</p>
            <button className="primary" disabled={busy}>{busy ? "Guardando…" : "Confirmar turno"}</button>
          </form>
        </section>
        <section className="panel history-panel"><p className="eyebrow">SEGUIMIENTO</p><h2>Mis trámites</h2>
          {history.length === 0 ? <p className="empty">Todavía no tenés solicitudes. Cuando reserves un turno, aparecerá acá.</p> : <div className="history-list">{history.map((item) => <article className="history-item" key={item.id}><div className="history-heading"><h3>{item.tipo}</h3><span className={`status ${item.estado === "Cancelado" ? "cancelled" : ""}`}>{item.estado}</span></div><p>{new Date(item.turno).toLocaleString("es-AR", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Argentina/Buenos_Aires" })}</p><p>{item.oficina} · {item.direccion}</p>{item.estado === "Pendiente" && <button className="cancel" onClick={() => cancel(item.id)}>Cancelar solicitud</button>}</article>)}</div>}
        </section>
      </div>
      <footer>Trabajo académico · Los datos de demostración no representan una plataforma oficial.</footer>
    </main>
  );
}
