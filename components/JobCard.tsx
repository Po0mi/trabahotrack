"use client";

import { useState, useEffect, useRef } from "react";
import type { Job } from "@/types/job";
import { JOB_TAGS, JOB_PRIORITIES, REJECTION_STAGES, JOB_STATUSES, DEFAULT_OFFER_CHECKLIST } from "@/utils/constants";
import "@/styles/components/jobcard.scss";

interface JobCardProps {
  job: Job;
  tags: string[];
  priority?: string;
  rejectionReason?: string;
  avgResponseDays?: number;
  offerChecklist: Record<string, boolean>;
  interviewDate?: string;
  rejectionDate?: string;
  onInterviewDateChange?: (date: string) => void;
  onRejectionReasonChange?: (reason: string) => void;
  isDragging?: boolean;
  onDeleteJob: (jobId: string) => void;
  onEditJob: (job: Job) => void;
  onDragStart?: (jobId: string, x: number, y: number, grabX: number, grabY: number) => void;
  onTouchDragStart?: (jobId: string, x: number, y: number, grabX: number, grabY: number) => void;
  onMoveCard?: (jobId: string, newStatus: string) => void;
  onOfferChecklistChange?: (checklist: Record<string, boolean>) => void;
}

const STALE_MS = 14 * 24 * 60 * 60 * 1000;
const GHOST_WARN_MS = 7 * 24 * 60 * 60 * 1000;

const TAG_ICONS: Record<string, string> = {
  urgent:      "fa-circle-exclamation",
  remote:      "fa-wifi",
  hybrid:      "fa-building",
  "in-person": "fa-location-dot",
};

