import React from 'react'
import { getBool } from '../../../page.helper'
import TextType from './TextType'
import BoolType from './BoolType'
import SelectType from './SelectType'
import DateType from './DateType'
import ArrayType from './ArrayType'
import IntType from './IntType'
import DoubleType from './DoubleType'
import AreaType from './AreaType'
import { ValueName } from '../../../../interfaces/CommonInterface'
import ImageType from './ImageType'
import PositionType from './PositionType'
import DateTimeType from './DateTimeType'
import TextAreaType from './TextAreaType'
import { yesNoOptions } from '../../../constants'
import CheckboxType from './CheckboxType'
import CurrencyPicker from '../../../../components/currency-picker/CurrencyPicker'
import TimeZonePicker from '../../../../components/time-zone-picker/TimeZonePicker'
import utils from '../../../../public/js/utils'

export interface Model {
  id: number
  dataType: { name: string }
  arraySize: number
  arrayType: string
  enumValues: { name: any, title: string }[]
  optionValues: string[]
  title: string
  name: string
  mustFill: string
  type: number
  unit: { name: string, title: string }
  unitTitle: string
  min: number
  max: number
  length: number
  disabled: boolean
  validationType: string
  timeAccuracy: {
    name: string
  }
  boolValues: any
}

interface Props {
  model: Model
  values: Record<any, any>
  onChange: (values) => void
  onProvinceChange?: (provinceId: number) => void
  onCityChange?: (provinceId: number) => void
  provinceOptions?: ValueName[]
  cityOptions?: ValueName[]
  districtOptions?: ValueName[]
  toMapSelect?: (longitude, latitude, onSuccess) => void
  placeholder?: string
}

const TypeManager: React.FC<Props> = function (this: null, props) {
  const handleValues = (obj) => {
    props.onChange({ ...props.values, ...obj })
  }

  const model = props.model
  const type = model.dataType?.name
  const label = model.title
  const name = model.name
  const required = getBool(model.mustFill)
  const disabled = getBool(model.disabled)
  let value = props.values[name]
  if (type == 'systemEnum') {
    return null
  }
  if (type == 'text') {
    if (model.name === 'name') {
      return (
        <TextType
          label={label}
          required={required}
          maxLength={model.length}
          disabled={disabled}
          value={value || ''}
          onChange={v => handleValues({ [name]: v })}
          placeholder={props.placeholder}
          letterAndNumberRule={true}
        />
      )
    } else {
      return (
        <TextType
          label={label}
          required={required}
          maxLength={model.length}
          disabled={disabled}
          value={value || ''}
          onChange={v => handleValues({ [name]: v })}
          placeholder={props.placeholder}
        />
      )
    }

  }
  if (type == 'textarea') {
    return (
      <TextAreaType
        label={label}
        required={required}
        maxLength={model.length}
        disabled={disabled}
        value={value || ''}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'bool') {
    let boolValues = model.boolValues
    let dataSource = yesNoOptions
    if (boolValues) {
      dataSource = [
        { value: -1, name: boolValues.false || boolValues['0'] },
        { value: 1, name: boolValues.true || boolValues['1'] }
      ]
    }
    return (
      <BoolType
        label={label}
        required={required}
        disabled={disabled}
        value={value}
        onChange={v => handleValues({ [name]: v })}
        dataSource={dataSource}
      />
    )
  }
  if (type == 'enum') {
    return (
      <SelectType
        label={label}
        required={required}
        disabled={disabled}
        dataSource={model.enumValues?.map(item => ({ value: item.name, name: item.title })) || []}
        value={value || null}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'option') {
    return (
      <CheckboxType
        label={label}
        required={required}
        disabled={disabled}
        dataSource={model.optionValues || []}
        value={value || null}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'area') {
    value = value || {}
    return (
      <AreaType
        label={label}
        required={required}
        disabled={disabled}
        provinceOptions={props.provinceOptions || []}
        cityOptions={props.cityOptions || []}
        districtOptions={props.districtOptions || []}
        value={value}
        onChange={v => handleValues({ [name]: v })}
        onProvinceChange={props.onProvinceChange}
        onCityChange={props.onCityChange}
      />
    )
  }
  if (type == 'date') {
    return (
      <DateType
        label={label}
        required={required}
        disabled={disabled}
        value={value || null}
        format={model.timeAccuracy?.name}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'datetime') {
    return (
      <DateTimeType
        label={label}
        required={required}
        disabled={disabled}
        value={value || null}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'array') {
    return (
      <ArrayType
        label={label}
        required={required}
        disabled={disabled}
        arraySize={model.arraySize}
        value={value || []}
        suffix={model?.unit?.name}
        arrayType={model.arrayType}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'int32') {
    return (
      <IntType
        label={label}
        required={required}
        disabled={disabled}
        value={value ?? null}
        min={model.min}
        max={model.max}
        suffix={model.unit?.name}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'double' || type == 'float') {
    return (
      <DoubleType
        label={label}
        required={required}
        disabled={disabled}
        min={model.min}
        max={model.max}
        suffix={model.unit?.name}
        value={value ?? null}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'image') {
    return (
      <ImageType
        label={label}
        required={required}
        disabled={disabled}
        value={value}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'position') {
    value = value || [null, null]
    return (
      <PositionType
        label={label}
        disabled={disabled}
        required={required}
        toMapSelect={(onSuccess) => props.toMapSelect(value[0], value[1], onSuccess)}
        value={[value[0], value[1]]}
        onChange={([latitude, longitude]) => handleValues({ [name]: [latitude, longitude] })}
      />
    )
  }
  if (type == 'currency') {
    return (
      <CurrencyPicker
        name={type}
        rules={[{ required: true }]}
        label={label}
        required={required}
        disabled={disabled}
        value={value}
        onChange={v => handleValues({ [name]: v })}
      />
    )
  }
  if (type == 'timeZone') {
    return (
      <TimeZonePicker
        name={type}
        rules={[{ required: true }]}
        label={label}
        required={required}
        disabled={disabled}
        value={value}
        onChange={v => handleValues({ [name]: v })}
        style={{ width: 205 }}
      />
    )
  }
  return (
    <div>{utils.intl("未知类型")}</div>
  )
}

export default TypeManager
