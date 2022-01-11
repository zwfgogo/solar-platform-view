import { mockControllWrap } from "./config";

const result = {
  results: [
    {
      id: 226469,
      name: "test",
      title: "测试用负荷",
      alias: "测试",
      controlSequence: 2,
      powerRating: 999.0,
      level: 3,
      microgridUnit: null,
      controlPeriod: [
        { id: 272580, startTime: "00:00:00", endTime: "01:00:00" },
        { id: 272517, startTime: "01:00:00", endTime: "02:00:00" },
        { id: 272518, startTime: "02:00:00", endTime: "03:00:00" },
        { id: 272519, startTime: "03:00:00", endTime: "04:00:00" },
        { id: 272520, startTime: "04:00:00", endTime: "05:00:00" },
        { id: 272521, startTime: "05:00:00", endTime: "06:00:00" },
        { id: 272522, startTime: "06:00:00", endTime: "07:00:00" },
        { id: 272523, startTime: "07:00:00", endTime: "08:00:00" },
        { id: 272524, startTime: "08:00:00", endTime: "09:00:00" },
        { id: 272525, startTime: "09:00:00", endTime: "10:00:00" },
        { id: 272526, startTime: "10:00:00", endTime: "11:00:00" },
        { id: 272527, startTime: "11:00:00", endTime: "12:00:00" },
        { id: 272528, startTime: "12:00:00", endTime: "13:00:00" },
        { id: 272529, startTime: "13:00:00", endTime: "14:00:00" },
        { id: 272530, startTime: "14:00:00", endTime: "15:00:00" },
        { id: 272531, startTime: "15:00:00", endTime: "16:00:00" },
        { id: 272532, startTime: "16:00:00", endTime: "17:00:00" },
        { id: 272533, startTime: "17:00:00", endTime: "18:00:00" },
        { id: 272574, startTime: "18:00:00", endTime: "19:00:00" },
        { id: 272575, startTime: "19:00:00", endTime: "20:00:00" },
        { id: 272576, startTime: "20:00:00", endTime: "21:00:00" },
        { id: 272577, startTime: "21:00:00", endTime: "22:00:00" },
        { id: 272578, startTime: "22:00:00", endTime: "23:00:00" },
        { id: 272579, startTime: "23:00:00", endTime: "00:00:00" },
      ],
      device: {
        code: 1,
        activity: true,
        name: "开关1",
        id: 535945,
        sn: 1,
        title: "开关1",
      },
    },
  ],
  errorCode: 0,
  errorMsg: null,
  error: false,
};

const switchResult = {
  results: [
    {
      deviceType: {
        inputOutputEqual: true,
        isDefault: true,
        inputOutputReverse: null,
        name: "Breaker",
        terminalNum: 2,
        sn: 3,
        id: 20194,
        title: "开关",
      },
      activity: true,
      id: 535945,
      sn: 1621993520036,
      title: "开关1",
      type: "Breaker",
    },
  ],
  errorCode: 0,
  errorMsg: null,
  error: false,
};

export default mockControllWrap(
  {
    "GET /api/load-devices": (req, res) => {
      setTimeout(() => {
        res.send(result);
      }, 1000);
    },
    "GET /api/load-devices/switch-list": (req, res) => {
      setTimeout(() => {
        res.send(switchResult);
      }, 1000);
    },
    "POST /api/load-devices": (req, res) => {
      setTimeout(() => {
        res.send({
          errorCode: 0,
          errorMsg: null,
          error: false,
        });
      }, 1000);
    },
    "PUT /api/load-devices": (req, res) => {
      setTimeout(() => {
        res.send({
          errorCode: 0,
          errorMsg: null,
          error: false,
        });
      }, 1000);
    },
    "DELETE /api/load-devices": (req, res) => {
      setTimeout(() => {
        res.send({
          errorCode: 0,
          errorMsg: null,
          error: false,
        });
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);
