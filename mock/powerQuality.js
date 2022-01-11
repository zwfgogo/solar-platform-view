import { mockControllWrap } from "./config";

function getData() {
  return {
    results: [
      {
        xData: ["电压谐波越限次数", "电流谐波越限次数"],
        results: [
          [
            { dtime: "电压谐波越限次数", val: 5 },
            { dtime: "电流谐波越限次数", val: 7 }
          ],
          [
            { dtime: "电压谐波越限次数", val: 5 },
            { dtime: "电流谐波越限次数", val: 7 }
          ]
        ],
        legend: ["1号集装箱", "2号集装箱"],
        unit: ["次", "次"],
        timeInterval: [1, 1]
      },
      {
        xData: ["电压合格率"],
        results: [
          [{ dtime: "电压合格率", val: 20 }],
          [{ dtime: "电压合格率", val: 20 }]
        ],
        legend: ["1号集装箱", "2号集装箱"],
        unit: ["%", "%"],
        timeInterval: [1, 1]
      },
      {
        xData: ["三相不平衡越限日"],
        results: [
          [{ dtime: "三相不平衡越限日", val: 4 }],
          [{ dtime: "三相不平衡越限日", val: 4 }]
        ],
        legend: ["1号集装箱", "2号集装箱"],
        unit: ["日", "日"],
        timeInterval: [1, 1]
      }
    ],
    table: [
      {
        num: 1,
        energyUnit: "整站合计",
        voltageHarmonicOvershoot: 2,
        currentHarmonicOvershoot: 3,
        voltageOvershoot: "4%",
        countTime: 0,
        continueTime: 0,
        threePhaseUnbalanceOvershoot: 5,
        energyUnitCode: ""
      },
      {
        num: 2,
        energyUnit: "1号集装箱",
        voltageHarmonicOvershoot: 1,
        currentHarmonicOvershoot: 2,
        voltageOvershoot: "3%",
        threePhaseUnbalanceOvershoot: 4,
        energyUnitCode: 1102010001600101
      },
      {
        num: 3,
        energyUnit: "2号集装箱",
        voltageHarmonicOvershoot: 1,
        currentHarmonicOvershoot: 2,
        voltageOvershoot: "3%",
        threePhaseUnbalanceOvershoot: 4,
        energyUnitCode: 1102010001600102
      }
    ],
    errorCode: 0,
    errorMsg: ""
  };
}

function getEnergyUnit() {
  return {
    results: {
      results: [
        [
          { dtime: "2019-12-03", val: 0 },
          { dtime: "2019-12-04", val: 0 },
          { dtime: "2019-12-05", val: 0 },
          { dtime: "2019-12-06", val: 0 },
          { dtime: "2019-12-07", val: 0 },
          { dtime: "2019-12-08", val: 0 }
        ],
        [
          { dtime: "2019-12-03", val: 37 },
          { dtime: "2019-12-04", val: 86 },
          { dtime: "2019-12-05", val: 132 },
          { dtime: "2019-12-06", val: 28 },
          { dtime: "2019-12-07", val: 0 },
          { dtime: "2019-12-08", val: 0 }
        ],
        [
          { dtime: "2019-12-03", val: 100 },
          { dtime: "2019-12-04", val: 100 },
          { dtime: "2019-12-05", val: 100 },
          { dtime: "2019-12-06", val: 100 },
          { dtime: "2019-12-07", val: "" },
          { dtime: "2019-12-08", val: "" }
        ]
      ],
      legend: ["电压谐波越限次数", "电流谐波越限次数", "电压合格率"],
      unit: ["次", "次", "%"],
      timeInterval: [1, 1, 1]
    },
    table: [
      {
        num: 1,
        dtime: "合计",
        voltageHarmonicOvershoot: 0,
        currentHarmonicOvershoot: 283,
        voltageOvershoot: "100%",
        countTime: 122400000,
        continueTime: 0,
        threePhaseUnbalanceOvershoot: 0
      },
      {
        num: 2,
        dtime: "2019-12-03",
        voltageHarmonicOvershoot: 0,
        currentHarmonicOvershoot: 37,
        voltageOvershoot: "100%",
        countTime: 21600000,
        continueTime: 0,
        threePhaseUnbalanceOvershoot: "否"
      },
      {
        num: 3,
        dtime: "2019-12-04",
        voltageHarmonicOvershoot: 0,
        currentHarmonicOvershoot: 86,
        voltageOvershoot: "100%",
        countTime: 21600000,
        continueTime: 0,
        threePhaseUnbalanceOvershoot: "否"
      },
      {
        num: 4,
        dtime: "2019-12-05",
        voltageHarmonicOvershoot: 0,
        currentHarmonicOvershoot: 132,
        voltageOvershoot: "100%",
        countTime: 21600000,
        continueTime: 0,
        threePhaseUnbalanceOvershoot: "否"
      },
      {
        num: 5,
        dtime: "2019-12-06",
        voltageHarmonicOvershoot: 0,
        currentHarmonicOvershoot: 28,
        voltageOvershoot: "100%",
        countTime: 57600000,
        continueTime: 0,
        threePhaseUnbalanceOvershoot: "否"
      },
      {
        num: 6,
        dtime: "2019-12-07",
        voltageHarmonicOvershoot: 0,
        currentHarmonicOvershoot: 0,
        voltageOvershoot: "",
        countTime: 0,
        continueTime: 0,
        threePhaseUnbalanceOvershoot: "否"
      },
      {
        num: 7,
        dtime: "2019-12-08",
        voltageHarmonicOvershoot: 0,
        currentHarmonicOvershoot: 0,
        voltageOvershoot: "",
        countTime: 0,
        continueTime: 0,
        threePhaseUnbalanceOvershoot: "否"
      }
    ],
    errorCode: 0,
    errorMsg: ""
  };
}

