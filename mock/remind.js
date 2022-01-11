import { mockControllWrap } from "./config";

export default mockControllWrap(
  {
    "GET /api/remind-management/users": (req, res) => {
      setTimeout(() => {
        res.send({
          results: userList,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/remind-management/remind-settings": (req, res) => {
      setTimeout(() => {
        res.send({
          results: remindSettings,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "POST /api/remind-management/remind-settings": (req, res) => {
      setTimeout(() => {
        res.send({
          results: null,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "PUT /api/remind-management/remind-settings": (req, res) => {
      setTimeout(() => {
        res.send({
          results: null,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "DELETE /api/remind-management/remind-settings/1": (req, res) => {
      setTimeout(() => {
        res.send({
          results: null,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "GET /api/remind-management/remind-info": (req, res) => {
      setTimeout(() => {
        res.send({
          results: remindInfo,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "POST /api/remind-management/remind-info": (req, res) => {
      setTimeout(() => {
        res.send({
          results: null,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "PUT /api/remind-management/remind-info": (req, res) => {
      setTimeout(() => {
        res.send({
          results: null,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
    "DELETE /api/remind-management/remind-info/1": (req, res) => {
      setTimeout(() => {
        res.send({
          results: null,
          errorCode: 0,
          errorMsg: ""
        });
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);

const userList = []
for (let i = 1; i < 10; i++) {
  userList.push({
    id: i,
    title: '用户' + i,
    phone: '12222222222',
    email: 'xxxx'
  })
}

const enableSettings = [{
  id: 1,
  title: 'title',
  type: 'EXPIRE_CONTRACT',
}, {
  id: 2,
  title: 'title',
  type: 'EXPIRE_CONTRACT',
}, {
  id: 3,
  title: 'title',
  type: 'REPORTERS',
}]

const remindSettings = []
for (let i = 1; i < 10; i++) {
  remindSettings.push({
    id: i,
    phone: '15910000000',
    email: '',
    pushChannel: 'EMAIL,APP,PHONE',
    language: 'CHINESE',
    bindUser: {
      id: i,
      phone: '15522222222',
      email: '123@qq.com',
      title: 'title',
      name: 'name',
    },
    enableSettings: enableSettings
  })
}

const remindInfo = [
  {
    "id":1,
    "name": 123,
    "title": "合同提醒",
    "type": "EXPIRE_CONTRACT",
    "breakerStatus": true,
    "startTime": "2020-10-09",
    "endTime": "2020-10-20",
    "advanceTimeCycle": "DAY",
    "sn": 0
  },
  {
    "id":1,
    "name": 124,
    "title": "合同提醒2",
    "type": "EXPIRE_CONTRACT",
    "breakerStatus": true,
    "startTime": "2020-10-09",
    "endTime": "2020-12-25",
    "advanceTimeCycle": "MONTH",
    "sn": 0
  },
  {
    "id":1,
    "name": 125,
    "title": "合同提醒3",
    "type": "EXPIRE_CONTRACT",
    "breakerStatus": true,
    "startTime": "2020-10-09",
    "endTime": "2021-10-20",
    "advanceTimeCycle": "DAY",
    "sn": 0
  },
  {
    "id":1,
    "name": 125,
    "title": "电价提醒",
    "type": "ELECTRICITY",
    "breakerStatus": true,
    "upLimit": 1.0,
    "downLimit": 2.0,
    "timeRange": "00:00-10:00,12:00-24:00",
    "sn": 1
  },
  {
    "id":1,
    "name": 126,
    "title": "报表提醒",
    "type": "REPORTERS",
    "breakerStatus": true,
    "timeCycle": "DAY,MONTH",
    "pushTime": "00:00",
    "sn": 2
  }
]
