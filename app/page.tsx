"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { boardApi } from "@/lib/board";
import { generateToken } from "@/utils/generateToken";
import { STORAGE_KEYS } from "@/utils/constants";
import "@/styles/pages/landing.scss";
import Image from "next/image";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const boardId = localStorage.getItem(STORAGE_KEYS.BOARD_ID);
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (boardId && token) {
      router.replace(`/board/${boardId}`);
    }
  }, [router]);

  const handleCreateBoard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = generateToken(32);
      const newBoardId = await boardApi.createBoard(accessToken);
      localStorage.setItem(STORAGE_KEYS.BOARD_ID, newBoardId);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      router.push(`/board/${newBoardId}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to create board. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="landing">
      <div className="landing-container">
        <div className="landing-logo-mark">
          <Image
            src="/logo.png"
            alt="TrabahoTracker"
            width={96}
            height={96}
            className="landing-logo-img"
            priority
          />
        </div>

        <h1 className="landing-title">TrabahoTrack</h1>
        <p className="landing-subtitle">
          Track your job applications in one simple board. No account needed,
          just a link.
        </p>

        <button
          className="landing-btn"
          onClick={handleCreateBoard}
          disabled={isLoading}
        >
          {isLoading ? "Creating your board…" : "Create Free Board →"}
        </button>

        {error && <p className="landing-error">{error}</p>}

        <div className="landing-meta">
          <span className="landing-meta-item">No login required</span>
          <span className="landing-meta-dot">·</span>
          <span className="landing-meta-item">Instant access</span>
          <span className="landing-meta-dot">·</span>
          <span className="landing-meta-item">Free forever</span>
        </div>
      </div>
    </main>
  );
}
