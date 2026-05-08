/**
 * 多 Canvas 分层（阶段 B）：统一按容器尺寸与 sharpness 设置缓冲区分辨率与 CSS 尺寸。
 * 不在每次 mousemove 时改 width/height（避免不必要的清空与昂贵的缓冲重建）。
 */
import { BOTTOM_SPACE, TOP_SPACE, SUB_CHART_HEIGHT_RATIO, LINE_WIDTH } from '../constant.js';

/**
 * 同步 plot 纵向分区：centerSpace 为 TOP～BOTTOM 之间的可绘区域；主图与预留副图瓜分该区域。
 */
export function updatePlotMetrics(instance) {
  const h = instance.plotHeight;
  instance.centerSpace = h - (BOTTOM_SPACE + TOP_SPACE) * instance.sharpness;
  instance.mainPlotHeight = instance.centerSpace * (1 - SUB_CHART_HEIGHT_RATIO);
  instance.subPlotHeight = instance.centerSpace * SUB_CHART_HEIGHT_RATIO;
}

/**
 * 读取容器宽高，设置四层 canvas 的像素尺寸与 CSS 尺寸，并刷新公共度量。
 * @param {object} instance RenderKLine 实例（需已有 layers、sharpness、cBox）
 */
export function resizeAllLayers(instance) {
  instance.actualWidth = instance.cBox.clientWidth;
  instance.actualHeight = instance.cBox.clientHeight;
  const w = instance.actualWidth * instance.sharpness;
  const h = instance.actualHeight * instance.sharpness;
  instance.plotWidth = w;
  instance.plotHeight = h;

  const keys = ['grid', 'main', 'sub', 'overlay'];
  for (let i = 0; i < keys.length; i++) {
    const canvas = instance.layers[keys[i]];
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${instance.actualWidth}px`;
    canvas.style.height = `${instance.actualHeight}px`;
  }

  updatePlotMetrics(instance);

  const lw = LINE_WIDTH * instance.sharpness;
  const font = `${12 * instance.sharpness}px Arial`;
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
export function observeContainerResize(instance, onResize) {
  instance._resizeDebounceTimer = 0;
  if (typeof ResizeObserver === 'undefined') {
    instance._resizeFallback = () => onResize();
    window.addEventListener('resize', instance._resizeFallback);
    return;
  }
  instance._resizeObserver = new ResizeObserver(() => {
    if (instance._resizeDebounceTimer) clearTimeout(instance._resizeDebounceTimer);
    instance._resizeDebounceTimer = setTimeout(() => {
      instance._resizeDebounceTimer = 0;
      onResize();
    }, 100);
  });
  instance._resizeObserver.observe(instance.cBox);
}

export function disconnectResizeObserver(instance) {
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
