import { getTaskPriority } from "@/lib/task-engine";
import { TaskDomain, TaskPriority } from "@/types/task";
import { normalizeDateValue } from "@/lib/time-utils";

export interface ParseTaskRequestBody {
  rawText: string;
}

export interface ParsedTaskResponse {
  title: string;
  startTime: string;
  endTime: string;
  type: "线上" | "线下";
  category: string;
  priority: number;
  content: string;
  summary: string;
  stakeholders: string[];
  subTasks: string[];
  location?: string;
  isTimeSensitive?: boolean;
  warnings?: string[];
}

const categoryPriorityMap: Record<string, TaskPriority> = {
  党团事务: 1,
  班务: 2,
  非校内事务: 3,
  自我个人事务: 4,
  和他人的私下事务: 4,
  单线任务: 5,
};

export function buildTaskParsingSystemPrompt(now = new Date()) {
  const currentTime = new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "full",
    timeStyle: "medium",
    timeZone: "Asia/Shanghai",
  }).format(now);

  return `
You are a literalist. Do not infer dates or people not explicitly stated in the text. Accuracy over creativity.

你是一位严格的文本解析专家。你的核心原则是：【100% 忠于原文，零幻觉，零推测】。

当前时间（北京时间）：${currentTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【铁律 - CRITICAL RULES】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚫 禁止推算时间
   - 原文说"18:00开始，提前20分钟到场" → startTime 应为 17:40，NOT 18:00
   - 原文说"周五12:00截止" → 必须基于当前日期计算出具体日期，NOT 随意推到次日
   - 原文未提及具体日期 → startTime/endTime 返回 null，NOT 编造日期

🚫 禁止推测人员
   - 原文说"辅导员通知" → stakeholders: ["辅导员"]
   - 原文说"班长收集" → stakeholders: ["班长"]
   - 原文未提及具体角色 → stakeholders: []，NOT ["相关人员", "所有人", "学员们"]

🚫 禁止脑补地点
   - 原文说"创客大厦A-318" → location: "创客大厦A-318"
   - 原文说"南昌校区综合楼、井冈山校区A2-310" → location: "南昌校区综合楼；井冈山校区A2-310"
   - 原文未提及地点 → location: null，NOT "待确认" 或 "教室"

✅ 严格对齐原文
   - 只提取原文明确提到的信息
   - 不要添加任何原文没有的内容
   - 不要用通用词汇替代具体信息

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【时间解析逻辑 - Time Parsing】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

重要：所有时间必须视为北京时间（东八区），返回格式为 YYYY-MM-DDTHH:mm:ss（不带时区后缀）

1. 绝对时间识别
   ✓ "4月18日12:00" → "2026-04-18T12:00:00"（不是 2026-04-18T12:00:00.000Z）
   ✓ "周五18:00" → 计算本周或下周五的日期 + "T18:00:00"
   ✓ "今天下午3点" → 今天的日期 + "T15:00:00"
   ✓ "明天上午10点" → 明天的日期 + "T10:00:00"

2. 相对时间计算
   ✓ "18:00开始，提前20分钟到场" → startTime = "2026-04-13T17:40:00"，endTime = "2026-04-13T18:00:00"
   ✓ "12:00截止，建议提前2小时完成" → endTime = "2026-04-13T12:00:00"，在 summary 中说明建议10:00完成

3. 字段精准映射
   ✓ startTime：对应"建议完成时间"、"到场时间"、"提前XX分钟"计算后的时间
   ✓ endTime：对应"正式开始时间"、"截止时间"、"结束时间"
   ✓ 示例：原文说"18:00开始，17:40到场" → startTime="2026-04-13T17:40:00", endTime="2026-04-13T18:00:00"

4. 未知时间处理
   ✓ 原文未提及具体时间 → startTime: null, endTime: null
   ✓ 只提及"本周内" → startTime: null, endTime: null，在 warnings 中添加"⚠️ 具体时间待确认"
   ✓ 只提及"尽快" → startTime: null, endTime: null，在 warnings 中添加"⚠️ 截止时间待确认"

时间格式规范：
- 正确：2026-04-18T12:00:00
- 错误：2026-04-18T12:00:00.000Z（不要带 .000Z 后缀）
- 错误：2026-04-18T12:00:00+08:00（不要带时区信息）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【人员识别逻辑 - People Extraction】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

只提取原文中明确提到的角色或姓名：
✓ "辅导员通知" → ["辅导员"]
✓ "班长收集，团支书提交" → ["班长", "团支书"]
✓ "张老师负责" → ["张老师"]
✓ "龙管家发布" → ["龙管家"]

禁止添加的通用词汇：
✗ "相关人员"
✗ "所有人"
✗ "学员们"
✗ "同学们"
✗ "大家"

如果原文未提及具体人员 → stakeholders: []

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【输出格式 - JSON Structure】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "title": "简洁任务标题（15字以内）",
  
  "summary": "【时间红线】\\n截止时间：X月X日 XX:XX（星期X）\\n建议完成时间：X月X日 XX:XX\\n\\n【行动清单】\\n1. 具体动作+执行人+方式\\n2. ...\\n\\n【材料/地点清单】\\n附件X：格式+份数+命名规范\\n提交地点：XX\\n\\n【执行建议】\\n建议XX负责XX。注意：XX。",
  
  "content": "原始通知的核心背景信息",
  
  "subTasks": [
    "具体可执行步骤1（必须包含动作+执行人+方式）",
    "具体可执行步骤2",
    "..."
  ],
  
  "stakeholders": ["辅导员", "班长"],
  
  "type": "线上" | "线下",
  
  "category": "党团事务" | "班务" | "非校内事务" | "自我个人事务" | "单线任务",
  
  "priority": 1,
  
  "startTime": "2026-04-18T17:40:00" | null,
  "endTime": "2026-04-18T18:00:00" | null,
  
  "location": "创客大厦A-318" | null,
  
  "isTimeSensitive": true | false,
  
  "warnings": [
    "⚠️ 具体时间待确认",
    "文件命名不能有空格"
  ]
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【字段说明】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

startTime/endTime:
  - 有明确时间 → ISO 8601 格式字符串
  - 无明确时间 → null（不是空字符串 ""）
  - 有相对时间（如"提前20分钟"）→ 计算后返回具体时间

stakeholders:
  - 有明确角色/姓名 → ["辅导员", "班长"]
  - 无明确人员 → []（空数组，不是 ["相关人员"]）

location:
  - 有明确地点 → "创客大厦A-318"
  - 多个地点 → "南昌校区-XX；井冈山校区-XX"
  - 无明确地点 → null（不是 "待确认"）

warnings:
  - 时间不明确 → 添加 "⚠️ 具体时间待确认"
  - 地点不明确 → 添加 "⚠️ 提交地点待确认"
  - 人员不明确 → 添加 "⚠️ 负责人待分配"

只返回 JSON 对象，不要返回 Markdown 代码块，不要返回解释文字。
  `.trim();
}

