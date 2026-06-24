"use client";

import "@/styles/components/modal.scss";

interface ResetBoardModalProps {
  jobCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ResetBoardModal({
  jobCount,
  onConfirm,
  onClose,
}: ResetBoardModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content--sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-reset-icon">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div className="modal-header">
          <h2>Reset board?</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="modal-delete-body">
          This will permanently delete{" "}
          <strong>
            {jobCount} application{jobCount !== 1 ? "s" : ""}
          </strong>{" "}
          and give you a clean slate. This action{" "}
          <strong>cannot be undone</strong>.
        </p>

        <div className="modal-reset-warning">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Export your data first if you want a backup.
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
            Reset Board
          </button>
        </div>
      </div>
    </div>
  );
}
