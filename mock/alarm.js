import { mockControllWrap } from "./config";

export default mockControllWrap(
  {
    "GET /api/alarm-service/alarm-monitor/point-tree": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            treeList: [{
              "id": 1,
              "title":"设备1",//设备名称
              "measurePoints":[//测量点
                {
                  "id": 11,
                  "name":"xxx",
                  "title":"输出端",
                  "analogs":[
                      {
                        "id": 111,
                        "title": "温度",// 点号名称
                        "typeTitle": "温度",// 数据项名称
                        "pointNumber": "12312",//点号
                        "unit": "℃",
                      }
                  ]
                }
              ]
            }],
            relatedTreeList: [{
              "id": 2,
              "title":"设备2",//设备名称
              "measurePoints":[//测量点
                {
                  "id": 22,
                  "name":"xxx",
                  "title":"输出端",
                  "analogs":[
                      {
                          "id": 222,
                          "title":"温度",//点号名称
                          "typeTitle":"温度",//数据项名称
                          "pointNumber":"12312",//点号
                          "unit": "℃",
                        }
                  ]
                }
              ]
            }],
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
