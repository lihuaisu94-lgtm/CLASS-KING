"use client";

import { FlaskConical } from "lucide-react";
import { fridayConflictScenario } from "@/lib/stress-test-data";
import { useTaskStore } from "@/store/task-store";

export function StressTestPanel() {
  const addTask = useTaskStore((state) => state.addTask);

  function handleInjectScenario() {
    fridayConflictScenario.forEach((task) => {
      addTask(task);
    });
  }

  return (
    <section className="glass-panel rounded-[2rem] border border-white/70 p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink">
            <FlaskConical className="h-4 w-4" />
            压力测试
          </p>
          <div>
            <h2 className="text-lg font-semibold text-ink">周五兼职 vs 导员临时党团会议</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              点击后会先注入"周五下午 4 点塔斯汀兼职"，再注入"导员临时通知党团会议"，用来验证党团事务是否能压过兼职安排并触发冲突面板。
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInjectScenario}
          className="rounded-2xl bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#25554a]"
        >
          注入冲突测试场景
        </button>
      </div>
    </section>
  );
}
