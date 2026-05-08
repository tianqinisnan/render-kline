import { BLOCK_MARGIN, BOTTOM_SPACE, TOP_SPACE, RIGHT_SPACE } from './constant.js';
import { toDou, getDate } from './utils.js';

// 切换坐标系走向 (原点在左上角 or 右上角)；像素宽使用 plotWidth（多 layer 时与各 canvas 缓冲一致）
export function transformOrigin () {
  this.ctx.translate(this.plotWidth, 0);
  this.ctx.scale(-1, 1);
}
// 计算minPrice & maxPrice
export function computeSpaceY () {
  this.minPrice = 9999999;
  this.maxPrice = 0;
  //根据当前可视区域的方块计算报价范围
  let start = Math.floor((this.movingRange - RIGHT_SPACE)/(this.blockWidth+BLOCK_MARGIN));
  start = start > 0 ? start : 0;
  let end = Math.ceil(this.plotWidth / ((this.blockWidth + BLOCK_MARGIN) * this.sharpness)) + 1 + start;
  end = end > this.dataArr.length ? this.dataArr.length : end;
  let newArr = this.dataArr.slice(start, end);
  // 可视区内仅遍历规范化 K 线，用数值 OHLC 求纵轴范围（含影线 high/low）
  for (let i = 0; i < newArr.length; i++) {
    const b = newArr[i];
    this.minPrice = Math.min(this.minPrice, b.open, b.close, b.low);
    this.maxPrice = Math.max(this.maxPrice, b.open, b.close, b.high);
  }
  
  let extendPrice = (this.maxPrice - this.minPrice)/20;
  //最小、最大值分别延伸 1/20 的范围
  this.minPrice = (parseFloat(this.minPrice) - extendPrice).toFixed(this.digitsPoint);
  this.maxPrice = (parseFloat(this.maxPrice) + extendPrice).toFixed(this.digitsPoint);
  // diffPrice & perPricePixel（仅主图高度映射 OHLC，副图高度另算成交量等）
  this.diffPrice = this.maxPrice - this.minPrice;
  this.perPricePixel = this.mainPlotHeight / this.diffPrice;
}

/**
 * 副图成交量纵向比例：仅按当前可视范围内的 K 线取 max(volume)，与 computeSpaceY 切片口径一致。
 */
export function computeVolumeScale(instance) {
  let start = Math.floor((instance.movingRange - RIGHT_SPACE) / (instance.blockWidth + BLOCK_MARGIN));
  start = start > 0 ? start : 0;
  let end = Math.ceil(instance.plotWidth / ((instance.blockWidth + BLOCK_MARGIN) * instance.sharpness)) + 1 + start;
  end = end > instance.dataArr.length ? instance.dataArr.length : end;

  let maxV = 0;
  for (let i = start; i < end; i++) {
    const v = instance.dataArr[i].volume;
    if (Number.isFinite(v) && v > maxV) maxV = v;
  }
  instance.maxVolumeVisible = maxV > 0 ? maxV : 1;

  const pad = 2 * instance.sharpness;
  instance.volumeBarMaxHeight = Math.max(instance.subPlotHeight - pad, instance.sharpness);
  instance.perVolumePixel = instance.volumeBarMaxHeight / instance.maxVolumeVisible;
}

// 计算totalWidth
export function computeTotalWidth () {
  this.totalWidth = (this.dataArr.length * (BLOCK_MARGIN + this.blockWidth) + RIGHT_SPACE) * this.sharpness;
}

