import React, { useEffect, useState } from 'react'
import { FullLoading, Radio, RangePicker, Select } from 'wanke-gui'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { income_analyse } from '../constants'
import { makeConnect } from '../umi.helper'
import { IncomeAnalyseModal } from './model'
import './index.less'
import CardLayout from '../../components/CardLayout'
import CommonTitle from '../../components/CommonTitle'
import EnergyList from './components/EnergyList'
import ProfitCard from './components/ProfitCard'
import EchartsLineChart from '../../components/charts/EchartsLineChart'
import { GfOngridEnergyOutlined, WankeBarChartUpOutlined } from 'wanke-icon'
import { changeUnit } from '../unit.helper'
import { history } from 'umi'
import { disabledDateAfterYesterday } from '../../util/dateUtil'
import moment from 'moment'
import TabSelect from '../../components/TabSelect'
import { isZh } from '../../core/env'
import EchartsBarChart from '../../components/charts/EchartsBarChart'
import { fixDigits } from '../../util/utils'
import RadioTabSelect from '../../components/radio-tab-select/RadioTabSelect'

const tabList = [
  {
    key: "7days",
    name: utils.intl('近7天'),
    value: "7days"
  },
  {
    key: "30days",
    name: utils.intl('近30天'),
    value: "30days"
  }
];

interface Props extends IncomeAnalyseModal, PageProps, MakeConnectProps<IncomeAnalyseModal> {
  stationId: number
  fetchEnergyUnitLoading: boolean
  fetchOffsetSummaryLoading: boolean
  fetchOffsetAnalyseLoading: boolean
}

