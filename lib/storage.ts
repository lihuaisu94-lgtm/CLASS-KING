import { Task } from "@/types/task";

const STORAGE_KEY = "ai-class-manager/tasks";

export function loadTasks() {
  if (typeof window === "undefined") {
    return [] as Task[];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [] as Task[];
  }

  try {
    return JSON.parse(raw) as Task[];
  } catch {
    return [] as Task[];
  }
}

export function saveTasks(tasks: Task[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
