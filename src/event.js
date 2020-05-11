
import { addWheelListener } from './utils';
import updateData from './core';

let _addEventListener, _removeEventListener, prefix = '';
// detect event model
if (window.addEventListener) {
  _addEventListener = "addEventListener";
  _removeEventListener = "removeEventListener";
} else {
  _addEventListener = "attachEvent";
  _removeEventListener = "detachEvent"
  prefix = "on";
}

//监听鼠标移动
export const addMouseMove = function () {
  this.canvas[_addEventListener](prefix+"mousemove", mosueMoveEvent);
  this.canvas[_addEventListener](prefix+"mouseleave", () => {
    this.event = undefined;
    this.resetCanvas();
    updateData.call(this);
  });
  const _this = this;
  function mosueMoveEvent (e) {
    if (_this.loadingStatus) return;
    _this.event = e || event;
    _this.resetCanvas();
    updateData.call(_this);
  }
}

//拖拽事件
export const addMouseDrag = function () {
  let pageX, moveX = 0;
  this.canvas[_addEventListener](prefix+'mousedown', e => {
    e = e || event;
    pageX = e.pageX;
    this.canvas[_addEventListener](prefix+'mousemove', dragMouseMoveEvent);
  });
  this.canvas[_addEventListener](prefix+'mouseup', () => {
    this.canvas[_removeEventListener](prefix+'mousemove', dragMouseMoveEvent);
  });
  this.canvas[_addEventListener](prefix+'mouseleave', () => {
    this.canvas[_removeEventListener](prefix+'mousemove', dragMouseMoveEvent);
  });
  
  const _this = this;
  function dragMouseMoveEvent (e) {
    if (_this.loadingStatus) return;
    e = e || event;
    moveX = e.pageX - pageX;
    pageX = e.pageX;
    _this.translateKLine(moveX);
  }
}

//Mac双指行为 & 鼠标滚轮
export const addMouseWheel = function () {
  addWheelListener(this.canvas, wheelEvent, _addEventListener, prefix);
  const _this = this;
  function wheelEvent (e) {
    if (_this.loadingStatus) return;
    if (Math.abs(e.deltaX) !== 0 && Math.abs(e.deltaY) !== 0) return; //没有固定方向，忽略
    if (e.deltaX < 0) return _this.translateKLine(parseInt(-e.deltaX)); //向右
    if (e.deltaX > 0) return _this.translateKLine(parseInt(-e.deltaX)); //向左
    if (e.ctrlKey) {
      if (e.deltaY > 0) return _this.scaleKLine(-1); //向内
      if (e.deltaY < 0) return _this.scaleKLine(1); //向外
    } else {
      if (e.deltaY > 0) return _this.scaleKLine(1); //向上
      if (e.deltaY < 0) return _this.scaleKLine(-1); //向下
    }
  }
}