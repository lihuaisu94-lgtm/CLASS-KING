export const taskModeOptions = ["online", "offline"] as const;
export const taskDomainOptions = [
  "party",
  "class",
  "external",
  "personal",
  "private",
] as const;
export const urgencyOptions = ["urgent", "normal", "relaxed"] as const;
export const taskViewOptions = ["category", "priority"] as const;
export const taskPriorityOptions = [1, 2, 3, 4, 5] as const;
export const taskScheduleStatusOptions = ["scheduled", "backlog"] as const;

export type TaskMode = (typeof taskModeOptions)[number];
export type TaskDomain = (typeof taskDomainOptions)[number];
export type UrgencyLevel = (typeof urgencyOptions)[number];
export type TaskBoardView = (typeof taskViewOptions)[number];
export type TaskPriority = (typeof taskPriorityOptions)[number];
export type TaskScheduleStatus = (typeof taskScheduleStatusOptions)[number];

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Stakeholder {
  id: string;
  name: string;
  role?: string;
  importance?: number;
}

export interface Task {
  id: string;
  title: string;
  content: string;
  summary: string;
  priority: TaskPriority;
  startTime?: string;
  endTime?: string;
  deadline?: string;
  estimatedMinutes?: number;
  stakeholders: Stakeholder[];
  subTasks: SubTask[];
  mode: TaskMode;
  domain: TaskDomain;
  isSingleThread: boolean;
  scheduleStatus: TaskScheduleStatus;
  createdAt: string;
  updatedAt: string;
}
