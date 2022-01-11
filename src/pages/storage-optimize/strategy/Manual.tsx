import React from 'react'
import classnames from 'classnames'
import {Radio} from 'wanke-gui'
import {FormComponentProps} from '../../../interfaces/CommonInterface'
import TimeSelect from './input/TimeSelect'
import FromTo from '../../../components/layout/FromTo'
import {MonthItem, TimeItem, UnitType} from '../models/update'
import {copy} from '../../../util/utils'
import MonthForm from './MonthForm'
import DesItem from '../../../components/layout/DesItem'
import Des from '../../../components/layout/Des'
import ShowMonthInfo from './ShowMonthInfo'
import moment from 'moment'
import {ValueName} from '../../../interfaces/CommonInterface'

import {MinusCircleOutlined} from 'wanke-icon'
import {PlusOutlined} from 'wanke-icon'

import utils from '../../../public/js/utils'

interface Props extends FormComponentProps {
  modeList: ValueName[]
  typeList: ValueName[]
  expandList: number[]
  unit: UnitType
  open: (index) => void
  close: () => void
  changeMode: (mode: number) => void
  updateUnit: (unit: UnitType) => void
  useTemplate: () => void
}

class Manual extends React.Component<Props> {
  onChange = (index, key, value) => {
    let unit = copy(this.props.unit)
    unit.manualItems[index][key] = value
    this.props.updateUnit(unit)
  }

  onStartTimeChange = (index, key, timeIndex, value) => {
    let unit = copy(this.props.unit)
    unit.manualItems[index][key][timeIndex].start = value ? value.format('HH:mm') : null
    this.props.updateUnit(unit)
  }

  onEndTimeChange = (index, key, timeIndex, value) => {
    let unit = copy(this.props.unit)
    unit.manualItems[index][key][timeIndex].end = value ? value.format('HH:mm') : null
    this.props.updateUnit(unit)
  }

  removeTime = (index, key, timeIndex) => {
    let unit = copy(this.props.unit)
    unit.manualItems[index][key].splice(timeIndex, 1)
    this.props.updateUnit(unit)
  }

  addTime = (index, key) => {
    let unit = copy(this.props.unit)
    unit.manualItems[index][key].push(new TimeItem())
    this.props.updateUnit(unit)
  }

  onMonthChange = (index, value) => {
    this.props.open(index)
    this.onChange(index, 'months', value)
  }

  addMonth = (months) => {
    let unit = copy(this.props.unit)
    let monthItem = new MonthItem()
    monthItem.chargeDischargeType = this.props.typeList[0].value
    monthItem.months = months
    unit.manualItems.push(monthItem)
    this.props.open(unit.manualItems.length - 1)
    this.props.updateUnit(unit)
  }

  onDeleteMonth = (index) => {
    let unit = copy(this.props.unit)
    unit.manualItems.splice(index, 1)
    this.props.close()
    this.props.updateUnit(unit)
  }

