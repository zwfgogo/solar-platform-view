import React, { useEffect, useState, useRef } from 'react'
import { Button, Checkbox, DateItem, Form, Modal, Popconfirm, Select } from 'wanke-gui'
import { FormContainer } from '../../../components/input-item/InputItem'
import SelectItem from '../../../components/input-item/SelectItem'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { ValueName } from '../../../interfaces/CommonInterface'
import { Mode, stationUpdateNS } from '../../constants'
import { __temporaryStationModelLogic, getFormatDateStr, handleModelAreaValues, handleModelValue, identity } from '../station.helper'
import TypeManager, { Model } from './input-type/TypeManager'
import utils from '../../../public/js/utils'
import { makeConnect } from '../../umi.helper'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { EnergyUnitState } from '../models/station-update'
import './styles/tab-basic.less'
import BorderHeader from '../../../components/BorderHeader'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import { PlusCircleOutlined, PlusOutlined, WankeCircleRightOutlined } from 'wanke-icon'
import DetailItem2 from '../../../components/layout/DetailItem2'
import CommissioningRecord from './CommissioningRecord'
import moment, { Moment } from 'moment'
import { isSmallThanToday, getTargetSystemTime } from '../../../util/dateUtil'
import { range0 } from '../../page.helper'
import TabPriceNew from './TabPriceNew'
import PriceLook from './PriceLook'

//电站基本信息页签编辑
interface Props extends ActionProp {
  mode: Mode
  stationId: number
  stationModels: Model[]
  detail: any
  stationType: number
  stationTypeOption: ValueName[]
  provinceOptions: ValueName[]
  cityOptions: ValueName[]
  districtOptions: ValueName[]
  scenariosList: any[]
  toMapSelect: (latitude, longitude, onSuccess: ({ lat, lng }) => void) => void
  fetchStationTypes: () => void
  parentPageNeedUpdate: (type?, data?) => void
  saveLoading: boolean
  updateStationSuccess: boolean
  treeLoading: boolean
  onCancelEdit: any
  stationStatusOptions: any
  operatorList: any
  timeZone: string
  getDeviceDebugLoading: boolean
  debugLogs: any[]
}
interface Props extends EnergyUnitState, PageProps, MakeConnectProps<EnergyUnitState> {
  treeList: any
  newEnergyUnitTypeId: number
}
// interface AddInfoType {
//   objectType?: string
//   energyUnitType?: number
//   energyUnitId?: number
//   addType?: number
//   // 手动、sn码
//   sn?: string
//   deviceTypeId?: number
//   deviceCount?: number
// }

