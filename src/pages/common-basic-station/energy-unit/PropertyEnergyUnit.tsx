import React, { useEffect, useState } from 'react'
import { Button, message, Form, DateItem, Checkbox, Modal } from 'wanke-gui'
import { FormContainer } from '../../../components/input-item/InputItem'
import FullContainer from '../../../components/layout/FullContainer'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { Mode } from '../../constants'
import {
  __temporaryEnergyModelLogic,
  getFormatDateStr,
  handleModelAreaValues,
  handleModelValue
} from '../station.helper'
import TypeManager, { Model } from '../station-update/input-type/TypeManager'
import SelectItem from '../../../components/input-item/SelectItem'
import { ValueName } from '../../../interfaces/CommonInterface'
import TypeManagerLook from '../station-update/input-type/TypeManagerLook'
import DetailItem2 from '../../../components/layout/DetailItem2'
import { getBool, range0 } from '../../page.helper'
import { isSmallThanToday, getTargetSystemTime } from '../../../util/dateUtil'
import { Moment } from 'moment'
import utils from '../../../public/js/utils'
import BorderHeader from '../../../components/BorderHeader'
import { PlusCircleOutlined, PlusOutlined, WankeCircleRightOutlined } from 'wanke-icon'
import '../station-update/styles/energyUnit.less'
import moment from 'moment'
import CommissioningRecord from '../station-update/CommissioningRecord'
import { energyUnitTypeName_Cost, energyUnitTypeName_Generate } from '../models/station-update'
import TabPriceNew from '../station-update/TabPriceNew'
import PriceLook from '../station-update/PriceLook'

interface Props extends ActionProp {
  mode: Mode
  energyUnitId: number
  energyModels: Model[]
  energyType: number
  energyUnitTypes: ValueName[]
  detail: any
  provinceOptions: ValueName[]
  cityOptions: ValueName[]
  districtOptions: ValueName[]
  toMapSelect: (latitude, longitude, onSuccess: ({ lat, lng }) => void) => void
  cancelUpdate: () => void
  onAdd: (values) => void
  loading: boolean
  timeZone: string
  stationId: any
  energyUnitStatusOptions: any
  getDeviceDebugLoading: boolean
  debugLogs: any[]
  theme: any
}

