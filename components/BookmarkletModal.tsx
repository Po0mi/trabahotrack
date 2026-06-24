"use client";

import { useRef, useEffect } from "react";
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
  const linkRef = useRef<HTMLAnchorElement>(null);

  const href = generateBookmarklet(boardUrl);

  // Bypass React's javascript: URL block by setting it imperatively after render
  useEffect(() => {
    if (linkRef.current) {
      linkRef.current.href = href;
    }
  }, [href]);

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
            Drag the button below to your browser&apos;s bookmarks bar. Then
            click it on any job listing to instantly add it to this board.
          </p>

          <div className="bookmarklet-drag-zone">
            <a
              ref={linkRef}
              className="bookmarklet-link"
              onClick={(e) => e.preventDefault()}
              draggable
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Add to TrabahoTrack
            </a>
            <span className="bookmarklet-drag-hint">drag to bookmarks bar</span>
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
