import { mockControllWrap } from "./config";

const result = {
  results: [
    {
      ratedPower: 323,
      activity: true,
      level: 1,
      powerCategoryId: 226464,
      deviceType: "燃机",
      title: "燃机1",
      priority: 9999500158,
      deviceId: 226492,
      devTypeId: 226508,
      capacity: null,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226486,
      maintenanceStatusTitle: "检修中",
      powerCategoryTitle: "主电源",
      maintenanceStatusName: "inProgress",
      id: 226519,
    },
    {
      ratedPower: 323,
      activity: true,
      level: 2,
      powerCategoryId: 226464,
      deviceType: "燃机",
      title: "燃机3",
      priority: 9999500160,
      deviceId: 226494,
      devTypeId: 226508,
      capacity: null,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226484,
      maintenanceStatusTitle: "无",
      powerCategoryTitle: "主电源",
      maintenanceStatusName: "none",
      id: 226521,
    },
    {
      ratedPower: 323,
      activity: true,
      level: 3,
      powerCategoryId: 226464,
      deviceType: "燃机",
      title: "燃机7",
      priority: 9999500164,
      deviceId: 226498,
      devTypeId: 226508,
      capacity: null,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226484,
      maintenanceStatusTitle: "无",
      powerCategoryTitle: "主电源",
      maintenanceStatusName: "none",
      id: 226560,
    },
    {
      ratedPower: 323,
      activity: true,
      level: 4,
      powerCategoryId: 226465,
      deviceType: "燃机",
      title: "燃机6",
      priority: 9999500163,
      deviceId: 226497,
      devTypeId: 226508,
      capacity: null,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226484,
      maintenanceStatusTitle: "无",
      powerCategoryTitle: "备用电源",
      maintenanceStatusName: "none",
      id: 226559,
    },
    {
      ratedPower: 323,
      activity: true,
      level: 5,
      powerCategoryId: 226465,
      deviceType: "燃机",
      title: "燃机2",
      priority: 9999500159,
      deviceId: 226493,
      devTypeId: 226508,
      capacity: null,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226484,
      maintenanceStatusTitle: "无",
      powerCategoryTitle: "备用电源",
      maintenanceStatusName: "none",
      id: 226520,
    },
    {
      ratedPower: 323,
      activity: true,
      level: 6,
      powerCategoryId: 226464,
      deviceType: "燃机",
      title: "燃机8",
      priority: 9999500165,
      deviceId: 226499,
      devTypeId: 226508,
      capacity: null,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226484,
      maintenanceStatusTitle: "无",
      powerCategoryTitle: "主电源",
      maintenanceStatusName: "none",
      id: 226561,
    },
    {
      ratedPower: 323,
      activity: true,
      level: 7,
      powerCategoryId: 226464,
      deviceType: "燃机",
      title: "燃机5",
      priority: 9999500162,
      deviceId: 226496,
      devTypeId: 226508,
      capacity: null,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226484,
      maintenanceStatusTitle: "无",
      powerCategoryTitle: "主电源",
      maintenanceStatusName: "none",
      id: 226523,
    },
    {
      ratedPower: 323,
      activity: true,
      level: 8,
      powerCategoryId: 226465,
      deviceType: "燃机",
      title: "燃机4",
      priority: 9999500161,
      deviceId: 226495,
      devTypeId: 226508,
      capacity: null,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226484,
      maintenanceStatusTitle: "无",
      powerCategoryTitle: "备用电源",
      maintenanceStatusName: "none",
      id: 226522,
    },
    {
      ratedPower: 999999.0,
      activity: true,
      level: 9,
      powerCategoryId: 226465,
      deviceType: "储能",
      title: "1#储能单元",
      deviceId: 74,
      devTypeId: 382,
      capacity: 9999.0,
      migrogridUnitId: 226518,
      migrogridUnitTitle: "微网单元1",
      maintenanceStatusId: 226484,
      maintenanceStatusTitle: "无",
      powerCategoryTitle: "备用电源",
      maintenanceStatusName: "none",
      id: 226562,
    },
  ],
  errorCode: 0,
  errorMsg: null,
  error: false,
};

