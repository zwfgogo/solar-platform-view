import { makeModel } from "../umi.helper";
import { income_analyse } from "../constants";
import Service from "./service";
import moment, { Moment } from "moment";
import utils from "../../public/js/utils";
import { formatChartData, sortChartData } from "../page.helper";
import { getActivePowerChartData } from "../storage-run-strategy/run-strategy.helper";
import { fixDigits } from "../../util/utils";

export class IncomeAnalyseModal {
  energyUnits = []
  selectEnergyUnitId = null
  offsetSummary: any = {}
  offsetSummaryUpdateTime = null
  timeRange: [Moment, Moment] = [moment().subtract(7, 'days'), moment().subtract(1, 'days')]
  offsetAnalyseUpdateTime = null
  offsetAnalyse = {
    condition: null, // 充放电工况是否一致
    labelEfficiencyDeviation: null, // 提示文案：充放电效率偏差
    labelSohDeviation: null, // 提示文案：SOH偏差
    actualIncome: null, // 实际收益
    targetIncome: null, // 目标收益
    incomeDeviation: null, // 收益偏差
    theorySystemLoss: null, // 理论系统损耗
    practiceSystemLoss: null, // 实际系统损耗
    systemLossImproveIncome: null, // 系统损耗率优化带来的收益
    sohDeviation: null, // SOH偏差
    sohImproveIncome: null, // SoH优化提升带来的收益
    profitChart: {
      xData: [],
      yData: [],
      deviation: [],
      series: [
        { name: utils.intl('目标收益'), unit: utils.intl('元') },
        { name: utils.intl('实际收益'), unit: utils.intl('元') }
      ],
    },
    systemLossChart: {
      xData: [],
      yData: [],
      series: [
        { name: utils.intl('实际充电效率'), unit: '%' },
        { name: utils.intl('实际放电效率'), unit: '%' },
        { name: utils.intl('理论充电效率'), unit: '%', type: 'line' },
        { name: utils.intl('理论放电效率'), unit: '%', type: 'line' }
      ],
    },
    sohChart: {
      xData: [],
      yData: [],
      series: [
        { name: utils.intl('理论SoH'), unit: '%' },
        { name: utils.intl('实际SoH'), unit: '%' }
      ],
    },
    chargeAndDisChargeChart: {
      xData: [],
      yData: [],
      series: [
        { name: utils.intl('运行策略-有功功率'), unit: 'kW', customOption: { step: 'end' } },
        { name: utils.intl('实际运行工况-有功功率'), unit: 'kW' }
      ],
    },
    socChart: {
      xData: [],
      yData: [],
      series: [
        { name: 'SOC', unit: '%' }
      ],
    },
  }
}

