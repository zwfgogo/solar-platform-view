import createServices from '../../../public/js/createServices'
import http from '../../../public/js/http'

export function deviceTypesAnalogsDelete(data) {
  const { analogTypeIds, ...other } = data
  return http({
    method: "delete",
    url: "/basic-data-management/business-models/analog-type",
    data: other,
    bodyData: { analogTypeIds }
  })
}

export function analogsTypesDelete(data) {
  const { analogTypeIds, ...other } = data
  return http({
    method: "delete",
    url: "/basic-data-management/business-models/analog-type",
    data: other,
    bodyData: { analogTypeIds }
  })
}

const map = createServices({
  getDeviceTypesAnalogs: '/basic-data-management/business-models/analog-type|get',
  deviceTypesAnalogsAdd: '/basic-data-management/business-models/analog-type/bind|post',
  stationTypesAnalogsAdd: '/basic-data-management/business-models/analog-type/stationBind|post',
  deviceTypesAnalogsEdit: '/basic-data-management/business-models/analog-type/:id|put',
  // deviceTypesAnalogsDelete: '/basic-data-management/business-models/analog-type|delete',
  stationTypesAnalogsDelete: '/basic-data-management/business-models/analog-type/station|delete',
  getAnalogsTypes: '/basic-data-management/business-models/analog-type|get',
  analogsTypesAdd: '/basic-data-management/business-models/analog-type|post',
  analogsTypesEdit: '/basic-data-management/business-models/analog-type/:id|put',
  // analogsTypesDelete: '/basic-data-management/business-models/analog-type|delete',
  bindAdd: '/basic-data-management/business-models/device-type/:id/bind/analog-types/batch|post',

  getNewName: '/basic-data-management/business-models/analog-type/new-name|get',
  getDeviceTypesTerminals: '/basic-data-management/business-models/analog-type/terminals|get',
  // getDeviceTypes1: '/device-types/information|get',
  // getNewName1: '/device-types/new-name|get',
  // deviceTypesAdd: '/device-types|post',
  // deviceTypesEdit: '/device-types/:id|put',
  // deviceTypesDelete: '/device-types/:id|delete',
  // getEnergyUnits: '/enums/energy-units/type|get'
})

map.deviceTypesAnalogsDelete = deviceTypesAnalogsDelete
map.analogsTypesDelete = analogsTypesDelete

export default map
