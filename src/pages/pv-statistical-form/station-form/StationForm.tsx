import React, { useState, useEffect } from 'react'
import styles from './station-form.less'
import { Table1, message } from 'wanke-gui'
import RangePicker from '../../../components/range-picker/RangePicker'
import TabSelect from '../../../components/TabSelect'
import { makeConnect } from '../../umi.helper'
import { ETimeZone, station_form } from '../../constants'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { StationFormModal } from './model'
import moment from 'moment'
import ExportButton from '../../../components/ExportButton'
import { disabledDateAfterToday } from '../../../util/dateUtil'
import utils from "../../../public/js/utils";
import Page from '../../../components/Page'
import PageProps from '../../../interfaces/PageProps'
import { conversionUnit, fixDigits, judgeEmpty } from '../../../util/utils'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import FormLayout from '../../../components/FormLayout'
import classNames from 'classnames'

const { FieldItem } = FormLayout

export const PickerMap = {
  'day': 'date',
  'month': 'month',
  'year': 'year'
}

export const tabList = [
  {
    key: "day",
    name: utils.intl("common.日"),
    value: "day"
  },
  {
    key: "month",
    name: utils.intl("common.月"),
    value: "month"
  },
  {
    key: "year",
    name: utils.intl("common.年"),
    value: "year"
  },
  {
    key: "total",
    name: utils.intl("common.总"),
    value: "total"
  }
]

export const TimeFormatMap = {
  'day': 'YYYY-MM-DD',
  'month': 'YYYY-MM',
  'year': 'YYYY',
}

export enum EFeedInType {
  Full = 'full',
  Part = 'part'
}

export enum EStationReportProperty {
  date = 'date',
  // 发电量
  generatedElectricity = 'generatedElectricity',
  // 满发时长
  yield = 'yield',
  // 累计辐照量
  irradiance = 'irradiance',
  // PR
  performanceRatio = 'performanceRatio',
  // CO2减排
  co2Reduction = 'co2Reduction',
  // 电网售电收益
  gridSaleProfit = 'gridSaleProfit',
  // 平均电网售电价格
  avgGridSalePrice = 'avgGridSalePrice',
  // 非电网售电收益
  otherSaleProfit = 'otherSaleProfit',
  // 平均非电网售电价格
  otherAvgSalePrice = 'otherAvgSalePrice',
  // 理论LGC赚取数量
  theoreticalGeneration = 'theoreticalGeneration',
  // 实际LGC赚取数量
  realEarnLgcCount = 'realEarnLgcCount',
  // 实际LGC售出价格
  realSaleLgcCount = 'realSaleLgcCount',
  // LGC单价
  lgcPrice = 'lgcPrice',
  // LGC收益
  lgcProfit = 'lgcProfit',
  // 总收益
  totalProfit = 'totalProfit',
  // 上网电量
  gridProduction = 'gridProduction',
  // 自发自用电量
  selfProduction = 'selfProduction'
}

export function nameToHump(name: string) {
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

let timeZone;
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
    name: { pointNumberType: 'OngridProfitDay', property: EStationReportProperty.gridSaleProfit },
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
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitDay', property: EStationReportProperty.gridSaleProfit },
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
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitDay', property: EStationReportProperty.gridSaleProfit },
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitDay', property: EStationReportProperty.gridSaleProfit },
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
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitDay', property: EStationReportProperty.gridSaleProfit },
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitMonth', property: EStationReportProperty.gridSaleProfit },
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
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitMonth', property: EStationReportProperty.gridSaleProfit },
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
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitMonth', property: EStationReportProperty.gridSaleProfit },
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
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitMonth', property: EStationReportProperty.gridSaleProfit },
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key3 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2] + record[key3];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitMonth', property: EStationReportProperty.gridSaleProfit },
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitMonth', property: EStationReportProperty.gridSaleProfit },
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
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitMonth', property: EStationReportProperty.gridSaleProfit },
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
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitYear', property: EStationReportProperty.gridSaleProfit },
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
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitYear', property: EStationReportProperty.gridSaleProfit },
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
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitYear', property: EStationReportProperty.gridSaleProfit },
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key3 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2] + record[key3];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitYear', property: EStationReportProperty.gridSaleProfit },
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitYear', property: EStationReportProperty.gridSaleProfit },
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
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitYear', property: EStationReportProperty.gridSaleProfit },
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
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitAmount', property: EStationReportProperty.gridSaleProfit },
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
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitAmount', property: EStationReportProperty.gridSaleProfit },
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
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitAmount', property: EStationReportProperty.gridSaleProfit },
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key3 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2] + record[key3];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitAmount', property: EStationReportProperty.gridSaleProfit },
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }, {
    title: utils.intl("平均非电网售电价格"),
    width: 150,
    align: 'right',
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.otherSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.selfProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    name: { pointNumberType: 'OngridProfitAmount', property: EStationReportProperty.gridSaleProfit },
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
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
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
    render: (text, record) => {
      const key1 = `origin${nameToHump(EStationReportProperty.gridSaleProfit)}`;
      const key2 = `origin${nameToHump(EStationReportProperty.lgcProfit)}`;
      const value = record[key1] + record[key2];
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元') : utils.intl('元');
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
    name: { pointNumberType: 'OngridProfitAmount', property: EStationReportProperty.gridSaleProfit },
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
      const key2 = `origin${nameToHump(EStationReportProperty.gridProduction)}`;
      if (!record[key2]) {
        return null;
      }
      const value = record[key1] / record[key2] * 1000;
      const unit = timeZone === ETimeZone.Australia ? utils.intl('澳元/MWh') : utils.intl('元/MWh');
      const valueObj = conversionUnit({ target: value, unit, language })
      return !judgeEmpty(valueObj.value) ? `${valueObj.value}${valueObj.unit}` : null
    }
  }]
};

