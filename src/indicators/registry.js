/**
 * 指标注册表（阶段 D）：compute 在几何/layout 计算之后、绘制之前调用；drawMain 在主图层蜡烛之后执行。
 * 后续可注册 MACD 等，增加 drawSub 钩子。
 */
import { computeMAIndicators, drawMAOnMain } from './ma.js';

/** @typedef {{ name: string, compute?: (inst: object) => void, drawMain?: (inst: object, ctx: CanvasRenderingContext2D) => void, drawSub?: (inst: object, ctx: CanvasRenderingContext2D) => void }} IndicatorSpec */

/** @type {IndicatorSpec[]} */
const registry = [];

/**
 * @param {string} name
 * @param {Omit<IndicatorSpec, 'name'>} spec
 */
export function registerIndicator(name, spec) {
  registry.push({ name, ...spec });
}

export function runComputeIndicators(instance) {
  for (let i = 0; i < registry.length; i++) {
    const ind = registry[i];
    if (ind.compute) ind.compute(instance);
  }
}

export function runDrawMainIndicators(instance, ctx) {
  for (let i = 0; i < registry.length; i++) {
    const ind = registry[i];
    if (ind.drawMain) ind.drawMain(instance, ctx);
  }
}

registerIndicator('ma', {
  compute: computeMAIndicators,
  drawMain: drawMAOnMain
});
