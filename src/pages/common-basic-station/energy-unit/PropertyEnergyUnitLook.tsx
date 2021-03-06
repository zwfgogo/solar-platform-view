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
      props.action('getPrice', { energyUnitId: props.energyUnitId, isFuture: false, modalType: 'all' }) // ??????????????????
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

  //??????????????????
  const statusToEdit = () => {
    setStatusMode('edit')
  }

  //????????????????????????
  const statusToCancel = () => {
    setStatusMode('look')
  }

  //??????????????????
  const statusToSave = () => {
    form.validateFields().then((values) => {
      form.validateFields().then(() => {
        if (!values.productionTime && values.plannedProductionTime < getTargetSystemTime(props.timeZone).format('YYYY-MM-DD HH:mm')) {
          message.error(utils.intl('??????????????????????????????????????????'))
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
    props.action('getPrice', { energyUnitId: props.energyUnitId, isFuture: false, modalType: 'all' }); // ??????????????????
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
          {utils.intl("??????")}
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
            title={`???${modalType === 'cost' ? utils.intl('????????????') : utils.intl('????????????')}${utils.intl('??????')}??? ${utils.intl('??????????????????')}`}
            onCancel={priceCancel}
            footer={false}
            wrapClassName={'priceModal'}
          >
            <TabPriceNew stationId={props.stationId} energyUnitInfo={props.detail} modalType={modalType} onCancel={priceCancel} />
          </Modal>
        }
        <BorderHeader title={utils.intl('????????????')} btnsStyle={{ marginLeft: 8 }}>
          {statusMode === 'look' ?
            <Button
              type="primary"
              onClick={props.toEdit}
              style={{ position: 'absolute', right: 16, top: 20, fontSize: 12 }}
              size="small"
            >
              {utils.intl("??????")}
            </Button> : ''}
          <DetailItem2 label={utils.intl("??????????????????")}>
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
          <BorderHeader title={utils.intl('????????????')} btnsStyle={{ marginLeft: statusMode === 'look' ? 8 : 0 }} style={{ marginTop: '16px' }}>
            {statusMode === 'look' ?
              <>
                <Button
                  onClick={statusToEdit}
                  type="primary"
                  style={{ position: 'absolute', right: 16, top: 20, fontSize: 12 }}
                  size="small"
                >
                  {utils.intl('??????')}
                </Button>
                <DetailItem2 label={utils.intl("??????????????????")}>
                  {props.detail?.energyUnitStatus?.title}
                </DetailItem2>
                <DetailItem2 label={utils.intl("??????????????????")}>
                  {props.detail?.plannedProductionTime ? moment(props.detail?.plannedProductionTime).format('YYYY-MM-DD HH:mm') : ''}
                </DetailItem2>
                <DetailItem2 label={utils.intl("??????????????????")}>
                  {props.detail?.productionTime ? moment(props.detail?.productionTime).format('YYYY-MM-DD HH:mm') : ''}
                </DetailItem2>
                <DetailItem2 label={utils.intl("????????????")} style={{ width: '400px' }}>
                  <Checkbox disabled={true} checked={props.detail?.debug}></Checkbox>
                  {props.detail?.debug &&
                    <span style={{ color: props.theme === 'dark-theme' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(5, 10, 25, 0.45)', marginLeft: 24 }}>
                      {utils.intl("????????????")}???
                      <span>{props.detail?.debugStartTime}</span>
                    </span>
                  }
                </DetailItem2>
                {props.debugLogs && props.debugLogs.length > 0 &&
                  <span style={{ color: '#3D7EFF', cursor: 'pointer' }} onClick={() => { setCommissioningRecordModal(true) }}>{utils.intl("????????????")} <WankeCircleRightOutlined style={{ float: 'right', marginTop: 4, marginLeft: 4 }} /></span>
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
                    {utils.intl('??????')}
                  </Button>
                  <Button
                    onClick={statusToCancel}
                    style={{ marginLeft: 8, fontSize: 12 }}
                    size="small"
                  >
                    {utils.intl('??????')}
                  </Button>
                </div>
                <FormContainer initialValues={{
                  debug: [props.detail?.debug + ''],
                }} form={form} className="flex-wrap">
                  <SelectItem
                    label={utils.intl("??????????????????")}
                    //  disabled={props.mode !== Mode.add ? false : true}
                    rules={[{ required: true }]}
                    dataSource={options.length > 0 ? options : props.energyUnitStatusOptions}
                    value={value}
                    name={'energyUnitStatus'}
                  />
                  <DateItem
                    label={utils.intl("??????????????????")}
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
                    label={utils.intl("??????????????????")}
                    disabled={true}
                    name={''}
                    value={props.detail?.productionTime ? moment(props.detail?.productionTime) : undefined}
                    showTime={{ format: 'HH:mm' }}
                    format={'YYYY-MM-DD HH:mm'}
                  />
                  <Form.Item name="debug" label={utils.intl("????????????")} style={{ marginLeft: 15 }}>
                    <Checkbox.Group value={[props.detail?.debug + '']}>
                      <Checkbox value={'true'}></Checkbox>
                    </Checkbox.Group>
                  </Form.Item>
                </FormContainer>
              </>
            }
          </BorderHeader>
        }
        <BorderHeader title={utils.intl('????????????')} style={{ marginTop: '16px' }}>
          <>
            {isExit_Cost && props.text_Cost ?
              <PriceLook
                price={props.price_Cost} // ????????????
                priceTitle={props.text_Cost} // ????????????
                priceTypeTitle={utils.intl("????????????")} // ??????????????????
                extraTitle={`${utils.intl('??????????????????')}>`}
                maps={{
                  multipleTypeMap: props.multipleTypeMap,
                  realTimePriceMap: props.realTimePriceMap_Cost
                }}
                onExtraTitleClick={() => addPrice("cost")}
              />
              // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
              //   <label className={'priceLabel'}>{utils.intl("????????????")}???</label>
              //   <div className={'priceDiv'} onClick={() => addPrice("cost")}>
              //     <span>{props.text_Cost}<WankeCircleRightOutlined style={{ position: "absolute", right: 16, top: 16 }} /></span>
              //   </div>
              // </div>
              :
              isExit_Cost ?
                <Button icon={<PlusOutlined />} style={{ color: "#3D7EFF", border: "1px solid #3D7EFF", marginBottom: 16 }} onClick={() => addPrice("cost")}>{utils.intl("??????????????????")}</Button>
                // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
                //   <label className={'priceLabel'}>{utils.intl("????????????")}???</label>
                //   <PlusCircleOutlined onClick={() => addPrice("cost")} style={{ color: "#3D7EFF" }} />
                // </div>
                : null
            }
            {isExit_Generate && props.text_Generate ?
              <PriceLook
                price={props.price_Generate} // ????????????
                priceTitle={props.text_Generate} // ????????????
                priceTypeTitle={utils.intl("????????????")} // ??????????????????
                extraTitle={`${utils.intl('??????????????????')}>`}
                maps={{
                  multipleTypeMap: props.multipleTypeMap,
                  realTimePriceMap: props.realTimePriceMap_Generate
                }}
                onExtraTitleClick={() => addPrice("generation")}
              />
              // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
              //   <label className={'priceLabel'}>{utils.intl("????????????")}???</label>
              //   <div className={'priceDiv'} onClick={() => addPrice("generation")}>
              //     <span>{props.text_Generate} <WankeCircleRightOutlined style={{ position: "absolute", right: 16, top: 16 }} /></span>
              //   </div>
              // </div>
              :
              isExit_Generate ?
                <Button icon={<PlusOutlined />} style={{ color: "#3D7EFF", border: "1px solid #3D7EFF", marginLeft: props.text_Cost ? 0 : 16, marginBottom: 16 }} onClick={() => addPrice("generation")}>{utils.intl("??????????????????")}</Button>
                // <div style={{ width: 315, marginRight: 15, cursor: 'pointer' }}>
                //   <label className={'priceLabel'}>{utils.intl("????????????")}???</label>
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
