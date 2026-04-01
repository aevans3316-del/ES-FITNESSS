import React from "react";
import { signOut } from "../supabase";

export default function Pending() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#080808", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, letterSpacing: 6, color: "#C8FF00", marginBottom: 4 }}>
          ES<span style={{ color: "#E8E8E8" }}>FITNESS</span>
        </div>
        <div style={{ fontSize: 48, margin: "32px 0 16px" }}>⏳</div>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 2, marginBottom: 12 }}>
          Pending Approval
        </div>
        <div style={{ fontSize: 11, color: "#555", lineHeight: 1.9, letterSpacing: 1, marginBottom: 32 }}>
          Your account is under review.<br />
          Evan will approve your access shortly.<br />
          Check back soon.
        </div>
        <button className="ghost-btn" onClick={signOut}>Sign Out</button>
      </div>
    </div>
  );
}
