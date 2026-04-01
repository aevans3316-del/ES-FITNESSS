import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

function getWeekLabel() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function initials(name) {
  return (name || "?")
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── AI FEEDBACK (non-blocking, fires after save) ────────────────────────────
async function generateAIFeedback(client, entry) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 220,
        messages: [
          {
            role: "user",
            content: `You are Evan from ESFITNESS — a strict, direct natural bodybuilding coach. Give ${client.name} their ${getWeekLabel()} check-in feedback in 3-4 sentences. Data: workout compliance ${entry.workout_pct}%, diet adherence ${entry.diet_pct}%, sleep ${entry.sleep_score}/10, energy ${entry.energy_score}/10, weight ${entry.weight_lbs}lbs. Goal: ${client.goal || "physique improvement"}. Be direct, specific, no fluff. Call out low compliance. Push hard if they're slacking.`,
          },
        ],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "Keep pushing. Review your compliance next week.";
  } catch {
    return "Check-in received. Stay consistent.";
  }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #080808;
  --surface: #0f0f0f;
  --surface2: #161616;
  --border: #1e1e1e;
  --border2: #2a2a2a;
  --text: #e8e8e8;
  --muted: #666;
  --dim: #333;
  --accent: #C8FF00;
  --accent-dim: rgba(200,255,0,0.08);
  --red: #ff5050;
  --orange: #ffaa00;
  --green: #4dff91;
  --font-display: 'Bebas Neue', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

/* scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

/* HEADER */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
}

.logo {
  font-family: var(--font-display);
  font-size: 26px;
  letter-spacing: 5px;
  color: var(--text);
}
.logo em { color: var(--accent); font-style: normal; }

.nav { display: flex; gap: 6px; }
.nav-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 7px 16px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s;
}
.nav-btn:hover { border-color: var(--border2); color: var(--text); }
.nav-btn.active { border-color: var(--accent); color: var(--accent); background: var(--accent-dim); }

/* PAGE LAYOUTS */
.page { max-width: 960px; margin: 0 auto; padding: 28px 24px; }
.page-narrow { max-width: 560px; margin: 0 auto; padding: 28px 24px; }

/* STAT CARDS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
@media(max-width:600px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 16px;
  position: relative;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: var(--accent);
}
.stat-card.warn::after { background: var(--orange); }
.stat-card.danger::after { background: var(--red); }
.stat-card.ok::after { background: var(--green); }

.stat-num {
  font-family: var(--font-display);
  font-size: 48px;
  line-height: 1;
  color: var(--accent);
}
.stat-card.warn .stat-num { color: var(--orange); }
.stat-card.danger .stat-num { color: var(--red); }
.stat-card.ok .stat-num { color: var(--green); }
.stat-label {
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  margin-top: 4px;
}

/* ALERT BAR */
.alert-bar {
  border: 1px solid rgba(255,170,0,0.25);
  background: rgba(255,170,0,0.05);
  padding: 12px 16px;
  font-size: 11px;
  color: var(--orange);
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

/* CLIENT LIST */
.client-list { display: flex; flex-direction: column; gap: 8px; }

.client-row {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.client-row:hover { border-color: var(--border2); background: var(--surface2); }

.avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--accent-dim);
  border: 1px solid rgba(200,255,0,0.2);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 1px;
  color: var(--accent);
  flex-shrink: 0;
}

.client-info { flex: 1; min-width: 0; }
.client-name { font-size: 14px; font-weight: 500; color: var(--text); }
.client-meta { font-size: 11px; color: var(--muted); margin-top: 3px; }

.badge {
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 4px 10px;
  border: 1px solid;
}
.badge.green { color: var(--green); border-color: rgba(77,255,145,0.3); background: rgba(77,255,145,0.05); }
.badge.yellow { color: var(--orange); border-color: rgba(255,170,0,0.3); background: rgba(255,170,0,0.05); }
.badge.red { color: var(--red); border-color: rgba(255,80,80,0.3); background: rgba(255,80,80,0.05); }
.badge.gray { color: var(--muted); border-color: var(--border); }

/* FORM */
.form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 28px;
}

