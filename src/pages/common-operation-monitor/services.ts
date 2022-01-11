import createServices from "../../util/createServices";

export interface tableListType{
  stationId: number, // 电站id
  page?: number,
  size?: number
}

const services = {
  getTableList: function (params) {
    return createServices<tableListType>(
      "get",
      "/microgrid-monitor/getMicrogridList",
      params
    );
  },
};

export default services;
