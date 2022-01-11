import React from 'react'
import { connect } from 'dva'
import { Menu } from 'antd'
import { globalNS } from '../pages/constants'
import {
  WankeCurrentSituationOutlined,
  WankeOnlineWatchOutlined,
  WankeOptimizeTaskOutlined,
  WankeRunManageOutlined,
  WankeSummaryOutlined,
  WankeBasicDataOutlined,
  GfStationOutlined,
  GfMonitoringCenterOutlined,
  GfStatisticsFormOutlined,
  GfAlarmServerOutlined,
  GfOperationOutlined,
  GfResourceOutlined,
  GfWaveCircleOutlined,
  WankeBatteryOperationOutlined,
  WankeStationInfoOutlined,
  WankeBatteryCabinOutlined,
  WankeBatteryRoomOutlined,
  GfMonitoringCenter2Outlined,
  GfAlarm2Outlined,
  GfReportFormOutlined,
  GfPerceptionCircleOutlined,
  GfRemindOutlined,
  GfLgcOutlined,
  GfPeopleOutlined,
  ZdPowerLoadOutlined, 
  WankePageAlarmOutlined
} from 'wanke-icon'
import { useLocation } from 'umi'

export interface IMenu {
  children: Array<IMenu>;
  url: string;
  title: string;
  icon: string;
  key: string;
}

export interface MenuProps {
  dispatch?: any;
  menu: Array<IMenu>;
  collapsed: boolean;
  selectedKeys: Array<string>;
  openKeys: Array<string>;
  pathname: string
}

const { SubMenu } = Menu

const getIcon = (url) => {
  switch (url) {
    case '/index':
      return GfStationOutlined
    case '/station-monitor':
      return GfMonitoringCenter2Outlined
    case '/statistic-analysis':
    case '/statistical-form':
      return GfReportFormOutlined
    case '/alert-service':
      return GfAlarm2Outlined
    case '/operation-maintenance':
      return GfPeopleOutlined
    case '/basic-data':
      return GfResourceOutlined
    case '/situational-awareness/forecast':
      return GfPerceptionCircleOutlined
    case '/operation-management':
      return WankeOnlineWatchOutlined
    case '/optimize-operation':
      return WankeCurrentSituationOutlined
    case '/monographic-analysis':
      return WankeRunManageOutlined
    case '/online-monitor':
      return WankeSummaryOutlined
    case '/operationDuty':
      return WankeOnlineWatchOutlined
    case '/analysis-query':
      return WankeRunManageOutlined
    case '/fm-monitoring':
      return WankeStationInfoOutlined
    case '/battery-operation':
      return WankeBatteryOperationOutlined
    case '/battery-cabin':
      return WankeBatteryCabinOutlined
    case '/information-room':
      return WankeBatteryRoomOutlined
    case '/customized-service/remind-management': // 提醒管理
      return GfRemindOutlined
    case '/customized-service/lgc-management': // LGC管理
      return GfLgcOutlined
    case '/power-load-management':
      return ZdPowerLoadOutlined
    case '/abnormal-alarm':
      return WankePageAlarmOutlined // 异常管理
    default:
      return null
  }
}

function getSubMenu(menus: Array<IMenu>): React.ReactNodeArray {

  return menus.map((menu: IMenu, index) => {
    let Icon = getIcon(menu.key)
    if (menu.children.length) {
      return (
        <SubMenu
          key={menu.key}
          title={
            <span>
              {Icon && <Icon style={{ fontSize: 14 }} />}
              <span style={{ fontSize: 14 }}>{menu.title}</span>
            </span>
          }
        >
          {getSubMenu(menu.children)}
        </SubMenu>
      )
    } else {
      let Icon = getIcon(menu.key)
      return (
        <Menu.Item key={menu.key}>
          {Icon &&
            <Icon style={{ fontSize: 14 }} />
          }
          <span style={{ fontSize: 14 }}>{menu.title}</span>
        </Menu.Item>
      )
    }
  })
}

const Menus: React.FC<MenuProps> = props => {
  const location = useLocation()
  const { pathname, search } = location
  const { dispatch, menu, collapsed, openKeys } = props

  const open = openKeys => {
    dispatch({
      type: `${globalNS}/updateToView`,
      payload: {
        openKeys: [openKeys[openKeys.length - 1]]
      }
    })
  }

  const clickMenuItem = ({ item, key, keyPath, domEvent }) => {
    dispatch({
      type: `${globalNS}/jumpToPage`,
      payload: key
    })
  }
  return (
    <Menu
      onClick={clickMenuItem}
      selectedKeys={[pathname]}
      openKeys={openKeys}
      mode="inline"
      theme="light"
      inlineCollapsed={collapsed}
      onOpenChange={open}>
      {getSubMenu(menu)}
    </Menu>
  )
}

const mapStateToProps = state => {
  return {
    pathname: state.router.location.pathname,
    ...state.global
  }
}

export default connect<any, any, any, any>(mapStateToProps)(Menus)
