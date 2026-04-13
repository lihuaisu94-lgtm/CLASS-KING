/**
 * 时间处理工具函数
 * 统一处理时区和格式化逻辑，确保所有时间都视为北京时间（东八区）
 */

/**
 * 清理时间字符串的时区后缀
 * 移除 .000Z、Z 和 +08:00 等时区标识，强制视为本地时间
 */
export function cleanTimezone(value: string): string {
  return value.replace(/\.000Z$/, '').replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
}

/**
 * 格式化时间为 YYYY-MM-DD HH:mm
 * @param value ISO 格式时间字符串
 * @returns 格式化后的时间字符串，如 "2026-04-13 18:00"
 */
export function formatDateTime(value?: string): string {
  if (!value) return "时间待定";

  const cleanValue = cleanTimezone(value);
  const date = new Date(cleanValue);
  
  if (Number.isNaN(date.getTime())) {
    return "时间待定";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${minute}`;
}

/**
 * 规范化时间值为不带时区的 ISO 格式
 * @param value 时间字符串
 * @returns ISO 格式字符串（不带时区），如 "2026-04-13T18:00:00"
 */
export function normalizeDateValue(value?: string): string | undefined {
  if (!value) return undefined;

  const cleanValue = cleanTimezone(value);
  const date = new Date(cleanValue);
  
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

/**
 * 计算两个时间之间的分钟数
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @returns 分钟数，如果时间无效则返回 undefined
 */
export function getEstimatedMinutes(startTime?: string, endTime?: string): number | undefined {
  if (!startTime || !endTime) return undefined;

  const start = new Date(cleanTimezone(startTime));
  const end = new Date(cleanTimezone(endTime));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return undefined;
  }

  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}

/**
 * 清理文本中的 ISO 时间格式，转换为可读格式
 * @param text 包含 ISO 时间的文本
 * @returns 清理后的文本
 */
export function cleanISOTimeInText(text: string): string {
  return text
    .replace(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):\d{2}/g, '$1 $2')
    .replace(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/g, '$1 $2');
}
