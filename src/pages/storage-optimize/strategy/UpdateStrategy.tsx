import React, {useEffect} from 'react'
import classnames from 'classnames'
import Page from '../../../components/Page'
import WithCircleBg from '../../../components/WithCircleBg'
import {message} from 'wanke-gui'
import CancelAndSave from '../../../components/new-footer/CancelAndSave'
import PageProps from '../../../interfaces/PageProps'
import FullContainer from '../../../components/layout/FullContainer'
import Auto from './Auto'
import Manual from './Manual'
import TemplateDialog from './dialog/TemplateDialog'
import StrategyCheckDialog from './dialog/StrategyCheckDialog'
import SetTemplateDialog from './dialog/SetTemplateDialog'
import {OptimizeRunningUpdateModel, UnitType} from '../models/update'
import {makeConnect} from '../../umi.helper'
import {optimize_running_update} from '../../constants'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import {copy} from '../../../util/utils'
import {FormContainer} from '../../../components/input-item/InputItem'
import {FormComponentProps} from '../../../interfaces/CommonInterface'
import SendResultDialog from './dialog/SendResultDialog'
import AutoLook from './look/AutoLook'
import ManualLook from './look/ManualLook'
import {isManual} from '../optimize.helper'
import CommonEcharts from '../../../components/charts/common-echarts/CommonEcharts'
import CancelAndUpdate from '../../../components/new-footer/CancelAndUpdate'
import StrategyNameInput from './input/StrategyNameInput'
import EnergyUnitTab from './input/EnergyUnitTab'
import {checkUnitRule} from '../optimize.rule'
import {FullLoading} from 'wanke-gui'
import {inputLengthRule} from '../../../util/ruleUtil'
import QrCodeSendDialog from './dialog/QrCodeSendDialog'
import {useEchartsOption, CustomChartOption} from '../../../components/charts/common-echarts/useEchartsOption'

import {WankeElectricityOutlined} from 'wanke-icon'
import {Socket_Port} from '../../constants'

import SocketClient from 'socket.io-client'
import utils from '../../../public/js/utils'

let socketClient

interface Props extends FormComponentProps, PageProps, MakeConnectProps<OptimizeRunningUpdateModel>, OptimizeRunningUpdateModel {
  stationId: number
  loading: boolean
  updateLoading: boolean
  templateLoading: boolean
}

const colorList = [
  {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      {
        offset: 0,
        color: '#3d7eff' // 0% 处的颜色
      },
      {
        offset: 1,
        color: '#1752c8' // 100% 处的颜色
      }
    ],
    global: false // 缺省为 false
  }
]
let taskId

