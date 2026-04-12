"use client";

import { useEffect, useState } from "react";
import { AiTaskInput } from "@/components/dashboard/ai-task-input";
import { AiReorderPanel } from "@/components/dashboard/ai-reorder-panel";
import { BoardControls } from "@/components/dashboard/board-controls";
import { ConflictResolutionModal } from "@/components/dashboard/conflict-resolution-modal";
import { DashboardHeader } from "@/components/dashboard/header";
import { ManualTaskForm } from "@/components/dashboard/manual-task-form";
import { StakeholderDirectory } from "@/components/dashboard/stakeholder-directory";
import { StressTestPanel } from "@/components/dashboard/stress-test-panel";
import { TaskBoard } from "@/components/dashboard/task-board";
import { useTaskStore } from "@/store/task-store";
import { TaskBoardView } from "@/types/task";

export function DashboardShell() {
  const tasks = useTaskStore((state) => state.tasks);
  const hydrated = useTaskStore((state) => state.hydrated);
  const hydrate = useTaskStore((state) => state.hydrate);
  const [view, setView] = useState<TaskBoardView>("category");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 bg-white px-4 py-6 md:px-6 xl:px-8">
      <DashboardHeader />
      <AiTaskInput />
      <StressTestPanel />
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="space-y-4">
          <AiReorderPanel />
          <BoardControls view={view} onChange={setView} />
          {hydrated ? (
            <TaskBoard tasks={tasks} view={view} />
          ) : (
            <div className="rounded-2xl border border-border bg-white p-10 text-center text-textSecondary shadow-soft">
              正在加载本地任务数据...
            </div>
          )}
        </div>
        <div className="space-y-6">
          <StakeholderDirectory />
          <ManualTaskForm />
        </div>
      </section>
      <ConflictResolutionModal />
    </main>
  );
}
