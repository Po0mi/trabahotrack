"use client";

import { useRef, useState } from "react";
import type { Job } from "@/types/job";
import JobCard from "./JobCard";
import "@/styles/components/kanbanBoard.scss";

interface ColumnProps {
  title: string;
  jobs: Job[];
  jobTags: Record<string, string[]>;
  onDrop: (jobId: string, newStatus: string) => void;
  onDeleteJob: (jobId: string) => void;
  onEditJob: (job: Job) => void;
  draggingJobId: string | null;
  onJobDragStart: (jobId: string) => void;
  onJobDragEnd: () => void;
}

export default function Column({
  title,
  jobs,
  jobTags,
  onDrop,
  onDeleteJob,
  onEditJob,
  draggingJobId,
  onJobDragStart,
  onJobDragEnd,
}: ColumnProps) {
  const statusClass = title.toLowerCase();
  const [isDragActive, setIsDragActive] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!columnRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const jobId = e.dataTransfer.getData("text/plain");
    if (jobId) onDrop(jobId, title);
  };

  const showGhost = isDragActive && draggingJobId !== null;

  return (
    <div
      ref={columnRef}
      className={`kanban-column kanban-column--${statusClass}${isDragActive ? " kanban-column-active" : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header">
        <h2 className="kanban-column-title">{title}</h2>
        <span className="kanban-column-count">{jobs.length}</span>
      </div>

      <div className="kanban-column-body">
        {jobs.length === 0 && !showGhost ? (
          <p className="kanban-column-empty">Drop cards here</p>
        ) : (
          <>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                tags={jobTags[job.id] ?? []}
                isDragging={job.id === draggingJobId}
                onDeleteJob={onDeleteJob}
                onEditJob={onEditJob}
                onDragStart={onJobDragStart}
                onDragEnd={onJobDragEnd}
              />
            ))}
            {showGhost && <div className="kanban-column-ghost" />}
          </>
        )}
      </div>
    </div>
  );
}
