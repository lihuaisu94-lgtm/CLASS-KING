import { createId } from "@/lib/task-engine";
import { Task } from "@/types/task";

const now = new Date();

function offset(hours: number) {
  return new Date(now.getTime() + hours * 36e5).toISOString();
}

export const seedTasks: Task[] = [
  {
    id: createId("task"),
    title: "学院团日活动材料汇总",
    content: "收集各寝室照片、活动心得与签到表，今晚前提交学院。",
    summary: "整理团日活动材料并在今晚前完成提交。",
    priority: 1,
    startTime: offset(2),
    deadline: offset(10),
    estimatedMinutes: 90,
    stakeholders: [
      { id: createId("stakeholder"), name: "团支书", role: "活动负责人", importance: 4 },
      { id: createId("stakeholder"), name: "辅导员", role: "审批人", importance: 5 },
    ],
    subTasks: [
      { id: createId("subtask"), title: "催收照片", completed: false },
      { id: createId("subtask"), title: "整理签到表", completed: false },
    ],
    mode: "online",
    domain: "party",
    isSingleThread: false,
    scheduleStatus: "scheduled",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: createId("task"),
    title: "班会教室确认",
    content: "联系教务处确认周三班会教室是否调整，并通知班级群。",
    summary: "确认班会教室并同步给全班。",
    priority: 2,
    deadline: offset(36),
    estimatedMinutes: 40,
    stakeholders: [
      { id: createId("stakeholder"), name: "教务老师", role: "场地确认", importance: 4 },
      { id: createId("stakeholder"), name: "全班同学", role: "通知对象", importance: 5 },
    ],
    subTasks: [{ id: createId("subtask"), title: "发布班群通知", completed: false }],
    mode: "offline",
    domain: "class",
    isSingleThread: false,
    scheduleStatus: "scheduled",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: createId("task"),
    title: "英语四级个人复习",
    content: "完成一套听力和阅读模拟题，整理错题。",
    summary: "完成英语四级模拟训练。",
    priority: 5,
    deadline: offset(120),
    estimatedMinutes: 120,
    stakeholders: [{ id: createId("stakeholder"), name: "自己", role: "执行者", importance: 2 }],
    subTasks: [
      { id: createId("subtask"), title: "听力模拟", completed: false },
      { id: createId("subtask"), title: "阅读纠错", completed: false },
    ],
    mode: "online",
    domain: "personal",
    isSingleThread: true,
    scheduleStatus: "scheduled",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];
