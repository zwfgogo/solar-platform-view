import { mockControllWrap } from "./config";

export default mockControllWrap(
  {
    "GET /api/basic-data-management/twice-device/devices": (req, res) => {
      setTimeout(() => {
        res.send({
          results: [
            {
              "id": 123,
              "name": "123",//设备编号
              "title": "123",//设备名称
              "useHeartbeat":true,//启用心跳
              "notes":"xxx",//描述
              "analogsCount": 0,
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
