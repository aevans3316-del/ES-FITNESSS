import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

const COACH_EMAIL = process.env.REACT_APP_COACH_EMAIL || "esfitnesscoachingg@gmail.com";

function getWeekLabel() {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function initials(name) {
  return (name || "?").trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

async function generateAIFeedback(clientName, goal, entry) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 220,
        messages: [{
          role: "user",
          content: `You are Evan from ESFITNESS — a strict, direct natural bodybuilding coach. Give ${clientName} their ${getWeekLabel()} check-in feedback in 3-4 sentences. Data: workout compliance ${entry.workout_pct}%, diet adherence ${entry.diet_pct}%, sleep ${entry.sleep_score}/10, energy ${entry.energy_score}/10, weight ${entry.weight_lbs}lbs. Goal: ${goal || "physique improvement"}. Be direct, specific, no fluff. Call out low compliance hard.`
        }]
      })
    });
    const data = await res.json();
    return data.content?.[0]?.text || "Check-in received. Stay consistent.";
  } catch { return "Check-in received. Keep pushing."; }
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#050508;--surface:#0a0a10;--surface2:#0f0f18;
  --border:#1a1a2a;--border2:#252538;
  --text:#e8e8f0;--muted:#5a5a7a;--dim:#2a2a3a;
  --accent:#D4A017;--accent-dim:rgba(212,160,23,0.08);
  --blue:#3B82F6;--blue-dim:rgba(59,130,246,0.08);
  --red:#ff5050;--orange:#D4A017;--green:#3B82F6;
  --font-d:'Bebas Neue',sans-serif;--font-m:'IBM Plex Mono',monospace;
}
body{background:var(--bg);color:var(--text);font-family:var(--font-m);min-height:100vh;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border2)}

.header{position:sticky;top:0;z-index:100;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:14px 24px}
.logo{font-family:var(--font-d);font-size:26px;letter-spacing:5px}
.logo em{color:var(--accent);font-style:normal}
.nav{display:flex;gap:6px}
.nav-btn{background:none;border:1px solid var(--border);color:var(--muted);padding:7px 16px;font-family:var(--font-m);font-size:10px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;transition:all 0.15s}
.nav-btn:hover{border-color:var(--border2);color:var(--text)}
.nav-btn.active{border-color:var(--accent);color:var(--accent);background:var(--accent-dim)}
.nav-btn.danger{border-color:rgba(255,80,80,0.4);color:var(--red)}

.page{max-width:960px;margin:0 auto;padding:28px 24px}
.page-narrow{max-width:560px;margin:0 auto;padding:28px 24px}

.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
@media(max-width:600px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
.stat-card{background:var(--surface);border:1px solid var(--border);padding:16px;position:relative;overflow:hidden}
.stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--accent)}
.stat-card.warn::after{background:var(--accent)}.stat-card.danger::after{background:var(--red)}.stat-card.ok::after{background:var(--blue)}
.stat-num{font-family:var(--font-d);font-size:48px;line-height:1;color:var(--accent)}
.stat-card.warn .stat-num{color:var(--accent)}.stat-card.danger .stat-num{color:var(--red)}.stat-card.ok .stat-num{color:var(--blue)}
.stat-label{font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:4px}

.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.section-title{font-family:var(--font-d);font-size:22px;letter-spacing:2px}
.alert-bar{border:1px solid rgba(212,160,23,0.25);background:rgba(212,160,23,0.05);padding:12px 16px;font-size:11px;color:var(--accent);letter-spacing:0.5px;margin-bottom:16px}

