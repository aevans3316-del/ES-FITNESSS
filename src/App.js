import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import ClientDetail from "./pages/ClientDetail";
import AddClient from "./pages/AddClient";
import CheckIn from "./pages/CheckIn";
import { getClients, getAllThisWeek } from "./supabase";
import { getWeekLabel } from "./utils";

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isClientRoute = location.pathname.startsWith("/checkin");

  return (
    <div className="app">
      <header className="hdr">
        <div className="logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
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
            <button className={!isClientRoute ? "on" : ""} onClick={() => navigate("/")}>Coach</button>
            <button className={isClientRoute ? "on" : ""} onClick={() => navigate("/checkin")}>Client</button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/client/:id" element={<Layout><ClientDetail /></Layout>} />
        <Route path="/add" element={<Layout><AddClient /></Layout>} />
        <Route path="/checkin" element={<Layout><CheckIn /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
