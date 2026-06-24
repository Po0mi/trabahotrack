"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { STORAGE_KEYS } from "@/utils/constants";
import type { Job } from "@/types/job";
import Column from "./Column";
import AddJobModal from "./AddJobModal";
import { JOB_STATUSES } from "@/utils/constants";
import "@/styles/components/kanbanBoard.scss";

interface KanbanBoardProps {
  jobs: Job[];
  onJobAdded: (job: Job) => void;
}

export default function KanbanBoard({ jobs, onJobAdded }: KanbanBoardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const params = useParams();
  const boardId = params.id as string;
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || "";

  return (
    <>
      <div className="kanban-header">
        <h1 className="kanban-title">My Applications</h1>
        <button className="btn-add-job" onClick={() => setIsModalOpen(true)}>
          + Add Job
        </button>
      </div>

      <div className="kanban-board">
        {JOB_STATUSES.map((status) => {
          const columnJobs = jobs.filter((job) => job.status === status);
          return <Column key={status} title={status} jobs={columnJobs} />;
        })}
      </div>

      <AddJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onJobAdded={onJobAdded}
        boardId={boardId}
        accessToken={accessToken}
      />
    </>
  );
}