const detail = {
  results: {
    ratedPower: 323,
    activity: true,
    level: 1,
    powerCategoryId: 226464,
    deviceType: "燃机",
    title: "燃机1",
    priority: 9999500158,
    deviceId: 226492,
    devTypeId: 226508,
    capacity: null,
    migrogridUnitId: 226518,
    migrogridUnitTitle: "微网单元1",
    productionTime: "2018-11-15 18:00:00",
    maintenanceStatus: {
      id: 226486,
      name: "inProgress",
      title: "检修中",
    },
    id: 226519,
  },
  page: 1,
  size: 1,
  totalCount: 1,
  totalPages: 1,
  errorCode: 0,
  errorMsg: null,
  error: false,
};

const plan = {
  results: [
    {
      id: 45,
      powerDeviceId: 226519,
      startTimePlan: "2021-05-28 16:06:00",
      endTimePlan: "2021-05-28 16:12:00",
      desc: "66666",
      influence: 66.0,
      startTimeReal: null,
      endTimeReal: null,
    },
    {
      id: 44,
      powerDeviceId: 226519,
      startTimePlan: "2021-05-21 16:06:00",
      endTimePlan: "2021-05-21 16:12:00",
      desc: "66666",
      influence: 66.0,
      startTimeReal: "2021-05-21 16:06:00",
      endTimeReal: null,
    },
    {
      id: 41,
      powerDeviceId: 226519,
      startTimePlan: "2021-04-21 13:25:00",
      endTimePlan: "2021-04-21 13:30:00",
      desc: "333",
      influence: 33.0,
      startTimeReal: "2021-04-21 13:26:00",
      endTimeReal: "2021-04-21 13:30:00",
    },
    {
      id: 26,
      powerDeviceId: 226519,
      startTimePlan: "2021-04-20 13:49:00",
      endTimePlan: "2021-04-20 13:54:00",
      desc: "44",
      influence: 444.0,
      startTimeReal: "2021-04-20 13:49:00",
      endTimeReal: "2021-04-20 14:13:00",
    },
  ],
  errorCode: 0,
  errorMsg: null,
  error: false,
};

export default mockControllWrap(
  {
    "GET /api/power-devices": (req, res) => {
      setTimeout(() => {
        res.send(result);
      }, 1000);
    },
    "GET /api/power-devices/226519": (req, res) => {
      setTimeout(() => {
        res.send(detail);
      }, 1000);
    },
    "PUT /api/power-devices": (req, res) => {
      setTimeout(() => {
        res.send({
          errorCode: 0,
          errorMsg: null,
          error: false,
        });
      }, 1000);
    },
    "GET /api/power-devices/maintenancePlan": (req, res) => {
      setTimeout(() => {
        res.send(plan);
      }, 1000);
    },
    "POST /api/power-devices/maintenancePlan": (req, res) => {
      setTimeout(() => {
        res.send({
          errorCode: 0,
          errorMsg: null,
          error: false,
        });
      }, 1000);
    },
    "PUT /api/power-devices/maintenancePlan": (req, res) => {
      setTimeout(() => {
        res.send({
          errorCode: 0,
          errorMsg: null,
          error: false,
        });
      }, 1000);
    },
    "DELETE /api/power-devices/maintenancePlan": (req, res) => {
      setTimeout(() => {
        res.send({
          errorCode: 0,
          errorMsg: null,
          error: false,
        });
      }, 1000);
    },
    "POST /api/power-devices/maintenancePlan/start": (req, res) => {
      setTimeout(() => {
        res.send({
          errorCode: 0,
          errorMsg: null,
          error: false,
        });
      }, 1000);
    },
    "POST /api/power-devices/maintenancePlan/finish": (req, res) => {
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