// 绘制图表水平线；坐标原点在 (0, TOP_SPACE)。主图区内画网格，底部画满 centerSpace（含预留副图高度）
export function drawHorizontalLine () {
  this.ctx.save();
  // 所有水平线和报价不需要移动, 需要把原点固定
  this.ctx.translate(this.movingRange * this.sharpness, 0);
  const w = this.plotWidth;
  const mainH = this.mainPlotHeight;
  const fullH = this.centerSpace;
  // 主图底部分割线（与副图分界）
  drawLine.call(this, 0, mainH, w, mainH);
  // 整个绘图区底边（时间轴上方）
  drawLine.call(this, 0, fullH, w, fullH);
  // 主图顶边
  drawLine.call(this, 0, 0, w, 0);
  let perPixel = mainH / this.horizontalCells;
  for (let i = 1; i < this.horizontalCells; i++) {
    drawDash.call(this, 0, parseInt(perPixel * i), w, parseInt(perPixel * i));
  }
  this.ctx.restore();
}
// 绘制y轴上的报价
export function drawYPrice () {
  this.ctx.save();
  // 所有水平线和报价不需要移动
  this.ctx.translate(this.movingRange * this.sharpness, 0);
  // 填充文字时需要把canvas的转换还原回来，防止文字翻转变形
  transformOrigin.call(this);
  // 再将原点切到右侧
  this.ctx.translate(this.plotWidth - RIGHT_SPACE * this.sharpness, 0);
  let perPrice = this.diffPrice / this.horizontalCells; //相邻水平参考线间隔报价
  let perPixel = this.mainPlotHeight / this.horizontalCells; // 与主图网格对齐
  for (let i=0; i<this.horizontalCells+1; i++) {
    // y轴上的报价
    drawText.call(this, (this.maxPrice - perPrice*i).toFixed(this.digitsPoint), 0, parseInt(perPixel*i), RIGHT_SPACE * this.sharpness)
  }
  this.ctx.restore();
}
// 根据updateDate 中的 type类型，处理x轴的时间格式
export function processXDate (timestamp, type) {
  type = Number(type);
  let dateOrigin = getDate(timestamp);
  if (type === 43200) {
    //月
    return dateOrigin.year + '-' + toDou(dateOrigin.month);
  } else if (type === 1440 || type === 10080) {
    //日、周
    return toDou(dateOrigin.month) + '-' + toDou(dateOrigin.date);
  } else {
    //其他
    return toDou(dateOrigin.hours) + ':' + toDou(dateOrigin.minutes);
  }
}
// 绘制方块
export function drawRect (x, y, width, height, color) {
  this.ctx.beginPath();
  this.ctx.rect(parseInt(x), parseInt(y), parseInt(width), parseInt(height));
  this.ctx.fillStyle = color;
  this.ctx.fill();
  this.ctx.closePath();
}
// 画直线
export function drawLine (startX, startY, endX, endY, color) {
  this.ctx.save();
  this.ctx.strokeStyle = color || this.lineColor;
  this.ctx.beginPath();
  this.ctx.moveTo(startX, startY);
  this.ctx.lineTo(endX, endY);
  this.ctx.stroke();
  this.ctx.closePath();
  this.ctx.restore();
}
// 画虚线
export function drawDash (startX, startY, endX, endY, color) {
  this.ctx.save();
  this.ctx.setLineDash([5*this.sharpness,2*this.sharpness]);
  this.ctx.strokeStyle = color || this.lineColor;
  this.ctx.beginPath();
  this.ctx.moveTo(startX, startY);
  this.ctx.lineTo(endX, endY);
  this.ctx.stroke();
  this.ctx.closePath();
  this.ctx.restore();
}
// 文字的渲染
export function drawText (str, x, y, maxLen, textAlign = 'left', textBaseline = 'middle') {
  this.ctx.fillStyle = this.fontColor;
  this.ctx.textAlign = textAlign;
  this.ctx.textBaseline = textBaseline;
  this.ctx.fillText(str, x, y, maxLen);
}

// 十字线仅在 overlay 层绘制；命中区域与坐标换算依赖 hitTarget（与画布同尺寸的容器或顶层 canvas）
export function drawCrossLine () {
  if (!this.crossLineStatus || !this.event) return;
  const hitEl = this.hitTarget || this.layerRoot;
  const cRect = hitEl.getBoundingClientRect();
  let x = this.plotWidth - (this.event.clientX - cRect.left - this.movingRange) * this.sharpness;
  let y = (this.event.clientY - cRect.top) * this.sharpness;
  if (y < TOP_SPACE * this.sharpness || y > this.plotHeight - BOTTOM_SPACE * this.sharpness) return;
  const w = this.plotWidth;
  drawDash.call(this, this.movingRange * this.sharpness, y, w + this.movingRange * this.sharpness, y, '#999999');
  drawDash.call(this, x, TOP_SPACE * this.sharpness, x, this.plotHeight - BOTTOM_SPACE * this.sharpness, '#999999');
  const plotLocalY = y - TOP_SPACE * this.sharpness;
  // 仅主图区内显示右侧价位悬浮（副图区为成交量，不设价位悬浮）
  if (plotLocalY < 0 || plotLocalY > this.mainPlotHeight) return;
  const str = (this.maxPrice - plotLocalY / this.perPricePixel).toFixed(this.digitsPoint);
  this.ctx.save();
  this.ctx.translate(this.movingRange * this.sharpness, 0);
  transformOrigin.call(this);
  this.ctx.translate(this.plotWidth - RIGHT_SPACE * this.sharpness, 0);
  drawRect.call(this, -3 * this.sharpness, y - 10 * this.sharpness, this.ctx.measureText(str).width + 6 * this.sharpness, 20 * this.sharpness, '#E59137');
  drawText.call(this, str, 0, y, RIGHT_SPACE * this.sharpness);
  this.ctx.restore();
}
