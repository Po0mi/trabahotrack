export const JOB_STATUSES = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
  "Ghosted",
] as const;

export const STORAGE_KEYS = {
  BOARD_ID: "trabahotrack_board_id",
  ACCESS_TOKEN: "trabahotrack_access_token",
  JOB_TAGS: "trabahotrack_job_tags",
  JOB_PRIORITIES: "trabahotrack_job_priorities",
  REJECTION_REASONS: "trabahotrack_rejection_reasons",
  INTERVIEW_DATES: "trabahotrack_interview_dates",
  COMPANY_RESPONSE_TIMES: "trabahotrack_company_response_times",
  ROUND_HISTORY: "trabahotrack_round_history",
  BURNOUT: "trabahotrack_burnout",
  OFFER_CHECKLISTS: "trabahotrack_offer_checklists",
  REJECTION_DATES: "trabahotrack_rejection_dates",
};

export const DEFAULT_OFFER_CHECKLIST = [
  { id: "nbi",        label: "NBI Clearance" },
  { id: "tor",        label: "Transcript of Records (TOR)" },
  { id: "bir2316",    label: "BIR Form 2316 (from previous employer)" },
  { id: "medcert",    label: "Medical Certificate" },
  { id: "sss",        label: "SSS ID / E4 Form" },
  { id: "philhealth", label: "PhilHealth ID / MDR" },
  { id: "pagibig",    label: "Pag-IBIG MID Number" },
] as const;

export const JOB_TAGS = [
  { id: "urgent",    label: "Urgent",    color: "#ef4444" },
  { id: "remote",    label: "Remote",    color: "#10b981" },
  { id: "hybrid",    label: "Hybrid",    color: "#3b82f6" },
  { id: "in-person", label: "In-Person", color: "#8b5cf6" },
] as const;

export type TagId = typeof JOB_TAGS[number]["id"];

export const JOB_PRIORITIES = [
  { id: "high",   label: "High",   color: "#ef4444" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "low",    label: "Low",    color: "#94a3b8" },
] as const;

export type PriorityLevel = typeof JOB_PRIORITIES[number]["id"];

export const REJECTION_STAGES = [
  { id: "resume",      label: "After resume screening" },
  { id: "phone",       label: "After phone screen" },
  { id: "technical",   label: "After technical interview" },
  { id: "final",       label: "After final interview" },
  { id: "offer",       label: "At offer stage" },
  { id: "no-response", label: "No response / ghosted" },
  { id: "other",       label: "Other" },
] as const;

export type RejectionStage = typeof REJECTION_STAGES[number]["id"];
