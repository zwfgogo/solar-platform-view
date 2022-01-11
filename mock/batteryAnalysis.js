import { mockControllWrap } from "./config";

const summaryResults = {
  results: {
    xData: ['电池单元1', '电池单元2'],
    yData: [
      [12, 14],
      [13, 13],
    ],
    series: [{ name: '电池单元总里程', unit: 'kWh' }, { name: '平均总里程', unit: 'kWh' }],
    total: 333333333,
    range: 123123,
  },
  errorCode: 0,
  errorMsg: ''
}

const tendencyResults = {
  results: {
    '电池单元1': [
      { dtime: '2021-08-10 00:00:00', val: 1, flag: null },
      { dtime: '2021-08-11 00:00:00', val: 1, flag: null },
      { dtime: '2021-08-12 00:00:00', val: 1, flag: null },
    ],
    '电池单元2': [
      { dtime: '2021-08-10 00:00:00', val: 2, flag: null },
      { dtime: '2021-08-11 00:00:00', val: 2, flag: null },
      { dtime: '2021-08-12 00:00:00', val: 2, flag: null },
    ]
  },
  errorCode: 0,
  errorMsg: ''
}

const sohResults = {
  results: {
    RealSOH: [
      { dtime: '2021-08-13 00:00:00', val: 1, flag: null },
      { dtime: '2021-08-14 00:00:00', val: 2, flag: null },
      { dtime: '2021-08-15 00:00:00', val: 1, flag: null },
      { dtime: '2021-08-16 00:00:00', val: 4, flag: null },
      { dtime: '2021-08-17 00:00:00', val: 5, flag: null },
      { dtime: '2021-08-18 00:00:00', val: 3, flag: null },
    ],
    SOH: [
      { dtime: '2021-08-13 00:00:00', val: 2, flag: null },
      { dtime: '2021-08-14 00:00:00', val: 3, flag: null },
      { dtime: '2021-08-15 00:00:00', val: 1, flag: null },
      { dtime: '2021-08-16 00:00:00', val: 2, flag: null },
    ],
    TheorySOH: [
      { dtime: '2021-08-13 00:00:00', val: 2, flag: null },
      { dtime: '2021-08-14 00:00:00', val: 6, flag: null },
      { dtime: '2021-08-15 00:00:00', val: 5, flag: null },
      { dtime: '2021-08-16 00:00:00', val: 3, flag: null },
      { dtime: '2021-08-17 00:00:00', val: 7, flag: null },
      { dtime: '2021-08-18 00:00:00', val: 8, flag: null },
    ],
    curDate: "2021-08-05"
  },
  errorCode: 0,
  errorMsg: ''
}

const profitResults = {
  results: {
    profitMonth: [
      { dtime: '2021-05-13 00:00:00', val: 1, flag: null },
      { dtime: '2021-06-14 00:00:00', val: 2, flag: null },
      { dtime: '2021-07-15 00:00:00', val: 1, flag: null },
      { dtime: '2021-08-16 00:00:00', val: 4, flag: null },
      { dtime: '2021-09-17 00:00:00', val: 5, flag: null },
      { dtime: '2021-10-18 00:00:00', val: 3, flag: null },
    ],
    profitAmount: [
      { dtime: '2021-05-13 00:00:00', val: 10, flag: null },
      { dtime: '2021-06-14 00:00:00', val: 20, flag: null },
      { dtime: '2021-07-15 00:00:00', val: 10, flag: null },
      { dtime: '2021-08-16 00:00:00', val: 40, flag: null },
      { dtime: '2021-09-17 00:00:00', val: 50, flag: null },
      { dtime: '2021-10-18 00:00:00', val: 30, flag: null },
    ],
    curDate: "2021-08-05"
  },
  errorCode: 0,
  errorMsg: ''
}

export default mockControllWrap(
  {
    "GET /api/battery-analyse/milestone/summary": (req, res) => {
      setTimeout(() => {
        res.send(summaryResults);
      }, 1000);
    },
    "GET /api/battery-analyse/milestone/tendency": (req, res) => {
      setTimeout(() => {
        res.send(tendencyResults);
      }, 1000);
    },
    "GET /api/battery-analyse/soh": (req, res) => {
      setTimeout(() => {
        res.send(sohResults);
      }, 1000);
    },
    "GET /api/battery-analyse/profit": (req, res) => {
      setTimeout(() => {
        res.send(profitResults);
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);