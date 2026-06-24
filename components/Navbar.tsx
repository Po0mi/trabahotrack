"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "@/styles/layout/navbar.scss";
import SyncToPhoneModal from "./SyncToPhoneModal";

const THEME_KEY = "trabahotrack_theme";

export default function Navbar() {
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark") {
      document.documentElement.dataset.theme = "dark";
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next === "dark" ? "dark" : "";
    localStorage.setItem(THEME_KEY, next);
    setIsDark(!isDark);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <Image
            src="/logo.png"
            alt="TrabahoTracker"
            width={120}
            height={100}
            className="navbar-logo-img"
            priority
          />
          <span className="navbar-title">TrabahoTrack</span>
        </div>

        <div className="navbar-actions">
          <button
            className="btn-theme"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <i className="fa-solid fa-sun" style={{ fontSize: "15px" }} />
            ) : (
              <i className="fa-solid fa-moon" style={{ fontSize: "15px" }} />
            )}
          </button>

          <button
            className="btn-share"
            onClick={() => setIsSyncOpen(true)}
            title="Open board on another device"
          >
            <i className="fa-solid fa-qrcode" style={{ fontSize: "13px" }} />
            Sync to Phone
          </button>
        </div>
      </nav>

      <SyncToPhoneModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
      />
    </>
  );
}
