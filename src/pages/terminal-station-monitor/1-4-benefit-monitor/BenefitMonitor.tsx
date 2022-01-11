import React, { useEffect } from 'react'
import classnames from 'classnames'
import Page from '../../../components/Page'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { BenefitMonitorState } from './model'
import { makeConnect } from '../../umi.helper'
import { benefit_monitor } from '../../constants'
import { BarChart, DatePicker, LineChart } from 'wanke-gui'
import FullContainer from '../../../components/layout/FullContainer'
import moment from 'moment'
import { formatMonthDay, formatYearMonth, isBigThanToday } from '../../../util/dateUtil'

const colorArray = [
  '#0062FF'
]
const MonthPicker = DatePicker.MonthPicker

interface Props extends PageProps, MakeConnectProps<BenefitMonitorState>, BenefitMonitorState {
  loading: boolean
}

const BenefitMonitor: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    const { dispatch } = props;
    props.action('reset')
    // props.action('fetchBenefitInfo')
    // props.action('fetchChart')
    props.action('init', { dispatch })
  }, [])

  const setYear = () => {
    props.updateState({
      incomeType: 'month', profitChart: {
        series: [
          {
            name: '收益情况',
            unit: '元'
          }]
      }
    })
    props.action('emitSocket', { eventName: 'curve', params: { stationId: sessionStorage.getItem('station-id'), mod: 'month', dateTime: moment(props.dateTime).format('YYYY') } })
  }

  const setMonth = () => {
    props.updateState({
      incomeType: 'day', profitChart: {
        series: [
          {
            name: '收益情况',
            unit: '元'
          }]
      }
    })
    props.action('emitSocket', { eventName: 'curve', params: { stationId: sessionStorage.getItem('station-id'), mod: 'day', dateTime: moment(props.dateTime).format('YYYY-MM') } })
  }

  const setDay = () => {
    props.updateState({
      incomeType: 'detail', profitChart: {
        series: [
          {
            name: '收益情况',
            unit: '元'
          }]
      }
    })
    props.action('emitSocket', { eventName: 'curve', params: { stationId: sessionStorage.getItem('station-id'), mod: 'detail', dateTime: moment(props.dateTime).format('YYYY-MM-DD') } })
  }

  const setDateTime = (v) => {
    let dateTime = '';
    if (props.incomeType == 'month') {
      dateTime = v.format('YYYY')
    } else if (props.incomeType == 'day') {
      dateTime = v.format('YYYY-MM')
    } else if (props.incomeType == 'detail') {
      dateTime = v.format('YYYY-MM-DD')
    }
    props.updateState({
      dateTime: dateTime, profitChart: {
        series: [
          {
            name: '收益情况',
            unit: '元'
          }]
      }
    })
    props.action('fetchChart')
    props.action('emitSocket', { eventName: 'curve', params: { stationId: sessionStorage.getItem('station-id'), mod: props.incomeType, dateTime: dateTime } })
  }

  let format = ''
  if (props.incomeType == 'month') {
    format = 'YYYY'
  }
  if (props.incomeType == 'day') {
    format = 'YYYY-MM'
  }
  if (props.incomeType == 'detail') {
    format = 'YYYY-MM-DD'
  }
  let tickValues = []
  for (let i = 1; i <= 12; i++) {
    if (i < 10) {
      tickValues.push(moment(moment(props.dateTime).format('YYYY') + '-0' + i))
    } else {
      tickValues.push(moment(moment(props.dateTime).format('YYYY') + '-' + i))
    }
  }
  let tickValuesMonth = []
  let startDay = moment(props.dateTime).startOf('month').format("YYYY-MM-DD")
  for (let i = 0; i < moment(props.dateTime).daysInMonth(); i++) {
    tickValuesMonth.push(moment(startDay).add(i, 'day').startOf('day'))
  }
  const getColor = (count, index) => {
    return colorArray[index]
  }
  return (
    <Page pageId={props.pageId} className="benefit-monitor-page">
      <FullContainer>
        <div className="d-flex">
          <Item index={0} name="累计充电量" value={props.info.charge ? props.info.charge : '--'} icon={require('./22.png')}></Item>
          <Item index={1} name="累计放电量" value={props.info.discharge ? props.info.discharge : '--'} icon={require('./11.png')}></Item>
          <Item index={2} name="累计收益" value={'￥' + props.info.profit} icon={require('./33.png')}></Item>
          <Item index={3} name="累计节省标准煤" value={props.info.coal ? props.info.coal : '--'} icon={require('./44.png')}></Item>
          <Item index={4} name="累计减排CO2" value={props.info.co2 ? props.info.co2 : '--'} icon={require('./55.png')}></Item>
        </div>
        <FullContainer className="chart flex1">
          <div className="h-space">
            <div className="chart-name">
              收益曲线
            </div>
            <div>
              <div className="d-inline-flex" style={{ width: 240, marginRight: 30 }}>
                <div onClick={setYear} className={classnames('flex1 date-type', { selected: props.incomeType == 'month' })}>年</div>
                <div onClick={setMonth} className={classnames('flex1 date-type', { selected: props.incomeType == 'day' })}>月</div>
                <div onClick={setDay} className={classnames('flex1 date-type', { selected: props.incomeType == 'detail' })}>日</div>
              </div>
              {
                props.incomeType == 'day' && (
                  <MonthPicker value={moment(props.dateTime)} onChange={setDateTime} allowClear={false}
                    disabledDate={current => isBigThanToday(current)}
                  />
                )
              }
              {
                props.incomeType == 'month' && (
                  <DatePicker picker="year"
                    value={moment(props.dateTime)}
                    onChange={setDateTime}
                    allowClear={false}
                    disabledDate={current => isBigThanToday(current)}
                  />
                )
              }
              {
                props.incomeType == 'detail' && (
                  <DatePicker format={format}
                    value={moment(props.dateTime)}
                    onChange={setDateTime}
                    disabledDate={current => isBigThanToday(current)}
                    allowClear={false}
                  />
                )
              }
            </div>
          </div>
          <div className="flex1">
            {
              props.incomeType == 'month' && (
                <BarChart
                  loading={props.loading}
                  xData={props.profitChart.xData}
                  yData={props.profitChart.yData}
                  series={props.profitChart.series}
                  options={{
                    dateFormat: formatYearMonth, tooltipDateFormat: 'YYYY-MM',
                    endDate: moment(moment(props.dateTime).format('YYYY') + '-12'),
                    startDate: moment(moment(props.dateTime).format('YYYY') + '-01'), tickWidth: 80, tickValues
                  }}
                />
              )
            }
            {
              props.incomeType == 'day' && (
                <BarChart
                  loading={props.loading}
                  xData={props.profitChart.xData}
                  yData={props.profitChart.yData}
                  series={props.profitChart.series}
                  options={{
                    dateFormat: formatMonthDay, tooltipDateFormat: 'MM-DD', tickWidth: 80,
                    endDate: moment(props.dateTime).endOf('month'),
                    startDate: moment(props.dateTime).startOf('month'),
                    tickValues: tickValuesMonth
                  }}
                />
              )
            }
            {
              props.incomeType == 'detail' && (
                <LineChart
                  loading={props.loading}
                  xData={props.profitChart.xData}
                  yData={props.profitChart.yData}
                  series={props.profitChart.series}
                  options={{ tooltipDateFormat: 'HH:mm:ss', getColor: getColor }}
                />
              )
            }
          </div>
        </FullContainer>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('fetchChart')
  }
}

export default makeConnect(benefit_monitor, mapStateToProps)(BenefitMonitor)

const Item: React.FC<{ index: number, name: string, value: string, icon: string }> = function (this: null, props) {
  return (
    <div className={'flex1 item item' + props.index}>
      <div>
        <section className="count">
          {props.value}
        </section>
        <section className="name">
          {props.name}
        </section>
      </div>
      <div className="item-icon">
        <img src={props.icon} />
      </div>
    </div>
  )
}
