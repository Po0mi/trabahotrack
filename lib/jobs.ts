import { supabase } from "./supabase";
import type { Job, JobStatus } from "@/types/job";

// Supabase PostgREST enforces a hard max_rows cap (default 1 000) that
// .limit() cannot exceed. Fetch in pages to guarantee all rows are returned.
const PAGE_SIZE = 1_000;

// Strip null bytes (\x00) which PostgreSQL text columns reject.
function clean(s: string): string {
  return s.replace(/\0/g, "");
}

function validateRequired(company: string | undefined, role: string | undefined) {
  if (!company?.trim() || !role?.trim()) {
    throw new Error("Company and Role are required.");
  }
}

export const jobsApi = {
  /**
   * Fetch all jobs for a specific board
   */
  async getJobs(boardId: string, accessToken: string): Promise<Job[]> {
    const all: Job[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase
        .rpc("get_jobs", { p_board_id: boardId, p_access_token: accessToken })
        .range(from, from + PAGE_SIZE - 1);
      if (error) throw new Error(error.message);
      const page: Job[] = data ?? [];
      all.push(...page);
      if (page.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }
    return all;
  },

  /**
   * Create a new job with frontend validation
   */
  async createJob(
    boardId: string,
    accessToken: string,
    jobData: Omit<Job, "id" | "created_at" | "board_id">,
  ): Promise<string> {
    validateRequired(jobData.company, jobData.role);

    const { data, error } = await supabase.rpc("create_job", {
      p_board_id: boardId,
      p_access_token: accessToken,
      p_company: clean(jobData.company.trim()),
      p_role: clean(jobData.role.trim()),
      p_status: jobData.status || "Applied",
      p_job_url: jobData.job_url ? clean(jobData.job_url.trim()) || null : null,
      p_salary: jobData.salary ? clean(jobData.salary.trim()) || null : null,
      p_notes: jobData.notes ? clean(jobData.notes.trim()) || null : null,
    });

    if (error) throw new Error(error.message);
    return data;
  },

  /**
   * Update job status (Used for Kanban drag-and-drop)
   */
  async updateJobStatus(
    boardId: string,
    accessToken: string,
    jobId: string,
    status: JobStatus,
  ): Promise<void> {
    const { error } = await supabase.rpc("update_job_status", {
      p_board_id: boardId,
      p_access_token: accessToken,
      p_job_id: jobId,
      p_status: status,
    });
    if (error) throw new Error(error.message);
  },

  /**
   * Update all fields of a job. Requires an `update_job` RPC in Supabase.
   */
  async updateJob(
    boardId: string,
    accessToken: string,
    jobId: string,
    jobData: Omit<Job, "id" | "created_at" | "board_id">,
  ): Promise<void> {
    validateRequired(jobData.company, jobData.role);

    const { error } = await supabase.rpc("update_job", {
      p_board_id: boardId,
      p_access_token: accessToken,
      p_job_id: jobId,
      p_company: clean(jobData.company.trim()),
      p_role: clean(jobData.role.trim()),
      p_status: jobData.status,
      p_job_url: jobData.job_url ? clean(jobData.job_url.trim()) || null : null,
      p_salary: jobData.salary ? clean(jobData.salary.trim()) || null : null,
      p_notes: jobData.notes ? clean(jobData.notes.trim()) || null : null,
    });
    if (error) throw new Error(error.message);
  },

  /**
   * Delete a job
   */
  async deleteJob(
    boardId: string,
    accessToken: string,
    jobId: string,
  ): Promise<void> {
    const { error } = await supabase.rpc("delete_job", {
      p_board_id: boardId,
      p_access_token: accessToken,
      p_job_id: jobId,
    });
    if (error) throw new Error(error.message);
  },

  /**
   * Delete all jobs for a board in batches to avoid overwhelming the connection.
   */
  async clearBoard(
    boardId: string,
    accessToken: string,
    jobIds: string[],
  ): Promise<void> {
    const BATCH = 50;
    for (let i = 0; i < jobIds.length; i += BATCH) {
      await Promise.all(
        jobIds.slice(i, i + BATCH).map((id) =>
          supabase.rpc("delete_job", {
            p_board_id: boardId,
            p_access_token: accessToken,
            p_job_id: id,
          }),
        ),
      );
    }
  },
};
