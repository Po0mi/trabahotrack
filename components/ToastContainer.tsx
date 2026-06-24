"use client";

import { useState, useEffect } from "react";
import { subscribeToasts, getToasts } from "@/lib/toast";
import "@/styles/components/toast.scss";

export default function ToastContainer() {
  const [toasts, setToasts] = useState(getToasts);

  useEffect(() => {
    return subscribeToasts(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast-icon">
            {t.type === "success" && <i className="fas fa-circle-check" />}
            {t.type === "error" && <i className="fas fa-circle-xmark" />}
            {t.type === "info" && <i className="fas fa-circle-info" />}
          </span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
