import { mockControllWrap } from "./config";

function getXAxis(req) {
  const params = req.query || {};
  const arr = [];
  if (params.dateType === "year") {
    for (let i = 0; i < 12; i++) {
      arr.push(`2020/${i + 1}`);
    }
  } else {
    for (let i = 0; i < 24; i++) {
      arr.push(`2020/1/${i + 1}`);
    }
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

export default mockControllWrap(
  {
    "GET /api-vpp/report/summary": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            calculationDate: "2020-02-03,周一",
            profit: {
              unit: "$",
              value: 19999
            },
            energyTrade: {
              unit: "$",
              value: 999
            },
            demandResponse: {
              unit: "$",
              value: 19900
            },
            avgProfit: {
              unit: "$",
              value: 199
            },
            avgEnergyTrade: {
              unit: "$",
              value: 99
            },
            avgDemandResponse: {
              unit: "$",
              value: 100
            }
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api-vpp/report/profit-curve": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            xData: getXAxis(req),
            yData: [getYAxis(), getYAxis()],
            series: [
              {
                name: "收益1",
                unit: "$"
              },
              {
                name: "收益2",
                unit: "$"
              }
            ]
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    }
  },
  []
  // { closeControll: true }
);