export function extractJsonObject(content: string) {
  const trimmed = content.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const matched = trimmed.match(/\{[\s\S]*\}/);
  return matched?.[0] ?? trimmed;
}

export function inferCategoryLabel(text: string) {
  if (/(党课|党支部|党员|党团|团支书|团日|团课|支委|入党|组织生活)/.test(text)) {
    return "党团事务";
  }

  if (/(班会|班委|辅导员|班级|教务|宿舍检查|班群|班长)/.test(text)) {
    return "班务";
  }

  if (/(兼职|实习|家教|比赛|竞赛|社团|志愿活动|面试|校外)/.test(text)) {
    return "非校内事务";
  }

  if (/(复习|刷题|锻炼|体检|买东西|办证|个人|自己)/.test(text)) {
    return "单线任务";
  }

  return "自我个人事务";
}

export function inferTaskMode(text: string): "线上" | "线下" {
  if (/(线上|腾讯会议|会议链接|直播|群里|网课|文档|在线|表格|扫码填报|发送到群)/.test(text)) {
    return "线上";
  }

  return "线下";
}

export function inferDefaultDurationMinutes(text: string) {
  if (/(开会|班会|例会|会议)/.test(text)) {
    return 60;
  }

  if (/(讲座|报告|宣讲)/.test(text)) {
    return 120;
  }

  if (/(党团|团日|团课|组织生活)/.test(text)) {
    return 120;
  }

  return 60;
}

