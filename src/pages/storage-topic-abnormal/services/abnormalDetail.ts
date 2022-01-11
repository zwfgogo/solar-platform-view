import createServices from "../../../util/createServices";

const services = {
  getTableData: function(params) {
    return createServices<{
      firmId: number;
      page: number;
      size: number;
      stationId: string;
      startDate: string;
      endDate: string;
    }>("get", "/api/abnormal-analysis/total/detail", params);
  }
};

export default services;
