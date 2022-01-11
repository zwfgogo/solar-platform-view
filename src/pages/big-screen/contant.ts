import Cookie from "../../pages/cookie.helper";
import { isDev } from "../../core/env";

/**
 * 跳转其他系统
 */
export  function jumpToOtherSystem(url, stationId: number) {
  if (!stationId) {
    return;
  }
  const expSecond = 60 * 5;
  let domain;

  if (isDev()) {
    domain = 'localhost';
    // targetUrl = 'http://localhost:8001';
  } else {
    // domain = '.wankeauto.com';
    domain = '.' + location.host.split('.').slice(1).join('.')
    if (domain.indexOf(':') > -1) {
      domain = domain.split(':')[0]
    }
  }
  Cookie.setCookie('_userInfo', sessionStorage.getItem('userInfo'), expSecond, domain);
  Cookie.setCookie('_token', sessionStorage.getItem('token'), expSecond, domain);
  Cookie.setCookie('_stationId', String(stationId), expSecond, domain);
  window.open(url, '_blank', 'noopener');
}
