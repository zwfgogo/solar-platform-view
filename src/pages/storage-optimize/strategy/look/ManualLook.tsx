import React from 'react'
import FromTo from '../../../../components/layout/FromTo'
import {UnitType} from '../../models/update'
import DesItem from '../../../../components/layout/DesItem'
import Des from '../../../../components/layout/Des'
import MonthFormLook from './MonthFormLook'
import {ValueName} from '../../../../interfaces/CommonInterface'

import utils from '../../../../public/js/utils'

interface Props {
  typeList: ValueName[]
  unit: UnitType
}

class ManualLook extends React.Component<Props> {
  render() {
    return (
      <Des>
        <DesItem label={utils.intl('运行策略模式')}>
          <div className="h-space">{utils.intl('手动')}</div>
        </DesItem>
        {
          this.props.unit.manualItems.map((item, index) => {
            return <>
              <MonthFormLook
                typeList={this.props.typeList}
                item={item}
              >
                <DesItem label={utils.intl('充电时段')}>
                  {
                    item.chargeTimes.map((time, timeIndex) => {
                      return (
                        <div className="v-center" style={{marginTop: timeIndex > 0 ? 5 : 0}}>
                          {time.start}
                          <FromTo/>
                          {time.end}
                        </div>
                      )
                    })
                  }
                </DesItem>
                <DesItem label={utils.intl('放电时段')}>
                  {
                    item.dischargeTimes.map((time, timeIndex) => {
                      return (
                        <div className="v-center" style={{marginTop: timeIndex > 0 ? 5 : 0}}>
                          {time.start}
                          <FromTo/>
                          {time.end}
                        </div>
                      )
                    })
                  }
                </DesItem>
                <DesItem label={utils.intl('蓄电时段')}>
                  {
                    item.backupTimes.map((time, timeIndex) => {
                      return (
                        <div className="v-center" style={{marginTop: timeIndex > 0 ? 5 : 0}}>
                          {time.start}
                          <FromTo/>
                          {time.end}
                        </div>
                      )
                    })
                  }
                </DesItem>
              </MonthFormLook>
            </>
          })
        }
      </Des>
    )
  }
}

export default ManualLook
