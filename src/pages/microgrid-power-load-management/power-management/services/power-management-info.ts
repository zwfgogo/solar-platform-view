import createServices from "../../../../util/createServices";

const Service = {
  getPowerDetail: function(params) {
    return createServices<{
      stationId: string;
    }>("get", "/api/power-devices/:id", params);
  },
  getOverhaulPlanList: function(params) {
    return createServices<{
      powerDeviceId: string;
    }>("get", "/api/power-devices/maintenancePlan", params);
  },
  newMaintenance: function(params) {
    return createServices<any>("post", "/api/power-devices/maintenancePlan", params);
  },
  editMaintenance: function(params) {
    return createServices<any>("put", "/api/power-devices/maintenancePlan", params);
  },
  deleteMaintenance: function(params) {
    return createServices<{
      id: string
    }>("delete", "/api/power-devices/maintenancePlan", params);
  },
  maintenanceStart: function(params) {
    return createServices<{
      id: string;
      dtime: string
    }>("post", "/api/power-devices/maintenancePlan/start", params);
  },
  maintenanceFinish: function(params) {
    return createServices<{
      id: string;
      dtime: string
    }>("post", "/api/power-devices/maintenancePlan/finish", params);
  },
};

export default Service;