const PropertyEnergyUnit: React.FC<Props> = function (this: null, props) {
  const [values, setValues] = useState({})
  const [commissioningRecordModal, setCommissioningRecordModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [pricePage, setPricePage] = useState(false)
  const [form] = Form.useForm()

  const handleValues = (obj) => {
    setValues({ ...values, ...obj })
  }

  const getTitle = (value, options) => {
    return options.find(item => item.value == value)?.name || ''
  }

  const handleValueItem = (model, results) => {
    const name = model.name
    const type = model.dataType?.name
    const timeAccuracy = model.timeAccuracy?.name
    if (type == 'enum') {
      results[name] = model.enumValues.find(option => option.name == values[name])
    } else if (type == 'date') {
      results[name] = getFormatDateStr(values[name], timeAccuracy)
    } else if (type == 'bool') {
      results[name] = values[name] == 1
    } else if (type == 'area') {
      results.province = { id: values[name].provinceId, title: getTitle(values[name].provinceId, props.provinceOptions) }
      results.city = { id: values[name].cityId, title: getTitle(values[name].cityId, props.cityOptions) }
      results.district = { id: values[name].districtId, title: getTitle(values[name].districtId, props.districtOptions) }
    } else {
      results[name] = values[name]
    }
  }

  const addPrice = (type: "cost" | "generation") => {
    setPricePage(true)
    setModalType(type)
  }

  const priceCancel = () => {
    setPricePage(false)
    props.action('getPrice', { energyUnitId: props.energyUnitId, isFuture: false, modalType: 'all' }); // 获取当前电价
  }

  const handleEnergyModelValues = (models: Model[], detail) => {
    let values = {}
    models.forEach(model => {
      const type = model.type
      let dataType = model.dataType?.name
      const name = model.name
      if (type == 4) {
        if (dataType == 'area') {
          values[name] = handleModelValue(model, detail?.properties)
        } else {
          values[name] = handleModelValue(model, detail?.properties?.[name])
        }
      } else if (dataType == 'area') {
        values[name] = handleModelAreaValues(detail)
      } else {
        values[name] = handleModelValue(model, detail[name])
      }
    })
    return values
  }

  const onSave = () => {
    form.validateFields().then((val) => {
      let values1: Record<string, any> = {}
      let properties: Record<string, any> = {}
      props.energyModels.forEach(item => {
        if (item.type == 4) {
          handleValueItem(item, properties)
        } else {
          handleValueItem(item, values1)
        }
      })
      if (!values1.productionTime && values1.plannedProductionTime < getTargetSystemTime(props.timeZone).format('YYYY-MM-DD HH:mm')) {
        message.error(utils.intl('计划投产时间必须大于当前时间'))
      } else {
        if (props.mode == Mode.update) {
          props.onAdd({
            ...props.detail,
            ...values1,
          })
        } else {
          props.onAdd({
            ...props.detail,
            ...values1,
            properties: properties,
            energyUnitStatus: { id: val.energyUnitStatus },
            energyUnitType: { id: props.energyType },
            debug: val.debug?.length && val.debug[0] === 'true' ? true : false,
            plannedProductionTime: val?.plannedProductionTime?.format('YYYY-MM-DD HH:mm:00')
          })
        }
      }
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

  useEffect(() => {
    if (props.energyType) {
      props.action('fetchEnergyUnitModel', { modelTypeId: props.energyType, modId: props.mode == Mode.update ? props.energyUnitId : null })
      props.action('fetchStationBasicRes', { stationId: props.stationId }).then(res => {
        form.setFieldsValue({ debug: [res.debug + ''] })
      })
    }
  }, [props.energyType])

  useEffect(() => {
    setValues(handleEnergyModelValues(props.energyModels, props.detail))
  }, [props.energyModels, props.detail])

  if (props.mode === Mode.look) {
    return (
      <div style={{ padding: '0 15px' }}>
        <DetailItem2 label={utils.intl("能量单元类型")}>
          {props.energyUnitTypes.find((item) => item.value == props.detail?.energyUnitType?.id)?.name}
        </DetailItem2>
        {
          props.energyModels.map(model => {
            return (
              <TypeManagerLook
                key={model.name}
                model={model}
                detail={props.detail}
              />
            )
          })
        }
      </div>
    )
  }

  let value = null
  let match = props.energyUnitStatusOptions.find(o => o.code === 2)
  if (match) {
    value = match.value
  }


  const isExit_Generate = energyUnitTypeName_Generate.indexOf(props.detail.energyUnitType?.name) > -1
  const isExit_Cost = energyUnitTypeName_Cost.indexOf(props.detail.energyUnitType?.name) > -1

  let showStatus = true;
  if (props.energyUnitTypes.find(item => item.englishName === 'Load')?.value === props.energyType) {
    showStatus = false
  }
  return (
    <FullContainer>
      {/* <CrumbsPortal pageName='stationUpdate'>
        {props.mode == Mode.update && <Button style={{ marginLeft: '16px' }} onClick={props.cancelUpdate}>{utils.intl("取消")}</Button>}
        <Button type="primary" style={{ marginLeft: '16px' }} 
        loading={props.loading}
          onClick={onSave}
        >
          {utils.intl("保存")}
        </Button>
      </CrumbsPortal> */}
      <div className="energyUnit flex1" style={{ overflowY: 'auto' }}>
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
            <TabPriceNew 
            stationId={props.stationId} 
            energyUnitInfo={props.detail} 
            modalType={modalType} 
            onCancel={priceCancel}
            />
          </Modal>
        }
        <FormContainer
          form={form}
          initialValues={{
            debug: [props.detail?.debug + ''],
          }}
          className="flex-wrap"
        >
          <BorderHeader title={utils.intl('基本信息')}>
            <div style={{ position: 'absolute', right: 16, top: 20 }}>
              <Button
                type="primary"
                style={{ fontSize: 12 }}
                loading={props.loading}
                onClick={onSave}
                size="small"
              >
                {utils.intl('保存')}
              </Button>
              {props.mode == Mode.update && <Button size="small" style={{ marginLeft: 8, fontSize: 12 }} onClick={props.cancelUpdate}>{utils.intl('取消')}</Button>}
            </div>
            <SelectItem
              label={utils.intl("能量单元类型")}
              dataSource={props.energyUnitTypes}
              value={props.energyType}
              disabled={true}
            />
            {
              __temporaryEnergyModelLogic(props.energyModels, props.detail).map(model => {
                const title = model.title
                const name = model.name
                const disabled = getBool(model.disabled)
                const required = getBool(model.mustFill)
                const value = values[name]

                // if (title == utils.intl('计划投产时间')) {
                //   return (
                //     <DateType
                //       label={utils.intl("计划投产时间")}
                //       showNow={false}
                //       required={required}
                //       disabled={disabled}
                //       value={value || null}
                //       format={model.timeAccuracy?.name}
                //       onChange={v => handleValues({ [name]: v })}
                //       disabledDate={current => isSmallThanToday(current, props.timeZone)}
                //       disabledTime={disabledTime}
                //     />
                //   )
                // }

                return (
                  <TypeManager
                    key={model.name}
                    model={model}
                    values={values}
                    onChange={handleValues}
                    provinceOptions={props.provinceOptions}
                    cityOptions={props.cityOptions}
                    districtOptions={props.districtOptions}
                    onProvinceChange={(provinceId) => props.action('fetchCityOptions', { parentId: provinceId })}
                    onCityChange={(cityId) => props.action('fetchDistrictOptions', { parentId: cityId })}
                    toMapSelect={props.toMapSelect}
                  />
                )
              })
            }
          </BorderHeader>
          {showStatus &&
            <BorderHeader title={utils.intl('状态信息')} btnsStyle={{ marginLeft: 8 }} style={{ marginTop: '16px' }}>
              {props.mode !== Mode.add ?
                <>
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
                    <span style={{ color: props.theme === 'dark-theme' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(5, 10, 25, 0.45)', marginLeft: 24 }}>
                      {utils.intl("开始时间")}：
                      <span>{props.detail?.debugStartTime}</span>
                    </span>
                  </DetailItem2>
                </>
                :
                <>
                  <SelectItem
                    label={utils.intl("能量单元状态")}
                    disabled={true}
                    rules={[{ required: true }]}
                    dataSource={props.energyUnitStatusOptions}
                    value={value}
                    name={'energyUnitStatus'}
                  />
                  <DateItem
                    label={utils.intl("计划投产时间")}
                    rules={[{ required: true }]}
                    disabled={false}
                    name={'plannedProductionTime'}
                    value={values.plannedProductionTime ? moment(values.plannedProductionTime) : undefined}
                    showTime={{ format: 'HH:mm' }}
                    onChange={v => handleValues({ ['plannedProductionTime']: v })}
                    disabledDate={current => isSmallThanToday(current, props.timeZone)}
                    disabledTime={disabledTime}
                    format={'YYYY-MM-DD HH:mm'}
                  />
                  <DateItem
                    label={utils.intl("实际投产时间")}
                    disabled={true}
                    value={props.detail?.productionTime ? moment(props.detail?.productionTime) : undefined}
                    showTime={{ format: 'HH:mm' }}
                  />
                  <Form.Item name="debug" label={utils.intl('调试标志')} style={{ marginLeft: 15 }}>
                    <Checkbox.Group value={[props.detail?.debug + '']}>
                      <Checkbox value={'true'}></Checkbox>
                    </Checkbox.Group>
                  </Form.Item>
                </>
              }
            </BorderHeader>
          }
          {props.mode === Mode.update &&
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
              {/* <div style={{ width: 315, marginRight: 5 }}>
                <label className={'priceLabel'}>{utils.intl("购电电价")}：</label>
                <div className={'priceDiv'}>
                  <span>南澳地区</span>
                  <span>一级客户售电套餐 <WankeCircleRightOutlined style={{ float: 'right', marginTop: 3 }} /></span>
                </div>
              </div>
              <div style={{ width: 315, marginRight: 5 }}>
                <label className={'priceLabel'}>{utils.intl("售电电价")}：</label>
                <div className={'priceDiv'}>
                  <span>南澳地区</span>
                  <span>一级客户售电套餐 <WankeCircleRightOutlined style={{ float: 'right', marginTop: 3 }} /></span>
                </div>
              </div> */}
            </BorderHeader>
          }
        </FormContainer>
      </div>
    </FullContainer>
  )
}

export default PropertyEnergyUnit
