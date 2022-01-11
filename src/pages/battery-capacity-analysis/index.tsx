import React, { useEffect } from 'react'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import utils from '../../public/js/utils'
import { battery_capacity_analysis, globalNS } from '../constants'
import { makeConnect } from '../umi.helper'
import CommonTitle from '../../components/CommonTitle'
import { BatteryCapacityAnalysisModel } from './model'
import './index.less'
import EchartsLineChart from '../../components/charts/EchartsLineChart'
import { useEnergyUnit } from '../../hooks/useEnergyUnitSelect'
import moment from 'moment'
import EchartsBarChart from '../../components/charts/EchartsBarChart'

interface Props extends PageProps, MakeConnectProps<BatteryCapacityAnalysisModel>, BatteryCapacityAnalysisModel {
  fetchSOHChartLoading: boolean
  fetchProfitChartLoading: boolean
}

const BatteryCapacityAnalysis: React.FC<Props> = (props) => {
  const { sohChart, profitChart } = props
  const { selectedEnergyUnitId, selectEnergyUnit } = useEnergyUnit()
  const current = moment()
  const curDay = current.format('YYYY-MM-DD')
  const curMonth = current.format('YYYY-MM')

  useEffect(() => {
    if (selectedEnergyUnitId) {
      props.action('fetchSOHChart', {
        energyUnitId: selectedEnergyUnitId
      })
      props.action('fetchProfitChart', {
        energyUnitId: selectedEnergyUnitId
      })
    }
  }, [selectedEnergyUnitId])

  const filterEnergyUnit = (item) => {
    const pTime = moment(item.productionTime)
    return pTime.isBefore(moment(), 'days')
  }

  return (
    <Page
      pageId={props.pageId}
      pageTitle={utils.intl('容量分析')}
      showStation
      showEnergyUnit={filterEnergyUnit}
      style={{ backgroundColor: "unset" }}
    >
      <section className="battery-capacity-analysis">
        <header>
          <CommonTitle
            title={utils.intl('SOH曲线')}
            iconHeight={18}
          />
          <div className='battery-capacity-chart-box'>
            <EchartsLineChart
              grid={{ left: 50, right: 60 }}
              loading={props.fetchSOHChartLoading}
              xData={sohChart.xData}
              yData={sohChart.yData}
              series={sohChart.series}
              dividing={[curDay, curDay, curDay]}
            />
          </div>
        </header>
        <footer>
          <CommonTitle
            title={utils.intl('收益(预测)曲线')}
            iconHeight={18}
          />
          <div className='battery-capacity-summary'>
            <span>{utils.intl('预计剩余总收益')}:</span>
            <span style={{ margin: '0 16px 0 4px' }}>{props.predictedProfit}</span>
          </div>
          <div className='battery-capacity-chart-box'>
            <EchartsBarChart
              loading={props.fetchProfitChartLoading}
              grid={{ left: 50, right: 60 }}
              legend={{ right: 70 }}
              xData={profitChart.xData}
              yData={profitChart.yData}
              series={profitChart.series}
              dividing={[curMonth, curMonth]}
            />
          </div>
        </footer>
      </section>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    stationId: state[globalNS].selectedStationId,
    fetchSOHChartLoading: getLoading('fetchSOHChart'),
    fetchProfitChartLoading: getLoading('fetchProfitChart'),
  }
}

export default makeConnect(battery_capacity_analysis, mapStateToProps)(BatteryCapacityAnalysis)
