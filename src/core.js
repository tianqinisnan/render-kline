import { BLOCK_MARGIN, LINE_WIDTH, TOP_SPACE, RIGHT_SPACE } from './constant.js';
import {
  computeTotalWidth,
  computeSpaceY,
  computeVolumeScale,
  drawHorizontalLine,
  drawDash,
  transformOrigin,
  drawText,
  drawRect,
  drawLine,
  drawYPrice,
  drawCrossLine,
  processXDate
} from './draw-tools.js';
import { DIRTY_FULL } from './scheduler.js';
import { runComputeIndicators, runDrawMainIndicators } from './indicators/registry.js';

/**
 * 单层绘制前恢复与历史单 canvas 一致的坐标系：翻转 X + 横向滚动。
 */
export function resetLayerTransform(instance, ctx) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(instance.plotWidth, 0);
  ctx.scale(-1, 1);
  ctx.translate(-instance.movingRange * instance.sharpness, 0);
}

/** 网格层：水平参考线、纵向虚线、时间文字（在 K 线之下） */
function drawGridLayer(instance) {
  instance.ctx = instance.ctxGrid;
  const ctx = instance.ctxGrid;
  ctx.save();
  resetLayerTransform(instance, ctx);
  ctx.translate(0, TOP_SPACE * instance.sharpness);
  drawHorizontalLine.call(instance);
  ctx.translate(RIGHT_SPACE * instance.sharpness, 0);

  let margin = BLOCK_MARGIN * instance.sharpness;
  const blockMargin = margin;
  const blockWidth = instance.blockWidth * instance.sharpness;
  const mainH = instance.mainPlotHeight;

  for (let i = 0; i < instance.dataArr.length; i++) {
    if (i !== 0 && (margin < (instance.movingRange - RIGHT_SPACE * 2) * instance.sharpness || margin > instance.movingRange * instance.sharpness + instance.plotWidth)) {
      margin += blockWidth + blockMargin;
      continue;
    }
    const item = instance.dataArr[i];
    if (i % instance.xDateSpace === (instance.fromSpaceNum % instance.xDateSpace)) {
      const cx = margin + (blockWidth - 1 * instance.sharpness) / 2;
      drawDash.call(instance, cx, 0, cx, mainH);
      ctx.save();
      transformOrigin.call(instance);
      ctx.translate(instance.plotWidth, 0);
      drawText.call(
        instance,
        processXDate(item.time, instance.dataType),
        -cx,
        instance.centerSpace + 12 * instance.sharpness,
        undefined,
        'center',
        'top'
      );
      ctx.restore();
    }
    margin += blockWidth + blockMargin;
  }
  ctx.restore();
}

/** 主图层：蜡烛、实时价线与标签、右侧 Y 轴报价 */
function drawMainLayer(instance) {
  instance.ctx = instance.ctxMain;
  const ctx = instance.ctxMain;
  ctx.save();
  resetLayerTransform(instance, ctx);
  ctx.translate(0, TOP_SPACE * instance.sharpness);
  ctx.translate(RIGHT_SPACE * instance.sharpness, 0);

  const lineWidth = LINE_WIDTH * instance.sharpness;
  let margin = BLOCK_MARGIN * instance.sharpness;
  const blockMargin = margin;
  const blockWidth = instance.blockWidth * instance.sharpness;
  let realTime;
  let realTimeYPoint;

  for (let i = 0; i < instance.dataArr.length; i++) {
    if (i !== 0 && (margin < (instance.movingRange - RIGHT_SPACE * 2) * instance.sharpness || margin > instance.movingRange * instance.sharpness + instance.plotWidth)) {
      margin += blockWidth + blockMargin;
      continue;
    }
    const item = instance.dataArr[i];
    let col;
    let blockHeight;
    let blockYPoint;
    let lineHeight;
    let lineYPoint;

    if (item.open > item.close) {
      col = instance.sellColor;
      blockHeight = (item.open - item.close) * instance.perPricePixel;
      blockYPoint = (instance.maxPrice - item.open) * instance.perPricePixel;
    } else {
      col = instance.buyColor;
      blockHeight = (item.close - item.open) * instance.perPricePixel;
      blockYPoint = (instance.maxPrice - item.close) * instance.perPricePixel;
    }
    lineHeight = (item.high - item.low) * instance.perPricePixel;
    lineYPoint = (instance.maxPrice - item.high) * instance.perPricePixel;
    lineHeight = lineHeight > 2 * instance.sharpness ? lineHeight : 2 * instance.sharpness;
    blockHeight = blockHeight > 2 * instance.sharpness ? blockHeight : 2 * instance.sharpness;

    if (i === 0) {
      realTime = item.close;
      realTimeYPoint = blockYPoint + (item.open > item.close ? blockHeight : 0);
    }

    drawRect.call(instance, margin + (blockWidth - 1 * instance.sharpness) / 2, lineYPoint, lineWidth, lineHeight, col);
    drawRect.call(instance, margin, blockYPoint, blockWidth, blockHeight, col);
    margin += blockWidth + blockMargin;
  }

  instance.ctx = ctx;
  runDrawMainIndicators(instance, ctx);

  drawLine.call(
    instance,
    (instance.movingRange - RIGHT_SPACE) * instance.sharpness,
    realTimeYPoint,
    (instance.movingRange - RIGHT_SPACE) * instance.sharpness + instance.plotWidth,
    realTimeYPoint,
    '#cccccc'
  );
  ctx.save();
  ctx.translate(-RIGHT_SPACE * instance.sharpness, 0);
  transformOrigin.call(instance);
  drawRect.call(
    instance,
    (17 - instance.movingRange) * instance.sharpness,
    realTimeYPoint - 10 * instance.sharpness,
    ctx.measureText(realTime).width + 6 * instance.sharpness,
    20 * instance.sharpness,
    '#cccccc'
  );
  drawText.call(instance, realTime, (20 - instance.movingRange) * instance.sharpness, realTimeYPoint);
  ctx.restore();

  ctx.translate(-RIGHT_SPACE * instance.sharpness, 0);
  drawYPrice.call(instance);
  ctx.restore();
}

