"use client";

import { useState } from "react";
import { jobsApi } from "@/lib/jobs";
import { parseJobUrl } from "@/lib/parseJobUrl";
import type { Job, JobStatus } from "@/types/job";
import { JOB_STATUSES, JOB_TAGS } from "@/utils/constants";
import "@/styles/components/modal.scss";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: (job: Job) => void;
  onTagsChange: (jobId: string, tags: string[]) => void;
  boardId: string;
  accessToken: string;
  initialCompany?: string;
  initialRole?: string;
  initialUrl?: string;
}

export default function AddJobModal({
  isOpen,
  onClose,
  onJobAdded,
  onTagsChange,
  boardId,
  accessToken,
  initialCompany = "",
  initialRole = "",
  initialUrl = "",
}: AddJobModalProps) {
  const [company, setCompany] = useState(initialCompany);
  const [role, setRole] = useState(initialRole);
  const [status, setStatus] = useState<JobStatus>("Applied");
  const [jobUrl, setJobUrl] = useState(initialUrl);
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlHint, setUrlHint] = useState<string | null>(null);

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  if (!isOpen) return null;

  const handleJobUrlPaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");

    // Instant local parse first
    const local = parseJobUrl(pasted);
    if (local.company && !company) setCompany(local.company);
    if (local.role && !role) setRole(local.role);

    // Server-side fetch for richer extraction
    setIsFetching(true);
    setUrlHint("Fetching job details…");
    try {
      const res = await fetch(`/api/scrape-job?url=${encodeURIComponent(pasted)}`);
      if (res.ok) {
        const data: { company?: string; role?: string } = await res.json();
        const filled: string[] = [];
        if (data.company && !company && !local.company) {
          setCompany(data.company);
          filled.push("company");
        }
        if (data.role && !role && !local.role) {
          setRole(data.role);
          filled.push("role");
        }
        // Prefer API data over local parse when both succeed
        if (data.company && local.company) {
          setCompany(data.company);
          if (!filled.includes("company")) filled.push("company");
        }
        if (data.role && local.role) {
          setRole(data.role);
          if (!filled.includes("role")) filled.push("role");
        }
        if (filled.length > 0) {
          setUrlHint(`Auto-filled ${filled.join(" & ")} from URL`);
        } else if (local.company || local.role) {
          setUrlHint("Auto-filled from URL");
        } else {
          setUrlHint(null);
        }
      } else {
        // API failed — show result from local parse if anything was found
        if (local.company || local.role) {
          setUrlHint("Auto-filled from URL");
        } else {
          setUrlHint(null);
        }
      }
    } catch {
      if (local.company || local.role) {
        setUrlHint("Auto-filled from URL");
      } else {
        setUrlHint(null);
      }
    } finally {
      setIsFetching(false);
      setTimeout(() => setUrlHint(null), 4000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newJobId = await jobsApi.createJob(boardId, accessToken, {
        company,
        role,
        status,
        job_url: jobUrl,
        notes,
      });

      const newJob: Job = {
        id: newJobId,
        board_id: boardId,
        company,
        role,
        status,
        job_url: jobUrl,
        notes,
        created_at: new Date().toISOString(),
      };

      onJobAdded(newJob);
      if (selectedTags.length > 0) onTagsChange(newJobId, selectedTags);
      handleReset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCompany("");
    setRole("");
    setStatus("Applied");
    setJobUrl("");
    setNotes("");
    setSelectedTags([]);
    setError(null);
    setUrlHint(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Application</h2>
          <button className="modal-close" onClick={handleClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="jobUrl">Job URL</label>
            <input
              id="jobUrl"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              onPaste={handleJobUrlPaste}
              placeholder="Paste a LinkedIn or Indeed URL to auto-fill"
            />
            {isFetching && (
              <p className="form-hint form-hint--loading">Fetching job details…</p>
            )}
            {!isFetching && urlHint && (
              <p className="form-hint">✨ {urlHint}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <input
              id="role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as JobStatus)}
            >
              {JOB_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Salary range, referral contact, interview notes…"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-picker">
              {JOB_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-picker-btn${selectedTags.includes(tag.id) ? " tag-picker-btn--active" : ""}`}
                  style={{ "--tag-color": tag.color } as React.CSSProperties}
                  onClick={() => handleTagToggle(tag.id)}
                >
                  <span className="tag-picker-dot" />
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading || isFetching}>
              {isLoading ? "Saving…" : "Save Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
