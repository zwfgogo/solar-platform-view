import moment from 'moment'
import {getBool, getImageUrl, traverseTree} from '../page.helper'
import {getDate, getDateStr} from '../../util/dateUtil'
import {Model} from './station-update/input-type/TypeManager'
import {Mode} from '../constants'

export function getKeys(list) {
  let allKeys = []
  traverseTree(list, item => {
    let key = identity(item)
    allKeys.push(key)
    return null
  })
  return allKeys
}

export function identity(item) {
  return item.key
  // 原来代码
  // return (item.id || '') + (item.type || '') + (item.sn || '')
}

/**
 * 给后台的数据，年月日时分秒
 */
export function getFormatDateStr(date, timeAccuracy) {
  if (!date) {
    return null
  }
  let dateFormat = 'YYYY-MM-DD'
  if (timeAccuracy == 'year') {
    dateFormat = 'YYYY-01-01 00:00:00'
  } else if (timeAccuracy == 'month') {
    dateFormat = 'YYYY-MM-01 00:00:00'
  } else if (timeAccuracy == 'hour') {
    dateFormat = 'YYYY-MM-DD HH:00:00'
  } else if (timeAccuracy == 'minute') {
    dateFormat = 'YYYY-MM-DD HH:mm:00'
  } else if (timeAccuracy == 'second') {
    dateFormat = 'YYYY-MM-DD HH:mm:ss'
  }
  return getDateStr(date, dateFormat)
}

/**
 * 前端显示
 */
export function getDisplayDateStr(date, timeAccuracy) {
  if (!date) {
    return null
  }
  let dateFormat = 'YYYY-MM-DD'
  if (timeAccuracy == 'year') {
    dateFormat = 'YYYY'
  } else if (timeAccuracy == 'month') {
    dateFormat = 'YYYY-MM'
  } else if (timeAccuracy == 'hour') {
    dateFormat = 'YYYY-MM-DD HH:00'
  } else if (timeAccuracy == 'minute') {
    dateFormat = 'YYYY-MM-DD HH:mm'
  } else if (timeAccuracy == 'second') {
    dateFormat = 'YYYY-MM-DD HH:mm:ss'
  }
  return getDateStr(date, dateFormat)
}

export function handleModelValue(model: Model, value: any) {
  let type = model.dataType?.name

  if (type == 'array') {
    return value || []
  } else if (type == 'bool') {
    return value !== undefined ? (getBool(value) ? 1 : -1) : 1
  } else if (type == 'text') {
    return value || ''
  } else if (type == 'textarea') {
    return value || ''
  } else if (type == 'date') {
    return getDate(value)
  } else if (type == 'datetime') {
    return getDate(value)
  } else if (type == 'int32') {
    return value ?? null
  } else if (type == 'double' || type == 'float') {
    return value ?? null
  } else if (type == 'position') {
    return value || [null, null]
  } else if (type == 'image') {
    return value?.map(item => ({name: '', data: getImageUrl(item)})) || []
  } else if (type == 'enum') {
    return value?.name || null
  } else if (type == 'option') {
    return value || []
  } else if (type == 'area') {
    return handleModelAreaValues(value)
  } else if (type == 'currency') {
    return value || ''
  } else if (type == 'timeZone') {
    return value || ''
  } else {
    // console.log('未知类型')
  }
}

export function handleModelAreaValues(detail) {
  return {
    provinceId: detail?.province?.id,
    cityId: detail?.city?.id,
    districtId: detail?.district?.id
  }
}

export function handleModelParentValues(detail) {
  return {
    parent1Id: detail?.batteryUnit?.id || null,
    parent2Id: detail?.batteryCluster?.id || null,
    parent3Id: detail?.pack?.id || null
  }
}

export function handleModelValues(stationModels, detail): Record<string, any> {
  if (detail == null) {
    detail = {}
  }
  const initValues = {}
  stationModels.forEach(model => {
    let type = model.dataType?.name
    let name = model.name
    if (name == 'parentDevice') {
      initValues[name] = handleModelParentValues(detail)
    } else if (type == 'area') {
      initValues[name] = handleModelAreaValues(detail)
    } else {
      initValues[name] = handleModelValue(model, detail[name])
    }
  })
  return initValues
}

