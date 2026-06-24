"use client";

import "@/styles/components/modal.scss";

interface DonationModalProps {
  onClose: () => void;
}

export default function DonationModal({ onClose }: DonationModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-donation"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Support TrabahoTrack</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-xmark" />
          </button>
        </div>
        <p className="modal-donation-subtitle">
          If TrabahoTrack helped your job hunt, consider sending a small tip
        </p>
        <div className="modal-donation-qr-wrap">
          <img
            src="/gcash-qr.jpg"
            alt="GCash QR Code"
            className="modal-donation-qr-img"
          />
          <p className="modal-donation-qr-hint">
            Scan with GCash app · Thank you!
          </p>
        </div>
      </div>
    </div>
  );
}
