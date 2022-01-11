import { mockControllWrap } from "./config";

const getItem = ({ id, code, lng, lat }) => {
  return {
    id: id || 98435,
    code: null,
    name: null,
    title: "211212",
    ratedPower: "370kW",
    scale: "1.11MWH",
    longitude: lng,
    latitude: lat,
    coordinate: [lng, lat],
    address: "",
    description: "",
    pvCapacity: null,
    pvPower: null,
    batteryCapacity: null,
    batteryPower: null,
    sn: 1577416933730,
    productionTime: "2019-12-27 11:22:13",
    stationType: {
      id: 293,
      code: 3,
      name: "Photovoltaic",
      title: "Solar",
      sn: "3",
      activity: true
    },
    stationStatus: {
      id: 832,
      code: code,
      name: "activate",
      title: "已投产",
      sn: 1,
      activity: true
    },
    siteStatus: null,
    stationTypeId: null,
    stationTypeTitle: null,
    stationStatusId: null,
    stationStatusTitle: null,
    siteStatusId: null,
    siteStatusTitle: null,
    stationStatusTime: "2019-12-27 11:22:13",
    provinceId: null,
    provinceTitle: null,
    cityId: null,
    cityTitle: null,
    districtId: null,
    districtTitle: null,
    operatorId: null,
    operatorTitle: null,
    maintenanceId: null,
    maintenanceTitle: null,
    finalUserId: null,
    finalUserTitle: null,
    province: null,
    city: null,
    district: null,
    operator: null,
    maintenance: null,
    finalUser: null,
    hasPrice: false,
    photoFiles: []
  };
};

function getTableList(req) {
  const params = req.query || {};
  const list = [];
  list.push(getItem({ id: 1, code: 1, lng: 120.200598, lat: 29.207071 }));
  list.push(getItem({ id: 2, code: 2, lng: 120.215259, lat: 29.201952 }));
  list.push(getItem({ id: 3, code: 3, lng: 120.224026, lat: 29.201952 }));
  list.push(getItem({ id: 4, code: 4, lng: 120.226757, lat: 29.207945 }));
  list.push(getItem({ id: 5, code: 5 }));
  return {
    results: {
      results: list,
      page: Number(params.page),
      size: Number(params.size),
      totalPage: 1,
      totalCount: 100
    },
    errorCode: 0,
    errorMsg: "123"
  };
}

export default mockControllWrap(
  {
    "GET /api/station-monitoring/tree": (req, res) => {
      setTimeout(() => {
        res.send({
          results: [
            {
              id: 6322,
              code: null,
              name: "A0",
              title: "储能1",
              activity: true,
              children: [
                getItem({ id: 1, code: 1, lng: 120.200598, lat: 29.207071 }),
                getItem({ id: 2, code: 2, lng: 120.215259, lat: 30.201952 })
              ]
            },
            {
              id: 6323,
              code: null,
              name: "A0",
              title: "储能2",
              activity: true,
              children: [
                getItem({ id: 3, code: 3, lng: 121.226757, lat: 29.207945 }),
                getItem({ id: 4, code: 4, lng: 121.224026, lat: 30.225546 })
              ]
            }
          ],
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/station-monitoring/table": (req, res) => {
      setTimeout(() => {
        res.send(getTableList(req));
      }, 1000);
    },
    "GET /api/station-monitoring/1": (req, res) => {
      setTimeout(() => {
        res.send({
          results: getItem({ code: 1 }),
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    }
  },
  [],
  // { closeControll: true }
);
