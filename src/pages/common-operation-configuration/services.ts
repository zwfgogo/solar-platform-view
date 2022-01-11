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
      "/operation-configuration",
      params
    );
  },

  addOperation: function (params) {
    return createServices<tableListType>(
      "post",
      "/operation-configuration",
      params
    );
  },

  updateOperation: function (params) {
    return createServices<tableListType>(
      "put",
      `/operation-configuration/${params.id}`,
      params
    );
  },

  updateEnergy: function (params) {
    return createServices<any>(
      "patch",
      `/basic-data-management/equipment-ledger/energy-units/${params.id}`,
      params
    );
  },
};

export default services;
