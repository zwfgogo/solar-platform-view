import createServices from "../../../util/createServices";

export interface LGCIdType{
  stationId: number, // 电站id
  dtime: string // 时间字段 YYYY-MM-01
}

export interface LGCType extends LGCIdType{
	earnCount: number, // 赚取lgc
	sellCount: number, // 出售lgc
	price: number // 单价
}

export interface LGCListParams extends LGCIdType{
  sort?: string, // 排序
	page?: number, // 页数
	size?: number, // 每页数量
}

export interface CountParams{
  stationId: number, // 电站id
  type: 'Sell' | 'Earn'; // 售出 | 赚取
}

const services = {
  getLGC: function (params) {
    return createServices<LGCListParams>(
      "get",
      "/lgc/getLGC",
      params
    );
  },
  getCountByStationId: function (params) {
    return createServices<CountParams>(
      "get",
      "/lgc/getCountByStationId",
      params
    );
  },
  createLGC: function (params) {
    return createServices<LGCType>(
      "post",
      "/lgc/createLGC",
      params
    );
  },
  updateLGC: function (params) {
    return createServices<LGCType>(
      "put",
      "/lgc/updateLGC",
      params
    );
  },
  deleteLGC: function (params) {
    return createServices<LGCIdType>(
      "delete",
      "/lgc/deleteLGC",
      params
    );
  },
};

export default services;
