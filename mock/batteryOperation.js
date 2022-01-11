import { mockControllWrap } from "./config";

const electricResults = {
  results: {
    AvgFullCharge: [
      { dtime: '2021-08-01 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-02 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-03 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-04 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-05 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-06 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-07 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-08 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-09 00:00:00', val: 10, flag: null }
    ],
    AvgFullDischarge: [
      { dtime: '2021-08-01 00:00:00', val: 8, flag: null },
      { dtime: '2021-08-02 00:00:00', val: 8, flag: null },
      { dtime: '2021-08-03 00:00:00', val: 8, flag: null },
      { dtime: '2021-08-04 00:00:00', val: 8, flag: null },
      { dtime: '2021-08-05 00:00:00', val: 8, flag: null },
      { dtime: '2021-08-06 00:00:00', val: 8, flag: null },
      { dtime: '2021-08-07 00:00:00', val: 8, flag: null },
      { dtime: '2021-08-08 00:00:00', val: 8, flag: null },
      { dtime: '2021-08-09 00:00:00', val: 8, flag: null }
    ],
    records: [
      "2021-08-03 00:00:00",
      "2021-08-06 00:00:00",
    ]
  },
  errorCode: 0,
  errorMsg: null,
}

const recordResults = {
  results: [
    {
      "id": 5,
      "dtime": "2021-06-01 02:24:00",
      "title": '123',
      "type": "Replace",
      "typeTitle": "更换",
      "remarks": 'mark',
      "beforeValue": 12,
      "afterValue": 12,
      "deviceId": 540450
    },
    {
      "id": 7,
      "dtime": "2021-06-02 02:39:00",
      "title": '123',
      "type": "Maintenance",
      "typeTitle": "维保",
      "remarks": null,
      "beforeValue": null,
      "afterValue": null,
      "deviceId": 540450
    }
  ],
  errorCode: 0,
  errorMsg: ''
}

const planResults = {
  results: {
    "replacePackNum":2,
    "capacitySortNum":100,
    "charge":16.2,
    "discharge":15.1,
    "profit":56.7,
    "profitRate":5.6,
    "results":[
      {
        "targetPack":"BC#1-101",
        "newPack":"新电池包1",
      },
      {
        "targetPack":"BC#1-102",
        "newPack":"BC#1-128",
      }
    ]
  },
  errorCode: 0,
  errorMsg: ''
}

const calcResults = {
  results: [
    {
      "val": 1,//更换电池包数或分容次数
      "electricity": 14,//提升电量
      "profit": 10//提升收益
    },
    {
      "val": 3,//更换电池包数或分容次数
      "electricity": 16,//提升电量
      "profit": 10//提升收益
    },
    {
      "val": 5,//更换电池包数或分容次数
      "electricity": 20,//提升电量
      "profit": 10//提升收益
    },
    {
      "val": 7,//更换电池包数或分容次数
      "electricity": 11,//提升电量
      "profit": 10//提升收益
    }
  ],
  errorCode: 0,
  errorMsg: ''
}

export default mockControllWrap(
  {
    "GET /api/battery-maintenance/electric": (req, res) => {
      setTimeout(() => {
        res.send(electricResults);
      }, 1000);
    },
    "GET /api/battery-maintenance/records": (req, res) => {
      setTimeout(() => {
        res.send(recordResults);
      }, 1000);
    },
    "GET /api/battery-maintenance/plan": (req, res) => {
      setTimeout(() => {
        res.send(planResults);
      }, 1000);
    },
    "GET /api/battery-maintenance/calculate": (req, res) => {
      setTimeout(() => {
        res.send(calcResults);
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);
