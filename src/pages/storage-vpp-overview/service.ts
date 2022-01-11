import createServices from "../../util/createServices";

const services = {
  getSummary: function(params) {
    return createServices<{ firmId: string }>(
      "get",
      "/vpp/overview/summary",
      params
    );
  },
  getBatteryStatus: function(params) {
    return createServices<{ firmId: string }>(
      "get",
      "/vpp/overview/battery",
      params
    );
  },
  getGenerationChart: function(params) {
    return createServices<{ firmId: string }>(
      "get",
      "/vpp/overview/PV_power",
      params
    );
  },
  getEnergyStoredChart: function(params) {
    return createServices<{ firmId: string }>(
      "get",
      "/vpp/overview/battery-energy",
      params
    );
  },
  getGenerationEnergy: function(params) {
    return createServices<{ firmId: string }>(
      "get",
      "/vpp/overview/generation-energy",
      params
    );
  },
  getProfit: function(params) {
    return createServices<{ firmId: string }>(
      "get",
      "/vpp/overview/profit",
      params
    );
  }
};

export default services;
