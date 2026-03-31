import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import ClientDetail from "./pages/ClientDetail";
import AddClient from "./pages/AddClient";
import CheckIn from "./pages/CheckIn";

const COACH_PIN = "1234"; // Change this to your own PIN

function PinLock({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function tryPin() {
    if (pin === COACH_PIN) { onUnlock(); }
    else { setError(true); setPin(""); setTimeout(() => setError(false), 1500); }
  }

  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#080808"}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:4,color:"#C8FF00",marginBottom:4}}>ESFITNESS</div>
        <div style={{fontSize:10,color:"#444",letterSpacing:2,textTransform:"uppercase",marginBottom:32}}>Coach Access</div>
        <input
          type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === "Enter" && tryPin()}
          placeholder="Enter PIN"
          style={{background:"#0f0f0f",border:`1px solid ${error?"#ff5050":"#1e1e1e"}`,color:"#E8E8E8",fontFamily:"'IBM Plex Mono',monospace",fontSize:18,padding:"12px 20px",outline:"none",textAlign:"center",letterSpacing:4,width:180,display:"block",margin:"0 auto"}}
        />
        {error && <div style={{color:"#ff5050",fontSize:10,marginTop:8,letterSpacing:1}}>Wrong PIN</div>}
        <button onClick={tryPin}
          style={{marginTop:16,background:"#C8FF00",color:"#080808",border:"none",fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:3,padding:"10px 32px",cursor:"pointer",width:180}}>
          ENTER
        </button>
      </div>
    </div>
  );
}

function Layout({ children, isCoachUnlocked, onUnlockCoach }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isClientRoute = location.pathname.startsWith("/checkin");

  return (
    <div className="app">
      <header className="hdr">
        <div className="logo" onClick={() => navigate(isClientRoute ? "/checkin" : "/")} style={{cursor:"pointer"}}>
          ES<em>FITNESS</em>
        </div>
        <div className="hdr-right">
          {!isClientRoute && (
            <nav className="nav">
              <button className={`nbtn${location.pathname === "/" ? " on" : ""}`} onClick={() => navigate("/")}>Dashboard</button>
              <button className={`nbtn${location.pathname === "/add" ? " on" : ""}`} onClick={() => navigate("/add")}>+ Client</button>
            </nav>
          )}
          <div className="mode-toggle">
            <button className={!isClientRoute ? "on" : ""} onClick={() => { if(!isCoachUnlocked) onUnlockCoach(); else navigate("/"); }}>Coach</button>
            <button className={isClientRoute ? "on" : ""} onClick={() => navigate("/checkin")}>Client</button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export default function App() {
  const [coachUnlocked, setCoachUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);

  return (
    <BrowserRouter>
      {showPin && !coachUnlocked && (
        <div style={{position:"fixed",inset:0,zIndex:999,background:"#080808"}}>
          <PinLock onUnlock={() => { setCoachUnlocked(true); setShowPin(false); }} />
        </div>
      )}
      <Routes>
        <Route path="/" element={
          coachUnlocked
            ? <Layout isCoachUnlocked={coachUnlocked} onUnlockCoach={() => setShowPin(true)}><Dashboard /></Layout>
            : <Layout isCoachUnlocked={coachUnlocked} onUnlockCoach={() => setShowPin(true)}><PinLock onUnlock={() => setCoachUnlocked(true)} /></Layout>
        } />
        <Route path="/client/:id" element={
          coachUnlocked
            ? <Layout isCoachUnlocked={coachUnlocked} onUnlockCoach={() => setShowPin(true)}><ClientDetail /></Layout>
            : <Layout isCoachUnlocked={coachUnlocked} onUnlockCoach={() => setShowPin(true)}><PinLock onUnlock={() => setCoachUnlocked(true)} /></Layout>
        } />
        <Route path="/add" element={
          coachUnlocked
            ? <Layout isCoachUnlocked={coachUnlocked} onUnlockCoach={() => setShowPin(true)}><AddClient /></Layout>
            : <Layout isCoachUnlocked={coachUnlocked} onUnlockCoach={() => setShowPin(true)}><PinLock onUnlock={() => setCoachUnlocked(true)} /></Layout>
        } />
        <Route path="/checkin" element={<Layout isCoachUnlocked={coachUnlocked} onUnlockCoach={() => setShowPin(true)}><CheckIn /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
