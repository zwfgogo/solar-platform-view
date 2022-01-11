import React, { useEffect, useState } from 'react'
import { Model } from '../station-update/input-type/TypeManager'
import TypeManagerLook from '../station-update/input-type/TypeManagerLook'
import DetailItem2 from '../../../components/layout/DetailItem2'
import { ValueName } from '../../../interfaces/CommonInterface'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { handleModelDetail } from '../station.helper'
import FullContainer from '../../../components/layout/FullContainer'
import utils from '../../../public/js/utils'
import BorderHeader from '../../../components/BorderHeader'
import { Button, Checkbox, DateItem, Form, FormContainer, message, Modal, SelectItem } from 'wanke-gui'
import { PlusCircleOutlined, PlusOutlined, WankeCircleRightOutlined } from 'wanke-icon'
import TabPriceNew from '../station-update/TabPriceNew'
import '../station-update/styles/energyUnit-look.less'
import CommissioningRecord from '../station-update/CommissioningRecord'
import moment, { Moment } from 'moment'
import { isSmallThanToday, getTargetSystemTime } from '../../../util/dateUtil'
import { range0 } from '../../page.helper'
import { energyUnitTypeName_Cost, energyUnitTypeName_Generate } from 'umi'
import PriceLook from '../station-update/PriceLook'

interface Props extends ActionProp {
  energyUnitId: number
  energyType: number
  energyModels: Model[]
  energyUnitTypes: ValueName[]
  detail: any
  toEdit: () => void
  stationId: any
  energyUnitStatusOptions: any
  energyUnitStatusMap: any
  onAdd: (values) => void
  timeZone: string
  getDeviceDebugLoading: boolean
  debugLogs: any[]
  theme: any;
}

