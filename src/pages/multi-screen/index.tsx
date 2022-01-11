import React, { useState, useCallback, useEffect } from 'react'
import { dataMap, weekMap } from './dataCfg'
import classNames from 'classnames'
import moment from 'moment'
import Cookie from "../../pages/cookie.helper";
import { isDev } from "../../core/env";
import { connect, Dispatch } from 'dva'
import { history } from 'umi'
import _ from 'lodash'
import icon from '../../static/img/zn.svg'
import "./index.less"

let win1 = null;
let win2 = null;
let win3 = null;

interface Props extends Dispatch {
}

const index: React.FC<Props> = (props: Props) => {

  // console.log('station', props.global.stationList)

  const [checkedIndex, setCheckedIndex] = useState(0)
  const [nowDate, setNowDate] = useState(moment())

  useEffect(() => {
    const i = setInterval(() => {
      setNowDate(moment())
    }, 1000)



    const userInfo = sessionStorage.getItem('userInfo')
    // if (!userInfo) history.push('/')

    props.dispatch({ type: "global/fetchStationList" })

    return () => {
      if (i) clearInterval(i)
    }
  }, []);

  useEffect(() => {
    if (props.global.stationList && props.global.stationList.length === 1 && props.global.stationList[0].code === 1111) {
      const $favicon = document.querySelector('link[rel="icon"]');
      if ($favicon !== null) {
        $favicon.href = icon;
      } else {
        $favicon = document.createElement("link");
        $favicon.rel = "icon";
        $favicon.href = icon;
        document.head.appendChild($favicon);
      }
    }
  }, [props.global.stationList])

  const clickScreenProjection = useCallback(
    (index) => {
      var left = 50000;
      var top = 50000;
      var width = 1;
      var height = 1;
      left += window.screenX;
      const { baseUrl, url } = dataMap[checkedIndex]
      const stationId = sessionStorage.getItem('station-id')
      if (!stationId) {
        return;
      }
      const expSecond = 60 * 5;
      let domain;

      if (isDev()) {
        domain = '.wanketest.com';
      } else {
        domain = '.' + location.host.split('.').slice(1).join('.')
        if (domain.indexOf(':') > -1) {
          domain = domain.split(':')[0]
        }
      }
      Cookie.setCookie('_userInfo', sessionStorage.getItem('userInfo'), expSecond, domain);
      Cookie.setCookie('_token', sessionStorage.getItem('token'), expSecond, domain);
      Cookie.setCookie('_stationId', String(stationId), expSecond, domain);
      Cookie.setCookie('_jumpUrl', url, expSecond, domain);

      let jumpUrl = `${baseUrl}/uuid-login`
      // 'resizable=1, scrollbars=1, fullscreen=0, height=200, width=650, screenX=0 , left=1280, toolbar=0, menubar=0, status=1'
      if (index === 0) {
        jumpUrl += '?screen=1'
        if (!win1 || win1.closed) {
          win1 = window.open(jumpUrl, '', 'width=' + width + ',height=' + height + ',top=' + top + '  , left=' + left + ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
          // win1.moveTo(width, 0)
        } else {
          win1.location = jumpUrl;
          win1.focus();
        }
      } else if (index === 1) {
        jumpUrl += '?screen=2'
        if (!win2 || win2.closed) {
          win2 = window.open(jumpUrl, '', 'width=' + width + ',height=' + height + ',top=' + top + '  , left=' + left + ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
          // win2.moveTo(width, 0)
        } else {
          win2.location = jumpUrl;
          win2.focus();
        }
      } else {
        jumpUrl += '?screen=3'
        if (!win3 || win3.closed) {
          win3 = window.open(jumpUrl, '', 'width=' + width + ',height=' + height + ',top=' + top + '  , left=' + left + ',toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
          // win3.moveTo(width, 0)
        } else {
          win3.location = jumpUrl;
          win3.focus();
        }
      }
      return index
    },
    [checkedIndex],
  )

  return (
    <div className="multi-screen-box">
      <div className="multi-screen-time">
        <span>{nowDate.format('YYYY/MM/DD')}</span>
        <span>{nowDate.format('HH:mm:ss')}</span>
        <span>星期{weekMap[nowDate.format('d')]}</span>
      </div>
      <div className="multi-screen-body">
        <div className="screen-img" style={{ backgroundImage: `url(${dataMap[checkedIndex].img})`, backgroundSize: "100% 100%" }}></div>
        <div className="multi-screen-projection">
          {
            new Array(3).fill(0).map((item, index) => (<div onClick={() => { clickScreenProjection(index) }}>投送至屏幕0{index + 1}</div>))
          }
        </div>
      </div>
      <div className="multi-screen-footer">
        {
          dataMap.map((item, index) => {
            const { title, baseUrl, url, img, ...style } = item
            const isNow = checkedIndex === index
            return (
              <div className={classNames("multi-screen-menu", { "multi-screen-menu-checked": isNow })} onClick={() => setCheckedIndex(index)} style={style}>
                <div className="multi-screen-menu-status">{isNow ? '查看中' : '查看'}</div>
                <div className="multi-screen-menu-icon"></div>
                <div className="multi-screen-menu-title">{title}</div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default connect(state => ({ ...state }))(index)
