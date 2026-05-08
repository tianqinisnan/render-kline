/**
 * 实例方法挂载。历史/实时数据在写入 this.dataArr 前经 normalize-bar 转为统一结构，与 core / draw-tools 约定一致。
 */
import { RIGHT_SPACE } from './constant.js';
import { normalizeBar, normalizeBars } from './model/normalize-bar.js';
import { computeTotalWidth } from './draw-tools.js';
import { resizeAllLayers, disconnectResizeObserver } from './layers/resize-layers.js';
import { detachChartInteractions } from './event.js';
import updateData from './core.js';
import { DIRTY_OVERLAY } from './scheduler.js';

export default function (klineProto) {
  /**
   * 同步所有分层 canvas 的像素尺寸与字体线宽（容器变化、sharpness 变化时调用）。
   * 不在拖拽/十字线移动时每帧调用，避免缓冲反复重建。
   */
  klineProto.prototype.resetCanvas = function() {
    resizeAllLayers(this);
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
    let newRange = (this.movingRange*this.sharpness*this.totalWidth+this.plotWidth/2*this.totalWidth-this.plotWidth/2*oldTotalLen)/oldTotalLen/this.sharpness;
    let diffRange = newRange - this.movingRange;
    // 最后调用函数去移动图表, 重新绘制
    this.translateKLine(diffRange);
  }
  // 移动图表
  // range - 需要移动的距离，向右为正，向左为负
  klineProto.prototype.translateKLine = function (range) {
    if (this.loadingStatus) return;
    this.movingRange += parseInt(range);
    let maxMovingRange =  (this.totalWidth - this.plotWidth) / this.sharpness + this.blockWidth;
    if (this.totalWidth <= this.plotWidth || this.movingRange <= 0) {
      // 到了最右边
      this.movingRange = 0;
    } else if (this.movingRange >= maxMovingRange) {
      // 到了最左边 - 可以加载更多历史数据
      this.movingRange = maxMovingRange;
      this.loading('left');
    }
    updateData.call(this);
  }
  // 切换十字线状态 status 1显示 0不显示
  klineProto.prototype.changeCrossLineStatus = function (status) {
    this.crossLineStatus = status ? true : false;
    if (typeof this.markDirty === 'function') this.markDirty(DIRTY_OVERLAY);
  };
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
    if (reloadData) {
      this.dataArr = [];
      // 全量重拉时与旧时间轴脱钩，避免实时合并仍引用上一批数据的 lastDataTimestamp
      this.lastDataTimestamp = undefined;
    }
    this.callbackMore = callback;
    let spanList = this.cBox.getElementsByTagName('span');
    // 使用循环删除 span
    for (let span of spanList) {
      this.cBox.removeChild(span);
    }
    this.loadingStatus = false;
    if (!(data instanceof Array) || !data.length) return;
    // 接口原始行 → { time, open, high, low, close, volume }，再拼入内存（与 pushQuoteInData 结构一致）
    this.dataArr = this.dataArr.concat(normalizeBars(data));
    this.dataType = type;
    updateData.call(this);
  };

  /**
   * 卸载实例：断开 ResizeObserver、移除交互监听、取消待绘制 rAF、移除 DOM。
   * 调用后不应再使用本实例。
   */
  klineProto.prototype.destroy = function () {
    if (this._destroyed) return;
    this._destroyed = true;

    disconnectResizeObserver(this);
    if (typeof this.cancelScheduledDraw === 'function') {
      this.cancelScheduledDraw();
    }
    detachChartInteractions(this);

    if (this.cBox) {
      const children = [...this.cBox.children];
      for (let i = 0; i < children.length; i++) {
        const node = children[i];
        if (node.tagName === 'SPAN') {
          this.cBox.removeChild(node);
        }
      }
      if (this.layerRoot && this.layerRoot.parentNode === this.cBox) {
        this.cBox.removeChild(this.layerRoot);
      }
    }

    this.dataArr = [];
    this.event = undefined;
    this.layerRoot = undefined;
    this.hitTarget = undefined;
    this.layers = undefined;
    this.canvas = undefined;
    this.ctxGrid = undefined;
    this.ctxMain = undefined;
    this.ctxSub = undefined;
    this.ctxOverlay = undefined;
    this.ctx = undefined;
    this.markDirty = function () {};
    this.cancelScheduledDraw = function () {};
  };
}

/**
 * 实时 tick 合并到 this.dataArr[0]（dataArr[0] 为最新一根，与绘图循环一致）。
 * 先规范为 bar，再按「与 lastDataTimestamp 的分钟差」与 dataType（周期分钟数）比较：跨周期则新开一根，否则只更新当前根。
 */
function pushQuoteInData (quote) {
  if (this.loadingStatus) return;
  const bar = normalizeBar(quote);
  if (!this.dataArr.length) {
    // 尚无历史时，直接以首条实时作为第一根 K 线
    this.dataArr.unshift(bar);
    this.lastDataTimestamp = bar.time;
    updateData.call(this);
    return;
  }
  this.lastDataTimestamp = this.lastDataTimestamp || this.dataArr[0].time;
  // bar.time 与 lastDataTimestamp 均为秒；dataType 为分钟（如 5 表示 5 分钟线）
  const diffMinutes = (bar.time - this.lastDataTimestamp) / 60;
  if (diffMinutes >= this.dataType) {
    this.dataArr.unshift(bar);
    this.lastDataTimestamp = bar.time;
    this.fromSpaceNum++;
  } else {
    // 同一根 K 线内：用新 tick 整体替换当前根（OHLC 已由上游算好或单次字段）
    this.dataArr.splice(0, 1, bar);
  }
  updateData.call(this);
}