const PropertyEnergyUnitLook: React.FC<Props> = function (this: null, props) {
  const [havePrice, setHavePrice] = useState(true)
  const [pricePage, setPricePage] = useState(false)
  const [commissioningRecordModal, setCommissioningRecordModal] = useState(false)
  const [statusMode, setStatusMode] = useState('look')
  const [modalType, setModalType] = useState(null)
  const [nowDetail, setNowDetail] = useState(props.detail)

  useEffect(() => {
    if (props.energyUnitId && props.energyType) {
      props.action('fetchEnergyUnitModel', { modelTypeId: props.energyType, modId: props.energyUnitId })
      props.action('getPrice', { energyUnitId: props.energyUnitId, isFuture: false, modalType: 'all' }) // 获取当前电价
    }
  }, [props.energyUnitId, props.energyType])

  useEffect(() => {
    if (props.detail !== nowDetail) {
      props.action('getDeviceDebug', { deviceId: props.detail.id })
    }
  }, [props.detail])

  let detail = handleModelDetail(props.energyModels, props.detail)
  let customPropertyDetail = handleModelDetail(props.energyModels, props.detail?.properties)
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.detail) {
      setStatusMode('look')
    }
  }, [props.detail])


  const addPrice = (type: "cost" | "generation") => {
    setPricePage(true)
    setModalType(type)
  }

  //状态信息编辑
  const statusToEdit = () => {
    setStatusMode('edit')
  }

  //状态信息取消编辑
  const statusToCancel = () => {
    setStatusMode('look')
  }

  //状态信息保存
  const statusToSave = () => {
    form.validateFields().then((values) => {
      form.validateFields().then(() => {
        if (!values.productionTime && values.plannedProductionTime < getTargetSystemTime(props.timeZone).format('YYYY-MM-DD HH:mm')) {
          message.error(utils.intl('计划投产时间必须大于当前时间'))
        } else {
          setStatusMode('look')
          props.onAdd({
            // ...values1,
            ...props.detail,
            ...values,
            debug: values.debug?.length && values.debug[0] === 'true' ? true : false,
            plannedProductionTime: values.plannedProductionTime.format('YYYY-MM-DD HH:mm:ss'),
            energyUnitStatus: { id: values.energyUnitStatus },
          })
        }
      })
    })
  }

  const disabledTime = (date: Moment) => {
    if (!date) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => []
      }
    }
    let current = getTargetSystemTime(props.timeZone)
    if (date.isSame(current, 'day')) {
      return {
        disabledHours: () => range0(current.hours()),
        disabledMinutes: (hour) => {
          if (hour == current.hours()) {
            return range0(current.minutes())
          }
          return []
        }
      }
    } else {
      return {
        disabledHours: () => [],
        disabledMinutes: () => []
      }
    }
  }

  const priceCancel = () => {
    setPricePage(false);
    props.action('getPrice', { energyUnitId: props.energyUnitId, isFuture: false, modalType: 'all' }); // 获取当前电价
  }
  let value = null
  let match = props.energyUnitStatusOptions.find(o => o.value === props.detail?.energyUnitStatus?.id)
  const options = props.energyUnitStatusMap[props.detail?.energyUnitStatus?.id]?.options || []
  if (match) {
    value = match.value
  }

  const isExit_Generate = energyUnitTypeName_Generate.indexOf(props.detail.energyUnitType?.name) > -1
  const isExit_Cost = energyUnitTypeName_Cost.indexOf(props.detail.energyUnitType?.name) > -1

  // console.log('energyUnitTypeName_Generate', energyUnitTypeName_Generate, props.detail)

  let showStatus = true;
  if (props.energyUnitTypes.find(item => item.englishName === 'Load')?.value === props.energyType) {
    showStatus = false
  }

  return (
    <FullContainer>
      {/* <CrumbsPortal pageName='stationUpdate'>
        <Button
          type="primary"
          onClick={props.toEdit}
          style={{ marginLeft: '16px' }}
        >
          {utils.intl("编辑")}
        </Button>
      </CrumbsPortal> */}
      <div className="energyUnit-look flex1" style={{ overflowY: 'auto' }}>
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
            title={`【${modalType === 'cost' ? utils.intl('购电电价') : utils.intl('售电电价')}${utils.intl('维护')}】 ${utils.intl('计划执行电价')}`}
            onCancel={priceCancel}
            footer={false}
            wrapClassName={'priceModal'}
          >
            <TabPriceNew stationId={props.stationId} energyUnitInfo={props.detail} modalType={modalType} onCancel={priceCancel} />
          </Modal>
        }
        <BorderHeader title={utils.intl('基本信息')} btnsStyle={{ marginLeft: 8 }}>
          {statusMode === 'look' ?
            <Button
              type="primary"
              onClick={props.toEdit}
              style={{ position: 'absolute', right: 16, top: 20, fontSize: 12 }}
              size="small"
            >
              {utils.intl("编辑")}
            </Button> : ''}
          <DetailItem2 label={utils.intl("能量单元类型")}>
            {props.energyUnitTypes.find((item) => item.value == props.detail?.energyUnitType?.id)?.name}
          </DetailItem2>
          {
            props.energyModels.map(model => {
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
                  key={model.id}
                  detail={detail}
                  model={model}
                />
              )
            })
          }
        </BorderHeader>
        {showStatus &&
          <BorderHeader title={utils.intl('状态信息')} btnsStyle={{ marginLeft: statusMode === 'look' ? 8 : 0 }} style={{ marginTop: '16px' }}>
            {statusMode === 'look' ?
              <>
                <Button
                  onClick={statusToEdit}
                  type="primary"
                  style={{ position: 'absolute', right: 16, top: 20, fontSize: 12 }}
                  size="small"
                >
                  {utils.intl('编辑')}
                </Button>
                <DetailItem2 label={utils.intl("能量单元状态")}>
                  {props.detail?.energyUnitStatus?.title}
                </DetailItem2>
                <DetailItem2 label={utils.intl("计划投产时间")}>
                  {props.detail?.plannedProductionTime ? moment(props.detail?.plannedProductionTime).format('YYYY-MM-DD HH:mm') : ''}
                </DetailItem2>
                <DetailItem2 label={utils.intl("实际投产时间")}>
                  {props.detail?.productionTime ? moment(props.detail?.productionTime).format('YYYY-MM-DD HH:mm') : ''}
                </DetailItem2>
                <DetailItem2 label={utils.intl("调试标志")} style={{ width: '400px' }}>
                  <Checkbox disabled={true} checked={props.detail?.debug}></Checkbox>
                  {props.detail?.debug &&
                    <span style={{ color: props.theme === 'dark-theme' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(5, 10, 25, 0.45)', marginLeft: 24 }}>
                      {utils.intl("开始时间")}：
                      <span>{props.detail?.debugStartTime}</span>
                    </span>
                  }
                </DetailItem2>
                {props.debugLogs && props.debugLogs.length > 0 &&
                  <span style={{ color: '#3D7EFF', cursor: 'pointer' }} onClick={() => { setCommissioningRecordModal(true) }}>{utils.intl("调试记录")} <WankeCircleRightOutlined style={{ float: 'right', marginTop: 4, marginLeft: 4 }} /></span>
                }
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
                    label={utils.intl("能量单元状态")}
                    //  disabled={props.mode !== Mode.add ? false : true}
                    rules={[{ required: true }]}
                    dataSource={options.length > 0 ? options : props.energyUnitStatusOptions}
                    value={value}
                    name={'energyUnitStatus'}
                  />
                  <DateItem
                    label={utils.intl("计划投产时间")}
                    rules={[{ required: true }]}
                    disabled={match?.code === 1 ? true : false}
                    name={'plannedProductionTime'}
                    value={props.detail?.plannedProductionTime ? moment(props.detail?.plannedProductionTime) : undefined}
                    showTime={{ format: 'HH:mm' }}
                    disabledDate={current => isSmallThanToday(current, props.timeZone)}
                    disabledTime={disabledTime}
                    format={'YYYY-MM-DD HH:mm'}
                  />
                  <DateItem
                    label={utils.intl("实际投产时间")}
                    disabled={true}
                    name={''}
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
        }
        <BorderHeader title={utils.intl('电价信息')} style={{ marginTop: '16px' }}>
          <>
            {isExit_Cost && props.text_Cost ?
              <PriceLook
                price={props.price_Cost} // 电价对象
                priceTitle={props.text_Cost} // 电价名称
                priceTypeTitle={utils.intl("购电电价")} // 电价类型名称
                extraTitle={`${utils.intl('查看计划电价')}>`}
                maps={{
                  multipleTypeMap: props.multipleTypeMap,
                  realTimePriceMap: props.realTimePriceMap_Cost
                }}
                onExtraTitleClick={() => addPrice("cost")}
              />
              // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
              //   <label className={'priceLabel'}>{utils.intl("购电电价")}：</label>
              //   <div className={'priceDiv'} onClick={() => addPrice("cost")}>
              //     <span>{props.text_Cost}<WankeCircleRightOutlined style={{ position: "absolute", right: 16, top: 16 }} /></span>
              //   </div>
              // </div>
              :
              isExit_Cost ?
                <Button icon={<PlusOutlined />} style={{ color: "#3D7EFF", border: "1px solid #3D7EFF", marginBottom: 16 }} onClick={() => addPrice("cost")}>{utils.intl("添加购电电价")}</Button>
                // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
                //   <label className={'priceLabel'}>{utils.intl("购电电价")}：</label>
                //   <PlusCircleOutlined onClick={() => addPrice("cost")} style={{ color: "#3D7EFF" }} />
                // </div>
                : null
            }
            {isExit_Generate && props.text_Generate ?
              <PriceLook
                price={props.price_Generate} // 电价对象
                priceTitle={props.text_Generate} // 电价名称
                priceTypeTitle={utils.intl("售电电价")} // 电价类型名称
                extraTitle={`${utils.intl('查看计划电价')}>`}
                maps={{
                  multipleTypeMap: props.multipleTypeMap,
                  realTimePriceMap: props.realTimePriceMap_Generate
                }}
                onExtraTitleClick={() => addPrice("generation")}
              />
              // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
              //   <label className={'priceLabel'}>{utils.intl("售电电价")}：</label>
              //   <div className={'priceDiv'} onClick={() => addPrice("generation")}>
              //     <span>{props.text_Generate} <WankeCircleRightOutlined style={{ position: "absolute", right: 16, top: 16 }} /></span>
              //   </div>
              // </div>
              :
              isExit_Generate ?
                <Button icon={<PlusOutlined />} style={{ color: "#3D7EFF", border: "1px solid #3D7EFF", marginLeft: props.text_Cost ? 0 : 16, marginBottom: 16 }} onClick={() => addPrice("generation")}>{utils.intl("添加售电电价")}</Button>
                // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
                //   <label className={'priceLabel'}>{utils.intl("售电电价")}：</label>
                //   <PlusCircleOutlined onClick={() => addPrice("generation")} style={{ color: "#3D7EFF" }} />
                // </div>
                : null
            }
          </>
        </BorderHeader>
      </div>
    </FullContainer >
  )
}

export default PropertyEnergyUnitLook
