import { mockControllWrap } from "./config";

export default mockControllWrap(
  {
    "GET /api/overhaul-maintenance/duty-management/qr-code": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            img: "https://fakeimg.pl/400x400/",
            uniqueId: '1',
            recordId: 65
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/overhaul-maintenance/duty-management/shift-result": (req, res) => {
      setTimeout(() => {
        res.send({
          results: {
            action: Math.random() > 0.6 ? (Math.random() > 0.1 ? 1: 0) : -1,
            userId: 142911,
          },
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "POST /api//overhaul-maintenance/duty-management/1": (req, res) => {
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
