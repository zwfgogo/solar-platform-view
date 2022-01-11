import { mockControllWrap } from "./config";

export default mockControllWrap(
  {
    "GET /api/stations/148503/status-record": (req, res) => {
      setTimeout(() => {
        const params = req.query || {};
        res.send({
          results: {
            results: [
              {
                num: 1,
                _isDisabled: true,
                _stationId: 1,
                stationTitle: "station1",
                startTime: '2012/02/08 00:45:00',
                continueTime: '70320小时',
                userTitle: '三枼',
                stationStatus: {
                  id: 757,
                  code: 4,
                  name: "testing",
                  title: "试运行",
                  sn: 4,
                  activity: true
                }
              },
              {
                num: 2,
                _isDisabled: false,
                _stationId: 2,
                stationTitle: "station2",
                startTime: '2012/02/08 00:45:00',
                continueTime: '70320小时',
                userTitle: '三枼',
                stationStatus: {
                  id: 832,
                  code: 1,
                  name: "activate",
                  title: "已投产",
                  sn: 1,
                  activity: true
                }
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
    "GET /api/devices/check-SN": (req, res) => {
      setTimeout(() => {
        res.send({
          results: Math.random() > 0.5,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/enums/stations/status": (req, res) => {
      setTimeout(() => {
        res.send({
          results: [
            {
              id: 832,
              title: '已投产',
              next: [833, 834]
            },
            {
              id: 740,
              title: '建设中',
              next: [757]
            },
            {
              id: 833,
              title: '调试中',
              next: [832, 834]
            },
            {
              id: 757,
              title: '试运行',
              next: []
            },
            {
              id: 834,
              title: '已停运',
              next: []
            }
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
