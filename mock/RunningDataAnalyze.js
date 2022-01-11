import { mockControllWrap } from "./config";
import moment from 'moment';

let i = 0

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

const getDeviceList = (req) => {
  const params = req.query || {};
  const flag = params?.selectItem == '1'
  return [{
    title: '电站1',
    children: [{
      title: '单元1',
      children: [{
        title: '变压器',
        checkable: flag,
        children: [{
          id: 1,
          title: '变压器1',
          typeId: '2',
          checkable: true
        }, {
          id: 3,
          title: '变压器3',
          typeId: '2',
          checkable: true
        }]
      }]
    }, {
      title: '单元2',
      children: [{
        title: '变压器',
        checkable: flag,
        children: [{
          id: 2,
          title: '变压器2',
          typeId: '1',
          checkable: true
        }]
      }]
    }]
  }, {
    title: '电站11',
    children: [{
      title: '单元11',
      children: [{
        title: '变压器',
        checkable: flag,
        children: [{
          id: 11,
          title: '变压器11',
          typeId: '1',
          checkable: true
        }]
      }]
    }]
  }];
}

export default mockControllWrap(
  {
    "GET /api/_fortest/_table": (req, res) => {
      setTimeout(() => {
        res.send({
          results: getTable(),
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/operation-analysis/device-tree": (req, res) => {
      setTimeout(() => {
        res.send({
          results: getDeviceList(req),
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/operation-analysis/measurement-type": (req, res) => {
      setTimeout(() => {
        res.send({
          results: [
            {name: 'a', value: `0`},
            {name: 'b', value: `1`},
            {name: 'c', value: `2`},
          ],
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/operation-analysis/analog-type": (req, res) => {
      setTimeout(() => {
        res.send({
          results: [{
              name: 'a',
              title: 'a',
              unit: '@'
            }, {
              name: 'b',
              title: 'b',
              unit: '@'
            }, {
              name: 'c',
              title: 'c',
              unit: '@'
            },
          ],
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);