const IncomeAnalyse: React.FC<Props> = (props) => {
  const { energyUnits, offsetSummary, offsetAnalyse, timeRange } = props
  const startTimeStr = timeRange[0]?.format('YYYY-MM-DD 00:00:00')
  const endTimeStr = timeRange[1]?.format('YYYY-MM-DD 23:59:59')
  const [timeMode, setTimeMode] = useState('7days')
  const jumpToBenefit = () => {
    history.push('/monographic-analysis/benefit')
  }

  useEffect(() => {
    if (props.stationId) {
      props.updateState({ selectEnergyUnitId: null, offsetSummary: {} })
      props.action('getEnergyUnits', { stationId: props.stationId })
      props.action('getOffsetSummary', { stationId: props.stationId })
    }
  }, [props.stationId])

  useEffect(() => {
    if (props.selectEnergyUnitId) {
      props.updateState({offsetAnalyse: (new IncomeAnalyseModal()).offsetAnalyse })
      props.action('getOffsetAnalyse', {
        stationId: props.stationId,
        timeRange: props.timeRange,
        energyUnitId: props.selectEnergyUnitId
      })
    }
  }, [props.selectEnergyUnitId, props.timeRange])

  useEffect(() => {
    return () => {
      props.action('reset')
      // props.updateState({ selectEnergyUnitId: null, offsetSummary: {} })
    }
  }, [])

  const offsetValue = offsetAnalyse.actualIncome
  const offsetValueObj = changeUnit({
    value: offsetValue ?? 0,
    unit: utils.intl('元')
  })
  const offsetTargetValue = offsetAnalyse.targetIncome
  const offsetTargetValueObj = changeUnit({
    value: offsetTargetValue ?? 0,
    unit: utils.intl('元')
  })

  const yesterdayData = offsetSummary.yesterday || {}
  const sevenDayData = offsetSummary.sevenDay || {}
  const thirtyDayData = offsetSummary.thirtyDay || {}
  const amountData = offsetSummary.amount || {}

  const selectEnergyUnit = props.selectEnergyUnitId ? (
    energyUnits.find(item => item.id === props.selectEnergyUnitId)
  ) : null

  const handleDisabledDate = (current) => {
    const productionTime = moment(selectEnergyUnit?.productionTime)

    return disabledDateAfterYesterday(current) || (selectEnergyUnit?.productionTime && productionTime.isAfter(current))
  }

  const getExtraParams = (index: number, xName: string) => {
    const targetIndex = offsetAnalyse.profitChart.xData.findIndex(time => time === xName)

    return [{
      label: utils.intl('偏差'),
      value: targetIndex > -1 ? `${offsetAnalyse.profitChart.deviation[targetIndex]}%` : utils.intl('暂无数据')
    }]
  }

  const changeTime = item => {
    let timeRange: any = []
    if (item.key === '7days') {
      timeRange = [moment().subtract(7, 'days'), moment().subtract(1, 'days')]
    } else {
      timeRange = [moment().subtract(30, 'days'), moment().subtract(1, 'days')]
    }
    setTimeMode(item.key)
    props.updateState({ timeRange })
  };

  const isEqual = offsetAnalyse.condition

  const formatValue = (val) => {
    return val ? fixDigits(val) : val
  }

  const renderSystemLossLabel = () => {
    if (!isEqual) return <div>{utils.intl('当前时间段的运行工况与策略不一致，故系统不分析效率带来的收益偏差')}</div>
    const isGt0 = offsetAnalyse.labelEfficiencyDeviation > 0
    if (!isGt0) return <div>{utils.intl('当前系统运行工况良好，充放电效率值符合预期')}</div>
    if (isZh()) {
      return (
        <div>充放电效率导致收益偏差了<span className="wanke-color-green">{formatValue(offsetAnalyse.labelEfficiencyDeviation)}%</span>，请根据实际情况适当优化设备工况。</div>
      )
    } else {
      return (
        <div>The charge & discharge efficiency leads to a <span className="wanke-color-green">{formatValue(offsetAnalyse.labelEfficiencyDeviation)}%</span> deviation in profit. Please optimize the equipment operating conditions.</div>
      )
    }
  }

  const renderSohLossLabel = () => {
    if (!isEqual) return <div>{utils.intl('当前时间段的运行工况与策略不一致，故系统不分析SoH衰减带来的收益偏差')}</div>
    const isGt0 = offsetAnalyse.labelSohDeviation > 0
    if (!isGt0) return <div>{utils.intl('当前系统运行工况良好，容量衰减符合预期')}</div>
    if (isZh()) {
      return (
        <div>容量衰减导致收益偏差了<span className="wanke-color-green">{formatValue(offsetAnalyse.labelSohDeviation)}%</span>，请根据实际情况对电池进行运维</div>
      )
    } else {
      return (
        <div>The Capacity attenuation leads to a <span className="wanke-color-green">{formatValue(offsetAnalyse.labelSohDeviation)}%</span> deviation in profit. Please maintain the battery.</div>
      )
    }
  }

  return (
    <Page
      pageId={props.pageId}
      pageTitle={utils.intl('收益分析')}
      showStation
      style={{ backgroundColor: "unset" }}
    >
      <section className="income-analyse-container">
        <CardLayout style={{ marginBottom: 16 }}>
          <CommonTitle
            withBorder
            title={utils.intl('基本信息')}
            fontSize={16}
            fontWeight="bold"
          />
          <div style={{ padding: 16, position: 'relative' }}>
            {props.fetchEnergyUnitLoading ? <FullLoading /> : ''}
            <EnergyList
              dataSource={energyUnits}
              loading={false}
            />
          </div>
        </CardLayout>
        <CardLayout style={{ marginBottom: 16 }}>
          <CommonTitle
            withBorder
            title={utils.intl('偏差总览')}
            fontSize={16}
            fontWeight="bold"
            rightAside={(
              <span className="wanke-color-grey" style={{ fontWeight: 'normal' }}>{utils.intl('数据更新时间')}: {props.offsetSummaryUpdateTime || '-'}</span>
            )}
          />
          <div style={{ padding: 16, display: 'flex', position: 'relative' }}>
            {props.fetchOffsetSummaryLoading ? <FullLoading /> : ''}
            <ProfitCard
              title={utils.intl('昨日收益')}
              value={yesterdayData.actualIncome}
              targetValue={yesterdayData.targetIncome}
              offset={yesterdayData.incomeDeviation}
            />
            <ProfitCard
              title={utils.intl('近7天收益')}
              value={sevenDayData.actualIncome}
              targetValue={sevenDayData.targetIncome}
              offset={sevenDayData.incomeDeviation}
            />
            <ProfitCard
              title={utils.intl('近30天收益')}
              value={thirtyDayData.actualIncome}
              targetValue={thirtyDayData.targetIncome}
              offset={thirtyDayData.incomeDeviation}
            />
            <ProfitCard
              title={utils.intl('历史累计收益')}
              value={amountData.actualIncome}
              targetValue={amountData.targetIncome}
              offset={amountData.incomeDeviation}
            />
          </div>
        </CardLayout>
        <CardLayout>
          <CommonTitle
            withBorder
            title={utils.intl('偏差分析')}
            fontSize={16}
            fontWeight="bold"
            labelAside={(
              <div style={{ display: 'flex', alignItems: 'center', marginLeft: 24, fontWeight: 'normal' }}>
                {/* <RangePicker
                  maxLength={30}
                  allowClear={false}
                  disabledDate={handleDisabledDate}
                  style={{ width: 240, marginRight: 16 }}
                  value={props.timeRange}
                  onChange={val => props.updateState({ timeRange: val })}
                /> */}
                <RadioTabSelect list={tabList} onClick={changeTime} value={timeMode} />
                <div style={{ width: 160 }}>
                  <Select
                    dataSource={energyUnits.map(item => ({ name: item.title, value: item.id }))}
                    style={{ width: '100%', marginLeft: 16 }}
                    value={props.selectEnergyUnitId}
                    onChange={(val) => props.updateState({ selectEnergyUnitId: val })}
                  />
                </div>
              </div>
            )}
            rightAside={(
              <span className="wanke-color-grey" style={{ fontWeight: 'normal' }}>{utils.intl('数据更新时间')}: {props.offsetAnalyseUpdateTime || '-'}</span>
            )}
          />
          <div style={{ padding: 16, position: 'relative' }}>
            {props.fetchOffsetAnalyseLoading ? <FullLoading /> : ''}
            <section style={{ display: 'flex', height: 270, marginBottom: 16 }}>
              <div className="income-analyse-offset-summary">
                <div className="income-analyse-offset-summary-info">
                  <span className="offset-title">{utils.intl('实际收益')}</span>
                  <span className="offset-value">{offsetValueObj.value?.toFixed(2)}</span>
                  <span className="offset-unit">({utils.intl('单位')}：{offsetValueObj.unit})</span>
                </div>
                <div className="income-analyse-offset-summary-box">
                  <div className="offset-summary-box-left">
                    <div>
                      <span className="offset-summary-value">{offsetTargetValueObj.value?.toFixed(2)}</span>
                      <span className="offset-summary-unit">{offsetTargetValueObj.unit}</span>
                    </div>
                    <div className="offset-summary-label">{utils.intl('目标收益')}</div>
                  </div>
                  <div className="offset-summary-box-right">
                    <div>
                      <span className="offset-summary-value offset-red">{offsetAnalyse.incomeDeviation ?? 0}</span>
                      <span className="offset-summary-unit">%</span>
                    </div>
                    <div className="offset-summary-label">{utils.intl('偏差')}</div>
                  </div>
                </div>
              </div>
              <div style={{ flexGrow: 1 }}>
                <EchartsLineChart
                  grid={{left: 60}}
                  getExtraParams={getExtraParams}
                  xData={offsetAnalyse.profitChart.xData}
                  yData={offsetAnalyse.profitChart.yData}
                  series={offsetAnalyse.profitChart.series}
                  colorList={['#42CECE', '#FA9B14']}
                  fillLabelAxis={{
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    type: 'day',
                  }}
                />
              </div>
            </section>
            <div className="income-analyse-offset-card">
              <CommonTitle
                title={utils.intl('充放电工况')}
                fontSize={16}
                fontWeight="bold"
                style={{ marginTop: 12, fontWeight: 'bold' }}
              />
              <div style={{ height: 400 }}>
                <EchartsLineChart
                  grid={{left: 60, right: 60}}
                  xData={offsetAnalyse.chargeAndDisChargeChart.xData}
                  yData={offsetAnalyse.chargeAndDisChargeChart.yData}
                  series={offsetAnalyse.chargeAndDisChargeChart.series}
                  colorList={['#FA9B14', '#42CECE']}
                  fillLabelAxis={{
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    step: 15,
                    stepType: 'minutes',
                    formater: 'YYYY-MM-DD HH:mm:ss'
                  }}
                />
              </div>
              <CommonTitle
                title={utils.intl('储能SOC')}
                fontSize={16}
                fontWeight="bold"
                style={{ fontWeight: 'bold' }}
              />
              <div style={{ height: 400 }}>
                <EchartsLineChart
                  grid={{left: 60, right: 60}}
                  xData={offsetAnalyse.socChart.xData}
                  yData={offsetAnalyse.socChart.yData}
                  series={offsetAnalyse.socChart.series}
                  colorList={['#8E57DA']}
                  fillLabelAxis={{
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    step: 15,
                    stepType: 'minutes',
                    formater: 'YYYY-MM-DD HH:mm:ss'
                  }}
                />
              </div>
              <IncomeAnalyseSummary>
                <div>
                  {isEqual ? utils.intl('实时充放电工况与策略基本一致') : utils.intl('实际充放电工况与策略存在偏差，请及时排查运行工况或调整策略')}
                </div>
              </IncomeAnalyseSummary>
            </div>
            <div style={{ display: 'flex', marginTop: 16 }}>
              <div className="income-analyse-offset-card" style={{ marginRight: 16 }}>
                <CommonTitle
                  title={utils.intl('系统效率')}
                  fontSize={16}
                  fontWeight="bold"
                  style={{ marginTop: 12, fontWeight: 'bold' }}
                />
                <div style={{ height: 350 }}>
                  <EchartsBarChart
                    grid={{left: 60}}
                    xData={offsetAnalyse.systemLossChart.xData}
                    yData={offsetAnalyse.systemLossChart.yData}
                    series={offsetAnalyse.systemLossChart.series}
                    colorList={['#6397FF', '#EF58AB', '#74CF47', '#FA9B14']}
                    fillLabelAxis={{
                      startTime: startTimeStr,
                      endTime: endTimeStr,
                      type: 'day',
                    }}
                  />
                </div>
                <IncomeAnalyseSummary>
                  {renderSystemLossLabel()}
                </IncomeAnalyseSummary>
              </div>
              <div className="income-analyse-offset-card">
                <CommonTitle
                  title={utils.intl('SoH衰减')}
                  fontSize={16}
                  fontWeight="bold"
                  style={{ marginTop: 12, fontWeight: 'bold' }}
                />
                <div style={{ height: 350 }}>
                  <EchartsLineChart
                    grid={{left: 60}}
                    xData={offsetAnalyse.sohChart.xData}
                    yData={offsetAnalyse.sohChart.yData}
                    series={offsetAnalyse.sohChart.series}
                    colorList={['#42CECE', '#FA9B14']}
                    fillLabelAxis={{
                      startTime: startTimeStr,
                      endTime: endTimeStr,
                      type: 'day',
                    }}
                  />
                </div>
                <IncomeAnalyseSummary>
                  {renderSohLossLabel()}
                </IncomeAnalyseSummary>
              </div>
            </div>
          </div>
        </CardLayout>
      </section>
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationId: state.global.selectedStationId,
    fetchEnergyUnitLoading: getLoading('getEnergyUnits'),
    fetchOffsetSummaryLoading: getLoading('getOffsetSummary'),
    fetchOffsetAnalyseLoading: getLoading('getOffsetAnalyse'),
  }
}

export default makeConnect(income_analyse, mapStateToProps)(IncomeAnalyse)

interface IncomeAnalyseSummaryProps {
}

const IncomeAnalyseSummary: React.FC<IncomeAnalyseSummaryProps> = (props) => {
  return (
    <div className="income-analyse-summary">
      <WankeBarChartUpOutlined className="income-analyse-summary-icon" />
      <div className="income-analyse-summary-body">
        {props.children}
      </div>
    </div>
  )
}
