/**
 * 绘制调度（阶段 B）：requestAnimationFrame 合并 markDirty；十字线仅刷新 overlay，减轻 CPU。
 */
export const DIRTY_FULL = 1;
export const DIRTY_OVERLAY = 2;

/**
 * @param {object} instance
 * @param {{ drawFull: (inst: object) => void, redrawOverlay: (inst: object) => void }} pipeline
 */
export function attachScheduler(instance, pipeline) {
  let dirty = 0;
  let rafId = 0;

  function flush() {
    rafId = 0;
    const flags = dirty;
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