export function getColumns(timeMode: string, feedIn: EFeedInType, hasOther: boolean = false, hasLgc: boolean = false) {
  // hasOther表示是否存在非电网售电
  return headerObj[`${timeMode}_${feedIn}_${hasOther}_${hasLgc}`];
}

interface Props
  extends StationFormModal, PageProps,
  MakeConnectProps<StationFormModal> {
  loading?: SVGAnimatedBoolean
  exportLoading?: boolean,
  selectedStationId: number,
  stationList: any[],
  fetchSettingSuccess: boolean
}

const StationForm: React.FC<Props> = (props) => {
  const { stationList, loading, list, exportLoading,
    pageId, selectedStationId, hasOther, feedIn, hasLgc,
    fetchSettingSuccess
  } = props;

  const curStation = stationList.find(item => `${item.id}` === `${selectedStationId}`);

  const [column, setColumn] = useState([]);
  const [query, setQuery] = useState({
    timeRange: [moment(), moment()],
    timeMode: 'day',
    stationId: null,
    dataList: [],
  });

  const handleTimeRangeChange = (range) => {
    setQuery({ ...query, timeRange: range });
  }

  const changeTime = item => {
    const column = getColumns(item.key, feedIn, hasOther, hasLgc) ?? [];
    const dataList = [];
    for (const item of column) {
      if (!item.name || item?.name?.property === EStationReportProperty.date) {
        continue;
      }
      dataList.push(item.name);
    }
    setColumn(column);
    setQuery({
      ...query,
      timeMode: item.key,
      timeRange: [moment(), moment()],
      dataList
    });
  };

  const fetchData = (query) => {
    if (query.stationId) {
      props.action('getTableData', query);
    } else {
      props.updateState({ list: [] })
    }
  }

  const handleExport = () => {
    if (!query.stationId) {
      message.error(utils.intl('common.请选择电站'))
      return
    }
    props.action('onExport', { ...query, timeZone, stationTitle: curStation?.title })
  }

  useEffect(() => {
    if (query.stationId && query.dataList.length) {
      fetchData(query);
    }
  }, [JSON.stringify(query)])

  useEffect(() => {
    return () => {
      props.action('reset');
    }
  }, [])

  useEffect(() => {
    if (selectedStationId) {
      setQuery({ ...query, stationId: selectedStationId });
      props.action('fetchStationSetting', { stationId: selectedStationId });
    }
  }, [selectedStationId])

  useEffect(() => {
    if (fetchSettingSuccess) {
      const curStation = stationList.find(item => `${item.id}` === `${selectedStationId}`);
      timeZone = curStation?.timeZone ?? ETimeZone.Asia;
      const { timeMode } = query;
      const column = getColumns(timeMode, feedIn, hasOther, hasLgc) ?? [];
      const dataList = [];
      for (const item of column) {
        if (!item.name || item?.name?.property === EStationReportProperty.date) {
          continue;
        }
        dataList.push(item.name);
      }
      setQuery({ ...query, dataList });
      setColumn(column);
    }
  }, [fetchSettingSuccess])
  return (
    <Page showStation pageId={pageId} style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column" }}>
      <CrumbsPortal>
        <ExportButton
          loading={exportLoading}
          onExport={handleExport}
          disabled={!query.stationId}
        />
      </CrumbsPortal>
      <FormLayout
        onSearch={() => {
          if (query.stationId && query.dataList.length) {
            fetchData(query)
          }
        }}
        onReset={() => setQuery({ ...query, timeRange: [moment(), moment()], timeMode: 'day' })}>
        <FieldItem style={{ width: language === 'zh' ? 226 : 291 }}>
          <TabSelect list={tabList} onClick={changeTime} value={query.timeMode} size="large" />
        </FieldItem>
        {
          query.timeMode !== 'total' ? (
            <FieldItem>
              <RangePicker
                disabledDate={current => disabledDateAfterToday(current)}
                allowClear={false}
                picker={PickerMap[query.timeMode]}
                style={{ height: 36 }}
                value={query.timeRange}
                onChange={handleTimeRangeChange}
              />
            </FieldItem>
          ) : null
        }
      </FormLayout>
      <section className={classNames(styles['page-container'], "page-sub-container")}>
        {/* <header className={styles['header']}>
          <div className={styles['filter']}>
            <div>
              <TabSelect list={tabList} onClick={changeTime} value={query.timeMode} size="large" />
            </div>
            <div>
              {query.timeMode !== 'total' ? (
                <RangePicker
                  disabledDate={current => disabledDateAfterToday(current)}
                  allowClear={false}
                  picker={PickerMap[query.timeMode]}
                  style={{ height: 36 }}
                  value={query.timeRange}
                  onChange={handleTimeRangeChange}
                />
              ) : ''
              }
            </div>
          </div>
        </header> */}
        <footer className={styles['footer']}>
          {
            <Table1
              x={1150}
              columns={column}
              dataSource={list}
              loading={loading}
            />
          }
        </footer>
      </section>
    </Page>
  );
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    selectedStationId: state.global.selectedStationId,
    stationList: state.global.stationList,
    loading: getLoading("getTableData"),
    exportLoading: getLoading("onExport"),
    fetchSettingSuccess: isSuccess('fetchStationSetting')
  }
}

export default makeConnect(station_form, mapStateToProps)(StationForm)
