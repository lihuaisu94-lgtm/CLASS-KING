import { formatDateTime, getPriorityLabel } from "@/lib/task-engine";
import { Task } from "@/types/task";

interface ConflictWindow {
  start: Date;
  end: Date;
}

export interface TaskConflict {
  existingTask: Task;
  nextDurationMinutes: number;
  existingDurationMinutes: number;
}

function getTaskWindow(task: Task): ConflictWindow | null {
  if (!task.startTime) {
    return null;
  }

  const start = new Date(task.startTime);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const endSource = task.endTime
    ? new Date(task.endTime)
    : task.estimatedMinutes
      ? new Date(start.getTime() + task.estimatedMinutes * 60_000)
      : null;

  if (!endSource || Number.isNaN(endSource.getTime())) {
    return null;
  }

  return { start, end: endSource };
}

export function getTaskDurationMinutes(task: Task) {
  const window = getTaskWindow(task);

  if (window) {
    return Math.max(0, Math.round((window.end.getTime() - window.start.getTime()) / 60_000));
  }

  return task.estimatedMinutes ?? 0;
}

export function findTaskConflicts(nextTask: Task, existingTasks: Task[]) {
  const nextWindow = getTaskWindow(nextTask);

  if (!nextWindow) {
    return [] as TaskConflict[];
  }

  return existingTasks
    .map((existingTask) => {
      const existingWindow = getTaskWindow(existingTask);

      if (!existingWindow) {
        return null;
      }

      const overlaps =
        nextWindow.start < existingWindow.end && nextWindow.end > existingWindow.start;

      if (!overlaps) {
        return null;
      }

      return {
        existingTask,
        nextDurationMinutes: getTaskDurationMinutes(nextTask),
        existingDurationMinutes: getTaskDurationMinutes(existingTask),
      } satisfies TaskConflict;
    })
    .filter((conflict): conflict is TaskConflict => Boolean(conflict));
}

export function buildConflictMessage(nextTask: Task, conflicts: TaskConflict[]) {
  const comparisons = conflicts
    .map(({ existingTask, nextDurationMinutes, existingDurationMinutes }, index) => {
      const nextStakeholders = nextTask.stakeholders.length;
      const existingStakeholders = existingTask.stakeholders.length;

      return [
        `${index + 1}. 新任务「${nextTask.title}」与「${existingTask.title}」时间重叠`,
        `优先级：${getPriorityLabel(nextTask.priority)} vs ${getPriorityLabel(existingTask.priority)}`,
        `时长：${nextDurationMinutes} 分钟 vs ${existingDurationMinutes} 分钟`,
        `关联对象：${nextStakeholders} 人 vs ${existingStakeholders} 人`,
        `期限：${formatDateTime(nextTask.deadline || nextTask.endTime)} vs ${formatDateTime(existingTask.deadline || existingTask.endTime)}`,
      ].join("\n");
    })
    .join("\n\n");

  return `检测到 ${conflicts.length} 项时间冲突，请关注以下对比：\n\n${comparisons}`;
}
