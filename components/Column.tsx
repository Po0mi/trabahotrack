"use client";

import { useState } from "react";
import type { Job } from "@/types/job";
import JobCard from "./JobCard";
import "@/styles/components/kanbanBoard.scss";

type SortOrder = "newest" | "oldest" | "az";

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
  isActive: boolean;
  onDeleteJob: (jobId: string) => void;
  onEditJob: (job: Job) => void;
  draggingJobId: string | null;
  onJobDragStart: (jobId: string, x: number, y: number) => void;
}

export default function Column({
  title,
  jobs,
  jobTags,
  isActive,
  onDeleteJob,
  onEditJob,
  draggingJobId,
  onJobDragStart,
}: ColumnProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const statusClass = title.toLowerCase();
  const showGhost = isActive && draggingJobId !== null;

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortOrder === "oldest")
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === "az") return a.company.localeCompare(b.company);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div
      className={`kanban-column kanban-column--${statusClass}${isActive ? " kanban-column-active" : ""}`}
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
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              {sortOrder === "newest" ? (
                <polyline points="19 12 12 19 5 12" />
              ) : (
                <polyline points="5 12 12 5 19 12" />
              )}
            </svg>
          )}
        </button>
      </div>

      <div className="kanban-column-body">
        {sortedJobs.length === 0 && !showGhost ? (
          <p className="kanban-column-empty">Drop cards here</p>
        ) : (
          <>
            {sortedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                tags={jobTags[job.id] ?? []}
                isDragging={job.id === draggingJobId}
                onDeleteJob={onDeleteJob}
                onEditJob={onEditJob}
                onDragStart={onJobDragStart}
              />
            ))}
            {showGhost && <div className="kanban-column-ghost" />}
          </>
        )}
      </div>
    </div>
  );
}
