import React, { useEffect, useRef, useState } from 'react'
import classnames from 'classnames'
import { flattenDeep } from 'lodash'
import { crumbsNS, globalNS } from '../pages/constants'
import utils from '../public/js/utils'
import styles from './index.less'
import $ from 'jquery'
import { Button, Select } from 'wanke-gui'
import { getActionType, makeConnect } from '../pages/umi.helper'
import stationLight from '../static/img/station_light.svg'
import stationDark from '../static/img/station_dark.svg'
import ReactDOM from 'react-dom'
import { WankeFullscreen2Outlined, WankeFullscreenOut2Outlined } from 'wanke-icon'
import { useLocation } from 'umi'
import useEnergyUnitSelect from '../hooks/useEnergyUnitSelect'
import { isBatterySystem } from '../core/env'


const removePathname = [
  '/abnormal-alarm/level-config-admin',
  '/abnormal-alarm/alarm-rules'
]

const noReturnPageName = ['dataPoint']


export function findMenuIdByKey(menus, mKey) {
  let mId = null
  for (let i = 0; i < (menus || []).length; i++) {
    const { id, key, children } = menus[i]
    const newMKey = Array.isArray(mKey) ? mKey[0] : mKey
    if (key === newMKey.replace('/undefined', '')) {
      mId = id
      break
    } else if (children && children.length) {
      const menuId = findMenuIdByKey(children, mKey)
      if (menuId !== null) {
        mId = menuId
        break
      }
    }
  }
  return mId
}

