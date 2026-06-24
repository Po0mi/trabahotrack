import { supabase } from "./supabase";
import type { Job, JobStatus } from "@/types/job";

export const jobsApi = {
  /**
   * Fetch all jobs for a specific board
   */
  async getJobs(boardId: string, accessToken: string): Promise<Job[]> {
    const { data, error } = await supabase.rpc("get_jobs", {
      p_board_id: boardId,
      p_access_token: accessToken,
    });
    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Create a new job with frontend validation
   */
  async createJob(
    boardId: string,
    accessToken: string,
    jobData: Omit<Job, "id" | "created_at" | "board_id">,
  ): Promise<string> {
    if (!jobData.company?.trim() || !jobData.role?.trim()) {
      throw new Error("Company and Role are required.");
    }

    const { data, error } = await supabase.rpc("create_job", {
      p_board_id: boardId,
      p_access_token: accessToken,
      p_company: jobData.company.trim(),
      p_role: jobData.role.trim(),
      p_status: jobData.status || "Applied",
      p_job_url: jobData.job_url?.trim() || null,
      p_notes: jobData.notes?.trim() || null,
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
};
