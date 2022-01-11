import React, { useEffect, useRef } from 'react'
import zhCN from 'wanke-gui/es/locale/zh_CN'
import enUS from 'wanke-gui/es/locale/en_US'
import Menus from './Menu'
import Crumbs from './Crumbs'
import { makeConnect } from '../pages/umi.helper'
import { globalNS, workspace_list, settingNS, battery_cabin, Terminal_SocketUrl } from '../pages/constants'
import SystemInfo from './SystemInfo'
import MakeConnectProps from '../interfaces/MakeConnectProps'
import { GlobalState } from '../models/global'
import MustChangePasswordPage from './MustChangePasswordPage'
import { SmileOutlined, WankeMenuFoldOutlined, WankeMenuUnfoldOutlined } from 'wanke-icon'
import StationList from '../components/StationList'
import { message, notification, Button, Select } from 'wanke-gui'
import WKConfigProvider from 'wanke-gui/es/config-provider'
import lightTheme from 'wanke-gui/es/theme/light'
import darkTheme from 'wanke-gui/es/theme/dark'
import { Switch, ConfigProvider } from 'antd'
import icon from '../static/img/zn.svg'
import enIcon from '../static/img/favicon.ico'
import zhIcon from '../static/img/icon.png'
import styles from './index.less'

import { history } from 'umi'
import videojs from 'video.js'
import moment from 'moment'
import zhCNMoment from '../public/locale/zh_CN_moment.json'
import enUSMoment from '../public/locale/en_US_moment.json'
import gdata from '../public/js/gdata'
import utils from '../public/js/utils'
import { isPvSystem, isTerminalSystem, isZh, isStorageSystem, getSystemName, isBatterySystem, isMicrogrid, isDev, getSystemTheme, setSystemTheme } from '../core/env'
import SocketHelper from '../pages/socket.helper'
import { dispatch } from 'd3'
import useAlarmNotification from '../hooks/useAlarmNotification'
import { getImageUrl } from '../pages/page.helper'
import { triggerEvent } from '../util/utils'
import ErrorBoundary from '../components/ErrorBoundary'

lightTheme['axisColor'] = '#C0C2C5'
lightTheme['subAxisColor'] = '#e6e6e6'
lightTheme['axisTextColor'] = '#92929d'
lightTheme['barTitleColor'] = '#000'
lightTheme['seriesLabelColor'] = '#333'
lightTheme['splitLineColor'] = '#f1f1f5'
lightTheme['tooltipBg'] = '#ffffff'
lightTheme['tooltipTextColor'] = '#333333'
lightTheme['tooltipBoxShadow'] = '0 4px 20px 0 rgba(5,10,25,0.10)'
lightTheme['emptyImg'] = require('../static/img/no-data-chart-light.svg')
lightTheme['pageIconColor'] = '#2f4554'
lightTheme['pageIconInactiveColor'] = '#aaa'

darkTheme['axisColor'] = 'rgba(255,255,255,0.25)'
darkTheme['subAxisColor'] = '#272727'
darkTheme['axisTextColor'] = '#92929d'
darkTheme['barTitleColor'] = '#fff'
darkTheme['seriesLabelColor'] = '#fff'
darkTheme['splitLineColor'] = '#2a2b2d'
darkTheme['tooltipBg'] = 'rgba(0, 0, 0, 0.5)'
darkTheme['tooltipTextColor'] = '#ffffff'
darkTheme['tooltipBoxShadow'] = '0 4px 20px 0 rgba(0, 0, 0, 0.5)'
darkTheme['emptyImg'] = require('../static/img/no-data-chart-dark.svg')
darkTheme['pageIconColor'] = '#aaa'
darkTheme['pageIconInactiveColor'] = '#2f4554'

const lightEmptyImg = require('../static/img/no-data-table-light.svg')
const darkEmptyImg = require('../static/img/no-data-table-dark.svg')

moment.updateLocale('en', enUSMoment)
moment.updateLocale('zh-cn', zhCNMoment)
if (isZh()) {
  moment.locale('zh-cn')
} else {
  moment.locale('en')
}

const terminalSocket = new SocketHelper(globalNS, Terminal_SocketUrl, '/overview');


