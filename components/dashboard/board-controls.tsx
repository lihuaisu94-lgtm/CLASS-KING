"use client";

import clsx from "clsx";
import { TaskBoardView } from "@/types/task";

interface BoardControlsProps {
  view: TaskBoardView;
  onChange: (view: TaskBoardView) => void;
}

export function BoardControls({ view, onChange }: BoardControlsProps) {
  const options: { value: TaskBoardView; label: string; hint: string }[] = [
    { value: "category", label: "分类视图", hint: "按事务类型观察任务结构" },
    { value: "priority", label: "优先级视图", hint: "按紧急度与权重快速排序" },
  ];

  return (
    <div className="rounded-2xl border border-border bg-white p-2 shadow-soft">
      <div className="grid gap-2 md:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "rounded-xl px-4 py-3 text-left transition",
              view === option.value ? "bg-primary text-white" : "border border-border bg-white text-ink hover:bg-primaryLight",
            )}
          >
            <p className="font-semibold">{option.label}</p>
            <p className={clsx("text-sm", view === option.value ? "text-primaryLight" : "text-textSecondary")}>
              {option.hint}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
