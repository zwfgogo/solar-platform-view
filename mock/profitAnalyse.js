import { mockControllWrap } from "./config";

let list = []
for (let i = 0; i < 7; i++) {
  list.push({
    "id": 12312,
    "stationId": 7684567,
    "energyUnitId": 324234,
    "actualIncome":  23423.4,       //实际收益
    "targetIncome": 32423423.34,    //目标收益
    "incomeDeviation": 34.3,         //收益偏差
    "theorySystemLoss": 4.3,        //理论系统损耗
    "practiceSystemLoss": 3.3,      //实际系统损耗
    "systemLossDeviation": 32.3,    //系统损耗偏差
    "systemLossImproveIncome": 23.2,//系统损耗率优化带来的收益
    "theorySoh": 34.3,              //理论SOH
    "practiceSoh": 23.3,            //实际SOH
    "sohDeviation": 32.3,           //SOH偏差
    "sohImproveIncome": 23.2,       //SoH优化提升带来的收益
    "theoryDod": 34.3,              //理论DOD
    "practiceDod": 23.3,            //实际DOD
    "dodDeviation": 32.3,           //DOD偏差
    "dodImproveIncome": 23.2,       //DOD优化提升带来的收益
    "dtime": `2021-09-2${i} 00:00:00`,
    "rtime": 3203498573420
  })
}

let pricePool = [
  {
    "objectIds": [20259],
    "objectTitles": [],
    "grid": [
      {
        "pointNumber": null,
        "dtime": "2021-09-29 00:00:00",
        "rtime": 1632844800000,
        "val": 0.203,
        "flag": null
      },
      {
        "pointNumber": null,
        "dtime": "2021-09-29 06:00:00",
        "rtime": 1632866400000,
        "val": 0.522,
        "flag": null
      },
      {
        "pointNumber": null,
        "dtime": "2021-09-29 08:00:00",
        "rtime": 1632873600000,
        "val": 0.872,
        "flag": null
      },
      {
        "pointNumber": null,
        "dtime": "2021-09-29 11:00:00",
        "rtime": 1632884400000,
        "val": 0.522,
        "flag": null
      },
      {
        "pointNumber": null,
        "dtime": "2021-09-29 13:00:00",
        "rtime": 1632891600000,
        "val": 0.872,
        "flag": null
      },
      {
        "pointNumber": null,
        "dtime": "2021-09-29 15:00:00",
        "rtime": 1632898800000,
        "val": 0.522,
        "flag": null
      },
      {
        "pointNumber": null,
        "dtime": "2021-09-29 18:00:00",
        "rtime": 1632909600000,
        "val": 0.872,
        "flag": null
      },
      {
        "pointNumber": null,
        "dtime": "2021-09-29 21:00:00",
        "rtime": 1632920400000,
        "val": 0.522,
        "flag": null
      },
      {
        "pointNumber": null,
        "dtime": "2021-09-29 22:00:00",
        "rtime": 1632924000000,
        "val": 0.203,
        "flag": null
      }
    ],
    "nonGrid": []
  }
]
let ActivePower = []
let SOC = []

for (let i = 0; i < 24;i++) {
  for (let j = 0; j < 60;j++) {
    let time = ('00' + i).slice(-2) + ':' + ('00' + j).slice(-2) + ':00'
    ActivePower.push({
      val: 3,
      dtime: `2021-09-29 ${time}`
    })
    SOC.push({
      val: 3,
      dtime: `2021-09-29 ${time}`
    })
  }
}

export default mockControllWrap(
  {
    "GET /api/profit-analysis/offset-summary": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            yesterday: {
              actualIncome: 80,
              targetIncome: 100,
              incomeDeviation: 20
            },
            sevenDay: {
              actualIncome: 80,
              targetIncome: 100,
              incomeDeviation: 20
            },
            thirtyDay: {
              actualIncome: 80,
              targetIncome: 100,
              incomeDeviation: 20
            },
            amount: {
              actualIncome: 80,
              targetIncome: 100,
              incomeDeviation: 20
            },
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/profit-analysis/offset-analyse": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            data: list,
            pricePool,
            ActivePower,
            SOC,
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);