interface Props extends MakeConnectProps<GlobalState>,
  Pick<GlobalState, 'time' | 'collapsed' | 'menu' | 'userId' | 'firmType' | 'roleName' | 'mustChangePassword'
  | 'oldPassword' | 'newPassword' | 'newPassword1' | 'showName' | 'activeNode' | 'mapStationList' | 'stations' | 'stationId' | 'energyList'
  | 'eventAlarm'> {
  pageId: number
  mapStationLoading: boolean
  defualtStyle: any,
  theme: string,
  stationTitle: string,
  eventAlarm: any[],
  stationList: any[],
  selectedStationId: number,
  stationDetail: any,
  scenariosMenus: any
  firm: any
  crumbs: any[]
}

export function hasPos(point) {
  return point && point.coordinate &&
    (point.coordinate[0] || point.coordinate[0] === 0) &&
    (point.coordinate[1] || point.coordinate[1] === 0)
}

// 将菜单数据的最底层数据的id拿出来
export function menusToIdArray(menus = []) {
  let mIds = [];
  menus.forEach(menu => {
    const { children, id } = menu
    if (children && children.length) {
      mIds = [...mIds, ...menusToIdArray(children)]
    } else {
      mIds.push(id)
    }
  })
  return mIds
}

// 将菜单数据转成与电站挂钩的枚举数据
export function menusToStationMap(menus, menuMap, stationList = []) {
  const mIds = menusToIdArray(menus)
  if (menuMap && JSON.stringify(menuMap) !== '{}') {
    return mIds.reduce((pre, id) => ({
      ...pre,
      [id]: isMicrogrid() ? stationList : (
        stationList.filter(station => Object.keys(menuMap).filter(key => menuMap[key].find(m => m.id === id)).indexOf(`${station.id}`) > -1)
      )
    }), {})
  } else {
    return mIds.reduce((pre, id) => ({ ...pre, [id]: isMicrogrid() ? stationList : [] }), {})
  }
}

