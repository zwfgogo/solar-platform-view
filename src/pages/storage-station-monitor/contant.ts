import Service from "./service";
import Cookie from "../../pages/cookie.helper";
import { isDev } from "../../core/env";
import { Terminal_Web_Url } from "../constants";
export enum BoardType {
  Map,
  Matrix,
  Table
}

/**
 * 跳转到终端系统
 * @param stationId
 */
export async function jumpToTerminalSystem(stationId: number) {
  if (!stationId) {
    return;
  }
  // const res = await Service.jumpPath({});
  const expSecond = 60 * 5;
  let domain;
  let targetUrl: string = Terminal_Web_Url;
  if (isDev()) {
    domain = 'localhost';
    targetUrl = 'http://localhost:8001';
  } else {
    // domain = '.wankeauto.com';
    domain = '.' + location.host.split('.').slice(1).join('.')
  }
  Cookie.setCookie('_userInfo', sessionStorage.getItem('userInfo'), expSecond, domain);
  Cookie.setCookie('_token', sessionStorage.getItem('token'), expSecond, domain);
  Cookie.setCookie('_stationId', String(stationId), expSecond, domain);
  if (targetUrl[targetUrl.length - 1] === '/') {
    targetUrl = targetUrl.slice(0, -1);
  }
  window.open(`${targetUrl}/uuid-login`, '_blank', 'noopener');
}