const TabBasic: React.FC<Props> = function (this: null, props) {
  const [havePrice, setHavePrice] = useState(props.detail?.costPrice && props.detail?.costPrice.length && props.detail?.generationPrice && props.detail?.generationPrice.length)
  const [values, setValues] = useState({})
  const [scenariosModels, setScenariosModels] = useState(props.scenariosList)
  const [scenariosOptions, setScenariosOptions] = useState(props.scenariosList)
  const [scenarios, setScenarios] = useState(props.detail.scenariosList && props.detail.scenariosList.length ?
    props.detail.scenariosList.map(item => item.id)
    : [])
  const [commissioningRecordModal, setCommissioningRecordModal] = useState(false)
  const [operatorValue, setOperatorValue] = useState('')
  const [pricePage, setPricePage] = useState(false)
  const [modalType, setModalType] = useState(null)

  useEffect(() => {
    setScenariosModels(props.scenariosList)
    setScenariosOptions(props.scenariosList.map(item => ({ value: item.id, name: item.title })))
  }, [props.scenariosList]);

  useEffect(() => {
    setScenarios(props.detail.scenariosList && props.detail.scenariosList.length ?
      props.detail.scenariosList.map(item => item.id)
      : [])
  }, [props.detail.scenariosList])


  const handleSubmit = () => {
    form.validateFields().then(val => {
      let values1: Record<string, any> = {};
      let properties: Record<string, any> = {};
      let info = props.stationModels.map(item => {
        const type = item.dataType?.name;
        const name = item.name;
        const timeAccuracy = item.timeAccuracy?.name;
        if (item.type === 4) {
          if (type == 'date') {
            properties[name] = getFormatDateStr(values[name], timeAccuracy);
          } else if (type == 'enum') {
            properties[name] = item.enumValues.find(option => option.name == values[name]);
          } else if (type == 'area') {
            properties.province = { id: values[name].provinceId };
            properties.city = { id: values[name].cityId };
            properties.district = { id: values[name].districtId };
          } else if (type == 'bool') {
            properties[name] = values[name] === 1;
          } else {
            properties[name] = values[name];
          }
        } else {
          if (type == 'date') {
            values1[name] = getFormatDateStr(values[name], timeAccuracy)
          } else if (type == 'enum') {
            values1[name] = item.enumValues.find(option => option.name == values[name])
          } else if (type == 'area') {
            values1.province = { id: values[name].provinceId }
            values1.city = { id: values[name].cityId }
            values1.district = { id: values[name].districtId }
          } else if (type == 'bool') {
            values1[name] = values[name] == 1
          } else {
            values1[name] = values[name]
          }
        }
      });

      const updateStationFn = (scenariosModels) => {
        if (!props.stationId) {
          props.parentPageNeedUpdate('addStation');
          props.action('addStation', {
            stationTypeId: props.stationType,
            ...values1,
            properties: properties,
            scenariosList: val.scenariosList && val.scenariosList.length ? scenariosModels.filter(item => val.scenariosList.indexOf(item.id) > -1) : [],
            stationStatus: { id: val.stationStatus },
            operator: { id: operatorValue },
            debug: val.debug?.length && val.debug[0] === 'true' ? true : false,
          });
        } else {
          props.parentPageNeedUpdate('updateStation');
          props.action('updateStation', {
            ...props.detail,
            ...values1,
            stationId: props.stationId,
            stationType: { id: props.stationType },
            properties: properties,
            scenariosList: val.scenariosList && val.scenariosList.length ? scenariosModels.filter(item => val.scenariosList.indexOf(item.id) > -1) : [],
          });
        }
      }

      if (values1.coordinate?.length) {
        // 经纬度处理
        const geoc = new BMap.Geocoder();
        geoc.getLocation(new BMap.Point(values1.coordinate[0], values1.coordinate[1]), (rs) => {
          var addComp = rs.addressComponents;
          const address = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
          values1.address = address;
          updateStationFn(scenariosModels);
        });
      } else {
        updateStationFn(scenariosModels);
      }
    });
  }

  const handleStationModelValues = (models: Model[], detail) => {
    let values = {};
    models.forEach(model => {
      const type = model.type;
      let dataType = model.dataType?.name;
      const name = model.name;
      if (type == 4) {
        values[name] = handleModelValue(model, detail?.properties?.[name]);
      } else if (dataType == 'area') {
        values[name] = handleModelAreaValues(detail);
      } else {
        values[name] = handleModelValue(model, detail[name]);
      }
    })
    return values;
  }

  const [form] = Form.useForm();

  const [form1] = Form.useForm();

  useEffect(() => {
    if (props.mode !== Mode.add) {
      props.fetchStationTypes()
    }
    // props.action('fetchProvinceOptions')
    // props.action('fetchEnergyUnitTree', { stationId: props.stationId })
  }, []);

  useEffect(() => {
    if (props.stationType) {
      props.action('fetchStationModel', { modelTypeId: props.stationType, modId: props.mode == Mode.add ? null : props.stationId })
    }
  }, [props.stationType]);

  useEffect(() => {
    if (props.stationId) {
      // setCurrentMode(Mode.look)
      props.action('fetchStationBasicInfo', { stationId: props.stationId })
    } else {
      // setCurrentMode(Mode.add)
    }
  }, [props.stationId]);

  // useEffect(() => {
  //   if (props.updateStationSuccess) {
  //     // setCurrentMode(Mode.look)
  //     props.action('fetchStationBasicInfo', { stationId: props.stationId })
  //   }
  // }, [props.updateStationSuccess]);

  useEffect(() => {
    setValues(handleStationModelValues(props.stationModels, props.detail))
  }, [props.stationModels]);

  useEffect(() => {
    setValues(handleStationModelValues(props.stationModels, props.detail))
  }, [props.detail]);

  const operatorChange = (o) => {
    setOperatorValue(o)
  }

  const addPrice = (type: "cost" | "generation") => {
    setPricePage(true)
    setModalType(type)
  }

  const priceCancel = () => {
    setPricePage(false)
    props.action('getPrice', { stationId: props.stationId, isFuture: false, modalType: 'all' }) // 获取当前电价
  }


  let haveZoneOrCurrency = props.stationModels.find(item => item.name == 'currency') != undefined && props.stationModels.find(item => item.name == 'timeZone') != undefined

  let value = null
  let match = props.stationStatusOptions.find(o => o.code === 2)
  if (match) {
    value = match.value
  }
  let isOperator: any = JSON.parse(sessionStorage.getItem('userInfo')).firm.firmType.name === 'Operator';

  return (
    <div className="basic-page">
      {commissioningRecordModal &&
        <CommissioningRecord
          cancel={() => { setCommissioningRecordModal(false) }}
          visible={commissioningRecordModal}
          action={props.action}
          deviceId={props?.detail?.id}
          debugLogs={props.debugLogs}
          getDeviceDebugLoading={props.getDeviceDebugLoading}
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
      {props.mode === Mode.add && <CrumbsPortal pageName='stationUpdate'>
        {/* <Button onClick={props.onCancelEdit} style={{ marginLeft: '8px' }}>
          {utils.intl("取消")}
        </Button> */}
        {(!props.stationId && haveZoneOrCurrency) ? (
          <Popconfirm
            title={`${utils.intl('保存后，所处时区与结算货币不可更改')}?`}
            onConfirm={handleSubmit}
            okText={utils.intl('确认')}
            cancelText={utils.intl('取消')}
          >
            <Button type="primary" style={{ marginLeft: '16px' }} loading={props.saveLoading}>
              {utils.intl("保存")}
            </Button>
          </Popconfirm>
        ) : (
          <Button type="primary" style={{ marginLeft: '16px' }} onClick={handleSubmit} loading={props.saveLoading}>
            {utils.intl("保存")}
          </Button>
        )}
      </CrumbsPortal>}
      <FormContainer initialValues={{
        debug: ['false'],
      }} form={form} className="flex-wrap" style={{ maxWidth: 1500 }}>
        {!isOperator ?
          props.mode !== Mode.add ?
            <DetailItem2 labelStyle={{ width: 'auto' }} style={{ minHeight: 0 }} label={utils.intl("电站运营商")}>{props.detail.operator?.title}</DetailItem2>
            :
            <Select
              label={utils.intl("电站运营商") + '：'}
              dataSource={props.operatorList}
              value={operatorValue}
              style={{ minWidth: 205 }}
              onSelect={operatorChange}
            />
          : (
            <DetailItem2
              labelStyle={{ width: 'auto' }}
              style={{ minHeight: 0 }}
              label={utils.intl("电站运营商")}
            >{props.detail.operator?.title}</DetailItem2>
          )
        }
        <BorderHeader title={utils.intl('基本信息')} style={{ marginTop: '15px' }}>
          {props.mode !== Mode.add &&
            <div style={{ position: 'absolute', right: 16, top: 20 }}>
              <Button size="small" type="primary" style={{ fontSize: 12 }} onClick={handleSubmit} loading={props.saveLoading}>
                {utils.intl("保存")}
              </Button>
              <Button onClick={props.onCancelEdit} size="small" style={{ marginLeft: 8, fontSize: 12 }}>
                {utils.intl("取消")}
              </Button>
            </div>
          }
          <SelectItem
            label={utils.intl("电站类型")}
            disabled={props.mode !== Mode.add && props.mode !== Mode.update ? false : true}
            name="stationType"
            rules={[{ required: true }]}
            dataSource={props.stationTypeOption}
            value={props.stationType}
          />
          {
            __temporaryStationModelLogic(props.stationModels, props.stationId ? Mode.update : Mode.add).map(model => {
              if (model.name === 'scenariosList') {
                return (
                  <SelectItem
                    label={utils.intl("应用场景")}
                    rules={[{ required: true }]}
                    mode="multiple"
                    checkAllText={utils.intl("全选")}
                    name="scenariosList"
                    placeholder={utils.intl('请选择应用场景')}
                    dataSource={scenariosOptions}
                    value={scenarios}
                    onChange={value => setScenarios(value)}
                  />
                )
              } else {
                return (
                  <TypeManager
                    key={model.name}
                    model={model}
                    values={values}
                    onChange={setValues}
                    provinceOptions={props.provinceOptions}
                    cityOptions={props.cityOptions}
                    districtOptions={props.districtOptions}
                    onProvinceChange={(provinceId) => props.action('fetchCityOptions', { parentId: provinceId })}
                    onCityChange={(cityId) => props.action('fetchDistrictOptions', { parentId: cityId })}
                    toMapSelect={props.toMapSelect}
                  />
                )
              }
            })
          }

        </BorderHeader>
        <BorderHeader title={utils.intl('状态信息')} btnsStyle={{ marginLeft: 8 }} style={{ marginTop: '16px' }}>
          {props.mode !== Mode.add ?
            <>
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
              <SelectItem
                label={utils.intl("电站状态")}
                disabled={true}
                rules={[{ required: true }]}
                dataSource={props.stationStatusOptions}
                value={value}
                name={'stationStatus'}
              />
              <DateItem
                label={utils.intl("投产时间")}
                disabled={true}
                name={'productionTime'}
                value={props.detail?.productionTime ? moment(props.detail?.productionTime) : undefined}
                showTime={{ format: 'HH:mm' }}
                format={'YYYY-MM-DD HH:mm'}
              />
              <Form.Item name="debug" label={utils.intl("调试标志")} style={{ marginLeft: 15 }}>
                <Checkbox.Group value={[props.detail?.debug + '']}>
                  <Checkbox value={'true'}></Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </>
          }
        </BorderHeader>
      </FormContainer>
      {
        props.mode !== Mode.add &&
        <BorderHeader title={utils.intl('电价信息')} style={{ marginTop: '16px' }}>
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
      }
    </div >
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    treeLoading: getLoading('fetchEnergyUnitTree'),
  }
}

export default makeConnect(stationUpdateNS, mapStateToProps)(TabBasic)