/** 副图层：成交量柱，与主图蜡烛同一套 margin / 可视剔除；纵向铺满 subPlotHeight（留少量底边距） */
function drawSubLayer(instance) {
  if (!instance.showVolume) return;

  instance.ctx = instance.ctxSub;
  const ctx = instance.ctxSub;
  ctx.save();
  resetLayerTransform(instance, ctx);
  ctx.translate(0, TOP_SPACE * instance.sharpness);
  ctx.translate(RIGHT_SPACE * instance.sharpness, 0);

  const mainTop = instance.mainPlotHeight;
  const subBottom = mainTop + instance.subPlotHeight;

  let margin = BLOCK_MARGIN * instance.sharpness;
  const blockMargin = margin;
  const blockWidth = instance.blockWidth * instance.sharpness;

  for (let i = 0; i < instance.dataArr.length; i++) {
    if (i !== 0 && (margin < (instance.movingRange - RIGHT_SPACE * 2) * instance.sharpness || margin > instance.movingRange * instance.sharpness + instance.plotWidth)) {
      margin += blockWidth + blockMargin;
      continue;
    }
    const item = instance.dataArr[i];
    const vol = Number.isFinite(item.volume) ? item.volume : 0;
    let barH = vol * instance.perVolumePixel;
    if (vol > 0 && barH < 1 * instance.sharpness) {
      barH = 1 * instance.sharpness;
    }
    const col = item.open > item.close ? instance.volumeDownColor : instance.volumeUpColor;
    const yTop = subBottom - barH;
    drawRect.call(instance, margin, yTop, blockWidth, barH, col);
    margin += blockWidth + blockMargin;
  }

  ctx.restore();
}

function drawOverlayLayer(instance) {
  instance.ctx = instance.ctxOverlay;
  const ctx = instance.ctxOverlay;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  resetLayerTransform(instance, ctx);
  drawCrossLine.call(instance);
}

/**
 * 全量重绘：清四层 → 网格 → 主图 → 副图占位 → 十字线。
 */
export function drawFull(instance) {
  if (!instance.dataArr.length) return;
  computeTotalWidth.call(instance);
  computeSpaceY.call(instance);
  if (instance.showVolume) {
    computeVolumeScale(instance);
  }
  runComputeIndicators(instance);

  const keys = ['ctxGrid', 'ctxMain', 'ctxSub', 'ctxOverlay'];
  for (let k = 0; k < keys.length; k++) {
    const ctx = instance[keys[k]];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, instance.plotWidth, instance.plotHeight);
  }

  drawGridLayer(instance);
  drawMainLayer(instance);
  drawSubLayer(instance);
  drawOverlayLayer(instance);
}

/**
 * 仅重绘 overlay：清除十字线残影；逻辑与单 canvas 时代「resetCanvas + 只画十字线」不同，不再动底层像素。
 */
export function redrawOverlay(instance) {
  if (!instance.dataArr.length) return;
  const ctx = instance.ctxOverlay;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, instance.plotWidth, instance.plotHeight);
  drawOverlayLayer(instance);
}

/**
 * 数据或视口变化时请求全量重绘（由调度器合并到 rAF）。
 */
export default function updateData() {
  this.markDirty(DIRTY_FULL);
}
