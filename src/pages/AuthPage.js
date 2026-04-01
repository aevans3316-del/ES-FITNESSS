import React, { useState } from "react";
import { signIn, signUp } from "../supabase";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | signup
  const [form, setForm] = useState({ email: "", password: "", name: "", goal: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); setError(""); }

  async function handleLogin() {
    if (!form.email || !form.password) return setError("Fill in all fields.");
    setLoading(true);
    try {
      await signIn(form.email, form.password);
    } catch (e) {
      setError("Invalid email or password.");
    }
    setLoading(false);
  }

  async function handleSignup() {
    if (!form.email || !form.password || !form.name) return setError("Name, email and password are required.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.name, form.goal);
      setSuccess("Account created! Your coach will review and approve your account shortly.");
      setMode("login");
    } catch (e) {
      setError(e.message || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080808", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, letterSpacing: 6, color: "#C8FF00" }}>
            ES<span style={{ color: "#E8E8E8" }}>FITNESS</span>
          </div>
          <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginTop: 4 }}>
            Online Coaching
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", border: "1px solid #1e1e1e", marginBottom: 28, overflow: "hidden" }}>
          <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            style={{ flex: 1, background: mode === "login" ? "rgba(200,255,0,.07)" : "none", border: "none", color: mode === "login" ? "#C8FF00" : "#555", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: 1, padding: "10px", cursor: "pointer", textTransform: "uppercase" }}>
            Sign In
          </button>
          <button onClick={() => { setMode("signup"); setError(""); setSuccess(""); }}
            style={{ flex: 1, background: mode === "signup" ? "rgba(200,255,0,.07)" : "none", border: "none", borderLeft: "1px solid #1e1e1e", color: mode === "signup" ? "#C8FF00" : "#555", fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: 1, padding: "10px", cursor: "pointer", textTransform: "uppercase" }}>
            Create Account
          </button>
        </div>

        {success && (
          <div style={{ background: "rgba(200,255,0,.06)", border: "1px solid rgba(200,255,0,.15)", padding: "12px 16px", marginBottom: 20, fontSize: 11, color: "#C8FF00", letterSpacing: 1, lineHeight: 1.8 }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(255,80,80,.06)", border: "1px solid rgba(255,80,80,.15)", padding: "12px 16px", marginBottom: 20, fontSize: 11, color: "#ff7070", letterSpacing: 1 }}>
            {error}
          </div>
        )}

        {mode === "login" && (
          <>
            <div className="fg">
              <label className="flbl">Email</label>
              <input className="finput" type="email" value={form.email} onChange={e => upd("email", e.target.value)}
                placeholder="your@email.com" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <div className="fg">
              <label className="flbl">Password</label>
              <input className="finput" type="password" value={form.password} onChange={e => upd("password", e.target.value)}
                placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleLogin()} />
            </div>
            <button className="submit-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: "#444", letterSpacing: 1 }}>
              New client? Switch to "Create Account" above
            </div>
          </>
        )}

        {mode === "signup" && (
          <>
            <div className="fg">
              <label className="flbl">Full Name *</label>
              <input className="finput" value={form.name} onChange={e => upd("name", e.target.value)} placeholder="Your full name" />
            </div>
            <div className="fg">
              <label className="flbl">Your Goal</label>
              <input className="finput" value={form.goal} onChange={e => upd("goal", e.target.value)} placeholder="e.g. Lose 20lbs, build muscle" />
            </div>
            <div className="fg">
              <label className="flbl">Email *</label>
              <input className="finput" type="email" value={form.email} onChange={e => upd("email", e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="fg">
              <label className="flbl">Password *</label>
              <input className="finput" type="password" value={form.password} onChange={e => upd("password", e.target.value)} placeholder="At least 6 characters" />
            </div>
            <div className="fg">
              <label className="flbl">Confirm Password *</label>
              <input className="finput" type="password" value={form.confirm} onChange={e => upd("confirm", e.target.value)}
                placeholder="••••••••" onKeyDown={e => e.key === "Enter" && handleSignup()} />
            </div>
            <div style={{ fontSize: 9, color: "#444", marginBottom: 16, letterSpacing: 1, lineHeight: 1.9 }}>
              After signing up, your coach will review and approve your account before you can access it.
            </div>
            <button className="submit-btn" onClick={handleSignup} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
