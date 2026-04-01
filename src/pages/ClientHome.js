import React, { useState, useRef } from "react";
import { submitCheckin, getCheckins } from "../supabase";
import { getWeekLabel, generateFeedback } from "../utils";

export default function ClientHome({ client, session }) {
  const [view, setView] = useState("home"); // home | checkin | history
  const [history, setHistory] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const week = getWeekLabel();
  const alreadyDone = history?.some(e => e.week_label === week);

  async function loadHistory() {
    const h = await getCheckins(client.id);
    setHistory(h || []);
    setView("history");
  }

  return (
    <div className="page-sm">
      {view === "home" && (
        <>
          <div className="T1">Hey, {client.name.split(" ")[0]}</div>
          <div className="sub">{client.goal || "No goal set"} · {week}</div>
          <hr className="divider" />

          <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
            <div style={{ background: "#0f0f0f", border: `1px solid ${alreadyDone ? "rgba(200,255,0,.2)" : "#1e1e1e"}`, padding: "22px 20px", cursor: alreadyDone ? "default" : "pointer" }}
              onClick={() => !alreadyDone && setView("checkin")}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1.5, color: alreadyDone ? "#C8FF00" : "#E8E8E8" }}>
                {alreadyDone ? "✓ This Week's Check-In Done" : "⚡ Submit Weekly Check-In"}
              </div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 4, letterSpacing: 1 }}>
                {alreadyDone ? "You're all set for this week" : "Takes about 3 minutes"}
              </div>
            </div>

            <div style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", padding: "22px 20px", cursor: "pointer" }}
              onClick={loadHistory}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1.5 }}>View My History</div>
              <div style={{ fontSize: 10, color: "#555", marginTop: 4, letterSpacing: 1 }}>Past check-ins and coach feedback</div>
            </div>
          </div>
        </>
      )}

      {view === "checkin" && !submitted && (
        <CheckInForm
          client={client}
          week={week}
          onSubmit={async (data) => {
            const feedback = await generateFeedback(client.name, client.goal, data);
            await submitCheckin(client.id, week, data, feedback);
            setSubmitted(true);
            setView("done");
          }}
          onBack={() => setView("home")}
        />
      )}

      {view === "done" && (
        <div className="success">
          <div className="s-icon">⚡</div>
          <div className="s-title">Check-In Received</div>
          <div className="s-msg">{week}<br />Evan will review and drop his notes.</div>
          <button className="submit-btn" style={{ marginTop: 32, width: "auto", padding: "12px 40px" }}
            onClick={() => { setSubmitted(false); setView("home"); }}>
            Done
          </button>
        </div>
      )}

      {view === "history" && (
        <ClientHistory client={client} history={history} onBack={() => setView("home")} />
      )}
    </div>
  );
}

