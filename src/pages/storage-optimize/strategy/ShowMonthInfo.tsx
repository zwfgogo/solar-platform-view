import React from 'react'
import SelectMonth from '../../../components/SelectMonth'

import {EditOutlined} from 'wanke-icon'

import utils from '../../../public/js/utils'

interface Props {
  months: number[]
  onChange: (month: number[]) => void
}

const ShowMonthInfo: React.FC<Props> = function (this: null, props) {
  return (
    <div className="vh-center">
      {
        props.months.length == 0 && (
          <div className="cp">
            <SelectMonth value={props.months} onChange={months => props.onChange(months)}>
              <a style={{marginRight: 5}}>{utils.intl('添加')}</a>
            </SelectMonth>
          </div>
        )
      }
      {props.months.length > 0 && props.months.map(item => {
        return <div style={{margin: '0 5px'}}>{item}{utils.intl('月')}</div>
      })}
      <SelectMonth value={props.months} onChange={months => props.onChange(months)}>
        <EditOutlined/>
      </SelectMonth>
    </div>
  )
}

export default ShowMonthInfo