function timeSince(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getLogoSrc(job: Job): string {
  let domain = "";
  if (job.job_url) {
    try {
      domain = new URL(job.job_url).hostname;
    } catch {
      // ignore
    }
  }
  if (!domain) {
    domain =
      job.company
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9]/g, "") + ".com";
  }
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export default function JobCard({ job, tags, priority, rejectionReason, avgResponseDays, offerChecklist, interviewDate, rejectionDate, onInterviewDateChange, onRejectionReasonChange, isDragging, onDeleteJob, onEditJob, onDragStart, onTouchDragStart, onMoveCard, onOfferChecklistChange }: JobCardProps) {
  const [logoVisible, setLogoVisible] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const elapsed = Date.now() - new Date(job.created_at).getTime();
  const isStale = job.status === "Applied" && elapsed > STALE_MS;
  const isGhostWarning = job.status === "Applied" && !isStale && elapsed > GHOST_WARN_MS;

  const priorityMeta = priority ? JOB_PRIORITIES.find((p) => p.id === priority) : null;
  const rejectionStageMeta = rejectionReason ? REJECTION_STAGES.find((s) => s.id === rejectionReason) : null;

  const statusIndex = JOB_STATUSES.indexOf(job.status as typeof JOB_STATUSES[number]);
  const prevStatus = statusIndex > 0 ? JOB_STATUSES[statusIndex - 1] : null;
  const nextStatus = statusIndex < JOB_STATUSES.length - 1 ? JOB_STATUSES[statusIndex + 1] : null;

  // Escape collapses the card (capture phase to run before KanbanBoard's handler)
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setExpanded(false);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [expanded]);

  // Click outside collapses
  useEffect(() => {
    if (!expanded) return;
    const onOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    const tid = setTimeout(() => document.addEventListener("mousedown", onOutside), 60);
    return () => {
      clearTimeout(tid);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [expanded]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onDragStart?.(job.id, e.clientX, e.clientY, e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const startX = touch.clientX;
    const startY = touch.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const grabX = startX - rect.left;
    const grabY = startY - rect.top;
    const el = e.currentTarget;
    let active = true;

    const cancel = () => {
      if (!active) return;
      active = false;
      clearTimeout(timer);
      el.removeEventListener("touchmove", onEarlyMove);
      el.removeEventListener("touchend", onEarlyEnd);
      el.classList.remove("job-card--pressing");
    };

    const onEarlyMove = (ev: TouchEvent) => {
      const t = ev.touches[0];
      if (t && Math.hypot(t.clientX - startX, t.clientY - startY) > 15) cancel();
    };

    const onEarlyEnd = () => cancel();

    el.classList.add("job-card--pressing");
    el.addEventListener("touchmove", onEarlyMove, { passive: true });
    el.addEventListener("touchend", onEarlyEnd);

    const timer = setTimeout(() => {
      if (!active) return;
      active = false;
      el.removeEventListener("touchmove", onEarlyMove);
      el.removeEventListener("touchend", onEarlyEnd);
      el.classList.remove("job-card--pressing");
      onTouchDragStart?.(job.id, startX, startY, grabX, grabY);
    }, 250);
  };

  const handleClick = () => {
    setExpanded((prev) => !prev);
  };

  const activeTags = JOB_TAGS.filter((t) => tags.includes(t.id));

  return (
    <div
      ref={cardRef}
      className={[
        "job-card",
        isStale ? "job-card--stale" : "",
        isDragging ? "job-card--dragging" : "",
        priorityMeta?.id === "high" ? "job-card--high-priority" : "",
        expanded ? "job-card--expanded" : "",
      ].filter(Boolean).join(" ")}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDragStart={(e) => e.preventDefault()}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") setExpanded((prev) => !prev);
      }}
    >
      {/* Header: logo · title/company · badges */}
      <div className="job-card-header">
        <div className="job-card-logo-wrap">
          {logoVisible ? (
            <img
              src={getLogoSrc(job)}
              alt=""
              className="job-card-logo"
              width={36}
              height={36}
              onError={() => setLogoVisible(false)}
            />
          ) : (
            <span className="job-card-logo-fallback">
              {job.company[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="job-card-title-block">
          <h3 className="job-card-role">{job.role}</h3>
          <span className="job-card-company">{job.company}</span>
        </div>
        <div className="job-card-header-right">
          {isStale && <span className="job-card-stale-badge">Stale</span>}
          {isGhostWarning && <span className="job-card-ghost-badge">Ghosting?</span>}
          {priorityMeta && (
            <span
              className={`job-card-priority job-card-priority--${priorityMeta.id}`}
              style={{ "--priority-color": priorityMeta.color } as React.CSSProperties}
              title={`Priority: ${priorityMeta.label}`}
            >
              {priorityMeta.label}
            </span>
          )}
        </div>
      </div>

      {activeTags.length > 0 && (
        <div className="job-card-tags">
          {activeTags.map((tag) => (
            <span
              key={tag.id}
              className="job-card-tag"
              style={{ "--tag-color": tag.color } as React.CSSProperties}
            >
              <i className={`fas ${TAG_ICONS[tag.id] ?? "fa-tag"}`} />
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {job.status === "Interview" && interviewDate && (
        <p className="job-card-interview-date-badge">
          <i className="fas fa-calendar-check" />
          {formatDate(interviewDate)}
        </p>
      )}

      {job.status === "Rejected" && rejectionStageMeta && (
        <p className="job-card-rejection">
          <i className="fas fa-xmark job-card-rejection-icon" />
          {rejectionStageMeta.label}
        </p>
      )}

      {job.status === "Rejected" && rejectionDate && (
        <p className="job-card-rejection-date">
          <i className="fas fa-calendar-xmark" />
          {formatDate(rejectionDate)}
        </p>
      )}

      {(job.salary || (avgResponseDays !== undefined && job.status === "Applied")) && (
        <div className="job-card-meta-row">
          {avgResponseDays !== undefined && job.status === "Applied" && (
            <span className="job-card-response-badge" title="Average days until this company replies">
              <i className="fas fa-clock" />
              Avg reply: {avgResponseDays}d
            </span>
          )}
          {job.salary && (
            <span className="job-card-salary">
              <i className="fas fa-money-bill-wave" />
              {job.salary}
            </span>
          )}
        </div>
      )}

      {job.notes && (
        <p className={`job-card-notes${expanded ? " job-card-notes--full" : ""}`}>{job.notes}</p>
      )}

      <div className="job-card-footer">
        {job.job_url ? (
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="job-card-link"
            onClick={(e) => e.stopPropagation()}
          >
            View posting
            <i className="fas fa-arrow-up-right-from-square" />
          </a>
        ) : (
          <span />
        )}
        <div className="job-card-footer-meta">
          <span className="job-card-date">
            <i className="fas fa-calendar-days" />
            {formatDate(job.created_at)}
          </span>
          <span className="job-card-time">{timeSince(job.created_at)}</span>
        </div>
        <span className={`job-card-chevron-btn${expanded ? " job-card-chevron-btn--open" : ""}`}>
          <i className="fas fa-chevron-down" />
        </span>
      </div>

      {/* Expand drawer */}
      <div className={`job-card-drawer${expanded ? " job-card-drawer--open" : ""}`}>
        <div className="job-card-drawer-inner">
          <div className="job-card-drawer-content">
            <div className="job-card-drawer-sep" />

            {/* Interview date picker */}
            {job.status === "Interview" && (
              <div className="job-card-interview-date-section" onClick={(e) => e.stopPropagation()}>
                <div className="job-card-date-section-header">
                  <span className="job-card-date-section-title">
                    <i className="fas fa-calendar-check" />
                    Interview Date
                  </span>
                </div>
                <input
                  type="date"
                  className="job-card-date-input"
                  value={interviewDate ?? ""}
                  onChange={(e) => { e.stopPropagation(); onInterviewDateChange?.(e.target.value); }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Rejection date */}
            {job.status === "Rejected" && rejectionDate && (
              <div className="job-card-rejection-date-section">
                <i className="fas fa-calendar-xmark" />
                Rejected on {formatDate(rejectionDate)}
              </div>
            )}

            {/* Why Rejected dropdown */}
            {job.status === "Rejected" && (
              <div className="job-card-rejection-reason-section" onClick={(e) => e.stopPropagation()}>
                <label className="job-card-rejection-reason-label">
                  <i className="fas fa-circle-xmark" />
                  Why Rejected?
                </label>
                <select
                  className="job-card-rejection-reason-select"
                  value={rejectionReason ?? ""}
                  onChange={(e) => onRejectionReasonChange?.(e.target.value)}
                >
                  <option value="">— select stage —</option>
                  {REJECTION_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Feature 4: Pre-employment Checklist */}
            {job.status === "Offer" && (
              <div className="job-card-checklist" onClick={(e) => e.stopPropagation()}>
                <div className="job-card-checklist-header">
                  <span className="job-card-checklist-title">
                    <i className="fas fa-clipboard-list" />
                    Pre-employment Checklist
                  </span>
                  <span className="job-card-checklist-progress">
                    {DEFAULT_OFFER_CHECKLIST.filter((item) => offerChecklist[item.id]).length}
                    /{DEFAULT_OFFER_CHECKLIST.length}
                  </span>
                </div>
                {DEFAULT_OFFER_CHECKLIST.map((item) => (
                  <label key={item.id} className="job-card-checklist-item">
                    <input
                      type="checkbox"
                      checked={offerChecklist[item.id] ?? false}
                      onChange={(e) =>
                        onOfferChecklistChange?.({ ...offerChecklist, [item.id]: e.target.checked })
                      }
                    />
                    <span className={offerChecklist[item.id] ? "job-card-checklist-label--done" : ""}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {onMoveCard && (prevStatus || nextStatus) && (
              <div className="job-card-move-row">
                {prevStatus ? (
                  <button
                    className="job-card-move-btn"
                    onClick={(e) => { e.stopPropagation(); onMoveCard(job.id, prevStatus); }}
                  >
                    <i className="fas fa-chevron-left" />
                    {prevStatus}
                  </button>
                ) : <span />}
                {nextStatus ? (
                  <button
                    className="job-card-move-btn job-card-move-btn--next"
                    onClick={(e) => { e.stopPropagation(); onMoveCard(job.id, nextStatus); }}
                  >
                    {nextStatus}
                    <i className="fas fa-chevron-right" />
                  </button>
                ) : <span />}
              </div>
            )}
            <div className="job-card-drawer-row">
              <div className="job-card-drawer-actions">
                <button
                  className="job-card-drawer-edit"
                  onClick={(e) => { e.stopPropagation(); onEditJob(job); }}
                >
                  <i className="fas fa-pen-to-square" />
                  Edit
                </button>
                <button
                  className="job-card-drawer-delete"
                  onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }}
                  title="Delete"
                >
                  <i className="fas fa-trash" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