.list{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
.row{background:var(--surface);border:1px solid var(--border);padding:14px 18px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:border-color 0.15s,background 0.15s}
.row:hover{border-color:var(--border2);background:var(--surface2)}
.row.pending{border-color:rgba(255,170,0,0.2);cursor:default}
.row.pending:hover{background:var(--surface)}

.avatar{width:40px;height:40px;border-radius:50%;background:var(--accent-dim);border:1px solid rgba(212,160,23,0.25);display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-size:16px;letter-spacing:1px;color:var(--accent);flex-shrink:0}
.avatar.orange{background:rgba(59,130,246,0.08);border-color:rgba(59,130,246,0.25);color:var(--blue)}
.info{flex:1;min-width:0}
.name{font-size:14px;font-weight:500;color:var(--text)}
.meta{font-size:11px;color:var(--muted);margin-top:3px}

.badge{font-size:9px;letter-spacing:1.5px;text-transform:uppercase;padding:4px 10px;border:1px solid}
.badge.green{color:var(--blue);border-color:rgba(59,130,246,0.35);background:rgba(59,130,246,0.06)}
.badge.yellow{color:var(--accent);border-color:rgba(212,160,23,0.35);background:rgba(212,160,23,0.06)}
.badge.red{color:var(--red);border-color:rgba(255,80,80,0.3);background:rgba(255,80,80,0.05)}
.badge.gray{color:var(--muted);border-color:var(--border)}
.badge.orange{color:var(--blue);border-color:rgba(59,130,246,0.35);background:rgba(59,130,246,0.06)}

.approve-btns{display:flex;gap:6px}
.approve-btn{background:none;border:1px solid;padding:5px 12px;font-family:var(--font-m);font-size:10px;letter-spacing:1px;cursor:pointer;text-transform:uppercase}
.approve-btn.yes{border-color:rgba(59,130,246,0.4);color:var(--blue)}
.approve-btn.yes:hover{background:rgba(59,130,246,0.08)}
.approve-btn.no{border-color:rgba(255,80,80,0.4);color:var(--red)}
.approve-btn.no:hover{background:rgba(255,80,80,0.08)}

.form-card{background:var(--surface);border:1px solid var(--border);padding:28px}
.form-title{font-family:var(--font-d);font-size:36px;letter-spacing:3px;margin-bottom:4px}
.form-week{font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:28px}
.fg{margin-bottom:20px}
.flbl{display:block;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
.finput,.fsel,.fta{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--font-m);font-size:13px;padding:10px 14px;outline:none;transition:border-color 0.15s}
.finput:focus,.fsel:focus,.fta:focus{border-color:var(--accent)}
.fsel{cursor:pointer}.fta{resize:vertical;min-height:80px;line-height:1.7}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:14px}
@media(max-width:500px){.two-col{grid-template-columns:1fr}}

.slider-wrap{display:flex;align-items:center;gap:14px}
.slider-wrap input[type=range]{flex:1;-webkit-appearance:none;height:3px;background:var(--border2);outline:none;cursor:pointer}
.slider-wrap input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:var(--accent);border-radius:50%}
.slider-val{font-family:var(--font-d);font-size:28px;color:var(--accent);min-width:52px;text-align:right}

