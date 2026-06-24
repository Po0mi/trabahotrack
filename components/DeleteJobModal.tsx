"use client";

import type { Job } from "@/types/job";
import "@/styles/components/modal.scss";

interface DeleteJobModalProps {
  job: Job;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteJobModal({
  job,
  onConfirm,
  onClose,
}: DeleteJobModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-delete-icon">
          <i className="fas fa-trash" />
        </div>

        <div className="modal-header">
          <h2>Delete application?</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-xmark" />
          </button>
        </div>

        <p className="modal-delete-body">
          <strong>
            {job.company} - {job.role}{" "}
          </strong>
          will be permanently removed. This can&apos;t be undone.
        </p>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
