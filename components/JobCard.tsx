import type { Job } from "@/types/job";
import "@/styles/components/jobCard.scss";

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="job-card">
      <h3 className="job-card__company">{job.company}</h3>
      <p className="job-card__role">{job.role}</p>
      {job.job_url && (
        <a
          href={job.job_url}
          target="_blank"
          rel="noopener noreferrer"
          className="job-card__link"
        >
          View Application ↗
        </a>
      )}
    </div>
  );
}
