"use client";

import { create } from "zustand";
import type { TaskConflict } from "@/lib/conflict-engine";
import { findTaskConflicts } from "@/lib/conflict-engine";
import { seedTasks } from "@/lib/mock-data";
import { createId, getTaskPriority, normalizeDateValue } from "@/lib/task-engine";
import { loadTasks, saveTasks } from "@/lib/storage";
import { Stakeholder, SubTask, Task, TaskPriority } from "@/types/task";

export interface TaskCreateInput {
  title: string;
  content: string;
  summary: string;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  estimatedMinutes?: number;
  mode: Task["mode"];
  domain: Task["domain"];
  isSingleThread: boolean;
  priority?: TaskPriority;
  stakeholders?: string[];
  stakeholdersText?: string;
  subTasks?: string[];
  subTasksText?: string;
}

interface TaskStore {
  tasks: Task[];
  hydrated: boolean;
  activeStakeholderFilter: string | null;
  pendingConflict: {
    nextTask: Task;
    conflicts: TaskConflict[];
  } | null;
  hydrate: () => void;
  addTask: (input: TaskCreateInput) => void;
  deleteTask: (taskId: string) => void;
  applyTaskReorder: (tasks: Task[]) => void;
  toggleSubTaskCompleted: (taskId: string, subTaskId: string) => void;
  setStakeholderFilter: (name: string | null) => void;
  keepBothTasks: () => void;
  replaceOldWithNewTask: () => void;
  deferNewTaskToBacklog: () => void;
  dismissPendingConflict: () => void;
}

function normalizeListInput(input?: string | string[]) {
  if (Array.isArray(input)) {
    return input.map((item) => item.trim()).filter(Boolean);
  }

  if (!input) {
    return [] as string[];
  }

  return input
    .split(/[,\n，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseStakeholders(input?: string | string[]): Stakeholder[] {
  return normalizeListInput(input).map((name) => ({
    id: createId("stakeholder"),
    name,
    importance: 2,
  }));
}

function parseSubTasks(input?: string | string[]): SubTask[] {
  return normalizeListInput(input).map((title) => ({
    id: createId("subtask"),
    title,
    completed: false,
  }));
}

function migrateTask(task: Task): Task {
  return {
    ...task,
    priority: task.priority ?? getTaskPriority(task.domain, task.isSingleThread),
    scheduleStatus: task.scheduleStatus ?? "scheduled",
  };
}

function saveTaskList(tasks: Task[]) {
  saveTasks(tasks);
  return { tasks, pendingConflict: null };
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: seedTasks,
  hydrated: false,
  activeStakeholderFilter: null,
  pendingConflict: null,
  hydrate: () => {
    if (get().hydrated) return;

    const stored = loadTasks();
    const tasks = (stored.length > 0 ? stored : seedTasks).map(migrateTask);
    saveTasks(tasks);
    set({ tasks, hydrated: true });
  },
  addTask: (input) => {
    const now = new Date().toISOString();
    const nextTask: Task = {
      id: createId("task"),
      title: input.title,
      content: input.content,
      summary: input.summary,
      priority: input.priority ?? getTaskPriority(input.domain, input.isSingleThread),
      startTime: normalizeDateValue(input.startTime),
      endTime: normalizeDateValue(input.endTime),
      deadline: normalizeDateValue(input.deadline || input.endTime),
      estimatedMinutes: input.estimatedMinutes || undefined,
      stakeholders: parseStakeholders(input.stakeholders ?? input.stakeholdersText),
      subTasks: parseSubTasks(input.subTasks ?? input.subTasksText),
      mode: input.mode,
      domain: input.domain,
      isSingleThread: input.isSingleThread,
      scheduleStatus: "scheduled",
      createdAt: now,
      updatedAt: now,
    };

    const existingTasks = get().tasks;
    const conflicts = findTaskConflicts(nextTask, existingTasks);

    if (conflicts.length > 0) {
      set({
        pendingConflict: {
          nextTask,
          conflicts,
        },
      });
      return;
    }

    const tasks = [nextTask, ...existingTasks];
    set(saveTaskList(tasks));
  },
  deleteTask: (taskId) => {
    const tasks = get().tasks.filter((task) => task.id !== taskId);
    set(saveTaskList(tasks));
  },
  applyTaskReorder: (tasks) => {
    set(saveTaskList(tasks));
  },
  toggleSubTaskCompleted: (taskId, subTaskId) => {
    const tasks = get().tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      return {
        ...task,
        subTasks: task.subTasks.map((subTask) =>
          subTask.id === subTaskId
            ? { ...subTask, completed: !subTask.completed }
            : subTask,
        ),
        updatedAt: new Date().toISOString(),
      };
    });

    saveTasks(tasks);
    set({ tasks });
  },
  setStakeholderFilter: (name) => {
    set({ activeStakeholderFilter: name });
  },
  keepBothTasks: () => {
    const pendingConflict = get().pendingConflict;

    if (!pendingConflict) {
      return;
    }

    const tasks = [pendingConflict.nextTask, ...get().tasks];
    set(saveTaskList(tasks));
  },
  replaceOldWithNewTask: () => {
    const pendingConflict = get().pendingConflict;

    if (!pendingConflict) {
      return;
    }

    const conflictIds = new Set(
      pendingConflict.conflicts.map((conflict) => conflict.existingTask.id),
    );

    const filteredTasks = get().tasks.filter((task) => !conflictIds.has(task.id));
    const tasks = [pendingConflict.nextTask, ...filteredTasks];
    set(saveTaskList(tasks));
  },
  deferNewTaskToBacklog: () => {
    const pendingConflict = get().pendingConflict;

    if (!pendingConflict) {
      return;
    }

    const deferredTask: Task = {
      ...pendingConflict.nextTask,
      startTime: undefined,
      endTime: undefined,
      scheduleStatus: "backlog",
      updatedAt: new Date().toISOString(),
    };

    const tasks = [deferredTask, ...get().tasks];
    set(saveTaskList(tasks));
  },
  dismissPendingConflict: () => {
    set({ pendingConflict: null });
  },
}));
