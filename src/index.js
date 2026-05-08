/**
 * K-line - K线图渲染函数
 * Author: Nan
 * 
 * @param {string} id       canvasBox   ID        required
 * @param {json}   options  setting     params    optional
 *    sharpness {number} 清晰度
 *    buyColor {string} color - 涨
 *    sellColor {string} color - 跌
 *    fontColor {string} 文字颜色
 *    lineColor {string} 参考线颜色
 *    blockWidth {number} 方块的宽度
 *    digitsPoint {number} 报价有几位小数
 *    horizontalCells {number} 水平方向切割几个格子
 *    crossLineStatus {boolean} 鼠标移动十字线显示状态
 *    maPeriods {number[]} 均线周期，如 [5,10,20,30]；传 [] 可关闭
 *    maColors {string[]} 与 maPeriods 下标对应的颜色
 *    showVolume {boolean} 是否在副图绘制成交量，默认 true
 *    volumeUpColor / volumeDownColor {string} 成交量涨跌色，默认与 buyColor/sellColor 一致
 */
import { attachChartInteractions } from './event.js';
import { resizeAllLayers, observeContainerResize } from './layers/resize-layers.js';
import { attachScheduler, DIRTY_FULL } from './scheduler.js';
import { drawFull, redrawOverlay } from './core.js';
import protoAction from './proto.js';

class RenderKLine {
  constructor (id, /*Optional*/options) {
    if (!id) return;
    options = options || {};
    this.id = id;   //canvas box id
    this.cBox = document.getElementById(id);
    // options params
    this.sharpness = options.sharpness;
    this.blockWidth = options.blockWidth; // 方块的宽度 (最小为3,最大49 为了防止中间线出现位置偏差 设定为奇数,若为偶数则向下减1)
    this.buyColor = options.buyColor || '#F05452';
    this.sellColor = options.sellColor || '#25C875';
    this.fontColor = options.fontColor || '#666666';
    this.lineColor = options.lineColor || '#DDDDDD';
    this.digitsPoint = options.digitsPoint || 2; //报价的digits (有几位小数)
    this.horizontalCells = options.horizontalCells || 5; //水平方向切割多少格子 (中间虚线数 = n - 1)
    this.crossLineStatus = options.crossLineStatus || false; //鼠标移动十字线显示状态
    this.maPeriods = normalizeMaPeriods(options.maPeriods);
    this.maColors = Array.isArray(options.maColors) && options.maColors.length
      ? options.maColors
      : ['#F5A623', '#9013FE', '#4A90E2', '#00B8D4', '#7CB342'];
    this.showVolume = options.showVolume !== false;
    this.volumeUpColor = options.volumeUpColor || this.buyColor;
    this.volumeDownColor = options.volumeDownColor || this.sellColor;
    //basic params
    this.totalWidth = 0;  //总宽度
    this.movingRange = 0; //横向移动的距离 取正数值，使用时再加负号
    this.minPrice = 9999999;
    this.maxPrice = 0; //绘制的所有数据中 最小/最大数据 用来绘制y轴
    this.diffPrice = 0;  //最大报价与最小报价的差值
    this.perPricePixel = 0; //每一个单位报价占用多少像素
    this.centerSpace = 0; //x轴到顶部的距离 绘图区域
    this.xDateSpace = 6;  //x轴上的时间绘制间隔多少组
    this.fromSpaceNum = 0;  //x轴上的时间绘制从第 (fromSpaceNum%xDateSpace) 组数据开始 
    /**
     * 内存中的 K 线序列（index 0 = 最新）。每条由 normalize-bar 写入：
     * { time, open, high, low, close, volume }，均为 number；time 为 Unix 秒。
     * 入参仍为接口格式，在 updateHistoryQuote / updateRealTimeQuote 内转换。
     */
    this.dataArr = [];
    /** 实时合并时参照的「上一根」时间锚点（Unix 秒），与 dataArr[0].time 同源 */
    this.lastDataTimestamp = undefined;
    this.loadingStatus = false; //loading状态
    
    this.processParams(); //处理参数兼容
    this.init();  //初始化视图

    protoAction.call(this, RenderKLine);  //挂载实例上的方法 (提供外部调用)
  }
  init() {
    const root = document.createElement('div');
    root.className = 'kline-root';
    root.style.cssText = 'position:relative;width:100%;height:100%;box-sizing:border-box;';
    const mkLayer = (cls, z) => {
      const c = document.createElement('canvas');
      c.className = cls;
      c.style.cssText = `position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:${z}`;
      return c;
    };
    const grid = mkLayer('kline-layer-grid', 1);
    const main = mkLayer('kline-layer-main', 2);
    const sub = mkLayer('kline-layer-sub', 3);
    const overlay = mkLayer('kline-layer-overlay', 4);
    overlay.style.pointerEvents = 'auto';
    root.append(grid, main, sub, overlay);
    this.cBox.appendChild(root);

    this.layerRoot = root;
    /** @deprecated 兼容旧逻辑：等价于主图层 canvas，尺寸与 plotWidth/plotHeight 一致 */
    this.canvas = main;
    this.layers = { grid, main, sub, overlay };
    this.ctxGrid = grid.getContext('2d');
    this.ctxMain = main.getContext('2d');
    this.ctxSub = sub.getContext('2d');
    this.ctxOverlay = overlay.getContext('2d');
    this.ctx = this.ctxMain;
    /** 与画布同尺寸的命中元素（顶层 overlay），用于十字线 Client 坐标换算 */
    this.hitTarget = overlay;

    resizeAllLayers(this);
    observeContainerResize(this, () => {
      resizeAllLayers(this);
      if (this.dataArr.length) this.markDirty(DIRTY_FULL);
    });
    attachScheduler(this, { drawFull, redrawOverlay });

    attachChartInteractions(this);
  }
  processParams() {
    let sharpness, blockWidth = parseInt(this.blockWidth);
    //清晰度判断
    if ((sharpness = parseInt(this.sharpness)) && sharpness >= 1) {
      this.sharpness = sharpness;
    } else {
      this.sharpness = 2;
    }
    //方块宽度判断
    if (blockWidth) {
      if (blockWidth < 3) {
        this.blockWidth = 3;
      } else if (blockWidth > 49) {
        this.blockWidth = 49;
      } else {
        this.blockWidth = blockWidth%2 ? blockWidth : blockWidth - 1;
      }
    } else {
      this.blockWidth = 11;
    }
    //xDateSpace判断
    if (this.blockWidth === 3) {
      this.xDateSpace = 12;
    } else if (this.blockWidth === 5) {
      this.xDateSpace = 8;
    } else if (this.blockWidth > 20) {
      this.xDateSpace = 4;
    } else {
      this.xDateSpace = 6;
    }
  }
}

function normalizeMaPeriods(raw) {
  if (raw === undefined || raw === null) return [5, 10, 20];
  if (Array.isArray(raw)) {
    const list = raw.map(p => parseInt(p, 10)).filter(p => Number.isFinite(p) && p > 0);
    return list.length ? list : [];
  }
  return [5, 10, 20];
}

export default RenderKLine;