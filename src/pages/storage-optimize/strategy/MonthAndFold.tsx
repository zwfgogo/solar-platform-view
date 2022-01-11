import React from 'react'
import ShowMonthInfo from './ShowMonthInfo'

import {CloseCircleFilled} from 'wanke-icon'

import utils from '../../../public/js/utils'

interface Props {
  isOpen: boolean
  months: number[]
  onChange: (value) => void
  open: () => void
  close: () => void
  onDelete: () => void
  showDelete: boolean
}

const MonthAndFold = function (this: null, props: Props) {
  return (
    <div className="h-space">
      <ShowMonthInfo
        months={props.months}
        onChange={props.onChange}
      />
      <div className="v-center">
        {
          props.isOpen && (
            <div className="cp" onClick={props.close}>{utils.intl('折叠')}</div>
          )
        }
        {
          !props.isOpen && (
            <div className="cp" onClick={props.open}>{utils.intl('展开')}</div>
          )
        }
        {
          props.showDelete && (
            <CloseCircleFilled onClick={props.onDelete} style={{color: 'red', marginLeft: 10, cursor: 'pointer'}}/>
          )
        }
      </div>
    </div>
  )
}

export default MonthAndFold
