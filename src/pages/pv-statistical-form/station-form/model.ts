import { makeModel } from "../../umi.helper"
import { station_form, globalNS, ETimeZone } from "../../constants"
import Service from "./service"
import { EFeedInType, EStationReportProperty, nameToHump, TimeFormatMap } from './StationForm'
import { exportCSV } from "../../../util/fileUtil"
import utils from "../../../public/js/utils";
import { conversionUnit, judgeEmpty } from "../../../util/utils"

export const formatStationList = (list) => {
  return list.map(item => ({
    ...item,
    key: item.id,
    selectable: false,
    title: item.title
  }))
}

export class StationFormModal {
  list = []
  hasLgc = false
  hasOther = false
  feedIn = EFeedInType.Full
}

let curTimeZone;
const language = localStorage.getItem('language') ?? 'zh';

const headerObj = {
  'day_full_false_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'GenerationDay', property: EStationReportProperty.generatedElectricity },
    title: utils.intl("发电量"),
    dataIndex: EStationReportProperty.generatedElectricity,
    width: 150,
    align: 'right'
  },
  {
    name: { pointNumberType: 'YieldDayCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceDayCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrDayCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionDay', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitDay', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.generatedElectricity)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }],

  'day_full_false_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'GenerationDay', property: EStationReportProperty.generatedElectricity },
    title: utils.intl("发电量"),
    dataIndex: EStationReportProperty.generatedElectricity,
    width: 150,
    align: 'right'
  },
  {
    name: { pointNumberType: 'YieldDayCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceDayCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrDayCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionDay', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitDay', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.generatedElectricity)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'day_part_true_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyDay', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyDay', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldDayCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceDayCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrDayCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionDay', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitDay', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'NongridProfitDay', property: EStationReportProperty.otherSaleProfit },
    title: utils.intl("非电网售电收益"),
    dataIndex: EStationReportProperty.otherSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }],

  'day_part_false_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyDay', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyDay', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldDayCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceDayCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrDayCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionDay', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitDay', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }],

  'day_part_true_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyDay', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyDay', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldDayCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceDayCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrDayCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionDay', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitDay', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'NongridProfitDay', property: EStationReportProperty.otherSaleProfit },
    title: utils.intl("非电网售电收益"),
    dataIndex: EStationReportProperty.otherSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'day_part_false_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyDay', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyDay', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldDayCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceDayCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrDayCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionDay', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitDay', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'month_full_false_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'GenerationMonth', property: EStationReportProperty.generatedElectricity },
    title: utils.intl("发电量"),
    dataIndex: EStationReportProperty.generatedElectricity,
    width: 150,
    align: 'right'
  },
  {
    name: { pointNumberType: 'YieldMonthCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceMonthCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrMonthCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionMonth', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitMonth', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.generatedElectricity)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.lgcPrice },
    title: utils.intl("LGC单价"),
    dataIndex: EStationReportProperty.lgcPrice,
    width: 150,
    align: 'right',
  }, {
    name: { pointNumberType: 'LgcProfitMonth', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'month_full_false_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'GenerationMonth', property: EStationReportProperty.generatedElectricity },
    title: utils.intl("发电量"),
    dataIndex: EStationReportProperty.generatedElectricity,
    width: 150,
    align: 'right'
  },
  {
    name: { pointNumberType: 'YieldMonthCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceMonthCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrMonthCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionMonth', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitMonth', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.generatedElectricity)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'month_part_true_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyMonth', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyMonth', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldMonthCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceMonthCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrMonthCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionMonth', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitMonth', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'NongridProfitMonth', property: EStationReportProperty.otherSaleProfit },
    title: utils.intl("非电网售电收益"),
    dataIndex: EStationReportProperty.otherSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.lgcPrice },
    title: utils.intl("LGC单价"),
    dataIndex: EStationReportProperty.lgcPrice,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'LgcProfitMonth', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key3 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2] + record[key3];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'month_part_true_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyMonth', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyMonth', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldMonthCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceMonthCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrMonthCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionMonth', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitMonth', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'NongridProfitMonth', property: EStationReportProperty.otherSaleProfit },
    title: utils.intl("非电网售电收益"),
    dataIndex: EStationReportProperty.otherSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'month_part_false_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyMonth', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyMonth', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldMonthCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceMonthCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrMonthCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionMonth', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitMonth', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.lgcPrice },
    title: utils.intl("LGC单价"),
    dataIndex: EStationReportProperty.lgcPrice,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'LgcProfitMonth', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'month_part_false_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyMonth', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyMonth', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldMonthCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceMonthCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrMonthCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionMonth', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitMonth', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'year_full_false_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'GenerationYear', property: EStationReportProperty.generatedElectricity },
    title: utils.intl("发电量"),
    dataIndex: EStationReportProperty.generatedElectricity,
    width: 150,
    align: 'right'
  },
  {
    name: { pointNumberType: 'YieldYearCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceYearCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrYearCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionYear', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitYear', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.generatedElectricity)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'LgcProfitYear', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'year_full_false_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'GenerationYear', property: EStationReportProperty.generatedElectricity },
    title: utils.intl("发电量"),
    dataIndex: EStationReportProperty.generatedElectricity,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldYearCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceYearCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrYearCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionYear', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitYear', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.generatedElectricity)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'year_part_true_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyYear', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyYear', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldYearCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceYearCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrYearCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionYear', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitYear', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'NongridProfitYear', property: EStationReportProperty.otherSaleProfit },
    title: utils.intl("非电网售电收益"),
    dataIndex: EStationReportProperty.otherSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'LgcProfitYear', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key3 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2] + record[key3];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'year_part_true_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyYear', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyYear', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldYearCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceYearCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrYearCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionYear', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitYear', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'NongridProfitYear', property: EStationReportProperty.otherSaleProfit },
    title: utils.intl("非电网售电收益"),
    dataIndex: EStationReportProperty.otherSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'year_part_false_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyYear', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyYear', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldYearCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceYearCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrYearCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionYear', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitYear', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'LgcProfitYear', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'year_part_false_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyYear', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyYear', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldYearCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceYearCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrYearCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionYear', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitYear', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'total_full_false_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'GenerationAmount', property: EStationReportProperty.generatedElectricity },
    title: utils.intl("发电量"),
    dataIndex: EStationReportProperty.generatedElectricity,
    width: 150,
    align: 'right'
  },
  {
    name: { pointNumberType: 'YieldAmountCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceAmountCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrAmountCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionAmount', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitAmount', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.generatedElectricity)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'LgcProfitAmount', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'total_full_false_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'GenerationAmount', property: EStationReportProperty.generatedElectricity },
    title: utils.intl("发电量"),
    dataIndex: EStationReportProperty.generatedElectricity,
    width: 150,
    align: 'right'
  },
  {
    name: { pointNumberType: 'YieldAmountCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceAmountCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrAmountCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionAmount', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitAmount', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.generatedElectricity)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'total_part_true_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyAmount', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyAmount', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldAmountCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceAmountCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrAmountCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionAmount', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitAmount', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'NongridProfitAmount', property: EStationReportProperty.otherSaleProfit },
    title: utils.intl("非电网售电收益"),
    dataIndex: EStationReportProperty.otherSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'LgcProfitAmount', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key3 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2] + record[key3];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'total_part_true_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyAmount', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyAmount', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldAmountCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceAmountCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrAmountCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionAmount', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitAmount', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'NongridProfitAmount', property: EStationReportProperty.otherSaleProfit },
    title: utils.intl("非电网售电收益"),
    dataIndex: EStationReportProperty.otherSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'total_part_false_true': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyAmount', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyAmount', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldAmountCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceAmountCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrAmountCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionAmount', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitAmount', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.theoreticalGeneration },
    title: utils.intl("理论LGC赚取数量"),
    dataIndex: EStationReportProperty.theoreticalGeneration,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realEarnLgcCount },
    title: utils.intl("实际LGC赚取数量"),
    dataIndex: EStationReportProperty.realEarnLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: null, property: EStationReportProperty.realSaleLgcCount },
    title: utils.intl("实际LGC售出数量"),
    dataIndex: EStationReportProperty.realSaleLgcCount,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'LgcProfitAmount', property: EStationReportProperty.lgcProfit },
    title: utils.intl("LGC收益"),
    dataIndex: EStationReportProperty.lgcProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("总收益"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }],

  'total_part_false_false': [{
    name: { pointNumberType: null, property: EStationReportProperty.date },
    title: utils.intl("时间"),
    dataIndex: EStationReportProperty.date,
    width: 150,
    align: 'center'
  }, {
    name: { pointNumberType: 'OngridEnergyAmount', property: EStationReportProperty.gridProduction },
    title: utils.intl("上网电量"),
    dataIndex: EStationReportProperty.gridProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'SelfConsumptionEnergyAmount', property: EStationReportProperty.selfProduction },
    title: utils.intl("自发自用电量"),
    dataIndex: EStationReportProperty.selfProduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'YieldAmountCurrent', property: EStationReportProperty.yield },
    title: utils.intl("满发时长"),
    dataIndex: EStationReportProperty.yield,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'IrradianceAmountCurrent', property: EStationReportProperty.irradiance },
    title: utils.intl("累计辐照量"),
    dataIndex: EStationReportProperty.irradiance,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'PrAmountCurrent', property: EStationReportProperty.performanceRatio },
    title: "PR",
    dataIndex: EStationReportProperty.performanceRatio,
    width: 120,
    align: 'right'
  }, {
    name: { pointNumberType: 'CO2ReductionAmount', property: EStationReportProperty.co2Reduction },
    title: utils.intl("CO2减排"),
    dataIndex: EStationReportProperty.co2Reduction,
    width: 150,
    align: 'right'
  }, {
    name: { pointNumberType: 'ProfitAmount', property: EStationReportProperty.gridSaleProfit },
    title: utils.intl("电网售电收益"),
    dataIndex: EStationReportProperty.gridSaleProfit,
    width: 150,
    align: 'right'
  }, {
    title: utils.intl("平均电网售电价格"),
    width: 150,
    align: 'right',
    renderE: (record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = curTimeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }]
};

