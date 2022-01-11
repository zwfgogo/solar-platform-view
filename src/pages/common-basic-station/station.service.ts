import {
  mock_HistoryList,
  mock_StationBasicInfo,
  mock_StationEnergyList,
  mock_StationManageInfo,
  mock_StationModal,
  mock_StationPriceInfo
} from './station.mock'
import http from '../../public/js/http'
import { traverseTree } from '../page.helper'
import { getUid } from '../../util/utils'
import qs from 'qs';

export function verifySnCode(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/devices/check-SN',
    data,
    results: false
  })
}

export function addStation(data) {
  return http({
    method: 'post',
    url: '/basic-data-management/equipment-ledger/stations',
    data,
    mockData: 1
  })
}

export function fetchStationBasicInfo(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/stations/:id/base',
    data,
    mockData: mock_StationBasicInfo
  })
}

export function fetchStationManageInfo(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/stations/:id/base',
    data,
    mockData: mock_StationManageInfo
  })
}

export function fetchStationEnergyList(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/stations/:id/devices',
    data,
    mockData: mock_StationEnergyList
  })
}

export function fetchStationPriceInfo(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/equipment-ledger/stations/:id/prices',
    data,
    mockData: mock_StationPriceInfo
  })
}

export function fetchStationModel(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/business-models/technical-params',
    data,
    mockData: mock_StationModal
  })
}

export function fetchParentOptions(data) {
  return http({
    method: 'get',
    url: '/enums/devices/by-parent-type',
    data,
    mockData: []
  })
}

export function fetchHistoryList(data) {
  return http({
    method: 'get',
    url: '/basic-data-management/business-model/version',
    data,
    mockData: mock_HistoryList
  })
}

export function fetchStationList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/stations",
    data: data
  })
}

export function updateStation(data) {
  return http({
    method: "put",
    url: "/basic-data-management/equipment-ledger/stations/:id",
    data: data
  })
}

export function updateStatus(data) {
  return http({
    method: "patch",
    url: "/basic-data-management/equipment-ledger/stations/:id",
    data: data
  })
}

export function stationStatusOperationMap(data) {
  return http({
    method: "get",
    url: "/enums/stations/status",
    data: data
  })
}

export function energyUnitStatusOperationMap(data) {
  return http({
    method: "get",
    url: "/enums/energy-units/status",
    data: data
  })
}

export function deleteStation(data) {
  return http({
    method: "delete",
    url: "/basic-data-management/equipment-ledger/stations/:id",
    data: data
  })
}

export function fetchOperator(data) {
  return http({
    method: "get",
    url: "/basic-data-management/customers/by-type",
    data: data
  })
}

export function getEnergyUnitTree(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/devices",
    data: { ...data, needCell: false },
    convert: (results) => {
      traverseTree(results.children, item => {
        if (!item.id) {
          item.id = 'local' + getUid()
        }
        return null
      })
      return results
    }
  })
}

export function fetchEnergyUnitTypes(data) {
  return http({
    method: "get",
    url: "/enums/energy-units/type",
    data: data
  })
}

export function addEnergyUnit(data) {
  return http({
    method: "post",
    url: "/basic-data-management/equipment-ledger/energy-units",
    data: data
  })
}

export function updateEnergyUnit(data) {
  return http({
    method: "put",
    url: "/basic-data-management/equipment-ledger/energy-units/:id",
    data: data
  })
}

export function deleteEnergyUnit(data) {
  return http({
    method: "delete",
    url: "/basic-data-management/equipment-ledger/energy-units/:id",
    data: data
  })
}

export function fetchEnergyUnitDetail(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/energy-units/:id",
    data: data
  })
}

export function fetchDeviceDetail(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/devices/:id",
    data: data
  })
}

export function fetchDeviceName(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/devices/name",
    data: data
  })
}

export function deleteDevice(data) {
  return http({
    method: "delete",
    url: "/basic-data-management/equipment-ledger/devices/:id",
    data: data
  })
}

export function addDevice(data) {
  return http({
    method: "post",
    url: "/basic-data-management/equipment-ledger/devices",
    data: data
  })
}

export function updateDevice(data) {
  return http({
    method: "put",
    url: "/basic-data-management/equipment-ledger/devices/:id",
    data: data
  })
}

export function fetchDataPointList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/analogs",
    data: data
  })
}

export function fetchDataPointHistoryList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/analogs/operate/history",
    data: data
  })
}

export function fetchDraftVersion(data) {
  return http({
    method: "post",
    url: "/basic-data-management/equipment-ledger/analogs-temp/edit",
    data
  })
}

export function deployVersion(data) {
  return http({
    method: "post",
    url: "/basic-data-management/equipment-ledger/analogs-temp/publish",
    data
  })
}

export function fetchDraftList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/analogs-temp",
    data
  })
}

export function fetchTypeList(data) {
  return http({
    method: "get",
    url: "/enums/analogs/type/not-bind",
    data: data
  })
}

export function fetchUsePriceList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/prices/cost",
    data: data
  })
}

export function fetchPriceGenerateList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/prices/generate",
    data: data
  })
}

// TODO：接口未找到使用场景，先注释
// export function fetchStationEnergyUnitList(data) {
//   return http({
//     method: "get",
//     url: "/energy-units/list",
//     data: data
//   })
// }

export function fetchProvinceOptions() {
  return http({
    method: "get",
    url: "/enums/areas/top/false"
  })
}

export function fetchCityOptions(data) {
  return http({
    method: "get",
    url: "/enums/areas/child/false",
    data
  })
}

