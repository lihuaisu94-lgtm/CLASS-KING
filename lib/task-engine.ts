import { Task, TaskDomain, TaskMode, TaskPriority, UrgencyLevel } from "@/types/task";
import { cleanTimezone, formatDateTime as formatTime, normalizeDateValue as normalizeDate } from "@/lib/time-utils";

const domainPriority: Record<TaskDomain, TaskPriority> = {
  party: 1,
  class: 2,
  external: 3,
  personal: 4,
  private: 4,
};

const categoryAliases: Record<string, { domain: TaskDomain; isSingleThread: boolean }> = {
  党团事务: { domain: "party", isSingleThread: false },
  班务: { domain: "class", isSingleThread: false },
  非校内事务: { domain: "external", isSingleThread: false },
  自我个人事务: { domain: "personal", isSingleThread: false },
  和他人的私下事务: { domain: "private", isSingleThread: false },
  单线任务: { domain: "personal", isSingleThread: true },
};

export function getDomainLabel(domain: TaskDomain) {
  return {
    party: "党团事务",
    class: "班务",
    external: "非校内事务",
    personal: "自我个人事务",
    private: "和他人的私下事务",
  }[domain];
}

export function getModeLabel(mode: Task["mode"]) {
  return mode === "online" ? "线上" : "线下";
}

export function getTaskPriority(domain: TaskDomain, isSingleThread: boolean): TaskPriority {
  if (isSingleThread) return 5;
  return domainPriority[domain];
}

export function getPriorityLabel(priority: TaskPriority) {
  return `P${priority}`;
}

export function getScheduleStatusLabel(status: Task["scheduleStatus"]) {
  return status === "backlog" ? "待办池" : "已排期";
}

export function normalizeTaskMode(value?: string): TaskMode {
  if (value === "线下" || value === "offline") return "offline";
  return "online";
}

export function normalizeTaskCategory(category?: string) {
  const normalized = category?.trim() ?? "";
  return categoryAliases[normalized] ?? { domain: "class" as TaskDomain, isSingleThread: false };
}

export function getUrgency(task: Task, now = new Date()): UrgencyLevel {
  if (!task.deadline) return "relaxed";

  const deadlineDate = new Date(cleanTimezone(task.deadline));
  const diffHours = (deadlineDate.getTime() - now.getTime()) / 36e5;

  if (diffHours <= 24) return "urgent";
  if (diffHours <= 72) return "normal";
  return "relaxed";
}

export function getUrgencyLabel(level: UrgencyLevel) {
  return {
    urgent: "紧急",
    normal: "普通",
    relaxed: "宽裕",
  }[level];
}

export function getPriorityScore(task: Task, now = new Date()) {
  const priorityWeight = (6 - task.priority) * 24;
  const urgencyWeight = {
    urgent: 30,
    normal: 18,
    relaxed: 8,
  }[getUrgency(task, now)];

  const estimatedMinutes = task.estimatedMinutes ?? 60;
  const timeWeight = Math.min(12, Math.round(estimatedMinutes / 30));
  const stakeholderWeight = Math.min(
    10,
    task.stakeholders.reduce((sum, item) => sum + (item.importance ?? 1), 0),
  );
  const singleThreadPenalty = task.isSingleThread ? -5 : 0;

  return priorityWeight + urgencyWeight + stakeholderWeight + timeWeight + singleThreadPenalty;
}

export function sortTasksByPriority(tasks: Task[], now = new Date()) {
  return [...tasks].sort((a, b) => getPriorityScore(b, now) - getPriorityScore(a, now));
}

export function sortTasksBySchedule(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.scheduleStatus === "backlog" && b.scheduleStatus !== "backlog") return 1;
    if (b.scheduleStatus === "backlog" && a.scheduleStatus !== "backlog") return -1;

    const aTime = a.startTime ? new Date(cleanTimezone(a.startTime)).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.startTime ? new Date(cleanTimezone(b.startTime)).getTime() : Number.MAX_SAFE_INTEGER;

    if (aTime !== bTime) return aTime - bTime;
    return a.priority - b.priority;
  });
}

// 导出统一的时间处理函数
export const formatDateTime = formatTime;
export const normalizeDateValue = normalizeDate;

export function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
