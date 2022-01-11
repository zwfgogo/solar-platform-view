import { mockControllWrap } from "./config";

export default mockControllWrap(
  {
    "GET /api-vpp/report/profit/detail": (req, res) => {
      setTimeout(() => {
        const params = req.query || {};
        res.send({
          results: {
            header: {
              energySold: "kWh",
              energySoldProfit: "$",
              energyBought: "kWh",
              energyBoughtProfit: "$",
              demandResponse: "kWh",
              demandResponseProfit: "$",
              profit: "$"
            },
            results: [
              {
                num: 1,
                date: "合计",
                energySold: 101,
                energySoldProfit: 102,
                energyBought: 53,
                energyBoughtProfit: 54,
                demandResponse: 105,
                demandResponseProfit: 106,
                profit: 157
              },
              {
                num: 2,
                date: "2020/2/2",
                energySold: 101,
                energySoldProfit: 102,
                energyBought: 53,
                energyBoughtProfit: 54,
                demandResponse: 105,
                demandResponseProfit: 106,
                profit: 157
              }
            ],
            page: Number(params.page),
            size: Number(params.size),
            totalPage: 1,
            totalSize: 20
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
