import type { TaskCreateInput } from "@/store/task-store";

export const fridayConflictScenario: TaskCreateInput[] = [
  {
    title: "周五下午 4 点塔斯汀兼职",
    content: "周五 16:00 到 19:00 去塔斯汀门店兼职值班，负责点单和闭店前准备。",
    summary: "我周五下午四点去塔斯汀兼职值班。",
    startTime: "2026-04-17T16:00:00+08:00",
    endTime: "2026-04-17T19:00:00+08:00",
    deadline: "2026-04-17T19:00:00+08:00",
    estimatedMinutes: 180,
    mode: "offline",
    domain: "external",
    isSingleThread: true,
    stakeholders: ["塔斯汀店长", "排班同事"],
    subTasks: ["按时到岗", "完成值班", "交接收尾"],
    priority: 5,
  },
  {
    title: "导员临时通知党团会议",
    content: "辅导员临时通知周五 16:30 在学院会议室召开党团工作紧急会议，需要班长和团支书到场并记录要点。",
    summary: "辅导员通知班长和团支书周五 16:30 去学院会议室参加党团会议。",
    startTime: "2026-04-17T16:30:00+08:00",
    endTime: "2026-04-17T18:30:00+08:00",
    deadline: "2026-04-17T18:30:00+08:00",
    estimatedMinutes: 120,
    mode: "offline",
    domain: "party",
    isSingleThread: false,
    stakeholders: ["辅导员", "团支书", "班长"],
    subTasks: ["到场签到", "记录会议要求", "会后同步班委"],
    priority: 1,
  },
];
