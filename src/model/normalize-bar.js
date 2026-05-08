/**
 * K 线数据规范化（与短期目标阶段 A 一致）
 *
 * 业务接口常返回字符串价格、不同成交量字段名；渲染与后续指标只读统一结构，避免全库散落
 * 魔法字符串键与隐式类型转换。原始键名与 constant.js 中 *\_INDEX 常量保持一致。
 */
import {
  START_PRICE_INDEX,
  END_PRICE_INDEX,
  MIN_PRICE_INDEX,
  MAX_PRICE_INDEX,
  TIME_INDEX
} from '../constant.js';

/**
 * 内部单根 K 线：字段均为 number；time 为 Unix 秒（与 utils.getDate 中 timestamp*1000 约定一致）
 * @typedef {{ time: number, open: number, high: number, low: number, close: number, volume: number }} NormalizedBar
 */

/** 接口常见 vol / volume，按序取第一个可解析的；皆无则 volume 为 0 */
const DEFAULT_VOLUME_KEYS = ['vol', 'volume'];

/** 统一成有限数字，否则返回 NaN，由 normalizeBar 集中校验 */
function toFiniteNumber(value) {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * 内部时间一律为 Unix 秒。若误传毫秒（数量级 > 1e11），则 floor(t/1000)。
 * @param {number} t
 */
function normalizeTimeSeconds(t) {
  if (!Number.isFinite(t)) return NaN;
  if (t > 1e11) return Math.floor(t / 1000);
  return t;
}

/**
 * 单条 API 行 → NormalizedBar。OHLC 或 time 非法时抛错，避免画出「安静错误」的图。
 * @param {Record<string, unknown>} raw 原始行情对象
 * @param {string[]} [volumeKeys] 成交量字段候选名，按顺序取第一个有值的
 * @returns {NormalizedBar}
 */
export function normalizeBar(raw, volumeKeys = DEFAULT_VOLUME_KEYS) {
  if (!raw || typeof raw !== 'object') {
    throw new TypeError('normalizeBar: 需要对象');
  }
  const time = normalizeTimeSeconds(toFiniteNumber(raw[TIME_INDEX]));
  const open = toFiniteNumber(raw[START_PRICE_INDEX]);
  const high = toFiniteNumber(raw[MAX_PRICE_INDEX]);
  const low = toFiniteNumber(raw[MIN_PRICE_INDEX]);
  const close = toFiniteNumber(raw[END_PRICE_INDEX]);

  if (![time, open, high, low, close].every(Number.isFinite)) {
    throw new Error('normalizeBar: time 或 OHLC 无法解析为有效数字');
  }

  let volume = 0;
  for (const key of volumeKeys) {
    if (raw[key] === undefined || raw[key] === null || raw[key] === '') continue;
    const v = toFiniteNumber(raw[key]);
    if (Number.isFinite(v)) {
      volume = v;
      break;
    }
  }

  return { time, open, high, low, close, volume };
}

/**
 * 批量规范化，供 updateHistoryQuote 入队前一次性转换。
 * @param {Record<string, unknown>[]} list
 * @param {string[]} [volumeKeys]
 * @returns {NormalizedBar[]}
 */
export function normalizeBars(list, volumeKeys) {
  if (!Array.isArray(list)) return [];
  return list.map(row => normalizeBar(row, volumeKeys));
}
