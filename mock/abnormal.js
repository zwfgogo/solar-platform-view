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

function getDetailTable(req) {
  const params = req.query || {};
  return {
    results: [
      {
        id: 4,
        eventNum: "20200114000004",
        firmId: 20,
        firmTitle: "综合能源智慧运营平台",
        stationId: 99895,
        stationTitle: "测试电站1",
        devId: 1614,
        devTitle: "4#电池组",
        records: "测试电站1测试告警1",
        startTime: "2020-01-06 11:30:17",
        continueTime: 750666031,
        userNameProcess: null,
        userTitleProcess: null,
        abnormalName: "test",
        abnormalTitle: "电池簇/组/串告警",
        abnormalTypeName: "46",
        abnormalTypeTitle: "告警",
        latestProcessTime: null,
        ignoreTime: null,
        abnormalStatusName: "1",
        abnormalStatusTitle: null,
        alarmLevelName: "4",
        alarmLevelTitle: "严重",
        num: 1
      },
      {
        id: 5,
        eventNum: "20200114000005",
        firmId: 20,
        firmTitle: "综合能源智慧运营平台",
        stationId: 99895,
        stationTitle: "测试电站1",
        devId: 1614,
        devTitle: "4#电池组",
        records: "测试电站1测试告警2",
        startTime: "2020-01-06 11:30:17",
        continueTime: 750666031,
        userNameProcess: null,
        userTitleProcess: null,
        abnormalName: "test",
        abnormalTitle: "电池簇/组/串告警",
        abnormalTypeName: "46",
        abnormalTypeTitle: "告警",
        latestProcessTime: null,
        ignoreTime: null,
        abnormalStatusName: "1",
        abnormalStatusTitle: null,
        alarmLevelName: "4",
        alarmLevelTitle: "严重",
        num: 2
      },
      {
        id: 6,
        eventNum: "20200114000006",
        firmId: 20,
        firmTitle: "综合能源智慧运营平台",
        stationId: 99895,
        stationTitle: "测试电站1",
        devId: 1614,
        devTitle: "4#电池组",
        records: "测试电站1测试告警3",
        startTime: "2020-01-06 11:30:17",
        continueTime: 750666031,
        userNameProcess: null,
        userTitleProcess: null,
        abnormalName: "test",
        abnormalTitle: "电池簇/组/串告警",
        abnormalTypeName: "46",
        abnormalTypeTitle: "告警",
        latestProcessTime: null,
        ignoreTime: null,
        abnormalStatusName: "1",
        abnormalStatusTitle: null,
        alarmLevelName: "3",
        alarmLevelTitle: "中度",
        num: 3
      }
    ],
    page: Number(params.page),
    size: Number(params.size),
    totalCount: 3,
    totalPages: 1,
    errorCode: 0
  };
}

export default mockControllWrap(
  {
    "GET /api/abnormal-analysis/byDev": (req, res) => {
      setTimeout(() => {
        res.send(getChartByDay());
      }, 1000);
    },
    "GET /api/abnormal-analysis/total": (req, res) => {
      setTimeout(() => {
        res.send(getChartByDay());
      }, 1000);
    },
    "GET /api/abnormal-analysis/top": (req, res) => {
      setTimeout(() => {
        res.send(getChartByDay());
      }, 1000);
    },
    "GET /api/abnormal-analysis/total/detail": (req, res) => {
      setTimeout(() => {
        res.send(getDetailTable(req));
      }, 1000);
    }
  },
  []
  // { closeControll: true }
);
