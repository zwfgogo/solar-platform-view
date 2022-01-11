import { mockControllWrap } from "./config";

function getXAxis() {
  const arr = [];
  for (let i = 0; i < 24; i++) {
    arr.push(`2020/1/3 ${i}:00:00`);
    arr.push(`2020/1/3 ${i}:30:00`);
  }
  return arr;
}

function getYAxis() {
  const arr = [];
  for (let i = 0; i < 24; i++) {
    arr.push(Math.floor(Math.random() * 10));
    arr.push(Math.floor(Math.random() * 10));
  }
  return arr;
}

export default mockControllWrap(
  {
    "GET /api-vpp/overview/summary": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            VPP: 7,
            site: {
              onLine: 900,
              total: 1000
            },
            PV: {
              capacity: 9999,
              capacityUnit: "mWp",
              power: 8,
              powerUnit: "mWp"
            },
            battery: {
              capacity: 9999,
              capacityUnit: "mWp",
              power: 8,
              powerUnit: "mWp"
            },
            _vppCount: 7,
            _pvCapacity: 8,
            _pvCapacityUnit: "mWp",
            _storeCapacity: 8,
            _storeCapacityUnit: "mWp",
            _storeTotalCapacity: 14,
            _storeTotalCapacityUnit: "mWp",
            _onlineStationCount: 920,
            _totalStationCount: 1000,
            _restPower: 37.75,
            _restPowerUnit: "MWh",
            _restPowerPercentage: 0.85,
            _totalPower: 60,
            _totalPowerUnit: "MWh"
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api-vpp/overview/battery": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            energy: {
              value: 111,
              unit: "kWh"
            },
            capacity: {
              value: 222,
              unit: "kWh"
            },
            SOC: {
              value: 50,
              unit: "%"
            }
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api-vpp/overview/PV_power": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            xData: getXAxis(),
            yData: [getYAxis()],
            series: [
              {
                name: "发电功率",
                unit: "MW"
              }
            ]
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api-vpp/overview/battery-energy": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            xData: getXAxis(),
            yData: [getYAxis()],
            series: [
              {
                name: "电池储能",
                unit: "MWh"
              }
            ]
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api-vpp/overview/generation-energy": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            curGeneration: "1kWh",
            cumulativeGeneration: "15kWh",
            xData: getXAxis(),
            yData: [getYAxis()],
            series: [
              {
                name: "光伏",
                unit: "MWh"
              }
            ]
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api-vpp/overview/profit": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            curGeneration: "1kWh",
            totalGeneration: "15kWh",
            xData: getXAxis(),
            yData: [getYAxis()],
            series: [
              {
                name: "收益",
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
