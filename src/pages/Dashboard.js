import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getClients, getAllThisWeek } from "../supabase";
import { getWeekLabel } from "../utils";

function daysSince(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default function Dashboard() {
  const [clients, setClients] = useState([]);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const week = getWeekLabel();

  useEffect(() => {
    (async () => {
      try {
        const [cls, cis] = await Promise.all([getClients(), getAllThisWeek(week)]);
        setClients(cls || []);
        setCheckedIds(new Set((cis || []).map(c => c.client_id)));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, [week]);

  if (loading) return <div className="loading">LOADING...</div>;

  const checked = clients.filter(c => checkedIds.has(c.id));
  const missing = clients.filter(c => !checkedIds.has(c.id));
  const compliance = clients.length ? Math.round((checked.length / clients.length) * 100) : 0;

  return (
    <div className="page">
      <div className="T1">Coach Dashboard</div>
      <div className="sub">{week} · {new Date().toDateString().toUpperCase()}</div>

      <div className="stats-row">
        <div className="scard"><div className="snum">{clients.length}</div><div className="slbl">Total Clients</div></div>
        <div className="scard"><div className="snum">{checked.length}</div><div className="slbl">Checked In</div></div>
        <div className="scard"><div className="snum" style={{ color: missing.length ? "#ff5050" : "#C8FF00" }}>{missing.length}</div><div className="slbl">Missing</div></div>
        <div className="scard"><div className="snum">{compliance}%</div><div className="slbl">Compliance</div></div>
      </div>

      {missing.length > 0 && (
        <div className="warn-bar">
          <div className="warn-dot" />
          <div className="wtxt">NOT YET THIS WEEK: {missing.map(c => c.name).join(", ")}</div>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="empty">No clients yet. Click "+ Client" to add your first.</div>
      ) : (
        <div className="cgrid">
          {clients.map(c => {
            const done = checkedIds.has(c.id);
            return (
              <div
                key={c.id}
                className={`ccard ${done ? "green" : "gray"}`}
                onClick={() => navigate(`/client/${c.id}`)}
              >
                <div className="cc-name">{c.name}</div>
                <div className="cc-goal">{c.goal || "No goal set"}</div>
                <span className={`badge ${done ? "ok" : "none"}`}>
                  {done ? "✓ Checked In" : "— Pending"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