function CheckInForm({ client, week, onSubmit, onBack }) {
  const [f, setF] = useState({
    weight: "", waist: "", arms: "", chest: "",
    workoutCompliance: 80, dietAdherence: 80,
    sleep: 7, energy: 7, mood: 7,
    notes: "", photos: []
  });
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();

  function upd(k, v) { setF(p => ({ ...p, [k]: v })); }

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith("image/")) return;
      const r = new FileReader();
      r.onload = e => setF(p => ({ ...p, photos: [...p.photos, { name: file.name, data: e.target.result }] }));
      r.readAsDataURL(file);
    });
  }

  async function handleSubmit() {
    if (!f.weight) return;
    setBusy(true);
    await onSubmit(f);
    setBusy(false);
  }

  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="T1">{client.name}</div>
      <div className="sub">Check-In · {week}</div>
      <hr className="divider" />

      <div className="sec-lbl">Body Stats</div>
      <div className="frow">
        <div className="fg"><label className="flbl">Weight (lbs) *</label><input className="finput" type="number" value={f.weight} onChange={e => upd("weight", e.target.value)} placeholder="185" /></div>
        <div className="fg"><label className="flbl">Waist (inches)</label><input className="finput" type="number" value={f.waist} onChange={e => upd("waist", e.target.value)} placeholder="32" /></div>
        <div className="fg"><label className="flbl">Arms (inches)</label><input className="finput" type="number" value={f.arms} onChange={e => upd("arms", e.target.value)} placeholder="15" /></div>
        <div className="fg"><label className="flbl">Chest (inches)</label><input className="finput" type="number" value={f.chest} onChange={e => upd("chest", e.target.value)} placeholder="42" /></div>
      </div>

      <div className="sec-lbl" style={{ marginTop: 4 }}>Compliance</div>
      {[["workoutCompliance", "Workout Compliance"], ["dietAdherence", "Diet Adherence"]].map(([k, lbl]) => (
        <div className="fg" key={k}>
          <label className="flbl">{lbl}</label>
          <div className="slide-row">
            <input className="frange" type="range" min="0" max="100" step="5" value={f[k]} onChange={e => upd(k, +e.target.value)} />
            <div className="rval">{f[k]}</div>
          </div>
          <div className="bar"><div className={`bar-fill${f[k] < 80 ? " red" : ""}`} style={{ width: `${f[k]}%` }} /></div>
          <div className="pct-hint">{f[k] < 80 ? "⚠ Below target (80%)" : "On track"}</div>
        </div>
      ))}

      <div className="sec-lbl" style={{ marginTop: 4 }}>Recovery & Mood</div>
      {[["sleep", "Sleep Quality"], ["energy", "Energy Levels"], ["mood", "Mood / Mindset"]].map(([k, lbl]) => (
        <div className="fg" key={k}>
          <label className="flbl">{lbl} (1–10)</label>
          <div className="slide-row">
            <input className="frange" type="range" min="1" max="10" value={f[k]} onChange={e => upd(k, +e.target.value)} />
            <div className="rval">{f[k]}</div>
          </div>
        </div>
      ))}

      <div className="sec-lbl" style={{ marginTop: 4 }}>Progress Photos</div>
      <div className="fg">
        <div className="file-drop" onClick={() => fileRef.current.click()}
          onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
          <div className="file-drop-txt">📸 Tap to upload or drag photos here<br /><span style={{ color: "#2a2a2a", fontSize: 9 }}>Front · Back · Side</span></div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        {f.photos.length > 0 && (
          <div className="photo-preview-row">
            {f.photos.map((p, i) => (
              <div key={i} className="photo-prev">
                <img src={p.data} alt={p.name} />
                <button className="photo-rm" onClick={() => setF(prev => ({ ...prev, photos: prev.photos.filter((_, j) => j !== i) }))}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fg">
        <label className="flbl">Notes — How Did the Week Go?</label>
        <textarea className="ftextarea" value={f.notes} onChange={e => upd("notes", e.target.value)}
          placeholder="Wins, struggles, soreness, anything Evan should know" />
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={!f.weight || busy}>
        {busy ? "Submitting..." : "Submit Check-In"}
      </button>
    </div>
  );
}

function ClientHistory({ client, history, onBack }) {
  if (!history) return <div className="loading">LOADING...</div>;
  return (
    <div>
      <button className="back-btn" onClick={onBack}>← Back</button>
      <div className="T1">My History</div>
      <div className="sub">{history.length} check-ins total</div>
      <hr className="divider" />
      {history.length === 0
        ? <div className="empty">No check-ins yet.</div>
        : history.map((e, i) => (
          <div key={e.id} className="week-entry">
            <div className="we-head">
              <div className="week-tag">{e.week_label}</div>
              <div className="we-date">{new Date(e.submitted_at).toLocaleDateString()}</div>
            </div>
            <div className="metrics">
              <div className="met"><strong>{e.weight} lbs</strong>Weight</div>
              {e.waist && <div className="met"><strong>{e.waist}"</strong>Waist</div>}
              {e.arms && <div className="met"><strong>{e.arms}"</strong>Arms</div>}
              <div className="met"><strong>{e.workout_compliance}%</strong>Workouts<div className="bar"><div className={`bar-fill${e.workout_compliance < 80 ? " red" : ""}`} style={{ width: `${e.workout_compliance}%` }} /></div></div>
              <div className="met"><strong>{e.diet_adherence}%</strong>Diet<div className="bar"><div className={`bar-fill${e.diet_adherence < 80 ? " red" : ""}`} style={{ width: `${e.diet_adherence}%` }} /></div></div>
              <div className="met"><strong>{e.sleep_quality}/10</strong>Sleep</div>
            </div>
            {e.ai_feedback && (
              <div className="ai-box">
                <div className="ai-lbl">⚡ Coach Feedback</div>
                <div className="ai-txt">{e.ai_feedback}</div>
              </div>
            )}
            {e.coach_note && (
              <div className="client-note-txt">
                <span style={{ color: "#333", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase" }}>Evan's Note · </span>
                {e.coach_note}
              </div>
            )}
          </div>
        ))
      }
    </div>
  );
}
