import React, { useEffect } from 'react';
import { history } from 'umi';
import Cookie from '../cookie.helper';

const UuidLogin = (props) => {
  useEffect(() => {
    const userInfoStr = Cookie.getCookie('_userInfo');
    const token = Cookie.getCookie('_token');
    const stationId = Cookie.getCookie('_stationId');
    const jumpUrl = Cookie.getCookie('_jumpUrl') || '/index';
    Cookie.delCookie('_jumpUrl')
    try {
      if (!userInfoStr || !token) {
        throw (new Error());
      }
      const userInfo = JSON.parse(userInfoStr);
      sessionStorage.setItem('userInfo', userInfoStr)
      sessionStorage.setItem('station-id', stationId)
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('firm-id', userInfo.firm.id)
      sessionStorage.setItem('user-id', userInfo.id)
      sessionStorage.setItem('referer', 'platform')
      sessionStorage.setItem('timeZone', userInfo.timeZone || 'Asia/Shanghai')
      history.push(jumpUrl);
    } catch (error) {
      // history.push('/');
    }
  });

  return (
    <div></div>
  );
};

export default UuidLogin;