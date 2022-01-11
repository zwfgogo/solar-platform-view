import createServices from '../util/createServices'

const services = {
  getLogin: function (params) {
    return createServices<{ name: string; password: string }>(
      'post',
      '/login',
      params
    )
  },
  getVerifyCode: function () {
    return createServices(
      'get',
      '/login/verification'
    )
  },
  getUserStatus: function (params) {
    return createServices(
      'get',
      '/login/userStatus',
      params
    )
  },
  getMenus: function (params) {
    return createServices<{ name: string; password: string }>(
      'get',
      '/menu',
      params
    )
  },
  getMenusByJump: function (params) {
    return createServices<{ name: string; password: string }>(
      'get',
      '/menu/jump',
      params
    )
  },
  getTime: function (params) {
    return createServices<{ name: string; password: string }>(
      'get',
      '/settings/time',
      params
    )
  },
  revisePassword: function (params) {
    return createServices<{ name: string; password: string }>(
      'put',
      '/settings/user/password',
      params
    )
  },
  getInfo: function (params) {
    return createServices(
      'get',
      '/models/users/by-Id',
      params
    )
  },
  fetchWarningList: function (data) {
    return createServices(
      'get',
      '/settings/warning', data
    )
  },
  fetchSelfWarning: function () {
    return createServices(
      'get',
      '/settings/warning/by-user'
    )
  },
  changePassword: function (param) {
    return createServices(
      'put',
      '/settings/user/password',
      param
    )
  },
  changeUserSetting: function (param) {
    const { id, ...others } = param;
    return createServices(
      'put',
      `/settings/user/by-Id/${id}`,
      others
    )
  },
  getTableData: function (params) {
    return createServices<{
      firmId: number;
      queryStr: string;
      page: number;
      size: number;
    }>("get", "/station-monitoring/table", params);
  },
  getStations: function (params) {
    return createServices<{ userId: string; firmId: string }>(
      "get",
      "/battery-cabin/station",
      params
    );
  },
  getEnergyListByStationId: function (params) {
    return createServices<{ stationId: string }>(
      "get",
      "/battery-cabin/station/getEnergyListByStationId",
      params
    );
  },
  getScenariosMenus: function(){
    return createServices<any>(
      "get",
    "/scenarios/getScenariosMenus"
    )
  }
}

export default services
