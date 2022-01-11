import createServices from "../../../../util/createServices";

const Service = {
  getLoadDeviceList: function(params) {
    return createServices<{
      stationId: string;
    }>("get", "/api/load-devices", params);
  },
  postLoadDevice: function(params) {
    return createServices<any>("post", "/api/load-devices", params);
  },
  putLoadDevice: function(params) {
    return createServices<any>("put", "/api/load-devices", params);
  },
  deleteLoadDevice: function(params) {
    return createServices<{
      id: string | number;
    }>("delete", "/api/load-devices", params);
  },
  getSwitchList: function(params) {
    return createServices<{
      stationId: string;
    }>("get", "/api/load-devices/switch-list", params);
  },
};

export default Service;
