export type JobStatus = "Applied" | "Interview" | "Offer" | "Rejected" | "Ghosted";

export interface RoundEntry {
  id: string;
  round: number;
  interviewer: string;
  notes: string;
  date: string;
}

export interface Job {
  id: string;
  board_id: string;
  company: string;
  role: string;
  status: JobStatus;
  job_url?: string | null;
  salary?: string | null;
  notes?: string | null;
  created_at: string;
}
