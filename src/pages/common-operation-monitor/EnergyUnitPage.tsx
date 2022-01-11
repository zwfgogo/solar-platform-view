/** 能量单元页面    */
import React, { Component } from 'react'
import classNames from 'classnames'
import "./index.less"
import moment, { Moment } from 'moment'
import { DatePicker, FullLoading, MultiLineChart, Select } from 'wanke-gui'
import utils from '../../public/js/utils'
import { WankeFullscreen2Outlined, WankeFullscreenOut2Outlined } from 'wanke-icon'
import { triggerEvent } from '../../util/utils'
import LineChart from '../../components/charts/LineChart'
import { dateMap, energyUnitElectricMap } from './dataCfg'
import BarChart from '../../components/charts/BarChart'

interface Props {
  socketLoading: any
  nowStation: any;
  activePowerData: any;
  electricData: any;
  energyUnit: any;
  energyUnitElectricCount: any;
  incomeData: any;
  incomeCount: number;
  resetActivePowerData: () => void;
  resetElectricData: () => void;
  resetIncomeData: (func) => void;
  onChangeActivePower: (date: Moment) => void;
  onChangeElectric: (dateType: "day" | "month" | "year", date: Moment) => void;
  onChangeIncome: (selfUse: boolean, dateType: "day" | "month" | "year", date: Moment) => void;
}
interface State {
  isScreen1: boolean,
  isScreen2: boolean,
  isScreen3: boolean,
  activeDate: Moment,
  reportDateType: "day" | "month" | "year";
  chargeDate: Moment;
  incomeDateType: "day" | "month" | "year";
  selfUseType: 0 | 1;
  incomeDate: Moment;
}

export default class EnergyUnitPage extends Component<Props, State> {
  state: State = {
    isScreen1: false,
    isScreen2: false,
    isScreen3: false,
    activeDate: moment(),
    reportDateType: "day",
    chargeDate: moment(),
    incomeDateType: "day",
    incomeDate: moment(),
    selfUseType: 1,
  }

  componentDidMount() {
    this.setState({ reportDateType: this.props.energyUnit?.type === 'Storage' ? 'month' : 'day' })
  }

  componentDidUpdate(preProps) {
    if ((preProps.energyUnit?.type !== this.props.energyUnit?.type) && this.props.energyUnit?.type) {
      this.setState({ reportDateType: this.props.energyUnit?.type === 'Storage' ? 'month' : 'day' })
    }
  }

  componentWillUnmount(){
    // console.log('111')
    const { resetActivePowerData, resetElectricData, resetIncomeData } = this.props
    resetActivePowerData();
    resetElectricData();
    resetIncomeData(() => {});
  }