// TODO：与fetchCityOptions方法一样
export function fetchDistrictOptions(data) {
  return http({
    method: "get",
    url: "/enums/areas/child/false",
    data
  })
}

export function batchUpdateDevice(data) {
  return http({
    method: "put",
    url: "/basic-data-management/equipment-ledger/devices/batch",
    data: data
  })
}

export function addDataPoint(data) {
  return http({
    method: "post",
    url: "/basic-data-management/equipment-ledger/analogs-temp",
    data: data
  })
}

export function updateDataPoint(data) {
  return http({
    method: "patch",
    url: "/basic-data-management/equipment-ledger/analogs-temp/:id",
    data: data
  })
}

export function deleteDataPoint(data) {
  return http({
    method: "delete",
    url: "/basic-data-management/equipment-ledger/analogs-temp/:id",
    data: data
  })
}

export function savePrice(data) {
  return http({
    method: "put",
    url: "/basic-data-management/equipment-ledger/stations/:id/price",
    data: data
  })
}
export function saveRealTimePrice(data) {
  return http({
    method: "put",
    url: "/basic-data-management/equipment-ledger/stations/realTime/:id/price",
    data: data
  })
}

// TODO：未找到对应接口
// export function terminalTypes(data) {
//   return http({
//     method: "get",
//     url: "/enums/devices/terminal-types",
//     data: data
//   })
// }

export function upload(data) {
  return http({
    method: "post",
    url: "/basic-data-management/equipment-ledger/analogs/batch",
    data: data
  })
}

export function getStationListByStatus(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/stations/:id/status-record",
    data: data
  })
}

export function fetchInputOutputTypes() {
  return http({
    method: "get",
    url: "/enums/devices/input-output-type"
  })
}

export function fetchSignalName(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/analogs/signal",
    data
  })
}

export function getSpotList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/prices/realTime",
    data
  })
}

export function getSpotCurve(data) {
  return http({
    method: "get",
    url: "/basic-data-management/prices/curve",
    data
  })
}

export function fetchRealTime(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/stations/realTime",
    data
  })
}

export function fetchStrategySettingList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/strategy-setting",
    data
  })
}
//----------------------新版电价-----------------------
// 获取实时电价价格枚举
export function realTimePriceMap(data) {
  return http({
    method: "get",
    url: "/enums",
    data: data
  })
}

// 查询当前或者计划电价
export function getPricePool(data) {
  return http({
    method: "get",
    url: "/basic-data-management/price-pool",
    data: data
  })
}

// 查询电站电网电价、非电网电价曲线
export function fetchPriceChartData(data) {
  if (data.type == 'Cost') {
    return http({
      method: "get",
      url: "/basic-data-management/price-pool/cost",
      data: { id: data.stationId, dtime: data.dtime }
    })
  } else {
    return http({
      method: "get",
      url: "/basic-data-management/price-pool/generation",
      data: { id: data.stationId, dtime: data.dtime }
    })
  }
}

// 新增计划电价
export function addPricePool({ data, ...rest }) {
  return http({
    method: "post",
    url: `/basic-data-management/price-pool?${qs.stringify(rest)}`,
    data: data
  })
}

// 修改计划电价
export function editPricePool({ data, id }) {
  if (id)
    return http({
      method: "put",
      url: `/basic-data-management/price-pool/${id}`,
      data: data
    })
}

// 删除计划电价
export function removePricePool({ id, energyUnitId }) {
  if (id)
    return http({
      method: "delete",
      url: `/basic-data-management/price-pool/${id}?energyUnitId=${energyUnitId}`,
    })
}


export function putStrategySetting(data) {
  return http({
    method: "put",
    url: "/basic-data-management/strategy-setting",
    data
  })
}

// 根据条件查询能量单元
export function getEnergyUnits(data) {
  return http({
    method: "get",
    url: "/enums",
    data: {
      ...data,
      resource: "energyUnits"
    }
  })
}

export function getScenariosList() {
  return http({
    method: "get",
    url: "/scenarios",
  })
}

export function getDeviceList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/business-models/device-type",
    data: {
      ...data
    }
  })
}

export function getBatchMaintenanceList(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/maintenance-record",
    data: {
      ...data
    }
  })
}

export function postMaintenanceRecord(data) {
  return http({
    method: "post",
    url: "/basic-data-management/equipment-ledger/maintenance-record",
    data: {
      ...data
    }
  })
}

export function putMaintenanceRecord(data) {
  return http({
    method: "put",
    url: "/basic-data-management/equipment-ledger/maintenance-record",
    data: {
      ...data
    }
  })
}

export function deleteMaintenanceRecord(id) {
  return http({
    method: "delete",
    url: `/basic-data-management/equipment-ledger/maintenance-record/${id}`,
  })
}
export function getSelect(data) {
  return http({
    method: "get",
    url: "/enums",
    data: {
      ...data
    }
  })
}

export function getCollectDevices(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/collect-devices",
    data: {
      ...data
    }
  })
}

export function postCollectDevices(data) {
  return http({
    method: "post",
    url: "/basic-data-management/equipment-ledger/collect-devices",
    data: {
      ...data
    }
  })
}

export function getCollectDevicesBatch(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/collect-devices/batch",
    data: {
      ...data
    }
  })
}

export function getAnalogsQuantity(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/collect-devices/analogsQuantity",
    data: {
      ...data
    }
  })
}

export function getDeviceCategoriesByDeviceId(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/device-categories/byDeviceId",
    data: {
      ...data
    }
  })
}

export function getDeviceDebug(data) {
  return http({
    method: "get",
    url: "/basic-data-management/equipment-ledger/device-debug",
    data: {
      ...data
    }
  })
}
