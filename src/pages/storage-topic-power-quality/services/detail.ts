import createServices from "../../../util/createServices";

const services = {
  getVoltageHarmonicData: function(params) {
    return createServices<{
      firmId: number;
      energyUnitId: string;
      startDate: string;
      endDate: string;
      page?: number;
      size?: number;
    }>("get", "/api/energy-analysis/voltage-harmonic-overshoot", params);
  },
  getCurrentHarmonicData: function(params) {
    return createServices<{
      firmId: number;
      energyUnitId: string;
      startDate: string;
      endDate: string;
      page?: number;
      size?: number;
    }>("get", "/api/energy-analysis/current-harmonic-overshoot", params);
  },
  getVoltageData: function(params) {
    return createServices<{
      firmId: number;
      energyUnitId: string;
      startDate: string;
      endDate: string;
      page?: number;
      size?: number;
    }>("get", "/api/energy-analysis/voltage-overshoot", params);
  },
  getThreePhaseUnbalanceData: function(params) {
    return createServices<{
      firmId: number;
      energyUnitId: string;
      startDate: string;
      endDate: string;
      page?: number;
      size?: number;
    }>("get", "/api/energy-analysis/threephase-unbalance-overshoot", params);
  }
};

export default services;
