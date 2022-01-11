/**
 * Created by zhuweifeng on 2019/11/1.
 */
import { mockControllWrap } from "./config";

const list = [
  {
    id: 16990,
    name: "C01",
    title: "C01",
    enable: null,
    remoteControl: null,
    controlModes: [
      {
        id: 1,
        name: "DispatchMode",
        title: "调度模式",
      },
      {
        id: 2,
        name: "LocalMode",
        title: "就地模式",
      },
      {
        id: 3,
        name: "RemoteMode",
        title: "远程模式",
      },
      {
        id: 4,
        name: "ManualMode",
        title: "手动模式",
      },
    ],
    applicableEnergyUnits: "asd",
    strategyStatus: "started",
  },
  {
    id: 16991,
    name: "C05",
    title: "C05",
    enable: null,
    remoteControl: null,
    controlModes: [
      {
        id: 1,
        name: "DispatchMode",
        title: "调度模式",
      },
      {
        id: 2,
        name: "LocalMode",
        title: "就地模式",
      },
    ],
    applicableEnergyUnits: "asd",
    strategyStatus: "stopped",
  },
  {
    id: 16992,
    name: "C06",
    title: "C06",
    enable: null,
    remoteControl: null,
    controlModes: [
      {
        id: 1,
        name: "DispatchMode",
        title: "调度模式",
      },
      {
        id: 3,
        name: "RemoteMode",
        title: "远程模式",
      },
    ],
    applicableEnergyUnits: "asd",
    strategyStatus: "stopped",
  },
  {
    id: 16993,
    name: "C07",
    title: "C07",
    enable: null,
    remoteControl: null,
    controlModes: [
      {
        id: 3,
        name: "RemoteMode",
        title: "远程模式",
      },
    ],
    applicableEnergyUnits: "asd",
    strategyStatus: "wait",
  },
  {
    id: 16994,
    name: "C19",
    title: "C19",
    enable: null,
    remoteControl: null,
    controlModes: [
      {
        id: 1,
        name: "DispatchMode",
        title: "调度模式",
      },
    ],
    applicableEnergyUnits: "asd",
    strategyStatus: "executing",
  },
];

const logList = [
  {
    id: 22, //ID
    stationId: 123,
    dtime: "2021-06-30 00:00:00", //时间
    controlMode: "就地模式", //控制模式
    content: "内容内容内容内容内容", //内容
  },
];

const c07list = [
  {
    id: 123,
    startTime: "2021-06-01",
    endTime: "2021-07-01",
    targetVoltage: 1.0,
    deviationRange: [-7, 10],
    maxReactivePowerOutput: 100.0,
    maxReactivePowerInput: 200.0,
    type: "Automatic",
  },
  {
    id: 124,
    startTime: "2021-06-01",
    endTime: "2021-07-01",
    targetVoltage: 1.0,
    deviationRange: [-7, 10],
    maxReactivePowerOutput: 100.0,
    maxReactivePowerInput: 200.0,
    type: "Manual",
    details: [
      //控制指令，手动控制才会有
      {
        id: 2,
        dtime: "2021-07-01",
        reactivePower: 100.0,
      },
    ],
  },
];

const c07Current = {
  id: 124,
  startTime: "2021-06-01",
  endTime: "2021-07-01",
  targetVoltage: 1.0,
  deviationRange: [-7, 10],
  maxReactivePowerOutput: 100.0,
  maxReactivePowerInput: 200.0,
  type: "Manual",
  details: [
    //控制指令，手动控制才会有
    {
      id: 2,
      dtime: "2021-07-01",
      reactivePower: 100.0,
    },
  ],
};

const c19Current = [
  {
    id: 123,
    energyUnitId: 628234,
    energyUnitTitle: "1#集装箱",
    type: "ActiveMode",
    value: 1.0,
    enable: true,
  },
  {
    id: 124,
    energyUnitId: 628234,
    energyUnitTitle: "1#集装箱",
    type: "ActiveMode",
    value: 1.0,
    enable: false,
  },
];

const local = [
  {
    details: [
      {
        controlMode: { name: "Power", title: "功率", id: 450172 },
        temporary: false,
        energyUnitId: 628234,
        endControlParam: { name: "Nothing", title: "无", id: 450154 },
        controlCommand: { name: "Charge", title: "充电", id: 450150 },
        startTime: "00:00",
        endTime: "00:00",
        activePower: 33,
      },
    ],
    startTime: "2021-07-15 15:30:00",
    applicableDate: [["07-01", "07-31"]],
    sn: 1626253760311,
    title: "111",
    applicableDateType: "NaturalDay",
    applicableDates: '[["07-01","07-31"]]',
  },
];

export default mockControllWrap(
  {
    "GET /api/run-strategy/strategy-list": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            list: list,
            totalCount: 5,
          },
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "GET /api/run-strategy/getLocalArgument": (req, res) => {
      setTimeout(() => {
        res.send({
          results: local,
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "GET /api/run-strategy/strategy-log-list": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            list: logList,
            totalCount: 30,
          },
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "GET /api/run-strategy/today-control-command": (req, res) => {
      setTimeout(() => {
        res.send({
          results: c07list,
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "GET /api/run-strategy/current-control-command": (req, res) => {
      setTimeout(() => {
        res.send({
          results: c19Current,
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "GET /api/run-strategy/plan-control-command": (req, res) => {
      setTimeout(() => {
        res.send({
          results: c19Current,
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "POST /api/run-strategy/plan-control-command": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {},
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "GET /api/run-strategy/local-control-command": (req, res) => {
      setTimeout(() => {
        res.send({
          results: c07Current,
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "GET /api/run-strategy/currentControlArgumentList": (req, res) => {
      setTimeout(() => {
        res.send({
          results: [
            {
              id: 585007,
              title: "每日两次充放电循环",
              status: 1,
              applicableDateType: "WorkDay",
              applicableDate: [["04-27", "12-31"]],
              details: null,
              sn: 1619423906381,
            },
          ],
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
    "GET /api/run-strategy/energyUnits": (req, res) => {
      setTimeout(() => {
        res.send({
          results: [
            { value: 628234, name: "1#集装箱", scale: 2334 },
            { value: 708420, name: "储能单元2", scale: 222 },
          ],
          errorCode: 0,
          errorMsg: null,
        });
      }, 1000);
    },
  },
  [],
  //  { closeControll: true }
);
