import { Screen_Web_Url as bigBaseUrl, Storage_Web_Url as baseUrl } from '../constants'

export const dataMap = [
  {
    title: "数据可视化大屏",
    baseUrl: bigBaseUrl,
    img: require("../../static/multi-screen-img/数据可视化大屏.png"),
    url: `/index`,
    background: "linear-gradient(#1da9de, #1471d1)",
  },
  {
    title: "示意图",
    img: require("../../static/multi-screen-img/示意图.png"),
    baseUrl: baseUrl,
    url: `/station-monitor/diagram-video`,
    background: "linear-gradient(#9751f4, #5f28d9)",
  },
  {
    title: "系统接线图",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/系统接线图.png"),
    url: `/station-monitor/system-connect-line`,
    background: "linear-gradient(#9751f4, #5f28d9)",
  },
  {
    title: "电池监测",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/电池监测.png"),
    url: `/station-monitor/battery-monitor`,
    background: "linear-gradient(#9751f4, #5f28d9)",
  },
  {
    title: "实时数据查询",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/实时数据查询.png"),
    url: `/station-monitor/real-data-query`,
    background: "linear-gradient(#9751f4, #5f28d9)",
  },
  {
    title: "历史数据查询",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/历史数据查询.png"),
    url: `/station-monitor/history-data-query`,
    background: "linear-gradient(#9751f4, #5f28d9)",
  },
  {
    title: "SOE查询",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/SOE查询.png"),
    url: `/station-monitor/soe-query`,
    background: "linear-gradient(#9751f4, #5f28d9)",
  },
  {
    title: "运营分析日报",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/运营分析日报.png"),
    url: `/operation-management/analysis-day`,
    background: "linear-gradient(#f07a3e, #e14e24)",
  },
  {
    title: "结算电费查询",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/结算电费查询.png"),
    url: `/operation-management/electricity-bill`,
    background: "linear-gradient(#f07a3e, #e14e24)",
  },
  {
    title: "异常查询",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/异常查询.png"),
    url: `/operation-maintenance/abnormal`,
    background: "linear-gradient(#f07a3e, #e14e24)",
  },
  {
    title: "运行策略管控",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/运行策略管控.png"),
    url: `/optimize-operation/strategy-control`,
    background: "linear-gradient(#5bd6f2, #1c8cce)",
  },
  {
    title: "异常分析",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/异常分析.png"),
    url: `/monographic-analysis/abnormal`,
    background: "linear-gradient(#fec63c, #ef9a1f)",
  },
  {
    title: "效率分析",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/效率分析.png"),
    url: `/monographic-analysis/benefit`,
    background: "linear-gradient(#fec63c, #ef9a1f)",
  },
  {
    title: "收益分析",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/收益分析.png"),
    url: `/monographic-analysis/income`,
    background: "linear-gradient(#fec63c, #ef9a1f)",
  },
  {
    title: "电池分析",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/电池分析.png"),
    url: `/monographic-analysis/battery`,
    background: "linear-gradient(#fec63c, #ef9a1f)",
  },
  {
    title: "电能质量分析",
    baseUrl: baseUrl,
    img: require("../../static/multi-screen-img/电能质量分析.png"),
    url: `/monographic-analysis/power-quality`,
    background: "linear-gradient(#fec63c, #ef9a1f)",
  },
];

// 星期
export const weekMap = ['日', '一', '二', '三', '四', '五', '六']
