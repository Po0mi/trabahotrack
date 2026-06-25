"use client";

import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/utils/constants";
import "@/styles/components/burnoutCheckin.scss";

interface BurnoutData {
  lastPromptDate: string;
  history: { week: string; mood: number }[];
}

interface BurnoutCheckinProps {
  totalAppliedThisMonth: number;
}

const MOODS = [
  { value: 2, icon: "fa-face-grin-beam", label: "Energized" },
  { value: 1, icon: "fa-face-meh",       label: "Hanging in" },
  { value: 0, icon: "fa-face-tired",     label: "Burnt out" },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export default function BurnoutCheckin({ totalAppliedThisMonth }: BurnoutCheckinProps) {
  const [visible, setVisible] = useState(false);
  const [burnoutData, setBurnoutData] = useState<BurnoutData | null>(null);
  const [burnoutMessage, setBurnoutMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BURNOUT);
      const data: BurnoutData = stored
        ? JSON.parse(stored)
        : { lastPromptDate: "", history: [] };
      setBurnoutData(data);

      const now = Date.now();
      const lastPrompt = data.lastPromptDate ? new Date(data.lastPromptDate).getTime() : 0;
      const shouldShow = now - lastPrompt >= WEEK_MS;
      setVisible(shouldShow);
    } catch {
      setVisible(true);
      setBurnoutData({ lastPromptDate: "", history: [] });
    }
  }, []);

  const handleMood = (mood: number) => {
    const weekKey = getWeekKey(new Date());
    const history = [...(burnoutData?.history ?? []), { week: weekKey, mood }];
    const updated: BurnoutData = {
      lastPromptDate: new Date().toISOString(),
      history: history.slice(-12),
    };
    localStorage.setItem(STORAGE_KEYS.BURNOUT, JSON.stringify(updated));
    setBurnoutData(updated);

    const lastThree = history.slice(-3);
    const threeBurnouts = lastThree.length === 3 && lastThree.every((h) => h.mood === 0);
    if (threeBurnouts) {
      setBurnoutMessage(
        totalAppliedThisMonth >= 10
          ? `You've applied to ${totalAppliedThisMonth} jobs this month. That's incredible effort. Maybe take the weekend off?`
          : "Three weeks of exhaustion. You deserve a break. Rest is part of the process.",
      );
    } else if (mood === 2) {
      setBurnoutMessage("That energy will carry you far. Keep going!");
    } else {
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    setBurnoutMessage(null);
  };

  if (dismissed || (!visible && !burnoutMessage)) return null;

  return (
    <div className="burnout-checkin">
      {burnoutMessage ? (
        <div className="burnout-message">
          <span className="burnout-message-text">{burnoutMessage}</span>
          <button className="burnout-dismiss" onClick={handleDismiss} aria-label="Dismiss">
            <i className="fas fa-xmark" />
          </button>
        </div>
      ) : (
        <div className="burnout-prompt">
          <span className="burnout-label">How is the hunt feeling today?</span>
          <div className="burnout-moods">
            {MOODS.map((m) => (
              <button
                key={m.value}
                className="burnout-mood-btn"
                onClick={() => handleMood(m.value)}
                title={m.label}
              >
                <i className={`fas ${m.icon}`} />
                <span className="burnout-mood-label">{m.label}</span>
              </button>
            ))}
          </div>
          <button className="burnout-dismiss" onClick={handleDismiss} aria-label="Skip">
            <i className="fas fa-xmark" />
          </button>
        </div>
      )}
    </div>
  );
}
