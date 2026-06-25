"use client";

import { useState } from "react";
import type { Job } from "@/types/job";
import "@/styles/components/miniCalendar.scss";

interface MiniCalendarProps {
  jobs: Job[];
  interviewDates: Record<string, string>;
  onOpenCalendar: () => void;
}

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateStr(isoStr: string): string {
  const d = new Date(isoStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MiniCalendar({ jobs, interviewDates, onOpenCalendar }: MiniCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const todayStr = toDateStr(today.toISOString());

  // Build event map: date -> events
  const map: Record<string, Array<{ job: Job; type: "applied" | "interview" }>> = {};
  for (const job of jobs) {
    const d = toDateStr(job.created_at);
    (map[d] ??= []).push({ job, type: "applied" });
  }
  for (const [jobId, ds] of Object.entries(interviewDates)) {
    if (!ds) continue;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) continue;
    (map[ds] ??= []).push({ job, type: "interview" });
  }

  // Grid cells: null = empty pad, number = day
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const ds = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const prevMonth = () => {
    setSelected(null);
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setSelected(null);
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelected(todayStr);
  };

  const selectedEvents = selected ? (map[selected] ?? []) : [];

  return (
    <div className="mcal">
      {/* Month nav */}
      <div className="mcal-nav">
        <button className="mcal-arrow" onClick={prevMonth} aria-label="Previous">
          <i className="fas fa-chevron-left" />
        </button>
        <button className="mcal-month" onClick={goToday} title="Go to today">
          {MONTH_NAMES[month]} {year}
        </button>
        <button className="mcal-arrow" onClick={nextMonth} aria-label="Next">
          <i className="fas fa-chevron-right" />
        </button>
      </div>

      {/* Day-of-week row */}
      <div className="mcal-grid">
        {DOW.map((d, i) => (
          <div key={i} className="mcal-dow">{d}</div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (!day) return <div key={`p${i}`} className="mcal-cell mcal-cell--pad" />;
          const dateStr = ds(day);
          const events = map[dateStr] ?? [];
          const isToday = dateStr === todayStr;
          const isSel = dateStr === selected;
          const hasA = events.some((e) => e.type === "applied");
          const hasI = events.some((e) => e.type === "interview");
          return (
            <div
              key={dateStr}
              className={[
                "mcal-cell",
                isToday ? "mcal-cell--today" : "",
                isSel ? "mcal-cell--sel" : "",
                events.length ? "mcal-cell--events" : "",
              ].filter(Boolean).join(" ")}
              onClick={() => setSelected((p) => (p === dateStr ? null : dateStr))}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelected((p) => (p === dateStr ? null : dateStr));
              }}
              aria-pressed={isSel}
              aria-label={`${MONTH_NAMES[month]} ${day}${events.length ? `, ${events.length} events` : ""}`}
            >
              <span className="mcal-num">{day}</span>
              {(hasA || hasI) && (
                <div className="mcal-dots">
                  {hasA && <span className="mcal-dot mcal-dot--a" />}
                  {hasI && <span className="mcal-dot mcal-dot--i" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mcal-legend">
        <span><span className="mcal-dot mcal-dot--a" /> Applied</span>
        <span><span className="mcal-dot mcal-dot--i" /> Interview</span>
      </div>

      {/* Selected date events */}
      {selected && (
        <div className="mcal-events">
          <p className="mcal-events-date">
            {new Date(selected + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
          {selectedEvents.length === 0 ? (
            <p className="mcal-events-empty">No events</p>
          ) : (
            <ul className="mcal-events-list">
              {selectedEvents.map(({ job, type }, idx) => (
                <li key={`${job.id}-${type}-${idx}`} className={`mcal-ev mcal-ev--${type === "applied" ? "a" : "i"}`}>
                  <span className={`mcal-dot mcal-dot--${type === "applied" ? "a" : "i"}`} />
                  <div className="mcal-ev-body">
                    <span className="mcal-ev-co">{job.company}</span>
                    <span className="mcal-ev-role">{job.role}</span>
                  </div>
                  <span className={`mcal-ev-badge mcal-ev-badge--${type === "applied" ? "a" : "i"}`}>
                    {type === "applied" ? "Applied" : "Interview"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Open full calendar */}
      <button className="mcal-full-btn" onClick={onOpenCalendar}>
        <i className="fas fa-expand" />
        Full Calendar
      </button>
    </div>
  );
}
