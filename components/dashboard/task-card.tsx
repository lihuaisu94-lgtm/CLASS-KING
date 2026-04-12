"use client";

import {
  formatDateTime,
  getDomainLabel,
  getModeLabel,
  getPriorityLabel,
  getScheduleStatusLabel,
  getPriorityScore,
  getUrgency,
  getUrgencyLabel,
} from "@/lib/task-engine";
import { CalendarClock, Sparkles, Users, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { useTaskStore } from "@/store/task-store";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  isHighlighted?: boolean;
  isDimmed?: boolean;
}

export function TaskCard({ task, isHighlighted = false, isDimmed = false }: TaskCardProps) {
  const urgency = getUrgency(task);
  const priorityScore = getPriorityScore(task);
  const toggleSubTaskCompleted = useTaskStore((state) => state.toggleSubTaskCompleted);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const allSubTasksCompleted = task.subTasks.length > 0 && task.subTasks.every((st) => st.completed);

  function handleCompleteTask() {
    if (allSubTasksCompleted || task.subTasks.length === 0) {
      if (confirm(`确认完成任务"${task.title}"并从看板中移除？`)) {
        deleteTask(task.id);
      }
    }
  }

  return (
    <article
      className={clsx(
        "rounded-sm border bg-cardBg p-5 shadow-soft transition",
        isHighlighted ? "border-primary ring-2 ring-primaryLight" : "border-border",
        isDimmed && "opacity-45",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-sm bg-primaryLight px-3 py-1 text-primary">{getModeLabel(task.mode)}</span>
            <span className="rounded-sm border border-border bg-cardBg px-3 py-1 text-ink">{getDomainLabel(task.domain)}</span>
            <span className="rounded-sm border border-border bg-cardBg px-3 py-1 text-textSecondary">
              {getScheduleStatusLabel(task.scheduleStatus)}
            </span>
            <span className="rounded-sm bg-primaryLight px-3 py-1 text-primary">
              {getUrgencyLabel(urgency)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-ink">{task.title}</h3>
          <p className="text-sm leading-relaxed-plus text-textSecondary">{task.summary}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-2 rounded-sm border border-border bg-cardBg px-3 py-1 text-xs font-medium text-ink">
              <Users className="h-3.5 w-3.5" />
              关联人：
              {task.stakeholders.length > 0
                ? task.stakeholders.map((item) => item.name).join("、")
                : "未填写"}
            </span>
            <span className="group relative inline-flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-sm bg-primaryLight px-3 py-1 text-xs font-semibold text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI 摘要
              </button>
              <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-72 rounded-sm border border-border bg-cardBg px-4 py-3 text-xs leading-relaxed-plus text-ink shadow-xl group-hover:block group-focus-within:block">
                {task.summary}
              </span>
            </span>
          </div>
        </div>
        <div className="rounded-sm bg-primaryLight px-3 py-2 text-right">
          <p className="text-xs font-semibold text-textSecondary">优先级</p>
          <p className="text-lg font-bold text-primary">{getPriorityLabel(task.priority)}</p>
          <p className="text-xs text-textSecondary">综合分 {priorityScore}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm text-textSecondary md:grid-cols-2">
        <div className="rounded-sm border border-border bg-cardBg p-3">
          <dt className="text-xs font-bold uppercase tracking-wider text-textTertiary">开始时间</dt>
          <dd className="mt-1 flex items-center gap-2 font-semibold text-ink">
            <CalendarClock className="h-4 w-4 text-primary" />
            {formatDateTime(task.startTime)}
          </dd>
        </div>
        <div className="rounded-sm border border-border bg-cardBg p-3">
          <dt className="text-xs font-bold uppercase tracking-wider text-textTertiary">截止时间</dt>
          <dd className="mt-1 font-semibold text-ink">{formatDateTime(task.deadline)}</dd>
        </div>
        <div className="rounded-sm border border-border bg-cardBg p-3">
          <dt className="text-xs font-bold uppercase tracking-wider text-textTertiary">预计耗时</dt>
          <dd className="mt-1 font-semibold text-ink">{task.estimatedMinutes ?? "待 AI 估算"} 分钟</dd>
        </div>
        <div className="rounded-sm border border-border bg-cardBg p-3">
          <dt className="text-xs font-bold uppercase tracking-wider text-textTertiary">关联对象</dt>
          <dd className="mt-1 font-semibold text-ink">
            {task.stakeholders.length > 0 ? task.stakeholders.map((item) => item.name).join("、") : "未填写"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-sm border border-border bg-cardBg p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-textTertiary">详细内容</p>
          <p className="mt-2 text-sm leading-relaxed-plus text-ink">{task.content}</p>
        </div>
        <div className="rounded-sm border border-border bg-cardBg p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-textTertiary">子任务流程</p>
          <ul className="mt-2 space-y-2 text-sm text-ink">
            {task.subTasks.length > 0 ? (
              task.subTasks.map((item) => (
                <li key={item.id}>
                  <label
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 rounded-sm border px-3 py-2 transition",
                      item.completed ? "border-green-300 bg-green-50 text-green-800" : "border-border bg-cardBg",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleSubTaskCompleted(task.id, item.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className={clsx(item.completed && "line-through")}>{item.title}</span>
                  </label>
                </li>
              ))
            ) : (
              <li className="rounded-sm border border-border bg-cardBg px-3 py-2">尚未拆分流程</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleCompleteTask}
          disabled={!allSubTasksCompleted && task.subTasks.length > 0}
          className={clsx(
            "inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-bold transition",
            allSubTasksCompleted || task.subTasks.length === 0
              ? "bg-primary text-white hover:bg-primaryDark"
              : "cursor-not-allowed bg-textTertiary text-white opacity-50",
          )}
        >
          <CheckCircle className="h-4 w-4" />
          {allSubTasksCompleted || task.subTasks.length === 0 ? "完成任务" : "完成所有子任务后可标记完成"}
        </button>
      </div>
    </article>
  );
}
