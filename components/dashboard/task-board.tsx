"use client";

import { getDomainLabel, sortTasksByPriority } from "@/lib/task-engine";
import { useTaskStore } from "@/store/task-store";
import { Task, TaskBoardView, taskDomainOptions } from "@/types/task";
import { TaskCard } from "./task-card";

interface TaskBoardProps {
  tasks: Task[];
  view: TaskBoardView;
}

export function TaskBoard({ tasks, view }: TaskBoardProps) {
  const activeStakeholderFilter = useTaskStore((state) => state.activeStakeholderFilter);

  if (tasks.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-white p-10 text-center text-textSecondary">
        还没有任务，先从右侧表单录入第一条班务吧。
      </section>
    );
  }

  if (view === "priority") {
    const sorted = sortTasksByPriority(tasks);

    return (
      <section className="space-y-4">
        {activeStakeholderFilter ? (
          <div className="rounded-xl border border-primary bg-primaryLight px-4 py-3 text-sm text-primary">
            正在高亮与「{activeStakeholderFilter}」相关的任务。
          </div>
        ) : null}
        {sorted.map((task, index) => (
          <div key={task.id} className="space-y-2">
            <p className="text-sm font-medium text-textSecondary">Top {index + 1}</p>
            <TaskCard
              task={task}
              isHighlighted={
                activeStakeholderFilter
                  ? task.stakeholders.some((item) => item.name === activeStakeholderFilter)
                  : false
              }
              isDimmed={
                activeStakeholderFilter
                  ? !task.stakeholders.some((item) => item.name === activeStakeholderFilter)
                  : false
              }
            />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {activeStakeholderFilter ? (
        <div className="rounded-xl border border-primary bg-primaryLight px-4 py-3 text-sm text-primary">
          正在高亮与「{activeStakeholderFilter}」相关的任务。
        </div>
      ) : null}
      {taskDomainOptions.map((domain) => {
        const groupedTasks = tasks.filter((task) => task.domain === domain);
        if (groupedTasks.length === 0) return null;

        return (
          <div key={domain} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-ink">{getDomainLabel(domain)}</h2>
              <span className="rounded-full border border-border bg-mist px-3 py-1 text-sm text-textSecondary">
                {groupedTasks.length} 项
              </span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {groupedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isHighlighted={
                    activeStakeholderFilter
                      ? task.stakeholders.some((item) => item.name === activeStakeholderFilter)
                      : false
                  }
                  isDimmed={
                    activeStakeholderFilter
                      ? !task.stakeholders.some((item) => item.name === activeStakeholderFilter)
                      : false
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
