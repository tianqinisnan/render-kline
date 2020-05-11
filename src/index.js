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
 */
import { addMouseMove, addMouseDrag, addMouseWheel } from './event';
import protoAction from './proto';

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
    this.dataArr = [];  //数据
    this.lastDataTimestamp = undefined; //历史报价中最近的一个时间戳, 用来和实时报价做比较画图
    this.loadingStatus = false; //loading状态
    
    this.processParams(); //处理参数兼容
    this.init();  //初始化视图

    protoAction.call(this, RenderKLine);  //挂载实例上的方法 (提供外部调用)
  }
  init() {
    // 创建canvas并获得canvas上下文
    this.canvas = document.createElement("canvas");
    if (this.canvas && this.canvas.getContext) {
      this.ctx = this.canvas.getContext("2d");
    }
    // 插入canvas
    this.canvas.innerHTML = '您的当前浏览器不支持HTML5 canvas';
    this.cBox.appendChild(this.canvas);
    this.actualWidth = this.cBox.clientWidth;
    this.actualHeight = this.cBox.clientHeight;
    // 添加移动、拖拽、滚轮事件
    addMouseMove.call(this);
    addMouseDrag.call(this);
    addMouseWheel.call(this);
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

export default RenderKLine;