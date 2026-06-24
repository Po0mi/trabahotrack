"use client";

import { useState } from "react";
import { jobsApi } from "@/lib/jobs";
import type { Job } from "@/types/job";
import "@/styles/components/modal.scss";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: (job: Job) => void;
  boardId: string;
  accessToken: string;
}

export default function AddJobModal({
  isOpen,
  onClose,
  onJobAdded,
  boardId,
  accessToken,
}: AddJobModalProps) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Send data to Supabase
      const newJobId = await jobsApi.createJob(boardId, accessToken, {
        company,
        role,
        status: "Applied", // Default status for new jobs
        job_url: jobUrl,
        notes,
      });

      // 2. Create the local job object to update UI instantly
      const newJob: Job = {
        id: newJobId,
        board_id: boardId,
        company,
        role,
        status: "Applied",
        job_url: jobUrl,
        notes,
        created_at: new Date().toISOString(),
      };

      // 3. Update the parent state and close modal
      onJobAdded(newJob);
      handleReset();
    } catch (err: any) {
      setError(err.message || "Failed to add job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCompany("");
    setRole("");
    setJobUrl("");
    setNotes("");
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Application</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Company *</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              required
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              required
            />
          </div>

          <div className="form-group">
            <label>Job URL</label>
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Salary range, referral info, etc."
              rows={3}
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
