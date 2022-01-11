import utils from "../../public/js/utils"

export enum TrackingChartType {
  C01 = 'C01', // 有功控制/削峰填谷
  C05 = 'C05', // 储能调峰
  C06 = 'C06', // 紧急功率支撑
  C07 = 'C07', // 无功/电压控制
  C19 = 'C19', // 手动控制
}

export const TrackingSocketSubject = {
  [TrackingChartType.C01]: { chart: 'power', data: 'charge' },
  [TrackingChartType.C05]: { chart: 'chart', data: 'statistic' },
  [TrackingChartType.C06]: { chart: 'chart', data: 'statistic' },
  [TrackingChartType.C07]: { chart: 'chart', data: 'statistic' },
  [TrackingChartType.C19]: { chart: 'c19Chart', data: '' },
}

export enum AnalogTypeName {
  ActivePower = 'ActivePower',
  ChargeDay = 'ChargeDay',
  DischargeDay = 'DischargeDay',
  ReactivePower = 'ReactivePower',
  ControlCommand = 'ControlCommand',
  PositiveReactiveEnergyIndication = 'PositiveReactiveEnergyIndication', // 正向无功电能示数
  ReverseReactiveEnergyIndication = 'ReverseReactiveEnergyIndication', // 反向无功电能示数
}

// 点号名字
export const analogsTypeTitleMap = {
  [AnalogTypeName.ActivePower]: utils.intl('有功功率'),
  [AnalogTypeName.ReactivePower]: utils.intl('无功功率'),
  [AnalogTypeName.ControlCommand]: utils.intl('strategy.指令值'),
}

// 点号单位
export const analogsTypeUnitMap = {
  [AnalogTypeName.ActivePower]: 'kWh',
  [AnalogTypeName.ReactivePower]: 'kVar',
  [AnalogTypeName.ControlCommand]: 'kWh',
  [AnalogTypeName.PositiveReactiveEnergyIndication]: 'kVarh',
  [AnalogTypeName.ReverseReactiveEnergyIndication]: 'kVarh',
}

// 跟踪曲线所需点号类型
export const AnalogTypeNameByTypeMap = {
  [TrackingChartType.C01]: [],
  [TrackingChartType.C05]: [AnalogTypeName.ActivePower, AnalogTypeName.ControlCommand],
  [TrackingChartType.C06]: [AnalogTypeName.ActivePower, AnalogTypeName.ControlCommand],
  [TrackingChartType.C07]: [AnalogTypeName.ReactivePower],
  [TrackingChartType.C19]: [],
}

// 跟踪曲线-统计所需点号类型
export const StatisticAnalogTypeNameByTypeMap = {
  [TrackingChartType.C01]: [AnalogTypeName.ChargeDay, AnalogTypeName.DischargeDay],
  [TrackingChartType.C05]: [AnalogTypeName.DischargeDay],
  [TrackingChartType.C06]: [AnalogTypeName.DischargeDay],
  [TrackingChartType.C07]: [AnalogTypeName.PositiveReactiveEnergyIndication, AnalogTypeName.ReverseReactiveEnergyIndication],
  [TrackingChartType.C19]: [],
}

// 调度模式
export enum ControlModes {
  DispatchMode = 'DispatchMode',
  LocalMode = 'LocalMode',
  RemoteMode = 'RemoteMode',
  ManualMode = 'ManualMode',
}

export const isActiveStrategyMap = {
  [`${TrackingChartType.C01}-${ControlModes.LocalMode}`]: true,
  [`${TrackingChartType.C01}-${ControlModes.RemoteMode}`]: true,
  [`${TrackingChartType.C07}-${ControlModes.LocalMode}`]: true,
  [`${TrackingChartType.C07}-${ControlModes.RemoteMode}`]: true,
  [`${TrackingChartType.C19}-${ControlModes.LocalMode}`]: true,
}

// 策略状态
export enum  StrategyStatus {
  wait = 'wait',
  stopped = 'stopped',
  started = 'started',
  executing = 'executing',
}

export const StrategyStatusTitleMap = {
  [StrategyStatus.wait]: utils.intl('strategy.等待'),
  [StrategyStatus.stopped]: utils.intl('strategy.已停用'),
  [StrategyStatus.started]: utils.intl('strategy.已启用'),
  [StrategyStatus.executing]: utils.intl('strategy.执行中'),
}

// 策略控制模式
export enum StrategyControlWay {
  Automatic = 'Automatic',
  Manual = 'Manual',
}

export const StrategyControlWayTitleMap = {
  [StrategyControlWay.Automatic]: utils.intl('strategy.自动控制'),
  [StrategyControlWay.Manual]: utils.intl('strategy.手动控制'),
}

// C19控制类型
export enum C19StrategyControlType {
  ActiveMode = 'ActiveMode',
  ReactiveMode = 'ReactiveMode',
}

export const C19StrategyControlTypeOptions = [
  { name: utils.intl('strategy.有功模式'), value: C19StrategyControlType.ActiveMode },
  { name: utils.intl('strategy.无功模式'), value: C19StrategyControlType.ReactiveMode }
]

// C19控制类型Title
export const C19StrategyControlTypeTitle = {
  [C19StrategyControlType.ActiveMode]: utils.intl('strategy.有功模式'),
  [C19StrategyControlType.ReactiveMode]: utils.intl('strategy.无功模式'),
}
