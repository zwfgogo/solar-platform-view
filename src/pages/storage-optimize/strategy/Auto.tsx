import React from 'react'
import {Radio} from 'wanke-gui'

import {FormComponentProps} from '../../../interfaces/CommonInterface'
import {MonthItem, UnitType} from '../models/update'
import {copy} from '../../../util/utils'
import MonthForm from './MonthForm'
import DesItem from '../../../components/layout/DesItem'
import Des from '../../../components/layout/Des'
import ShowMonthInfo from './ShowMonthInfo'
import {ValueName} from '../../../interfaces/CommonInterface'

import utils from '../../../public/js/utils'

interface Props extends FormComponentProps {
  typeList: ValueName[]
  modeList: ValueName[]
  unit: UnitType
  expandList: number[]
  open: (index) => void
  close: () => void
  useTemplate: () => void
  changeMode: (mode: number) => void
  updateUnit: (unit: UnitType) => void
}

class Auto extends React.Component<Props> {
  onChange = (index, key, value) => {
    let unit = copy(this.props.unit)
    unit.autoItems[index][key] = value
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
    unit.autoItems.push(monthItem)
    this.props.open(unit.autoItems.length - 1)
    this.props.updateUnit(unit)
  }

  onDelete = (index) => {
    let unit = copy(this.props.unit)
    unit.autoItems.splice(index, 1)
    this.props.close()
    this.props.updateUnit(unit)
  }

  render() {
    const autoItems = this.props.unit.autoItems
    return (
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
          this.props.unit.autoItems.map((item, index) => {
            let isOpen = this.props.expandList.indexOf(index) != -1
            return (
              <MonthForm
                typeList={this.props.typeList}
                isOpen={isOpen}
                close={this.props.close}
                open={() => this.props.open(index)}
                onChange={(key, value) => this.onChange(index, key, value)}
                onMonthChange={(months) => this.onMonthChange(index, months)}
                onDelete={() => this.onDelete(index)}
                showDelete={autoItems.length > 1}
                item={item}
              />
            )
          })
        }
        <DesItem label={utils.intl('适用月份')} className="month-item">
          <div className="h-space">
            <ShowMonthInfo months={[]} onChange={this.addMonth}/>
          </div>
        </DesItem>
      </Des>
    )
  }
}

export default Auto
