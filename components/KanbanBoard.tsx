import type { Job } from "@/types/job";
import Column from "./Column";
import { JOB_STATUSES } from "@/utils/constants";
import "@/styles/components/kanbanBoard.scss";

interface KanbanBoardProps {
  jobs: Job[];
}

export default function KanbanBoard({ jobs }: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {JOB_STATUSES.map((status) => {
        // Filter jobs for this specific column
        const columnJobs = jobs.filter((job) => job.status === status);
        return <Column key={status} title={status} jobs={columnJobs} />;
      })}
    </div>
  );
}