.photo-drop{border:1px dashed var(--border2);padding:24px;text-align:center;cursor:pointer;transition:border-color 0.15s;font-size:11px;color:var(--muted);letter-spacing:1px}
.photo-drop:hover{border-color:var(--accent);color:var(--accent)}
.photo-thumbs{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.photo-thumb{width:72px;height:72px;object-fit:cover;border:1px solid var(--border)}

.submit-btn{width:100%;background:var(--accent);color:#000;border:none;padding:14px;font-family:var(--font-d);font-size:22px;letter-spacing:4px;cursor:pointer;transition:opacity 0.15s;margin-top:8px}
.submit-btn:hover{opacity:0.88}.submit-btn:disabled{opacity:0.4;cursor:not-allowed}

.back-btn{background:none;border:none;color:var(--accent);font-family:var(--font-m);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;cursor:pointer;padding:0;margin-bottom:20px}

.week-card{background:var(--surface);border:1px solid var(--border);padding:18px;margin-bottom:10px}
.week-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.week-lbl{font-family:var(--font-d);font-size:20px;letter-spacing:2px}
.metrics-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.metric{background:var(--surface2);border:1px solid var(--border);padding:10px}
.metric-val{font-family:var(--font-d);font-size:26px;letter-spacing:1px}
.metric-lbl{font-size:9px;color:var(--muted);letter-spacing:1.5px;text-transform:uppercase;margin-top:2px}
.ai-box{background:var(--accent-dim);border:1px solid rgba(212,160,23,0.12);padding:14px;margin-bottom:12px}
.ai-lbl{font-size:8px;letter-spacing:2.5px;text-transform:uppercase;color:var(--accent);margin-bottom:8px}
.ai-txt{font-size:11px;color:#999;line-height:1.9}
.coach-note{width:100%;background:var(--bg);border:1px solid var(--border);color:var(--text);font-family:var(--font-m);font-size:11px;padding:10px;outline:none;resize:vertical;min-height:60px;line-height:1.7}
.coach-note:focus{border-color:var(--accent)}
.save-note-btn{margin-top:6px;background:none;border:1px solid rgba(212,160,23,0.3);color:var(--accent);font-family:var(--font-m);font-size:10px;letter-spacing:1px;padding:6px 14px;cursor:pointer;text-transform:uppercase}

.auth-wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
.auth-card{background:var(--surface);border:1px solid var(--border);padding:36px;width:100%;max-width:400px}
.auth-logo{font-family:var(--font-d);font-size:42px;letter-spacing:6px;text-align:center;margin-bottom:6px}
.auth-logo em{color:var(--accent);font-style:normal}
.auth-sub{text-align:center;font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:32px}
.auth-err{font-size:11px;color:var(--red);margin-bottom:14px}
.auth-ok{font-size:11px;color:var(--green);margin-bottom:14px}
.mode-toggle{font-size:11px;color:var(--muted);text-align:center;margin-top:16px;cursor:pointer}
.mode-toggle span{color:var(--accent);cursor:pointer;text-decoration:underline}

.pending-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.pending-card{background:var(--surface);border:1px solid rgba(59,130,246,0.2);padding:40px 36px;max-width:420px;width:100%;text-align:center}
.pending-icon{font-family:var(--font-d);font-size:64px;color:var(--blue);letter-spacing:2px;margin-bottom:12px}
.pending-title{font-family:var(--font-d);font-size:28px;letter-spacing:3px;margin-bottom:12px}
.pending-msg{font-size:12px;color:var(--muted);line-height:1.9}

.rejected-card{background:var(--surface);border:1px solid rgba(255,80,80,0.2);padding:40px 36px;max-width:420px;width:100%;text-align:center}
.rejected-icon{font-family:var(--font-d);font-size:64px;color:var(--red);letter-spacing:2px;margin-bottom:12px}

.success-card{background:var(--surface);border:1px solid rgba(212,160,23,0.2);padding:40px 28px;text-align:center}
.success-icon{font-family:var(--font-d);font-size:72px;color:var(--accent);letter-spacing:2px;margin-bottom:12px}
.success-title{font-family:var(--font-d);font-size:32px;letter-spacing:3px;margin-bottom:10px}
.success-msg{font-size:12px;color:var(--muted);line-height:1.8}

.loading{display:flex;align-items:center;justify-content:center;height:200px;color:var(--muted);font-size:11px;letter-spacing:2px;text-transform:uppercase}
`;

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function AuthView({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  async function handle() {
    setError(""); setMsg("");
    if (!email || !password) { setError("Email and password required."); return; }
    setLoading(true);

    if (mode === "signup") {
      if (!name.trim()) { setError("Name is required."); setLoading(false); return; }
      const { error: e } = await supabase.auth.signUp({
        email, password,
        options: { data: { name: name.trim(), role: "client" } }
      });
      if (e) setError(e.message);
      else setMsg("Account created! Check your email to confirm it, then sign in. Evan will approve your access.");
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
        <div className="auth-sub">{mode === "login" ? "Sign in to your account" : "Request access"}</div>
        {error && <div className="auth-err">⚠ {error}</div>}
        {msg && <div className="auth-ok">✓ {msg}</div>}
        {mode === "signup" && (
          <div className="fg">
            <label className="flbl">Full Name</label>
            <input className="finput" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" />
          </div>
        )}
        <div className="fg">
          <label className="flbl">Email</label>
          <input className="finput" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
        </div>
        <div className="fg">
          <label className="flbl">Password</label>
          <input className="finput" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
            onKeyDown={e => e.key === "Enter" && handle()} />
        </div>
        <button className="submit-btn" onClick={handle} disabled={loading}>
          {loading ? "..." : mode === "login" ? "SIGN IN" : "REQUEST ACCESS"}
        </button>
        <div className="mode-toggle" style={{ marginTop: 16 }}>
          {mode === "login"
            ? <>No account? <span onClick={() => { setMode("signup"); setError(""); setMsg(""); }}>Request access</span></>
            : <>Have an account? <span onClick={() => { setMode("login"); setError(""); setMsg(""); }}>Sign in</span></>}
        </div>
      </div>
    </div>
  );
}

// ─── PENDING SCREEN ───────────────────────────────────────────────────────────
function PendingScreen({ onSignOut }) {
  return (
    <div className="pending-screen">
      <div className="pending-card">
        <div className="pending-icon">⏳</div>
        <div className="pending-title">PENDING APPROVAL</div>
        <div className="pending-msg">
          Your account is waiting for Evan to approve your access.<br /><br />
          You'll be able to submit check-ins once approved. This usually happens within 24 hours.
        </div>
        <button className="nav-btn" style={{ marginTop: 24 }} onClick={onSignOut}>Sign Out</button>
      </div>
    </div>
  );
}

// ─── REJECTED SCREEN ──────────────────────────────────────────────────────────
function RejectedScreen({ onSignOut }) {
  return (
    <div className="pending-screen">
      <div className="rejected-card">
        <div className="rejected-icon">✗</div>
        <div className="pending-title">ACCESS DENIED</div>
        <div className="pending-msg">
          Your request was not approved.<br /><br />
          Contact Evan directly if you think this is a mistake.
        </div>
        <button className="nav-btn" style={{ marginTop: 24 }} onClick={onSignOut}>Sign Out</button>
      </div>
    </div>
  );
}

// ─── COACH DASHBOARD ──────────────────────────────────────────────────────────
function CoachDashboard({ user }) {
  const [clients, setClients] = useState([]);
  const [pending, setPending] = useState([]);
  const [checkins, setCheckins] = useState({});
  const [view, setView] = useState("dashboard");
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const { data: cl } = await supabase.from("clients").select("*").eq("status", "approved").order("created_at");
    const { data: pend } = await supabase.from("clients").select("*").eq("status", "pending").order("created_at");
    const { data: ci } = await supabase.from("checkins").select("*").order("week_label,created_at");
    setClients(cl || []);
    setPending(pend || []);
    const grouped = {};
    (ci || []).forEach(c => {
      if (!grouped[c.client_id]) grouped[c.client_id] = {};
      grouped[c.client_id][c.week_label] = c;
    });
    setCheckins(grouped);
    setLoading(false);
  }

  async function approveClient(id) {
    await supabase.from("clients").update({ status: "approved" }).eq("id", id);
    fetchAll();
  }

  async function rejectClient(id) {
    await supabase.from("clients").update({ status: "rejected" }).eq("id", id);
    fetchAll();
  }

  const week = getWeekLabel();
  const checkedIn = clients.filter(c => checkins[c.id]?.[week]);
  const missing = clients.filter(c => !checkins[c.id]?.[week]);

  function statusBadge(client) {
    if (checkins[client.id]?.[week]) {
      const p = checkins[client.id][week].workout_pct;
      if (p >= 80) return <span className="badge green">On track</span>;
      if (p >= 50) return <span className="badge yellow">Needs work</span>;
      return <span className="badge red">Off track</span>;
    }
    return <span className="badge gray">No check-in</span>;
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (view === "detail" && selectedClient) return (
    <ClientDetail client={selectedClient} checkins={checkins[selectedClient.id] || {}} onBack={() => setView("dashboard")} />
  );

  return (
    <div className="page">
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num">{clients.length}</div><div className="stat-label">Active Clients</div></div>
        <div className="stat-card ok"><div className="stat-num">{checkedIn.length}</div><div className="stat-label">Checked In</div></div>
        <div className={`stat-card ${missing.length ? "warn" : "ok"}`}><div className="stat-num">{missing.length}</div><div className="stat-label">Missing</div></div>
        <div className={`stat-card ${pending.length ? "warn" : ""}`}><div className="stat-num">{pending.length}</div><div className="stat-label">Pending</div></div>
      </div>

      {missing.length > 0 && (
        <div className="alert-bar">⚠ &nbsp;Missing this week: {missing.map(c => c.name).join(", ")}</div>
      )}

      {/* PENDING APPROVALS */}
      {pending.length > 0 && (
        <>
          <div className="section-head">
            <div className="section-title" style={{ color: "var(--blue)" }}>Pending Approval</div>
          </div>
          <div className="list">
            {pending.map(c => (
              <div key={c.id} className="row pending">
                <div className="avatar orange">{initials(c.name)}</div>
                <div className="info">
                  <div className="name">{c.name}</div>
                  <div className="meta">{c.email} · Requested access</div>
                </div>
                <div className="approve-btns">
                  <button className="approve-btn yes" onClick={() => approveClient(c.id)}>✓ Approve</button>
                  <button className="approve-btn no" onClick={() => rejectClient(c.id)}>✗ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ACTIVE CLIENTS */}
      <div className="section-head">
        <div className="section-title">Clients — Week {week}</div>
      </div>
      <div className="list">
        {clients.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 12, padding: "30px 0", textAlign: "center" }}>
            No approved clients yet. Approve pending requests above.
          </div>
        )}
        {clients.map(c => (
          <div key={c.id} className="row" onClick={() => { setSelectedClient(c); setView("detail"); }}>
            <div className="avatar">{initials(c.name)}</div>
            <div className="info">
              <div className="name">{c.name}</div>
              <div className="meta">{c.goal || "No goal set"} · {Object.keys(checkins[c.id] || {}).length} check-ins</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {statusBadge(c)}
              <span style={{ color: "var(--muted)", fontSize: 18 }}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CLIENT DETAIL ────────────────────────────────────────────────────────────
function ClientDetail({ client, checkins, onBack }) {
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

  function badgeClass(p) { return p >= 80 ? "green" : p >= 50 ? "yellow" : "red"; }

  return (
    <div className="page">
      <button className="back-btn" onClick={onBack}>← Back to dashboard</button>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <div className="avatar" style={{ width: 52, height: 52, fontSize: 20, border: "1px solid rgba(212,160,23,0.3)" }}>{initials(client.name)}</div>
        <div>
          <div style={{ fontFamily: "var(--font-d)", fontSize: 30, letterSpacing: 3 }}>{client.name}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>{client.goal || "No goal set"} · {client.email}</div>
        </div>
      </div>

      {weeks.length === 0 && <div style={{ color: "var(--muted)", fontSize: 12 }}>No check-ins yet.</div>}
      {weeks.map(w => {
        const d = checkins[w];
        return (
          <div key={w} className="week-card">
            <div className="week-hdr">
              <div className="week-lbl">{w}</div>
              <span className={`badge ${badgeClass(d.workout_pct)}`}>{d.workout_pct}% workout</span>
            </div>
            <div className="metrics-grid">
              <div className="metric"><div className="metric-val">{d.weight_lbs || "—"}</div><div className="metric-lbl">lbs</div></div>
              <div className="metric"><div className="metric-val">{d.workout_pct}%</div><div className="metric-lbl">Workout</div></div>
              <div className="metric"><div className="metric-val">{d.diet_pct}%</div><div className="metric-lbl">Diet</div></div>
              <div className="metric"><div className="metric-val">{d.sleep_score}/10</div><div className="metric-lbl">Sleep</div></div>
              <div className="metric"><div className="metric-val">{d.energy_score}/10</div><div className="metric-lbl">Energy</div></div>
              {d.measurements && <div className="metric"><div className="metric-val" style={{ fontSize: 13 }}>{d.measurements}</div><div className="metric-lbl">Measurements</div></div>}
            </div>
            {d.notes && <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12, lineHeight: 1.8, borderLeft: "2px solid var(--border2)", paddingLeft: 12 }}>{d.notes}</div>}
            {d.photos?.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {d.photos.map((url, i) => <img key={i} src={url} alt="" className="photo-thumb" />)}
              </div>
            )}
            <div className="ai-box">
              <div className="ai-lbl">Coach Feedback</div>
              <div className="ai-txt">{d.ai_feedback || "Generating..."}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div className="flbl" style={{ marginBottom: 6 }}>Your personal note</div>
              <textarea className="coach-note" value={notes[w] || ""} onChange={e => setNotes(n => ({ ...n, [w]: e.target.value }))} placeholder={`Add a note for ${client.name}...`} />
              <button className="save-note-btn" onClick={() => saveNote(w)}>{saved[w] ? "✓ Saved" : "Save Note"}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── CLIENT CHECK-IN ──────────────────────────────────────────────────────────
function CheckInForm({ user, clientRecord }) {
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

  function handlePhotos(files) {
    Array.from(files).forEach(f => {
      setPhotos(p => [...p, f]);
      const r = new FileReader();
      r.onload = e => setPhotoUrls(u => [...u, e.target.result]);
      r.readAsDataURL(f);
    });
  }

  async function uploadPhotos() {
    const urls = [];
    for (const photo of photos) {
      const path = `${clientRecord.id}/${getWeekLabel()}/${Date.now()}-${photo.name}`;
      const { error } = await supabase.storage.from("progress-photos").upload(path, photo);
      if (!error) {
        const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  async function handleSubmit() {
    setSubmitting(true); setError("");
    let uploadedUrls = [];
    if (photos.length) uploadedUrls = await uploadPhotos();

    const entry = {
      client_id: clientRecord.id,
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

    const { data: saved, error: e } = await supabase
      .from("checkins")
      .upsert(entry, { onConflict: "client_id,week_label" })
      .select().single();

    if (e) { setError(e.message); setSubmitting(false); return; }

    setSubmitting(false);
    setDone(true);

    // AI feedback in background
    generateAIFeedback(clientRecord.name, clientRecord.goal, entry).then(async feedback => {
      if (saved) await supabase.from("checkins").update({ ai_feedback: feedback }).eq("id", saved.id);
    });
  }

  function reset() {
    setDone(false); setWeight(""); setMeasurements(""); setNotes("");
    setPhotos([]); setPhotoUrls([]); setWorkout(70); setDiet(70); setSleep(7); setEnergy(7);
  }

  if (done) return (
    <div className="page-narrow">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <div className="success-title">CHECK-IN RECEIVED</div>
        <div className="success-msg">Week {getWeekLabel()} logged, {clientRecord.name.split(" ")[0]}.<br />Evan will review your data and drop feedback in your file.</div>
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button className="nav-btn" onClick={reset}>Submit another</button>
      </div>
    </div>
  );

  return (
    <div className="page-narrow">
      <div className="form-card">
        <div className="form-title">WEEKLY CHECK-IN</div>
        <div className="form-week">Week {getWeekLabel()} · {clientRecord.name}</div>
        {error && <div className="auth-err" style={{ marginBottom: 16 }}>⚠ {error}</div>}

        <div className="two-col">
          <div className="fg">
            <label className="flbl">Weight (lbs)</label>
            <input className="finput" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="175" />
          </div>
          <div className="fg">
            <label className="flbl">Measurements</label>
            <input className="finput" value={measurements} onChange={e => setMeasurements(e.target.value)} placeholder='waist 32", arms 15"' />
          </div>
        </div>

        <div className="fg">
          <label className="flbl">Workout Compliance — {workout}%</label>
          <div className="slider-wrap">
            <input type="range" min="0" max="100" value={workout} step="1" onChange={e => setWorkout(e.target.value)} />
            <div className="slider-val">{workout}%</div>
          </div>
        </div>

        <div className="fg">
          <label className="flbl">Diet Adherence — {diet}%</label>
          <div className="slider-wrap">
            <input type="range" min="0" max="100" value={diet} step="1" onChange={e => setDiet(e.target.value)} />
            <div className="slider-val">{diet}%</div>
          </div>
        </div>

        <div className="two-col">
          <div className="fg">
            <label className="flbl">Sleep Quality — {sleep}/10</label>
            <div className="slider-wrap">
              <input type="range" min="1" max="10" value={sleep} step="1" onChange={e => setSleep(e.target.value)} />
              <div className="slider-val" style={{ fontSize: 22 }}>{sleep}/10</div>
            </div>
          </div>
          <div className="fg">
            <label className="flbl">Energy Level — {energy}/10</label>
            <div className="slider-wrap">
              <input type="range" min="1" max="10" value={energy} step="1" onChange={e => setEnergy(e.target.value)} />
              <div className="slider-val" style={{ fontSize: 22 }}>{energy}/10</div>
            </div>
          </div>
        </div>

        <div className="fg">
          <label className="flbl">Progress Photos</label>
          <input type="file" ref={fileRef} multiple accept="image/*" style={{ display: "none" }} onChange={e => handlePhotos(e.target.files)} />
          <div className="photo-drop" onClick={() => fileRef.current.click()}>📸 &nbsp;Tap to upload · Front · Back · Side</div>
          {photoUrls.length > 0 && (
            <div className="photo-thumbs">{photoUrls.map((url, i) => <img key={i} className="photo-thumb" src={url} alt="" />)}</div>
          )}
        </div>

        <div className="fg">
          <label className="flbl">Notes / Anything to Flag</label>
          <textarea className="fta" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Injuries, stress, missed days, travel..." />
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
  const [clientRecord, setClientRecord] = useState(null);
  const [isCoach, setIsCoach] = useState(false);
  const [status, setStatus] = useState(null); // pending | approved | rejected
  const [tab, setTab] = useState("checkin");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) loadUser(data.session);
      else setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      if (s) loadUser(s);
      else { setSession(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadUser(s) {
    setSession(s);
    const email = s.user.email;

    // Check if coach
    if (email === COACH_EMAIL) {
      setIsCoach(true);
      setStatus("approved");
      setAuthLoading(false);
      return;
    }

    // Look up client record
    const { data } = await supabase.from("clients").select("*").eq("auth_uid", s.user.id).single();

    if (data) {
      setClientRecord(data);
      setStatus(data.status);
    } else {
      // First time — create pending client record
      const name = s.user.user_metadata?.name || email.split("@")[0];
      const { data: created } = await supabase.from("clients").insert({
        auth_uid: s.user.id,
        name,
        email,
        status: "pending"
      }).select().single();
      setClientRecord(created);
      setStatus("pending");
    }
    setAuthLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null); setClientRecord(null); setIsCoach(false); setStatus(null);
  }

  if (authLoading) return <><style>{styles}</style><div className="loading">Loading...</div></>;
  if (!session) return <><style>{styles}</style><AuthView onAuth={s => loadUser(s)} /></>;
  if (status === "pending") return <><style>{styles}</style><PendingScreen onSignOut={signOut} /></>;
  if (status === "rejected") return <><style>{styles}</style><RejectedScreen onSignOut={signOut} /></>;

  return (
    <>
      <style>{styles}</style>
      <div className="header">
        <div className="logo">ES<em>FITNESS</em></div>
        <div className="nav">
          {isCoach && (
            <button className={`nav-btn ${tab === "coach" ? "active" : ""}`} onClick={() => setTab("coach")}>Dashboard</button>
          )}
          {!isCoach && (
            <button className={`nav-btn ${tab === "checkin" ? "active" : ""}`} onClick={() => setTab("checkin")}>Check-In</button>
          )}
          <button className="nav-btn danger" onClick={signOut}>Sign Out</button>
        </div>
      </div>
      {tab === "coach" && isCoach && <CoachDashboard user={session.user} />}
      {tab === "checkin" && !isCoach && <CheckInForm user={session.user} clientRecord={clientRecord} />}
    </>
  );
}
