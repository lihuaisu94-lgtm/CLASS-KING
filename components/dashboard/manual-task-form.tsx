"use client";

import { useState } from "react";
import { getDomainLabel, getModeLabel } from "@/lib/task-engine";
import { useTaskStore } from "@/store/task-store";
import { TaskDomain, TaskMode, taskDomainOptions, taskModeOptions } from "@/types/task";

const initialForm = {
  title: "",
  content: "",
  summary: "",
  startTime: "",
  endTime: "",
  deadline: "",
  estimatedMinutes: "",
  mode: "online" as TaskMode,
  domain: "class" as TaskDomain,
  isSingleThread: false,
  stakeholdersText: "",
  subTasksText: "",
};

export function ManualTaskForm() {
  const addTask = useTaskStore((state) => state.addTask);
  const [form, setForm] = useState(initialForm);

  function update<K extends keyof typeof initialForm>(key: K, value: (typeof initialForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim() || !form.summary.trim()) return;

    addTask({
      ...form,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
    });

    setForm(initialForm);
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-textSecondary">Phase 1</p>
        <h2 className="text-2xl font-semibold text-ink">手动录入任务</h2>
        <p className="text-sm leading-6 text-textSecondary">
          你可以继续手动精细录入任务，或者在上方先用 AI 智能解析，再回来补充细节。
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">任务标题</span>
          <input
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            placeholder="例如：班会教室调整通知"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">简洁化解释（50字内）</span>
          <input
            value={form.summary}
            onChange={(event) => update("summary", event.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            placeholder="例如：确认班会教室并通知全班"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">具体内容</span>
          <textarea
            value={form.content}
            onChange={(event) => update("content", event.target.value)}
            className="min-h-28 w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            placeholder="把需要做的动作、背景和要求写清楚"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">起始时间</span>
            <input
              type="datetime-local"
              value={form.startTime}
              onChange={(event) => update("startTime", event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">结束时间</span>
            <input
              type="datetime-local"
              value={form.endTime}
              onChange={(event) => update("endTime", event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">截止时间</span>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(event) => update("deadline", event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">预计耗时（分钟）</span>
            <input
              type="number"
              min="0"
              value={form.estimatedMinutes}
              onChange={(event) => update("estimatedMinutes", event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
              placeholder="留空表示后续交给 AI 估算"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">执行方式</span>
            <select
              value={form.mode}
              onChange={(event) => update("mode", event.target.value as TaskMode)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            >
              {taskModeOptions.map((mode) => (
                <option key={mode} value={mode}>
                  {getModeLabel(mode)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-ink">事务分类</span>
            <select
              value={form.domain}
              onChange={(event) => update("domain", event.target.value as TaskDomain)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            >
              {taskDomainOptions.map((domain) => (
                <option key={domain} value={domain}>
                  {getDomainLabel(domain)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">关联对象</span>
          <textarea
            value={form.stakeholdersText}
            onChange={(event) => update("stakeholdersText", event.target.value)}
            className="min-h-24 w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            placeholder="例如：辅导员，全班同学，团支书"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">流程拆分 / 子任务</span>
          <textarea
            value={form.subTasksText}
            onChange={(event) => update("subTasksText", event.target.value)}
            className="min-h-24 w-full rounded-xl border border-border bg-white px-4 py-3 text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primaryLight"
            placeholder="一行一个，或者用逗号分隔"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-border bg-mist px-4 py-3 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isSingleThread}
            onChange={(event) => update("isSingleThread", event.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          这是单线个人任务（在绝对优先级中最低）
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primaryDark"
        >
          写入任务看板
        </button>
      </form>
    </section>
  );
}
