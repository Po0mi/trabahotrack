"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobsApi } from "@/lib/jobs";
import { STORAGE_KEYS } from "@/utils/constants";
import type { Job } from "@/types/job";
import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";
import "@/styles/pages/board.scss";

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.id as string;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      router.push("/");
      return;
    }

    async function fetchJobs() {
      try {
        const data = await jobsApi.getJobs(boardId, token!);
        setJobs(data);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, [boardId, router]);

  // This function updates the UI instantly when a new job is added
  const handleJobAdded = (newJob: Job) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
  };

  return (
    <div className="board-page">
      <Navbar />
      <main className="board-main">
        {isLoading ? (
          <div className="board-loading">Loading your workspace...</div>
        ) : (
          <KanbanBoard jobs={jobs} onJobAdded={handleJobAdded} />
        )}
      </main>
    </div>
  );
}
