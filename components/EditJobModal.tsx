"use client";

import { useState } from "react";
import { jobsApi } from "@/lib/jobs";
import { parseJobUrl } from "@/lib/parseJobUrl";
import type { Job, JobStatus } from "@/types/job";
import { JOB_STATUSES, JOB_TAGS, JOB_PRIORITIES, REJECTION_STAGES } from "@/utils/constants";
import "@/styles/components/modal.scss";

interface EditJobModalProps {
  job: Job;
  onClose: () => void;
  onJobUpdated: (updatedJob: Job) => void;
  boardId: string;
  accessToken: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  priority?: string;
  onPriorityChange: (priority: string) => void;
  rejectionReason?: string;
  onRejectionReasonChange: (reason: string) => void;
}

export default function EditJobModal({
  job,
  onClose,
  onJobUpdated,
  boardId,
  accessToken,
  tags,
  onTagsChange,
  priority = "",
  onPriorityChange,
  rejectionReason = "",
  onRejectionReasonChange,
}: EditJobModalProps) {
  const [company, setCompany] = useState(job.company);
  const [role, setRole] = useState(job.role);
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [jobUrl, setJobUrl] = useState(job.job_url ?? "");
  const [salary, setSalary] = useState(job.salary ?? "");
  const [notes, setNotes] = useState(job.notes ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlHint, setUrlHint] = useState<string | null>(null);
  const [localPriority, setLocalPriority] = useState(priority);
  const [localRejectionReason, setLocalRejectionReason] = useState(rejectionReason);

  const handleJobUrlPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    const parsed = parseJobUrl(pasted);
    let hints: string[] = [];
    if (parsed.company && !company) {
      setCompany(parsed.company);
      hints.push("company");
    }
    if (parsed.role && !role) {
      setRole(parsed.role);
      hints.push("role");
    }
    if (hints.length > 0) {
      setUrlHint(`Auto-filled ${hints.join(" & ")} from URL`);
      setTimeout(() => setUrlHint(null), 3000);
    }
  };

  const handleTagToggle = (tagId: string) => {
    const next = tags.includes(tagId)
      ? tags.filter((t) => t !== tagId)
      : [...tags, tagId];
    onTagsChange(next);
  };

  const handlePriorityToggle = (priorityId: string) => {
    const next = localPriority === priorityId ? "" : priorityId;
    setLocalPriority(next);
    onPriorityChange(next);
  };

  const handleRejectionReasonChange = (value: string) => {
    setLocalRejectionReason(value);
    onRejectionReasonChange(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await jobsApi.updateJob(boardId, accessToken, job.id, {
        company,
        role,
        status,
        job_url: jobUrl || null,
        salary: salary || null,
        notes: notes || null,
      });
      onJobUpdated({ ...job, company, role, status, job_url: jobUrl || null, salary: salary || null, notes: notes || null });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update job");
      setIsLoading(false);
    }
  };

  const addedDate = new Date(job.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Edit Application</h2>
            <p className="modal-meta">Added {addedDate}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-company">Company *</label>
              <input
                id="edit-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-role">Role *</label>
              <input
                id="edit-role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="edit-status">Status</label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
              >
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <div className="priority-picker">
                {JOB_PRIORITIES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`priority-btn priority-btn--${p.id}${localPriority === p.id ? " priority-btn--active" : ""}`}
                    style={{ "--priority-color": p.color } as React.CSSProperties}
                    onClick={() => handlePriorityToggle(p.id)}
                    title={`${p.label} priority`}
                  >
                    <span className="priority-dot" />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {status === "Rejected" && (
            <div className="form-group rejection-reason-group">
              <label htmlFor="edit-rejection-reason">Why Rejected?</label>
              <select
                id="edit-rejection-reason"
                value={localRejectionReason}
                onChange={(e) => handleRejectionReasonChange(e.target.value)}
              >
                <option value="">— select stage (optional) —</option>
                {REJECTION_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <p className="form-hint form-hint--rejection">
                Track rejection patterns to find where you lose opportunities
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="edit-jobUrl">Job URL</label>
            <input
              id="edit-jobUrl"
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              onPaste={handleJobUrlPaste}
              placeholder="https://..."
            />
            {urlHint && <p className="form-hint">✨ {urlHint}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="edit-salary">Salary</label>
            <input
              id="edit-salary"
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. $80k–100k, ₱50,000/mo"
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-notes">Notes</label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Referral contact, interview notes…"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tag-picker">
              {JOB_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={`tag-picker-btn${tags.includes(tag.id) ? " tag-picker-btn--active" : ""}`}
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
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