export default makeModel(
  income_analyse,
  new IncomeAnalyseModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getEnergyUnits(action, { select, call, put }) {
        let { selectEnergyUnitId } = yield select(state => state[income_analyse])
        const { stationId } = action.payload
        const data = yield Service.getEnergyUnits({
          stationId
        });

        if (!selectEnergyUnitId && data.length) {
          selectEnergyUnitId = data[0].id;
        }

        yield put({
          type: 'updateToView',
          payload: { energyUnits: data, selectEnergyUnitId }
        });
      },
      *getOffsetSummary(action, { select, call, put }) {
        const { stationId } = action.payload
        const data = yield Service.getOffsetSummary({
          stationId
        });

        yield put({
          type: 'updateToView',
          payload: { offsetSummary: data || {}, offsetSummaryUpdateTime: moment().format('YYYY-MM-DD hh:mm:ss') }
        });
      },
      *getOffsetAnalyse(action, { select, call, put }) {
        let { offsetAnalyse } = yield select(state => state[income_analyse])
        const { stationId, timeRange, energyUnitId } = action.payload
        let result = yield Service.getOffsetAnalyse({
          stationId,
          energyUnitId,
          startDate: timeRange[0].format('YYYY-MM-DD'),
          endDate: timeRange[1].format('YYYY-MM-DD'),
        });
        const {
          condition,
          efficiencyDeviation,
          sohDeviation,
          data = [],
          ActivePower = [],
          SOC = [],
          runStrategiesArgumentList = [],
        } = result || {}

        const newAnalyse = {
          ...offsetAnalyse,
          condition,
          labelEfficiencyDeviation: efficiencyDeviation,
          labelSohDeviation: sohDeviation,
        }
        const len = data?.length || 0
        let actualIncome = 0
        let targetIncome = 0
        let theorySystemLoss = 0
        let practiceSystemLoss = 0
        let systemLossImproveIncome = 0
        let practiceSoh = 0
        let theorySoh = 0
        let sohImproveIncome = 0

        newAnalyse.profitChart.xData = []
        newAnalyse.profitChart.yData = [[], []]
        newAnalyse.systemLossChart.xData = []
        newAnalyse.systemLossChart.yData = [[], [], [], []]
        newAnalyse.sohChart.xData = []
        newAnalyse.sohChart.yData = [[], []]
        newAnalyse.chargeAndDisChargeChart.xData = []
        newAnalyse.chargeAndDisChargeChart.yData = [[], []]
        newAnalyse.socChart.xData = []
        newAnalyse.socChart.yData = [[]]

        data?.forEach(item => {
          actualIncome += item.actualIncome ?? 0
          targetIncome += item.targetIncome ?? 0
          theorySystemLoss += item.theorySystemLoss ?? 0
          practiceSystemLoss += item.practiceSystemLoss ?? 0
          systemLossImproveIncome += item.systemLossImproveIncome ?? 0
          practiceSoh += item.practiceSoh ?? 0
          theorySoh += item.theorySoh ?? 0
          sohImproveIncome += item.sohImproveIncome ?? 0

          const time = moment(item.dtime).format('YYYY-MM-DD')
          newAnalyse.profitChart.xData.push(time)
          newAnalyse.systemLossChart.xData.push(time)
          newAnalyse.sohChart.xData.push(time)

          newAnalyse.profitChart.yData[0].push(fixDigits(item.targetIncome))
          newAnalyse.systemLossChart.yData[0].push(fixDigits(item.actualChargeEfficiency))
          newAnalyse.sohChart.yData[0].push(fixDigits(item.theorySoh))

          newAnalyse.profitChart.yData[1].push(fixDigits(item.actualIncome))
          newAnalyse.systemLossChart.yData[1].push(fixDigits(item.actualDischargeEfficiency))
          newAnalyse.sohChart.yData[1].push(fixDigits(item.practiceSoh))

          newAnalyse.systemLossChart.yData[2].push(fixDigits(item.theoryChargeEfficiency))
          newAnalyse.systemLossChart.yData[3].push(fixDigits(item.theoryDischargeEfficiency))

          newAnalyse.profitChart.deviation.push(fixDigits(item.incomeDeviation))
        })
        newAnalyse.actualIncome = actualIncome
        newAnalyse.targetIncome = targetIncome
        newAnalyse.incomeDeviation = targetIncome ? numberFix(100 * (targetIncome - actualIncome) / targetIncome) : undefined
        newAnalyse.theorySystemLoss = len ? numberFix(theorySystemLoss / len) : theorySystemLoss // 系统理论损耗率
        newAnalyse.practiceSystemLoss = len ? numberFix(practiceSystemLoss / len) : practiceSystemLoss // 实际平均系统损耗率
        newAnalyse.systemLossImproveIncome = systemLossImproveIncome // 优化系统损耗率，预计可带来收益提升
        newAnalyse.sohDeviation = theorySoh ? numberFix(100 * (theorySoh - practiceSoh) / theorySoh) : undefined // 理论SoH和实际SoH平均偏差
        newAnalyse.sohImproveIncome = sohImproveIncome // 提升电池健康，预计可带来收益提升

        const chartOther = {
          runStrategies: getActivePowerChartData(timeRange[0], timeRange[1], runStrategiesArgumentList),
          ActivePower,
          SOC,
        }

        const data1 = formatChartData(newAnalyse.chargeAndDisChargeChart, chartOther, ['runStrategies', 'ActivePower'])
        newAnalyse.chargeAndDisChargeChart = sortChartData(data1, { fillPoint: true })

        const data2 = formatChartData(newAnalyse.socChart, chartOther, ['SOC'])
        newAnalyse.socChart = sortChartData(data2)

        yield put({
          type: 'updateToView',
          payload: { offsetAnalyse: newAnalyse, offsetAnalyseUpdateTime: moment().format('YYYY-MM-DD hh:mm:ss') }
        });
      },
    }
  }
)

function numberFix(value) {
  return value ? value.toFixed(2) : ''
}
