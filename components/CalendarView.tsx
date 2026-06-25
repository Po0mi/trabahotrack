"use client";

import { useState } from "react";
import type { Job } from "@/types/job";
import "@/styles/components/calendar.scss";

interface CalendarViewProps {
  jobs: Job[];
  interviewDates: Record<string, string>; // jobId -> "YYYY-MM-DD"
  onClose: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toLocalDateStr(isoStr: string): string {
  const d = new Date(isoStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarView({ jobs, interviewDates, onClose }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = toLocalDateStr(today.toISOString());

  // Build event map: date string -> list of events
  const eventMap: Record<string, Array<{ job: Job; type: "applied" | "interview" }>> = {};

  for (const job of jobs) {
    const appliedDate = toLocalDateStr(job.created_at);
    if (!eventMap[appliedDate]) eventMap[appliedDate] = [];
    eventMap[appliedDate].push({ job, type: "applied" });
  }

  for (const [jobId, dateStr] of Object.entries(interviewDates)) {
    if (!dateStr) continue;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) continue;
    if (!eventMap[dateStr]) eventMap[dateStr] = [];
    eventMap[dateStr].push({ job, type: "interview" });
  }

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  const cellDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const selectedEvents = selectedDate ? (eventMap[selectedDate] ?? []) : [];

  return (
    <div className="modal-overlay cal-overlay" onClick={onClose}>
      <div className="modal-content cal-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cal-header">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prevMonth} aria-label="Previous month">
              <i className="fas fa-chevron-left" />
            </button>
            <button className="cal-month-title" onClick={goToday} title="Go to today">
              {MONTHS[month]} {year}
            </button>
            <button className="cal-nav-btn" onClick={nextMonth} aria-label="Next month">
              <i className="fas fa-chevron-right" />
            </button>
          </div>
          <div className="cal-legend">
            <span className="cal-legend-item cal-legend-item--applied">
              <span className="cal-dot cal-dot--applied" /> Applied
            </span>
            <span className="cal-legend-item cal-legend-item--interview">
              <span className="cal-dot cal-dot--interview" /> Interview
            </span>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        {/* Day-of-week headers */}
        <div className="cal-grid cal-grid--header">
          {DAYS.map((d) => (
            <div key={d} className="cal-cell cal-cell--dow">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="cal-grid cal-grid--body">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="cal-cell cal-cell--empty" />;
            const dateStr = cellDateStr(day);
            const events = eventMap[dateStr] ?? [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const hasApplied = events.some((e) => e.type === "applied");
            const hasInterview = events.some((e) => e.type === "interview");

            return (
              <div
                key={dateStr}
                className={[
                  "cal-cell",
                  isToday ? "cal-cell--today" : "",
                  isSelected ? "cal-cell--selected" : "",
                  events.length > 0 ? "cal-cell--has-events" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setSelectedDate((prev) => (prev === dateStr ? null : dateStr))}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedDate((prev) => prev === dateStr ? null : dateStr); }}
                aria-label={`${MONTHS[month]} ${day}${events.length > 0 ? `, ${events.length} event${events.length > 1 ? "s" : ""}` : ""}`}
              >
                <span className="cal-day-num">{day}</span>
                {(hasApplied || hasInterview) && (
                  <div className="cal-dots">
                    {hasApplied && <span className="cal-dot cal-dot--applied" />}
                    {hasInterview && <span className="cal-dot cal-dot--interview" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Event list for selected date */}
        {selectedDate && (
          <div className="cal-events">
            <div className="cal-events-title">
              <i className="fas fa-calendar-check" />
              {new Date(selectedDate + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </div>
            {selectedEvents.length === 0 ? (
              <p className="cal-events-empty">No events on this day.</p>
            ) : (
              <ul className="cal-events-list">
                {selectedEvents.map(({ job, type }, idx) => (
                  <li key={`${job.id}-${type}-${idx}`} className={`cal-event cal-event--${type}`}>
                    <span className={`cal-dot cal-dot--${type}`} />
                    <div className="cal-event-info">
                      <span className="cal-event-company">{job.company}</span>
                      <span className="cal-event-role">{job.role}</span>
                    </div>
                    <span className={`cal-event-badge cal-event-badge--${type}`}>
                      {type === "applied" ? "Applied" : "Interview"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
