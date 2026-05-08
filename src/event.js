/**
 * 图表交互（阶段 E）：优先 Pointer Events（桌面鼠标 + 触摸统一），降级为 mouse + touch。
 * touch-action: none 避免图表区域抢走纵向滚动由浏览器默认处理。
 */
import { addWheelListener } from './utils.js';
import { DIRTY_OVERLAY } from './scheduler.js';

const hit = (inst) => inst.hitTarget || inst.layerRoot;

/** 双指间距变化超过该像素则触发一次 scaleKLine(±1)，避免抖动 */
const PINCH_DIST_THRESHOLD_PX = 14;

function applyChartTouchStyles(instance) {
  const el = hit(instance);
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
  const pointers = new Map();
  let dragLastClientX = null;
  let pinchAnchorDist = null;

  function pinchDistance() {
    const pts = [...pointers.values()];
    if (pts.length < 2) return 0;
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
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
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (instance.loadingStatus) return;

    if (pointers.size >= 2) {
      const dist = pinchDistance();
      if (pinchAnchorDist != null && dist > 0) {
        const delta = dist - pinchAnchorDist;
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
      const dx = e.clientX - dragLastClientX;
      dragLastClientX = e.clientX;
      instance.translateKLine(dx);
    }
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      el.setPointerCapture(e.pointerId);
    } catch (_) {
      void 0;
    }

    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size === 1) {
      dragLastClientX = e.clientX;
      pinchAnchorDist = null;
    } else if (pointers.size === 2) {
      dragLastClientX = null;
      pinchAnchorDist = pinchDistance();
    }
  }

  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchAnchorDist = null;
    if (pointers.size === 1) {
      const remain = [...pointers.entries()][0];
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
      void 0;
    }
  }

  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  el.addEventListener('pointerleave', clearCrosshair);
  cleanups.push(() => el.removeEventListener('pointermove', onPointerMove));
  cleanups.push(() => el.removeEventListener('pointerdown', onPointerDown));
  cleanups.push(() => el.removeEventListener('pointerup', onPointerUp));
  cleanups.push(() => el.removeEventListener('pointercancel', onPointerUp));
  cleanups.push(() => el.removeEventListener('pointerleave', clearCrosshair));
}

/**
 * 降级：mouse + touch（无 PointerEvent 的环境）。
 */
function attachLegacyMode(instance, el, cleanups) {
  let pageX;
  let touchPinchStart = null;

  function syntheticTouch(touch) {
    return { clientX: touch.clientX, clientY: touch.clientY };
  }

  function onMouseMoveCrosshair(e) {
    if (instance.loadingStatus) return;
    instance.event = e;
    instance.markDirty(DIRTY_OVERLAY);
  }

  function dragMouseMove(e) {
    if (instance.loadingStatus) return;
    e = e || window.event;
    const moveX = e.pageX - pageX;
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
      const dx = ev.touches[0].clientX - ev.touches[1].clientX;
      const dy = ev.touches[0].clientY - ev.touches[1].clientY;
      touchPinchStart = Math.hypot(dx, dy);
    }
  }

  function onTouchMove(ev) {
    if (instance.loadingStatus) return;
    if (ev.touches.length === 1) {
      const t = ev.touches[0];
      instance.event = syntheticTouch(t);
      instance.markDirty(DIRTY_OVERLAY);
      const dx = t.pageX - pageX;
      pageX = t.pageX;
      instance.translateKLine(dx);
      touchPinchStart = null;
    } else if (ev.touches.length === 2 && touchPinchStart != null) {
      const dx = ev.touches[0].clientX - ev.touches[1].clientX;
      const dy = ev.touches[0].clientY - ev.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = dist - touchPinchStart;
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
  cleanups.push(() => el.removeEventListener('mousemove', onMouseMoveCrosshair));
  cleanups.push(() => el.removeEventListener('mousedown', onMouseDown));
  cleanups.push(() => el.removeEventListener('mouseup', onMouseUp));
  cleanups.push(() => el.removeEventListener('mouseleave', onMouseLeaveEl));
  cleanups.push(() => stopDrag());

  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: true });
  el.addEventListener('touchend', onTouchEnd, { passive: true });
  cleanups.push(() => el.removeEventListener('touchstart', onTouchStart));
  cleanups.push(() => el.removeEventListener('touchmove', onTouchMove));
  cleanups.push(() => el.removeEventListener('touchend', onTouchEnd));
}

/**
 * 挂载移动、拖拽、捏合缩放与滚轮（内部统一 Pointer 或降级逻辑）。
 */
export function attachChartInteractions(instance) {
  detachChartInteractions(instance);
  applyChartTouchStyles(instance);
  const el = hit(instance);

  const cleanups = [];
  cleanups.push(addWheelListener(el, e => wheelEvent(instance, e), 'addEventListener', '', false));

  if (typeof window.PointerEvent !== 'undefined') {
    attachPointerMode(instance, el, cleanups);
  } else {
    attachLegacyMode(instance, el, cleanups);
  }
  instance._chartInteractionCleanups = cleanups;
}

/** 移除图表交互监听（destroy 或重复 init 前调用） */
export function detachChartInteractions(instance) {
  const list = instance._chartInteractionCleanups;
  if (!list || !list.length) return;
  for (let i = list.length - 1; i >= 0; i--) {
    try {
      list[i]();
    } catch (_) {
      void 0;
    }
  }
  instance._chartInteractionCleanups = undefined;
}
