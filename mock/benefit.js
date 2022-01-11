import { mockControllWrap } from "./config";

function getList(req) {
  const list = [];
  for (let i = 0; i < 2; i++) {
    const item = {
      num: 1,
      name: `${i + 1}号集装箱`,
      efficiencyOverall: "0%",
      efficiencyTransformer: "",
      efficiencyPCS: "",
      efficiencyBattery: "",
      energyUnitCode: 1102010001600101 + i
    };
    list.push(item);
  }
  return list;
}

function getChartData() {
  return {
    xData: ["整体效率", "变压器效率", "PCS效率", "电池总效率"],
    results: [
      [
        {
          dtime: "整体效率",
          val: 2
        },
        {
          dtime: "变压器效率",
          val: 3
        },
        {
          dtime: "PCS效率",
          val: 6.8
        },
        {
          dtime: "电池总效率",
          val: 1.5
        }
      ]
    ],
    legend: ["1号集装箱"],
    unit: ["%"],
    timeInterval: [1]
  };
}

function getDetailData() {
  return {
    results: {
      results: [
        [
          { dtime: "2019-12-10 00:00:00", val: 0 },
          { dtime: "2019-12-11 00:00:00", val: 0 },
          { dtime: "2019-12-12 00:00:00", val: 0 },
          { dtime: "2019-12-13 00:00:00", val: 0 },
          { dtime: "2019-12-14 00:00:00", val: 0 },
          { dtime: "2019-12-15 00:00:00", val: 0 },
          { dtime: "2019-12-16 00:00:00", val: 0 },
          { dtime: "2019-12-17 00:00:00", val: 0 },
          { dtime: "2019-12-18 00:00:00", val: 0 },
          { dtime: "2019-12-19 00:00:00", val: 0 },
          { dtime: "2019-12-20 00:00:00", val: 0 },
          { dtime: "2019-12-21 00:00:00", val: 0 },
          { dtime: "2019-12-22 00:00:00", val: 0 },
          { dtime: "2019-12-23 00:00:00", val: 0 },
          { dtime: "2019-12-24 00:00:00", val: 0 },
          { dtime: "2019-12-25 00:00:00", val: 0 },
          { dtime: "2019-12-26 00:00:00", val: 0 },
          { dtime: "2019-12-27 00:00:00", val: 0 },
          { dtime: "2019-12-28 00:00:00", val: 0 },
          { dtime: "2019-12-29 00:00:00", val: 0 },
          { dtime: "2019-12-30 00:00:00", val: 0 },
          { dtime: "2019-12-31 00:00:00", val: 0 },
          { dtime: "2020-01-01 00:00:00", val: 0 },
          { dtime: "2020-01-02 00:00:00", val: 0 },
          { dtime: "2020-01-03 00:00:00", val: 0 },
          { dtime: "2020-01-04 00:00:00", val: 0 },
          { dtime: "2020-01-05 00:00:00", val: 0 },
          { dtime: "2020-01-06 00:00:00", val: 0 },
          { dtime: "2020-01-07 00:00:00", val: 0 },
          { dtime: "2020-01-08 00:00:00", val: 0 }
        ],
        [
          { dtime: "2019-12-10 00:00:00", val: 100 },
          { dtime: "2019-12-11 00:00:00", val: 100 },
          { dtime: "2019-12-12 00:00:00", val: 100 },
          { dtime: "2019-12-13 00:00:00", val: 100 },
          { dtime: "2019-12-14 00:00:00", val: 100 },
          { dtime: "2019-12-15 00:00:00", val: 100 },
          { dtime: "2019-12-16 00:00:00", val: 100 },
          { dtime: "2019-12-17 00:00:00", val: 100 },
          { dtime: "2019-12-18 00:00:00", val: 100 },
          { dtime: "2019-12-19 00:00:00", val: 100 },
          { dtime: "2019-12-20 00:00:00", val: 100 },
          { dtime: "2019-12-21 00:00:00", val: 100 },
          { dtime: "2019-12-22 00:00:00", val: 100 },
          { dtime: "2019-12-23 00:00:00", val: 100 },
          { dtime: "2019-12-24 00:00:00", val: 100 },
          { dtime: "2019-12-25 00:00:00", val: 100 },
          { dtime: "2019-12-26 00:00:00", val: 100 },
          { dtime: "2019-12-27 00:00:00", val: 100 },
          { dtime: "2019-12-28 00:00:00", val: 100 },
          { dtime: "2019-12-29 00:00:00", val: 100 },
          { dtime: "2019-12-30 00:00:00", val: 100 },
          { dtime: "2019-12-31 00:00:00", val: 100 },
          { dtime: "2020-01-01 00:00:00", val: 100 },
          { dtime: "2020-01-02 00:00:00", val: 100 },
          { dtime: "2020-01-03 00:00:00", val: 100 },
          { dtime: "2020-01-04 00:00:00", val: 100 },
          { dtime: "2020-01-05 00:00:00", val: 100 },
          { dtime: "2020-01-06 00:00:00", val: 100 },
          { dtime: "2020-01-07 00:00:00", val: 100 },
          { dtime: "2020-01-08 00:00:00", val: 100 }
        ],
        [
          { dtime: "2019-12-10 00:00:00", val: 100 },
          { dtime: "2019-12-11 00:00:00", val: 100 },
          { dtime: "2019-12-12 00:00:00", val: 100 },
          { dtime: "2019-12-13 00:00:00", val: 100 },
          { dtime: "2019-12-14 00:00:00", val: 100 },
          { dtime: "2019-12-15 00:00:00", val: 100 },
          { dtime: "2019-12-16 00:00:00", val: 100 },
          { dtime: "2019-12-17 00:00:00", val: 100 },
          { dtime: "2019-12-18 00:00:00", val: 100 },
          { dtime: "2019-12-19 00:00:00", val: 100 },
          { dtime: "2019-12-20 00:00:00", val: 100 },
          { dtime: "2019-12-21 00:00:00", val: 100 },
          { dtime: "2019-12-22 00:00:00", val: 100 },
          { dtime: "2019-12-23 00:00:00", val: 100 },
          { dtime: "2019-12-24 00:00:00", val: 100 },
          { dtime: "2019-12-25 00:00:00", val: 100 },
          { dtime: "2019-12-26 00:00:00", val: 100 },
          { dtime: "2019-12-27 00:00:00", val: 100 },
          { dtime: "2019-12-28 00:00:00", val: 100 },
          { dtime: "2019-12-29 00:00:00", val: 100 },
          { dtime: "2019-12-30 00:00:00", val: 100 },
          { dtime: "2019-12-31 00:00:00", val: 100 },
          { dtime: "2020-01-01 00:00:00", val: 100 },
          { dtime: "2020-01-02 00:00:00", val: 100 },
          { dtime: "2020-01-03 00:00:00", val: 100 },
          { dtime: "2020-01-04 00:00:00", val: 100 },
          { dtime: "2020-01-05 00:00:00", val: 100 },
          { dtime: "2020-01-06 00:00:00", val: 100 },
          { dtime: "2020-01-07 00:00:00", val: 100 },
          { dtime: "2020-01-08 00:00:00", val: 100 }
        ],
        [
          { dtime: "2019-12-10 00:00:00", val: "" },
          { dtime: "2019-12-11 00:00:00", val: "" },
          { dtime: "2019-12-12 00:00:00", val: "" },
          { dtime: "2019-12-13 00:00:00", val: "" },
          { dtime: "2019-12-14 00:00:00", val: "" },
          { dtime: "2019-12-15 00:00:00", val: "" },
          { dtime: "2019-12-16 00:00:00", val: "" },
          { dtime: "2019-12-17 00:00:00", val: "" },
          { dtime: "2019-12-18 00:00:00", val: "" },
          { dtime: "2019-12-19 00:00:00", val: "" },
          { dtime: "2019-12-20 00:00:00", val: "" },
          { dtime: "2019-12-21 00:00:00", val: "" },
          { dtime: "2019-12-22 00:00:00", val: "" },
          { dtime: "2019-12-23 00:00:00", val: "" },
          { dtime: "2019-12-24 00:00:00", val: "" },
          { dtime: "2019-12-25 00:00:00", val: "" },
          { dtime: "2019-12-26 00:00:00", val: "" },
          { dtime: "2019-12-27 00:00:00", val: "" },
          { dtime: "2019-12-28 00:00:00", val: "" },
          { dtime: "2019-12-29 00:00:00", val: "" },
          { dtime: "2019-12-30 00:00:00", val: "" },
          { dtime: "2019-12-31 00:00:00", val: "" },
          { dtime: "2020-01-01 00:00:00", val: "" },
          { dtime: "2020-01-02 00:00:00", val: "" },
          { dtime: "2020-01-03 00:00:00", val: "" },
          { dtime: "2020-01-04 00:00:00", val: "" },
          { dtime: "2020-01-05 00:00:00", val: "" },
          { dtime: "2020-01-06 00:00:00", val: "" },
          { dtime: "2020-01-07 00:00:00", val: "" },
          { dtime: "2020-01-08 00:00:00", val: "" }
        ]
      ],
      legend: ["整体效率", "变压器效率", "PCS效率", "电池总效率"],
      unit: ["%", "%", "%", "%"],
      timeInterval: [1, 1, 1, 1]
    },
    table: [
      {
        num: 1,
        name: "合计",
        efficiencyOverall: "100%",
        efficiencyTransformer: "",
        efficiencyPCS: "",
        efficiencyBattery: ""
      },
      {
        num: 2,
        name: "2019-12-10",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 3,
        name: "2019-12-11",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 4,
        name: "2019-12-12",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 5,
        name: "2019-12-13",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 6,
        name: "2019-12-14",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 7,
        name: "2019-12-15",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 8,
        name: "2019-12-16",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 9,
        name: "2019-12-17",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 10,
        name: "2019-12-18",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 11,
        name: "2019-12-19",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 12,
        name: "2019-12-20",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 13,
        name: "2019-12-21",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 14,
        name: "2019-12-22",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 15,
        name: "2019-12-23",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 16,
        name: "2019-12-24",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 17,
        name: "2019-12-25",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 18,
        name: "2019-12-26",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 19,
        name: "2019-12-27",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 20,
        name: "2019-12-28",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 21,
        name: "2019-12-29",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 22,
        name: "2019-12-30",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 23,
        name: "2019-12-31",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 24,
        name: "2020-01-01",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 25,
        name: "2020-01-02",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 26,
        name: "2020-01-03",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 27,
        name: "2020-01-04",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 28,
        name: "2020-01-05",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 29,
        name: "2020-01-06",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 30,
        name: "2020-01-07",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      },
      {
        num: 31,
        name: "2020-01-08",
        efficiencyOverall: "0%",
        efficiencyTransformer: "100%",
        efficiencyPCS: "100%",
        efficiencyBattery: ""
      }
    ],
    errorCode: 0,
    errorMsg: ""
  };
}

export default mockControllWrap(
  {
    "GET /api/monographic-analysis/efficiency-analysis": (req, res) => {
      setTimeout(() => {
        res.send({
          results: getChartData(),
          table: getList(req),
          errorCode: 0,
          errorMsg: "123"
        });
      }, 1000);
    },
    "GET /api/monographic-analysis/efficiency-analysis/detail": (req, res) => {
      setTimeout(() => {
        res.send(getDetailData());
      }, 1000);
    }
  },
  [],
  // { closeControll: true }
);
