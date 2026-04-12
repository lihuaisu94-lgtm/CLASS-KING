"use client";

import { Clock3, ShieldAlert, Users } from "lucide-react";
import { getTaskDurationMinutes } from "@/lib/conflict-engine";
import { formatDateTime, getPriorityLabel } from "@/lib/task-engine";
import { useTaskStore } from "@/store/task-store";
import { Task } from "@/types/task";

function CompareCard({
  title,
  task,
  highlighted,
}: {
  title: string;
  task: Task;
  highlighted: boolean;
}) {
  return (
    <div
      className={[
        "rounded-3xl border p-5 transition",
        highlighted
          ? "border-emerald-400 bg-emerald-50 shadow-[0_16px_35px_rgba(16,185,129,0.18)]"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">{task.title}</h3>
        </div>
        <span
          className={[
            "rounded-full px-3 py-1 text-sm font-semibold",
            highlighted ? "bg-emerald-600 text-white" : "bg-slate-900 text-white",
          ].join(" ")}
        >
          {getPriorityLabel(task.priority)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">时间窗口</p>
          <p className="mt-1 font-medium text-ink">
            {formatDateTime(task.startTime)} - {formatDateTime(task.endTime)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">截止时间</p>
          <p className="mt-1 font-medium text-ink">{formatDateTime(task.deadline)}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock3 className="h-4 w-4" />
              <span>时长</span>
            </div>
            <p className="mt-1 font-medium text-ink">{getTaskDurationMinutes(task)} 分钟</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-4 w-4" />
              <span>关联对象</span>
            </div>
            <p className="mt-1 font-medium text-ink">
              {task.stakeholders.length > 0
                ? task.stakeholders.map((item) => item.name).join("、")
                : "未识别"}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">摘要</p>
          <p className="mt-1 leading-6 text-slate-700">{task.summary}</p>
        </div>
      </div>
    </div>
  );
}

export function ConflictResolutionModal() {
  const pendingConflict = useTaskStore((state) => state.pendingConflict);
  const keepBothTasks = useTaskStore((state) => state.keepBothTasks);
  const replaceOldWithNewTask = useTaskStore((state) => state.replaceOldWithNewTask);
  const deferNewTaskToBacklog = useTaskStore((state) => state.deferNewTaskToBacklog);

  if (!pendingConflict) {
    return null;
  }

  const existingTask = pendingConflict.conflicts[0]?.existingTask;
  if (!existingTask) {
    return null;
  }

  const newTask = pendingConflict.nextTask;
  const existingWins = existingTask.priority < newTask.priority;
  const newWins = newTask.priority < existingTask.priority;
  const extraConflicts = pendingConflict.conflicts.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-6xl rounded-[2rem] bg-[#f8fafc] p-6 shadow-2xl">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            <ShieldAlert className="h-4 w-4" />
            冲突对比对话框
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-ink">发现时间冲突，先做决策再入板</h2>
            <p className="text-sm leading-6 text-slate-500">
              系统检测到新任务与已有任务发生重叠。下面会按你定义的优先级逻辑高亮更应该优先处理的一侧。
              {extraConflicts > 0 ? ` 另外还有 ${extraConflicts} 个冲突任务会一并受本次决策影响。` : ""}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <CompareCard title="已有任务" task={existingTask} highlighted={existingWins} />
          <CompareCard title="新解析任务" task={newTask} highlighted={newWins} />
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          <button
            type="button"
            onClick={keepBothTasks}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-4 text-sm font-semibold text-slate-700 transition hover:border-ocean hover:text-ocean"
          >
            保留两者
          </button>
          <button
            type="button"
            onClick={replaceOldWithNewTask}
            className="rounded-2xl bg-ember px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#f35a1f]"
          >
            以新换旧
          </button>
          <button
            type="button"
            onClick={deferNewTaskToBacklog}
            className="rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            暂缓新任务
          </button>
        </div>
      </div>
    </div>
  );
}
