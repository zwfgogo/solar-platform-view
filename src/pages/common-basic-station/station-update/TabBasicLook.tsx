import React, { useState, useRef, useEffect } from 'react'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import DetailItem2 from '../../../components/layout/DetailItem2'
import TypeManagerLook from './input-type/TypeManagerLook'
import { Model } from './input-type/TypeManager'
import { __temporaryStationModelLogic, handleModelValues } from '../station.helper'
import { Button, Checkbox, DateItem, Form, FormContainer, FullLoading, Modal, Select, SelectItem } from 'wanke-gui'
import utils from '../../../public/js/utils'
import { Mode, stationUpdateNS } from '../../constants'
import { makeConnect } from '../../umi.helper'
import './styles/tab-basic-look.less'
import BorderHeader from '../../../components/BorderHeader'
import { PlusCircleOutlined, PlusOutlined, WankeCircleRightOutlined } from 'wanke-icon'
import TabPriceNew from './TabPriceNew'
import moment, { Moment } from 'moment'
import CommissioningRecord from './CommissioningRecord'
import { getTargetSystemTime, isSmallThanToday } from '../../../util/dateUtil'
import { range0 } from '../../page.helper'
import PriceLook from './PriceLook'

//电站基本信息页签查看
interface Props extends ActionProp {
  detail: any
  stationModels: Model[]
  stationType: number
  scenariosList: any[]
  toEdit: () => void
  onDelete: () => void
  treeLoading: any
  stationId: any
  mode: any
  stationStatusOptions: any
  stationStatusMap: any
  operatorList: any
  timeZone: string
  getDeviceDebugLoading: boolean
  debugLogs: any[]
  stationRecord: any
}

