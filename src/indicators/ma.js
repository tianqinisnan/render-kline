/**
 * 简单移动平均线（SMA）：收盘价序列。
 * dataArr 约定 index 0 为最新一根，index 增大指向更历史 K 线。
 */
import { BLOCK_MARGIN, LINE_WIDTH, RIGHT_SPACE } from '../constant.js';

const DEFAULT_MA_COLORS = ['#F5A623', '#9013FE', '#4A90E2', '#00B8D4', '#7CB342'];

/**
 * @param {{ close: number }[]} bars
 * @param {number} period 周期，正整数
 * @returns {(number|null)[]} 与 bars 等长；仅当连续 period 根均有数据时，从 index 0 起往后填充 SMA，末尾不足窗口的为 null
 */
export function computeMA(bars, period) {
  const n = bars.length;
  const out = new Array(n).fill(null);
  const p = Math.floor(period);
  if (!Number.isFinite(p) || p < 1 || n < p) return out;
  for (let i = 0; i <= n - p; i++) {
    let sum = 0;
    for (let j = 0; j < p; j++) sum += bars[i + j].close;
    out[i] = sum / p;
  }
  return out;
}

function barMargin(instance, i) {
  const s = instance.sharpness;
  const bm = BLOCK_MARGIN * s;
  const bw = instance.blockWidth * s;
  return bm + i * (bw + bm);
}

function barCenterX(instance, i) {
  const s = instance.sharpness;
  const bw = instance.blockWidth * s;
  return barMargin(instance, i) + (bw - s) / 2;
}

/** 与主图蜡烛相同的可视剔除规则（首根始终参与逻辑坐标） */
function isBarVisible(instance, i) {
  const m = barMargin(instance, i);
  const s = instance.sharpness;
  if (i === 0) return true;
  return !(
    m < (instance.movingRange - RIGHT_SPACE * 2) * s ||
    m > instance.movingRange * s + instance.plotWidth
  );
}

/**
 * 写入 instance._computedIndicators.ma：{ [period]: (number|null)[] }
 */
export function computeMAIndicators(instance) {
  const periods = instance.maPeriods;
  if (!periods || !periods.length) {
    instance._computedIndicators = instance._computedIndicators || {};
    instance._computedIndicators.ma = {};
    return;
  }
  const bars = instance.dataArr;
  const ma = {};
  for (let k = 0; k < periods.length; k++) {
    const p = periods[k];
    ma[p] = computeMA(bars, p);
  }
  instance._computedIndicators = instance._computedIndicators || {};
  instance._computedIndicators.ma = ma;
}

/**
 * 在主图层、与蜡烛同一坐标系下绘制均线（使用当前 min/max 价格轴，不单独缩放）。
 */
export function drawMAOnMain(instance, ctx) {
  const pack = instance._computedIndicators && instance._computedIndicators.ma;
  const periods = instance.maPeriods;
  if (!pack || !periods || !periods.length) return;

  const n = instance.dataArr.length;
  const maxP = Number(instance.maxPrice);
  const s = instance.sharpness;

  for (let pi = 0; pi < periods.length; pi++) {
    const period = periods[pi];
    const vals = pack[period];
    if (!vals) continue;
    const color =
      (instance.maColors && instance.maColors[pi]) ||
      DEFAULT_MA_COLORS[pi % DEFAULT_MA_COLORS.length];

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, LINE_WIDTH * s);
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let started = false;

    for (let i = 0; i < n - 1; i++) {
      if (!isBarVisible(instance, i) || !isBarVisible(instance, i + 1)) {
        started = false;
        continue;
      }
      if (vals[i] == null || vals[i + 1] == null) {
        started = false;
        continue;
      }
      const x1 = barCenterX(instance, i);
      const y1 = (maxP - vals[i]) * instance.perPricePixel;
      const x2 = barCenterX(instance, i + 1);
      const y2 = (maxP - vals[i + 1]) * instance.perPricePixel;
      if (!started) {
        ctx.moveTo(x1, y1);
        started = true;
      }
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    ctx.restore();
  }
}

export { DEFAULT_MA_COLORS };
