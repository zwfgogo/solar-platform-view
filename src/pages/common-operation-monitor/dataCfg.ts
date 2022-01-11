/**
 * 相关数据处理
 */

 import { result } from "lodash";
 import moment, { Moment } from "moment";
import { FillLabelAxisByRange, fillLabelAxisByRange } from "../../components/charts/common-echarts/calcOption/chartsTool";
import utils from "../../public/js/utils";
 
 interface EChartsParams {
   title: string;
   deviceId: number;
   unit: string;
   val: { dtime: string; val: number }[];
 }
 
 // 功率曲线转换成需要的格式
 export const getChartData = function (
   dataList: { id: number; title: string; unit: string; val: any[] }[],
   activeDate: Moment,
   originYData: any[][],
   originXData: any[],
   time?: FillLabelAxisByRange
 ): {
   xData: string[];
   yData: number[][];
   series: { name: string; unit: string }[];
 } {
   const resultData = {
     xData: [],
     yData: [],
     series: [],
   };
 
   const dateValue = [];
   // console.log('dataList', dataList)
   // resultData.xData = new Array(24 * 60 * 60).fill(0).map((item, index) => moment(activeDate.format('YYYY-MM-DD'), 'YYYY-MM-DD 00:00:00').add(index, 's').format('YYYY-MM-DD HH:mm:ss'))
 
   for (let i = 0; i < dataList.length; i++) {
     const dtimeList = [];
     resultData.series.push({ name: dataList[i].title, unit: dataList[i].unit });
     let dateValueMap = {}
     originXData.forEach((x, index) => {
       dateValueMap[x] = originYData[i][index];
     })
     
     dateValue.push(
       (dataList[i].val || []).reduce((pre, item) => {
        const d = time?.type === 'day' ? moment(item.dtime).format('YYYY-MM-DD') : time?.type === 'month' ? moment(item.dtime).format('YYYY-MM') : item.dtime
         dtimeList.push(d);
         pre[d] = item.val;
         return pre;
       }, dateValueMap)
     );

     if(time){
      resultData.xData = fillLabelAxisByRange({ ...time });
     }else{
        resultData.xData = [...resultData.xData, ...originXData, ...dtimeList];
      if (i === dataList.length - 1) {
        resultData.xData = Array.from(new Set(resultData.xData)).sort((a, b) =>
          a > b ? 1 : -1
        );
      }
     }
   }
 
   for (let i = 0; i < dateValue.length; i++) {
     let num = undefined;
     let pointValue = null;
     resultData.yData.push(
       resultData.xData.map((x, ind) => {
         if (dateValue[i][x] || dateValue[i][x] === 0) {
           num = Number(dateValue[i][x]?.toFixed(2));
         }
        //  pointValue = dateValue[i][x] ? Number(dateValue[i][x]?.toFixed(2)) : null;
         return dateValue[i][x] || dateValue[i][x] === 0
           ? Number(dateValue[i][x]?.toFixed(2))
           : num ?? null;
       })
     );
 
     // if (dataList[i].val && dataList[i].val.length)
     //   resultData.yData.push(
     //     resultData.xData.map((x, ind) => {
     //       if (dateValue[i][x] !== undefined) num = dateValue[i][x];
     //       return dateValue[i][x]
     //         ? Number(dateValue[i][x].toFixed(2))
     //         : num;
     //     })
     //   );
     // else resultData.yData.push(originYData[i] || []);
   }
 
  //  console.log(resultData.xData)
 
   return resultData;
 };
 
 // 电量图表转换成需要的格式
 export const getEChartsData = function (data: {
   ChargeDetail: EChartsParams[]; // -
   DischargeDetail: EChartsParams[]; // +
 }, date: Moment = moment()): {
   xData: string[];
   yData: number[][];
   series: { name: string; unit: string }[];
 } {
   const resultData = {
     xData: [],
     yData: [],
     series: [],
   };
 
   const { ChargeDetail = [], DischargeDetail = [] } = data;
   const mergeDetail = [...ChargeDetail, ...DischargeDetail];
 
   // 图例
   resultData.series = mergeDetail.map((item) => ({
     id: item.deviceId,
     name: item.title,
     unit: "kWh",
   }));
 
   resultData.xData = fillLabelAxisByRange({
    startTime: date.format('YYYY-MM-DD 00:00:00'),
    endTime: date.format('YYYY-MM-DD 23:00:00'),
    stepType: 'hours',
    formater: 'YYYY-MM-DD HH:mm:ss'
   })

   const dateValue = [];
   for (let i = 0; i < mergeDetail.length; i++) {
     dateValue.push(
       (mergeDetail[i].val || []).reduce(
         (pre, item) => ({
           ...pre,
           [item.dtime]:
             i < ChargeDetail.length ? -Math.abs(Number(item.val.toFixed(2))) : Math.abs(Number(item.val.toFixed(2))),
         }),
         {}
       )
     );
   }
 
   for (let i = 0; i < dateValue.length; i++) {
     resultData.yData.push(
       resultData.xData.map((x) => dateValue[i][x]
       )
     );
   }
 
   return resultData;
 };
 
 // 深浅主题echarts颜色
 export const options = {
   ["light-theme"]: {
     yAxis: {
       axisLine: {
         show: true,
         lineStyle: {
           color: "#C0C2C5",
         },
       },
       nameTextStyle: {
         color: "rgba(5,10,25,0.65)",
       },
       splitLine: {
         lineStyle: {
           type: "dashed",
           color: ["#C0C2C5"],
         },
       },
       axisLabel: {
        color: "#666",
        fontSize: 11,
        fontWeight: "lighter",
       }
     },
     xAxis: {
       nameTextStyle: {
         color: "rgba(5,10,25,0.25)",
         verticalAlign: "middle",
       },
       axisLine: {
         show: true,
         lineStyle: {
           color: "#C0C2C5",
         },
       },
       axisLabel: {
        color: "#666",
        fontSize: 11,
        fontWeight: "lighter",
       }
     },
     legend: {
      textStyle: {
        color: "rgba(0,0,0,0.85)",
        fontSize: 14,
        fontFamily: "BlinkMacSystemFont"
      },
    },
   },
   ["dark-theme"]: {
     yAxis: {
       axisLine: {
         show: true,
         lineStyle: {
           color: "#888",
         },
       },
       nameTextStyle: {
         color: "#888",
       },
       splitLine: {
         lineStyle: {
           type: "dashed",
           color: ["#272727"],
         },
       },
       axisLabel: {
        color: "#92929d",
        fontSize: 10,
        fontWeight: "lighter",
       }
     },
     xAxis: {
       axisLine: {
         show: true,
         lineStyle: {
           color: "#888",
         },
       },
       nameTextStyle: {
         color: "#888",
       },
       axisLabel: {
        color: "#92929d",
        fontSize: 10,
        fontWeight: "lighter",
       }
     },
     legend: {
       textStyle: {
        color: "rgba(255,255,255,0.85)",
        fontSize: 14,
        fontFamily: "BlinkMacSystemFont"
       },
     },
   },
 };
 
 // 并网状态
 export const GridConnectStatus = {
   "0": utils.intl('并网运行'),
   "1": utils.intl('孤网运行'),
   "2": utils.intl('并网转孤网'),
   "3": utils.intl('孤网转并网'),
 };
 
 // 表格文案提示
 export const TextMapLoad = {
   Storage: utils.intl('当日累计充电量'),
   PowerGrid: utils.intl('从电网用电量'),
   Load: utils.intl('当日累计用电量'),
 };
 
 export const TextMapUpload = {
   Storage: utils.intl('当日累计放电量'),
   PowerGrid: utils.intl('上网电量'),
   WindPower: utils.intl('当日发电量'),
   Solar: utils.intl('当日发电量'),
   Generation: utils.intl('当日发电量'),
 };
 
 // 告警状态枚举
 export const AlarmLevel = {
   "0": utils.intl('正常'),
   "1": utils.intl('忽略'),
   "2": utils.intl('通知'),
   "3": utils.intl('预警'),
   "4": utils.intl('故障'),
 };
 
 // 运行状态
 export const WorkStatus = {
   "0": utils.intl('离网'),
   "1": utils.intl('运行中'),
   "2": utils.intl('充电中'),
   "3": utils.intl('放电中'),
   "4": utils.intl('蓄电中'),
   "5": utils.intl('发电中'),
   "6": utils.intl('待机'),
   "7": utils.intl('停机中'),
   "8": utils.intl('检修中'),
   "9": utils.intl('调试中'),
   "10": utils.intl('故障'),
 };

 export const WorkColorMap = {
  "0": "rgba(5,10,25,0.45)|rgba(5,10,25,0.05)",
  "1": "#3D7EFF|rgba(61,126,255,0.10)",
  "2": "#52C41A|rgba(82,196,26,0.10)",
  "3": "#FAAD14|rgba(250,173,20,0.10)",
  "4": "#3D7EFF|rgba(61,126,255,0.10)",
  "5": "#52C41A|rgba(82,196,26,0.10)",
  "6": "#3D7EFF|rgba(61,126,255,0.10)",
  "7": "rgba(5,10,25,0.45)|rgba(5,10,25,0.05)",
  "8": "#FAAD14|rgba(250,173,20,0.10)",
  "9": "#FAAD14|rgba(250,173,20,0.10)",
  "10": "#F5222D|rgba(245,34,45,0.10)",
 };
 
 // 天气枚举
 export const weatherMap = {
   Thunderstorm: {
     index: 0,
     img: require("../../static/img/weather/Thunderstorm.svg"),
   },
   Drizzle: {
     index: 1,
     img: require("../../static/img/weather/Rain.svg"),
   },
   Rain: {
     index: 2,
     img: require("../../static/img/weather/Rain.svg"),
   },
   Snow: {
     index: 3,
     img: require("../../static/img/weather/Snow.svg"),
   },
   Mist: {
     index: 4,
     img: require("../../static/img/weather/Mist.svg"),
   },
   Smoke: {
     index: 5,
     img: require("../../static/img/weather/Fog.svg"),
   },
   Haze: {
     index: 6,
     img: require("../../static/img/weather/Fog.svg"),
   },
   Dust: {
     index: 7,
     img: require("../../static/img/weather/Sand.svg"),
   },
   Fog: {
     index: 8,
     img: require("../../static/img/weather/Fog.svg"),
   },
   Sand: {
     index: 9,
     img: require("../../static/img/weather/Sand.svg"),
   },
   Ash: {
     index: 10,
     img: require("../../static/img/weather/Sand.svg"),
   },
   Clear: {
     index: 11,
     img: require("../../static/img/weather/Clear.svg"),
   },
   Clouds: {
     index: 12,
     img: require("../../static/img/weather/Clouds.svg"),
   },
   Squall: {
     index: 13,
     img: require("../../static/img/weather/Squall.svg"),
   },
   Tornado: {
     index: 14,
     img: require("../../static/img/weather/Tornado.svg"),
   },
 };
 
