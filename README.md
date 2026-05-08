## Render K-line

基于 HTML5 Canvas 的多层渲染 K 线图（蜡烛图）：历史与实时数据、拖拽与缩放、可选十字线与多条均线；支持桌面与触摸（Pointer Events）。

### 功能概要

- 分层 Canvas（网格 / 主图 / 副图占位 / 十字线 overlay），局部刷新十字线减轻开销  
- 数据入轨前规范化（数值 OHLC、Unix 秒时间），见 `src/model/normalize-bar.js`  
- 默认均线 MA（周期可配）；指标注册表可扩展，见 `src/indicators/registry.js`  
- 触摸：`touch-action: none`，单指拖拽、双指捏合离散缩放（与 `scaleKLine` 步进一致）  

### 本地演示

```bash
npm install
npm run demo
```

浏览器打开：**http://localhost:8080/example/demo.html**（勿用 `file://`，ES modules 需 HTTP 服务）。

开发时可监听构建：

```bash
npm run dev
```

### 构建

```bash
npm run build:dev
npm run build:prod
```

产物：`dist/index.js`（UMD，全局名 `RenderKLine`）。

### 使用方式

**1. script 标签（打包产物）**

```html
<script src="./kline-render/dist/index.js"></script>
<script>
  var options = { /* 见下表 */ };
  var kLine = new RenderKLine('myCanvasBox', options);
  kLine.loading();
  kLine.updateHistoryQuote({ data, type, callback, reloadData });
</script>
```

**2. require**

```js
const RenderKLine = require('kline-render');
```

**3. import（或直接从仓库 `src/index.js` 调试）**

```js
import RenderKLine from 'kline-render';
```

### 构造函数 `options`

| 字段 | 类型 | 说明 |
|------|------|------|
| `sharpness` | number | 清晰度（DPR 倍数），默认 `2` |
| `blockWidth` | number | 蜡烛基准宽度（奇数），默认 `11` |
| `buyColor` / `sellColor` | string | 涨跌色 |
| `fontColor` / `lineColor` | string | 文字与参考线颜色 |
| `digitsPoint` | number | 价格小数位 |
| `horizontalCells` | number | 横向价格网格档数 |
| `crossLineStatus` | boolean | 是否显示十字线，默认 `false` |
| `maPeriods` | number[] | 均线周期，如 `[5,10,20,30]`；传 `[]` 关闭均线；默认 `[5,10,20]` |
| `maColors` | string[] | 与 `maPeriods` 一一对应的颜色，不足则循环默认色 |
| `showVolume` | boolean | 是否在副图绘制成交量，默认 `true` |
| `volumeUpColor` / `volumeDownColor` | string | 成交量柱颜色（涨/跌），默认与 `buyColor` / `sellColor` 相同 |

副图高度占中间绘图区比例由 **`src/constant.js`** 中 **`SUB_CHART_HEIGHT_RATIO`**（默认 `0.2`）控制；成交量在 **`sub` 层**绘制，纵轴按 **当前可视范围内** `volume` 最大值缩放。

### 实例方法

| 方法 | 说明 |
|------|------|
| `loading(location?)` | 加载态；`center` / `left` / `right` |
| `resetCanvas()` | 同步各层 canvas 尺寸（容器或 `sharpness` 变化后） |
| `changeSharpness(n)` | 切换清晰度 |
| `scaleKLine(times)` | 缩放 |
| `translateKLine(range)` | 水平平移 |
| `changeCrossLineStatus(status)` | 十字线开关 |
| `updateRealTimeQuote(quote)` | 实时报价（原始字段同接口，内部会 normalize） |
| `updateHistoryQuote({ data, type, reloadData, callback })` | 历史数据 |
| **`destroy()`** | 断开 ResizeObserver、移除监听与待调度 rAF、去掉 loading 的 `span` 与图表根节点；之后勿再使用该实例 |

### 移动端说明

- 图表区域使用 **`touch-action: none`**，减少被浏览器默认滚动/手势抢占。  
- 优先 **Pointer Events**；极老环境降级为 mouse + touch。  
- 建议在页面中使用合适的 **`viewport`** meta（示例见 `example/demo.html`）。

### Author

- Nan

### License

- MIT
