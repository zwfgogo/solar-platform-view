import utils from '../public/js/utils'

const unitStepMap = {
  'g|kg': 1000,
  'kg|t': 1000,
  'kg|吨': 1000,
  'kWh|MWh': 1000,
  'MWh|GWh': 1000,
  '元|万元': 10000,
  '万元|亿元': 10000,
  '亿元|万亿元': 10000,
  '澳元|万澳元': 10000,
  '万澳元|亿澳元': 10000,
  '亿澳元|万亿澳元': 10000,
  'yuan|M yuan': 1000000,
  'M yuan|B yuan': 1000,
  'CNY|M CNY': 1000000,
  'M CNY|B CNY': 1000,
  'AUD|M AUD': 1000000,
  'M AUD|B AUD': 1000,
}

const unitMap = {
  'zh': ['g', 'kg', '吨', 'kWh', 'MWh', 'GWh', '元', '万元', '亿元', '万亿元','澳元', '万澳元', '亿澳元', '万亿澳元'],
  'en': ['g', 'kg', 't', 'kWh', 'MWh', 'GWh', 'yuan', 'M yuan', 'B yuan', 'CNY', 'M CNY', 'B CNY', 'AUD', 'M AUD', 'B AUD']
}

type Language = 'zh' | 'en'

interface UnitValue {
  value: number
  unit: string
}

export function changeUnit(target: UnitValue, language: Language = 'zh'): UnitValue {
  const unitList = unitMap[language || 'zh'] // 防止language为null的问题
  const index = unitList.indexOf(target.unit)
  if (index < 0 || index >= unitList.length) return target

  const step = unitStepMap[`${target.unit}|${unitList[index + 1]}`]
  if (!step) return target

  if (Math.abs(target.value) > step) {
    return changeUnit({
      value: target.value / step,
      unit: unitList[index + 1]
    }, language)
  }
  return target
}

const currencyUnitMap = {
  'CNY': '元',
  'AUD': '澳元'
}

export function getUnitByCurrency(currency: string) {
  return utils.intl(currencyUnitMap[currency])
} 
