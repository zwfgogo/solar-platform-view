import React from "react"
import utils from "../../public/js/utils";

function formatValue(str) {
  return str === 'NaN' ? '--' : str
}

// 实时工况卡片列表
export const card_list = [
  {
    title: utils.intl("有功功率"),
    subTitle: '',
    state: (value) => value < 0 ? utils.intl('充电中') : value > 0 ? utils.intl('放电中') : utils.intl('蓄电中'),
    chartValue: (result) => {
      const activePower = Number(result?.ActivePower)?.toFixed(1) || 0
      return <div>{formatValue(activePower)}<div style={{ fontSize: 10 }}>{result?.ActivePowerUnit || 'kW'}</div></div>
    },
    unit: "",
    value: (result) => {
      return result?.RatedPower ? Math.abs((result?.ActivePower || 0)/result?.RatedPower/1.5) : 0
    },
    rightValue: (result, value) => {
      const activePower = result?.ActivePower || 0
      const prefixStr = value > 0 ? '放电' : '充电'
      return value !== 0 ? `${utils.intl(prefixStr + "还需要")}: ${activePower > 0 ? result?.RemainingChargeTime : activePower < 0 ? result?.RemainingDischargeTime : '--'}` : null
    },
  },
  {
    title: "SOC",
    subTitle: '', // (value) => value < 0 ? utils.intl("充电截止") : value > 0 ? utils.intl("放电截止") : "",
    unit: "%",
    chartValue: (result) => {
      const realSOC = result?.RealSOC || 0
      return `${realSOC}%`
    },
    value: (result) => (result?.RealSOC || 0) / 100,
    rightValue: (result, value) => value < 0 ? `${utils.intl("充电截止")}: 99` : value > 0 ? `${utils.intl("放电截止")}: 1` : "",
  },
  {
    title: "SOH",
    subTitle: `${utils.intl("剩余")}:`,
    unit: utils.intl("次循环"),
    chartValue: (result) => {
      const NormalSOH = result?.NormalSOH || 0
      return `${NormalSOH}%`
    },
    value: (result) => (result?.NormalSOH || 0) / 100,
    rightValue: (result) => {
      const remainingRecycleTimes = Number(result?.RemainingRecycleTimes)?.toFixed(0) || 0
      return `${utils.intl("剩余")}: ${formatValue(remainingRecycleTimes)}`
    },
  },
  {
    title: utils.intl("容量衰减"),
    subTitle: `${utils.intl("剩余")}:`,
    unit: utils.intl("天"),
    chartValue: (result) => {
      const realSOH = result?.RealSOH || 0
      return `${realSOH}%`
    },
    value: (result) => (result?.RealSOH || 0) / 100,
    rightValue: (result) => {
      const remainingDays = Number(result?.RemainingDays)?.toFixed(0) || 0
      return `${utils.intl("剩余")}: ${formatValue(remainingDays)}`
    },
  },
]

// 热力图点的颜色列表
export const point_color = {
  'a<=5': '#001cad',
  'a>5&&a<=10': '#0038ff',
  'a>10&&a<=15': '#0094ff', 
  'a>15&&a<=20': '#00ffc1', 
  'a>20&&a<=25': '#25e739', 
  'a>25&&a<=30': '#deff14', 
  'a>30&&a<=35': '#ffe5a3', 
  'a>35&&a<=40': '#ffbc11', 
  'a>40&&a<=45': '#ff5e04', 
  'a>45&&a<=50': '#ee0000', 
  'a>50': '#84002f',
}

export const getDefaultColor = (a) => {
  if(a<=5) return '#001cad';
  else if(a>5&&a<=10) return '#0038ff';
  else if(a>10&&a<=15) return '#0094ff';
  else if(a>15&&a<=20) return '#00ffc1';
  else if(a>20&&a<=25) return '#25e739';
  else if(a>25&&a<=30) return '#deff14';
  else if(a>30&&a<=35) return '#ffe5a3';
  else if(a>35&&a<=40) return '#ffbc11';
  else if(a>40&&a<=45) return '#ff5e04';
  else if(a>45&&a<=50) return '#ee0000';
  else return '#84002f';
}

export const point_tooltip = {
  '≤5': '#001cad',
  '5~10': '#0038ff',
  '10~15': '#0094ff', 
  '15~20': '#00ffc1', 
  '20~25': '#25e739', 
  '25~30': '#deff14', 
  '30~35': '#ffe5a3', 
  '35~40': '#ffbc11', 
  '40~45': '#ff5e04', 
  '45~50': '#ee0000', 
  '>50': '#84002f',
}