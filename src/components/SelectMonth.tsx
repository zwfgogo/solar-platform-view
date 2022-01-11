import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import { range } from '../pages/page.helper'
import { Popover } from 'wanke-gui'
import { copy } from '../util/utils'

interface Props {
  value: number[]
  onChange: (month: number[]) => void
}

const allMonth = range(12)

const SelectMonth: React.FC<Props> = function(this: null, props) {
  let [visible, setVisible] = useState(false)
  let [months, setMonths] = useState(props.value)

  const toggleMonth = (month) => {
    let monthsCopy = copy(months)
    let index = months.indexOf(month)
    if (index == -1) {
      setMonths([month, ...months])
    } else {
      monthsCopy.splice(index, 1)
      setMonths(monthsCopy)
    }
  }

  const confirm = () => {
    props.onChange(months.sort((a, b) => a - b))
    setVisible(false)
  }

  useEffect(() => {
    setMonths(props.value)
  }, [props.value])

  return (
    <Popover
      visible={visible}
      onVisibleChange={visible => setVisible(visible)}
      placement='bottom'
      trigger="click"
      content={
        <div className="month-container">
          {
            visible && (
              <ul className="month-list">
                {
                  allMonth.map(month => {
                    return (
                      <li className={classnames('month-item', {selected: months.find(selectMonth => selectMonth == month)})}
                          onClick={() => toggleMonth(month)}
                      >
                        {month}月
                      </li>
                    )
                  })
                }
              </ul>
            )
          }
          <div className="select-footer">
            <button className="confirm" onClick={confirm}>确定</button>
          </div>
        </div>
      }
    >
      {props.children}
    </Popover>
  )
}

export default SelectMonth
