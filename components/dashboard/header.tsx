import { Sparkles, CalendarRange } from "lucide-react";

export function DashboardHeader() {
  return (
    <section className="card-float rounded-lg px-8 py-10 transition-shadow hover:shadow-floatHover">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-md bg-primaryLight px-4 py-2 text-sm font-bold text-primary">
            <Sparkles className="h-4 w-4" />
            AI 班务与日程管家
          </span>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold leading-tight text-ink lg:text-5xl">
              把通知、群聊和临时事项，
              <br />
              收拢成一张可执行的班务时间图。
            </h1>
            <p className="max-w-xl text-sm leading-relaxed-plus text-textSecondary lg:text-base">
              Phase 1 先完成任务看板与手动录入。后续我们会在这个骨架上接入 AI 解析、冲突检测与一键重排。
            </p>
          </div>
        </div>
        <div className="card-float rounded-lg px-5 py-4">
          <div className="flex items-center gap-3">
            <CalendarRange className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-semibold text-textSecondary">今日运营重点</p>
              <p className="text-lg font-bold text-ink">先看板，再决策</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