  render() {
    const { nowStation, resetActivePowerData, activePowerData, onChangeActivePower, resetElectricData, onChangeElectric, electricData, energyUnitElectricCount, energyUnit, incomeData, incomeCount, resetIncomeData, onChangeIncome, socketLoading } = this.props
    const { isScreen1, isScreen2, isScreen3, activeDate, reportDateType, incomeDateType, incomeDate, chargeDate, selfUseType } = this.state
    // console.log('electricData', energyUnit)
    return (
      <div className="page-box" style={{ flexDirection: "column" }}>
        <div style={{ marginTop: 0, marginBottom: 0 }} className={classNames("page-second-item", { 'page-screen': isScreen1 })}>
          <div className="page-title">
            {utils.intl('功率曲线')}
            <DatePicker
              style={{ marginLeft: 15, width: 260 }}
              disabledDate={current => moment().add(1, 'days').isBefore(current) || moment(nowStation.productionTime, 'YYYY-MM-DD 00:00:00').isAfter(current)}
              value={activeDate}
              allowClear={false}
              onChange={date => {
                resetActivePowerData();
                this.setState({ activeDate: date })
                onChangeActivePower && onChangeActivePower(date)
              }} />
            <div className="right-icon" onClick={() => this.setState({ isScreen1: !isScreen1 }, () => { triggerEvent('resize', window) })}>
              {isScreen1 ? <WankeFullscreenOut2Outlined /> : <WankeFullscreen2Outlined />}
            </div>
          </div>
          <div className="page-body" style={{ position: 'relative' }}>
            {socketLoading['power_and_irradiance'] && <FullLoading />}
            <MultiLineChart
              series={activePowerData.series}
              xData={activePowerData.xData}
              yData={activePowerData.yData}
              options={{
                startDate: activeDate.startOf('day').valueOf(),
                endDate: activeDate.endOf('day').valueOf(),
                dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
                margin: {
                  left: 55,
                  right: 55,
                  bottom: 30,
                }
              }}
            />
          </div>
        </div>
        <div className={classNames("page-next-item", { 'page-screen': isScreen2 })} style={{ marginBottom: 16, marginTop: isScreen2 ? 0 : 16 }}>
          <div className="page-title">
            {utils.intl('电量图表')}
            <Select
              value={reportDateType}
              dataSource={this.props.energyUnit?.type === 'Storage' ? dateMap.filter(i => i.value !== 'day') : dateMap}
              style={{ width: 100, marginLeft: 8 }}
              checkAllText={utils.intl('全选')}
              onChange={value => {
                resetElectricData();
                const date = moment().format(value === 'month' ? 'YYYY-MM' : value === 'year' ? 'YYYY' : 'YYYY-MM-DD')
                this.setState({ reportDateType: value, chargeDate: moment(date) })
                onChangeElectric && onChangeElectric(value, moment(date))
              }}
            />
            <DatePicker
              style={{ marginLeft: 15, width: 260 }}
              disabledDate={current => moment().add(1, 'days').isBefore(current) || moment(nowStation.productionTime, 'YYYY-MM-DD 00:00:00').isAfter(current)}
              value={chargeDate}
              allowClear={false}
              picker={reportDateType === 'day' ? "date" : reportDateType}
              onChange={date => {
                resetElectricData();
                this.setState({ chargeDate: date })
                onChangeElectric && onChangeElectric(reportDateType, date)
              }} />
            <div className="right-icon" onClick={() => {
              this.setState({ isScreen2: !isScreen2 }, () => { triggerEvent('resize', window) })
            }}>
              {isScreen2 ? <WankeFullscreenOut2Outlined /> : <WankeFullscreen2Outlined />}
            </div>
          </div>
          <div className="page-body" style={{ position: "relative" }}>
            {socketLoading['electric'] && <FullLoading />}
            <BarChart
              series={electricData.series}
              xData={electricData.xData}
              yData={electricData.yData}
              options={{
                startDate: chargeDate.startOf(reportDateType).valueOf(),
                endDate: chargeDate.endOf(reportDateType).valueOf(),
                tooltipDateFormat: reportDateType === 'day' ? 'HH:mm:ss' : reportDateType === 'month' ? 'MM-DD' : 'YYYY-MM',
                dateFormat: (d) => { return moment(d).format(reportDateType === 'day' ? 'HH:mm:ss' : reportDateType === 'month' ? 'MM-DD' : 'YYYY-MM') },
                margin: {
                  left: 55,
                  right: 55,
                  bottom: 30,
                }
              }}
            />
            <div style={{ position: "absolute", top: 1, left: 100 }}>
              {
                Object.keys(energyUnitElectricCount).map(key => (
                  <span style={{ marginRight: 16 }}>{energyUnitElectricMap[key]}：<span style={{ color: "#177ddc", marginLeft: 4, fontSize: 20, fontWeight: 500, marginRight: 3 }}>{energyUnitElectricCount[key]}</span>kWh</span>
                ))
              }
            </div>
          </div>
        </div>
        <div className={classNames("page-second-item", { 'page-screen': isScreen3 })} style={{ marginBottom: 0 }}>
          <div className="page-title">
            {utils.intl('收支曲线')}
            <Select
              value={selfUseType}
              dataSource={[
                { name: utils.intl('不计自发自用'), value: 0 },
                { name: utils.intl('包含自发自用'), value: 1 },
              ]}
              style={{ width: 150, marginLeft: 16 }}
              onChange={value => {
                resetIncomeData(() => {
                  this.setState({ selfUseType: value })
                  onChangeIncome && onChangeIncome(!!value, incomeDateType, incomeDate)
                });

              }}
            />
            <Select
              value={incomeDateType}
              dataSource={dateMap}
              style={{ width: 100, marginLeft: 16 }}
              onChange={value => {
                resetIncomeData(() => {
                  const date = moment().format(value === 'month' ? 'YYYY-MM' : value === 'year' ? 'YYYY' : 'YYYY-MM-DD')
                  this.setState({ incomeDateType: value, incomeDate: moment(date) })
                  onChangeIncome && onChangeIncome(!!selfUseType, value, moment(date))
                });

              }}
            />
            <DatePicker
              style={{ marginLeft: 16, width: 260 }}
              disabledDate={current => moment().add(1, 'days').isBefore(current) || moment(nowStation.productionTime, 'YYYY-MM-DD 00:00:00').isAfter(current)}
              value={incomeDate}
              allowClear={false}
              picker={incomeDateType === 'day' ? "date" : incomeDateType}
              onChange={date => {
                resetIncomeData(() => {
                  this.setState({ incomeDate: date })
                  onChangeIncome && onChangeIncome(!!selfUseType, incomeDateType, date)
                });
                
              }} />
            <div className="right-icon" onClick={() => this.setState({ isScreen3: !isScreen3 }, () => { triggerEvent('resize', window) })}>
              {isScreen3 ? <WankeFullscreenOut2Outlined /> : <WankeFullscreen2Outlined />}
            </div>
          </div>
          <div className="page-body" style={{ position: 'relative' }}>
            {socketLoading['energy_units_profit'] && <FullLoading />}
            {
              this.state.incomeDateType === "day" ? (
                <LineChart
                  series={incomeData.series}
                  xData={incomeData.xData}
                  yData={incomeData.yData}
                  options={{
                    startDate: incomeDate.startOf('day').valueOf(),
                    endDate: incomeDate.endOf('day').valueOf(),
                    dateFormat: (d) => { return moment(d).format('HH:mm:ss') },
                    margin: {
                      left: 55,
                      right: 55,
                      bottom: 30,
                    }
                  }}
                />
              ) : (
                <BarChart
                  series={incomeData.series}
                  xData={incomeData.xData}
                  yData={incomeData.yData}
                  options={{
                    startDate: incomeDate.startOf(incomeDateType).valueOf(),
                    endDate: incomeDate.endOf(incomeDateType).valueOf(),
                    tooltipDateFormat: this.state.incomeDateType === 'month' ? 'MM-DD' : 'YYYY-MM',
                    dateFormat: (d) => { return moment(d).format(this.state.incomeDateType === 'month' ? 'MM-DD' : 'YYYY-MM') },
                    margin: {
                      left: 55,
                      right: 55,
                      bottom: 30,
                    }
                  }}
                />
              )
            }
          </div>
          <div style={{ position: "absolute", top: 51, left: 80 }}>{utils.intl('总收支')}：<span style={{ color: "#177ddc", marginLeft: 4, fontSize: 20, fontWeight: 500, marginRight: 3 }}>{incomeCount}</span>{utils.intl('元')}</div>
        </div>
      </div>
    )
  }
}
