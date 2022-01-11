import React, {useEffect} from 'react'
import classnames from 'classnames'
import {Select} from 'wanke-gui'
import {ValueName} from '../../../../interfaces/CommonInterface'
import Label from '../../../../components/Label'
import wrapper1, {CommonProp} from '../../../../components/input-item/wrapper1'

interface Props {
  label: string
  required: boolean
  disabled: boolean
  value: { provinceId: number, cityId: number, districtId: number }
  onChange: (values: { provinceId: number, cityId: number, districtId: number }) => void
  onProvinceChange: (provinceId: number) => void
  onCityChange: (cityId: number) => void
  provinceOptions: ValueName[]
  cityOptions: ValueName[]
  districtOptions: ValueName[]
}

const AreaType: React.FC<Props> = function (this: null, props) {
  const onProvinceChange = (provinceId: number) => {
    props.onChange({provinceId, cityId: null, districtId: null})
  }

  const onCityChange = (cityId: number) => {
    props.onChange({provinceId: props.value.provinceId, cityId, districtId: null})
  }

  const onDistrictChange = (districtId: number) => {
    props.onChange({provinceId: props.value.provinceId, cityId: props.value.cityId, districtId})
  }

  useEffect(() => {
    if (props.value.provinceId) {
      props.onProvinceChange(props.value.provinceId)
    }
  }, [props.value.provinceId])

  useEffect(() => {
    if (props.value.cityId) {
      props.onCityChange(props.value.cityId)
    }
  }, [props.value.cityId])

  return (
    <div>
      <Label required={props.required}>{props.label}</Label>
      <div className="d-flex" style={{marginRight: 15}}>
        <Item
          rules={[{required: props.required}]}
          value={props.value.provinceId}
          onChange={onProvinceChange}
          dataSource={props.provinceOptions}
        />
        <Item
          rules={[{required: props.required}]}
          value={props.value.cityId}
          onChange={onCityChange}
          dataSource={props.cityOptions}
        />
        <Item
          rules={[{required: props.required}]}
          value={props.value.districtId}
          onChange={onDistrictChange}
          dataSource={props.districtOptions}
        />
      </div>
    </div>
  )
}

export default AreaType


interface SelectItemProps extends CommonProp {
  value: number
  onChange: (v: number) => void
  dataSource: ValueName[]
}

const SelectItemCustomError: React.FC<SelectItemProps> = function (this: null, props) {
  return (
    <Select
      style={{width: 120, marginLeft: 10}}
      className={classnames({'select-needed': props.errs.length > 0})}
      value={props.value}
      onChange={props.onChange}
      dataSource={props.dataSource}
    />
  )
}

const Item = wrapper1<SelectItemProps>(SelectItemCustomError)
