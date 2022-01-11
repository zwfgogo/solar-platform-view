import { mockControllWrap } from "./config";

function getTableList(req) {
  const params = req.query || {};
  const list = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
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

function getXAxis() {
  const arr = [];
  for (let i = 0; i < 24; i++) {
    arr.push(`2020/1/${i}`);
  }
  return arr;
}

function getYAxis() {
  const arr = [];
  for (let i = 0; i < 24; i++) {
    arr.push(Math.floor(Math.random() * 10));
  }
  return arr;
}

function getChartByDay() {
  return {
    flag: true,
    results: [
      [
        { dtime: "2019-12-11", val: 1 },
        { dtime: "2019-12-12", val: 2 },
        { dtime: "2019-12-13", val: 3 },
        { dtime: "2019-12-14", val: 1 },
        { dtime: "2019-12-15", val: 6 },
        { dtime: "2019-12-16", val: 4 },
        { dtime: "2019-12-17", val: 2 },
        { dtime: "2019-12-18", val: 3 },
        { dtime: "2019-12-19", val: 2 },
        { dtime: "2019-12-20", val: 8 },
        { dtime: "2019-12-21", val: 7 },
        { dtime: "2019-12-22", val: 4 },
        { dtime: "2019-12-23", val: 0 },
        { dtime: "2019-12-24", val: 8 },
        { dtime: "2019-12-25", val: 10 },
        { dtime: "2019-12-26", val: 1 },
        { dtime: "2019-12-27", val: 6 },
        { dtime: "2019-12-28", val: 8 },
        { dtime: "2019-12-29", val: 0 },
        { dtime: "2019-12-30", val: 0 },
        { dtime: "2019-12-31", val: 3 },
        { dtime: "2020-01-01", val: 0 },
        { dtime: "2020-01-02", val: 7 },
        { dtime: "2020-01-03", val: 0 },
        { dtime: "2020-01-04", val: 0 },
        { dtime: "2020-01-05", val: 8 },
        { dtime: "2020-01-06", val: 0 },
        { dtime: "2020-01-07", val: 9 },
        { dtime: "2020-01-08", val: 0 },
        { dtime: "2020-01-09", val: 1 }
      ]
    ],
    legend: ["异常数量"],
    unit: ["个"],
    timeInterval: [1],
    errorCode: 0,
    errorMsg: ""
  };
}
function getChartByMonth() {
  return {
    flag: true,
    results: [
      [
        { dtime: "2019-02", val: 792 },
        { dtime: "2019-03", val: 596 },
        { dtime: "2019-04", val: 651 },
        { dtime: "2019-05", val: 1466 },
        { dtime: "2019-06", val: 295 },
        { dtime: "2019-07", val: 1375 },
        { dtime: "2019-08", val: 354 },
        { dtime: "2019-09", val: 63 },
        { dtime: "2019-10", val: 6 },
        { dtime: "2019-11", val: 3 },
        { dtime: "2019-12", val: 0 },
        { dtime: "2020-01", val: 0 }
      ]
    ],
    legend: ["异常数量"],
    unit: ["个"],
    timeInterval: [1],
    errorCode: 0,
    errorMsg: ""
  };
}

function getData(req) {
  const params = req.query || {};
  return {
    results: [
        { title: (params.deviceTypeName || 'energyUnitId') + "测试1", id: 792 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试2", id: 596 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试3", id: 651 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试4", id: 1466 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试5", id: 295 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试6", id: 1375 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试7", id: 354 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试8", id: 63 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试9", id: 6 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试10", id: 3 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试11", id: 10 },
        { title: (params.deviceTypeName || 'energyUnitId') + "测试12", id: 11 }
    ],
    errorCode: 0,
    errorMsg: null
  };
}

export default mockControllWrap(
  {
    "GET /api/battery-cabin/station/getBatteryUnitListByEnergyUnitId": (req, res) => {
      setTimeout(() => {
        res.send(getData(req));
      }, 1000);
    },
    "GET /api/battery-cabin/station/getdeviceListBySuperId": (req, res) => {
      setTimeout(() => {
        res.send(getData(req));
      }, 1000);
    },
  },
  []
  // { closeControll: true }
);
