import { mockControllWrap } from "./config";

const result = {
  results: { status: 1, title: "" },
  errorCode: 0,
  errorMsg: '',
  error: false,
};

const loginResult = {
  results: {
    user: {
      id: 4057,
      name: "admin",
      title: "超级管理员",
      email: null,
      internationalCode: "",
      phone: "",
      activity: true,
      individual: false,
      currency: "CNY",
      timeZone: "Asia/Shanghai",
      sn: 1568969762,
      firm: {
        id: 4055,
        name: "综合能源智慧运营平台",
        title: "综合能源智慧运营平台",
        abbreviation: null,
        contact: null,
        internationalCode: null,
        phone: null,
        root: true,
        activity: true,
        logoUrl: null,
        sn: -1,
        children: null,
        firmType: {
          id: 4052,
          name: "Platform",
          title: "平台",
          sn: null,
          activity: true,
          code: 3,
          type: null,
        },
        individual: false,
      },
      role: {
        id: 4054,
        name: "Admin",
        title: "Administrator",
        activity: true,
        sn: 1567059645,
      },
      resetPassword: null,
    },
    token:
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0MDU3IiwiZmlybUlkIjo0MDU1LCJyb2xlSWQiOjQwNTQsImV4cCI6MTYyMzI5NjU3OCwidXNlck5hbWUiOiJhZG1pbiIsInVzZXJJZCI6NDA1N30.lTWJrqd8cyTnL6uC0yyqZRUFEA91rYGmKIHQjpQxvxsWm97lKcJu1n8qOGBal8y6GooylsszR86FkRA5i0WDD51BeZwdbhcZ3NjK3TZpdfyR5ozWEoYLIANPTVcq1FHsKqL25B2MbpBx5gCOZeABeA21AiYBgT7yi52PKmUYL6vea8Ehe5o1yJbTsAQEqZN-ppH3bYfyxefPipYnVh2uakcBGM9c6Hi8BYDa7RGONsFmOs19hZG1qQBlTsjCTQtWsUSk--HpB1qZK4CkzfleBmai_eyXsZI0YszSbscNKzDiimqH0D0-ZAzyCm5dVqeFyh3k5PSDc3ItGjAoYV7_TQ",
    stationId: 534715,
  },
  page: 1,
  size: 1,
  totalCount: 1,
  totalPages: 1,
  errorCode: 0,
  errorMsg: '',
};

export default mockControllWrap(
  {
    "GET /api/login/userStatus": (req, res) => {
      setTimeout(() => {
        res.send(result);
      }, 300);
    },
    "POST /api/login": (req, res) => {
      setTimeout(() => {
        res.send(loginResult);
      }, 1000);
    },
  },
  [],
  // { closeControll: true }
);
