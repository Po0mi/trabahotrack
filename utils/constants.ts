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
};

export const JOB_TAGS = [
  { id: "urgent",    label: "Urgent",    color: "#ef4444" },
  { id: "remote",    label: "Remote",    color: "#10b981" },
  { id: "hybrid",    label: "Hybrid",    color: "#3b82f6" },
  { id: "in-person", label: "In-Person", color: "#8b5cf6" },
] as const;

export type TagId = typeof JOB_TAGS[number]["id"];
