import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import ClientDetail from "./pages/ClientDetail";
import AddClient from "./pages/AddClient";
import ClientHome from "./pages/ClientHome";
import AuthPage from "./pages/AuthPage";
import Pending from "./pages/Pending";
import { getSession, onAuthChange, isCoach, signOut, getMyClient } from "./supabase";

function Header({ session, clientRecord }) {
  const navigate = useNavigate();
  const location = useLocation();
  const coach = isCoach(session);

  return (
    <header className="hdr">
      <div className="logo" onClick={() => navigate(coach ? "/" : "/checkin")} style={{ cursor: "pointer" }}>
        ES<em>FITNESS</em>
      </div>
      <div className="hdr-right">
        {coach && (
          <nav className="nav">
            <button className={`nbtn${location.pathname === "/" ? " on" : ""}`} onClick={() => navigate("/")}>Dashboard</button>
            <button className={`nbtn${location.pathname === "/add" ? " on" : ""}`} onClick={() => navigate("/add")}>+ Client</button>
            <button className={`nbtn${location.pathname === "/pending" ? " on" : ""}`} onClick={() => navigate("/pending")}>Approvals</button>
          </nav>
        )}
        {session && (
          <button className="nbtn" onClick={signOut}>Sign Out</button>
        )}
      </div>
    </header>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [clientRecord, setClientRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(async (s) => {
      setSession(s);
      if (s && !isCoach(s)) {
        const c = await getMyClient(s.user.id);
        setClientRecord(c);
      }
      setLoading(false);
    });
    const { data: { subscription } } = onAuthChange(async (s) => {
      setSession(s);
      if (s && !isCoach(s)) {
        const c = await getMyClient(s.user.id);
        setClientRecord(c);
      } else {
        setClientRecord(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="loading">LOADING...</div>;

  const coach = isCoach(session);

  return (
    <BrowserRouter>
      <div className="app">
        {session && <Header session={session} clientRecord={clientRecord} />}
        <Routes>
          {/* Not logged in → auth page */}
          {!session && <Route path="*" element={<AuthPage />} />}

          {/* Coach routes */}
          {coach && <Route path="/" element={<Dashboard />} />}
          {coach && <Route path="/client/:id" element={<ClientDetail />} />}
          {coach && <Route path="/add" element={<AddClient />} />}
          {coach && <Route path="/pending" element={<PendingApprovals />} />}
          {coach && <Route path="*" element={<Navigate to="/" />} />}

          {/* Client: approved */}
          {!coach && session && clientRecord?.status === "approved" && (
            <Route path="*" element={<ClientHome client={clientRecord} session={session} />} />
          )}

          {/* Client: pending approval */}
          {!coach && session && (!clientRecord || clientRecord?.status === "pending") && (
            <Route path="*" element={<Pending />} />
          )}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function PendingApprovals() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getPendingSignups, approveSignup, denySignup } = require("./supabase");

  useEffect(() => {
    getPendingSignups().then(d => { setPending(d || []); setLoading(false); }).catch(console.error);
  }, []);

  async function approve(p) {
    await approveSignup(p);
    setPending(prev => prev.filter(x => x.id !== p.id));
  }

  async function deny(id) {
    await denySignup(id);
    setPending(prev => prev.filter(x => x.id !== id));
  }

  if (loading) return <div className="loading">LOADING...</div>;

  return (
    <div className="page-sm">
      <div className="T1">Pending Approvals</div>
      <div className="sub">{pending.length} client{pending.length !== 1 ? "s" : ""} waiting</div>
      <hr className="divider" />
      {pending.length === 0
        ? <div className="empty">No pending signups.</div>
        : pending.map(p => (
          <div key={p.id} style={{ background: "#0f0f0f", border: "1px solid #1e1e1e", padding: "18px 20px", marginBottom: 10 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 1 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{p.email}</div>
            <div style={{ fontSize: 10, color: "#555" }}>{p.goal || "No goal set"}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="save-btn" onClick={() => approve(p)}>✓ Approve</button>
              <button className="ghost-btn" onClick={() => deny(p.id)}>✕ Deny</button>
            </div>
          </div>
        ))
      }
    </div>
  );
}
