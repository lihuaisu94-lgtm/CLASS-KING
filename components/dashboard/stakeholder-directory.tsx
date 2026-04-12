"use client";

import { Users } from "lucide-react";
import { useTaskStore } from "@/store/task-store";

export function StakeholderDirectory() {
  const tasks = useTaskStore((state) => state.tasks);
  const activeStakeholderFilter = useTaskStore((state) => state.activeStakeholderFilter);
  const setStakeholderFilter = useTaskStore((state) => state.setStakeholderFilter);

  const stakeholderMap = new Map<string, number>();

  tasks.forEach((task) => {
    task.stakeholders.forEach((person) => {
      stakeholderMap.set(person.name, (stakeholderMap.get(person.name) ?? 0) + 1);
    });
  });

  const stakeholders = Array.from(stakeholderMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary bg-primaryLight px-3 py-1 text-xs font-semibold text-primary">
            <Users className="h-4 w-4" />
            关系人名录
          </p>
          <h2 className="text-xl font-semibold text-ink">按人看任务牵动面</h2>
        </div>
        {activeStakeholderFilter ? (
          <button
            type="button"
            onClick={() => setStakeholderFilter(null)}
            className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
          >
            清除高亮
          </button>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {stakeholders.length > 0 ? (
          stakeholders.map(([name, count]) => {
            const active = activeStakeholderFilter === name;

            return (
              <button
                key={name}
                type="button"
                onClick={() => setStakeholderFilter(active ? null : name)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  active
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-ink hover:bg-primaryLight",
                ].join(" ")}
              >
                {name} · {count}
              </button>
            );
          })
        ) : (
          <p className="text-sm text-textSecondary">当前还没有可汇总的关联对象。</p>
        )}
      </div>
    </section>
  );
}
