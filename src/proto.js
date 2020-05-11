
import { LINE_WIDTH, BOTTOM_SPACE, TOP_SPACE, RIGHT_SPACE, TIME_INDEX } from './constant';
import { computeTotalWidth, transformOrigin } from './draw-tools';
import updateData from './core';

export default function (klineProto) {
  klineProto.prototype.resetCanvas = function() {
    this.canvas.width = this.actualWidth * this.sharpness;
    this.canvas.height = this.actualHeight * this.sharpness;
    this.canvas.style.height = this.canvas.height / this.sharpness + 'px';
    this.canvas.style.width = this.canvas.width / this.sharpness + 'px';
    this.centerSpace = this.canvas.height - (BOTTOM_SPACE + TOP_SPACE) * this.sharpness;
    // 将canvas原点坐标转换到右上角
    transformOrigin.call(this);
    // base settings
    this.ctx.lineWidth = LINE_WIDTH*this.sharpness;
    this.ctx.font = `${12*this.sharpness}px Arial`;
    // 还原之前滚动的距离
    this.ctx.translate(-this.movingRange * this.sharpness, 0);
  };
  /**
   * 加载loading.gif & 更多数据
   * @params location - loading的位置 - center/left/right 默认center
   */
  klineProto.prototype.loading = function (location = 'center') {
    if (this.loadingStatus) return;
    let locationStyles = {
      center: 'left: 50%;margin-left: -10px;',
      left: 'left: 10px;',
      right: `right: ${RIGHT_SPACE}px`
    };
    let text = document.createElement('span');
    text.innerHTML = 'loading...';
    text.style = `position: absolute;top: 50%;margin-top: -10px;width: 20px;opacity: .8;${locationStyles[location]}`
    this.cBox.appendChild(text);
    this.loadingStatus = true;
    //如果需要加载更多，就调用callback
    if (location === 'left' && this.callbackMore) {
      this.callbackMore();
    }
    //首次加载或切换type类型，从头绘制数据
    if (location === 'center') {
      this.fromSpaceNum = 0;
      this.movingRange = 0;
      this.resetCanvas();
    }
  }
  // 切换清晰度
  klineProto.prototype.changeSharpness = function (sharpness) {
    if (this.loadingStatus) return;
    this.sharpness = sharpness;
    this.processParams();
    this.resetCanvas();
    updateData.call(this);
  }
  /**
   * 缩放图表 
   * @param {int} scaleTimes 缩放倍数
   *  正数为放大，负数为缩小，数值*2 代表蜡烛图width的变化度
   *  eg:  2 >> this.blockWidth + 2*2  
   *      -3 >> this.blockWidth - 3*2
   * 为了保证缩放的效果，
   * 应该以当前可视区域的中心为基准缩放
   * 所以缩放前后两边的长度在总长度中所占比例应该一样
   * 公式：(oldRange+0.5*canvasWidth)/oldTotalLen = (newRange+0.5*canvasWidth)/newTotalLen
   * 推导出： newRange = (oldRange*newTotalLen + 0.5*canvasWidth*newTotalLen - 0.5*canvasWidth*oldTotalLen)/oldTotalLen
   * 因此需要移动的范围是： diffRange = newRange - oldRange (可正可负，取决于视图是 放大or缩小)
   */
  klineProto.prototype.scaleKLine = function (scaleTimes) {
    if (this.loadingStatus) return;
    let oldTotalLen = this.totalWidth;
    this.blockWidth += scaleTimes*2;
    this.processParams();
    // 根据新blockWidth, 先重新计算总宽度
    computeTotalWidth.call(this);
    // 再根据推导公式计算出diffRange, 也就是需要移动的距离
    let newRange = (this.movingRange*this.sharpness*this.totalWidth+this.canvas.width/2*this.totalWidth-this.canvas.width/2*oldTotalLen)/oldTotalLen/this.sharpness;
    let diffRange = newRange - this.movingRange;
    // 最后调用函数去移动图表, 重新绘制
    this.translateKLine(diffRange);
  }
  // 移动图表
  // range - 需要移动的距离，向右为正，向左为负
  klineProto.prototype.translateKLine = function (range) {
    if (this.loadingStatus) return;
    this.movingRange += parseInt(range);
    let maxMovingRange =  (this.totalWidth - this.canvas.width) / this.sharpness + this.blockWidth;
    if (this.totalWidth <= this.canvas.width || this.movingRange <= 0) {
      // 到了最右边
      this.movingRange = 0;
    } else if (this.movingRange >= maxMovingRange) {
      // 到了最左边 - 可以加载更多历史数据
      this.movingRange = maxMovingRange;
      this.loading('left');
    }
    this.resetCanvas();
    updateData.call(this);
  }
  // 切换十字线状态 status 1显示 0不显示
  klineProto.prototype.changeCrossLineStatus = function (status) {
    this.crossLineStatus = status ? true : false;
  }
  // 实时报价
  klineProto.prototype.updateRealTimeQuote = function (quote) {
    if (!quote) return;
    pushQuoteInData.call(this, quote);
  }
  /**
   * 历史报价
   * @param {Array} data 数据
   * @param {int}   type 报价类型  默认 60(1小时)
   *    (1, 5, 15, 30, 60, 240, 1440, 10080, 43200)
   *    (1分钟 5分钟 15分钟 30分钟 1小时 4小时 日 周 月)
   * @param {Boolean} reloadData 是否重新加载数据
   * @param {Fn} callback 回调函数 加载更多数据
   */
  klineProto.prototype.updateHistoryQuote = function ({data, type = 60, reloadData = false, callback}) {
    if (reloadData) this.dataArr = [];
    this.callbackMore = callback;
    let spanList = this.cBox.getElementsByTagName('span');
    // 使用循环删除 span
    for (let span of spanList) {
      this.cBox.removeChild(span);
    }
    this.loadingStatus = false;
    if (!(data instanceof Array) || !data.length) return;
    this.dataArr = this.dataArr.concat(data);
    this.dataType = type;
    updateData.call(this);
  }
}
// 把实时报价对接到历史报价数据(dataArr)中
function pushQuoteInData (quote) {
  if (this.loadingStatus) return;
  this.lastDataTimestamp = this.lastDataTimestamp || this.dataArr[0][TIME_INDEX];
  let diffMinutes = (quote[TIME_INDEX] - this.lastDataTimestamp) / 60; //当前的实时报价比较上一个报价多出的分钟数
  if (diffMinutes >= this.dataType) {
    // 若超过 dataType 时间另开一条数据，并更新 lastDataTimestamp
    this.dataArr.unshift(quote);
    this.lastDataTimestamp = quote[TIME_INDEX];
    this.fromSpaceNum++;
  } else {
    this.dataArr.splice(0, 1, quote)
  }
  this.resetCanvas();
  updateData.call(this);
}