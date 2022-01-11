import createServices from "../../../../util/createServices";

const Service = {
  getPowerList: function(params) {
    return createServices<{
      stationId: string;
    }>("get", "/api/power-devices", params);
  },
  putPowerList: function(params) {
    return createServices<{
      deviceList: any[];
    }>("put", "/api/power-devices", params);
  },
};

export default Service;