// 维度枚举
export const dateMap = [
  { name: utils.intl('按日'), value: "day" },
  { name: utils.intl('按月'), value: "month" },
  { name: utils.intl('按年'), value: "year" },
]

// 能量单元大类枚举
export const energyUnitTypeMap = {
  "Solar": utils.intl('光伏部分'),
  "Storage": utils.intl('储能部分'),
  "Generation": utils.intl('非新能源发电部分'),
  "Load": utils.intl('用电负荷汇总部分'),
}

// 能量单元电量图表数据类型枚举
export const energyUnitElectricMap = {
  "Solar_discharge": utils.intl('实际发电量'),
  "Solar_theoreticalGeneration": utils.intl('理论发电量'),
  "Storage_discharge": utils.intl('放电量'),
  "Storage_charge": utils.intl('充电量'),
  "Generation_discharge": utils.intl('发电量'),
  "Load_charge": utils.intl('用电量'),
  "Solar_discharge_count": utils.intl('实际总发电量'),
  "Solar_theoreticalGeneration_count": utils.intl('理论总发电量'),
  "Storage_discharge_count": utils.intl('总放电量'),
  "Storage_charge_count": utils.intl('总充电量'),
  "Generation_discharge_count": utils.intl('总发电量'),
  "Load_charge_count": utils.intl('总用电量'),
}

// 新版卡片字段展示
export const cardListFieldMap = {
  "Solar": [`ActivePower|${utils.intl('实时功率')}|kW`, `DischargeDay|${utils.intl('发电量')}|kWh`],
  "Storage": [`ActivePower|${utils.intl('实时功率')}|kW`, `ChargeDay|${utils.intl('充电量')}|kWh`, `DischargeDay|${utils.intl('放电量')}|kWh`],
  "Generation": [`ActivePower|${utils.intl('实时功率')}|kW`, `DischargeDay|${utils.intl('发电量')}|kWh`],
  "Load": [`ActivePower|${utils.intl('实时功率')}|kW`, `ChargeDay|${utils.intl('用电量')}|kWh`],
}
