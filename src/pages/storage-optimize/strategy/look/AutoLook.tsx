import React from 'react'

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

class AutoLook extends React.Component<Props> {
  render() {
    return (
      <Des>
        <DesItem label={utils.intl('运行策略模式')}>
          <div className="h-space">{utils.intl('自动')}</div>
        </DesItem>
        {
          this.props.unit.autoItems.map((item, index) => {
            return (
              <MonthFormLook
                typeList={this.props.typeList}
                item={item}
              />
            )
          })
        }
      </Des>
    )
  }
}

export default AutoLook
