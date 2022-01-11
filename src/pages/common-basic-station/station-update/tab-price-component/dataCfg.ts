import utils from '../../../../util/utils'
// 适用范围类型
export const rangeType = [
  { value: 0, label: utils.intl("全电站") },
  { value: 1, label: utils.intl("能量单元") },
]

// 电价费率枚举
export const priceRate = [
  { value: "RealTime", label: utils.intl("实时电价1") },
  { value: "Single", label: utils.intl("单费率") },
  { value: "Multiple", label: utils.intl("复费率") },
]

// const monthMap = {
//   1: 
// }

// 适用月份
export const monthList = Object.freeze(new Array(12).fill(0).map((_, index) => ({
  value: index + 1,
  label: utils.intl(`price.${index+1}月`)
})))