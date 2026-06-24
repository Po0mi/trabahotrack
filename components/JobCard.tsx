"use client";

import { useState } from "react";
import type { Job } from "@/types/job";
import { JOB_TAGS } from "@/utils/constants";
import "@/styles/components/jobcard.scss";

interface JobCardProps {
  job: Job;
  tags: string[];
  isDragging?: boolean;
  onDeleteJob: (jobId: string) => void;
  onEditJob: (job: Job) => void;
  onDragStart?: (jobId: string) => void;
  onDragEnd?: () => void;
}

const STALE_MS = 14 * 24 * 60 * 60 * 1000;

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

export default function JobCard({ job, tags, isDragging, onDeleteJob, onEditJob, onDragStart, onDragEnd }: JobCardProps) {
  const [logoVisible, setLogoVisible] = useState(true);

  const isStale =
    job.status === "Applied" &&
    Date.now() - new Date(job.created_at).getTime() > STALE_MS;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", job.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(job.id);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  const activeTags = JOB_TAGS.filter((t) => tags.includes(t.id));

  return (
    <div
      className={`job-card${isStale ? " job-card--stale" : ""}${isDragging ? " job-card--dragging" : ""}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
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
        </div>
        <button
          className="job-card-delete"
          onClick={(e) => { e.stopPropagation(); onDeleteJob(job.id); }}
          title="Delete"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
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

      {job.notes && (
        <p className="job-card-notes">{job.notes}</p>
      )}

      {job.job_url && (
        <a
          href={job.job_url}
          target="_blank"
          rel="noopener noreferrer"
          className="job-card-link"
          onClick={(e) => e.stopPropagation()}
        >
          View posting
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      )}
    </div>
  );
}
