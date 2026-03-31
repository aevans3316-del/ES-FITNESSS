import React, { useState, useEffect, useRef } from "react";
import { getClients, submitCheckin } from "../supabase";
import { getWeekLabel, generateFeedback } from "../utils";

export default function CheckIn() {
  const [clients, setClients] = useState([]);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const week = getWeekLabel();

  useEffect(() => {
    getClients().then(c => { setClients(c || []); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  if (loading) return <div className="loading">LOADING...</div>;

  return (
    <div className="page-sm">
      {!selected && !submitted && (
        <>
          <div className="T1">Weekly Check-In</div>
          <div className="sub">Select Your Profile · {week}</div>
          <hr className="divider" />
          {clients.length === 0
            ? <div className="empty">No profiles yet. Ask your coach to add you.</div>
            : clients.map(c => (
              <div key={c.id} className="csel-card" onClick={() => setSelected(c)}>
                <div>
                  <div className="csel-name">{c.name}</div>
                  <div className="csel-goal">{c.goal || "No goal set"}</div>
                </div>
                <span style={{ color: "#333", fontSize: 20 }}>›</span>
              </div>
            ))
          }
        </>
      )}

      {selected && !submitted && (
        <CheckInForm
          client={selected}
          week={week}
          onSubmit={async (data) => {
            const feedback = await generateFeedback(selected.name, selected.goal, data);
            await submitCheckin(selected.id, week, data, feedback);
            setSubmitted(true);
          }}
          onBack={() => setSelected(null)}
        />
      )}

      {submitted && (
        <div className="success">
          <div className="s-icon">⚡</div>
          <div className="s-title">Check-In Received</div>
          <div className="s-msg">
            {selected?.name?.toUpperCase()} · {week}<br />
            Evan will review and drop his notes shortly.
          </div>
          <button
            className="submit-btn"
            style={{ marginTop: 32, width: "auto", padding: "12px 40px" }}
            onClick={() => { setSubmitted(false); setSelected(null); }}
          >
            Done
          </button>
        </div>
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
        <div className="fg">
          <label className="flbl">Weight (lbs) *</label>
          <input className="finput" type="number" value={f.weight} onChange={e => upd("weight", e.target.value)} placeholder="185" />
        </div>
        <div className="fg">
          <label className="flbl">Waist (inches)</label>
          <input className="finput" type="number" value={f.waist} onChange={e => upd("waist", e.target.value)} placeholder="32" />
        </div>
        <div className="fg">
          <label className="flbl">Arms (inches)</label>
          <input className="finput" type="number" value={f.arms} onChange={e => upd("arms", e.target.value)} placeholder="15" />
        </div>
        <div className="fg">
          <label className="flbl">Chest (inches)</label>
          <input className="finput" type="number" value={f.chest} onChange={e => upd("chest", e.target.value)} placeholder="42" />
        </div>
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
        <div
          className="file-drop"
          onClick={() => fileRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        >
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
        <textarea
          className="ftextarea"
          value={f.notes}
          onChange={e => upd("notes", e.target.value)}
          placeholder="Wins, struggles, soreness, life stuff — anything Evan should know"
        />
      </div>

      <button className="submit-btn" onClick={handleSubmit} disabled={!f.weight || busy}>
        {busy ? "Submitting..." : "Submit Check-In"}
      </button>
    </div>
  );
}
