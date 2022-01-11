import createServices from "../util/createServices";

const services = {
  getTreeData: function(params) {
    return createServices<{
      firmId: number;
      title: string;
    }>("get", "/api/station-monitoring/tree", params);
  }
};

export default services;
