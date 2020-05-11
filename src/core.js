
import { BLOCK_MARGIN, START_PRICE_INDEX, END_PRICE_INDEX, MIN_PRICE_INDEX, MAX_PRICE_INDEX, TIME_INDEX, LINE_WIDTH, TOP_SPACE, RIGHT_SPACE } from './constant';
import { computeTotalWidth, computeSpaceY, drawHorizontalLine, drawDash, transformOrigin, drawText, drawRect, drawLine, drawYPrice, drawCrossLine, processXDate } from './draw-tools';

/**
 * 更新图表数据 - 核心功能
 * 所有的绘制全部在这个方法里完成
 */
export default function updateData() {
  if (!this.dataArr.length) return;
  // 计算总宽度、以及Y坐标的报价区间等
  computeTotalWidth.call(this);
  computeSpaceY.call(this);
  this.ctx.save();
  // 把原点坐标向下方移动 TOP_SPACE 的距离，开始绘制水平线
  this.ctx.translate(0, TOP_SPACE * this.sharpness);
  drawHorizontalLine.call(this);
  // 把原点坐标再向左边移动 RIGHT_SPACE 的距离，开始绘制垂直线和蜡烛图
  this.ctx.translate(RIGHT_SPACE * this.sharpness, 0);
  // 开始绘制蜡烛图
  let item, col;
  let lineWidth = LINE_WIDTH * this.sharpness;
  let margin = BLOCK_MARGIN * this.sharpness;
  let blockMargin = margin;
  let blockWidth = this.blockWidth * this.sharpness; //乘上清晰度系数后的间距、块宽度
  let blockHeight, lineHeight, blockYPoint, lineYPoint; //单一方块、单一中间线的高度、y坐标点
  let realTime, realTimeYPoint; //实时(最后)报价及y坐标点
  for (let i = 0; i < this.dataArr.length; i++) {
    //如果不是第一个数据（第一个必须绘制，因为是实时报价线），且超出了可视范围，就跳出本次循环，不再绘制，节省性能
    if (i !== 0 && (margin < (this.movingRange - RIGHT_SPACE * 2) * this.sharpness || margin > this.movingRange * this.sharpness + this.canvas.width)) {
      margin = margin + blockWidth + blockMargin;
      continue;
    }
    item = this.dataArr[i];
    if (item[START_PRICE_INDEX] > item[END_PRICE_INDEX]) {
      //跌了 sell
      col = this.sellColor;
      blockHeight = (item[START_PRICE_INDEX] - item[END_PRICE_INDEX]) * this.perPricePixel;
      blockYPoint = (this.maxPrice - item[START_PRICE_INDEX]) * this.perPricePixel;
    } else {
      //涨了 buy
      col = this.buyColor;
      blockHeight = (item[END_PRICE_INDEX] - item[START_PRICE_INDEX]) * this.perPricePixel;
      blockYPoint = (this.maxPrice - item[END_PRICE_INDEX]) * this.perPricePixel;
    }
    lineHeight = (item[MAX_PRICE_INDEX] - item[MIN_PRICE_INDEX]) * this.perPricePixel;
    lineYPoint = (this.maxPrice - item[MAX_PRICE_INDEX]) * this.perPricePixel;
    //不能小于2px
    lineHeight = lineHeight > 2 * this.sharpness ? lineHeight : 2 * this.sharpness;
    blockHeight = blockHeight > 2 * this.sharpness ? blockHeight : 2 * this.sharpness;
    if (i === 0) {
      realTime = item[END_PRICE_INDEX];
      realTimeYPoint = blockYPoint + (item[START_PRICE_INDEX] > item[END_PRICE_INDEX] ? blockHeight : 0)
    }
    // 绘制垂直方向的参考线、以及x轴的日期时间
    if (i % this.xDateSpace === (this.fromSpaceNum % this.xDateSpace)) {
      drawDash.call(this, margin + (blockWidth - 1 * this.sharpness) / 2, 0, margin + (blockWidth - 1 * this.sharpness) / 2, this.centerSpace);
      this.ctx.save();
      // 填充文字时需要把canvas的转换还原回来，防止文字翻转变形
      transformOrigin.call(this);
      // 翻转后将原点移回翻转前的位置
      this.ctx.translate(this.canvas.width, 0);
      drawText.call(this, processXDate(item[TIME_INDEX], this.dataType), -(margin + (blockWidth - 1 * this.sharpness) / 2), this.centerSpace + 12 * this.sharpness, undefined, 'center', 'top');
      this.ctx.restore();
    }
    // 绘制蜡烛模块
    drawRect.call(this, margin + (blockWidth - 1 * this.sharpness) / 2, lineYPoint, lineWidth, lineHeight, col);
    drawRect.call(this, margin, blockYPoint, blockWidth, blockHeight, col);
    // 重新赋值margin, 准备下次绘制
    margin = margin + blockWidth + blockMargin;
  }
  //绘制实时报价线、价格
  drawLine.call(this, (this.movingRange - RIGHT_SPACE) * this.sharpness, realTimeYPoint, (this.movingRange - RIGHT_SPACE) * this.sharpness + this.canvas.width, realTimeYPoint, '#cccccc');
  this.ctx.save();
  this.ctx.translate(-RIGHT_SPACE * this.sharpness, 0);
  transformOrigin.call(this);
  drawRect.call(this, (17 - this.movingRange) * this.sharpness, realTimeYPoint - 10 * this.sharpness, this.ctx.measureText(realTime).width + 6 * this.sharpness, 20 * this.sharpness, "#cccccc");
  drawText.call(this, realTime, (20 - this.movingRange) * this.sharpness, realTimeYPoint);
  this.ctx.restore();
  //最后绘制y轴上报价，放在最上层
  this.ctx.translate(-RIGHT_SPACE * this.sharpness, 0);
  drawYPrice.call(this);
  this.ctx.restore();
  //最后再加上十字线
  drawCrossLine.call(this);
}