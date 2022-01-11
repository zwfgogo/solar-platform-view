/**
 * 普通用户-类别配置
 */

import React, { Component } from 'react'
import { AlarmState, GlobalState } from 'umi'
import { Switch } from 'wanke-gui'
import Page from '../../../components/Page'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'
import { alarm_config, globalNS } from '../../constants'
import { makeConnect } from '../../umi.helper'
import "./index.less"

interface Props extends PageProps, GlobalState, MakeConnectProps<AlarmState>, AlarmState {

}
interface State {

}

class LevelConfigUserPage extends Component<Props, State> {
  state = {}

  componentDidMount() {
    const { dispatch } = this.props
    // 获得当前各异常级别通知配置
    dispatch({ type: `${alarm_config}/getLevelConfigUser` })
  }

  // 修改告警是否开启或者关闭
  handleChangeStatus = (value, id) => {
    const { dispatch } = this.props
    dispatch({ type: `${alarm_config}/changeStatusUser`, payload: { id, status: value ? 1 : 0 } })
  }

  render() {
    const { pageId, userLevelConfigList } = this.props
    return (
      <Page pageId={pageId} className="level-config-page-user">
        {
          userLevelConfigList.map(item => (
            <div className="level-config-page-user-item">
              <label className={`label-${item.title === utils.intl('通知') ? 'info' : item.title === utils.intl('预警') ? 'warning' : 'error'}`}>{utils.intl('异常级别')}：{item.title}</label>
              <div className="card-body">
                {
                  (item.alarmNotifyType || []).map(aItem => (
                    <div className="card-body-item">
                      <div className="label">
                        {utils.intl(aItem.title)}
                        <Switch checked={aItem.status === 1} onChange={(value) => this.handleChangeStatus(value, aItem.id)} />
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ))
        }
      </Page>
    )
  }
}


const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationList: state[globalNS].stationList
  }
}

export default makeConnect(alarm_config, mapStateToProps)(LevelConfigUserPage)