const BLOCK_MARGIN = 2; //方块水平间距
/**
 * 以下为「外部 / 接口」K 线对象的字段名，供 model/normalize-bar.js 做映射。
 * 内存中 this.dataArr 使用规范化字段 open/high/low/close/time/volume，不再直接读这些键。
 */
const START_PRICE_INDEX = 'open_price'; //开始价格在数据组中的位置
const END_PRICE_INDEX = 'close'; //结束价格在数据组中的位置
const MIN_PRICE_INDEX = 'low'; //最小价格在数据组中的位置
const MAX_PRICE_INDEX = 'high'; //最大价格在数据组中的位置
const TIME_INDEX = 'time'; //时间在数据组中的位置
const LINE_WIDTH = 1; //1px 宽度 (中间线、x轴等)
const BOTTOM_SPACE = 40; //底部空间
const TOP_SPACE = 20; //顶部空间
const RIGHT_SPACE = 60; //右侧空间
/** 副图（成交量等）占中间绘图区 centerSpace 的比例，其余为主图 K 线 */
const SUB_CHART_HEIGHT_RATIO = 0.2;

export {
  BLOCK_MARGIN,
  START_PRICE_INDEX,
  END_PRICE_INDEX,
  MIN_PRICE_INDEX,
  MAX_PRICE_INDEX,
  TIME_INDEX,
  LINE_WIDTH,
  BOTTOM_SPACE,
  TOP_SPACE,
  RIGHT_SPACE,
  SUB_CHART_HEIGHT_RATIO
}