function dedupeStakeholders(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [] as string[];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function inferSubTasks(text: string) {
  const numberedMatches = Array.from(
    text.matchAll(/(?:^|\n)\s*(?:\d+[\.\)、]|[一二三四五六七八九十]+[、.])\s*([^\n；;。]+)/g),
  )
    .map((match) => match[1]?.trim() ?? "")
    .filter(Boolean);

  if (numberedMatches.length > 0) {
    return numberedMatches;
  }

  const sentenceSegments = text
    .split(/[；;。]/)
    .map((item) => item.trim())
    .filter(Boolean);

  const actionSegments = sentenceSegments.filter((segment) =>
    /(收集|收表|汇总|整理|上报|提交|通知|联系|确认|到场|签到|记录|同步|发送|填报|统计|核对)/.test(
      segment,
    ),
  );

  return actionSegments.slice(0, 6);
}

export function getPriorityFromCategory(category: string) {
  return categoryPriorityMap[category] ?? 4;
}

export function mapCategoryToTask(category: string) {
  const normalizedCategory = category.trim();

  if (normalizedCategory === "党团事务") {
    return { domain: "party" as TaskDomain, isSingleThread: false };
  }

  if (normalizedCategory === "班务") {
    return { domain: "class" as TaskDomain, isSingleThread: false };
  }

  if (normalizedCategory === "非校内事务") {
    return { domain: "external" as TaskDomain, isSingleThread: false };
  }

  if (normalizedCategory === "和他人的私下事务") {
    return { domain: "private" as TaskDomain, isSingleThread: false };
  }

  if (normalizedCategory === "单线任务") {
    return { domain: "personal" as TaskDomain, isSingleThread: true };
  }

  return { domain: "personal" as TaskDomain, isSingleThread: false };
}

export function normalizeParsedTaskResponse(payload: unknown, rawText: string): ParsedTaskResponse {
  const source = typeof payload === "object" && payload ? (payload as Record<string, unknown>) : {};
  const fullText = `${String(source.title ?? "")}\n${String(source.content ?? rawText)}`.trim();

  const title =
    typeof source.title === "string" && source.title.trim()
      ? source.title.trim()
      : rawText.trim().slice(0, 24) || "未命名任务";

  const content =
    typeof source.content === "string" && source.content.trim()
      ? source.content.trim()
      : rawText.trim();

  const inferredCategory = inferCategoryLabel(fullText);
  const category =
    typeof source.category === "string" && source.category.trim()
      ? source.category.trim()
      : inferredCategory;

  const priority =
    typeof source.priority === "number" && source.priority >= 1 && source.priority <= 5
      ? Math.round(source.priority)
      : getPriorityFromCategory(category);

  const type =
    source.type === "线上" || source.type === "线下" ? source.type : inferTaskMode(fullText);

  // 使用统一的时间处理函数
  const startTime = normalizeDateValue(source.startTime as string);
  const endTime = normalizeDateValue(source.endTime as string);

  const summary =
    typeof source.summary === "string" && source.summary.trim()
      ? source.summary.trim()
      : `${dedupeStakeholders(source.stakeholders).join("、") || "相关同学"}${type === "线上" ? "在线上" : "在线下"}处理${title}`;

  // 严格处理人员：只提取原文明确提到的，空数组表示未提及
  const stakeholders = dedupeStakeholders(source.stakeholders);
  
  const mapped = mapCategoryToTask(category);
  const subTasks = normalizeStringArray(source.subTasks);
  
  // 严格处理地点：null 表示未提及，不要用"待确认"等占位符
  const location = typeof source.location === "string" && source.location.trim()
    ? source.location.trim()
    : undefined;
    
  const isTimeSensitive = typeof source.isTimeSensitive === "boolean"
    ? source.isTimeSensitive
    : /(今天|立刻|紧急|马上|立即|urgent|asap)/i.test(fullText);
    
  const warnings = Array.isArray(source.warnings)
    ? source.warnings.filter((w): w is string => typeof w === "string" && w.trim().length > 0)
    : [];

  return {
    title,
    content,
    summary,
    type,
    category,
    priority:
      typeof priority === "number"
        ? priority
        : getTaskPriority(mapped.domain, mapped.isSingleThread),
    startTime: startTime || "",
    endTime: endTime || "",
    stakeholders,
    subTasks: subTasks.length > 0 ? subTasks : inferSubTasks(content),
    location,
    isTimeSensitive,
    warnings,
  };
}
