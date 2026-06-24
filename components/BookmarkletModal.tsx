"use client";

import { useState } from "react";
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
  const [copied, setCopied] = useState(false);
  const href = generateBookmarklet(boardUrl);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers if needed
    }
  };

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
            Modern browsers block dragging bookmarklets for security. Instead,
            click the button below and follow the quick setup steps.
          </p>

          <div className="bookmarklet-drag-zone">
            <button className="bookmarklet-copy-btn" onClick={handleCopy}>
              {copied ? "✓ Code Copied!" : "Copy Bookmarklet Code"}
            </button>

            <div className="bookmarklet-instructions">
              <p>
                <strong>1.</strong> Copy the code above
              </p>
              <p>
                <strong>2.</strong> Open your bookmarks bar (Ctrl+Shift+B /
                Cmd+Shift+B)
              </p>
              <p>
                <strong>3.</strong> Create a new bookmark (Ctrl+D / Cmd+D)
              </p>
              <p>
                <strong>4.</strong> Edit it & paste the code into the{" "}
                <em>URL</em> field
              </p>
              <p>
                <strong>5.</strong> Name it "Add to TrabahoTrack" & Save
              </p>
            </div>
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
