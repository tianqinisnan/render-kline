(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.RenderKLine = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _createForOfIteratorHelper(o) {
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
      if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
        var i = 0;

        var F = function () {};

        return {
          s: F,
          n: function () {
            if (i >= o.length) return {
              done: true
            };
            return {
              done: false,
              value: o[i++]
            };
          },
          e: function (e) {
            throw e;
          },
          f: F
        };
      }

      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var it,
        normalCompletion = true,
        didErr = false,
        err;
    return {
      s: function () {
        it = o[Symbol.iterator]();
      },
      n: function () {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      },
      e: function (e) {
        didErr = true;
        err = e;
      },
      f: function () {
        try {
          if (!normalCompletion && it.return != null) it.return();
        } finally {
          if (didErr) throw err;
        }
      }
    };
  }

  var toDou = function toDou(n) {
    return n < 10 ? '0' + n : '' + n;
  };
  var getDate = function getDate(timestamp) {
    var newDate = new Date(timestamp * 1000);
    return {
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
      date: newDate.getDate(),
      hours: newDate.getHours(),
      minutes: newDate.getMinutes(),
      seconds: newDate.getSeconds(),
      day: newDate.getDay()
    };
  };
  /**
   * wheel 事件兼容写法；返回卸载函数供 destroy 移除监听。
   * @returns {() => void}
   */

  var addWheelListener = function addWheelListener(elem, callback, _addEventListener, prefix, useCapture) {
    var removeFns = [];
    var cap = useCapture || false;

    var add = elem[_addEventListener].bind(elem);

    var removeMethod = _addEventListener === 'addEventListener' ? 'removeEventListener' : 'detachEvent';
    var remove = elem[removeMethod].bind(elem);
    var pre = prefix || '';
    var support = "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";

    function normalizedHandler(originalEvent) {
      !originalEvent && (originalEvent = window.event);
      var event = {
        originalEvent: originalEvent,
        target: originalEvent.target || originalEvent.srcElement,
        ctrlKey: originalEvent.ctrlKey || false,
        type: "wheel",
        deltaMode: originalEvent.type == "MozMousePixelScroll" ? 0 : 1,
        deltaX: 0,
        deltaZ: 0,
        preventDefault: function preventDefault() {
          originalEvent.preventDefault ? originalEvent.preventDefault() : originalEvent.returnValue = false;
        }
      };

      if (support == "mousewheel") {
        event.deltaY = -1 / 40 * originalEvent.wheelDelta;
        originalEvent.wheelDeltaX && (event.deltaX = -1 / 40 * originalEvent.wheelDeltaX);
      } else {
        event.deltaY = originalEvent.detail;
      }

      return callback(event);
    }

    var listener = support === "wheel" ? callback : normalizedHandler;
    add(pre + support, listener, cap);
    removeFns.push(function () {
      return remove(pre + support, listener, cap);
    });

    if (support == "DOMMouseScroll") {
      add(pre + "MozMousePixelScroll", normalizedHandler, cap);
      removeFns.push(function () {
        return remove(pre + "MozMousePixelScroll", normalizedHandler, cap);
      });
    }

    return function () {
      for (var i = removeFns.length - 1; i >= 0; i--) {
        try {
          removeFns[i]();
        } catch (_) {
        }
      }
    };
  };

  /**
   * 绘制调度（阶段 B）：requestAnimationFrame 合并 markDirty；十字线仅刷新 overlay，减轻 CPU。
   */
  var DIRTY_FULL = 1;
  var DIRTY_OVERLAY = 2;
  /**
   * @param {object} instance
   * @param {{ drawFull: (inst: object) => void, redrawOverlay: (inst: object) => void }} pipeline
   */

  function attachScheduler(instance, pipeline) {
    var dirty = 0;
    var rafId = 0;

    function flush() {
      rafId = 0;
      var flags = dirty;
      dirty = 0;
      if (!instance.dataArr || !instance.dataArr.length) return;

      if (flags & DIRTY_FULL) {
        pipeline.drawFull(instance);
        return;
      }

      if (flags & DIRTY_OVERLAY) {
        pipeline.redrawOverlay(instance);
      }
    }

    instance.markDirty = function (layerFlags) {
      dirty |= layerFlags;

      if (!rafId) {
        rafId = requestAnimationFrame(flush);
      }
    };
    /** destroy 时取消未执行的 rAF，避免卸载后仍触发绘制 */


    instance.cancelScheduledDraw = function () {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }

      dirty = 0;
    };
  }

  var hit = function hit(inst) {
    return inst.hitTarget || inst.layerRoot;
  };
  /** 双指间距变化超过该像素则触发一次 scaleKLine(±1)，避免抖动 */


  var PINCH_DIST_THRESHOLD_PX = 14;

  function applyChartTouchStyles(instance) {
    var el = hit(instance);
    el.style.touchAction = 'none';
    el.style.userSelect = 'none';

    if (instance.layerRoot) {
      instance.layerRoot.style.touchAction = 'none';
      instance.layerRoot.style.userSelect = 'none';
    }
  }

  function wheelEvent(_this, e) {
    if (_this.loadingStatus) return;
    if (Math.abs(e.deltaX) !== 0 && Math.abs(e.deltaY) !== 0) return;
    if (e.deltaX < 0) return _this.translateKLine(parseInt(-e.deltaX, 10));
    if (e.deltaX > 0) return _this.translateKLine(parseInt(-e.deltaX, 10));

    if (e.ctrlKey) {
      if (e.deltaY > 0) return _this.scaleKLine(-1);
      if (e.deltaY < 0) return _this.scaleKLine(1);
    } else {
      if (e.deltaY > 0) return _this.scaleKLine(1);
      if (e.deltaY < 0) return _this.scaleKLine(-1);
    }
  }
  /**
   * Pointer Events：十字线、单指平移、双指离散缩放。
   * @param {Array<() => void>} cleanups 卸载函数数组
   */


  function attachPointerMode(instance, el, cleanups) {
    var pointers = new Map();
    var dragLastClientX = null;
    var pinchAnchorDist = null;

    function pinchDistance() {
      var pts = _toConsumableArray(pointers.values());

      if (pts.length < 2) return 0;
      var dx = pts[0].x - pts[1].x;
      var dy = pts[0].y - pts[1].y;
      return Math.hypot(dx, dy);
    }

    function updateCrosshairFromEvent(e) {
      if (instance.loadingStatus) return;
      instance.event = e;
      instance.markDirty(DIRTY_OVERLAY);
    }

    function clearCrosshair() {
      instance.event = undefined;
      instance.markDirty(DIRTY_OVERLAY);
    }

    function onPointerMove(e) {
      updateCrosshairFromEvent(e);
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
      });
      if (instance.loadingStatus) return;

      if (pointers.size >= 2) {
        var dist = pinchDistance();

        if (pinchAnchorDist != null && dist > 0) {
          var delta = dist - pinchAnchorDist;

          if (delta > PINCH_DIST_THRESHOLD_PX) {
            instance.scaleKLine(1);
            pinchAnchorDist = dist;
          } else if (delta < -PINCH_DIST_THRESHOLD_PX) {
            instance.scaleKLine(-1);
            pinchAnchorDist = dist;
          }
        } else {
          pinchAnchorDist = dist;
        }

        return;
      }

      if (pointers.size === 1 && dragLastClientX != null) {
        if (e.pointerType === 'mouse' && (e.buttons & 1) === 0) {
          dragLastClientX = e.clientX;
          return;
        }

        var dx = e.clientX - dragLastClientX;
        dragLastClientX = e.clientX;
        instance.translateKLine(dx);
      }
    }

    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      try {
        el.setPointerCapture(e.pointerId);
      } catch (_) {
      }

      pointers.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
      });

      if (pointers.size === 1) {
        dragLastClientX = e.clientX;
        pinchAnchorDist = null;
      } else if (pointers.size === 2) {
        dragLastClientX = null;
        pinchAnchorDist = pinchDistance();
      }
    }

    function onPointerUp(e) {
      pointers["delete"](e.pointerId);
      if (pointers.size < 2) pinchAnchorDist = null;

      if (pointers.size === 1) {
        var remain = _toConsumableArray(pointers.entries())[0];

        dragLastClientX = remain[1].x;
      } else {
        dragLastClientX = null;
      }

      if (pointers.size === 0 && e.pointerType !== 'mouse') {
        clearCrosshair();
      }

      try {
        el.releasePointerCapture(e.pointerId);
      } catch (_) {
      }
    }

    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('pointerleave', clearCrosshair);
    cleanups.push(function () {
      return el.removeEventListener('pointermove', onPointerMove);
    });
    cleanups.push(function () {
      return el.removeEventListener('pointerdown', onPointerDown);
    });
    cleanups.push(function () {
      return el.removeEventListener('pointerup', onPointerUp);
    });
    cleanups.push(function () {
      return el.removeEventListener('pointercancel', onPointerUp);
    });
    cleanups.push(function () {
      return el.removeEventListener('pointerleave', clearCrosshair);
    });
  }
  /**
   * 降级：mouse + touch（无 PointerEvent 的环境）。
   */


  function attachLegacyMode(instance, el, cleanups) {
    var pageX;
    var touchPinchStart = null;

    function syntheticTouch(touch) {
      return {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
    }

    function onMouseMoveCrosshair(e) {
      if (instance.loadingStatus) return;
      instance.event = e;
      instance.markDirty(DIRTY_OVERLAY);
    }

    function dragMouseMove(e) {
      if (instance.loadingStatus) return;
      e = e || window.event;
      var moveX = e.pageX - pageX;
      pageX = e.pageX;
      instance.translateKLine(moveX);
    }

    function stopDrag() {
      el.removeEventListener('mousemove', dragMouseMove);
    }

    function onMouseDown(e) {
      if (instance.loadingStatus) return;
      e = e || window.event;
      pageX = e.pageX;
      el.addEventListener('mousemove', dragMouseMove);
    }

    function onMouseUp() {
      stopDrag();
    }

    function onMouseLeaveEl() {
      stopDrag();
      instance.event = undefined;
      instance.markDirty(DIRTY_OVERLAY);
    }

    function onTouchStart(ev) {
      if (instance.loadingStatus) return;

      if (ev.touches.length === 1) {
        touchPinchStart = null;
        pageX = ev.touches[0].pageX;
        instance.event = syntheticTouch(ev.touches[0]);
        instance.markDirty(DIRTY_OVERLAY);
      } else if (ev.touches.length === 2) {
        var dx = ev.touches[0].clientX - ev.touches[1].clientX;
        var dy = ev.touches[0].clientY - ev.touches[1].clientY;
        touchPinchStart = Math.hypot(dx, dy);
      }
    }

    function onTouchMove(ev) {
      if (instance.loadingStatus) return;

      if (ev.touches.length === 1) {
        var t = ev.touches[0];
        instance.event = syntheticTouch(t);
        instance.markDirty(DIRTY_OVERLAY);
        var dx = t.pageX - pageX;
        pageX = t.pageX;
        instance.translateKLine(dx);
        touchPinchStart = null;
      } else if (ev.touches.length === 2 && touchPinchStart != null) {
        var _dx = ev.touches[0].clientX - ev.touches[1].clientX;

        var dy = ev.touches[0].clientY - ev.touches[1].clientY;
        var dist = Math.hypot(_dx, dy);
        var delta = dist - touchPinchStart;

        if (delta > PINCH_DIST_THRESHOLD_PX) {
          instance.scaleKLine(1);
          touchPinchStart = dist;
        } else if (delta < -PINCH_DIST_THRESHOLD_PX) {
          instance.scaleKLine(-1);
          touchPinchStart = dist;
        }
      }
    }

    function onTouchEnd(ev) {
      if (!ev.touches.length) {
        instance.event = undefined;
        instance.markDirty(DIRTY_OVERLAY);
        touchPinchStart = null;
      } else if (ev.touches.length === 1) {
        pageX = ev.touches[0].pageX;
        touchPinchStart = null;
        instance.event = syntheticTouch(ev.touches[0]);
        instance.markDirty(DIRTY_OVERLAY);
      }
    }

    el.addEventListener('mousemove', onMouseMoveCrosshair);
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseLeaveEl);
    cleanups.push(function () {
      return el.removeEventListener('mousemove', onMouseMoveCrosshair);
    });
    cleanups.push(function () {
      return el.removeEventListener('mousedown', onMouseDown);
    });
    cleanups.push(function () {
      return el.removeEventListener('mouseup', onMouseUp);
    });
    cleanups.push(function () {
      return el.removeEventListener('mouseleave', onMouseLeaveEl);
    });
    cleanups.push(function () {
      return stopDrag();
    });
    el.addEventListener('touchstart', onTouchStart, {
      passive: true
    });
    el.addEventListener('touchmove', onTouchMove, {
      passive: true
    });
    el.addEventListener('touchend', onTouchEnd, {
      passive: true
    });
    cleanups.push(function () {
      return el.removeEventListener('touchstart', onTouchStart);
    });
    cleanups.push(function () {
      return el.removeEventListener('touchmove', onTouchMove);
    });
    cleanups.push(function () {
      return el.removeEventListener('touchend', onTouchEnd);
    });
  }
  /**
   * 挂载移动、拖拽、捏合缩放与滚轮（内部统一 Pointer 或降级逻辑）。
   */


  function attachChartInteractions(instance) {
    detachChartInteractions(instance);
    applyChartTouchStyles(instance);
    var el = hit(instance);
    var cleanups = [];
    cleanups.push(addWheelListener(el, function (e) {
      return wheelEvent(instance, e);
    }, 'addEventListener', '', false));

    if (typeof window.PointerEvent !== 'undefined') {
      attachPointerMode(instance, el, cleanups);
    } else {
      attachLegacyMode(instance, el, cleanups);
    }

    instance._chartInteractionCleanups = cleanups;
  }
  /** 移除图表交互监听（destroy 或重复 init 前调用） */

  function detachChartInteractions(instance) {
    var list = instance._chartInteractionCleanups;
    if (!list || !list.length) return;

    for (var i = list.length - 1; i >= 0; i--) {
      try {
        list[i]();
      } catch (_) {
      }
    }

    instance._chartInteractionCleanups = undefined;
  }

  var BLOCK_MARGIN = 2; //方块水平间距

  /**
   * 以下为「外部 / 接口」K 线对象的字段名，供 model/normalize-bar.js 做映射。
   * 内存中 this.dataArr 使用规范化字段 open/high/low/close/time/volume，不再直接读这些键。
   */

  var START_PRICE_INDEX = 'open_price'; //开始价格在数据组中的位置

  var END_PRICE_INDEX = 'close'; //结束价格在数据组中的位置

  var MIN_PRICE_INDEX = 'low'; //最小价格在数据组中的位置

  var MAX_PRICE_INDEX = 'high'; //最大价格在数据组中的位置

  var TIME_INDEX = 'time'; //时间在数据组中的位置

  var LINE_WIDTH = 1; //1px 宽度 (中间线、x轴等)

  var BOTTOM_SPACE = 40; //底部空间

  var TOP_SPACE = 20; //顶部空间

  var RIGHT_SPACE = 60; //右侧空间

  /** 副图（成交量等）占中间绘图区 centerSpace 的比例，其余为主图 K 线 */

  var SUB_CHART_HEIGHT_RATIO = 0.2;

  /**
   * 多 Canvas 分层（阶段 B）：统一按容器尺寸与 sharpness 设置缓冲区分辨率与 CSS 尺寸。
   * 不在每次 mousemove 时改 width/height（避免不必要的清空与昂贵的缓冲重建）。
   */
  /**
   * 同步 plot 纵向分区：centerSpace 为 TOP～BOTTOM 之间的可绘区域；主图与预留副图瓜分该区域。
   */

  function updatePlotMetrics(instance) {
    var h = instance.plotHeight;
    instance.centerSpace = h - (BOTTOM_SPACE + TOP_SPACE) * instance.sharpness;
    instance.mainPlotHeight = instance.centerSpace * (1 - SUB_CHART_HEIGHT_RATIO);
    instance.subPlotHeight = instance.centerSpace * SUB_CHART_HEIGHT_RATIO;
  }
  /**
   * 读取容器宽高，设置四层 canvas 的像素尺寸与 CSS 尺寸，并刷新公共度量。
   * @param {object} instance RenderKLine 实例（需已有 layers、sharpness、cBox）
   */

  function resizeAllLayers(instance) {
    instance.actualWidth = instance.cBox.clientWidth;
    instance.actualHeight = instance.cBox.clientHeight;
    var w = instance.actualWidth * instance.sharpness;
    var h = instance.actualHeight * instance.sharpness;
    instance.plotWidth = w;
    instance.plotHeight = h;
    var keys = ['grid', 'main', 'sub', 'overlay'];

    for (var i = 0; i < keys.length; i++) {
      var canvas = instance.layers[keys[i]];
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = "".concat(instance.actualWidth, "px");
      canvas.style.height = "".concat(instance.actualHeight, "px");
    }

    updatePlotMetrics(instance);
    var lw = LINE_WIDTH * instance.sharpness;
    var font = "".concat(12 * instance.sharpness, "px Arial");
    instance.ctxGrid.lineWidth = lw;
    instance.ctxGrid.font = font;
    instance.ctxMain.lineWidth = lw;
    instance.ctxMain.font = font;
    instance.ctxSub.lineWidth = lw;
    instance.ctxSub.font = font;
    instance.ctxOverlay.lineWidth = lw;
    instance.ctxOverlay.font = font;
  }
  /**
   * ResizeObserver 防抖，避免拖拽窗口时每一帧都 resize。
   * @param {object} instance
   * @param {() => void} onResize 通常为 resizeAllLayers + markDirty(FULL)
   */

  function observeContainerResize(instance, onResize) {
    instance._resizeDebounceTimer = 0;

    if (typeof ResizeObserver === 'undefined') {
      instance._resizeFallback = function () {
        return onResize();
      };

      window.addEventListener('resize', instance._resizeFallback);
      return;
    }

    instance._resizeObserver = new ResizeObserver(function () {
      if (instance._resizeDebounceTimer) clearTimeout(instance._resizeDebounceTimer);
      instance._resizeDebounceTimer = setTimeout(function () {
        instance._resizeDebounceTimer = 0;
        onResize();
      }, 100);
    });

    instance._resizeObserver.observe(instance.cBox);
  }
  function disconnectResizeObserver(instance) {
    if (instance._resizeDebounceTimer) {
      clearTimeout(instance._resizeDebounceTimer);
      instance._resizeDebounceTimer = 0;
    }

    if (instance._resizeObserver) {
      instance._resizeObserver.disconnect();

      instance._resizeObserver = undefined;
    }

    if (instance._resizeFallback) {
      window.removeEventListener('resize', instance._resizeFallback);
      instance._resizeFallback = undefined;
    }
  }

  function transformOrigin() {
    this.ctx.translate(this.plotWidth, 0);
    this.ctx.scale(-1, 1);
  } // 计算minPrice & maxPrice

  function computeSpaceY() {
    this.minPrice = 9999999;
    this.maxPrice = 0; //根据当前可视区域的方块计算报价范围

    var start = Math.floor((this.movingRange - RIGHT_SPACE) / (this.blockWidth + BLOCK_MARGIN));
    start = start > 0 ? start : 0;
    var end = Math.ceil(this.plotWidth / ((this.blockWidth + BLOCK_MARGIN) * this.sharpness)) + 1 + start;
    end = end > this.dataArr.length ? this.dataArr.length : end;
    var newArr = this.dataArr.slice(start, end); // 可视区内仅遍历规范化 K 线，用数值 OHLC 求纵轴范围（含影线 high/low）

    for (var i = 0; i < newArr.length; i++) {
      var b = newArr[i];
      this.minPrice = Math.min(this.minPrice, b.open, b.close, b.low);
      this.maxPrice = Math.max(this.maxPrice, b.open, b.close, b.high);
    }

    var extendPrice = (this.maxPrice - this.minPrice) / 20; //最小、最大值分别延伸 1/20 的范围

    this.minPrice = (parseFloat(this.minPrice) - extendPrice).toFixed(this.digitsPoint);
    this.maxPrice = (parseFloat(this.maxPrice) + extendPrice).toFixed(this.digitsPoint); // diffPrice & perPricePixel（仅主图高度映射 OHLC，副图高度另算成交量等）

    this.diffPrice = this.maxPrice - this.minPrice;
    this.perPricePixel = this.mainPlotHeight / this.diffPrice;
  }
  /**
   * 副图成交量纵向比例：仅按当前可视范围内的 K 线取 max(volume)，与 computeSpaceY 切片口径一致。
   */

  function computeVolumeScale(instance) {
    var start = Math.floor((instance.movingRange - RIGHT_SPACE) / (instance.blockWidth + BLOCK_MARGIN));
    start = start > 0 ? start : 0;
    var end = Math.ceil(instance.plotWidth / ((instance.blockWidth + BLOCK_MARGIN) * instance.sharpness)) + 1 + start;
    end = end > instance.dataArr.length ? instance.dataArr.length : end;
    var maxV = 0;

    for (var i = start; i < end; i++) {
      var v = instance.dataArr[i].volume;
      if (Number.isFinite(v) && v > maxV) maxV = v;
    }

    instance.maxVolumeVisible = maxV > 0 ? maxV : 1;
    var pad = 2 * instance.sharpness;
    instance.volumeBarMaxHeight = Math.max(instance.subPlotHeight - pad, instance.sharpness);
    instance.perVolumePixel = instance.volumeBarMaxHeight / instance.maxVolumeVisible;
  } // 计算totalWidth

  function computeTotalWidth() {
    this.totalWidth = (this.dataArr.length * (BLOCK_MARGIN + this.blockWidth) + RIGHT_SPACE) * this.sharpness;
  } // 绘制图表水平线；坐标原点在 (0, TOP_SPACE)。主图区内画网格，底部画满 centerSpace（含预留副图高度）

  function drawHorizontalLine() {
    this.ctx.save(); // 所有水平线和报价不需要移动, 需要把原点固定

    this.ctx.translate(this.movingRange * this.sharpness, 0);
    var w = this.plotWidth;
    var mainH = this.mainPlotHeight;
    var fullH = this.centerSpace; // 主图底部分割线（与副图分界）

    drawLine.call(this, 0, mainH, w, mainH); // 整个绘图区底边（时间轴上方）

    drawLine.call(this, 0, fullH, w, fullH); // 主图顶边

    drawLine.call(this, 0, 0, w, 0);
    var perPixel = mainH / this.horizontalCells;

    for (var i = 1; i < this.horizontalCells; i++) {
      drawDash.call(this, 0, parseInt(perPixel * i), w, parseInt(perPixel * i));
    }

    this.ctx.restore();
  } // 绘制y轴上的报价

  function drawYPrice() {
    this.ctx.save(); // 所有水平线和报价不需要移动

    this.ctx.translate(this.movingRange * this.sharpness, 0); // 填充文字时需要把canvas的转换还原回来，防止文字翻转变形

    transformOrigin.call(this); // 再将原点切到右侧

    this.ctx.translate(this.plotWidth - RIGHT_SPACE * this.sharpness, 0);
    var perPrice = this.diffPrice / this.horizontalCells; //相邻水平参考线间隔报价

    var perPixel = this.mainPlotHeight / this.horizontalCells; // 与主图网格对齐

    for (var i = 0; i < this.horizontalCells + 1; i++) {
      // y轴上的报价
      drawText.call(this, (this.maxPrice - perPrice * i).toFixed(this.digitsPoint), 0, parseInt(perPixel * i), RIGHT_SPACE * this.sharpness);
    }

    this.ctx.restore();
  } // 根据updateDate 中的 type类型，处理x轴的时间格式

  function processXDate(timestamp, type) {
    type = Number(type);
    var dateOrigin = getDate(timestamp);

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
  } // 绘制方块

  function drawRect(x, y, width, height, color) {
    this.ctx.beginPath();
    this.ctx.rect(parseInt(x), parseInt(y), parseInt(width), parseInt(height));
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.closePath();
  } // 画直线

  function drawLine(startX, startY, endX, endY, color) {
    this.ctx.save();
    this.ctx.strokeStyle = color || this.lineColor;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  } // 画虚线

  function drawDash(startX, startY, endX, endY, color) {
    this.ctx.save();
    this.ctx.setLineDash([5 * this.sharpness, 2 * this.sharpness]);
    this.ctx.strokeStyle = color || this.lineColor;
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.closePath();
    this.ctx.restore();
  } // 文字的渲染

  function drawText(str, x, y, maxLen) {
    var textAlign = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'left';
    var textBaseline = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 'middle';
    this.ctx.fillStyle = this.fontColor;
    this.ctx.textAlign = textAlign;
    this.ctx.textBaseline = textBaseline;
    this.ctx.fillText(str, x, y, maxLen);
  } // 十字线仅在 overlay 层绘制；命中区域与坐标换算依赖 hitTarget（与画布同尺寸的容器或顶层 canvas）

  function drawCrossLine() {
    if (!this.crossLineStatus || !this.event) return;
    var hitEl = this.hitTarget || this.layerRoot;
    var cRect = hitEl.getBoundingClientRect();
    var x = this.plotWidth - (this.event.clientX - cRect.left - this.movingRange) * this.sharpness;
    var y = (this.event.clientY - cRect.top) * this.sharpness;
    if (y < TOP_SPACE * this.sharpness || y > this.plotHeight - BOTTOM_SPACE * this.sharpness) return;
    var w = this.plotWidth;
    drawDash.call(this, this.movingRange * this.sharpness, y, w + this.movingRange * this.sharpness, y, '#999999');
    drawDash.call(this, x, TOP_SPACE * this.sharpness, x, this.plotHeight - BOTTOM_SPACE * this.sharpness, '#999999');
    var plotLocalY = y - TOP_SPACE * this.sharpness; // 仅主图区内显示右侧价位悬浮（副图区为成交量，不设价位悬浮）

    if (plotLocalY < 0 || plotLocalY > this.mainPlotHeight) return;
    var str = (this.maxPrice - plotLocalY / this.perPricePixel).toFixed(this.digitsPoint);
    this.ctx.save();
    this.ctx.translate(this.movingRange * this.sharpness, 0);
    transformOrigin.call(this);
    this.ctx.translate(this.plotWidth - RIGHT_SPACE * this.sharpness, 0);
    drawRect.call(this, -3 * this.sharpness, y - 10 * this.sharpness, this.ctx.measureText(str).width + 6 * this.sharpness, 20 * this.sharpness, '#cccccc');
    drawText.call(this, str, 0, y, RIGHT_SPACE * this.sharpness);
    this.ctx.restore();
  }

  /**
   * 简单移动平均线（SMA）：收盘价序列。
   * dataArr 约定 index 0 为最新一根，index 增大指向更历史 K 线。
   */
  var DEFAULT_MA_COLORS = ['#F5A623', '#9013FE', '#4A90E2', '#00B8D4', '#7CB342'];
  /**
   * @param {{ close: number }[]} bars
   * @param {number} period 周期，正整数
   * @returns {(number|null)[]} 与 bars 等长；仅当连续 period 根均有数据时，从 index 0 起往后填充 SMA，末尾不足窗口的为 null
   */

  function computeMA(bars, period) {
    var n = bars.length;
    var out = new Array(n).fill(null);
    var p = Math.floor(period);
    if (!Number.isFinite(p) || p < 1 || n < p) return out;

    for (var i = 0; i <= n - p; i++) {
      var sum = 0;

      for (var j = 0; j < p; j++) {
        sum += bars[i + j].close;
      }

      out[i] = sum / p;
    }

    return out;
  }

  function barMargin(instance, i) {
    var s = instance.sharpness;
    var bm = BLOCK_MARGIN * s;
    var bw = instance.blockWidth * s;
    return bm + i * (bw + bm);
  }

  function barCenterX(instance, i) {
    var s = instance.sharpness;
    var bw = instance.blockWidth * s;
    return barMargin(instance, i) + (bw - s) / 2;
  }
  /** 与主图蜡烛相同的可视剔除规则（首根始终参与逻辑坐标） */


  function isBarVisible(instance, i) {
    var m = barMargin(instance, i);
    var s = instance.sharpness;
    if (i === 0) return true;
    return !(m < (instance.movingRange - RIGHT_SPACE * 2) * s || m > instance.movingRange * s + instance.plotWidth);
  }
  /**
   * 写入 instance._computedIndicators.ma：{ [period]: (number|null)[] }
   */


  function computeMAIndicators(instance) {
    var periods = instance.maPeriods;

    if (!periods || !periods.length) {
      instance._computedIndicators = instance._computedIndicators || {};
      instance._computedIndicators.ma = {};
      return;
    }

    var bars = instance.dataArr;
    var ma = {};

    for (var k = 0; k < periods.length; k++) {
      var p = periods[k];
      ma[p] = computeMA(bars, p);
    }

    instance._computedIndicators = instance._computedIndicators || {};
    instance._computedIndicators.ma = ma;
  }
  /**
   * 在主图层、与蜡烛同一坐标系下绘制均线（使用当前 min/max 价格轴，不单独缩放）。
   */

  function drawMAOnMain(instance, ctx) {
    var pack = instance._computedIndicators && instance._computedIndicators.ma;
    var periods = instance.maPeriods;
    if (!pack || !periods || !periods.length) return;
    var n = instance.dataArr.length;
    var maxP = Number(instance.maxPrice);
    var s = instance.sharpness;

    for (var pi = 0; pi < periods.length; pi++) {
      var period = periods[pi];
      var vals = pack[period];
      if (!vals) continue;
      var color = instance.maColors && instance.maColors[pi] || DEFAULT_MA_COLORS[pi % DEFAULT_MA_COLORS.length];
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, LINE_WIDTH * s);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      var started = false;

      for (var i = 0; i < n - 1; i++) {
        if (!isBarVisible(instance, i) || !isBarVisible(instance, i + 1)) {
          started = false;
          continue;
        }

        if (vals[i] == null || vals[i + 1] == null) {
          started = false;
          continue;
        }

        var x1 = barCenterX(instance, i);
        var y1 = (maxP - vals[i]) * instance.perPricePixel;
        var x2 = barCenterX(instance, i + 1);
        var y2 = (maxP - vals[i + 1]) * instance.perPricePixel;

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

  /** @typedef {{ name: string, compute?: (inst: object) => void, drawMain?: (inst: object, ctx: CanvasRenderingContext2D) => void, drawSub?: (inst: object, ctx: CanvasRenderingContext2D) => void }} IndicatorSpec */

  /** @type {IndicatorSpec[]} */

  var registry = [];
  /**
   * @param {string} name
   * @param {Omit<IndicatorSpec, 'name'>} spec
   */

  function registerIndicator(name, spec) {
    registry.push(_objectSpread2({
      name: name
    }, spec));
  }
  function runComputeIndicators(instance) {
    for (var i = 0; i < registry.length; i++) {
      var ind = registry[i];
      if (ind.compute) ind.compute(instance);
    }
  }
  function runDrawMainIndicators(instance, ctx) {
    for (var i = 0; i < registry.length; i++) {
      var ind = registry[i];
      if (ind.drawMain) ind.drawMain(instance, ctx);
    }
  }
  registerIndicator('ma', {
    compute: computeMAIndicators,
    drawMain: drawMAOnMain
  });

  /**
   * 单层绘制前恢复与历史单 canvas 一致的坐标系：翻转 X + 横向滚动。
   */

  function resetLayerTransform(instance, ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(instance.plotWidth, 0);
    ctx.scale(-1, 1);
    ctx.translate(-instance.movingRange * instance.sharpness, 0);
  }
  /** 网格层：水平参考线、纵向虚线、时间文字（在 K 线之下） */

  function drawGridLayer(instance) {
    instance.ctx = instance.ctxGrid;
    var ctx = instance.ctxGrid;
    ctx.save();
    resetLayerTransform(instance, ctx);
    ctx.translate(0, TOP_SPACE * instance.sharpness);
    drawHorizontalLine.call(instance);
    ctx.translate(RIGHT_SPACE * instance.sharpness, 0);
    var margin = BLOCK_MARGIN * instance.sharpness;
    var blockMargin = margin;
    var blockWidth = instance.blockWidth * instance.sharpness;
    var mainH = instance.mainPlotHeight;

    for (var i = 0; i < instance.dataArr.length; i++) {
      if (i !== 0 && (margin < (instance.movingRange - RIGHT_SPACE * 2) * instance.sharpness || margin > instance.movingRange * instance.sharpness + instance.plotWidth)) {
        margin += blockWidth + blockMargin;
        continue;
      }

      var item = instance.dataArr[i];

      if (i % instance.xDateSpace === instance.fromSpaceNum % instance.xDateSpace) {
        var cx = margin + (blockWidth - 1 * instance.sharpness) / 2;
        drawDash.call(instance, cx, 0, cx, mainH);
        ctx.save();
        transformOrigin.call(instance);
        ctx.translate(instance.plotWidth, 0);
        drawText.call(instance, processXDate(item.time, instance.dataType), -cx, instance.centerSpace + 12 * instance.sharpness, undefined, 'center', 'top');
        ctx.restore();
      }

      margin += blockWidth + blockMargin;
    }

    ctx.restore();
  }
  /** 主图层：蜡烛、实时价线与标签、右侧 Y 轴报价 */


  function drawMainLayer(instance) {
    instance.ctx = instance.ctxMain;
    var ctx = instance.ctxMain;
    ctx.save();
    resetLayerTransform(instance, ctx);
    ctx.translate(0, TOP_SPACE * instance.sharpness);
    ctx.translate(RIGHT_SPACE * instance.sharpness, 0);
    var lineWidth = LINE_WIDTH * instance.sharpness;
    var margin = BLOCK_MARGIN * instance.sharpness;
    var blockMargin = margin;
    var blockWidth = instance.blockWidth * instance.sharpness;
    var realTime;
    var realTimeYPoint;

    for (var i = 0; i < instance.dataArr.length; i++) {
      if (i !== 0 && (margin < (instance.movingRange - RIGHT_SPACE * 2) * instance.sharpness || margin > instance.movingRange * instance.sharpness + instance.plotWidth)) {
        margin += blockWidth + blockMargin;
        continue;
      }

      var item = instance.dataArr[i];
      var col = void 0;
      var blockHeight = void 0;
      var blockYPoint = void 0;
      var lineHeight = void 0;
      var lineYPoint = void 0;

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
    drawLine.call(instance, (instance.movingRange - RIGHT_SPACE) * instance.sharpness, realTimeYPoint, (instance.movingRange - RIGHT_SPACE) * instance.sharpness + instance.plotWidth, realTimeYPoint, '#cccccc');
    ctx.save();
    ctx.translate(-RIGHT_SPACE * instance.sharpness, 0);
    transformOrigin.call(instance);
    drawRect.call(instance, (17 - instance.movingRange) * instance.sharpness, realTimeYPoint - 10 * instance.sharpness, ctx.measureText(realTime).width + 6 * instance.sharpness, 20 * instance.sharpness, '#cccccc');
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
    var ctx = instance.ctxSub;
    ctx.save();
    resetLayerTransform(instance, ctx);
    ctx.translate(0, TOP_SPACE * instance.sharpness);
    ctx.translate(RIGHT_SPACE * instance.sharpness, 0);
    var mainTop = instance.mainPlotHeight;
    var subBottom = mainTop + instance.subPlotHeight;
    var margin = BLOCK_MARGIN * instance.sharpness;
    var blockMargin = margin;
    var blockWidth = instance.blockWidth * instance.sharpness;

    for (var i = 0; i < instance.dataArr.length; i++) {
      if (i !== 0 && (margin < (instance.movingRange - RIGHT_SPACE * 2) * instance.sharpness || margin > instance.movingRange * instance.sharpness + instance.plotWidth)) {
        margin += blockWidth + blockMargin;
        continue;
      }

      var item = instance.dataArr[i];
      var vol = Number.isFinite(item.volume) ? item.volume : 0;
      var barH = vol * instance.perVolumePixel;

      if (vol > 0 && barH < 1 * instance.sharpness) {
        barH = 1 * instance.sharpness;
      }

      var col = item.open > item.close ? instance.volumeDownColor : instance.volumeUpColor;
      var yTop = subBottom - barH;
      drawRect.call(instance, margin, yTop, blockWidth, barH, col);
      margin += blockWidth + blockMargin;
    }

    ctx.restore();
  }

  function drawOverlayLayer(instance) {
    instance.ctx = instance.ctxOverlay;
    var ctx = instance.ctxOverlay;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    resetLayerTransform(instance, ctx);
    drawCrossLine.call(instance);
  }
  /**
   * 全量重绘：清四层 → 网格 → 主图 → 副图占位 → 十字线。
   */


  function drawFull(instance) {
    if (!instance.dataArr.length) return;
    computeTotalWidth.call(instance);
    computeSpaceY.call(instance);

    if (instance.showVolume) {
      computeVolumeScale(instance);
    }

    runComputeIndicators(instance);
    var keys = ['ctxGrid', 'ctxMain', 'ctxSub', 'ctxOverlay'];

    for (var k = 0; k < keys.length; k++) {
      var ctx = instance[keys[k]];
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

  function redrawOverlay(instance) {
    if (!instance.dataArr.length) return;
    var ctx = instance.ctxOverlay;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, instance.plotWidth, instance.plotHeight);
    drawOverlayLayer(instance);
  }
  /**
   * 数据或视口变化时请求全量重绘（由调度器合并到 rAF）。
   */

  function updateData() {
    this.markDirty(DIRTY_FULL);
  }

  /**
   * 内部单根 K 线：字段均为 number；time 为 Unix 秒（与 utils.getDate 中 timestamp*1000 约定一致）
   * @typedef {{ time: number, open: number, high: number, low: number, close: number, volume: number }} NormalizedBar
   */

  /** 接口常见 vol / volume，按序取第一个可解析的；皆无则 volume 为 0 */

  var DEFAULT_VOLUME_KEYS = ['vol', 'volume'];
  /** 统一成有限数字，否则返回 NaN，由 normalizeBar 集中校验 */

  function toFiniteNumber(value) {
    var n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : NaN;
  }
  /**
   * 内部时间一律为 Unix 秒。若误传毫秒（数量级 > 1e11），则 floor(t/1000)。
   * @param {number} t
   */


  function normalizeTimeSeconds(t) {
    if (!Number.isFinite(t)) return NaN;
    if (t > 1e11) return Math.floor(t / 1000);
    return t;
  }
  /**
   * 单条 API 行 → NormalizedBar。OHLC 或 time 非法时抛错，避免画出「安静错误」的图。
   * @param {Record<string, unknown>} raw 原始行情对象
   * @param {string[]} [volumeKeys] 成交量字段候选名，按顺序取第一个有值的
   * @returns {NormalizedBar}
   */


  function normalizeBar(raw) {
    var volumeKeys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_VOLUME_KEYS;

    if (!raw || _typeof(raw) !== 'object') {
      throw new TypeError('normalizeBar: 需要对象');
    }

    var time = normalizeTimeSeconds(toFiniteNumber(raw[TIME_INDEX]));
    var open = toFiniteNumber(raw[START_PRICE_INDEX]);
    var high = toFiniteNumber(raw[MAX_PRICE_INDEX]);
    var low = toFiniteNumber(raw[MIN_PRICE_INDEX]);
    var close = toFiniteNumber(raw[END_PRICE_INDEX]);

    if (![time, open, high, low, close].every(Number.isFinite)) {
      throw new Error('normalizeBar: time 或 OHLC 无法解析为有效数字');
    }

    var volume = 0;

    var _iterator = _createForOfIteratorHelper(volumeKeys),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var key = _step.value;
        if (raw[key] === undefined || raw[key] === null || raw[key] === '') continue;
        var v = toFiniteNumber(raw[key]);

        if (Number.isFinite(v)) {
          volume = v;
          break;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }

    return {
      time: time,
      open: open,
      high: high,
      low: low,
      close: close,
      volume: volume
    };
  }
  /**
   * 批量规范化，供 updateHistoryQuote 入队前一次性转换。
   * @param {Record<string, unknown>[]} list
   * @param {string[]} [volumeKeys]
   * @returns {NormalizedBar[]}
   */

  function normalizeBars(list, volumeKeys) {
    if (!Array.isArray(list)) return [];
    return list.map(function (row) {
      return normalizeBar(row, volumeKeys);
    });
  }

  function protoAction (klineProto) {
    /**
     * 同步所有分层 canvas 的像素尺寸与字体线宽（容器变化、sharpness 变化时调用）。
     * 不在拖拽/十字线移动时每帧调用，避免缓冲反复重建。
     */
    klineProto.prototype.resetCanvas = function () {
      resizeAllLayers(this);
    };
    /**
     * 加载loading.gif & 更多数据
     * @params location - loading的位置 - center/left/right 默认center
     */


    klineProto.prototype.loading = function () {
      var location = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'center';
      if (this.loadingStatus) return;
      var locationStyles = {
        center: 'left: 50%;margin-left: -10px;',
        left: 'left: 10px;',
        right: "right: ".concat(RIGHT_SPACE, "px")
      };
      var text = document.createElement('span');
      text.innerHTML = 'loading...';
      text.style = "position: absolute;top: 50%;margin-top: -10px;width: 20px;opacity: .8;".concat(locationStyles[location]);
      this.cBox.appendChild(text);
      this.loadingStatus = true; //如果需要加载更多，就调用callback

      if (location === 'left' && this.callbackMore) {
        this.callbackMore();
      } //首次加载或切换type类型，从头绘制数据


      if (location === 'center') {
        this.fromSpaceNum = 0;
        this.movingRange = 0;
        this.resetCanvas();
      }
    }; // 切换清晰度


    klineProto.prototype.changeSharpness = function (sharpness) {
      if (this.loadingStatus) return;
      this.sharpness = sharpness;
      this.processParams();
      this.resetCanvas();
      updateData.call(this);
    };
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
      var oldTotalLen = this.totalWidth;
      this.blockWidth += scaleTimes * 2;
      this.processParams(); // 根据新blockWidth, 先重新计算总宽度

      computeTotalWidth.call(this); // 再根据推导公式计算出diffRange, 也就是需要移动的距离

      var newRange = (this.movingRange * this.sharpness * this.totalWidth + this.plotWidth / 2 * this.totalWidth - this.plotWidth / 2 * oldTotalLen) / oldTotalLen / this.sharpness;
      var diffRange = newRange - this.movingRange; // 最后调用函数去移动图表, 重新绘制

      this.translateKLine(diffRange);
    }; // 移动图表
    // range - 需要移动的距离，向右为正，向左为负


    klineProto.prototype.translateKLine = function (range) {
      if (this.loadingStatus) return;
      this.movingRange += parseInt(range);
      var maxMovingRange = (this.totalWidth - this.plotWidth) / this.sharpness + this.blockWidth;

      if (this.totalWidth <= this.plotWidth || this.movingRange <= 0) {
        // 到了最右边
        this.movingRange = 0;
      } else if (this.movingRange >= maxMovingRange) {
        // 到了最左边 - 可以加载更多历史数据
        this.movingRange = maxMovingRange;
        this.loading('left');
      }

      updateData.call(this);
    }; // 切换十字线状态 status 1显示 0不显示


    klineProto.prototype.changeCrossLineStatus = function (status) {
      this.crossLineStatus = status ? true : false;
      if (typeof this.markDirty === 'function') this.markDirty(DIRTY_OVERLAY);
    }; // 实时报价


    klineProto.prototype.updateRealTimeQuote = function (quote) {
      if (!quote) return;
      pushQuoteInData.call(this, quote);
    };
    /**
     * 历史报价
     * @param {Array} data 数据
     * @param {int}   type 报价类型  默认 60(1小时)
     *    (1, 5, 15, 30, 60, 240, 1440, 10080, 43200)
     *    (1分钟 5分钟 15分钟 30分钟 1小时 4小时 日 周 月)
     * @param {Boolean} reloadData 是否重新加载数据
     * @param {Fn} callback 回调函数 加载更多数据
     */


    klineProto.prototype.updateHistoryQuote = function (_ref) {
      var data = _ref.data,
          _ref$type = _ref.type,
          type = _ref$type === void 0 ? 60 : _ref$type,
          _ref$reloadData = _ref.reloadData,
          reloadData = _ref$reloadData === void 0 ? false : _ref$reloadData,
          callback = _ref.callback;

      if (reloadData) {
        this.dataArr = []; // 全量重拉时与旧时间轴脱钩，避免实时合并仍引用上一批数据的 lastDataTimestamp

        this.lastDataTimestamp = undefined;
      }

      this.callbackMore = callback;
      var spanList = this.cBox.getElementsByTagName('span'); // 使用循环删除 span

      var _iterator = _createForOfIteratorHelper(spanList),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var span = _step.value;
          this.cBox.removeChild(span);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      this.loadingStatus = false;
      if (!(data instanceof Array) || !data.length) return; // 接口原始行 → { time, open, high, low, close, volume }，再拼入内存（与 pushQuoteInData 结构一致）

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
        var children = _toConsumableArray(this.cBox.children);

        for (var i = 0; i < children.length; i++) {
          var node = children[i];

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

  function pushQuoteInData(quote) {
    if (this.loadingStatus) return;
    var bar = normalizeBar(quote);

    if (!this.dataArr.length) {
      // 尚无历史时，直接以首条实时作为第一根 K 线
      this.dataArr.unshift(bar);
      this.lastDataTimestamp = bar.time;
      updateData.call(this);
      return;
    }

    this.lastDataTimestamp = this.lastDataTimestamp || this.dataArr[0].time; // bar.time 与 lastDataTimestamp 均为秒；dataType 为分钟（如 5 表示 5 分钟线）

    var diffMinutes = (bar.time - this.lastDataTimestamp) / 60;

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

  var RenderKLine = /*#__PURE__*/function () {
    function RenderKLine(id,
    /*Optional*/
    options) {
      _classCallCheck(this, RenderKLine);

      if (!id) return;
      options = options || {};
      this.id = id; //canvas box id

      this.cBox = document.getElementById(id); // options params

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
      this.maColors = Array.isArray(options.maColors) && options.maColors.length ? options.maColors : ['#F5A623', '#9013FE', '#4A90E2', '#00B8D4', '#7CB342'];
      this.showVolume = options.showVolume !== false;
      this.volumeUpColor = options.volumeUpColor || this.buyColor;
      this.volumeDownColor = options.volumeDownColor || this.sellColor; //basic params

      this.totalWidth = 0; //总宽度

      this.movingRange = 0; //横向移动的距离 取正数值，使用时再加负号

      this.minPrice = 9999999;
      this.maxPrice = 0; //绘制的所有数据中 最小/最大数据 用来绘制y轴

      this.diffPrice = 0; //最大报价与最小报价的差值

      this.perPricePixel = 0; //每一个单位报价占用多少像素

      this.centerSpace = 0; //x轴到顶部的距离 绘图区域

      this.xDateSpace = 6; //x轴上的时间绘制间隔多少组

      this.fromSpaceNum = 0; //x轴上的时间绘制从第 (fromSpaceNum%xDateSpace) 组数据开始 

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

      this.init(); //初始化视图

      protoAction.call(this, RenderKLine); //挂载实例上的方法 (提供外部调用)
    }

    _createClass(RenderKLine, [{
      key: "init",
      value: function init() {
        var _this = this;

        var root = document.createElement('div');
        root.className = 'kline-root';
        root.style.cssText = 'position:relative;width:100%;height:100%;box-sizing:border-box;';

        var mkLayer = function mkLayer(cls, z) {
          var c = document.createElement('canvas');
          c.className = cls;
          c.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:".concat(z);
          return c;
        };

        var grid = mkLayer('kline-layer-grid', 1);
        var main = mkLayer('kline-layer-main', 2);
        var sub = mkLayer('kline-layer-sub', 3);
        var overlay = mkLayer('kline-layer-overlay', 4);
        overlay.style.pointerEvents = 'auto';
        root.append(grid, main, sub, overlay);
        this.cBox.appendChild(root);
        this.layerRoot = root;
        /** @deprecated 兼容旧逻辑：等价于主图层 canvas，尺寸与 plotWidth/plotHeight 一致 */

        this.canvas = main;
        this.layers = {
          grid: grid,
          main: main,
          sub: sub,
          overlay: overlay
        };
        this.ctxGrid = grid.getContext('2d');
        this.ctxMain = main.getContext('2d');
        this.ctxSub = sub.getContext('2d');
        this.ctxOverlay = overlay.getContext('2d');
        this.ctx = this.ctxMain;
        /** 与画布同尺寸的命中元素（顶层 overlay），用于十字线 Client 坐标换算 */

        this.hitTarget = overlay;
        resizeAllLayers(this);
        observeContainerResize(this, function () {
          resizeAllLayers(_this);
          if (_this.dataArr.length) _this.markDirty(DIRTY_FULL);
        });
        attachScheduler(this, {
          drawFull: drawFull,
          redrawOverlay: redrawOverlay
        });
        attachChartInteractions(this);
      }
    }, {
      key: "processParams",
      value: function processParams() {
        var sharpness,
            blockWidth = parseInt(this.blockWidth); //清晰度判断

        if ((sharpness = parseInt(this.sharpness)) && sharpness >= 1) {
          this.sharpness = sharpness;
        } else {
          this.sharpness = 2;
        } //方块宽度判断


        if (blockWidth) {
          if (blockWidth < 3) {
            this.blockWidth = 3;
          } else if (blockWidth > 49) {
            this.blockWidth = 49;
          } else {
            this.blockWidth = blockWidth % 2 ? blockWidth : blockWidth - 1;
          }
        } else {
          this.blockWidth = 11;
        } //xDateSpace判断


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
    }]);

    return RenderKLine;
  }();

  function normalizeMaPeriods(raw) {
    if (raw === undefined || raw === null) return [5, 10, 20];

    if (Array.isArray(raw)) {
      var list = raw.map(function (p) {
        return parseInt(p, 10);
      }).filter(function (p) {
        return Number.isFinite(p) && p > 0;
      });
      return list.length ? list : [];
    }

    return [5, 10, 20];
  }

  return RenderKLine;

})));
