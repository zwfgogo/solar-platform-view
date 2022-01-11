import _ from 'lodash'
import React, { Component } from 'react'
import { AlarmState, GlobalState } from 'umi'
import { Switch, Select, Button } from 'wanke-gui'
import Page from '../../../components/Page'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'
import stationList from '../../common-operation-fee-query/models/station-list'
import { alarm_config, globalNS } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { levelConfigList } from '../dataCfg'
import './index.less'

interface Props extends PageProps, GlobalState, MakeConnectProps<AlarmState>, AlarmState {

}
interface State {
  // switchChecked: any
}

class LevelConfigAdminPage extends Component<Props, State> {

  cardList = {};

  state = {
    open: {}
  }

  componentDidMount() {
    const { dispatch } = this.props
    // 获得当前各异常级别通知配置
    dispatch({ type: `${alarm_config}/getLevelConfig` })
    // if (this.props.levelConfigList) {
    //   this.initChecked();
    // }
  }

  componentDidUpdate(preProps) {
    // if (!_.isEqual(preProps.levelConfigList, this.props.levelConfigList) && this.props.levelConfigList) {
    //   this.initChecked();
    // }
  }

  // 初始化开关状态
  // initChecked = () => {
  //   const switchChecked = {}
  //   this.props.levelConfigList.forEach((item, index) => {
  //     (item.alarmNotifyType || []).forEach((aItem, aIndex) => {
  //       switchChecked[`${index}_${aIndex}`] = !aItem.station
  //     })
  //   })

  //   this.setState({ switchChecked })
  // }

  // 调用接口直接保存
  handleChangeStation = (value, id) => {
    const { dispatch } = this.props
    dispatch({ type: `${alarm_config}/changeStatus`, payload: { id, stations: value ? value.join() : null } })
  }

  // 修改告警是否开启或者关闭
  handleChangeStatus = (value, id) => {
    const { dispatch } = this.props
    dispatch({ type: `${alarm_config}/changeStatus`, payload: { id, status: value ? 1 : 0 } })
  }

  // 接收人配置
  openReceiverConfig = () => {
    this.props.forward("ReceiverConfig");
  }

  render() {
    const { pageId, stationList, levelConfigList } = this.props
    // console.log('levelConfigList', levelConfigList)
    const stationDataList = stationList.map(item => ({ value: item.id, name: item.title }))
    return (
      <Page pageId={pageId} className="level-config-page">
        <CrumbsPortal pageName="LevelConfigAdminPage">
          <Button type="primary" className="btn_receiver" onClick={() => this.openReceiverConfig()}>{utils.intl('接收人配置')}</Button>
        </CrumbsPortal>
        {
          levelConfigList.map((item, i) => (
            <div className="level-config-page-item">
              <label className={`label-${item.title === utils.intl('通知') ? 'info' : item.title === utils.intl('预警') ? 'warning' : 'error'}`}>{utils.intl('异常级别')}：{item.title}</label>
              <div className="card-body">
                {
                  (item.alarmNotifyType || []).map((aItem, index) => (
                    <div className="card-body-item">
                      <div className="label">
                        {utils.intl(aItem.title)}
                        <div><Switch checked={aItem.status === 1} onClick={(value) => this.handleChangeStatus(value, aItem.id)} /></div>
                      </div>
                      <div className="card-detail" ref={card => this.cardList[`${i}_${index}`] = card}>
                        {
                          aItem.status === 1 ? ( // 编辑(开启)
                            <>
                              {
                                !aItem.isAllStation ?
                                  (
                                    <div className="card-detail-select-box" >
                                      <div className="card-detail-select-title">{utils.intl('选择适用电站')}</div>
                                      <Select
                                        dataSource={stationDataList}
                                        mode="multiple"
                                        checkAllText={utils.intl("全选")}
                                        selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                                        className="card-detail-select" style={{ width: 160 }} value={(aItem.stations || []).map(i => i.id)}
                                        open={this.state.open[`${i}_${index}`] ?? false}
                                        onDropdownVisibleChange={open => {
                                          // if(open) {
                                            const newOpen = _.cloneDeep(this.state.open);
                                            newOpen[`${i}_${index}`] = open;
                
                                            setTimeout(()=> {
                                              if(open) this.cardList[`${i}_${index}`].scrollTop = 0;
                                              this.setState({ 
                                                open: newOpen
                                              })
                                            }, 200)
                                          // }
                                        }}
                                        onChange={value => this.handleChangeStation(value, aItem.id)} />
                                    </div>
                                  ) : null
                              }
                              <div className="card-detail-switch" style={{ display: 'inline-flex', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 4 }}>
                                {utils.intl('全部适用')}
                                <Switch checked={aItem.isAllStation} style={{ marginLeft: 8 }} onChange={checked => {
                                  this.props.dispatch({ type: `${alarm_config}/putIsAllStation`, payload: { id: aItem.id, isAllStation: checked } })
                                }} />
                              </div>
                              {/* {index === 2 ? <Button type="primary" className="btn_receiver" onClick={() => this.openReceiverConfig(aItem.id)}>{utils.intl('接收人配置')}</Button> : null} */}
                            </>
                          ) : ( // 查看
                            <>
                              <div className="card-detail-title">{utils.intl('适用电站')}</div>
                              <div className="card-detail-body">{aItem.isAllStation ? utils.intl('全部') : (aItem.stations || []).map(i => i.title).join('；')}</div>
                            </>
                          )
                        }
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

export default makeConnect(alarm_config, mapStateToProps)(LevelConfigAdminPage)
