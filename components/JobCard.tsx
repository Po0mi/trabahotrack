"use client";

import { useState } from "react";
import type { Job } from "@/types/job";
import { JOB_TAGS, JOB_PRIORITIES, REJECTION_STAGES } from "@/utils/constants";
import "@/styles/components/jobcard.scss";

interface JobCardProps {
  job: Job;
  tags: string[];
  priority?: string;
  rejectionReason?: string;
  isDragging?: boolean;
  onDeleteJob: (jobId: string) => void;
  onEditJob: (job: Job) => void;
  onDragStart?: (jobId: string, x: number, y: number) => void;
  onTouchDragStart?: (jobId: string, x: number, y: number) => void;
}

const STALE_MS = 14 * 24 * 60 * 60 * 1000;
const GHOST_WARN_MS = 7 * 24 * 60 * 60 * 1000;

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

export default function JobCard({ job, tags, priority, rejectionReason, isDragging, onDeleteJob, onEditJob, onDragStart, onTouchDragStart }: JobCardProps) {
  const [logoVisible, setLogoVisible] = useState(true);

  const elapsed = Date.now() - new Date(job.created_at).getTime();
  const isStale = job.status === "Applied" && elapsed > STALE_MS;
  const isGhostWarning = job.status === "Applied" && !isStale && elapsed > GHOST_WARN_MS;

  const priorityMeta = priority ? JOB_PRIORITIES.find((p) => p.id === priority) : null;
  const rejectionStageMeta = rejectionReason ? REJECTION_STAGES.find((s) => s.id === rejectionReason) : null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    onDragStart?.(job.id, e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const startX = touch.clientX;
    const startY = touch.clientY;
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
      if (t && Math.hypot(t.clientX - startX, t.clientY - startY) > 8) cancel();
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
      onTouchDragStart?.(job.id, startX, startY);
    }, 250);
  };

  const activeTags = JOB_TAGS.filter((t) => tags.includes(t.id));

  return (
    <div
      className={`job-card${isStale ? " job-card--stale" : ""}${isDragging ? " job-card--dragging" : ""}${priorityMeta?.id === "high" ? " job-card--high-priority" : ""}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDragStart={(e) => e.preventDefault()}
      onClick={() => onEditJob(job)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onEditJob(job)}
    >
      <div className="job-card-header">
        <div className="job-card-company-row">
          {logoVisible && (
            <img
              src={getLogoSrc(job)}
              alt=""
              className="job-card-logo"
              width={14}
              height={14}
              onError={() => setLogoVisible(false)}
            />
          )}
          <h3 className="job-card-company">{job.company}</h3>
          {isStale && <span className="job-card-stale-badge">Stale</span>}
          {isGhostWarning && <span className="job-card-ghost-badge">👀 Ghosting?</span>}
        </div>
        <div className="job-card-header-right">
          {priorityMeta && (
            <span
              className={`job-card-priority job-card-priority--${priorityMeta.id}`}
              style={{ "--priority-color": priorityMeta.color } as React.CSSProperties}
              title={`Priority: ${priorityMeta.label}`}
            >
              {priorityMeta.label}
            </span>
          )}
          <button
            className="job-card-delete"
            onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }}
            title="Delete"
          >
            <i className="fas fa-xmark" />
          </button>
        </div>
      </div>

      <p className="job-card-role">{job.role}</p>

      {activeTags.length > 0 && (
        <div className="job-card-tags">
          {activeTags.map((tag) => (
            <span
              key={tag.id}
              className="job-card-tag"
              style={{ "--tag-color": tag.color } as React.CSSProperties}
            >
              <span className="job-card-tag-dot" />
              {tag.label}
            </span>
          ))}
        </div>
      )}

      {job.status === "Rejected" && rejectionStageMeta && (
        <p className="job-card-rejection">
          <i className="fas fa-xmark job-card-rejection-icon" />
          {rejectionStageMeta.label}
        </p>
      )}

      {job.notes && (
        <p className="job-card-notes">{job.notes}</p>
      )}

      <div className="job-card-footer">
        {job.job_url && (
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
        )}
        <span className="job-card-time">{timeSince(job.created_at)}</span>
      </div>
    </div>
  );
}
