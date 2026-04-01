import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase, getClients } from "../supabase";

export default function AddClient() {
  const [form, setForm] = useState({ name: "", goal: "", email: "", phone: "" });
  const [clients, setClients] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getClients().then(c => setClients(c || [])).catch(console.error);
  }, []);

  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleAdd() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("clients").insert({
        name: form.name.trim(), goal: form.goal.trim(),
        email: form.email.trim(), phone: form.phone.trim(),
        status: "approved", active: true, joined_at: new Date().toISOString()
      }).select().single();
      if (error) throw error;
      setClients(c => [...c, data]);
      setSuccess(form.name);
      setForm({ name: "", goal: "", email: "", phone: "" });
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  return (
    <div className="page-sm">
      <div className="T1">Add Client</div>
      <div className="sub">Roster Management</div>
      <hr className="divider" />
      {success && (
        <div style={{ background: "rgba(200,255,0,.06)", border: "1px solid rgba(200,255,0,.15)", padding: "12px 16px", marginBottom: 20, fontSize: 11, color: "#C8FF00", letterSpacing: 1 }}>
          ✓ {success} added to roster
        </div>
      )}
      <div className="fg"><label className="flbl">Client Name *</label><input className="finput" value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Full name" /></div>
      <div className="fg"><label className="flbl">Primary Goal</label><input className="finput" value={form.goal} onChange={e => upd("goal", e.target.value)} placeholder="e.g. Lose 20lbs, build muscle" /></div>
      <div className="frow">
        <div className="fg"><label className="flbl">Email</label><input className="finput" type="email" value={form.email} onChange={e => upd("email", e.target.value)} placeholder="client@email.com" /></div>
        <div className="fg"><label className="flbl">Phone</label><input className="finput" type="tel" value={form.phone} onChange={e => upd("phone", e.target.value)} placeholder="+1 (555) 000-0000" /></div>
      </div>
      <button className="submit-btn" onClick={handleAdd} disabled={!form.name.trim() || saving}>{saving ? "Adding..." : "Add to Roster"}</button>
      {clients.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div className="sec-lbl">Current Roster ({clients.length})</div>
          {clients.map(c => (
            <div key={c.id} className="roster-row" style={{ cursor: "pointer" }} onClick={() => navigate(`/client/${c.id}`)}>
              <div><div className="rr-name">{c.name}</div><div className="rr-meta">{c.goal || "No goal"}</div></div>
              <div className="rr-right">View →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
