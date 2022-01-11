import { mockControllWrap } from "./config";
import moment from 'moment';

function getTable() {
  const list = [];
  for(let i =0;i<5;i++) {
    list.push({
      date: moment().format("YYYY-MM-DD"),
      stationTitle: "xxxxxxxxxxxxxxx",
      production: "xxxxxxxxxx",
      yield: "xxxxxxxxxx",
      co2Reduction: "xxxxxxxxxx",
      performanceRatio: "xxxxxxxxxx",
      revenue: "xxxxxxxxxx"
    })
  }
  return list;
}

export default mockControllWrap(
  {
    "GET /api/statistical-reports/station": (req, res) => {
      setTimeout(() => {
        res.send({
          results: getTable(),
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);