.form-title {
  font-family: var(--font-display);
  font-size: 36px;
  letter-spacing: 3px;
  color: var(--text);
  margin-bottom: 4px;
}
.form-week {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 28px;
}

.field-group { margin-bottom: 20px; }
.field-label {
  display: block;
  font-size: 9px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 8px;
}
.field-input, .field-select, .field-textarea {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 10px 14px;
  outline: none;
  transition: border-color 0.15s;
}
.field-input:focus, .field-select:focus, .field-textarea:focus {
  border-color: var(--accent);
}
.field-select { cursor: pointer; }
.field-textarea { resize: vertical; min-height: 80px; line-height: 1.7; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media(max-width:500px) { .two-col { grid-template-columns: 1fr; } }

.slider-wrap { display: flex; align-items: center; gap: 14px; }
.slider-wrap input[type=range] {
  flex: 1;
  -webkit-appearance: none;
  height: 3px;
  background: var(--border2);
  outline: none;
  cursor: pointer;
}
.slider-wrap input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; height: 16px;
  background: var(--accent);
  border-radius: 50%;
}
.slider-val {
  font-family: var(--font-display);
  font-size: 28px;
  color: var(--accent);
  min-width: 52px;
  text-align: right;
}

.photo-drop {
  border: 1px dashed var(--border2);
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 1px;
}
.photo-drop:hover { border-color: var(--accent); color: var(--accent); }
.photo-thumbnails { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
.photo-thumb { width: 72px; height: 72px; object-fit: cover; border: 1px solid var(--border); }

.submit-btn {
  width: 100%;
  background: var(--accent);
  color: #000;
  border: none;
  padding: 14px;
  font-family: var(--font-display);
  font-size: 22px;
  letter-spacing: 4px;
  cursor: pointer;
  transition: opacity 0.15s;
  margin-top: 8px;
}
.submit-btn:hover { opacity: 0.88; }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* SUCCESS */
.success-card {
  background: var(--surface);
  border: 1px solid rgba(200,255,0,0.2);
  padding: 40px 28px;
  text-align: center;
}
.success-icon {
  font-family: var(--font-display);
  font-size: 72px;
  color: var(--accent);
  letter-spacing: 2px;
  margin-bottom: 12px;
}
.success-title { font-family: var(--font-display); font-size: 32px; letter-spacing: 3px; margin-bottom: 10px; }
.success-msg { font-size: 12px; color: var(--muted); line-height: 1.8; }

/* DETAIL VIEW */
.back-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.week-card {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 18px;
  margin-bottom: 10px;
}
.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.week-label { font-family: var(--font-display); font-size: 20px; letter-spacing: 2px; }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.metric {
  background: var(--surface2);
  border: 1px solid var(--border);
  padding: 10px;
}
.metric-val { font-family: var(--font-display); font-size: 26px; color: var(--text); letter-spacing: 1px; }
.metric-label { font-size: 9px; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 2px; }

.ai-feedback-box {
  background: var(--accent-dim);
  border: 1px solid rgba(200,255,0,0.1);
  padding: 14px;
  margin-bottom: 12px;
}
.ai-label { font-size: 8px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
.ai-text { font-size: 11px; color: #999; line-height: 1.9; }

.note-label { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
.coach-note {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 10px;
  outline: none;
  resize: vertical;
  min-height: 60px;
  line-height: 1.7;
}
.coach-note:focus { border-color: var(--accent); }
.save-note-btn {
  margin-top: 6px;
  background: none;
  border: 1px solid rgba(200,255,0,0.3);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  padding: 6px 14px;
  cursor: pointer;
  text-transform: uppercase;
}

/* ADD CLIENT */
.section-title {
  font-family: var(--font-display);
  font-size: 28px;
  letter-spacing: 3px;
  margin-bottom: 20px;
}

/* LOADING */
.loading {
  display: flex; align-items: center; justify-content: center;
  height: 200px;
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

/* AUTH */
.auth-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.auth-card {
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 36px;
  width: 100%;
  max-width: 400px;
}
.auth-logo {
  font-family: var(--font-display);
  font-size: 42px;
  letter-spacing: 6px;
  text-align: center;
  margin-bottom: 6px;
}
.auth-logo em { color: var(--accent); font-style: normal; }
.auth-sub { text-align: center; font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 32px; }
.auth-err { font-size: 11px; color: var(--red); margin-bottom: 14px; }
.mode-toggle { font-size: 11px; color: var(--muted); text-align: center; margin-top: 16px; cursor: pointer; }
.mode-toggle span { color: var(--accent); cursor: pointer; }

.divider { height: 1px; background: var(--border); margin: 16px 0; }
`;

// ─── AUTH VIEW ────────────────────────────────────────────────────────────────
function AuthView({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit() {
    setError(""); setMsg("");
    if (!email || !password) { setError("Email and password required."); return; }
    setLoading(true);
    if (mode === "signup") {
      const { error: e } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: name || email.split("@")[0], role } },
      });
      if (e) setError(e.message);
      else setMsg("Account created! Check your email to confirm, then sign in.");
    } else {
      const { data, error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) setError(e.message);
      else onAuth(data.session);
    }
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">ES<em>FIT</em></div>
        <div className="auth-sub">{mode === "login" ? "Coach & Client Portal" : "Create Account"}</div>
        {error && <div className="auth-err">⚠ {error}</div>}
        {msg && <div style={{ fontSize: 11, color: "var(--green)", marginBottom: 14 }}>{msg}</div>}
        {mode === "signup" && (
          <>
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
            </div>
            <div className="field-group">
              <label className="field-label">Role</label>
              <select className="field-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="client">Client</option>
                <option value="coach">Coach (Evan)</option>
              </select>
            </div>
          </>
        )}
        <div className="field-group">
          <label className="field-label">Email</label>
          <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div className="field-group">
          <label className="field-label">Password</label>
          <input className="field-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>
        <div className="mode-toggle">
          {mode === "login" ? <>No account? <span onClick={() => setMode("signup")}>Sign up</span></> : <>Have an account? <span onClick={() => setMode("login")}>Sign in</span></>}
        </div>
      </div>
    </div>
  );
}

// ─── COACH DASHBOARD ─────────────────────────────────────────────────────────
function CoachDashboard({ user }) {
  const [clients, setClients] = useState([]);
  const [checkins, setCheckins] = useState({});
  const [view, setView] = useState("dashboard"); // dashboard | detail | add
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: cl } = await supabase.from("clients").select("*").order("created_at");
    setClients(cl || []);
    const { data: ci } = await supabase.from("checkins").select("*").order("week_label, created_at");
    const grouped = {};
    (ci || []).forEach(c => {
      if (!grouped[c.client_id]) grouped[c.client_id] = {};
      grouped[c.client_id][c.week_label] = c;
    });
    setCheckins(grouped);
    setLoading(false);
  }

  const week = getWeekLabel();
  const checkedIn = clients.filter(c => checkins[c.id]?.[week]);
  const missing = clients.filter(c => !checkins[c.id]?.[week]);

  function getStatus(client) {
    if (checkins[client.id]?.[week]) {
      const pct = checkins[client.id][week].workout_pct;
      if (pct >= 80) return "green";
      if (pct >= 50) return "yellow";
      return "red";
    }
    return "gray";
  }

  function getStatusLabel(client) {
    if (checkins[client.id]?.[week]) {
      const pct = checkins[client.id][week].workout_pct;
      if (pct >= 80) return "On track";
      if (pct >= 50) return "Needs work";
      return "Off track";
    }
    return "No check-in";
  }

  if (loading) return <div className="loading">Loading...</div>;

  if (view === "add") return <AddClient onBack={() => { setView("dashboard"); fetchData(); }} />;
  if (view === "detail" && selectedClient) return (
    <ClientDetail
      client={selectedClient}
      checkins={checkins[selectedClient.id] || {}}
      onBack={() => setView("dashboard")}
      onRefresh={fetchData}
    />
  );

  return (
    <div className="page">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num">{clients.length}</div><div className="stat-label">Total Clients</div></div>
        <div className="stat-card ok"><div className="stat-num">{checkedIn.length}</div><div className="stat-label">Checked In</div></div>
        <div className={`stat-card ${missing.length ? "warn" : "ok"}`}><div className="stat-num">{missing.length}</div><div className="stat-label">Missing</div></div>
        <div className="stat-card"><div className="stat-num">{clients.length ? Math.round((checkedIn.length / clients.length) * 100) : 0}%</div><div className="stat-label">Compliance</div></div>
      </div>

      {missing.length > 0 && (
        <div className="alert-bar">
          ⚠ &nbsp;Missing this week: {missing.map(c => c.name).join(", ")}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: 2, textTransform: "uppercase" }}>Week {week}</div>
        <button className="nav-btn active" onClick={() => setView("add")}>+ Add Client</button>
      </div>

      <div className="client-list">
        {clients.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 12, padding: "40px 0", textAlign: "center" }}>
            No clients yet. Add one to get started.
          </div>
        )}
        {clients.map(c => (
          <div key={c.id} className="client-row" onClick={() => { setSelectedClient(c); setView("detail"); }}>
            <div className="avatar">{initials(c.name)}</div>
            <div className="client-info">
              <div className="client-name">{c.name}</div>
              <div className="client-meta">{c.goal || "No goal set"} · {Object.keys(checkins[c.id] || {}).length} check-ins</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`badge ${getStatus(c)}`}>{getStatusLabel(c)}</span>
              <span style={{ color: "var(--muted)", fontSize: 18 }}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────
function ClientDetail({ client, checkins, onBack, onRefresh }) {
  const weeks = Object.keys(checkins).sort().reverse();
  const [notes, setNotes] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    const n = {};
    weeks.forEach(w => { n[w] = checkins[w].coach_note || ""; });
    setNotes(n);
  }, []);

  async function saveNote(week) {
    await supabase.from("checkins").update({ coach_note: notes[week] }).eq("id", checkins[week].id);
    setSaved(s => ({ ...s, [week]: true }));
    setTimeout(() => setSaved(s => ({ ...s, [week]: false })), 2000);
  }

  function getBadgeClass(pct) {
    if (pct >= 80) return "green";
    if (pct >= 50) return "yellow";
    return "red";
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← Back to dashboard</button>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div className="avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{initials(client.name)}</div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 30, letterSpacing: 3 }}>{client.name}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{client.goal || "No goal set"} · {client.email}</div>
        </div>
      </div>

      {weeks.length === 0 && <div style={{ color: "var(--muted)", fontSize: 12 }}>No check-ins yet.</div>}

      {weeks.map(w => {
        const d = checkins[w];
        return (
          <div key={w} className="week-card">
            <div className="week-header">
              <div className="week-label">{w}</div>
              <span className={`badge ${getBadgeClass(d.workout_pct)}`}>{d.workout_pct}% workout</span>
            </div>

            <div className="metrics-grid">
              <div className="metric"><div className="metric-val">{d.weight_lbs || "—"}</div><div className="metric-label">lbs</div></div>
              <div className="metric"><div className="metric-val">{d.workout_pct}%</div><div className="metric-label">Workout</div></div>
              <div className="metric"><div className="metric-val">{d.diet_pct}%</div><div className="metric-label">Diet</div></div>
              <div className="metric"><div className="metric-val">{d.sleep_score}/10</div><div className="metric-label">Sleep</div></div>
              <div className="metric"><div className="metric-val">{d.energy_score}/10</div><div className="metric-label">Energy</div></div>
              {d.measurements && <div className="metric"><div className="metric-val" style={{ fontSize: 13 }}>{d.measurements}</div><div className="metric-label">Measurements</div></div>}
            </div>

            {d.notes && (
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, lineHeight: 1.8, borderLeft: "2px solid var(--border2)", paddingLeft: 12 }}>
                {d.notes}
              </div>
            )}

            {d.photos && d.photos.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {d.photos.map((url, i) => <img key={i} src={url} alt="" className="photo-thumb" />)}
              </div>
            )}

            <div className="ai-feedback-box">
              <div className="ai-label">Coach Feedback</div>
              <div className="ai-text">{d.ai_feedback || "Generating feedback..."}</div>
            </div>

            <div>
              <div className="note-label">Your personal note</div>
              <textarea
                className="coach-note"
                value={notes[w] || ""}
                onChange={e => setNotes(n => ({ ...n, [w]: e.target.value }))}
                placeholder={`Add a note for ${client.name}...`}
              />
              <button className="save-note-btn" onClick={() => saveNote(w)}>
                {saved[w] ? "✓ Saved" : "Save Note"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── ADD CLIENT ───────────────────────────────────────────────────────────────
function AddClient({ onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [goal, setGoal] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd() {
    if (!name || !email) { setError("Name and email are required."); return; }
    setLoading(true); setError("");
    const { error: e } = await supabase.from("clients").insert({ name, email, goal, phone });
    if (e) setError(e.message);
    else onBack();
    setLoading(false);
  }

  return (
    <div className="page-narrow">
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="section-title">Add Client</div>
      <div className="form-card">
        {error && <div className="auth-err" style={{ marginBottom: 16 }}>⚠ {error}</div>}
        <div className="field-group">
          <label className="field-label">Full Name</label>
          <input className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
        </div>
        <div className="field-group">
          <label className="field-label">Email</label>
          <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="client@email.com" />
        </div>
        <div className="field-group">
          <label className="field-label">Phone (for reminders)</label>
          <input className="field-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 305 555 0100" />
        </div>
        <div className="field-group">
          <label className="field-label">Goal</label>
          <input className="field-input" value={goal} onChange={e => setGoal(e.target.value)} placeholder="Lean bulk, cut, recomp..." />
        </div>
        <button className="submit-btn" onClick={handleAdd} disabled={loading}>
          {loading ? "..." : "ADD CLIENT"}
        </button>
      </div>
    </div>
  );
}

// ─── CLIENT CHECK-IN FORM ─────────────────────────────────────────────────────
function CheckInForm({ user }) {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [weight, setWeight] = useState("");
  const [measurements, setMeasurements] = useState("");
  const [workout, setWorkout] = useState(70);
  const [diet, setDiet] = useState(70);
  const [sleep, setSleep] = useState(7);
  const [energy, setEnergy] = useState(7);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    supabase.from("clients").select("id, name").order("name").then(({ data }) => {
      setClients(data || []);
      // Auto-select if user is a client
      if (data && user?.user_metadata?.role === "client") {
        const match = data.find(c => c.email === user.email);
        if (match) setClientId(match.id);
      }
    });
  }, []);

  function handlePhotos(files) {
    const newPhotos = Array.from(files);
    setPhotos(p => [...p, ...newPhotos]);
    newPhotos.forEach(f => {
      const r = new FileReader();
      r.onload = e => setPhotoUrls(u => [...u, e.target.result]);
      r.readAsDataURL(f);
    });
  }

  async function uploadPhotos(cid) {
    const urls = [];
    for (const photo of photos) {
      const path = `${cid}/${getWeekLabel()}/${Date.now()}-${photo.name}`;
      const { error } = await supabase.storage.from("progress-photos").upload(path, photo);
      if (!error) {
        const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  async function handleSubmit() {
    if (!clientId) { setError("Select your name first."); return; }
    setSubmitting(true); setError("");

    // Upload photos
    let uploadedUrls = [];
    if (photos.length) {
      uploadedUrls = await uploadPhotos(clientId);
    }

    const entry = {
      client_id: clientId,
      week_label: getWeekLabel(),
      weight_lbs: weight ? parseFloat(weight) : null,
      measurements,
      workout_pct: parseInt(workout),
      diet_pct: parseInt(diet),
      sleep_score: parseInt(sleep),
      energy_score: parseInt(energy),
      notes,
      photos: uploadedUrls,
      ai_feedback: null,
    };

    // INSTANT SAVE — don't wait for AI
    const { data: saved, error: e } = await supabase
      .from("checkins")
      .upsert(entry, { onConflict: "client_id,week_label" })
      .select()
      .single();

    if (e) { setError(e.message); setSubmitting(false); return; }

    setSubmitting(false);
    setDone(true);

    // Fire AI feedback in background — non-blocking
    const client = clients.find(c => c.id === clientId);
    if (client && saved) {
      generateAIFeedback(client, entry).then(async (feedback) => {
        await supabase.from("checkins").update({ ai_feedback: feedback }).eq("id", saved.id);
      });
    }
  }

  if (done) {
    return (
      <div className="page-narrow">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <div className="success-title">CHECK-IN RECEIVED</div>
          <div className="success-msg">
            Week {getWeekLabel()} logged.<br />
            Evan will review your data and drop feedback in your file.
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="nav-btn" onClick={() => { setDone(false); setWeight(""); setMeasurements(""); setNotes(""); setPhotos([]); setPhotoUrls([]); setWorkout(70); setDiet(70); setSleep(7); setEnergy(7); }}>
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <div className="form-card">
        <div className="form-title">WEEKLY CHECK-IN</div>
        <div className="form-week">Week {getWeekLabel()}</div>

        {error && <div className="auth-err" style={{ marginBottom: 16 }}>⚠ {error}</div>}

        <div className="field-group">
          <label className="field-label">Your Name</label>
          <select className="field-select" value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">— Select your name —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="two-col">
          <div className="field-group">
            <label className="field-label">Weight (lbs)</label>
            <input className="field-input" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="175" />
          </div>
          <div className="field-group">
            <label className="field-label">Measurements</label>
            <input className="field-input" value={measurements} onChange={e => setMeasurements(e.target.value)} placeholder='waist 32", arms 15"' />
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Workout Compliance — {workout}%</label>
          <div className="slider-wrap">
            <input type="range" min="0" max="100" value={workout} onChange={e => setWorkout(e.target.value)} />
            <div className="slider-val">{workout}%</div>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Diet Adherence — {diet}%</label>
          <div className="slider-wrap">
            <input type="range" min="0" max="100" value={diet} onChange={e => setDiet(e.target.value)} />
            <div className="slider-val">{diet}%</div>
          </div>
        </div>

        <div className="two-col">
          <div className="field-group">
            <label className="field-label">Sleep Quality — {sleep}/10</label>
            <div className="slider-wrap">
              <input type="range" min="1" max="10" value={sleep} onChange={e => setSleep(e.target.value)} />
              <div className="slider-val" style={{ fontSize: 22 }}>{sleep}/10</div>
            </div>
          </div>
          <div className="field-group">
            <label className="field-label">Energy Level — {energy}/10</label>
            <div className="slider-wrap">
              <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(e.target.value)} />
              <div className="slider-val" style={{ fontSize: 22 }}>{energy}/10</div>
            </div>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Progress Photos</label>
          <input type="file" ref={fileRef} multiple accept="image/*" style={{ display: "none" }} onChange={e => handlePhotos(e.target.files)} />
          <div className="photo-drop" onClick={() => fileRef.current.click()}>
            📸 &nbsp;Tap to upload · Front · Back · Side
          </div>
          {photoUrls.length > 0 && (
            <div className="photo-thumbnails">
              {photoUrls.map((url, i) => <img key={i} className="photo-thumb" src={url} alt="" />)}
            </div>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Notes / Anything to Flag</label>
          <textarea className="field-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Injuries, stress, missed days, travel..." />
        </div>

        <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "SAVING..." : "SUBMIT CHECK-IN"}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tab, setTab] = useState("checkin");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        const role = data.session.user.user_metadata?.role || "client";
        setUserRole(role);
        setTab(role === "coach" ? "coach" : "checkin");
      }
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      if (s) {
        const role = s.user.user_metadata?.role || "client";
        setUserRole(role);
        setTab(role === "coach" ? "coach" : "checkin");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null); setUserRole(null);
  }

  if (authLoading) return (
    <>
      <style>{styles}</style>
      <div className="loading">Loading...</div>
    </>
  );

  if (!session) return (
    <>
      <style>{styles}</style>
      <AuthView onAuth={s => { setSession(s); }} />
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="header">
        <div className="logo">ES<em>FITNESS</em></div>
        <div className="nav">
          {userRole === "coach" && (
            <button className={`nav-btn ${tab === "coach" ? "active" : ""}`} onClick={() => setTab("coach")}>
              Dashboard
            </button>
          )}
          <button className={`nav-btn ${tab === "checkin" ? "active" : ""}`} onClick={() => setTab("checkin")}>
            Check-In
          </button>
          <button className="nav-btn" onClick={handleSignOut}>Sign Out</button>
        </div>
      </div>

      {tab === "coach" && userRole === "coach" && <CoachDashboard user={session.user} />}
      {tab === "checkin" && <CheckInForm user={session.user} />}
    </>
  );
}
