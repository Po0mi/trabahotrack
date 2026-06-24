"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { STORAGE_KEYS, JOB_TAGS } from "@/utils/constants";
import { jobsApi } from "@/lib/jobs";
import { toast } from "@/lib/toast";
import type { Job, JobStatus } from "@/types/job";
import Column from "./Column";
import AddJobModal from "./AddJobModal";
import EditJobModal from "./EditJobModal";
import ResetBoardModal from "./ResetBoardModal";
import { JOB_STATUSES } from "@/utils/constants";
import "@/styles/components/kanbanBoard.scss";

const GHOST_WARN_MS = 7 * 24 * 60 * 60 * 1000;

interface KanbanBoardProps {
  jobs: Job[];
  onJobAdded: (job: Job) => void;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onDeleteJob: (jobId: string) => void;
  onJobUpdated: (job: Job) => void;
  onClearBoard: () => void;
  prefill?: { company?: string; role?: string; url?: string };
}

export default function KanbanBoard({
  jobs,
  onJobAdded,
  onStatusChange,
  onDeleteJob,
  onJobUpdated,
  onClearBoard,
  prefill,
}: KanbanBoardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [draggingJobId, setDraggingJobId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [overStatus, setOverStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [jobTags, setJobTags] = useState<Record<string, string[]>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOB_TAGS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [jobPriorities, setJobPriorities] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOB_PRIORITIES);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REJECTION_REASONS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [successPulseStatus, setSuccessPulseStatus] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const handleDropRef = useRef<(jobId: string, status: string) => void>(() => {});

  const params = useParams();
  const boardId = params.id as string;
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || "";
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (prefill?.company || prefill?.role || prefill?.url) {
      setIsAddModalOpen(true);
      router.replace(pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTagsChange = useCallback(
    (jobId: string, tags: string[]) => {
      setJobTags((prev) => {
        const updated = { ...prev, [jobId]: tags };
        localStorage.setItem(STORAGE_KEYS.JOB_TAGS, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const handlePriorityChange = useCallback(
    (jobId: string, priority: string) => {
      setJobPriorities((prev) => {
        const updated = { ...prev, [jobId]: priority };
        localStorage.setItem(STORAGE_KEYS.JOB_PRIORITIES, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const handleRejectionReasonChange = useCallback(
    (jobId: string, reason: string) => {
      setRejectionReasons((prev) => {
        const updated = { ...prev, [jobId]: reason };
        localStorage.setItem(STORAGE_KEYS.REJECTION_REASONS, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const handleJobTouchStart = useCallback((jobId: string, startX: number, startY: number) => {
    setDraggingJobId(jobId);
    setDragPos({ x: startX, y: startY });

    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault();
      const { clientX, clientY } = touch;
      setDragPos({ x: clientX, y: clientY });

      // Auto-scroll when near viewport edges (important on mobile where columns stack vertically)
      const EDGE = 80;
      const MAX_SPEED = 14;
      const vh = window.innerHeight;
      if (clientY < EDGE) {
        window.scrollBy(0, -((EDGE - clientY) / EDGE) * MAX_SPEED);
      } else if (clientY > vh - EDGE) {
        window.scrollBy(0, ((clientY - (vh - EDGE)) / EDGE) * MAX_SPEED);
      }

      const col = document.elementFromPoint(clientX, clientY)?.closest("[data-col-status]");
      setOverStatus(col?.getAttribute("data-col-status") ?? null);
    };

    const onEnd = (e: TouchEvent) => {
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
      const touch = e.changedTouches[0];
      if (touch) {
        const col = document.elementFromPoint(touch.clientX, touch.clientY)?.closest("[data-col-status]");
        const status = col?.getAttribute("data-col-status");
        if (status) handleDropRef.current(jobId, status);
      }
      setDraggingJobId(null);
      setDragPos(null);
      setOverStatus(null);
    };

    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  }, []);

  const handleJobDragStart = useCallback((jobId: string, clientX: number, clientY: number) => {
    let started = false;

    const onMove = (e: MouseEvent) => {
      if (!started) {
        if (Math.hypot(e.clientX - clientX, e.clientY - clientY) < 5) return;
        started = true;
        setDraggingJobId(jobId);
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      }
      setDragPos({ x: e.clientX, y: e.clientY });
      const col = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-col-status]");
      setOverStatus(col?.getAttribute("data-col-status") ?? null);
    };

    const onUp = (e: MouseEvent) => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (started) {
        document.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
        const col = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-col-status]");
        const status = col?.getAttribute("data-col-status");
        if (status) handleDropRef.current(jobId, status);
      }
      setDraggingJobId(null);
      setDragPos(null);
      setOverStatus(null);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  // Stats
  const total = jobs.length;
  const interviewCount = jobs.filter((j) => j.status === "Interview").length;
  const offerCount = jobs.filter((j) => j.status === "Offer").length;
  const rejectionCount = jobs.filter((j) => j.status === "Rejected").length;
  const interviewRate =
    total > 0 ? Math.round(((interviewCount + offerCount) / total) * 100) : 0;
  const offerRate =
    total > 0 ? Math.round((offerCount / total) * 100) : 0;

  // Ghost warning: Applied jobs older than 7 days
  const ghostingCount = jobs.filter(
    (j) =>
      j.status === "Applied" &&
      Date.now() - new Date(j.created_at).getTime() > GHOST_WARN_MS,
  ).length;

  // Rejection insight: find most common rejection stage
  const rejectionStageCounts: Record<string, number> = {};
  for (const job of jobs) {
    if (job.status === "Rejected" && rejectionReasons[job.id]) {
      const stage = rejectionReasons[job.id];
      rejectionStageCounts[stage] = (rejectionStageCounts[stage] ?? 0) + 1;
    }
  }
  const topRejectionStage = Object.entries(rejectionStageCounts).sort((a, b) => b[1] - a[1])[0];

  // Motivational tagline
  const motivationalTagline = (() => {
    if (total === 0) return "Start tracking. Stay consistent.";
    if (offerCount > 0) return "You're close. Don't stop.";
    if (interviewCount > 0) return "Follow up today.";
    if (ghostingCount > 2) return "Don't lose momentum.";
    if (rejectionCount > 5) return "Every rejection is data.";
    return "Stay consistent.";
  })();

  // Filtered jobs (search + tag filter)
  const q = searchQuery.trim().toLowerCase();
  const filteredJobs = jobs
    .filter(
      (j) =>
        !q ||
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        (j.notes ?? "").toLowerCase().includes(q),
    )
    .filter(
      (j) =>
        !activeTagFilter ||
        (jobTags[j.id] ?? []).includes(activeTagFilter),
    );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isEditable =
        tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "Escape") {
        if (editingJob) { setEditingJob(null); return; }
        if (isAddModalOpen) { setIsAddModalOpen(false); return; }
        if (activeTagFilter) { setActiveTagFilter(null); return; }
        return;
      }
      if (isEditable) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    },
    [isAddModalOpen, editingJob, activeTagFilter],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const MOVE_TOASTS: Record<string, string> = {
    Interview: "Interview locked in. Follow up!",
    Offer: "Offer incoming. You've earned it.",
    Rejected: "Noted. Keep going.",
    Ghosted: "Filed. Don't let it slow you.",
  };

  const handleDrop = async (jobId: string, newStatus: string) => {
    const jobToUpdate = jobs.find((j) => j.id === jobId);
    if (!jobToUpdate || jobToUpdate.status === newStatus) return;
    onStatusChange(jobId, newStatus as JobStatus);

    if (newStatus === "Interview" || newStatus === "Offer") {
      setSuccessPulseStatus(newStatus);
      setTimeout(() => setSuccessPulseStatus(null), 1500);
    }

    try {
      await jobsApi.updateJobStatus(
        boardId,
        accessToken,
        jobId,
        newStatus as JobStatus,
      );
      toast(MOVE_TOASTS[newStatus] ?? `Moved to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast("Failed to move job. Please try again.", "error");
      onStatusChange(jobId, jobToUpdate.status);
    }
  };
  handleDropRef.current = handleDrop;

  const handleJobUpdatedLocal = (updatedJob: Job) => {
    onJobUpdated(updatedJob);
    setEditingJob(null);
  };

  // Export as CSV
  const handleExport = () => {
    const headers = ["company", "role", "status", "job_url", "salary", "notes", "created_at"];
    const escape = (val: string | null | undefined) => {
      const s = val ?? "";
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = jobs.map((j) =>
      [j.company, j.role, j.status, j.job_url, j.salary, j.notes, j.created_at]
        .map((v) => escape(v as string | null | undefined))
        .join(","),
    );
    const payload = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([payload], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trabahotrack-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import from JSON backup
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    e.target.value = "";

    let parsed: { jobs: Job[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      toast("Invalid file — could not parse JSON.", "error");
      return;
    }

    const importedJobs = parsed?.jobs;
    if (!Array.isArray(importedJobs) || importedJobs.length === 0) {
      toast("No jobs found in this backup file.", "error");
      return;
    }

    if (
      !confirm(
        `Import ${importedJobs.length} job(s) from backup? They will be added to your current board.`,
      )
    )
      return;

    let added = 0;
    for (const job of importedJobs) {
      try {
        const newId = await jobsApi.createJob(boardId, accessToken, {
          company: job.company,
          role: job.role,
          status: job.status,
          job_url: job.job_url || null,
          notes: job.notes || null,
        });
        onJobAdded({
          ...job,
          id: newId,
          board_id: boardId,
          created_at: new Date().toISOString(),
        });
        added++;
      } catch {
        // skip failed jobs silently
      }
    }

    toast(`Imported ${added} of ${importedJobs.length} job(s).`);
  };

  // Count how many jobs have each tag (for showing active dots in filter bar)
  const tagCounts = JOB_TAGS.reduce<Record<string, number>>((acc, tag) => {
    acc[tag.id] = jobs.filter((j) => (jobTags[j.id] ?? []).includes(tag.id)).length;
    return acc;
  }, {});

  return (
    <>
      {/* Header row */}
      <div className="kanban-header">
        <div className="kanban-title-wrap">
          <h1 className="kanban-title">My Applications</h1>
          <span className="kanban-tagline">{motivationalTagline}</span>
        </div>
        <div className="kanban-actions">
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <button
            className="btn-toolbar btn-toolbar--danger"
            onClick={() => { if (jobs.length > 0) setIsResetModalOpen(true); }}
            title="Delete all jobs and reset the board"
          >
            <i className="fas fa-trash" />
            Reset Board
          </button>
          <button
            className="btn-toolbar"
            onClick={() => importRef.current?.click()}
            title="Import backup (.json)"
          >
            <i className="fas fa-upload" />
            Import
          </button>
          <button className="btn-toolbar" onClick={handleExport} title="Export all jobs as JSON">
            <i className="fas fa-download" />
            Export
          </button>
          <button className="btn-add-job" onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus" />
            Add Job
            <kbd className="kbd-hint">N</kbd>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-value">{total}</span>
          <span className="stat-label">
            <i className="fas fa-briefcase stat-label-icon" />
            Total
          </span>
        </div>
        <div className="stat-divider" />
        <div className="stat-card">
          <span className="stat-value stat-value--interview">{interviewRate}%</span>
          <span className="stat-label">
            <i className="fas fa-comments stat-label-icon" />
            Interview Rate
          </span>
        </div>
        <div className="stat-divider" />
        <div className="stat-card">
          <span className="stat-value stat-value--offer">{offerRate}%</span>
          <span className="stat-label">
            <i className="fas fa-trophy stat-label-icon" />
            Offer Rate
          </span>
        </div>
        <div className="stat-divider" />
        <div className="stat-card">
          <span className="stat-value stat-value--rejected">{rejectionCount}</span>
          <span className="stat-label">
            <i className="fas fa-circle-xmark stat-label-icon" />
            Rejections
            {topRejectionStage && (
              <span className="stat-insight" title={`Most common: ${topRejectionStage[0]}`}>
                · mostly {topRejectionStage[0].replace("resume", "resume screen").replace("technical", "tech interview").replace("final", "final round").replace("no-response", "no response").replace("offer", "offer stage").replace("phone", "phone screen")}
              </span>
            )}
          </span>
        </div>
        <div className="stat-divider" />
        <div className="stat-card">
          <span className={`stat-value${ghostingCount > 0 ? " stat-value--ghost" : ""}`}>
            {ghostingCount}
          </span>
          <span className="stat-label">
            <i className="fas fa-ghost stat-label-icon" />
            {ghostingCount > 0 ? "Ghosting?" : "Ghosting Risk"}
          </span>
        </div>
      </div>

      {/* Control bar: search + tag filters (sticky) */}
      <div className="control-bar">
        <div className="search-bar">
          <i className="fas fa-magnifying-glass search-icon" />
          <input
            ref={searchRef}
            className="search-input"
            type="text"
            placeholder="Filter by company, role, or notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")} aria-label="Clear search">
              <i className="fas fa-xmark" />
            </button>
          )}
          <kbd className="search-kbd">/ to focus</kbd>
        </div>

        <div className="tag-filter-bar">
          {JOB_TAGS.map((tag) => (
            <button
              key={tag.id}
              className={`tag-filter-btn${activeTagFilter === tag.id ? " tag-filter-btn--active" : ""}${tagCounts[tag.id] === 0 ? " tag-filter-btn--empty" : ""}`}
              style={{ "--tag-color": tag.color } as React.CSSProperties}
              onClick={() =>
                setActiveTagFilter((prev) => (prev === tag.id ? null : tag.id))
              }
              title={`Filter by ${tag.label}`}
            >
              <span className="tag-dot" />
              {tag.label}
              {tagCounts[tag.id] > 0 && (
                <span className="tag-count">{tagCounts[tag.id]}</span>
              )}
            </button>
          ))}
          {(activeTagFilter || searchQuery) && (
            <button
              className="tag-filter-clear"
              onClick={() => { setActiveTagFilter(null); setSearchQuery(""); }}
            >
              <i className="fas fa-xmark" />
              {activeTagFilter && searchQuery ? "Clear all" : "Clear filter"}
            </button>
          )}
        </div>
      </div>

      {/* Board columns */}
      <div className="kanban-board">
        {JOB_STATUSES.map((status) => {
          const columnJobs = filteredJobs.filter((job) => job.status === status);
          return (
            <Column
              key={status}
              title={status}
              jobs={columnJobs}
              jobTags={jobTags}
              jobPriorities={jobPriorities}
              rejectionReasons={rejectionReasons}
              isActive={overStatus === status}
              isPulsing={successPulseStatus === status}
              onDeleteJob={onDeleteJob}
              onEditJob={setEditingJob}
              draggingJobId={draggingJobId}
              onJobDragStart={handleJobDragStart}
              onJobTouchDragStart={handleJobTouchStart}
            />
          );
        })}
      </div>

      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onJobAdded={onJobAdded}
        onTagsChange={handleTagsChange}
        onPriorityChange={handlePriorityChange}
        boardId={boardId}
        accessToken={accessToken}
        initialCompany={prefill?.company}
        initialRole={prefill?.role}
        initialUrl={prefill?.url}
      />

      {isResetModalOpen && (
        <ResetBoardModal
          jobCount={jobs.length}
          onConfirm={onClearBoard}
          onClose={() => setIsResetModalOpen(false)}
        />
      )}

      {editingJob && (
        <EditJobModal
          key={editingJob.id}
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onJobUpdated={handleJobUpdatedLocal}
          boardId={boardId}
          accessToken={accessToken}
          tags={jobTags[editingJob.id] ?? []}
          onTagsChange={(tags) => handleTagsChange(editingJob.id, tags)}
          priority={jobPriorities[editingJob.id] ?? ""}
          onPriorityChange={(priority) => handlePriorityChange(editingJob.id, priority)}
          rejectionReason={rejectionReasons[editingJob.id] ?? ""}
          onRejectionReasonChange={(reason) => handleRejectionReasonChange(editingJob.id, reason)}
        />
      )}

      {/* Drag ghost — follows cursor while dragging */}
      {draggingJobId && dragPos && (() => {
        const job = jobs.find((j) => j.id === draggingJobId);
        if (!job) return null;
        return (
          <div
            style={{
              position: "fixed",
              left: dragPos.x + 14,
              top: dragPos.y - 14,
              width: 240,
              background: "var(--surface)",
              border: "1px solid var(--border-hover)",
              borderLeft: "3px solid var(--accent)",
              borderRadius: "var(--radius-sm)",
              padding: "0.875rem",
              boxShadow: "0 24px 50px rgba(0,0,0,0.22), 0 6px 14px rgba(79,70,229,0.14)",
              transform: "rotate(2.5deg) scale(1.02)",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.3, marginBottom: "0.25rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {job.company}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              {job.role}
            </div>
          </div>
        );
      })()}

      {/* Floating Add Button (Quick Add) */}
      <button
        className="btn-fab"
        onClick={() => setIsAddModalOpen(true)}
        title="Quick Add Job (N)"
        aria-label="Add Job"
      >
        <i className="fas fa-plus" />
      </button>
    </>
  );
}
