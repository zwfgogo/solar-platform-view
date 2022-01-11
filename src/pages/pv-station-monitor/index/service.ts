import createServices from "../../../util/createServices";

const services = {
  getTreeData: function(params) {
    return createServices<{
      firmId: number;
      queryStr: string;
    }>("get", "/api/station-monitoring/tree", params);
  },
  getTableData: function(params) {
    return createServices<{
      firmId: number;
      queryStr: string;
      page: number;
      size: number;
    }>("get", "/api/station-monitoring/table", params);
  },
  getStationDetail: function(params) {
    return createServices<{
    }>("get", "/api/station-monitoring/:id", params);
  },
  jumpPath: function(params) {
    return createServices<{
    }>("get", "/api/menu/jumpPath", params);
  }
};

export default services;