const UpdateStrategy: React.FC<Props> = function (this: null, props) {
  const changeMode = (index, v) => {
    let units = copy(props.units)
    units[index].mode = v
    props.updateState({units})
  }

  const onTabChange = (index) => {
    props.updateState({activeKey: index, curveList: []})
    props.action('fetchCurve', {stationId: props.stationId})
  }

  const updateUnit = (index, unit: UnitType) => {
    let units = copy(props.units)
    units[index] = unit
    props.updateState({units})
  }

  const useTemplate = () => {
    props.updateState({showTemplateList: true})
    props.updateQuery({page: 1, queryStr: ''}, 'templateQuery')
  }

  const addAsTemplate = () => {
    props.form.validateFields().then(() => {
      props.updateState({showAddTemplate: true, addTemplateName: props.strategyName, addTemplateDesc: ''})
    }).catch(errInfo => {
      let errorFields = errInfo.errorFields
      let index = errorFields.findIndex(item => {
        return item.name[0].indexOf(props.activeKey + '_') != -1
      })
      if (index != -1) {
        let error = errorFields[index].errors[0]
        message.error(error)
      } else {
        props.updateState({showAddTemplate: true, addTemplateName: props.strategyName, addTemplateDesc: ''})
      }
    })
  }

  const toUpdateStrategy = () => {
    props.action('fetchStrategyDetail', {stationId: props.stationId})
    props.updateState({isPreview: false})
  }

  const updateStrategy = () => {
    props.parentPageNeedUpdate()
    props.updateState({touched: true})
    if (props.units.length == 0) {
      message.error('当前电站没有能量单元，不能添加策略')
      return
    }
    props.form.validateFields().then(() => {
      props.action('updateStrategy', {stationId: props.stationId, needCheckStrategy: true})
    }).catch(errInfo => {
      let errorFields = errInfo.errorFields
      let index = errorFields.findIndex(item => {
        return item.name[0].indexOf(props.activeKey + '_') != -1 || item.name[0].indexOf('strategyName') != -1
      })
      if (index != -1) {
        let errMsg = errorFields[index].errors[0]
        message.error(errMsg)
      } else {
        let unCompleteUnits = props.energyUnitList.filter((_, i) => {
          return errorFields.find(item => item.name[0].indexOf(i + '_') != -1)
        }).map(item => item.name)
        message.error(`"${unCompleteUnits.join('、')}" 储能单元策略尚未填写完整，请补充`)
      }
    })
  }

  const showQrCodeInfo = () => {
    props.updateState({showScanQrCode: true})
    props.action('fetchQrCode', {stationId: props.stationId})
  }

  const socketStart = () => {
    socketClient = SocketClient(Socket_Port + '/custom-stroe', {
      transports: ['websocket'],
      'query': 'token=' + sessionStorage.getItem('token') + '&language=zh'
    })
    socketClient.emit('getResult', {key: props.uniqueId})

    // 监听发送消息
    socketClient.on('getResult', (data) => {
      let res = JSON.parse(data)
      props.action('fetchScanResult', {res: res.results, stationId: props.stationId})
    })
  }
  useEffect(() => {
    if (props.scanPhase == 1) {
      socketStart()
      taskId = socketStart()
    } else {
      taskId && clearTimeout(taskId)
    }
    return () => {
      // 关闭socket连接
      if (socketClient) {
        socketClient.close()
      }
    }
  }, [props.scanPhase])

  useEffect(() => {
    if (!props.showScanQrCode) {
      taskId && clearTimeout(taskId)
    }
  }, [props.showScanQrCode])

  useEffect(() => {
    props.action('reset')
    props.action('fetchStrategyDetail', {stationId: props.stationId})
    props.action('fetchType')
  }, [])

  const {
    strategyName, units, activeKey, expandList, step3Success,
    showTemplateList, showAddTemplate, showCheckResult, showSendResult, isPreview, curveList
  } = props

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('更新策略')} className="update-strategy-page">
      {
        props.showScanQrCode && (
          <QrCodeSendDialog
            qrCode={props.qrCode}
            scanResult={props.scanResult}
            sendStrategy={() => props.action('send', {stationId: props.stationId})}
            visible={props.showScanQrCode}
            onExited={() => props.updateState({showScanQrCode: false, scanPhase: 0})}
          />
        )
      }
      {
        showTemplateList && (
          <TemplateDialog
            loading={props.templateLoading}
            templateList={props.templateList}
            templateCount={props.templateCount}
            templateQuery={props.templateQuery}
            visible={showTemplateList}
            onExited={() => props.updateState({showTemplateList: false})}
            updateState={props.updateState}
            updateQuery={props.updateQuery}
            action={props.action}
          />
        )
      }
      {
        showCheckResult && (
          <StrategyCheckDialog
            step1Success={props.step1Success}
            step2Success={props.step2Success}
            step3Success={props.step3Success}
            visible={showCheckResult}
            onExited={() => props.updateState({showCheckResult: false})}
          />
        )
      }
      {
        showAddTemplate && (
          <SetTemplateDialog
            visible={showAddTemplate}
            stationId={props.stationId}
            onExited={() => props.updateState({showAddTemplate: false})}
            addTemplateName={props.addTemplateName}
            addTemplateDesc={props.addTemplateDesc}

            updateState={props.updateState}
            updateQuery={props.updateQuery}
            action={props.action}
          />
        )
      }
      {
        showSendResult && (
          <SendResultDialog
            visible={showSendResult}
            onExited={() => props.updateState({showSendResult: false})}
          />
        )
      }
      {
        props.loading && (
          <FullLoading/>
        )
      }
      <FormContainer layout="horizontal" form={props.form} style={{height: '100%', overflow: 'hidden'}}>
        <FullContainer>
          <WithCircleBg radius={5} bottom={10}>
            <div className="d-flex v-center">
              <StrategyNameInput label={utils.intl('策略名称')} name="strategyName"
                                 rules={[{required: true}, inputLengthRule(32)]}
                                 disabled={isPreview}
                                 value={strategyName} onChange={v => props.updateState({strategyName: v})}/>
            </div>
          </WithCircleBg>

          <div className="flex1 d-flex-c common-bg" style={{
            position: 'relative',
            borderRadius: '5px 5px 0 0',
            padding: 10,
            overflow: 'hidden'
          }}>
            <div className="units">
              {units.length == 0 && (<div>{utils.intl('暂无能量单元')}</div>)}
              {
                units.map((unit, index) => {
                  let match = props.energyUnitList.find(item => item.value == unit.unitId)
                  return (
                    <EnergyUnitTab
                      name={`${index}_unit`}
                      onClick={() => onTabChange(index)}
                      showError={(props.updateMode == 'add' && props.touched) || props.updateMode == 'edit'}
                      value={unit}
                      rules={[{validator: checkUnitRule(props.modeList, props.typeList)}]}
                      energyUnitName={match ? match.name : utils.intl('能量单元')}
                      className={classnames({current: index == activeKey})}
                    />
                  )
                })
              }
            </div>
            {
              units.map((unit, index) => {
                let matchMode = props.modeList.find(item => item.value == unit.mode) || {}
                return (
                  <div className={classnames('flex1', {hide: index != activeKey})} style={{overflow: 'auto'}}>
                    {
                      !isPreview && !isManual(matchMode) && (
                        <Auto
                          modeList={props.modeList}
                          typeList={props.typeList}
                          unit={unit}
                          expandList={expandList}
                          useTemplate={useTemplate}
                          open={(index) => props.updateState({expandList: [index]})}
                          close={() => props.updateState({expandList: []})}
                          changeMode={v => changeMode(index, v)}
                          updateUnit={(newUnit) => updateUnit(index, newUnit)}
                          form={props.form}
                        />
                      )
                    }
                    {
                      !isPreview && isManual(matchMode) && (
                        <Manual
                          modeList={props.modeList}
                          typeList={props.typeList}
                          unit={unit}
                          expandList={expandList}
                          useTemplate={useTemplate}
                          open={(index) => props.updateState({expandList: [index]})}
                          close={() => props.updateState({expandList: []})}
                          changeMode={v => changeMode(index, v)}
                          updateUnit={(newUnit) => updateUnit(index, newUnit)}
                          form={props.form}
                        />
                      )
                    }
                    {
                      isPreview && !isManual(matchMode) && (
                        <AutoLook unit={unit} typeList={props.typeList}/>
                      )
                    }
                    {
                      isPreview && isManual(matchMode) && (
                        <ManualLook unit={unit} typeList={props.typeList}/>
                      )
                    }
                    {
                      isPreview && isManual(matchMode) && activeKey == index && (
                        <div style={{padding: '0 10px'}}>
                          {
                            curveList.map(item => {
                              return (
                                <Curve item={item} title={item.title}/>
                              )
                            })
                          }
                        </div>
                      )
                    }
                    {
                      !isPreview && (
                        <div style={{marginTop: 10}}>
                          <a onClick={addAsTemplate}>{utils.intl('设为模板')}</a>
                        </div>
                      )
                    }
                  </div>
                )
              })
            }

            {
              isPreview && step3Success == 1 && (
                <div className="send-strategy">
                  <WankeElectricityOutlined style={{color: '#3d7eff', fontSize: 16, marginRight: 5}}/>
                  <a onClick={showQrCodeInfo}>{utils.intl('策略下发')}</a>
                </div>
              )
            }
          </div>
          {
            !isPreview && (<CancelAndSave onCancel={props.back} onSave={updateStrategy} loading={props.updateLoading}/>)
          }
          {
            isPreview && (<CancelAndUpdate onCancel={props.back} onEdit={toUpdateStrategy}/>)
          }
        </FullContainer>
      </FormContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('fetchStrategyDetail'),
    updateLoading: getLoading('updateStrategy'),
    templateLoading: getLoading('fetchTemplateList')
  }
}

export default makeConnect(optimize_running_update, mapStateToProps)(FormContainer.create<Props>()(UpdateStrategy))

function Curve(props) {
  const {option} = useEchartsOption<CustomChartOption.LineChart>({
    type: 'line',
    colorList,
    showUnit: true,
    data: props.item,
    customOption: {
      grid: {
        left: '30',
        right: '30',
        top: '80',
        bottom: '30'
      },
      title: {
        text: props.title
      },
      xAxis: {
        axisLabel: {}
      }
    }
  })
  return (
    <div style={{height: 300}}>
      <CommonEcharts option={option}/>
    </div>
  )
}