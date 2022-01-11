/**
 * 规则查看
 */

import React, { Component } from 'react'
import { AlarmState, GlobalState } from 'umi'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import utils from '../../../public/js/utils'
import classNames from 'classnames'
import _ from 'lodash'

interface Props extends PageProps, GlobalState, MakeConnectProps<AlarmState>, AlarmState {
  type: 'new' | 'edit' | 'view',
  tabKey: 'station' | 'device',
  record?: any
}
interface State {

}

export default class AlarmRulesViewPage extends Component<Props, State> {
  state = {}

  stationMap = {};
  deviceMap = {};

  // componentDidMount() {
  //   this.props.stationList.forEach(item => {
  //     this.stationMap[item.id] = item.title;
  //   })
  //   // console.log('this.props.deviceList', this.props.deviceList)
  //   this.props.deviceList.forEach(item => {
  //     const { children } = item
  //     children.forEach(cItem => {
  //       this.deviceMap[cItem.id] = cItem.title
  //     })
  //   })
  // }

  componentDidUpdate(preProps) {
    if (!_.isEqual(this.props.deviceList, preProps.deviceList)) {
      // console.log('this.props.deviceList', this.props.deviceList)
      this.props.deviceList.forEach(item => {
        const { children } = item
        children.forEach(cItem => {
          this.deviceMap[cItem.id] = cItem.title
        })
      })

      this.props.deviceList.forEach(item => {
        const { children } = item
        children.forEach(cItem => {
          this.deviceMap[cItem.id] = cItem.title
        })
      })

    }

    if (!_.isEqual(this.props.stationList, preProps.stationList)) {
      this.props.stationList.forEach(item => {
        this.stationMap[item.id] = item.title;
      })
    }
  }

  transformDevice = () => {
    const { deviceTypeTree, record } = this.props;
    // console.log('deviceTypeTree', deviceTypeTree, record.alarmObject?.deviceIds?.[0])
    let text = null;
    for (let i = 0; i < deviceTypeTree.length; i++) {
      if (deviceTypeTree[i].children) {
        const obj = deviceTypeTree[i].children.find(item => item.value === record.alarmObject?.deviceIds?.[0]);
        if (obj) {
          text = `${obj.groupName}：${obj.name}`;
          break;
        }
      }
    }
    return text;
  }

  transformText = () => {
    const { record, stationList, deviceList } = this.props;
    if (record.alarmScope?.name === 'station') { // 电站
      return stationList.find(item => item.id === record.alarmObject?.stationIds?.[0])?.title
    } else if (record.alarmScope?.name === 'device') { // 设备
      return this.transformDevice();
    } else { // 设备类型
      if (record.alarmObject?.selectAll) return utils.intl('全部')
      stationList.forEach(item => {
        this.stationMap[item.id] = item.title;
      })
      // console.log('this.props.deviceList', this.props.deviceList)
      deviceList.forEach(item => {
        const { children } = item
        children.forEach(cItem => {
          this.deviceMap[cItem.id] = cItem.title
        })
      })
      // console.log('this.stationMap', this.stationMap, record.alarmObject?.stationIds)
      const textList = [];
      record.alarmObject?.stationIds.forEach(stationId => textList.push(`${this.stationMap[stationId]}：${utils.intl('全部')}`));
      Object.keys(record.alarmObject?.deviceIdMap ?? {}).forEach(stationId =>
        textList.push(`${this.stationMap[stationId]}：${record.alarmObject?.deviceIdMap[stationId].map(deviceId => this.deviceMap[deviceId]).join('、')}`)
      );
      return textList.join('，')
    }
  }

  formulaToForm = (originFormula: string = ''): string => {
    const formula = originFormula.replace(/(var|param)\([^()]+\)/g, (str) => {
      const title = str.replace(/(var|param)\(|\)/g, '');
      return `<span contenteditable="false" class="view-box">${title}</span>`
    })
    return formula
  }

