"use client";

import { useEffect, useRef, useState } from "react";
import "@/styles/components/statusTipPopup.scss";

const AUTO_DISMISS_MS = 6000;

interface Tip {
  icon: string;
  iconColor: string;
  heading: string;
  body: string;
  action?: string;
}

const TIPS: Record<string, Tip> = {
  Interview: {
    icon: "fa-calendar-days",
    iconColor: "#d97706",
    heading: "Interview scheduled!",
    body: "Expand the card to set the interview date and log your round notes.",
  },
  Offer: {
    icon: "fa-clipboard-list",
    iconColor: "#16a34a",
    heading: "Offer received!",
    body: "Expand the card to check off your pre-employment requirements — NBI, TOR, medical, and more.",
  },
  Rejected: {
    icon: "fa-circle-question",
    iconColor: "#dc2626",
    heading: "Keep going.",
    body: "Expand the card and set why you were rejected — tracking patterns helps you improve.",
  },
};

interface StatusTipPopupProps {
  status: string | null;
  onDismiss: () => void;
  onOpenCalendar?: () => void;
}

export default function StatusTipPopup({ status, onDismiss, onOpenCalendar }: StatusTipPopupProps) {
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tip = status ? TIPS[status] : null;

  useEffect(() => {
    if (!tip) return;
    setProgress(100);

    const TICK = 50;
    const decrement = (TICK / AUTO_DISMISS_MS) * 100;
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p - decrement <= 0) {
          clearInterval(intervalRef.current!);
          onDismiss();
          return 0;
        }
        return p - decrement;
      });
    }, TICK);

    return () => clearInterval(intervalRef.current!);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (!tip) return null;

  return (
    <div className="status-tip-popup" role="status" aria-live="polite">
      <div className="status-tip-popup__icon" style={{ color: tip.iconColor }}>
        <i className={`fas ${tip.icon}`} />
      </div>
      <div className="status-tip-popup__body">
        <p className="status-tip-popup__heading">{tip.heading}</p>
        <p className="status-tip-popup__text">{tip.body}</p>
      </div>
      <div className="status-tip-popup__actions">
        {tip.action && onOpenCalendar && (
          <button
            className="status-tip-popup__cta"
            onClick={() => { onOpenCalendar(); onDismiss(); }}
          >
            <i className="fas fa-arrow-right" />
            {tip.action}
          </button>
        )}
        <button className="status-tip-popup__close" onClick={onDismiss} aria-label="Dismiss">
          <i className="fas fa-xmark" />
        </button>
      </div>
      <div
        className="status-tip-popup__progress"
        style={{ width: `${progress}%`, background: tip.iconColor }}
      />
    </div>
  );
}
