"use client";

import { generateBookmarklet } from "@/lib/bookmarklet";
import "@/styles/components/modal.scss";

interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardUrl: string;
}

export default function BookmarkletModal({
  isOpen,
  onClose,
  boardUrl,
}: BookmarkletModalProps) {
  const href = generateBookmarklet(boardUrl);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content-bookmarklet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Browser Bookmarklet</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="bookmarklet-body">
          <p className="bookmarklet-desc">
            Drag the link below to your browser&apos;s bookmarks bar. Then click
            it on any job listing to instantly add it to this board.
          </p>

          <div className="bookmarklet-drag-zone">
            {/* Direct href with suppressHydrationWarning */}
            <a
              href={href}
              className="bookmarklet-link"
              suppressHydrationWarning
            >
              Add to TrabahoTrack
            </a>
            <span className="bookmarklet-drag-hint">
              ↑ drag this to your bookmarks bar
            </span>
          </div>

          <div className="bookmarklet-sites">
            <p className="bookmarklet-sites-label">Works on</p>
            <div className="bookmarklet-sites-list">
              {["LinkedIn", "Indeed", "Glassdoor", "+ most job boards"].map(
                (s) => (
                  <span key={s} className="bookmarklet-site-chip">
                    {s}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
