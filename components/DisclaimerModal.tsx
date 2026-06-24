"use client";

import { useEffect, useState } from "react";
import "@/styles/components/modal.scss";

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("trabahotrack_disclaimer_seen");
    if (!seen) setIsOpen(true);
  }, []);

  const handleContinue = () => {
    localStorage.setItem("trabahotrack_disclaimer_seen", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-disclaimer-icon">🔗</div>

        <div className="modal-header">
          <h2>Before you start</h2>
        </div>

        <p className="modal-disclaimer-body">
          This board is link-based, anyone with the URL can view it. Your board
          is saved to this browser, so avoid clearing your cookies or local
          storage.
        </p>

        <div className="modal-actions" style={{ justifyContent: "stretch" }}>
          <button
            className="btn-primary"
            onClick={handleContinue}
            style={{ flex: 1 }}
          >
            Got it, let&apos;s go →
          </button>
        </div>
      </div>
    </div>
  );
}
