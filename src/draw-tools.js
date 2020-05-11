
import { BLOCK_MARGIN, START_PRICE_INDEX, END_PRICE_INDEX, MIN_PRICE_INDEX, MAX_PRICE_INDEX, BOTTOM_SPACE, TOP_SPACE, RIGHT_SPACE } from './constant';
import { toDou, getDate } from './utils';

// 切换坐标系走向 (原点在左上角 or 右上角)
export function transformOrigin () {
  this.ctx.translate(this.canvas.width, 0);
  this.ctx.scale(-1, 1);
}
// 计算minPrice & maxPrice
export function computeSpaceY () {
  this.minPrice = 9999999;
  this.maxPrice = 0;
  //根据当前可视区域的方块计算报价范围
  let start = Math.floor((this.movingRange - RIGHT_SPACE)/(this.blockWidth+BLOCK_MARGIN));
  start = start > 0 ? start : 0;
  let end = Math.ceil(this.canvas.width / ((this.blockWidth + BLOCK_MARGIN) * this.sharpness)) + 1 + start;
  end = end > this.dataArr.length ? this.dataArr.length : end;
  let newArr = this.dataArr.slice(start, end);
  for (let i=0; i<newArr.length; i++) {
    this.minPrice = Math.min(this.minPrice, newArr[i][START_PRICE_INDEX], newArr[i][END_PRICE_INDEX], newArr[i][MIN_PRICE_INDEX]);
    this.maxPrice = Math.max(this.maxPrice, newArr[i][START_PRICE_INDEX], newArr[i][END_PRICE_INDEX], newArr[i][MAX_PRICE_INDEX]);
  }
  
  let extendPrice = (this.maxPrice - this.minPrice)/20;
  //最小、最大值分别延伸 1/20 的范围
  this.minPrice = (parseFloat(this.minPrice) - extendPrice).toFixed(this.digitsPoint);
  this.maxPrice = (parseFloat(this.maxPrice) + extendPrice).toFixed(this.digitsPoint);
  //diffPrice & perPricePixel
  this.diffPrice = this.maxPrice - this.minPrice;
  this.perPricePixel = this.centerSpace / this.diffPrice;
}
// 计算totalWidth
export function computeTotalWidth () {
  this.totalWidth = (this.dataArr.length * (BLOCK_MARGIN + this.blockWidth) + RIGHT_SPACE) * this.sharpness;
}

// 绘制图表水平线,坐标原点在 (0, TOP_SPACE)
export function drawHorizontalLine () {
  this.ctx.save();
  // 所有水平线和报价不需要移动, 需要把原点固定
  this.ctx.translate(this.movingRange * this.sharpness, 0);
  // x轴
  drawLine.call(this, 0, this.centerSpace, this.canvas.width, this.centerSpace);
  // 水平方向参考线
  drawLine.call(this, 0, 0, this.canvas.width, 0);
  let perPixel = this.centerSpace / this.horizontalCells; //相邻水平参考线间隔像素值
  for (let i=1; i<this.horizontalCells; i++) {
    drawDash.call(this, 0, parseInt(perPixel*i), this.canvas.width, parseInt(perPixel*i));
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
  this.ctx.translate(this.canvas.width - RIGHT_SPACE * this.sharpness, 0);
  let perPrice = this.diffPrice / this.horizontalCells; //相邻水平参考线间隔报价
  let perPixel = this.centerSpace / this.horizontalCells; //相邻水平参考线间隔像素值
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

//画十字线
export function drawCrossLine () {
  if (!this.crossLineStatus || !this.event) return;
  // getBoundingClientRect 返回一个矩形对象，存有四个属性，left、top、right和bottom。分别表示元素四条边与页面上边或左边的距离。
  let cRect = this.canvas.getBoundingClientRect();
  //layerX 有兼容性问题，使用clientX
  let x = this.canvas.width - (this.event.clientX - cRect.left - this.movingRange) * this.sharpness;
  let y = (this.event.clientY - cRect.top) * this.sharpness;
  // 在报价范围内画线
  if (y < TOP_SPACE*this.sharpness || y > this.canvas.height - BOTTOM_SPACE * this.sharpness) return;
  drawDash.call(this, this.movingRange * this.sharpness, y, this.canvas.width+this.movingRange * this.sharpness, y, '#999999');
  drawDash.call(this, x, TOP_SPACE*this.sharpness, x, this.canvas.height - BOTTOM_SPACE*this.sharpness, '#999999');
  //报价
  this.ctx.save();
  this.ctx.translate(this.movingRange * this.sharpness, 0);
  // 填充文字时需要把canvas的转换还原回来，防止文字翻转变形
  let str = (this.maxPrice - (y - TOP_SPACE * this.sharpness) / this.perPricePixel).toFixed(this.digitsPoint);
  transformOrigin.call(this);
  this.ctx.translate(this.canvas.width - RIGHT_SPACE * this.sharpness, 0);
  drawRect.call(this, -3*this.sharpness, y-10*this.sharpness, this.ctx.measureText(str).width+6*this.sharpness, 20*this.sharpness, "#cccccc");
  drawText.call(this, str, 0, y, RIGHT_SPACE * this.sharpness)
  this.ctx.restore();
}
