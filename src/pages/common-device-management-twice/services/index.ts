import http from "../../../public/js/http";

const services = {
  getTree: function(data) {
    return http({
      method: "get",
      url: "/basic-data-management/twice-device/tree",
      data
    })
  },
  getDevices: function(data) {
    return http({
      method: "get",
      url: "/basic-data-management/twice-device/devices",
      data
    })
  },
  postDevice: function(data) {
    return http({
      method: "post",
      url: "/basic-data-management/twice-device/device",
      data
    })
  },
  putDevice: function(data) {
    return http({
      method: "put",
      url: "/basic-data-management/twice-device/device",
      data
    })
  },
  deleteDevice: function(data) {
    return http({
      method: "delete",
      url: "/basic-data-management/twice-device/device",
      data
    })
  },
  fetchStationManageInfo: function(data) {
    return http({
      method: 'get',
      url: '/basic-data-management/equipment-ledger/stations/:id/base',
      data,
    })
  },
  patchStationManageInfo: function(data) {
    return http({
      method: 'patch',
      url: '/basic-data-management/twice-device/stations/:id',
      data,
    })
  },
};

export default services;