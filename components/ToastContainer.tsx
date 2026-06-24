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
            {t.type === "success" && "✅"}
            {t.type === "error" && "❌"}
            {t.type === "info" && "ℹ️"}
          </span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
