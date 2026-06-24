import type { Job } from "@/types/job";
import JobCard from "./JobCard";
import "@/styles/components/kanbanBoard.scss";

interface ColumnProps {
  title: string;
  jobs: Job[];
}

export default function Column({ title, jobs }: ColumnProps) {
  return (
    <div className="kanban-column">
      <div className="kanban-column__header">
        <h2 className="kanban-column__title">{title}</h2>
        <span className="kanban-column__count">{jobs.length}</span>
      </div>
      <div className="kanban-column__body">
        {jobs.length === 0 ? (
          <p className="kanban-column__empty">No jobs yet</p>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
}
