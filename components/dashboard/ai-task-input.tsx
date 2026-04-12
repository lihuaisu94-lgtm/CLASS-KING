"use client";

import { useState } from "react";
import { AlertTriangle, Sparkles, WandSparkles, CheckCircle2 } from "lucide-react";
import { ParsedTaskResponse } from "@/lib/ai/task-parser";
import { mapCategoryToTask } from "@/lib/ai/task-parser";
import { useTaskStore } from "@/store/task-store";
import { normalizeTaskMode } from "@/lib/task-engine";

function getEstimatedMinutes(startTime: string, endTime: string) {
  if (!startTime || !endTime) {
    return undefined;
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return undefined;
  }

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

function highlightLocations(text: string) {
  const locationPattern = /([A-Z]\d?-\d{3,4}|[A-Z]\d?栋\d{3,4}|创客大厦|行政楼|图书馆|教学楼)/g;
  return text.replace(locationPattern, '<span class="location-highlight">$1</span>');
}

function formatOfficialDocument(text: string) {
  // 将文本按照板块分割并格式化
  const sections = text.split(/\n\n/);
  return sections.map((section, index) => {
    if (section.includes('【时间红线】')) {
      return `<div class="mb-6"><h3 class="text-base font-bold text-primary mb-3">【时间红线】</h3><p class="text-ink leading-relaxed-plus">${section.replace('【时间红线】', '').trim()}</p></div>`;
    } else if (section.includes('【行动清单】')) {
      return `<div class="mb-6"><h3 class="text-base font-bold text-primary mb-3">【行动清单】</h3><p class="text-ink leading-relaxed-plus whitespace-pre-line">${section.replace('【行动清单】', '').trim()}</p></div>`;
    } else if (section.includes('【材料/地点清单】')) {
      return `<div class="mb-6"><h3 class="text-base font-bold text-primary mb-3">【材料/地点清单】</h3><p class="text-ink leading-relaxed-plus whitespace-pre-line">${section.replace('【材料/地点清单】', '').trim()}</p></div>`;
    } else if (section.includes('【执行建议】')) {
      return `<div class="mb-6"><h3 class="text-base font-bold text-primary mb-3">【执行建议】</h3><p class="text-ink leading-relaxed-plus">${section.replace('【执行建议】', '').trim()}</p></div>`;
    }
    return `<p class="text-ink leading-relaxed-plus mb-4">${section}</p>`;
  }).join('');
}

export function AiTaskInput() {
  const addTask = useTaskStore((state) => state.addTask);
  const [rawText, setRawText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastResult, setLastResult] = useState<ParsedTaskResponse | null>(null);

  async function handleParse() {
    if (!rawText.trim() || isLoading) {
      return;
    }

    setIsLoading(true);
    setError("");
    setLastResult(null);

    try {
      const response = await fetch("/api/parse-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rawText }),
      });

      const result = (await response.json()) as ParsedTaskResponse & {
        error?: string;
        detail?: string;
      };

      if (!response.ok) {
        throw new Error(
          [result.error, result.detail].filter(Boolean).join(" ") || "AI 解析失败，请稍后重试。",
        );
      }

      setLastResult(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "AI 解析失败，请稍后再试。");
    } finally {
      setIsLoading(false);
    }
  }

  function handleConfirm() {
    if (!lastResult) return;

    const mappedTask = mapCategoryToTask(lastResult.category);

    addTask({
      title: lastResult.title,
      content: lastResult.content,
      summary: lastResult.summary,
      startTime: lastResult.startTime || undefined,
      endTime: lastResult.endTime || undefined,
      deadline: lastResult.endTime || undefined,
      estimatedMinutes: getEstimatedMinutes(lastResult.startTime, lastResult.endTime),
      mode: normalizeTaskMode(lastResult.type),
      domain: mappedTask.domain,
      isSingleThread: mappedTask.isSingleThread,
      priority: lastResult.priority as 1 | 2 | 3 | 4 | 5,
      stakeholders: lastResult.stakeholders,
      subTasks: lastResult.subTasks,
    });

    setLastResult(null);
    setRawText("");
  }

  function handleReset() {
    setLastResult(null);
    setError("");
  }

  return (
    <section className="card-float rounded-lg p-6 transition-shadow hover:shadow-floatHover">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 rounded-md bg-primaryLight px-3 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="h-4 w-4" />
            Phase 2 · AI 智能录入
          </p>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-ink">通知解析中心</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-textSecondary">
              粘贴学校通知，AI 自动生成逻辑化落地执行攻略
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleParse}
          disabled={isLoading || !rawText.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-white shadow-float transition hover:bg-primaryDark hover:shadow-floatHover disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-60 sm:self-start"
        >
          <WandSparkles className="h-4 w-4" />
          {isLoading ? "AI 解析中..." : "开始解析"}
        </button>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <label className="block space-y-2">
          <span className="text-sm font-bold text-ink">原始通知文本</span>
          <textarea
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            className="min-h-[500px] w-full rounded-lg border-0 bg-cardBg p-5 text-ink shadow-float outline-none ring-1 ring-gray-200 transition focus:ring-2 focus:ring-primary"
            placeholder="将学校通知、群聊记录或临时安排粘贴到这里..."
          />
        </label>

        <div className="flex h-[600px] flex-col overflow-hidden rounded-lg shadow-float">
          <div className="flex-1 overflow-y-auto bg-cardBg p-6 smooth-scroll">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">执行攻略预览</p>
              {lastResult && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-textSecondary hover:text-ink"
                >
                  重置
                </button>
              )}
            </div>

            {lastResult ? (
              <div className="fade-in-up space-y-6">
                <div className="border-l-4 border-primary bg-primaryLight px-4 py-3">
                  <h2 className="text-lg font-bold text-ink">{lastResult.title}</h2>
                </div>

                <div 
                  className="official-document text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightLocations(formatOfficialDocument(lastResult.summary))
                  }}
                />

                {lastResult.stakeholders && lastResult.stakeholders.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-textTertiary">相关人员</p>
                    <div className="flex flex-wrap gap-2">
                      {lastResult.stakeholders.map((person, index) => (
                        <span key={index} className="rounded-md bg-primaryLight px-3 py-1 text-sm font-semibold text-primary">
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-ink">{lastResult.type}</span>
                  <span className="rounded-md bg-gray-100 px-3 py-1 text-xs font-semibold text-ink">{lastResult.category}</span>
                  <span className="rounded-md bg-primary px-3 py-1 text-xs font-bold text-white">P{lastResult.priority}</span>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-sm leading-relaxed text-textSecondary">
                  解析成功后，这里会显示格式化的执行攻略
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-4 text-sm text-red-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-bold">解析失败</p>
                    <p className="leading-relaxed">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {lastResult && (
            <div className="bg-primary p-4">
              <button
                type="button"
                onClick={handleConfirm}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-6 py-3.5 text-base font-bold text-primary transition hover:bg-gray-50"
              >
                <CheckCircle2 className="h-5 w-5" />
                确认并归档到事务看板
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
