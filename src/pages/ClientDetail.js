import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClients, getCheckins, saveCoachNote } from "../supabase";

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState({});
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [clients, cis] = await Promise.all([getClients(), getCheckins(id)]);
        setClient(clients.find(c => c.id === id));
        setHistory(cis || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [id]);

  async function doSave(ci) {
    const note = notes[ci.id] !== undefined ? notes[ci.id] : (ci.coach_note || "");
    try {
      await saveCoachNote(ci.id, note);
      setSaved(s => ({ ...s, [ci.id]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [ci.id]: false })), 2000);
    } catch (e) { console.error(e); }
  }

  if (loading) return <div className="loading">LOADING...</div>;
  if (!client) return <div className="page"><div className="empty">Client not found.</div></div>;

  return (
    <div className="page" style={{ maxWidth: 760 }}>
      <button className="back-btn" onClick={() => navigate("/")}>← All Clients</button>
      <div className="T1">{client.name}</div>
      <div className="sub">
        {client.goal || "No goal set"} · {history.length} check-ins · Joined {new Date(client.joined_at).toLocaleDateString()}
      </div>
      <hr className="divider" />

      {history.length === 0 ? (
        <div className="empty">No check-ins yet.</div>
      ) : history.map((e, i) => {
        const noteVal = notes[e.id] !== undefined ? notes[e.id] : (e.coach_note || "");
        return (
          <div key={e.id} className="week-entry">
            <div className="we-head">
              <div>
                <div className="week-tag">{e.week_label}</div>
                {i === 0 && <span className="badge ok" style={{ marginTop: 4 }}>Latest</span>}
              </div>
              <div className="we-date">{new Date(e.submitted_at).toLocaleDateString()}</div>
            </div>

            <div className="metrics">
              <div className="met"><strong>{e.weight} lbs</strong>Weight</div>
              {e.waist && <div className="met"><strong>{e.waist}"</strong>Waist</div>}
              {e.arms && <div className="met"><strong>{e.arms}"</strong>Arms</div>}
              {e.chest && <div className="met"><strong>{e.chest}"</strong>Chest</div>}
              <div className="met">
                <strong>{e.workout_compliance}%</strong>Workouts
                <div className="bar"><div className={`bar-fill${e.workout_compliance < 80 ? " red" : ""}`} style={{ width: `${e.workout_compliance}%` }} /></div>
              </div>
              <div className="met">
                <strong>{e.diet_adherence}%</strong>Diet
                <div className="bar"><div className={`bar-fill${e.diet_adherence < 80 ? " red" : ""}`} style={{ width: `${e.diet_adherence}%` }} /></div>
              </div>
              <div className="met"><strong>{e.sleep_quality}/10</strong>Sleep</div>
              <div className="met"><strong>{e.energy_level}/10</strong>Energy</div>
              <div className="met"><strong>{e.mood}/10</strong>Mood</div>
            </div>

            {e.photos?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 9, color: "#444", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>
                  Progress Photos ({e.photos.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {e.photos.map((p, j) => <img key={j} src={p.data} alt="" className="photo-thumb" />)}
                </div>
              </div>
            )}

            {e.client_notes && (
              <div className="client-note-txt">
                <span style={{ color: "#333", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase" }}>Client · </span>
                {e.client_notes}
              </div>
            )}

            {e.ai_feedback && (
              <div className="ai-box">
                <div className="ai-lbl">⚡ Auto Feedback</div>
                <div className="ai-txt">{e.ai_feedback}</div>
              </div>
            )}

            <div>
              <div className="note-lbl">Your Coach Note</div>
              <textarea
                className="note-ta"
                value={noteVal}
                onChange={ev => setNotes(n => ({ ...n, [e.id]: ev.target.value }))}
                placeholder="Program adjustments, personal feedback, what to focus on next week..."
              />
              <button className="save-btn" onClick={() => doSave(e)}>
                {saved[e.id] ? "✓ Saved" : "Save Note"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
