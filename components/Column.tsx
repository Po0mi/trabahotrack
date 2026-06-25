"use client";

import { useState } from "react";
import type { Job, RoundEntry } from "@/types/job";
import JobCard from "./JobCard";
import "@/styles/components/kanbanBoard.scss";

type SortOrder = "newest" | "oldest" | "az";

const EMPTY_COPY: Record<string, string> = {
  Applied: "Keep applying.",
  Interview: "You'll land one.",
  Offer: "Almost there.",
  Rejected: "Part of the grind.",
  Ghosted: "Stay consistent.",
};

const NEXT_SORT: Record<SortOrder, SortOrder> = {
  newest: "oldest",
  oldest: "az",
  az: "newest",
};

const SORT_LABEL: Record<SortOrder, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  az: "A → Z",
};

interface ColumnProps {
  title: string;
  jobs: Job[];
  jobTags: Record<string, string[]>;
  jobPriorities: Record<string, string>;
  rejectionReasons: Record<string, string>;
  jobAvgResponseDays: Record<string, number>;
  roundHistory: Record<string, RoundEntry[]>;
  offerChecklists: Record<string, Record<string, boolean>>;
  isActive: boolean;
  isPulsing?: boolean;
  onDeleteJob: (jobId: string) => void;
  onEditJob: (job: Job) => void;
  draggingJobId: string | null;
  onJobDragStart: (jobId: string, x: number, y: number, grabX: number, grabY: number) => void;
  onJobTouchDragStart: (jobId: string, x: number, y: number, grabX: number, grabY: number) => void;
  onMoveCard: (jobId: string, newStatus: string) => void;
  onRoundHistoryChange: (jobId: string, rounds: RoundEntry[]) => void;
  onOfferChecklistChange: (jobId: string, checklist: Record<string, boolean>) => void;
}

export default function Column({
  title,
  jobs,
  jobTags,
  jobPriorities,
  rejectionReasons,
  jobAvgResponseDays,
  roundHistory,
  offerChecklists,
  isActive,
  isPulsing,
  onDeleteJob,
  onEditJob,
  draggingJobId,
  onJobDragStart,
  onJobTouchDragStart,
  onMoveCard,
  onRoundHistoryChange,
  onOfferChecklistChange,
}: ColumnProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const statusClass = title.toLowerCase();
  const showGhost = isActive && draggingJobId !== null;

  const sortedJobs = [...jobs].sort((a, b) => {
    // High priority jobs always float to the top within their sort group
    const aPriority = jobPriorities[a.id] === "high" ? 0 : jobPriorities[a.id] === "medium" ? 1 : 2;
    const bPriority = jobPriorities[b.id] === "high" ? 0 : jobPriorities[b.id] === "medium" ? 1 : 2;
    if (aPriority !== bPriority) return aPriority - bPriority;

    if (sortOrder === "oldest")
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === "az") return a.company.localeCompare(b.company);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div
      className={[
        `kanban-column kanban-column--${statusClass}`,
        isActive ? "kanban-column-active" : "",
        isPulsing ? "kanban-column--pulsing" : "",
      ].filter(Boolean).join(" ")}
      data-col-status={title}
    >
      <div className="kanban-column-header">
        <h2 className="kanban-column-title">{title}</h2>
        <span className="kanban-column-count">{jobs.length}</span>
        <button
          className={`col-sort-btn${sortOrder !== "newest" ? " col-sort-btn--active" : ""}`}
          onClick={() => setSortOrder(NEXT_SORT[sortOrder])}
          title={`Sort: ${SORT_LABEL[sortOrder]}`}
        >
          {sortOrder === "az" ? (
            <span className="col-sort-az">AZ</span>
          ) : sortOrder === "newest" ? (
            <i className="fas fa-arrow-down" />
          ) : (
            <i className="fas fa-arrow-up" />
          )}
        </button>
      </div>

      <div className="kanban-column-body">
        {sortedJobs.length === 0 && !showGhost ? (
          <p className="kanban-column-empty">{EMPTY_COPY[title] ?? "Drop here."}</p>
        ) : (
          <>
            {sortedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                tags={jobTags[job.id] ?? []}
                priority={jobPriorities[job.id]}
                rejectionReason={rejectionReasons[job.id]}
                avgResponseDays={jobAvgResponseDays[job.id]}
                rounds={roundHistory[job.id] ?? []}
                offerChecklist={offerChecklists[job.id] ?? {}}
                isDragging={job.id === draggingJobId}
                onDeleteJob={onDeleteJob}
                onEditJob={onEditJob}
                onDragStart={onJobDragStart}
                onTouchDragStart={onJobTouchDragStart}
                onMoveCard={onMoveCard}
                onRoundsChange={(rounds) => onRoundHistoryChange(job.id, rounds)}
                onOfferChecklistChange={(cl) => onOfferChecklistChange(job.id, cl)}
              />
            ))}
            {showGhost && <div className="kanban-column-ghost" />}
          </>
        )}
      </div>
    </div>
  );
}
