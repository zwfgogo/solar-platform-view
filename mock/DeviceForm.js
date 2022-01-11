import { mockControllWrap } from "./config";
import moment from 'moment';

function getTable() {
  const list = [];
  for(let i =0;i<5;i++) {
    list.push({
      date: moment(),
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

const getDeviceList = () => {
  const list = []
  for(let i = 0; i < 5; i++) {
    list.push({
      stationTitle: `xxxxxxx${i}`,
      stationAddress: 'xxxxxxxxx',
      child: [{
        deviceId: `${i}-1`,
        deviceTitle: 'fxxxxxxxxxxxx'
      }, {
        deviceId: `${i}-2`,
        deviceTitle: 'fxxxxxxxxxxxx'
      }]
    })
  }
  return list
}

export default mockControllWrap(
  {
    "GET /api/statistical-reports/device": (req, res) => {
      setTimeout(() => {
        res.send({
          results: getTable(),
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/statistical-reports/device/device-list": (req, res) => {
      setTimeout(() => {
        res.send({
          results: getDeviceList(),
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);
