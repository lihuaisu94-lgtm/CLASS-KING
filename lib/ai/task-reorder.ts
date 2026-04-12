import { Task } from "@/types/task";

export interface ReorderTasksRequestBody {
  tasks: Task[];
}

export interface ReorderedTaskItem {
  id: string;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  scheduleStatus?: "scheduled" | "backlog";
  reason?: string;
}

export interface ReorderedTasksResponse {
  overview: string;
  tasks: ReorderedTaskItem[];
}

function normalizeDateString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

export function buildTaskReorderSystemPrompt(now = new Date()) {
  const currentTime = new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "Asia/Shanghai",
  }).format(now);

  return `
你是大学班长的全局时间规划助手。你的目标是把现有全部任务重新排成更清晰、冲突更少、优先级更合理的日程。

当前时间（北京时间）：
${currentTime}

你必须严格遵守：
1. 绝对优先级顺序：党团事务 > 班务 > 非校内事务 > 自我个人事务 > 单线任务。
2. 若两个任务必须在同一天完成，优先保证优先级更高且期限更近的任务。
3. 若任务已经在待办池（scheduleStatus=backlog），可以视情况安排到合适时间；如果无法稳妥安排，就继续保留 backlog。
4. 尽量避免时间重叠；若无法完全避免，也要优先保证高优先级任务的时间完整。
5. 如果任务已有明确时间且优先级高，尽量少改动。
6. 时间输出统一为 ISO 8601 字符串；如果保留待办池则 startTime/endTime 置空。
7. 只返回 JSON 对象，不要附带解释文字。

输出格式严格为：
{
  "overview": string,
  "tasks": [
    {
      "id": string,
      "startTime": string,
      "endTime": string,
      "deadline": string,
      "scheduleStatus": "scheduled" | "backlog",
      "reason": string
    }
  ]
}
  `.trim();
}

export function extractJsonObject(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const matched = trimmed.match(/\{[\s\S]*\}/);
  return matched?.[0] ?? trimmed;
}

export function normalizeReorderedTasksResponse(payload: unknown, originalTasks: Task[]) {
  const source = typeof payload === "object" && payload ? (payload as Record<string, unknown>) : {};
  const items = Array.isArray(source.tasks) ? source.tasks : [];
  const originalMap = new Map(originalTasks.map((task) => [task.id, task]));

  const normalizedItems = items
    .map((item) => {
      const record =
        typeof item === "object" && item ? (item as Record<string, unknown>) : ({} as Record<string, unknown>);
      const id = typeof record.id === "string" ? record.id : "";

      if (!id || !originalMap.has(id)) {
        return null;
      }

      return {
        id,
        startTime: normalizeDateString(record.startTime),
        endTime: normalizeDateString(record.endTime),
        deadline: normalizeDateString(record.deadline),
        scheduleStatus:
          record.scheduleStatus === "scheduled" || record.scheduleStatus === "backlog"
            ? record.scheduleStatus
            : undefined,
        reason: typeof record.reason === "string" ? record.reason.trim() : "",
      } satisfies ReorderedTaskItem;
    })
    .filter(Boolean)
    .map((item) => item as ReorderedTaskItem);

  return {
    overview:
      typeof source.overview === "string" && source.overview.trim()
        ? source.overview.trim()
        : "AI 已按优先级、期限和时间冲突给出新的安排建议。",
    tasks: normalizedItems,
  } satisfies ReorderedTasksResponse;
}

export function mergeReorderedTasks(originalTasks: Task[], response: ReorderedTasksResponse) {
  const updateMap = new Map(response.tasks.map((item) => [item.id, item]));

  return originalTasks.map((task) => {
    const update = updateMap.get(task.id);

    if (!update) {
      return task;
    }

    const nextStatus = update.scheduleStatus ?? task.scheduleStatus;

    return {
      ...task,
      startTime: nextStatus === "backlog" ? undefined : update.startTime ?? task.startTime,
      endTime: nextStatus === "backlog" ? undefined : update.endTime ?? task.endTime,
      deadline: update.deadline ?? task.deadline,
      scheduleStatus: nextStatus,
      updatedAt: new Date().toISOString(),
    };
  });
}
