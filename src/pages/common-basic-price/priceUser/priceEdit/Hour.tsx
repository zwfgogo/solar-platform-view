import React from 'react'
import { TimePicker } from 'wanke-gui'
import moment from 'moment'
import { MinusCircleOutlined, PlusOutlined } from "wanke-icon"

const format = 'HH:mm'

export interface timeper {
  startTime?: any;
  endTime?: any;
  id?: any;
}

interface HourProps {
  onChange?: any;
  value?: Array<timeper>;
}

class Hour extends React.Component<HourProps> {
  render() {
    const {value, onChange} = this.props
    const add = () => {
      const newValue = [...(value || []), {id: new Date().getTime(), startTime: '00:00', endTime: '24:00'}]
      onChange(newValue)
    }
    const del = index => {
      const data1 = value.slice(0, index)
      const data2 = value.slice(index + 1, value.length)
      onChange([...data1, ...data2])
    }

    const edit = ({val, type, index}) => {
      const data1 = value.slice(0, index)
      const indexValue = {...value.slice(index, index + 1)[0]}
      const data2 = value.slice(index + 1, value.length)
      indexValue[type] = val
      onChange([...data1, indexValue, ...data2])
    }
    return (
      <div>
        {value && value.map((item, key) => {
          const {startTime, endTime} = item
          return (
            <div key={item.id} className="e-mb20">
              <TimePicker
                defaultValue={startTime ? moment(item.startTime, format) : null}
                style={{width: '120px'}}
                minuteStep={60}
                format={format}
                onChange={val => {
                  edit({val: val.format(format), type: 'startTime', index: key})
                }}
                allowClear={false}
                inputReadOnly
              />
              <span className="e-ml10 e-mr10">~</span>
              <TimePicker
                defaultValue={endTime ? moment(item.endTime, format) : null}
                style={{width: '120px'}}
                minuteStep={60}
                format="HH:mm"
                onChange={val => {
                  edit({val: val.format(format), type: 'endTime', index: key})
                }}
                allowClear={false}
                inputReadOnly
              />
              <MinusCircleOutlined onClick={() => del(key)} style={{color: 'red', marginLeft: 12}}/>
            </div>
          )
        })}
        <div>
          <a onClick={add}>
            <PlusOutlined/>
          </a>
        </div>
      </div>
    )
  }
}

export default Hour