function getColumns(timeMode: string, feedIn: EFeedInType, hasOther: boolean = false, hasLgc: boolean = false) {
  return headerObj[`${timeMode}_${feedIn}_${hasOther}_${hasLgc}`];
}

export default makeModel(
  station_form,
  new StationFormModal(),
  (updateState, updateQuery, getState) => {
    return {
      *fetchStationSetting({ payload }, { put, call }) {
        const { stationId } = payload;
        const { hasLgc, hasOther, feedIn } = yield call(Service.fetchStationSetting, { stationId });
        yield updateState(put, {
          hasLgc,
          hasOther,
          feedIn
        });
      },
      *getTableData({ payload }, { put, call, select }) {
        const { timeMode, timeRange, stationId, dataList } = payload
        const startTime = timeMode !== 'total' ? timeRange[0].format(TimeFormatMap[timeMode]) : ''
        const endTime = timeMode !== 'total' ? timeRange[1].format(TimeFormatMap[timeMode]) : ''
        const params = {
          startTime, endTime,
          stationId, dataList
        }
        yield updateState(put, {
          list: []
        })
        const list = yield call(
          Service.getTable,
          params
        )
        yield updateState(put, {
          list: list || []
        })
      },
      *onExport({ payload }, { put, call, select }) {
        const { feedIn, hasOther, hasLgc } = yield select(state => state[station_form]);
        const { timeMode, timeRange, stationId, dataList, timeZone, stationTitle } = payload;
        curTimeZone = timeZone;
        const startTime = timeMode !== 'total' ? timeRange[0].format(TimeFormatMap[timeMode]) : ''
        const endTime = timeMode !== 'total' ? timeRange[1].format(TimeFormatMap[timeMode]) : ''
        const params = {
          startTime, endTime,
          stationId, dataList
        }
        const list = yield call(
          Service.getTable,
          params
        )
        exportCSV(getColumns(timeMode, feedIn, hasOther, hasLgc), list, `${stationTitle}-${startTime}-${endTime}`);
      }
    }
  }
)
