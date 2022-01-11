import React from 'react'
import DesItem from '../../../../components/layout/DesItem'
import {withUnit} from '../../../page.helper'
import {isType1} from '../../optimize.helper'
import {ValueName} from '../../../../interfaces/CommonInterface'
import DetailItem from '../../../../components/layout/DetailItem'

import utils from '../../../../public/js/utils'

interface Props {
  typeList: ValueName[]
  item: any
}

const MonthFormLook: React.FC<Props> = function (this: null, props) {
  const {item} = props
  let match = props.typeList.find(type => type.value == item.chargeDischargeType)
  return <>
    <DesItem label={utils.intl('适用月份')} className="month-item">
      {item.months.map(item => item + utils.intl('月')).join(',')}
    </DesItem>
    {props.children}
    <DesItem label={utils.intl('充放电参数')}>
      <div className="d-flex">
        <div style={{width: 285}} className="common-value">
          {match && match.name}
        </div>
        {
          isType1(item.chargeDischargeType, props.typeList) && (
            <>
              <DetailItem labelStyle={{width: 100}} label={utils.intl('最大充电功率')} txt={withUnit(item.maxCharge, 'kW')}/>
              <DetailItem labelStyle={{width: 100}} label={utils.intl('最大放电功率')}
                          txt={withUnit(item.maxDisCharge, 'kW')}/>
            </>
          )
        }
        {
          !isType1(item.chargeDischargeType, props.typeList) && (
            <>
              <DetailItem label={utils.intl('充电电压')} txt={withUnit(item.chargeV, 'V/cell')}/>
              <DetailItem label={utils.intl('放电电流')} txt={withUnit(item.dischargeA, 'A')}/>
            </>
          )
        }
      </div>
    </DesItem>

    <DesItem label={utils.intl('结束控制参数')}>
      <div className="d-flex">
        {
          isType1(item.chargeDischargeType, props.typeList) && (
            <>
              <DetailItem label={utils.intl('SOC上限')} txt={withUnit(item.socMax, '%')}/>
              <DetailItem label={utils.intl('SOC下限')} txt={withUnit(item.socMin, '%')}/>
            </>
          )
        }
        {
          !isType1(item.chargeDischargeType, props.typeList) && (
            <>
              <DetailItem labelStyle={{width: 100}} label={utils.intl('充电倍率限值')}
                          txt={withUnit(item.chargeRateLimit, 'C/Ah')}/>
              <DetailItem labelStyle={{width: 100}} label={utils.intl('放电截止电压')}
                          txt={withUnit(item.dischargeEndVoltage, 'V/cell')}/>
            </>
          )
        }
      </div>
    </DesItem>

    <DesItem label={utils.intl('备电设置')}>
      <div className="d-flex v-center">
        <DetailItem label={utils.intl('备电时长')} txt={withUnit(item.backupMinutes, '分钟')}/>
      </div>
    </DesItem>

    <DesItem label={utils.intl('防返送设置')}>
      <div className="d-flex v-center">
        <DetailItem className="rate-detail-item" label={utils.intl('最大放电功率允许占负荷比例')}
                    txt={withUnit(item.maxDischargeRate, '%')}/>
        <div>{utils.intl('（当放电时负荷下降，则放电功率自动保持在负荷一定比例运行。）')}</div>
      </div>
    </DesItem>
  </>
}

export default MonthFormLook
