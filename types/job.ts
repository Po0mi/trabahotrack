export type JobStatus = "Applied" | "Interview" | "Offer" | "Rejected";

export interface Job {
  id: string;
  board_id: string;
  company: string;
  role: string;
  status: JobStatus;
  job_url?: string | null;
  notes?: string | null;
  created_at: string;
}