const TabBasicLook: React.FC<Props> = function (this: null, props) {
  let detail = handleModelValues(props.stationModels, props.detail)
  let customPropertyDetail = handleModelValues(props.stationModels, props.detail?.properties)
  const [loading, setLoading] = useState(true)
  const end = () => {
    setLoading(false)
  }
  const [mode, setMode] = useState(props.mode)

  const [statusMode, setStatusMode] = useState('look')
  const [operatorMode, setOperatorMode] = useState('look')
  const [havePrice, setHavePrice] = useState(props.detail?.costPrice && props.detail?.costPrice.length && props.detail?.generationPrice && props.detail?.generationPrice.length)
  const [pricePage, setPricePage] = useState(false)
  const [operatorValue, setOperatorValue] = useState(props.detail.operator?.id)
  const detailValueRef = useRef({ operatorValue: props.detail.operator?.id })

  const [commissioningRecordModal, setCommissioningRecordModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [form] = Form.useForm();

  let isOperator: any = JSON.parse(sessionStorage.getItem('userInfo')).firm.firmType.name === 'Operator';

  useEffect(() => {
    props.action('fetchOperatorList')
    props.action('getPriceMap')
  }, [])

  useEffect(() => {
    if (props.stationType) {
      // props.action('fetchEnergyUnitType', { stationTypeId: props.stationType })
      props.action('fetchStationModel', { modelTypeId: props.stationType, modId: mode == Mode.add ? null : props.stationId })
    }
  }, [props.stationType])

  useEffect(() => {
    if (props.detail) {
      setOperatorValue(props.detail.operator?.id)
      setHavePrice(props.detail?.costPrice && props.detail?.costPrice.length && props.detail?.generationPrice && props.detail?.generationPrice.length)
    }
  }, [props.detail])

  useEffect(() => {
    props.action('getPrice', { stationId: props.stationId, isFuture: false, modalType: 'all' }) // 获取当前电价
    // props.action('getPrice', { stationId: props.stationId, isFuture: false, modalType: 'generation' }) // 获取当前电价
  }, [props.stationId]);

  //运营商编辑
  const operatorEdit = () => {
    detailValueRef.current.operatorValue = operatorValue
    setOperatorMode('edit')
  }

  //状态信息编辑
  const statusToEdit = () => {
    setStatusMode('edit')
  }

  //运营商取消编辑
  const operatorCancel = () => {
    setOperatorMode('look')
    setOperatorValue(detailValueRef.current.operatorValue)
  }

  //状态信息取消编辑
  const statusToCancel = () => {
    form.resetFields()
    setStatusMode('look')
  }

  //运营商保存
  const operatorSave = () => {
    props.action('updateStation', {
      ...props.detail,
      stationId: props.stationId,
      operator: { id: operatorValue }
    });
    setOperatorMode('look')
  }

  //状态信息保存
  const statusToSave = () => {
    form.validateFields().then((values) => {
      props.action('updateStation', {
        ...props.detail,
        ...values,
        stationId: props.stationId,
        stationStatus: { id: values.stationStatus },
        operator: { id: operatorValue },
        debug: values.debug?.length && values.debug[0] === 'true' ? true : false,
      });
    })
    setStatusMode('look')
  }

  const addPrice = (type: "cost" | "generation") => {
    setPricePage(true)
    setModalType(type)
  }

  const priceCancel = () => {
    setPricePage(false);
    props.action('getPrice', { stationId: props.stationId, isFuture: false, modalType: 'all' }) // 获取当前电价
  }

  const operatorChange = (o) => {
    setOperatorValue(o)
  }


  let value = null
  let match = props.stationStatusOptions.find(o => o.value === props.detail?.stationStatus?.id)
  const options = props.stationStatusMap[props.detail?.stationStatus?.id]?.options || []
  if (match) {
    value = match.value
  }

  return (
    <>
      {/* <CrumbsPortal pageName='stationUpdate'>
        <Button onClick={props.toEdit} type="primary" style={{ marginLeft: '16px' }}>
          {utils.intl('编辑')}
        </Button>
      </CrumbsPortal> */}
      <div className="flex-wrap basic-look-page" style={{ width: '100%' }}>
        {commissioningRecordModal &&
          <CommissioningRecord
            cancel={() => { setCommissioningRecordModal(false) }}
            visible={commissioningRecordModal}
            action={props.action}
            deviceId={props?.detail?.id}
            getDeviceDebugLoading={props.getDeviceDebugLoading}
            debugLogs={props.debugLogs}
          />
        }
        {pricePage &&
          <Modal centered
            bodyStyle={{ color: 'black' }}
            width={1000} visible={pricePage}
            title={`【${modalType === 'cost' ? utils.intl('用电电价') : utils.intl('上网电价')}${utils.intl('维护')}】 ${utils.intl('计划执行电价')}`}
            onCancel={priceCancel}
            footer={false}
            wrapClassName={'priceModal'}
          >
            <TabPriceNew stationId={props.stationId} modalType={modalType} onCancel={priceCancel} />
          </Modal>
        }
        {operatorMode === 'look' ?
          <div style={{ width: '100%', marginBottom: 6 }}>
            <DetailItem2 labelStyle={{ width: 'auto' }} style={{ minHeight: 0 }} label={utils.intl("电站运营商")}>{props.detail.operator?.title}</DetailItem2>
            {!isOperator && statusMode !== 'edit' ?
              <Button
                onClick={operatorEdit}
                type="primary"
                style={{ float: 'right', fontSize: 12 }}
                size="small"
              >
                {utils.intl('编辑')}
              </Button> : ''}
          </div>
          :
          <div style={{ width: '100%', marginBottom: 16 }}>
            <div style={{ width: 450, display: 'inline-block' }}>
              <Select
                label={utils.intl("电站运营商") + '：'}
                dataSource={props.operatorList}
                value={operatorValue}
                style={{ width: 205 }}
                onSelect={operatorChange}
              />
            </div>
            <div style={{ float: 'right' }}>
              <Button
                onClick={operatorSave}
                type="primary"
                style={{ fontSize: 12 }}
                size="small"
              >
                {utils.intl('保存')}
              </Button>
              <Button
                onClick={operatorCancel}
                style={{ marginLeft: 8, fontSize: 12 }}
                size="small"
              >
                {utils.intl('取消')}
              </Button>
            </div>
          </div>
        }
        <BorderHeader title={utils.intl('基本信息')} btnsStyle={{ width: '75%', marginLeft: 8 }} >
          {statusMode !== 'edit' && operatorMode !== 'edit' &&
            <Button
              onClick={props.toEdit}
              type="primary"
              style={{ position: 'absolute', right: 16, top: 20, fontSize: 12 }}
              size="small"
            >
              {utils.intl('编辑')}
            </Button>
          }
          <DetailItem2 label={utils.intl("电站类型")}>{props.detail.stationType?.title}</DetailItem2>
          {
            __temporaryStationModelLogic(props.stationModels, Mode.look).map(model => {
              const type = model.dataType?.name
              if (model.name === 'scenariosList') {
                return (
                  <DetailItem2 label={utils.intl("应用场景")}>
                    {props.detail.scenariosList && props.detail.scenariosList.length ?
                      props.detail.scenariosList.map(item => item.title).join()
                      : null}
                  </DetailItem2>
                )
              }
              if (type == 'image') {
                return (
                  <div key={model.name} style={{ width: 200, height: 200, position: 'absolute', right: 150, top: 30 }}>
                    {detail[model.name]?.[0]?.data && loading && <FullLoading />}
                    {detail[model.name]?.[0]?.data ?
                      <img src={detail[model.name]?.[0]?.data} style={{ maxHeight: '100%', maxWidth: '100%' }} onLoad={end} onError={end} />
                      : ''}
                  </div>
                )
              }
              if (model.type == 4) {
                return (
                  <TypeManagerLook
                    key={model.name}
                    detail={customPropertyDetail}
                    model={model}
                  />
                )
              }
              return (
                <TypeManagerLook
                  key={model.name}
                  detail={detail}
                  model={model}
                />
              )
            })
          }
        </BorderHeader>
        <BorderHeader title={utils.intl('状态信息')} btnsStyle={{ marginLeft: statusMode === 'look' ? 8 : 0 }} style={{ marginTop: '16px' }}>
          {statusMode === 'look' ?
            <>
              {operatorMode !== 'edit' ?
                <Button
                  onClick={statusToEdit}
                  type="primary"
                  style={{ position: 'absolute', right: 16, top: 20, fontSize: 12 }}
                  size="small"
                >
                  {utils.intl('编辑')}
                </Button> : ''}
              <DetailItem2 label={utils.intl("电站状态")}>
                {props.detail?.stationStatus?.title}
              </DetailItem2>
              <DetailItem2 label={utils.intl("投产时间")}>
                {props.detail?.productionTime ? moment(props.detail?.productionTime).format('YYYY-MM-DD HH:mm') : ''}
              </DetailItem2>
              <DetailItem2 label={utils.intl("调试标志")} style={{ width: '400px' }}>
                <Checkbox disabled={true} checked={props.detail?.debug}></Checkbox>
              </DetailItem2>
            </>
            :
            <>
              <div style={{ position: 'absolute', right: 16, top: 20 }}>
                <Button
                  onClick={statusToSave}
                  type="primary"
                  style={{ fontSize: 12 }}
                  size="small"
                >
                  {utils.intl('保存')}
                </Button>
                <Button
                  onClick={statusToCancel}
                  style={{ marginLeft: 8, fontSize: 12 }}
                  size="small"
                >
                  {utils.intl('取消')}
                </Button>
              </div>
              <FormContainer initialValues={{
                debug: [props.detail?.debug + ''],
              }} form={form} className="flex-wrap">
                <SelectItem
                  label={utils.intl("电站状态")}
                  disabled={!props.stationRecord?.stationStatusUpdate}
                  rules={[{ required: true }]}
                  dataSource={options}
                  value={value}
                  name={'stationStatus'}
                />
                <DateItem
                  label={utils.intl("投产时间")}
                  disabled={true}
                  value={props.detail?.productionTime ? moment(props.detail?.productionTime) : undefined}
                  showTime={{ format: 'HH:mm' }}
                  format={'YYYY-MM-DD HH:mm'}
                />
                <Form.Item name="debug" label={utils.intl("调试标志")} style={{ marginLeft: 15 }}>
                  <Checkbox.Group value={[props.detail?.debug + '']}>
                    <Checkbox value={'true'}></Checkbox>
                  </Checkbox.Group>
                </Form.Item>
              </FormContainer>
            </>
          }
        </BorderHeader>
        <BorderHeader title={utils.intl('电价信息')} style={{ marginTop: '16px' }} btnsStyle={{ display: "block", marginTop: 12 }}>
          <>
            {props.text_Cost ?
              <PriceLook
                price={props.price_Cost} // 电价对象
                priceTitle={props.text_Cost} // 电价名称
                priceTypeTitle={utils.intl("用电电价")} // 电价类型名称
                extraTitle={`${utils.intl('查看计划电价')}>`}
                maps={{
                  multipleTypeMap: props.multipleTypeMap,
                  realTimePriceMap: props.realTimePriceMap_Cost
                }}
                onExtraTitleClick={() => addPrice("cost")}
              />
              // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
              //   <label className={'priceLabel'}>{utils.intl("用电电价")}：</label>
              //   <div className={'priceDiv'} onClick={() => addPrice("cost")}>
              //     <span>{props.text_Cost}<WankeCircleRightOutlined style={{ position: "absolute", right: 16, top: 16 }} /></span>
              //   </div>
              // </div>
              :
              <Button icon={<PlusOutlined />} style={{ color: "#3D7EFF", border: "1px solid #3D7EFF", marginBottom: 16 }} onClick={() => addPrice("cost")}>{utils.intl("添加用电电价")}</Button>
              // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
              //   <label className={'priceLabel'}>{utils.intl("用电电价")}：</label>
              //   <PlusCircleOutlined onClick={() => addPrice("cost")} style={{ color: "#3D7EFF" }} />
              // </div>
            }
            {props.text_Generate ?
              <PriceLook
                price={props.price_Generate} // 电价对象
                priceTitle={props.text_Generate} // 电价名称
                priceTypeTitle={utils.intl("上网电价")} // 电价类型名称
                extraTitle={`${utils.intl('查看计划电价')}>`}
                maps={{
                  multipleTypeMap: props.multipleTypeMap,
                  realTimePriceMap: props.realTimePriceMap_Generate
                }}
                onExtraTitleClick={() => addPrice("generation")}
              />
              // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
              //   <label className={'priceLabel'}>{utils.intl("上网电价")}：</label>
              //   <div className={'priceDiv'} onClick={() => addPrice("generation")}>
              //     <span>{props.text_Generate} <WankeCircleRightOutlined style={{ position: "absolute", right: 16, top: 16 }} /></span>
              //   </div>
              // </div>
              :
              <Button icon={<PlusOutlined />} style={{ color: "#3D7EFF", border: "1px solid #3D7EFF", marginLeft: props.text_Cost ? 0 : 16, marginBottom: 16 }} onClick={() => addPrice("generation")}>{utils.intl("添加上网电价")}</Button>
              // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
              //   <label className={'priceLabel'}>{utils.intl("上网电价")}：</label>
              //   <PlusCircleOutlined onClick={() => addPrice("generation")} style={{ color: "#3D7EFF" }} />
              // </div>
            }
          </>
        </BorderHeader>
      </div>
    </>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    treeLoading: getLoading('fetchEnergyUnitTree'),
  }
}

export default makeConnect(stationUpdateNS, mapStateToProps)(TabBasicLook)
