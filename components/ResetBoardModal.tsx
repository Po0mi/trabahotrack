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
          <i className="fas fa-triangle-exclamation" />
        </div>

        <div className="modal-header">
          <h2>Reset board?</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-xmark" />
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
          <i className="fas fa-circle-info" style={{ flexShrink: 0, marginTop: 1 }} />
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
            <i className="fas fa-trash" />
            Reset Board
          </button>
        </div>
      </div>
    </div>
  );
}
