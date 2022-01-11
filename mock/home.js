import { mockControllWrap } from "./config";

export default mockControllWrap(
  {
    "GET /api/overview/baseInfo": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            station: {
               count:0
            },
            scale: {
               value:'300MW'
            },
            centralizedStation: {
               count:0,
               value:'250MW'
            },
            distributedStation: {
               count:0,
               value:'50MW'
            }
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/overview/abnormal": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            slight: 1,
            moderate: 2,
            serious: 3
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/menu": (req, res) => {
      setTimeout(() => {
        res.send({
          results: menuList,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);

const menuList = [
  {
    "id": 204837,
    "name": "首页",
    "title": "首页",
    "url": null,
    "icon": "wanke-summary",
    "key": "/index",
    "sn": 1,
    "categoryType": "OPERATOR",
    "terminalType": "WEB",
    "systemType": null,
    "children": [],
    "activity": true
  },
  {
    "id": 204008,
    "name": "监控中心",
    "title": "监控中心",
    "url": "5",
    "icon": "wanke-summary",
    "key": "/station-monitor",
    "sn": 6,
    "categoryType": "OPERATOR",
    "terminalType": "WEB",
    "systemType": null,
    "children": [
      {
        "id": 204599,
        "name": "集控中心",
        "title": "集控中心",
        "url": "5",
        "icon": "",
        "key": "/station-monitor/index",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 7
      },
      {
        "id": 204009,
        "name": "运行数据分析",
        "title": "运行数据查询",
        "url": "5",
        "icon": "",
        "key": "/station-monitor/data-analysis",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 8
      },
      {
        "id": 204010,
        "name": "电站监控",
        "title": "电站监控",
        "url": "5",
        "icon": "",
        "key": "/station-monitor/station_monitor",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 9
      },
      {
        "id": 204011,
        "name": "拓扑分析",
        "title": "拓扑分析",
        "url": "5",
        "icon": "",
        "key": "/station-monitor/topological",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 10
      },
      {
        "id": 304009,
        "name": "指标数据查询",
        "title": "指标数据查询",
        "url": "5",
        "icon": "",
        "key": "/station-monitor/indicator-analysis",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 8
      },
    ],
    "activity": true
  },
  {
    "id": 304598,
    "name": "LGC管理",
    "title": "LGC管理",
    "url": "",
    "icon": "",
    "key": "/customized-service/lgc-management",
    "terminalType": "WEB",
    "categoryType": "OPERATOR",
    "systemType": null,
    "children": [],
    "root": false,
    "activity": true,
    "sn": 17
  },
  {
    "id": 304599,
    "name": "提醒管理",
    "title": "提醒管理",
    "url": "",
    "icon": "",
    "key": "/customized-service/remind-management",
    "terminalType": "WEB",
    "categoryType": "OPERATOR",
    "systemType": null,
    "children": [],
    "root": false,
    "activity": true,
    "sn": 17
  },
  {
    "id": 99256,
    "name": "告警服务",
    "title": "告警服务",
    "url": "",
    "icon": "",
    "key": "/alert-service",
    "sn": 7,
    "categoryType": "OPERATOR",
    "terminalType": "WEB",
    "systemType": null,
    "children": [
      {
        "id": 99419,
        "name": "告警监控",
        "title": "告警监控",
        "url": "",
        "icon": "",
        "key": "/alert-service/abnormal",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 302
      },
      {
        "id": 99250,
        "name": "告警配置",
        "title": "告警配置",
        "url": "",
        "icon": "",
        "key": "/alert-service/level",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 303
      }
    ],
    "activity": true
  },
  {
    "id": 99481,
    "name": "统计报表",
    "title": "统计报表",
    "url": "5",
    "icon": "wanke-run-manage",
    "key": "/statistical-form",
    "sn": 10,
    "categoryType": "OPERATOR",
    "terminalType": "WEB",
    "systemType": null,
    "children": [
      {
        "id": 99500,
        "name": "电站报表",
        "title": "电站报表",
        "url": "5",
        "icon": "",
        "key": "/statistical-form/station-form",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 12
      },
      {
        "id": 99194,
        "name": "设备报表",
        "title": "设备报表",
        "url": "5",
        "icon": "",
        "key": "/statistical-form/device-form",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 13
      }
    ],
    "activity": true
  },
  {
    "id": 99501,
    "name": "态势感知",
    "title": "态势感知",
    "url": "5",
    "icon": "wanke-run-manage",
    "key": "/situational-awareness/forecast",
    "sn": 10,
    "categoryType": "OPERATOR",
    "terminalType": "WEB",
    "systemType": null,
    "children": [],
    "activity": true
  },
  {
    "id": 204826,
    "name": "运维值班",
    "title": "运维值班",
    "url": null,
    "icon": "wanke-optimize-task",
    "key": "/operation-maintenance",
    "sn": 11,
    "categoryType": "OPERATOR",
    "terminalType": "WEB",
    "systemType": null,
    "children": [
      {
        "id": 204828,
        "name": "运维派单",
        "title": "运维派单",
        "url": null,
        "icon": "",
        "key": "/operation-maintenance/dispatch",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 12
      },
      {
        "id": 204701,
        "name": "工单处理",
        "title": "工单处理",
        "url": null,
        "icon": "",
        "key": "/operation-maintenance/work-order",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 13
      },
      {
        "id": 204835,
        "name": "值班工作台",
        "title": "值班工作台",
        "url": null,
        "icon": "",
        "key": "/operation-maintenance/duty",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 15
      },
      {
        "id": 204829,
        "name": "缺陷记录",
        "title": "缺陷记录",
        "url": null,
        "icon": "",
        "key": "/operation-maintenance/defect",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 16
      }
    ],
    "activity": true
  },
  {
    "id": 204693,
    "name": "基础数据管理",
    "title": "基础数据管理",
    "url": null,
    "icon": "wanke-run-manage",
    "key": "/basic-data",
    "sn": 25,
    "categoryType": "OPERATOR",
    "terminalType": "WEB",
    "systemType": null,
    "children": [
      {
        "id": 204836,
        "name": "客户管理",
        "title": "客户管理",
        "url": null,
        "icon": "",
        "key": "/basic-data/customer",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 26
      },
      {
        "id": 204694,
        "name": "设备台账",
        "title": "设备台账",
        "url": null,
        "icon": "",
        "key": "/basic-data/equipment-ledger",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 27
      },
      {
        "id": 204695,
        "name": "电价库",
        "title": "电价库",
        "url": null,
        "icon": "",
        "key": "/basic-data/electricity-price",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 28
      },
      {
        "id": 204696,
        "name": "用户权限管理",
        "title": "用户权限管理",
        "url": null,
        "icon": "",
        "key": "/basic-data/user-authority",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 29
      },
      {
        "id": 204698,
        "name": "角色权限管理",
        "title": "角色权限管理",
        "url": null,
        "icon": "",
        "key": "/basic-data/role-authority",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 30
      },
      {
        "id": 204842,
        "name": "物联控制管理",
        "title": "物联控制管理",
        "url": null,
        "icon": "",
        "key": "/basic-data/iot-controller",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 199
      },
      {
        "id": 204855,
        "name": "业务模型配置",
        "title": "业务模型配置",
        "url": "5",
        "icon": "",
        "key": "/basic-data/modelConfig",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 200
      },
      {
        "id": 204861,
        "name": "数据模拟",
        "title": "数据模拟",
        "url": "",
        "icon": "",
        "key": "/basic-data/data-mock",
        "terminalType": "WEB",
        "categoryType": "OPERATOR",
        "children": [],
        "root": false,
        "activity": true,
        "sn": 201
      }
    ],
    "activity": true
  }
];