function Crumbs(props) {
  let index = props.crumbs.length - 1
  let showStation: any = false
  let showEnergyUnit: any = false
  while (index >= 0) {
    let c = props.crumbs[index--]
    if (c.showStation != undefined) {
      showStation = c.showStation
      break
    }
  }
  index = props.crumbs.length - 1
  while (index >= 0) {
    let c = props.crumbs[index--]
    if (c.showEnergyUnit != undefined) {
      showEnergyUnit = c.showEnergyUnit
      break
    }
  }

  const [fStationList, setFStationList] = useState([])

  const fullScreenRef = useRef(false)
  const fullScreenCountRef = useRef(0)
  let { energyUnitList, onEnergyUnitChange } = useEnergyUnitSelect({ showEnergyUnit })

  const onStationChange = (v) => {
    const node = props.stationList.find(item => item.id === v)
    sessionStorage.setItem('station-id', JSON.stringify(v))
    props.action(getActionType(globalNS, '_updateState'), { selectedStationId: v })
    props.action(getActionType(globalNS, '_updateState'), { selectedStation: node })
    props.action(getActionType(globalNS, '_updateState'), { selectedStationCode: node?.code })

    sessionStorage.setItem('stationActiveNode', JSON.stringify(node))
    props.dispatch({ type: 'global/updateToView', payload: { activeNode: node, stationDetail: node } })
  }

  const { pathname } = useLocation();
  useEffect(() => {
    props.dispatch({ type: 'global/fetchStationList' })
  }, [pathname])

  useEffect(() => {
    window.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => {
      window.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [])

  useEffect(() => {
    if (props.menu && props.menu.length && props.selectedKeys && props.selectedKeys.length && props.stationList && props.stationList.length) {
      const mId = findMenuIdByKey(props.menu, props.selectedKeys)
      // const filterStationList = typeof showStation == 'function' ? showStation(props.menuToStationList?.[mId] || []) : props.menuToStationList?.[mId] || []
      let filterStationList = typeof showStation == 'function' ? showStation(props.stationList || []) : props.stationList || []
      // 过滤有权限的电站
      if (isBatterySystem()) {
        filterStationList = filterStationList.filter(item => !!item.hasBatteryHealthPlatform)
      }
      setFStationList(filterStationList)
      if (props.selectedStationId) {
        let match = filterStationList.find(item => item.id == props.selectedStationId)
        if (!match) {
          onStationChange(filterStationList[0]?.id)
        }
      } else if (filterStationList[0]?.id) {
        props.dispatch({ type: 'global/updateToView', payload: { selectedStationId: filterStationList[0]?.id } })
        onStationChange(filterStationList[0]?.id)
      }

      props.dispatch({ type: 'global/updateToView', payload: { scenariosStationList: filterStationList } })
    }
  }, [props.selectedKeys, props.stationList, props.menuToStationList])


  // useEffect(() => {
  //   props.dispatch({ type: 'global/updateToView', payload: { stationDetail: filterStationList[0] } })
  // }, [props.stationList]);

  const linkCallback = ({ value }, backCount) => {

    props.dispatch({
      type: `${crumbsNS}/updateCrumbs`,
      payload: {
        type: 'back', count: backCount
      }
    })
  }

  let flattenMenu = flattenDeep(props.menu.map(item => item.children ? [item, ...item.children] : item))
  if (!props.crumbs?.length) {
    return null
  }
  const exitFullScreen = () => {
    var el = document
    var cfs = el.exitFullScreen || el.msExitFullscreen || el.mozCancelFullScreen || el.webkitExitFullscreen
    if (typeof cfs != 'undefined' && cfs) {
      cfs.call(el)
    }
    props.dispatch({ type: 'global/updateScreen', payload: { fullScreenState: false } })
    $('#dd').css({ 'z-index': '-1' })
    $('#dd').removeAttr('style')
    $('#page-and-crumb').removeAttr('style')
  }
  const fullScreen = () => {
    fullScreenCountRef.current = 0
    var el = document.documentElement
    var rfs = el.requestFullscreen || el.mozRequestFullScreen || el.msRequestFullScreen || el.webkitRequestFullScreen
    if (typeof rfs != 'undefined' && rfs) {
      rfs.call(el)
      props.dispatch({ type: 'global/updateScreen', payload: { fullScreenState: !props.fullScreenState } })
      $('#dd').css({ 'z-index': '3', 'background-color': '#fff' })
      $('#page-and-crumb').css({
        'position': 'fixed',
        'top': '0px',
        'left': '-5px',
        'right': '0px',
        'z-index': '200',
        'bottom': '5px'
      })
    }
  }
  const back = () => {
    props.dispatch({
      type: `${crumbsNS}/updateCrumbs`,
      payload: {
        type: 'back', count: 1
      }
    })
  }
  fullScreenRef.current = props.fullScreenState

  const handleFullScreenChange = (e) => {
    if (fullScreenCountRef.current && fullScreenRef.current) {
      exitFullScreen()
    }
    fullScreenCountRef.current++
  }

  return (
    <div className="system-crumbs v-center" style={{ height: 50 }}>
      <div className="v-center">
        {
          showStation && (
            <>
              <img src={props.theme === 'dark-theme' ? stationLight : stationDark} style={{ display: 'inline-block' }} />
              <div style={{ width: 180, display: 'inline-block', marginLeft: -16 }}>
                <Select
                  disabled={props.crumbs.length > 2}
                  className="system-crumbs-select"
                  bordered={false}
                  dataSource={fStationList.map(item => ({ value: item.id, name: item.title }))}
                  style={{ width: 180 }}
                  placeholder="请选择电站"
                  value={props.selectedStationId}
                  onChange={onStationChange}
                  allowClear={false}
                />
              </div>
              <i className={'selectStation'} ></i>
            </>
          )
        }
        {
          showEnergyUnit && (<>
            <div style={{ width: 180, display: 'inline-block', marginRight: 16 }}>
              <Select
                dataSource={energyUnitList.map(item => ({ name: item.title, value: item.id }))}
                style={{ width: 180 }}
                placeholder="请选择能量单元"
                value={props.selectedEnergyUnitId}
                onChange={onEnergyUnitChange}
                allowClear={false}
              />
            </div>
          </>
          )
        }
        {
          props.crumbs.map((crumbItem, index) => {
            let title = crumbItem.pageTitle
            if (!title && crumbItem.url) {
              let match = flattenMenu.find(menuItem => menuItem.key == crumbItem.url)
              if (match) {
                title = match.title
              }
            }
            if (!title) {
              return null
            }

            return (
              <React.Fragment key={index}>
                {
                  !crumbItem.pageName || index === props.crumbs.length - 1 ? (
                    <span
                      className={classnames('crumb-item f-toe', { 'last-item': index === props.crumbs.length - 1 })}
                      key={index}
                      style={{ maxWidth: '300px' }}
                    >
                      {utils.intl(title)}
                    </span>
                  ) : (
                    <span
                      onClick={() => {
                        linkCallback(crumbItem, props.crumbs.length - 1 - index)
                      }}
                      className="crumb-item f-toe clickable"
                      style={{ maxWidth: '300px' }}
                    >
                      {utils.intl(title)}
                    </span>
                  )
                }
                {
                  index !== props.crumbs.length - 1 && (
                    <span className="crumb-item-arrow" style={{ marginLeft: '6px', marginRight: '6px' }}>&gt;</span>
                  )
                }
              </React.Fragment>
            )
          })
        }
        <div id="dd"></div>
        {
          window.location.pathname === '/station-monitor/system-connect-line' || window.location.pathname === '/station-monitor/flow-connect-line' ?
            props.fullScreenState ?
              <div className="full-screen" style={{
                float: 'right', width: '100%', top: '10px',
                position: 'absolute', height: '30px', backgroundColor: '#fff', zIndex: 99,
              }}
              >
                <div className={styles.control}
                  onClick={exitFullScreen} style={{ height: '50%', right: '35px' }}>
                  <WankeFullscreenOut2Outlined />
                  <span style={{ position: 'relative', left: '10px', lineHeight: '30px' }}>{utils.intl("退出全屏")}</span>
                </div>
              </div>
              :
              <div className="full-screen" style={{ float: 'right', zIndex: 999, position: 'absolute', right: '4px' }}>
                <div className={styles.control} onClick={fullScreen}>
                  <WankeFullscreen2Outlined />
                  <span style={{ position: 'relative', left: '10px' }}>{utils.intl("全屏")}</span>
                </div>
              </div>
            : ''
        }
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        {isBatterySystem() && (
          <div>
            {utils.intl("数据最后更新时间")}:
            <span style={{ marginLeft: 8 }}>
              {props.time?.year ? props.time?.year
              + '/' + parseInt(props.time?.month, 10)
              + '/' + parseInt(props.time?.day, 10) + ' ' + props.time?.time : ''}
            </span>
            
          </div>
        )}
        {
          props.crumbs.length > 2 &&
            removePathname.indexOf(pathname) < 0 &&
            noReturnPageName.indexOf(props.crumbs[props.crumbs.length - 1]?.pageName) < 0 && (
            <Button style={{ marginLeft: 16 }} onClick={back}>{utils.intl('返回')}</Button>
          )
        }
        <CrumbsPortalHolder />
      </div>
    </div>
  )
}

const mapStateToProps = (model, { }, state) => {
  return {
    ...model,
    ...state[globalNS]
  }
}

export default makeConnect(crumbsNS, mapStateToProps)(Crumbs)

const portalId = 'crumb-portal'

const CrumbsPortalHolder: React.FC<any> = () => {
  return (
    <div id={portalId} style={{ display: 'inline-block' }} />
  )
}

interface CrumbsPortalProps {
  pageName?: string
  crumbs?: any
}

const _CrumbsPortal: React.FC<CrumbsPortalProps> = (props) => {
  const lastCrumb = props.crumbs?.[props.crumbs?.length - 1]

  const renderChild = () => {
    const portalHolder = document.getElementById(portalId)
    if (!portalHolder || !lastCrumb || (props.pageName && props.pageName !== lastCrumb.pageName)) {
      return <span></span>
    }

    return ReactDOM.createPortal((
      <span>{props.children}</span>
    ), portalHolder)
  }

  return renderChild()
}

const mapStateToPortalProps = (model, { }, state) => {
  return {
    ...model,
  }
}

export const CrumbsPortal = makeConnect(crumbsNS, mapStateToPortalProps)(_CrumbsPortal)