const Platform21App: React.FC<Props> = function (this: null, props) {
  let theme = getSystemTheme()
  let lastDayTempRef = useRef<string>(moment().format('YYYY-MM-DD'))
  useAlarmNotification({ eventAlarm: props.eventAlarm, disabled: props.mustChangePassword })

  let today = moment().format('YYYY-MM-DD')

  // 第二天刷新页面
  useEffect(() => {
    if (lastDayTempRef.current !== today) {
      window.location.reload()
    }
  }, [today])

  // useEffect(() => {
  //   console.log(23)
  //   props.action('$getInfo', { dispatch: props.dispatch })
  //   props.action('fetchImagePrefix')
  //   if (!isBatterySystem()) {
  //     // props.action('getMapStationList')
  //   }
  //   else {
  //     props.dispatch({ type: 'global/getStations' })
  //   }

  //   props.action('updateToView', { theme: theme || 'light-theme' })
  //   if (isTerminalSystem()) {
  //     props.action('init', { dispatch: props.dispatch })
  //   }
  //   props.action('fetchStationList')

  //   if (isPvSystem() || isStorageSystem() || isMicrogrid()) { // 光伏和储能 微电网
  //     props.action('getScenariosMenus')
  //   }

  //   return () => {
  //     props.updateState({
  //       eventAlarm: [],
  //       collapsed: false,
  //       stationList: []
  //     })
  //     // 关闭值班工作台扫码轮询
  //     props.dispatch({ type: `${workspace_list}/endLoop`, payload: { userId: null } })
  //   }
  // }, [])

  // useEffect(() => {
  //   if (props.mustChangePassword) {
  //     document.body.className = 'light-theme'
  //   } else {
  //     theme = (theme == 'light' || theme == 'light-theme') ? 'light-theme' : 'dark-theme'
  //     document.body.className = theme
  //   }
  //   document.body.className += isZh() ? ' zh' : ' en'
  // }, [props.mustChangePassword])

  // useEffect(() => {
  //   // const title = document.getElementsByTagName('title')[0]
  //   // console.log(props.stationTitle, title)
  //   if (props.stationTitle) {
  //     document.title = props.stationTitle;
  //     // return () => {
  //     //   title.innerHTML = '万克储能平台';
  //     // }
  //   }
  // }, [props.stationTitle])

  const changeCollapsed = () => {
    props.updateState({
      collapsed: !collapsed
    })
    if (!collapsed) {
      props.updateState({
        openKeys: []
      })
    }
    setTimeout(() => {
      let myEvent = new Event('resize')
      window.dispatchEvent(myEvent)
    }, 300)
  }

  const { userId, collapsed, menu, firmType, mustChangePassword, pageId } = props
  const tabList = []
  // if (!isTerminalSystem() && firmType == 'Operator') { // 王凯说这个“提醒设置”去掉
  //   tabList.push(1)
  // }

  // if (isBatterySystem()) {
  //   tabList.push(2, 4)
  // } else {
  //   tabList.push(2, 3, 4)
  // }
  // const treeNodeClick = (node) => {
  //   if (hasPos(node)) {
  //     sessionStorage.setItem('stationActiveNode', JSON.stringify(node))
  //     props.dispatch({ type: 'global/updateToView', payload: { activeNode: node, stationDetail: node } })
  //   } else {
  //     message.error(utils.intl('无位置信息'))
  //     return false
  //   }
  // }
  // const fetchStationList = (val: string = '') => {
  //   props.dispatch({
  //     type: 'global/getSearchMapStationList',
  //     payload: { queryStr: val }
  //   })
  // }
  const language = localStorage.getItem('language') || 'zh'
  gdata('language', language)

  // useEffect(() => {
  //   if (!isBatterySystem() && props.stationList && props.stationList.length) {
  //     terminalSocket.start(dispatch, {}, {
  //       'connect': () => {
  //         const stationIdList = props.stationList.map(item => item.id);
  //         terminalSocket.emit('abnormal', { stationId: stationIdList.join(',') })
  //       },
  //       'abnormal': (data) => {
  //         try {
  //           props.updateState({
  //             eventAlarm: data.results
  //           });
  //         } catch (e) {
  //           console.log(e);
  //         }
  //       }
  //     });
  //   }
  // }, [JSON.stringify(props.stationList)])

  // // 保存菜单-电站列表枚举
  // useEffect(() => {
  //   const { stationList, scenariosMenus, menu } = props
  //   if (stationList && stationList.length && scenariosMenus && JSON.stringify(scenariosMenus) !== '{}' && menu && menu.length) {
  //     const menuToStationList = menusToStationMap(menu, scenariosMenus, stationList)
  //     props.action('updateToView', { menuToStationList })
  //   } else if (menu && menu.length) {
  //     const menuToStationList = menusToStationMap(menu, {}, stationList)
  //     props.action('updateToView', { menuToStationList })
  //   }

  //   if (isBatterySystem()) {
  //     const $favicon = document.querySelector('link[rel="icon"]');
  //     if ($favicon !== null) {
  //       $favicon.href = language === 'zh' ? zhIcon : enIcon;
  //     } else {
  //       $favicon = document.createElement("link");
  //       $favicon.rel = "icon";
  //       $favicon.href = language === 'zh' ? zhIcon : enIcon;
  //       document.head.appendChild($favicon);
  //     }

  //   } else if (props.stationList && props.stationList.length === 1 && props.stationList[0].code === 1111) {
  //     const $favicon = document.querySelector('link[rel="icon"]');
  //     if ($favicon !== null) {
  //       $favicon.href = icon;
  //     } else {
  //       $favicon = document.createElement("link");
  //       $favicon.rel = "icon";
  //       $favicon.href = icon;
  //       document.head.appendChild($favicon);
  //     }
  //   }

  // }, [JSON.stringify(props.stationList), props.scenariosMenus, props.menu, language])

  const changeTheme = (checked) => {
    let theme = checked ? 'dark-theme' : 'light-theme'
    // sessionStorage.setItem('theme', theme)
    // localStorage.setItem('theme', theme)
    setSystemTheme(theme)
    document.body.className = theme
    document.body.className += isZh() ? ' zh' : ' en'
    props.action('updateToView', { theme: checked ? 'dark-theme' : 'light-theme' })
    triggerEvent('theme-change', window)
  }

  // // 切换电站
  // const handleStationChange = (stationId: number) => {
  //   // 更新全局stationsId
  //   props.dispatch({
  //     type: `global/updateToView`,
  //     payload: { stationId },
  //   });

  //   // 重新获取能量单元
  //   props.dispatch({
  //     type: `global/getEnergyListByStationId`,
  //     payload: { stationId },
  //   });
  // }

  let isLight = theme == 'light' || theme == 'light-theme'

  const customizeRenderEmpty = () => (
    <div style={{ textAlign: 'center', marginTop: 14 }}>
      <img src={isLight ? lightEmptyImg : darkEmptyImg} />
      <p>{utils.intl('暂无数据')}</p>
    </div>
  );

  // let isXinMei = JSON.parse(sessionStorage.getItem('userInfo'))?.firm?.title.indexOf('欣美') !== -1

  // if (isXinMei) {
  //   window.document.title = '绿色低碳工厂管理平台'
  //   if (document.getElementById('screenIcon')) {
  //     document.getElementById('screenIcon').href = '/img/xinmei.png'
  //   }
  // } else {
  //   if (isStorageSystem() || isMicrogrid()) {
  //     if (document.getElementById('screenIcon')) {
  //       document.getElementById('screenIcon').href = '/img/icon.png'
  //     }
  //   }
  // }
  console.log(999)
  return (
    <WKConfigProvider locale={language === 'zh' ? zhCN : enUS} theme={isLight ? lightTheme : darkTheme} language={language}>
      <ConfigProvider locale={language === 'zh' ? zhCN : enUS} renderEmpty={customizeRenderEmpty}>
        {mustChangePassword && (
          <MustChangePasswordPage
            theme={theme}
            username={props.showName}
            oldPassword={props.oldPassword}
            newPassword={props.newPassword}
            newPassword1={props.newPassword1}
            updateState={props.updateState}
            mustChangePassword={() => props.action('mustChangePassword', { oldPassword: props.oldPassword, newPassword: props.newPassword })}
          />
        )}
        {
          !mustChangePassword && (
            <section className={`platform-page-container ${language} ${getSystemName()}`}>
              <header className="app-header">
                <div className="flex1 v-center" style={{ paddingLeft: 6 }}>
                  <>
                    <img className="logo" src={
                      isLight ? props.firm?.lightLogoUrl ? getImageUrl(props.firm?.lightLogoUrl) + "?tempid=" + Math.random() : null :
                        props.firm?.darkLogoUrl ? getImageUrl(props.firm?.darkLogoUrl) + "?tempid=" + Math.random() : null} style={{ margin: '0 0 0 17px' }} />
                    <span style={{ fontSize: 17, marginLeft: 15 }}>
                      {utils.intl(props.firm?.platformTitleMap?.[process.env.SYSTEM_PLATFORM])}
                    </span>
                  </>
                  {/* {
                    isPvSystem() && !isXinMei && (
                      <img className="pv-logo" src={require('./system-icon-pv.svg')} style={{ margin: '0 0 0 17px', width: 200 }} />
                    )
                  }
                  {
                    isTerminalSystem() && !isXinMei && (
                      <span style={{ fontSize: 22, marginLeft: 15 }}>{sessionStorage.getItem('station-title')}</span>
                    )
                  }
                  {
                    isStorageSystem() && !isXinMei && (
                      <span style={{ fontSize: 20, marginLeft: 15 }}>
                        {utils.intl('综合能源智慧运营服务平台')}
                      </span>
                    )
                  }
                  {
                    isBatterySystem() && !isXinMei && (
                      <img className="pv-logo" src={require('./system-icon-battery.svg')} style={{ margin: '0 0 0 17px', width: 200 }} />
                    )
                  }
                  {
                    isMicrogrid() && !isXinMei && (
                      <img className="microgrid-logo" src={require('./system-icon-microgrid.png')} style={{ margin: '0 0 0 17px' }} />
                    )
                  }
                  {
                    isMicrogrid() && isXinMei && isLight && (
                      <>
                        <img className="xinmei-logo" src={require('./system-xinmei-light.png')} style={{ margin: '0 0 0 17px' }} />
                        <span style={{ fontSize: 17, marginLeft: 15 }}>
                          {utils.intl('绿色低碳工厂管理平台')}
                        </span>
                      </>
                    )
                  }
                  {
                    isMicrogrid() && isXinMei && !isLight && (
                      <>
                        <img className="xinmei-logo" src={require('./system-xinmei-black.png')} style={{ margin: '0 0 0 17px' }} />
                        <span style={{ fontSize: 17, marginLeft: 15 }}>
                          {utils.intl('绿色低碳工厂管理平台')}
                        </span>
                      </>
                    )
                  } */}
                  {/* {window.location.pathname === '/station-monitor/station_monitor' ||
                    window.location.pathname === '/station-monitor/topological' ||
                    window.location.pathname === '/situational-awareness/forecast' ?
                    <StationList
                      activeNode={props.activeNode}
                      onClick={treeNodeClick}
                      fetchData={fetchStationList}
                      list={props.mapStationList}
                      loading={props.mapStationLoading}
                      icon={<img src={require('./station.png')} />}
                    />
                    : ''} */}
                </div>
                {!isBatterySystem() && (
                  <Switch
                    checkedChildren={utils.intl('深色')}
                    unCheckedChildren={utils.intl('浅色')}
                    defaultChecked={getSystemTheme() === 'dark-theme'}
                    style={{ marginTop: 15, marginRight: 32 }}
                    onChange={changeTheme}
                  />
                )}
                <SystemInfo tabList={tabList} theme={theme} />
              </header>
              <footer className="platform-body">
                <aside className="platform-menu" style={{ width: collapsed ? '80px' : '208px', marginTop: 0 }}>
                  <div className={`platform-menu-body`}>
                    <Menus menu={menu} collapsed={collapsed} />
                  </div>
                  <div className={`platform-menu-footer`} onClick={changeCollapsed}>
                    <a>
                      {
                        collapsed ? (
                          <WankeMenuUnfoldOutlined className="e-mr10" style={{ fontSize: '16px', color: '#92929d', marginLeft: '20px' }} />
                        ) : (
                          <WankeMenuFoldOutlined className="e-mr20" style={{ fontSize: '16px', color: '#92929d', marginLeft: '20px' }} />
                        )
                      }
                    </a>
                    {!collapsed ?
                      <>
                        {language === 'zh' ?
                          <span className={styles['time']}>{props.time?.year ? props.time?.year
                            + '/' + utils.intl(parseInt(props.time?.month, 10) + '月')
                            + '/' + parseInt(props.time?.day, 10) + ' ' + props.time?.time : ''}</span>
                          :
                          <span className={styles['time']}>{props.time?.year ? utils.intl(parseInt(props.time?.month, 10) + '月')
                            + ' ' + parseInt(props.time?.day, 10)
                            + ',' + props.time?.year + ' ' + props.time?.time : ''}</span>
                        }
                      </>
                      : ''}

                  </div>
                </aside>
                {
                  userId && (
                    <div className={'platform-content'}>
                      <div className="page-and-crumb" id="page-and-crumb">
                        <Crumbs />
                        <div className="page-wrap">
                          <ErrorBoundary pathname={props.location.pathname} crumbs={props.crumbs}>
                            {menu.length > 0 && JSON.stringify(props.stationDetail) !== "{}" && React.cloneElement(props.children as any, { pageId })}
                          </ErrorBoundary>
                        </div>
                      </div>
                    </div>
                  )
                }
              </footer>
            </section>
          )
        }
        <div className={styles['warning-voice']}>
          <video id={'myVideo'} className={styles['video-js']}>
            <source src={require('../static/1822.mp3')} type="audio/mpeg" />
          </video>
        </div>
      </ConfigProvider>
    </WKConfigProvider>
  )
}

function mapStateToProps(model: GlobalState, getLoading, state) {
  return {
    ...model,
    crumbs: state.crumbs.crumbs,
    mapStationLoading: getLoading('getSearchMapStationList'),
    timeZoneId: state[settingNS].timeZoneId,
    selectedStationId: state.global.selectedStationId,
    stationList: state.global.stationList,
  }
}

export default makeConnect(globalNS, mapStateToProps)(Platform21App)
