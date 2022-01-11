import React from 'react'
import TextItem from '../../../../components/input-item/TextItem'
import Label from '../../../../components/Label'
import { range } from '../../../page.helper'
import { copy } from '../../../../util/utils'
import NumberItem from '../../../../components/input-item/NumberItem'

interface Props {
  label: string
  required: boolean
  arraySize: number
  arrayType: string
  suffix: string
  disabled: boolean
  value: any[]
  onChange: (v: any[]) => void
}

const ArrayType: React.FC<Props> = function (this: null, props) {
  const onChange = (index, v) => {
    let value = copy(props.value)
    value[index] = v
    props.onChange(value)
  }

  return (
    <div className="input-item">
      <div className="ant-row ant-form-item" style={{ marginBottom: 0 }}>
        <Label required={props.required}>{props.label}</Label>
        <div className="ant-col ant-form-item-control">
          <div className="ant-form-item-control-input">
            {
              range(props.arraySize).map((item, index) => {
                if (props.arrayType == 'int32' || props.arrayType == 'float' || props.arrayType == 'double') {
                  return (
                    <NumberItem
                      label={null}
                      style={{ width: 90 }}
                      value={props.value[index]}
                      suffix={props.suffix}
                      onChange={(v) => onChange(index, v)}
                    ></NumberItem>
                  )
                }
                return (
                  <TextItem
                    label={null}
                    suffix={props.suffix}
                    style={{ width: 90 }}
                    value={props.value[index]}
                    onChange={(v) => onChange(index, v)}
                  ></TextItem>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArrayType
