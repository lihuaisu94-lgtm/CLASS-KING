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
        "rounded-xl border bg-cardBg p-5 shadow-soft transition hover:shadow-float",
        isHighlighted ? "border-primary ring-2 ring-primaryLight" : "border-primaryLight",
        isDimmed && "opacity-45",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-primaryLight px-3 py-1 text-primary">{getModeLabel(task.mode)}</span>
            <span className="rounded-full bg-peach/40 px-3 py-1 text-ink">{getDomainLabel(task.domain)}</span>
            <span className="rounded-full bg-lavender/30 px-3 py-1 text-ink">
              {getScheduleStatusLabel(task.scheduleStatus)}
            </span>
            <span className="rounded-full bg-accent/40 px-3 py-1 text-ink">
              {getUrgencyLabel(urgency)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-ink">{task.title}</h3>
          <p className="text-sm leading-relaxed-plus text-textSecondary">{task.summary}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-lavender/20 px-3 py-1 text-xs font-medium text-ink">
              <Users className="h-3.5 w-3.5" />
              关联人：
              {task.stakeholders.length > 0
                ? task.stakeholders.map((item) => item.name).join("、")
                : "未填写"}
            </span>
            <span className="group relative inline-flex items-center">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-primaryLight px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI 摘要
              </button>
              <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-72 rounded-xl border border-primaryLight bg-cardBg px-4 py-3 text-xs leading-relaxed-plus text-ink shadow-float group-hover:block group-focus-within:block">
                {task.summary}
              </span>
            </span>
          </div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-primaryLight to-primary/20 px-4 py-3 text-right">
          <p className="text-xs font-semibold text-textSecondary">优先级</p>
          <p className="text-2xl font-bold text-primary">{getPriorityLabel(task.priority)}</p>
          <p className="text-xs text-textSecondary">综合分 {priorityScore}</p>
        </div>
      </div>

      <dl className="mt-5 grid gap-3 text-sm text-textSecondary md:grid-cols-2">
        <div className="rounded-lg bg-primaryLight/30 p-3">
          <dt className="text-xs font-bold uppercase tracking-wider text-textTertiary">开始时间</dt>
          <dd className="mt-1 flex items-center gap-2 font-semibold text-ink">
            <CalendarClock className="h-4 w-4 text-primary" />
            {task.startTime ? formatDateTime(task.startTime) : "时间待定"}
          </dd>
        </div>
        <div className="rounded-lg bg-peach/20 p-3">
          <dt className="text-xs font-bold uppercase tracking-wider text-textTertiary">截止时间</dt>
          <dd className="mt-1 font-semibold text-ink">
            {task.deadline ? formatDateTime(task.deadline) : "时间待定"}
          </dd>
        </div>
        <div className="rounded-lg bg-lavender/20 p-3">
          <dt className="text-xs font-bold uppercase tracking-wider text-textTertiary">预计耗时</dt>
          <dd className="mt-1 font-semibold text-ink">
            {task.estimatedMinutes ? `${task.estimatedMinutes} 分钟` : "待 AI 估算"}
          </dd>
        </div>
        <div className="rounded-lg bg-accent/20 p-3">
          <dt className="text-xs font-bold uppercase tracking-wider text-textTertiary">关联对象</dt>
          <dd className="mt-1 font-semibold text-ink">
            {task.stakeholders.length > 0 ? task.stakeholders.map((item) => item.name).join("、") : "未指定"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-gradient-to-br from-primaryLight/30 to-peach/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-textTertiary">详细内容</p>
          <p className="mt-2 text-sm leading-relaxed-plus text-ink">{task.content}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-lavender/20 to-accent/20 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-textTertiary">子任务流程</p>
          <ul className="mt-2 space-y-2 text-sm text-ink">
            {task.subTasks.length > 0 ? (
              task.subTasks.map((item) => (
                <li key={item.id}>
                  <label
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition",
                      item.completed ? "bg-accent/40 text-ink" : "bg-white shadow-soft",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleSubTaskCompleted(task.id, item.id)}
                      className="h-4 w-4 rounded border-primaryLight text-primary focus:ring-primary"
                    />
                    <span className={clsx(item.completed && "line-through")}>{item.title}</span>
                  </label>
                </li>
              ))
            ) : (
              <li className="rounded-lg bg-white px-3 py-2 shadow-soft">尚未拆分流程</li>
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
            "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-soft transition",
            allSubTasksCompleted || task.subTasks.length === 0
              ? "bg-gradient-to-r from-primary to-primaryDark text-white hover:scale-105 hover:shadow-float"
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
