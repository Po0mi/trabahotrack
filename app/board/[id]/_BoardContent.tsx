"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { jobsApi } from "@/lib/jobs";
import { toast } from "@/lib/toast";
import { STORAGE_KEYS } from "@/utils/constants";
import type { Job, JobStatus } from "@/types/job";
import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";
import DisclaimerModal from "@/components/DisclaimerModal";
import DeleteJobModal from "@/components/DeleteJobModal";
import DonationModal from "@/components/DonationModal";
import ToastContainer from "@/components/ToastContainer";
import "@/styles/pages/board.scss";

export default function BoardContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardId = params.id as string;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  const prefillCompany = searchParams.get("company") ?? undefined;
  const prefillRole = searchParams.get("role") ?? undefined;
  const prefillUrl = searchParams.get("url") ?? undefined;
  const prefill =
    prefillCompany || prefillRole || prefillUrl
      ? { company: prefillCompany, role: prefillRole, url: prefillUrl }
      : undefined;

  useEffect(() => {
    // Handle magic link: extract token from URL hash and save to localStorage
    const hash = window.location.hash;
    const tokenMatch = hash.match(/token=([^&]+)/);
    if (tokenMatch) {
      const tokenFromHash = decodeURIComponent(tokenMatch[1]);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenFromHash);
      localStorage.setItem(STORAGE_KEYS.BOARD_ID, boardId);
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }

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

  const handleJobAdded = (newJob: Job) => {
    setJobs((prevJobs) => [newJob, ...prevJobs]);
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job,
      ),
    );
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)),
    );
  };

  const handleDeleteJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) setJobToDelete(job);
  };

  const confirmDeleteJob = async () => {
    if (!jobToDelete) return;
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || "";
    try {
      await jobsApi.deleteJob(boardId, token, jobToDelete.id);
      setJobs((prevJobs) =>
        prevJobs.filter((job) => job.id !== jobToDelete.id),
      );
      toast("Application deleted.");
    } catch (error) {
      console.error("Failed to delete job", error);
      toast("Failed to delete job.", "error");
    } finally {
      setJobToDelete(null);
    }
  };

  const handleClearBoard = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || "";
    const ids = jobs.map((j) => j.id);
    try {
      await jobsApi.clearBoard(boardId, token, ids);
      setJobs([]);
      toast("Board cleared.");
    } catch (error) {
      console.error("Failed to clear board", error);
      toast("Failed to clear board. Please try again.", "error");
    }
  };

  return (
    <div className="board-page">
      <DisclaimerModal />
      {jobToDelete && (
        <DeleteJobModal
          job={jobToDelete}
          onConfirm={confirmDeleteJob}
          onClose={() => setJobToDelete(null)}
        />
      )}
      <Navbar />
      <main className="board-main">
        {isLoading ? (
          <div className="board-loading">
            <div className="board-loading-spinner" />
            Loading your board…
          </div>
        ) : (
          <KanbanBoard
            jobs={jobs}
            onJobAdded={handleJobAdded}
            onStatusChange={handleStatusChange}
            onDeleteJob={handleDeleteJob}
            onJobUpdated={handleJobUpdated}
            onClearBoard={handleClearBoard}
            prefill={prefill}
          />
        )}
      </main>
      <footer className="board-footer">
        <span className="board-footer-credit">
          Made by{" "}
          <a
            href="https://github.com/Po0mi?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="board-footer-link"
          >
            Po0mi
          </a>
        </span>
        <span className="board-footer-sep" aria-hidden>
          ·
        </span>
        <button className="btn-donate" onClick={() => setIsDonationOpen(true)}>
          Support
        </button>
      </footer>
      <ToastContainer />
      {isDonationOpen && (
        <DonationModal onClose={() => setIsDonationOpen(false)} />
      )}
    </div>
  );
}
