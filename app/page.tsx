"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { boardApi } from "@/lib/board";
import { generateToken } from "@/utils/generateToken";
import { STORAGE_KEYS } from "@/utils/constants";
import "@/styles/pages/landing.scss";

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Check if user already has a board when the page loads
  useEffect(() => {
    const boardId = localStorage.getItem(STORAGE_KEYS.BOARD_ID);
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    // If they have both, skip the landing page and go straight to their board
    if (boardId && token) {
      router.replace(`/board/${boardId}`);
    }
  }, [router]);

  // 2. Handle the creation of a new board
  const handleCreateBoard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Generate a secure, random access token
      const accessToken = generateToken(32);

      // Call Supabase to create the board and get the public board_id
      const newBoardId = await boardApi.createBoard(accessToken);

      // Save both to the browser's localStorage
      localStorage.setItem(STORAGE_KEYS.BOARD_ID, newBoardId);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

      // Redirect to the Kanban board
      router.push(`/board/${newBoardId}`);
    } catch (err: any) {
      console.error(err);
      setError("Failed to create board. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="landing">
      <div className="landing__container">
        <h1 className="landing__title">TrabahoTrack</h1>
        <p className="landing__subtitle">
          Track your job applications. No sign-ups, no logins. Just your career.
        </p>

        <button
          className="landing__btn"
          onClick={handleCreateBoard}
          disabled={isLoading}
        >
          {isLoading ? "Creating Workspace..." : "Create New Board"}
        </button>

        {error && <p className="landing__error">{error}</p>}

        <p className="landing__disclaimer">
          🔒 Your board is private and stored securely in your browser.
        </p>
      </div>
    </main>
  );
}