  render() {
    const { pageId, tabKey, alarmRulesEnums, stationList, alarmTypesList, pointDataTypesList, deviceList, record } = this.props
    const { alarmScopes, alarmLevels, calcFunctions, alarmCalcTypes, deviceTypes } = alarmRulesEnums
    // console.log('stationList', stationList)
    const text = this.transformText();
    return (
      <div>
        <div className="alarm-rules-view-page">
          <div className="alarm-rules-edit-header">{utils.intl('异常规则详情')}</div>
          <div className="alarm-rules-form-first">
            <div className="alarm-rules-form-view" style={{ display: "inline-block", margin: '8px 0px' }}>
              <label>{utils.intl('适用类型')}</label>
              <div className="form-view-value">{alarmScopes.find(item => item.id === record.alarmScope?.id)?.title}</div>
            </div>
            {
              record.alarmScope?.name === 'deviceType' ? (
                <div style={{ display: 'flex', flexDirection: "row" }}>
                  <div className="alarm-rules-form-view" style={{ display: "inline-block" }}>
                    <label>{utils.intl('设备类型')}</label>
                    <div className="form-view-value">{alarmRulesEnums.deviceTypes?.find(item => item.name === record.alarmObject?.deviceTypeName)?.title}</div>
                  </div>
                  <div className="alarm-rules-form-view" style={{ display: "flex", flex: 1, marginLeft: 80 }}>
                    <label style={{ width: 'auto' }}>{utils.intl('适用对象')}</label>
                    <div className="form-view-value" title={text} style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>{text === '' ? utils.intl('全部') : text}</div>
                  </div>
                </div>
              ) : (
                <div className="alarm-rules-form-view" style={{ display: "flex", width: '100%', }}>
                  <label style={{ width: 'auto' }}>{utils.intl('适用对象')}</label>
                  <div className="form-view-value" title={text} style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>{text === '' ? utils.intl('全部') : text}</div>
                </div>
              )
            }
          </div>
          <div className="alarm-rules-context">
            <div className="alarm-rules-context-header" style={{ marginBottom: '16px', fontSize: 16, fontWeight: "bold" }}>{utils.intl('规则内容')}</div>
            <div className="alarm-rules-context">
              <div className="alarm-rules-form-view" style={{ display: "inline" }}>
                <label>{utils.intl('异常类型')}</label>
                <div className="form-view-value">{record.alarmType}</div>
              </div>
              <div className="alarm-rules-form-view" style={{ display: "inline", marginLeft: 314 }}>
                <label>{utils.intl('异常级别')}</label>
                <div className="form-view-value">{record.alarmLevel?.title}</div>
              </div>
              <div className="alarm-rules-form-view">
                <label>{utils.intl('异常详情')}</label>
                <div className="form-view-value">{record.desc}</div>
              </div>
              <div className="alarm-rules-form-view">
                <label>{utils.intl('判断规则')}</label>
                <div className={classNames("form-view-value", "data-type-card")}
                  dangerouslySetInnerHTML={{
                    __html: this.formulaToForm(record.formula)
                  }}
                ></div>
              </div>
              <div className="alarm-rules-form-view">
                <label>{utils.intl('判断方式')}</label>
                <div className="form-view-value">{record.alarmCalcType?.name === 'duration' ? `${utils.intl('持续时间')}${(record.durationRtime || 0) / 1000 / 60}${utils.intl('分钟')}` :
                  record.alarmCalcType?.name === 'holding' ? `${utils.intl('持续{0}分钟后不变化告警', (record.durationRtime || 0) / 1000 / 60)}`
                    : utils.intl('实时')}</div>
              </div>
              <div className="alarm-rules-form-view">
                <label>{utils.intl('关联数据项')}</label>
                <div className="form-view-value">
                  {record.relatedPointDataTypeTitles ? record.relatedPointDataTypeTitles.map(item => <span className="data-type-card" style={{ margin: 4 }}>{item}</span>) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
