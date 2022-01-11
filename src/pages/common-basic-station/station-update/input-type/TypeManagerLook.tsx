import React from 'react'
import DetailItem2 from '../../../../components/layout/DetailItem2'
import { Model } from './TypeManager'
import { getDate } from '../../../../util/dateUtil'
import { getDisplayDateStr } from '../../station.helper'
import TimeZoneMap from '../../../../components/time-zone-picker/locale/time-zone-map.json';
import utils from '../../../../public/js/utils'

interface Props {
  detail: Record<any, any>
  model: Model
}

const TypeManagerLook: React.FC<Props> = function (this: null, props) {
  const { model, detail } = props

  const type = model.dataType?.name
  const label = model.title
  const name = model.name

  let labelStyle = {}

  if (type == 'systemEnum') {
    return null
  }
  if (type == 'text') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{detail[name]}</DetailItem2>
    )
  }
  if (type == 'textarea') {
    return (
      <div key={name} className="w100">
        <DetailItem2 label={label} style={{ width: 500 }} labelStyle={labelStyle}>{detail[name]}</DetailItem2>
      </div>
    )
  }
  if (type == 'position') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{detail[name]?.join(' , ')}</DetailItem2>
    )
  }
  if (type == 'image') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>
        <div style={{ width: 100, height: 100 }}>
          <img src={detail[name]?.[0]?.data} className="w100" />
        </div>
      </DetailItem2>
    )
  }
  if (type == 'bool') {
    let boolValues = model.boolValues
    let yesName = boolValues.true || boolValues['1']
    let noName = boolValues.false || boolValues['0']
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{detail[name] == 1 ? (yesName || utils.intl('是')) : (noName || utils.intl('否'))}</DetailItem2>
    )
  }
  if (type == 'enum') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>
        {model.enumValues?.find(item => item.name == detail[name])?.title}
      </DetailItem2>
    )
  }
  if (type == 'option') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>
        {detail[name]?.join('，')}
      </DetailItem2>
    )
  }
  if (type == 'date') {
    const timeAccuracy = model.timeAccuracy?.name
    let value = getDisplayDateStr(getDate(detail[name]), timeAccuracy)
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{value}</DetailItem2>
    )
  }
  if (type == 'array') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{detail[name]}</DetailItem2>
    )
  }
  if (type == 'int32') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{detail[name]} {model?.unit?.name}</DetailItem2>
    )
  }
  if (type == 'double' || type == 'float') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{detail[name]} {model?.unit?.name}</DetailItem2>
    )
  }
  if (type == 'currency') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{detail[name]}</DetailItem2>
    )
  }
  if (type == 'timeZone') {
    let language: any = localStorage.getItem('language');
    let _TimeZoneMap = {};
    for (let key in TimeZoneMap[language]) {
      _TimeZoneMap[TimeZoneMap[language][key]] = key
    }
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>{_TimeZoneMap[detail[name]] ?? detail[name]}</DetailItem2>
    )
  }
  if (type == 'area') {
    return (
      <DetailItem2 label={label} labelStyle={labelStyle}>
        {detail.province?.title}
        {detail.city?.title}
        {detail.district?.title}
      </DetailItem2>
    )
  }
  return <span>{utils.intl("未知类型")}</span>
}

export default TypeManagerLook