export function handleModelDetail(stationModels, detail): Record<string, any> {
  if (detail == null) {
    detail = {}
  }
  const initValues: any = {}
  stationModels.forEach(model => {
    let type = model.dataType?.name
    let name = model.name
    if (name == 'parentDevice') {
      initValues[name] = handleModelParentValues(detail)
    } else if (type == 'area') {
      initValues.province = detail.province
      initValues.city = detail.city
      initValues.district = detail.district
    } else {
      initValues[name] = handleModelValue(model, detail[name])
    }
  })
  return initValues
}

export const importColumns = [
  {
    title: '序号',
    dataIndex: 'num',
    align: 'center',
    width: 65
  },
  {
    title: '数据项业务名称',
    dataIndex: 'title',
    width: 165
  },
  {
    title: '设备端子',
    dataIndex: 'terminalTypeTitle',
    width: 165
  },
  {
    title: '设备参数名称',
    dataIndex: 'typeTitle',
    width: 160
  },
  {
    title: 'PointID',
    dataIndex: 'pointNumber',
    width: 100
  },
  {
    title: '信号名称',
    dataIndex: 'singalTitle',
    width: 100
  }
]

// 特殊逻辑，暂时前端实现(能量单元有效性disabled属性)
export function __temporaryEnergyModelLogic(models: Model[], detail): Model[] {
  let match1 = models.find(item => item.name == 'activity')
  let match2 = models.find(item => item.name == 'productionTime')
  let match3 = models.find(item => item.name == 'plannedProductionTime')

  if (match1 && match2) {
    if (detail[match2.name]) {
      match1.disabled = true
    }
  }
  if (match2 && match3) {
    if (detail[match2.name]) {
      match3.disabled = true
    }
  }
  return models
}

// 特殊逻辑，暂时前端实现(设备有效性disabled属性)
export function __temporaryDeviceModelLogic(models: Model[], detail): Model[] {
  let match1 = models.find(item => item.name == 'title')
  let match2 = models.find(item => item.name == 'activity')

  if (match1 && match2 && detail?.deviceType?.name == 'GatewayBreaker') {
    match2.disabled = true
  }
  return models
}

// 特殊逻辑，暂时前端实现(电站编辑时：不能修改的属性)
export function __temporaryStationModelLogic(models: Model[], mode: Mode): Model[] {
  if (mode == Mode.update) {
    let list = ['code', 'scale', 'ratedPower', 'timeZone', 'currency', 'FeedinMethod', 'ContructType']
    list.forEach(key => {
      let match = models.find(item => item.name == key)
      if (match) {
        match.disabled = true
        if (key == 'scale' || key == 'ratedPower') {
          match.min = 0
        }
      }
    })
    return models
  }
  if (mode == Mode.look) {
    return models
  }
  if (mode == Mode.add) {
    let list = ['FeedinMethod', 'ContructType']
    list.forEach(key => {
      let match = models.find(item => item.name == key)
      if (match) {
        match.disabled = false
      }
    })
    list = ['scale', 'ratedPower']
    list.forEach(key => {
      let match = models.find(item => item.name == key)
      if (match) {
        match.disabled = true
        match.mustFill = 'false'
        match.min = 0
      }
    })
  }
  return models
}


export function fillPrice24HoursData(list, date) {
  let result = []

  let currentValue = null

  for (let i = 0; i < 1440; i++) {
    let hour = Math.floor(i / 60)
    let minute = Math.floor(i % 60)
    let d = date.hour(hour).minute(minute).format('YYYY-MM-DD HH:mm:00')
    let match = list.find(item => item.dtime == d)
    if (match) {
      currentValue = match.val
    }
    result.push({
      dtime: d,
      val: currentValue
    })
  }
  return result
}
