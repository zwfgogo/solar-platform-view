import { mockControllWrap } from "./config";

function getTableList(req) {
  return {
    results: {
      results: [
        [
          { dtime: "2019-12-10", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-11", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-12", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-13", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-14", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-15", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-16", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-17", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-18", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-19", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-20", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-21", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-22", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-23", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-24", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-25", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-26", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-27", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-28", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-29", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-30", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2019-12-31", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2020-01-01", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2020-01-02", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2020-01-03", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2020-01-04", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2020-01-05", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2020-01-06", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2020-01-07", max: 0.843, min: 0.256, val: 0.587 },
          { dtime: "2020-01-08", max: 0.843, min: 0.256, val: 0.587 }
        ],
        [
          { dtime: "2019-12-10", val: 0 },
          { dtime: "2019-12-11", val: 0 },
          { dtime: "2019-12-12", val: 0 },
          { dtime: "2019-12-13", val: 0 },
          { dtime: "2019-12-14", val: 0 },
          { dtime: "2019-12-15", val: 0 },
          { dtime: "2019-12-16", val: 0 },
          { dtime: "2019-12-17", val: 0 },
          { dtime: "2019-12-18", val: 0 },
          { dtime: "2019-12-19", val: 0 },
          { dtime: "2019-12-20", val: 0 },
          { dtime: "2019-12-21", val: 0 },
          { dtime: "2019-12-22", val: 0 },
          { dtime: "2019-12-23", val: 0 },
          { dtime: "2019-12-24", val: 0 },
          { dtime: "2019-12-25", val: 0 },
          { dtime: "2019-12-26", val: 0 },
          { dtime: "2019-12-27", val: 0 },
          { dtime: "2019-12-28", val: 0 },
          { dtime: "2019-12-29", val: 0 },
          { dtime: "2019-12-30", val: 0 },
          { dtime: "2019-12-31", val: 0 },
          { dtime: "2020-01-01", val: 0 },
          { dtime: "2020-01-02", val: 0 },
          { dtime: "2020-01-03", val: 0 },
          { dtime: "2020-01-04", val: 0 },
          { dtime: "2020-01-05", val: 0 },
          { dtime: "2020-01-06", val: 0 },
          { dtime: "2020-01-07", val: 0 },
          { dtime: "2020-01-08", val: 0 }
        ],
        [
          {
            devCode: 1102010001600101,
            dtime: "2019-12-10 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-09 23:59:59",
            endTime: "2019-12-10 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-11 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-10 23:59:59",
            endTime: "2019-12-11 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-12 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-11 23:59:59",
            endTime: "2019-12-12 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-13 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-12 23:59:59",
            endTime: "2019-12-13 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-14 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-13 23:59:59",
            endTime: "2019-12-14 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-15 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-14 23:59:59",
            endTime: "2019-12-15 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-16 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-15 23:59:59",
            endTime: "2019-12-16 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-17 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-16 23:59:59",
            endTime: "2019-12-17 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-18 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-17 23:59:59",
            endTime: "2019-12-18 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-19 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-18 23:59:59",
            endTime: "2019-12-19 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-20 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-19 23:59:59",
            endTime: "2019-12-20 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-21 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-20 23:59:59",
            endTime: "2019-12-21 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-22 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-21 23:59:59",
            endTime: "2019-12-22 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-23 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-22 23:59:59",
            endTime: "2019-12-23 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-24 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-23 23:59:59",
            endTime: "2019-12-24 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-25 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-24 23:59:59",
            endTime: "2019-12-25 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-26 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-25 23:59:59",
            endTime: "2019-12-26 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-27 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-26 23:59:59",
            endTime: "2019-12-27 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-28 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-27 23:59:59",
            endTime: "2019-12-28 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-29 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-28 23:59:59",
            endTime: "2019-12-29 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-30 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-29 23:59:59",
            endTime: "2019-12-30 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2019-12-31 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-30 23:59:59",
            endTime: "2019-12-31 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2020-01-01 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2019-12-31 23:59:59",
            endTime: "2020-01-01 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2020-01-02 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2020-01-01 23:59:59",
            endTime: "2020-01-02 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2020-01-03 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2020-01-02 23:59:59",
            endTime: "2020-01-03 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2020-01-04 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2020-01-03 23:59:59",
            endTime: "2020-01-04 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2020-01-05 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2020-01-04 23:59:59",
            endTime: "2020-01-05 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2020-01-06 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2020-01-05 23:59:59",
            endTime: "2020-01-06 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2020-01-07 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2020-01-06 23:59:59",
            endTime: "2020-01-07 23:59:59",
            val: 0
          },
          {
            devCode: 1102010001600101,
            dtime: "2020-01-08 00:00:00",
            incomeVal: 0,
            cycleIncome: 0,
            chargeVal: 0,
            startTime: "2020-01-07 23:59:59",
            endTime: "2020-01-08 23:59:59",
            val: 0
          }
        ]
      ],
      legend: ["理论收益上限", "实际收益上限", "平均度电收益"],
      unit: ["元/kWh", "元/kWh", "元/kWh"],
      timeInterval: [1, 1, 1]
    },
    table: [
      {
        num: 1,
        date: "合计",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: 0
      },
      {
        num: 2,
        date: "2019-12-10",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 3,
        date: "2019-12-11",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 4,
        date: "2019-12-12",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 5,
        date: "2019-12-13",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 6,
        date: "2019-12-14",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 7,
        date: "2019-12-15",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 8,
        date: "2019-12-16",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 9,
        date: "2019-12-17",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 10,
        date: "2019-12-18",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 11,
        date: "2019-12-19",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 12,
        date: "2019-12-20",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 13,
        date: "2019-12-21",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 14,
        date: "2019-12-22",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 15,
        date: "2019-12-23",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 16,
        date: "2019-12-24",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 17,
        date: "2019-12-25",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 18,
        date: "2019-12-26",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 19,
        date: "2019-12-27",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 20,
        date: "2019-12-28",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 21,
        date: "2019-12-29",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 22,
        date: "2019-12-30",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 23,
        date: "2019-12-31",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 24,
        date: "2020-01-01",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 25,
        date: "2020-01-02",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 26,
        date: "2020-01-03",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 27,
        date: "2020-01-04",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 28,
        date: "2020-01-05",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 29,
        date: "2020-01-06",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 30,
        date: "2020-01-07",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      },
      {
        num: 31,
        date: "2020-01-08",
        cycleChargeCapacity: 0,
        cycleIncome: 0,
        averageIncome: 0,
        spaceLifting: ""
      }
    ],
    priceNull: false,
    errorCode: 0,
    errorMsg: ""
  };
}

export default mockControllWrap(
  {
    "GET /api/profit-analysis/day": (req, res) => {
      setTimeout(() => {
        res.send(getTableList());
      }, 1000);
    },
    "GET /api/profit-analysis/month": (req, res) => {
      setTimeout(() => {
        res.send(getTableList());
      }, 1000);
    },
    "GET /api/enums": (req, res) => {
      setTimeout(() => {
        res.send({
          results: [
            { name: "1号集装箱", value: 1102010001600101 },
            { name: "2号集装箱", value: 1102010001600102 }
          ],
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    }
  },
  [],
  // { closeControll: true }
);
