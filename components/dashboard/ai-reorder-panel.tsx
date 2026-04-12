"use client";

import { useState } from "react";
import { AlertTriangle, CalendarRange, Sparkles } from "lucide-react";
import {
  ReorderedTasksResponse,
  mergeReorderedTasks,
} from "@/lib/ai/task-reorder";
import { formatDateTime, sortTasksBySchedule } from "@/lib/task-engine";
import { useTaskStore } from "@/store/task-store";
import { Task } from "@/types/task";

function ReorderPreviewModal({
  tasks,
  previewTasks,
  response,
  onConfirm,
  onClose,
}: {
  tasks: Task[];
  previewTasks: Task[];
  response: ReorderedTasksResponse;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const beforeMap = new Map(tasks.map((task) => [task.id, task]));
  const changedTasks = previewTasks.filter((task) => {
    const before = beforeMap.get(task.id);

    return (
      before &&
      (before.startTime !== task.startTime ||
        before.endTime !== task.endTime ||
        before.scheduleStatus !== task.scheduleStatus)
    );
  });

  const orderedPreview = sortTasksBySchedule(previewTasks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl rounded-[2rem] bg-[#f8fafc] p-6 shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky px-3 py-1 text-sm font-semibold text-ocean">
            <Sparkles className="h-4 w-4" />
            重排预览
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-ink">AI 已理出一版更顺的时间秩序</h2>
            <p className="text-sm leading-6 text-slate-500">{response.overview}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_1.2fr]">
          <div className="rounded-3xl bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-slate-500">本次变动摘要</p>
            <div className="mt-4 space-y-3 text-sm">
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
                调整任务：{changedTasks.length} 项
              </p>
              {changedTasks.length > 0 ? (
                changedTasks.map((task) => {
                  const before = beforeMap.get(task.id);

                  return (
                    <div key={task.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="font-semibold text-ink">{task.title}</p>
                      <p className="mt-2 text-slate-600">
                        旧安排：{formatDateTime(before?.startTime)} - {formatDateTime(before?.endTime)}
                      </p>
                      <p className="text-slate-600">
                        新安排：{formatDateTime(task.startTime)} - {formatDateTime(task.endTime)}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-600">
                  AI 认为当前排布已比较合理，因此没有建议明显移动。
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900 p-5 text-white">
            <p className="text-sm font-semibold text-sky">确认后的任务顺序</p>
            <div className="mt-4 space-y-3">
              {orderedPreview.map((task) => (
                <div key={task.id} className="rounded-2xl bg-white/8 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {task.scheduleStatus === "backlog"
                          ? "进入待办池，等待后续再安排"
                          : `${formatDateTime(task.startTime)} - ${formatDateTime(task.endTime)}`}
                      </p>
                    </div>
                    <span className="rounded-full bg-ember px-3 py-1 text-xs font-semibold text-white">
                      P{task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-ocean hover:text-ocean"
          >
            再看看
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-2xl bg-ocean px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#0b3b65]"
          >
            确认应用这版重排
          </button>
        </div>
      </div>
    </div>
  );
}

export function AiReorderPanel() {
  const tasks = useTaskStore((state) => state.tasks);
  const applyTaskReorder = useTaskStore((state) => state.applyTaskReorder);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewTasks, setPreviewTasks] = useState<Task[] | null>(null);
  const [previewResponse, setPreviewResponse] = useState<ReorderedTasksResponse | null>(null);

  async function handleReorder() {
    if (tasks.length === 0 || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reorder-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tasks }),
      });

      const result = (await response.json()) as ReorderedTasksResponse & {
        error?: string;
        detail?: string;
      };

      if (!response.ok) {
        throw new Error(
          [result.error, result.detail].filter(Boolean).join(" ") || "AI 重排失败，请稍后重试。",
        );
      }

      const merged = mergeReorderedTasks(tasks, result);
      setPreviewTasks(merged);
      setPreviewResponse(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "AI 重排失败，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <section className="glass-panel rounded-[2rem] border border-white/70 p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="inline-flex items-center gap-2 rounded-full bg-sky px-3 py-1 text-xs font-semibold text-ocean">
              <CalendarRange className="h-4 w-4" />
              Phase 4
            </p>
            <div>
              <h2 className="text-lg font-semibold text-ink">AI 智能理清秩序</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                把当前所有任务、冲突安排和待办池一起交给 AI，生成一版更稳妥的全局时间表。
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReorder}
            disabled={tasks.length === 0 || isLoading}
            className="rounded-2xl bg-ocean px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b3b65] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "AI 重排中..." : "AI 智能理清秩序"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/15 px-4 py-4 text-sm text-rose-700">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">重排失败</p>
                <p className="mt-1 leading-6">{error}</p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {previewTasks && previewResponse ? (
        <ReorderPreviewModal
          tasks={tasks}
          previewTasks={previewTasks}
          response={previewResponse}
          onConfirm={() => {
            applyTaskReorder(previewTasks);
            setPreviewTasks(null);
            setPreviewResponse(null);
          }}
          onClose={() => {
            setPreviewTasks(null);
            setPreviewResponse(null);
          }}
        />
      ) : null}
    </>
  );
}
