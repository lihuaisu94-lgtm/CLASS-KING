import { getTaskPriority } from "@/lib/task-engine";
import { TaskDomain, TaskPriority } from "@/types/task";

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
你是一位专业的班级事务执行顾问。你的任务是将学校通知转化为【逻辑化落地执行攻略】。

当前时间（北京时间）：
${currentTime}

【核心要求】：严禁输出"一句话总结"或任何文学化描述。必须强制输出以下四个板块：

1. 【时间红线】
   - 格式：截止时间：X月X日 XX:XX（星期X）
   - 必须标注：建议完成时间（截止前2小时）
   - 如果有多个时间节点，全部列出
   - 示例：截止时间：4月18日 12:00（星期五），建议完成时间：4月18日 10:00

2. 【行动清单】
   - 按照执行顺序，用 1. 2. 3. 编号列出
   - 每一步必须包含：动作+执行人+地点/方式
   - 必须具体到可以直接执行，不能有模糊描述
   - 示例：
     1. 班长在班级群通知所有同学，说明截止时间和材料要求
     2. 学委下载附件1和附件3，转发到班级群
     3. 各同学填写附件1（电子版），重命名为"学号-姓名-材料.xlsx"，发送给班长
     4. 班长汇总所有电子版，打包命名为"XX班-材料汇总.zip"
     5. 团支书收齐纸质版，南昌校区交创客大厦A-318，井冈山校区交A2-310
     6. 截止前2小时，班长再次确认所有材料是否提交成功

3. 【材料/地点清单】
   - 逐项列出：附件编号、纸质/电子版要求、份数、格式要求
   - 分校区标注：南昌校区交XX地点，井冈山校区交XX地点
   - 文件命名规范：必须标注（如：学号-姓名-材料名.pdf）
   - 格式要求：必须写学校全称、禁止涂改、必须手写签名等
   - 示例：
     附件1：电子版1份，Excel格式，命名为"学号-姓名-材料.xlsx"
     附件3：纸质版1份，需手写签名，不能涂改
     提交地点：南昌校区-创客大厦A-318，井冈山校区-A2-310

4. 【执行建议】
   - 建议谁负责收集、谁负责整理、谁负责提交、谁负责通知
   - 根据任务性质智能推断班委分工
   - 提醒容易出错的地方
   - 示例：
     建议班长负责电子版汇总和最后确认，团支书负责纸质版收集和提交，学委负责材料格式检查。
     注意：文件命名不能有空格或特殊字符，纸质版必须手写签名不能打印，截止时间是工作日12:00不是自然日。

【属性识别】：
- type：判定"线上"或"线下"
- category：判定 [党团事务/班务/非校内事务/自我个人事务/单线任务]
- priority：按照 [党团=1 > 班务=2 > 非校内=3 > 个人=4 > 单线=5] 分配数字
- stakeholders：提取相关人员（辅导员、班长、团支书、龙管家等）

【时间处理】：
- startTime 和 endTime 统一输出 ISO 8601 格式（如：2026-04-18T12:00:00.000Z）
- 若无法判断，返回空字符串 ""
- 若文本未提及时长：开会默认 1h，讲座默认 2h，党团活动默认 2h

必须输出此 JSON 格式：
{
  "title": "具体任务名（动词+名词，如：团日活动材料提交）",
  "summary": "【时间红线】截止时间：4月18日 12:00（星期五），建议完成时间：4月18日 10:00\n\n【行动清单】\n1. 班长在班级群通知所有同学，说明截止时间和材料要求\n2. 学委下载附件1和附件3，转发到班级群\n3. 各同学填写附件1（电子版），重命名为'学号-姓名-材料.xlsx'，发送给班长\n4. 班长汇总所有电子版，打包命名为'XX班-材料汇总.zip'\n5. 团支书收齐纸质版，南昌校区交创客大厦A-318，井冈山校区交A2-310\n6. 截止前2小时，班长再次确认所有材料是否提交成功\n\n【材料/地点清单】\n附件1：电子版1份，Excel格式，命名为'学号-姓名-材料.xlsx'\n附件3：纸质版1份，需手写签名，不能涂改\n提交地点：南昌校区-创客大厦A-318，井冈山校区-A2-310\n\n【执行建议】\n建议班长负责电子版汇总和最后确认，团支书负责纸质版收集和提交，学委负责材料格式检查。注意：文件命名不能有空格或特殊字符，纸质版必须手写签名不能打印。",
  "content": "详细的执行攻略内容",
  "subTasks": [
    "班长在班级群通知所有同学，说明截止时间和材料要求",
    "学委下载附件1和附件3，转发到班级群",
    "各同学填写附件1（电子版），重命名为'学号-姓名-材料.xlsx'，发送给班长",
    "班长汇总所有电子版，打包命名为'XX班-材料汇总.zip'",
    "团支书收齐纸质版，南昌校区交创客大厦A-318，井冈山校区交A2-310",
    "截止前2小时，班长再次确认所有材料是否提交成功"
  ],
  "stakeholders": ["班长", "团支书", "学委"],
  "type": "线上" | "线下",
  "category": "党团事务",
  "priority": 1,
  "startTime": "2026-04-18T08:00:00.000Z",
  "endTime": "2026-04-18T12:00:00.000Z"
}

只返回 JSON 对象，不要返回 Markdown，不要返回解释，不要包裹代码块。
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

function normalizeDateString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}

function dedupeStakeholders(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

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
  if (!Array.isArray(value)) {
    return [] as string[];
  }

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

  const startTime = normalizeDateString(source.startTime);
  const endTime = normalizeDateString(source.endTime);
  const durationMinutes = inferDefaultDurationMinutes(fullText);

  const fallbackStart =
    startTime || endTime
      ? startTime || new Date(new Date(endTime).getTime() - durationMinutes * 60_000).toISOString()
      : "";

  const fallbackEnd =
    endTime || startTime
      ? endTime || new Date(new Date(startTime).getTime() + durationMinutes * 60_000).toISOString()
      : "";

  const summary =
    typeof source.summary === "string" && source.summary.trim()
      ? source.summary.trim().slice(0, 50)
      : `${dedupeStakeholders(source.stakeholders).join("、") || "相关同学"}${type === "线上" ? "在线上" : "在线下"}处理${title}`.slice(
          0,
          50,
        );

  const stakeholders = dedupeStakeholders(source.stakeholders);
  const mapped = mapCategoryToTask(category);
  const subTasks = normalizeStringArray(source.subTasks);

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
    startTime: fallbackStart,
    endTime: fallbackEnd,
    stakeholders,
    subTasks: subTasks.length > 0 ? subTasks : inferSubTasks(content),
  };
}
