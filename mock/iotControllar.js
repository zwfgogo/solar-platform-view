import { mockControllWrap } from "./config";

function getTableList(params) {
  const list = [];
  const length = Math.floor(Math.random() * 20)
  for(let i = 0; i < length; i++) {
    list.push({
      num: i,
      id: Number(params.page) * 10 + 1,
      title: "name1",
      model: "wanke7000",
      name: "W097364786",
      configFile: "flkjelwafkljewklfjwel.xml",
      configTime: "2019-12-20 17:38:09",
      project: "工程名字",
      isNormal: true
    });
  }
  return list;
}

export default mockControllWrap(
  {
    "GET /api/basic-data-management/lot-control-management/station": (req, res) => {
      setTimeout(() => {
        const params = req.query || {};
        res.send({
          results: {
            results: [
              {
                num: 1,
                id: 1,
                title: "station1",
                stationType: {
                  id: 1,
                  title: '电站类型'
                },
                scale: '100kW/200kWh',
                linkControllers: [{
                  id: 1,
                  title: '关联控制器1'
                }]
              },
              {
                num: 2,
                id: 1,
                title: "station2",
                stationType: {
                  id: 1,
                  title: '电站类型'
                },
                scale: '100kW/200kWh',
                linkControllers: [{
                  id: 2,
                  title: '关联控制器2'
                },{
                  id: 3,
                  title: 'testidnfeiowfnwefwefwjefwe1'
                }]
              }
            ],
            page: Number(params.page),
            size: Number(params.size),
            totalPage: 1,
            totalCount: 100
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/micro-controllers": (req, res) => {
      setTimeout(() => {
        const params = req.query || {};
        res.send({
          results: {
            results: getTableList(params),
            page: Number(params.page),
            size: Number(params.size),
            totalPage: 1,
            totalCount: 100
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/stations/1/controllers": (req, res) => {
      setTimeout(() => {
        const params = req.query || {};
        res.send({
          results: {
            results: [
              {
                num: 1,
                id: 1,
                title: "name1",
                model: "wanke7000",
                name: "W097364786",
                configFile: "flkjelwafkljewklfjwel.xml",
                configTime: "2019-12-20 17:38:09",
                project: "工程名字",
                isNormal: true
              },
              {
                num: 2,
                id: 1,
                title: "testidnfeiowfnwefwefwjefwe1",
                model: "wanke7001",
                name: "W097364786",
                configFile: "flkjelwjwel.xml",
                configTime: "2019-12-20 17:38:09",
                project: "工程名字",
                isNormal: false
              }
            ],
            page: Number(params.page),
            size: Number(params.size),
            totalPage: 1,
            totalCount: 100
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/micro-controllers/1/device-record": (req, res) => {
      setTimeout(() => {
        const params = req.query || {};
        res.send({
          results: {
            results: [
              {
                num: 1,
                id: `${Number(params.page)}1`,
                name: "多功能电表1",
                model: "123333",
                protocolType: "协议",
                state: '状态',
                stateTime: "2019-12-20 17:10:10",
                configTime: "2019-12-20 17:00:00",
                explain: {
                  name: 'DelDevice',
                  title: '删除的设备'
                },
                isUpdate: true
              },
              {
                num: 2,
                id: `${Number(params.page)}2`,
                name: "testidnfeiowfnwefwefwjefwe1",
                model: "123334",
                protocolType: "协议",
                state: '状态',
                stateTime: "2019-12-20 17:00:00",
                configTime: "2019-12-20 17:00:00",
                explain: {
                  name: 'NewDevice',
                  title: '新增的设备'
                },
                isUpdate: true
              },
              {
                num: 3,
                id: `${Number(params.page)}3`,
                name: "多功能电表1",
                model: "123333",
                protocolType: "协议",
                state: '状态',
                stateTime: "2019-12-20 17:00:00",
                configTime: "2019-12-20 17:00:00",
                explain: {
                  name: 'DelDevice',
                  title: '删除的设备'
                },
                isUpdate: true,
                controlReplace: { name: 'Replaced', title: '已更换' }
              },
              {
                num: 4,
                id: `${Number(params.page)}4`,
                name: "多功能电表2",
                model: "123334",
                protocolType: "协议",
                state: '状态',
                stateTime: "2019-12-20 17:00:00",
                configTime: "2019-12-20 17:00:00",
                explain: {
                  name: 'NewDevice',
                  title: '新增的设备'
                },
                isUpdate: false,
                controlReplace: { name: 'New', title: '新装设备' },
              }
            ],
            page: Number(params.page),
            size: Number(params.size),
            totalPage: 1,
            totalCount: 100
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/enums/devices/collect-device": (req, res) => {
      setTimeout(() => {
        const params = req.query || {};
        res.send({
          results: {
            originDevice: [
              { name: "original1", value: "o_1" },
              { name: "original2", value: "o_2" },
              { name: "original3", value: "o_3" }
            ],
            changeDevice: [
              { name: "replace1", value: "r_1" },
              { name: "replace2", value: "r_2" },
              { name: "replace3", value: "r_3" }
            ]
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/basic-data-management/lot-control-management/device-change-records": (req, res) => {
      setTimeout(() => {
        const params = req.query || {};
        res.send({
          results: {
            results: [
              {
                num: 1,
                id: 1,
                oldDevice: {
                  id: "123",
                  title: '标题1',
                },
                newDevice: {
                  id: "124",
                  title: '标题2'
                },
                replaceTime: '2019-12-20 17:00:00',
                configTime: "2019-12-20 17:00:00",
                OldPositive: 100,
                NewPositive: 200,
                OldNegative: 100,
                NewNegative: 200,
                isUpdate: true
              },
              {
                num: 2,
                id: 2,
                oldDevice: {
                  id: "o_2",
                  title: '标题1',
                },
                newDevice: {
                  id: "r_2",
                  title: '标题2'
                },
                replaceTime: '2019-12-20 17:00:00',
                configTime: "2019-12-20 17:00:00",
                isUpdate: false
              }
            ],
            page: Number(params.page),
            size: Number(params.size),
            totalPage: 1,
            totalCount: 100
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "PUT /api/stations/1/bind-controllers": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {},
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "POST /api/micro-controllers": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {},
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "POST /api/basic-data-management/lot-control-management/device-change-records": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {},
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "PUT /api/basic-data-management/lot-control-management/device-change-records": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {},
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/basic-data-management/lot-control-management/device-change-records/by-device-record": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            id: 1,
            oldDevice: {
              id: "155",
              title: '标题1'
            },
            newDevice: {
              id: "156",
              title: '标题2'
            },
            replaceTime: '2019-12-20 17:00:00',
            oldPositive: 100,
            newPositive: 200,
            oldNegative: 100,
            newNegative: 200
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "PUT /api/micro-controllers/1/device-record": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);
