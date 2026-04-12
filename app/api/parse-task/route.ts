import { NextRequest, NextResponse } from "next/server";
import {
  ParseTaskRequestBody,
  buildTaskParsingSystemPrompt,
  extractJsonObject,
  normalizeParsedTaskResponse,
} from "@/lib/ai/task-parser";

const SILICONFLOW_BASE_URL =
  process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1/chat/completions";
const SILICONFLOW_MODEL = process.env.SILICONFLOW_MODEL ?? "deepseek-ai/DeepSeek-V3";
const REQUEST_TIMEOUT_MS = 20_000;

function getRemoteErrorMessage(detail: string) {
  if (/insufficient|balance|quota|billing|余额|额度/i.test(detail)) {
    return "SiliconFlow 返回余额或额度不足，请检查账户状态。";
  }

  if (/timeout|timed out|abort/i.test(detail)) {
    return "SiliconFlow 请求超时，请稍后重试。";
  }

  return "SiliconFlow 请求失败，请检查网络、密钥和模型配置。";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.SILICONFLOW_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "服务端未配置 SILICONFLOW_API_KEY，请先在 .env.local 中设置。" },
      { status: 500 },
    );
  }

  let body: ParseTaskRequestBody;

  try {
    body = (await request.json()) as ParseTaskRequestBody;
  } catch {
    return NextResponse.json({ error: "请求体不是有效 JSON。" }, { status: 400 });
  }

  if (!body.rawText?.trim()) {
    return NextResponse.json({ error: "请先提供要解析的通知或聊天记录文本。" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(SILICONFLOW_BASE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: SILICONFLOW_MODEL,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: buildTaskParsingSystemPrompt(),
            },
            {
              role: "user",
              content: body.rawText.trim(),
            },
          ],
        }),
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();

        return NextResponse.json(
          {
            error: getRemoteErrorMessage(errorText),
            detail: errorText,
          },
          { status: 502 },
        );
      }

      const result = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };

      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        return NextResponse.json({ error: "模型没有返回可解析内容。" }, { status: 502 });
      }

      const parsed = JSON.parse(extractJsonObject(content));
      const normalized = normalizeParsedTaskResponse(parsed, body.rawText);

      return NextResponse.json(normalized);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    const isTimeout =
      error instanceof Error &&
      (error.name === "AbortError" || /aborted|timeout/i.test(error.message));

    return NextResponse.json(
      {
        error: isTimeout ? "SiliconFlow 请求超时，请稍后重试。" : "任务解析失败，请检查网络或模型配置。",
        detail: message,
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}
