"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { STORAGE_KEYS } from "@/utils/constants";
import "@/styles/components/syncmodal.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SyncToPhoneModal({ isOpen, onClose }: Props) {
  const params = useParams();
  const boardId = params?.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [magicLink, setMagicLink] = useState("");

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token || !boardId) return;
    const link = `${window.location.origin}/board/${boardId}#token=${encodeURIComponent(token)}`;
    setMagicLink(link);
    QRCode.toCanvas(canvasRef.current, link, {
      width: 200,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });
  }, [isOpen, boardId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(magicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-content--sync"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Open on Mobile</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="sync-body">
          <p className="sync-desc">
            Scan with your phone&rsquo;s camera, your board opens instantly with
            your session synced.
          </p>

          <div className="sync-qr-wrapper">
            <canvas ref={canvasRef} />
          </div>

          <div className="sync-divider">
            <span>or copy link</span>
          </div>

          <div className="sync-link-row">
            <code className="sync-link">{magicLink}</code>
            <button
              className={`sync-copy-btn${copied ? " copied" : ""}`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <i className="fa-solid fa-check" /> Copied!
                </>
              ) : (
                <>
                  <i className="fa-solid fa-copy" /> Copy
                </>
              )}
            </button>
          </div>

          <p className="sync-warning">
            <i className="fa-solid fa-shield-halved" />
            Keep this link private, it grants access to your board.
          </p>
        </div>
      </div>
    </div>
  );
}