function getVolateHarmonicData(req) {
  const params = req.query || {};
  return {
    results: [],
    page: Number(params.page),
    size: Number(params.size),
    totalCount: 0,
    totalPages: 1,
    errorCode: 0,
    errorMsg: ""
  };
}

function getCurrentHarmonicData(req) {
  const params = req.query || {};
  return {
    results: [
      {
        id: 747748,
        stationCode: 1102010101,
        energyUnitCode: 1102010001600101,
        energyUnitTitle: "1号集装箱",
        dtime: "2019-12-04 08:16:45",
        sequence: "A相",
        harmonicNum: "24次",
        val: 7.99,
        threshold: 6.5,
        num: 1
      },
      {
        id: 747749,
        stationCode: 1102010101,
        energyUnitCode: 1102010001600101,
        energyUnitTitle: "1号集装箱",
        dtime: "2019-12-04 08:44:15",
        sequence: "A相",
        harmonicNum: "24次",
        val: 11.58,
        threshold: 6.5,
        num: 2
      },
      {
        id: 747750,
        stationCode: 1102010101,
        energyUnitCode: 1102010001600101,
        energyUnitTitle: "1号集装箱",
        dtime: "2019-12-04 08:44:15",
        sequence: "A相",
        harmonicNum: "20次",
        val: 8.4,
        threshold: 7.8,
        num: 3
      }
    ],
    page: Number(params.page),
    size: Number(params.size),
    totalCount: 86,
    totalPages: 1,
    errorCode: 0,
    errorMsg: ""
  };
}

function getVoltage(req) {
  const params = req.query || {};
  return {
    results: [],
    page: Number(params.page),
    size: Number(params.size),
    totalCount: 0,
    totalPages: 1,
    errorCode: 0,
    errorMsg: ""
  };
}

function getThreePhaseUnbalance(req) {
  const params = req.query || {};
  return {
    results: [
      {
        id: 40,
        stationCode: 1102010101,
        energyUnitCode: 1102010001600101,
        energyUnitTitle: "1号集装箱",
        dtime: "2019-12-06",
        voltageContinueTime: "60秒",
        currentContinueTime: "60秒",
        overshootDay: false,
        num: 1
      }
    ],
    page: Number(params.page),
    size: Number(params.size),
    totalCount: 1,
    totalPages: 1,
    errorCode: 0,
    errorMsg: ""
  };
}

export default mockControllWrap(
  {
    "GET /api/energy-analysis": (req, res) => {
      setTimeout(() => {
        res.send(getData());
      }, 1000);
    },
    "GET /api/energy-analysis/energyUnit": (req, res) => {
      setTimeout(() => {
        res.send(getEnergyUnit(req));
      }, 1000);
    },
    "GET /api/energy-analysis/voltage-harmonic-overshoot": (req, res) => {
      setTimeout(() => {
        res.send(getVolateHarmonicData(req));
      }, 1000);
    },
    "GET /api/energy-analysis/current-harmonic-overshoot": (req, res) => {
      setTimeout(() => {
        res.send(getCurrentHarmonicData(req));
      }, 1000);
    },
    "GET /api/energy-analysis/voltage-overshoot": (req, res) => {
      setTimeout(() => {
        res.send(getVoltage(req));
      }, 1000);
    },
    "GET /api/energy-analysis/threephase-unbalance-overshoot": (req, res) => {
      setTimeout(() => {
        res.send(getThreePhaseUnbalance(req));
      }, 1000);
    }
  },
  []
  // { closeControll: true }
);
