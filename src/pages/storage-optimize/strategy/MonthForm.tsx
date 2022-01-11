import React from 'react'
import classnames from 'classnames'
import {Select} from 'wanke-gui'
import MonthAndFold from './MonthAndFold'
import DesItem from '../../../components/layout/DesItem'
import NumberInput1 from './input/NumberInput1'
import {ValueName} from '../../../interfaces/CommonInterface'
import {isType1} from '../optimize.helper'
import {AutoMonthItemType} from '../models/update'

import utils from '../../../public/js/utils'

interface Props {
  typeList: ValueName[]
  isOpen: boolean
  item: AutoMonthItemType
  close: () => void
  open: () => void
  onChange: (key, value) => void
  onMonthChange: (value) => void
  onDelete: () => void
  showDelete: boolean
}

const MonthForm: React.FC<Props> = function (this: null, props) {
  const {isOpen, item} = props
  return <>
    <DesItem label={utils.intl('适用月份')} className="month-item">
      <MonthAndFold
        months={item.months}
        onChange={props.onMonthChange}
        close={props.close}
        open={props.open}
        isOpen={isOpen}
        onDelete={props.onDelete}
        showDelete={props.showDelete}
      />
    </DesItem>
    {props.children}
    <DesItem label={utils.intl('充放电参数')} className={classnames({'hide': !isOpen})}>
      <div className="d-flex">
        <div style={{width: 140, marginRight: 35}}>
          <Select dataSource={props.typeList}
                  value={item.chargeDischargeType} onChange={(v) => props.onChange('chargeDischargeType', v)}
          ></Select>
        </div>
        {
          isType1(item.chargeDischargeType, props.typeList) && (
            <>
              <NumberInput1
                className="h" label={utils.intl('最大充电功率')} suffix="kW" style={{width: 300}} rules={[{required: true}]}
                min={0}
                value={item.maxCharge} onChange={(v) => props.onChange('maxCharge', v)}
              />
              <NumberInput1
                className="h" label={utils.intl('最大放电功率')} suffix="kW" style={{width: 300}} rules={[{required: true}]}
                min={0}
                value={item.maxDisCharge} onChange={(v) => props.onChange('maxDisCharge', v)}
              />
            </>
          )
        }
        {
          !isType1(item.chargeDischargeType, props.typeList) && (
            <>
              <NumberInput1
                className="h" label={utils.intl('充电电压')} suffix="V/cell" style={{width: 300}} rules={[{required: true}]}
                min={0}
                value={item.chargeV} onChange={(v) => props.onChange('chargeV', v)}
              />
              <NumberInput1
                className="h" label={utils.intl('放电电流')} suffix="A" style={{width: 300}} rules={[{required: true}]}
                min={0}
                value={item.dischargeA} onChange={(v) => props.onChange('dischargeA', v)}
              />
            </>
          )
        }
      </div>
    </DesItem>

    <DesItem label={utils.intl('结束控制参数')} className={classnames({'hide': !isOpen})}>
      <div className="d-flex">
        <div style={{width: 140, marginRight: 35}}>
          <Select dataSource={props.typeList} value={item.chargeDischargeType} disabled={true}
          ></Select>
        </div>
        {
          isType1(item.chargeDischargeType, props.typeList) && (
            <>
              <NumberInput1
                className="h" label={utils.intl('SOC上限')} rules={[{required: true}]}
                min={0} max={100} precision={1}
                value={item.socMax} onChange={(v) => props.onChange('socMax', v)}
                suffix="%" style={{width: 300}}/>
              <NumberInput1
                className="h" label={utils.intl('SOC下限')} suffix="%" style={{width: 300}} rules={[{required: true}]}
                min={0} max={100} precision={1}
                value={item.socMin} onChange={(v) => props.onChange('socMin', v)}
              />

            </>
          )
        }
        {
          !isType1(item.chargeDischargeType, props.typeList) && (
            <>
              <NumberInput1
                className="h" label={utils.intl('充电倍率限值')} rules={[{required: true}]}
                min={0} precision={3}
                value={item.chargeRateLimit} onChange={(v) => props.onChange('chargeRateLimit', v)}
                suffix="C/Ah" style={{width: 300}}/>

              <NumberInput1
                className="h" label={utils.intl('放电截止电压')} suffix="V/cell" style={{width: 300}}
                rules={[{required: true}]}
                min={0} precision={3}
                value={item.dischargeEndVoltage} onChange={(v) => props.onChange('dischargeEndVoltage', v)}
              />
            </>
          )
        }
      </div>
    </DesItem>

    <DesItem label={utils.intl('备电设置')} className={classnames({'hide': !isOpen})}>
      <div className="d-flex v-center">
        <NumberInput1
          className="h backup-setting" label={utils.intl('备电时长')} min={0} precision={0}
          rules={[{required: true}]} suffix={utils.intl('分钟')} style={{width: 300, marginRight: 5}}
          value={item.backupMinutes} onChange={(v) => props.onChange('backupMinutes', v)}
        />
        <div>{utils.intl('(无需备电请输入0)')}</div>
      </div>
    </DesItem>

    <DesItem label={utils.intl('防返送设置')} className={classnames({'hide': !isOpen})}>
      <div className="d-flex v-center">
        <NumberInput1
          className="h" label={utils.intl('最大放电功率允许占负荷比例')} suffix="%" style={{width: 400}} rules={[{required: true}]}
          min={0} max={100}
          value={item.maxDischargeRate} onChange={(v) => props.onChange('maxDischargeRate', v)}
        />
        <div>{utils.intl('（当放电时负荷下降，则放电功率自动保持在负荷一定比例运行。）')}</div>
      </div>
    </DesItem>
  </>
}

export default MonthForm