  render() {
    let manualItems = this.props.unit.manualItems
    return <>
      <Des>
        <DesItem label={utils.intl('运行策略模式')}>
          <div className="h-space">
            <Radio.Group value={this.props.unit.mode} onChange={(v) => this.props.changeMode(v.target.value)}>
              {
                this.props.modeList.map(item => {
                  return (
                    <Radio key={item.value} value={item.value}>{item.name}</Radio>
                  )
                })
              }
            </Radio.Group>
            <a onClick={this.props.useTemplate}>{utils.intl('使用模板')}</a>
          </div>
        </DesItem>
        {
          this.props.unit.manualItems.map((item, index) => {
            let isOpen = this.props.expandList.indexOf(index) != -1
            return <>
              <MonthForm
                typeList={this.props.typeList}
                isOpen={isOpen}
                close={this.props.close}
                open={() => this.props.open(index)}
                onMonthChange={(months) => this.onMonthChange(index, months)}
                onChange={(key, value) => this.onChange(index, key, value)}
                onDelete={() => this.onDeleteMonth(index)}
                showDelete={manualItems.length > 1}
                item={item}
              >
                <DesItem label={utils.intl('充电时段')} className={classnames({'hide': !isOpen})}>
                  {
                    item.chargeTimes.map((time, timeIndex) => {
                      return (
                        <div className="v-center" style={{marginTop: timeIndex > 0 ? 5 : 0}}>
                          <TimeSelect
                            value={time.start && moment(time.start, 'HH:mm')}
                            onChange={(v) => this.onStartTimeChange(index, 'chargeTimes', timeIndex, v)}/>
                          <FromTo/>
                          <TimeSelect
                            value={time.end && moment(time.end, 'HH:mm')}
                            onChange={(v) => this.onEndTimeChange(index, 'chargeTimes', timeIndex, v)}/>
                          {
                            item.chargeTimes.length > 1 && (
                              <MinusCircleOutlined style={{color: 'red', marginLeft: 7, fontSize: 18}}
                                                   onClick={() => this.removeTime(index, 'chargeTimes', timeIndex)}/>
                            )
                          }
                        </div>
                      )
                    })
                  }
                  <PlusOutlined style={{color: '#3d7eff', marginTop: 7, fontSize: 18}}
                                onClick={() => this.addTime(index, 'chargeTimes')}/>
                </DesItem>

                <DesItem label={utils.intl('放电时段')} className={classnames({'hide': !isOpen})}>
                  {
                    item.dischargeTimes.map((time, timeIndex) => {
                      return (
                        <div className="v-center" style={{marginTop: timeIndex > 0 ? 5 : 0}}>
                          <TimeSelect
                            value={time.start && moment(time.start, 'HH:mm')}
                            onChange={(v) => this.onStartTimeChange(index, 'dischargeTimes', timeIndex, v)}/>
                          <FromTo/>
                          <TimeSelect
                            value={time.end && moment(time.end, 'HH:mm')}
                            onChange={(v) => this.onEndTimeChange(index, 'dischargeTimes', timeIndex, v)}/>
                          {
                            item.dischargeTimes.length > 1 && (
                              <MinusCircleOutlined style={{color: 'red', marginLeft: 7, fontSize: 18}}
                                                   onClick={() => this.removeTime(index, 'dischargeTimes', timeIndex)}/>
                            )
                          }
                        </div>
                      )
                    })
                  }
                  <PlusOutlined style={{color: '#3d7eff', marginTop: 7, fontSize: 18}}
                                onClick={() => this.addTime(index, 'dischargeTimes')}/>
                </DesItem>

                <DesItem label={utils.intl('蓄电时段')} className={classnames({'hide': !isOpen})}>
                  {
                    item.backupTimes.map((time, timeIndex) => {
                      return (
                        <div className="v-center" style={{marginTop: timeIndex > 0 ? 5 : 0}}>
                          <TimeSelect
                            value={time.start && moment(time.start, 'HH:mm')}
                            onChange={(v) => this.onStartTimeChange(index, 'backupTimes', timeIndex, v)}/>
                          <FromTo/>
                          <TimeSelect
                            value={time.end && moment(time.end, 'HH:mm')}
                            onChange={(v) => this.onEndTimeChange(index, 'backupTimes', timeIndex, v)}/>
                          {
                            item.backupTimes.length > 1 && (
                              <MinusCircleOutlined style={{color: 'red', marginLeft: 7, fontSize: 18}}
                                                   onClick={() => this.removeTime(index, 'backupTimes', timeIndex)}/>
                            )
                          }
                        </div>
                      )
                    })
                  }
                  <PlusOutlined style={{color: '#3d7eff', marginTop: 7, fontSize: 18}}
                                onClick={() => this.addTime(index, 'backupTimes')}/>
                </DesItem>
              </MonthForm>
            </>
          })
        }
        <DesItem label={utils.intl('适用月份')} className="month-item">
          <div className="h-space">
            <ShowMonthInfo months={[]} onChange={this.addMonth}/>
          </div>
        </DesItem>
      </Des>
    </>
  }
}

export default Manual
